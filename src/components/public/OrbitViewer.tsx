import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";

import { smallFramePath } from "@/lib/app/orbit";
import { publicUrl } from "@/lib/app/storage";
import type { LotStatus } from "@/lib/app/lot-fields";
import { loadLabels, type LabelData } from "@/lib/orbit-loader";
import { labelCenters, paintLabels, rgbOf, type LabelCenter, type Paint } from "@/lib/orbit-mask";
import type { PublicLot, PublicOrbit } from "@/lib/public/programme";
import { loadingOrder, nearestLoaded, useOrbitFrames } from "@/lib/use-orbit-frames";
import { cn } from "@/lib/utils";
import { StatusLegend, statusAndPrice } from "./status";

/* Orbital view of the public pages (one per view of the programme: aerial
   view, roof, floor, pedestrian view…): the sequence turned by dragging (with
   a little inertia), the arrow keys, or a slow half turn on opening; the lots
   painted in the colour of their status on every image, from the label maps
   of the masks, with their number written on them; the lot under the
   pointer lit up, a click opens its sheet. The 1 280 px images turn; on
   large screens the 2 048 px one replaces the image shown once it stops. */

const AMBER = [251, 191, 36] as const;
const SOLD = [70, 70, 78] as const;

type Drag = { x: number; t: number; moved: boolean; pointerId: number };

function hexRgb(hex: string): [number, number, number] {
  const n = rgbOf(hex);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

type LabelView = LabelData & { centers: (LabelCenter | null)[] };

/** Label maps of the masks (and where each lot's number goes), loaded in the same order as the images. */
function useOrbitLabels(urls: readonly string[], colors: readonly number[]) {
  const maps = useRef<(LabelView | null)[]>([]);
  const [ready, setReady] = useState(0);
  useEffect(() => {
    let live = true;
    let count = 0;
    maps.current = urls.map(() => null);
    setReady(0);
    const queue = loadingOrder(urls.length);
    const next = async () => {
      for (let i = queue.shift(); i !== undefined && live; i = queue.shift()) {
        try {
          const data = await loadLabels(urls[i] as string, colors);
          if (!live) return;
          // Slivers of a lot (behind another one) get no number.
          const centers = labelCenters(
            data.labels,
            data.width,
            colors.length,
            data.labels.length * 0.0008,
          );
          maps.current[i] = { ...data, centers };
          setReady(++count);
        } catch {
          /* a missing mask: that view simply has no colours */
        }
      }
    };
    for (let k = 0; k < 3; k++) void next();
    return () => {
      live = false;
    };
  }, [urls, colors]);
  return { maps, ready };
}

/** The 2 048 px image of the one shown, fetched once the rotation stops (large screens). */
function useSharpFrame(urls: readonly string[] | null, index: number, moving: boolean) {
  const sharp = useRef(new Map<number, HTMLImageElement>());
  const [loaded, setLoaded] = useState(0);
  useEffect(() => {
    sharp.current = new Map();
  }, [urls]);
  useEffect(() => {
    if (!urls || moving || sharp.current.has(index)) return;
    let live = true;
    const timer = window.setTimeout(() => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.decoding = "async";
      img.onload = () => {
        if (!live) return;
        sharp.current.set(index, img);
        setLoaded((n) => n + 1);
      };
      img.src = urls[index] as string;
    }, 150);
    return () => {
      live = false;
      window.clearTimeout(timer);
    };
  }, [urls, index, moving]);
  return { sharp, loaded };
}

