import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import { Maximize, Minus, Plus } from "lucide-react";

import { STATUS_LABELS, type LotStatus } from "@/lib/app/lot-fields";
import { formatPrice } from "@/lib/app/lot-format";
import { centroid, type Point } from "@/lib/geometry";
import type { PublicLot } from "@/lib/public/programme";
import { cn } from "@/lib/utils";
import { clampView, fitView, pinchView, zoomView, type View } from "@/lib/viewport";

/* Sales plan: lots coloured by status on the aerial view. Available lots use
   the promoter's colour, reserved ones are hatched, sold ones greyed out.
   Mouse: hover for details, click to open the lot. Finger: a tap opens the lot,
   two fingers zoom. Keyboard: Tab goes from lot to lot, Enter opens it. */

export type PlanImage = { large: string; small: string; width: number; height: number };

type Drag =
  | {
      kind: "press";
      pointerId: number;
      x: number;
      y: number;
      view: View;
      lotId: string | null;
      moved: boolean;
    }
  | { kind: "pinch"; distance: number; center: { x: number; y: number }; view: View };

const toAttr = (points: readonly Point[], w: number, h: number) =>
  points.map(([x, y]) => `${x * w},${y * h}`).join(" ");

/** "Disponible · 1 250 000 €", or just "Vendu". */
export function statusAndPrice(lot: PublicLot, currency: string) {
  return lot.statut === "vendue"
    ? STATUS_LABELS.vendue
    : `${STATUS_LABELS[lot.statut]} · ${priceLabel(lot, currency)}`;
}

export function priceLabel(lot: PublicLot, currency: string) {
  if (lot.statut === "vendue") return "Vendu";
  return lot.prix !== null ? formatPrice(lot.prix, currency) : "Prix sur demande";
}