export function OrbitViewer({
  orbit,
  viewName,
  lots,
  currency,
  brandColor,
  filter,
  highlight,
  selected = null,
  variant = "page",
  resetKey = 0,
  onOpen,
}: {
  orbit: PublicOrbit;
  /** Name of the view (aerial view, R+1…), for screen readers. */
  viewName: string;
  lots: PublicLot[];
  currency: string;
  brandColor: string;
  filter: LotStatus | null;
  highlight?: ReadonlySet<string>;
  selected?: string | null;
  variant?: "page" | "embed" | "presentation";
  resetKey?: number;
  onOpen: (lot: PublicLot, from: "plan" | "keyboard") => void;
}) {
  const large = variant === "presentation";
  const count = orbit.frames.length;
  const first = orbit.frames[0];

  // Large screens: the 2 048 px image of the one shown once it stops; phones never download them.
  const [big] = useState(
    () =>
      typeof window !== "undefined" && window.innerWidth * (window.devicePixelRatio || 1) > 1700,
  );
  // Keyed by content: reading the programme again (live update) must not reload the sequence.
  const frameKey = orbit.frames.map((f) => f.path).join("|");
  const maskKey = orbit.masks.map((m) => m.path).join("|");
  const colorKey = orbit.colors.map((c) => c.hex).join("|");
  const frameList = useMemo(
    () => frameKey.split("|").map((path) => publicUrl(smallFramePath(path))),
    [frameKey],
  );
  const largeList = useMemo(
    () => (big ? frameKey.split("|").map((path) => publicUrl(path)) : null),
    [frameKey, big],
  );
  const maskList = useMemo(() => maskKey.split("|").map((path) => publicUrl(path)), [maskKey]);
  const colorList = useMemo(() => colorKey.split("|").map((hex) => rgbOf(hex)), [colorKey]);
  const lotByLabel = useMemo(() => {
    const byId = new Map(lots.map((l) => [l.id, l]));
    return [null, ...orbit.colors.map((c) => byId.get(c.lotId) ?? null)];
  }, [orbit.colors, lots]);

  const { images, ready } = useOrbitFrames(frameList);
  const { maps, ready: labelsReady } = useOrbitLabels(maskList, colorList);

  const [index, setIndex] = useState(0);
  const [hover, setHover] = useState<{ label: number; x: number; y: number } | null>(null);
  const [moving, setMoving] = useState(false);
  const pos = useRef(0);
  const velocity = useRef(0);
  const frame = useRef(0);
  const drag = useRef<Drag | null>(null);
  const touched = useRef(false);
  const turned = useRef(false);
  const frameCanvas = useRef<HTMLCanvasElement>(null);
  const overlay = useRef<HTMLCanvasElement>(null);
  const pixels = useRef<ImageData | null>(null);
  const box = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const still = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );

  const goTo = useCallback(
    (p: number) => {
      pos.current = ((p % count) + count) % count;
      setIndex(Math.round(pos.current) % count);
    },
    [count],
  );
  const stopMotion = useCallback(() => {
    cancelAnimationFrame(frame.current);
    frame.current = 0;
    setMoving(false);
  }, []);
  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  // Presentation left idle: back to the first view.
  useEffect(() => {
    if (!resetKey) return;
    stopMotion();
    goTo(0);
  }, [resetKey, goTo, stopMotion]);

  // A slow half turn once the views are there, to show that the programme turns.
  useEffect(() => {
    if (still || touched.current || turned.current || ready < count || count === 0) return;
    turned.current = true;
    const start = performance.now();
    const from = pos.current;
    const duration = 5200;
    setMoving(true);
    const step = (now: number) => {
      if (touched.current) return;
      const t = Math.min(1, (now - start) / duration);
      const eased = 0.5 - Math.cos(Math.PI * t) / 2;
      goTo(from + eased * (count / 2));
      if (t < 1) frame.current = requestAnimationFrame(step);
      else setMoving(false);
    };
    frame.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame.current);
  }, [ready, count, still, goTo]);

  // The views keep the format of the sequence inside their box (presentation: any box).
  useEffect(() => {
    const el = box.current;
    if (!el || !first) return;
    const fit = () => {
      const ratio = first.width / first.height;
      const w = el.clientWidth;
      const h = el.clientHeight;
      setSize(w / h > ratio ? { w: h * ratio, h } : { w, h: w / ratio });
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(el);
    return () => observer.disconnect();
  }, [first]);

  const { sharp, loaded: sharpLoaded } = useSharpFrame(largeList, index, moving);

  // The view: drawn from the image decoded in advance, the sharp one when it has come.
  useEffect(() => {
    const canvas = frameCanvas.current;
    const shown = nearestLoaded(images.current, index);
    const img =
      (!moving && sharp.current.get(index)) || (shown >= 0 ? images.current[shown] : null);
    if (!canvas || !img) return;
    if (canvas.width !== img.naturalWidth) canvas.width = img.naturalWidth;
    if (canvas.height !== img.naturalHeight) canvas.height = img.naturalHeight;
    canvas.getContext("2d")?.drawImage(img, 0, 0);
  }, [index, ready, images, moving, sharp, sharpLoaded]);

  // The lots in the colour of their status, on the same view.
  const activeIds = useMemo(() => {
    const ids = new Set(highlight ?? []);
    if (selected) ids.add(selected);
    const hovered = hover ? lotByLabel[hover.label] : null;
    if (hovered) ids.add(hovered.id);
    return ids;
  }, [highlight, selected, hover, lotByLabel]);

  const paints = useMemo<(Paint | null)[]>(() => {
    const brand = hexRgb(brandColor);
    return lotByLabel.map((lot) => {
      if (!lot) return null;
      const dim = filter !== null && lot.statut !== filter ? 0.22 : 1;
      if (activeIds.has(lot.id)) return { rgba: [255, 255, 255, Math.round(150 * dim)] };
      if (lot.statut === "disponible") return { rgba: [...brand, Math.round(92 * dim)] };
      if (lot.statut === "reservee") return { rgba: [...AMBER, Math.round(210 * dim)], stripes: 5 };
      return { rgba: [...SOLD, Math.round(190 * dim)] };
    });
  }, [lotByLabel, brandColor, filter, activeIds]);

  useEffect(() => {
    const canvas = overlay.current;
    const shown = nearestLoaded(maps.current, index);
    const map = shown >= 0 ? maps.current[shown] : null;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    if (!map) {
      context.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }
    if (canvas.width !== map.width || canvas.height !== map.height) {
      canvas.width = map.width;
      canvas.height = map.height;
      pixels.current = null;
    }
    if (!pixels.current) pixels.current = context.createImageData(map.width, map.height);
    paintLabels(map.labels, map.width, paints, pixels.current.data);
    context.putImageData(pixels.current, 0, 0);
  }, [index, labelsReady, paints, maps]);

  const labelAt = (clientX: number, clientY: number): number => {
    const canvas = overlay.current;
    const map = maps.current[index];
    if (!canvas || !map) return 0;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(((clientX - rect.left) / rect.width) * map.width);
    const y = Math.floor(((clientY - rect.top) / rect.height) * map.height);
    if (x < 0 || y < 0 || x >= map.width || y >= map.height) return 0;
    return map.labels[y * map.width + x] ?? 0;
  };

  // One view for every 1/60 of the width: a short swipe turns the programme well.
  const stepPx = () => (size?.w ?? 600) / 60;

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    touched.current = true;
    stopMotion();
    velocity.current = 0;
    drag.current = { x: e.clientX, t: performance.now(), moved: false, pointerId: e.pointerId };
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (d && d.pointerId === e.pointerId) {
      const dx = e.clientX - d.x;
      if (!d.moved && Math.abs(dx) > 5) {
        d.moved = true;
        setMoving(true);
        setHover(null);
        try {
          e.currentTarget.setPointerCapture(e.pointerId);
        } catch {
          /* pointer already gone */
        }
      }
      if (d.moved) {
        const now = performance.now();
        const views = -dx / stepPx();
        goTo(pos.current + views);
        const dt = Math.max(1, now - d.t);
        velocity.current = 0.7 * velocity.current + 0.3 * (views / dt);
        d.x = e.clientX;
        d.t = now;
      }
      return;
    }
    if (e.pointerType !== "mouse" || moving) return;
    const label = labelAt(e.clientX, e.clientY);
    const rect = e.currentTarget.getBoundingClientRect();
    setHover(
      label && lotByLabel[label]
        ? { label, x: e.clientX - rect.left, y: e.clientY - rect.top }
        : null,
    );
  };

  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    if (!d.moved) {
      setMoving(false);
      const lot = lotByLabel[labelAt(e.clientX, e.clientY)];
      if (lot) onOpen(lot, "plan");
      return;
    }
    // A little inertia after a quick swipe.
    let v = velocity.current;
    if (still || Math.abs(v) < 0.004) {
      setMoving(false);
      return;
    }
    let last = performance.now();
    const glide = (now: number) => {
      const dt = now - last;
      last = now;
      goTo(pos.current + v * dt);
      v *= Math.pow(0.93, dt / 16);
      if (Math.abs(v) > 0.002) frame.current = requestAnimationFrame(glide);
      else {
        frame.current = 0;
        setMoving(false);
      }
    };
    frame.current = requestAnimationFrame(glide);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    touched.current = true;
    stopMotion();
    goTo(Math.round(pos.current) + (e.key === "ArrowRight" ? 1 : -1));
  };

  const tipLot = hover ? lotByLabel[hover.label] : null;
  const loading = ready < Math.min(6, count);

  // Numbers of the lots, where they are on the image shown.
  const shownMap = nearestLoaded(maps.current, index);
  const centers = shownMap >= 0 ? (maps.current[shownMap]?.centers ?? []) : [];
  const tags = size
    ? centers.flatMap((c, label) => {
        const lot = c ? lotByLabel[label] : null;
        return c && lot ? [{ lot, x: c.x * size.w, y: c.y * size.h }] : [];
      })
    : [];

  return (
    <div className={large ? "flex h-full min-h-0 flex-col gap-3" : "space-y-3"}>
      <div
        ref={box}
        className={cn(
          "relative grid w-full place-items-center overflow-hidden rounded-2xl border border-white/10 bg-black",
          variant === "page" && "max-h-[78svh]",
          large && "min-h-0 flex-1",
        )}
        style={large || !first ? undefined : { aspectRatio: `${first.width} / ${first.height}` }}
      >
        <div
          role="group"
          tabIndex={0}
          aria-roledescription="vue 3D"
          aria-label={`${viewName}, image ${index + 1} sur ${count}. Flèches gauche et droite pour tourner.`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={() => {
            drag.current = null;
            setMoving(false);
          }}
          onPointerLeave={() => setHover(null)}
          onKeyDown={onKeyDown}
          className={cn(
            "relative select-none outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/60",
            moving ? "cursor-grabbing" : tipLot ? "cursor-pointer" : "cursor-grab",
            // Vertical swipes keep scrolling the page; nothing to scroll in presentation.
            large ? "touch-none" : "touch-pan-y",
          )}
          style={size ? { width: size.w, height: size.h } : { width: "100%", height: "100%" }}
        >
          <canvas
            ref={frameCanvas}
            aria-hidden
            className="pointer-events-none absolute inset-0 h-full w-full"
          />
          <canvas
            ref={overlay}
            aria-hidden
            className="pointer-events-none absolute inset-0 h-full w-full"
          />
          {tags.map(({ lot, x, y }) => (
            <span
              key={lot.id}
              aria-hidden
              className={cn(
                "pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-md font-semibold tabular-nums leading-none shadow-[0_2px_8px_rgba(0,0,0,0.45)]",
                large
                  ? "px-2 py-1 text-xs"
                  : size && size.w < 480
                    ? "px-1 py-0.5 text-[9px]"
                    : "px-1.5 py-0.5 text-[10px]",
                lot.statut === "disponible"
                  ? "bg-[color:var(--brand)] text-[color:var(--brand-contrast)]"
                  : lot.statut === "reservee"
                    ? "bg-amber-400 text-black"
                    : "bg-zinc-700 text-white/75",
                filter !== null && lot.statut !== filter && "opacity-30",
              )}
              style={{ left: x, top: y }}
            >
              {lot.numero}
            </span>
          ))}
          {tipLot && hover ? (
            <div
              aria-hidden
              className={cn(
                "pointer-events-none absolute z-10 w-max max-w-56 -translate-x-1/2 rounded-xl border border-white/10 bg-black/85 px-3 py-2 text-xs text-white shadow-xl backdrop-blur",
                hover.y < 90 ? "translate-y-4" : "-translate-y-[calc(100%+12px)]",
              )}
              style={{ left: hover.x, top: hover.y }}
            >
              <p className="font-semibold">
                Lot {tipLot.numero}
                {tipLot.type ? ` · ${tipLot.type}` : ""}
              </p>
              <p className="mt-0.5 text-white/70">{statusAndPrice(tipLot, currency)}</p>
            </div>
          ) : null}
        </div>

        {loading ? (
          <div className="absolute inset-0 grid place-items-center bg-black/60">
            <div className="w-48 space-y-2 text-center">
              <div className="h-1 overflow-hidden rounded-full bg-white/15">
                <div
                  className="h-full rounded-full bg-[color:var(--brand)] transition-[width] duration-300"
                  style={{ width: `${(ready / Math.min(6, count)) * 100}%` }}
                />
              </div>
              <p className="text-xs text-white/70">Chargement de la vue…</p>
            </div>
          </div>
        ) : null}
      </div>

      <StatusLegend
        large={large}
        hint="Glissez pour tourner, cliquez un lot pour sa fiche"
        touchHint="Glissez pour tourner · touchez un lot pour sa fiche"
      />
    </div>
  );
}