export function PublicPlan({
  image,
  lots,
  shapes,
  currency,
  filter,
  onOpen,
}: {
  image: PlanImage;
  lots: PublicLot[];
  shapes: Map<string, Point[]>;
  currency: string;
  filter: LotStatus | null;
  onOpen: (lot: PublicLot, from: "plan" | "keyboard") => void;
}) {
  const { width: W, height: H } = image;
  const viewport = useRef<HTMLDivElement>(null);
  const drag = useRef<Drag | null>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const fitK = useRef(1);
  const [view, setView] = useState<View>({ k: 0, x: 0, y: 0 });
  const viewRef = useRef(view);
  viewRef.current = view;
  const fitted = useRef(true);
  const [hover, setHover] = useState<{ id: string; x: number; y: number } | null>(null);
  const [focused, setFocused] = useState<string | null>(null);
  const [largeReady, setLargeReady] = useState(false);

  const zoomed = view.k > fitK.current * 1.02;

  const fit = useCallback(() => {
    const el = viewport.current;
    if (!el) return;
    const next = fitView(el.clientWidth, el.clientHeight, W, H, 1);
    fitK.current = next.k;
    fitted.current = true;
    setView(next);
  }, [W, H]);

  useEffect(() => {
    const el = viewport.current;
    if (!el) return;
    fit();
    // A new size (rotated phone, resized window) shows the whole plan again.
    const observer = new ResizeObserver(() => fit());
    observer.observe(el);
    return () => observer.disconnect();
  }, [fit]);

  /** Never smaller than the whole plan, never panned out of it. */
  const settle = useCallback(
    (next: View): View => {
      const el = viewport.current;
      if (!el) return next;
      if (next.k <= fitK.current * 1.001) {
        fitted.current = true;
        return fitView(el.clientWidth, el.clientHeight, W, H, 1);
      }
      fitted.current = false;
      return clampView(next, el.clientWidth, el.clientHeight, W, H);
    },
    [W, H],
  );

  const zoomAt = useCallback(
    (px: number, py: number, factor: number) =>
      setView((v) => settle(zoomView(v, px, py, factor, fitK.current, fitK.current * 8))),
    [settle],
  );

  const zoomCenter = (factor: number) => {
    const el = viewport.current;
    if (el) zoomAt(el.clientWidth / 2, el.clientHeight / 2, factor);
  };

  // Trackpad pinch (ctrl + wheel) zooms; the plain wheel keeps scrolling the page.
  useEffect(() => {
    const el = viewport.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey) return;
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      zoomAt(e.clientX - rect.left, e.clientY - rect.top, Math.exp(-e.deltaY * 0.01));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoomAt]);

  const lotAt = (target: EventTarget | null) =>
    (target as Element | null)?.closest<SVGElement>("[data-lot]")?.dataset["lot"] ?? null;

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()] as [
        { x: number; y: number },
        { x: number; y: number },
      ];
      drag.current = {
        kind: "pinch",
        distance: Math.hypot(a.x - b.x, a.y - b.y),
        center: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
        view: viewRef.current,
      };
      return;
    }
    drag.current = {
      kind: "press",
      pointerId: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      view: viewRef.current,
      lotId: lotAt(e.target),
      moved: false,
    };
    // Dragging only moves a zoomed plan; otherwise the page scrolls as usual.
    if (zoomed) {
      try {
        viewport.current?.setPointerCapture(e.pointerId);
      } catch {
        /* pointer already gone */
      }
    }
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (pointers.current.has(e.pointerId))
      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const d = drag.current;
    const rect = viewport.current?.getBoundingClientRect();
    if (!rect) return;
    if (d?.kind === "pinch" && pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()] as [
        { x: number; y: number },
        { x: number; y: number },
      ];
      setView(
        settle(
          pinchView(
            d.view,
            { x: d.center.x - rect.left, y: d.center.y - rect.top },
            d.distance,
            { x: (a.x + b.x) / 2 - rect.left, y: (a.y + b.y) / 2 - rect.top },
            Math.hypot(a.x - b.x, a.y - b.y),
            fitK.current,
            fitK.current * 8,
          ),
        ),
      );
      return;
    }
    if (d?.kind === "press") {
      if (Math.hypot(e.clientX - d.x, e.clientY - d.y) > 6) d.moved = true;
      if (d.moved && zoomed) {
        setView(
          settle({ ...d.view, x: d.view.x + e.clientX - d.x, y: d.view.y + e.clientY - d.y }),
        );
      }
    }
    if (e.pointerType === "mouse") {
      const id = lotAt(e.target);
      setHover(id ? { id, x: e.clientX - rect.left, y: e.clientY - rect.top } : null);
    }
  };

  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    pointers.current.delete(e.pointerId);
    const d = drag.current;
    if (d?.kind === "pinch") {
      if (pointers.current.size === 0) drag.current = null;
      return;
    }
    drag.current = null;
    if (d?.kind === "press" && !d.moved && d.lotId) {
      const lot = lots.find((l) => l.id === d.lotId);
      if (lot) onOpen(lot, "plan");
    }
  };

  const onKeyDown = (e: KeyboardEvent<SVGGElement>, lot: PublicLot) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onOpen(lot, "keyboard");
    }
  };

  const k = view.k || 1;
  const tipLot = hover
    ? lots.find((l) => l.id === hover.id)
    : focused
      ? lots.find((l) => l.id === focused)
      : null;
  let tip: { x: number; y: number } | null = hover;
  if (!hover && tipLot) {
    const points = shapes.get(tipLot.id);
    if (points) {
      const [cx, cy] = centroid(points);
      tip = { x: view.x + cx * W * k, y: view.y + cy * H * k };
    }
  }

  return (
    <div className="space-y-3">
      <div
        ref={viewport}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={(e) => {
          // The browser took over (page scroll): no lot opens.
          pointers.current.delete(e.pointerId);
          drag.current = null;
        }}
        onPointerLeave={() => setHover(null)}
        className={cn(
          "relative max-h-[78svh] w-full select-none overflow-hidden rounded-2xl border border-white/10 bg-black",
          zoomed ? "cursor-grab touch-none" : "touch-pan-y",
        )}
        style={{ aspectRatio: `${W} / ${H}` }}
      >
        <div
          className="absolute left-0 top-0 origin-top-left"
          style={{
            width: W,
            height: H,
            transform: `translate(${view.x}px, ${view.y}px) scale(${k})`,
          }}
        >
          <img
            src={image.small}
            alt=""
            width={W}
            height={H}
            draggable={false}
            className="pointer-events-none absolute inset-0 h-full w-full"
          />
          <img
            src={image.large}
            alt=""
            width={W}
            height={H}
            draggable={false}
            loading="lazy"
            onLoad={() => setLargeReady(true)}
            className={cn(
              "pointer-events-none absolute inset-0 h-full w-full transition-opacity duration-700 motion-reduce:transition-none",
              largeReady ? "opacity-100" : "opacity-0",
            )}
          />
          <svg
            viewBox={`0 0 ${W} ${H}`}
            width={W}
            height={H}
            className="absolute inset-0 overflow-visible"
            role="group"
            aria-label="Plan de vente"
          >
            <defs>
              <pattern
                id="lot-hatch"
                width={10 / k}
                height={10 / k}
                patternUnits="userSpaceOnUse"
                patternTransform="rotate(45)"
              >
                <rect width={10 / k} height={10 / k} fill="rgba(251,191,36,0.16)" />
                <line
                  x1={0}
                  y1={0}
                  x2={0}
                  y2={10 / k}
                  stroke="rgba(251,191,36,0.85)"
                  strokeWidth={4 / k}
                />
              </pattern>
            </defs>
            {lots.map((lot) => {
              const points = shapes.get(lot.id);
              if (!points) return null;
              const [cx, cy] = centroid(points);
              const dimmed = filter !== null && lot.statut !== filter;
              const active = hover?.id === lot.id || focused === lot.id;
              const label = `Lot ${lot.numero}${lot.type ? `, ${lot.type}` : ""}, ${statusAndPrice(lot, currency).replace(" · ", ", ")}`;
              return (
                <g
                  key={lot.id}
                  data-lot={lot.id}
                  role="button"
                  tabIndex={0}
                  aria-label={label}
                  onKeyDown={(e) => onKeyDown(e, lot)}
                  onFocus={() => setFocused(lot.id)}
                  onBlur={() => setFocused((f) => (f === lot.id ? null : f))}
                  className="cursor-pointer outline-none transition-opacity duration-300 motion-reduce:transition-none"
                  style={{ opacity: dimmed ? 0.18 : 1 }}
                >
                  <polygon
                    points={toAttr(points, W, H)}
                    vectorEffect="non-scaling-stroke"
                    strokeWidth={active ? 3 : 1.5}
                    style={
                      lot.statut === "disponible"
                        ? {
                            fill: "var(--brand)",
                            fillOpacity: active ? 0.55 : 0.36,
                            stroke: active ? "#fff" : "var(--brand)",
                          }
                        : lot.statut === "reservee"
                          ? {
                              fill: "url(#lot-hatch)",
                              stroke: active ? "#fff" : "rgba(251,191,36,0.9)",
                            }
                          : {
                              fill: "rgba(82,82,91,0.72)",
                              stroke: active ? "#fff" : "rgba(161,161,170,0.7)",
                            }
                    }
                  />
                  <text
                    x={cx * W}
                    y={cy * H}
                    fontSize={13 / k}
                    fontWeight={600}
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="pointer-events-none select-none fill-white"
                    stroke="rgba(0,0,0,0.7)"
                    strokeWidth={3 / k}
                    paintOrder="stroke"
                  >
                    {lot.numero}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {tipLot && tip ? (
          <div
            className={cn(
              "pointer-events-none absolute z-10 w-max max-w-56 -translate-x-1/2 rounded-xl border border-white/10 bg-black/85 px-3 py-2 text-xs text-white shadow-xl backdrop-blur",
              // Below the lot when it is close to the top edge.
              tip.y < 90 ? "translate-y-4" : "-translate-y-[calc(100%+12px)]",
            )}
            style={{ left: tip.x, top: tip.y }}
            aria-hidden
          >
            <p className="font-semibold">
              Lot {tipLot.numero}
              {tipLot.type ? ` · ${tipLot.type}` : ""}
            </p>
            <p className="mt-0.5 text-white/70">{statusAndPrice(tipLot, currency)}</p>
          </div>
        ) : null}
      </div>

      <div className="flex items-start justify-between gap-4">
        <ul
          className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-2 text-xs text-white/70"
          aria-label="Légende du plan"
        >
          <li className="flex items-center gap-2">
            <span
              className="size-3 rounded-sm border"
              style={{
                background: "color-mix(in srgb, var(--brand) 45%, transparent)",
                borderColor: "var(--brand)",
              }}
              aria-hidden
            />
            Disponible
          </li>
          <li className="flex items-center gap-2">
            <span
              className="size-3 rounded-sm border border-amber-400/90"
              style={{
                background:
                  "repeating-linear-gradient(45deg, rgba(251,191,36,0.85) 0 2px, rgba(251,191,36,0.15) 2px 5px)",
              }}
              aria-hidden
            />
            Réservé
          </li>
          <li className="flex items-center gap-2">
            <span
              className="size-3 rounded-sm border border-zinc-400/70 bg-zinc-600/70"
              aria-hidden
            />
            Vendu
          </li>
          <li className="hidden text-white/45 sm:block">Survolez un lot, cliquez pour sa fiche</li>
          <li className="text-white/45 sm:hidden">
            Touchez un lot pour sa fiche · deux doigts pour zoomer
          </li>
        </ul>
        <div className="flex shrink-0 items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] p-1">
          <button
            type="button"
            onClick={() => zoomCenter(0.75)}
            aria-label="Dézoomer le plan"
            className="grid size-9 place-items-center rounded-full text-white/80 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          >
            <Minus className="size-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => zoomCenter(1.35)}
            aria-label="Zoomer sur le plan"
            className="grid size-9 place-items-center rounded-full text-white/80 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          >
            <Plus className="size-4" aria-hidden />
          </button>
          {zoomed ? (
            <button
              type="button"
              onClick={fit}
              aria-label="Voir tout le plan"
              className="grid size-9 place-items-center rounded-full text-white/80 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            >
              <Maximize className="size-4" aria-hidden />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
