import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import { Check, Eraser, ImageUp, Maximize, Minus, Plus } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";

import { StatusDot } from "@/components/app/lots/LotStatus";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { dbErrorMessage } from "@/lib/app/errors";
import { STATUS_LABELS, type Lot, type LotStatus } from "@/lib/app/lot-fields";
import { useDeleteShape, useSaveShape } from "@/lib/app/plan";
import { centroid, clamp01, isValidShape, midpoints, type Point } from "@/lib/geometry";
import { cn } from "@/lib/utils";
import { fitView, pinchView, zoomBounds, zoomView, type View } from "@/lib/viewport";

/* Shapes of the lots on the plan. The image keeps its own pixel size inside a
   zoomed and panned layer; an SVG of the same size draws the shapes, whose
   points are stored from 0 to 1. A click adds a point, a drag moves the plan. */

type Drag =
  | {
      kind: "pending" | "pan";
      pointerId: number;
      button: number;
      x: number;
      y: number;
      view: View;
      lotId: string | null;
    }
  | { kind: "vertex"; pointerId: number; index: number; points: Point[]; changed: boolean }
  | { kind: "pinch"; distance: number; center: { x: number; y: number }; view: View };

const STATUS_CLASS: Record<LotStatus, string> = {
  disponible: "fill-emerald-400 stroke-emerald-400",
  reservee: "fill-amber-400 stroke-amber-400",
  vendue: "fill-zinc-400 stroke-zinc-400",
};

const toAttr = (points: readonly Point[], w: number, h: number) =>
  points.map(([x, y]) => `${x * w},${y * h}`).join(" ");

export type PlanImage = { large: string; small: string; width: number; height: number };

export function PlanEditor({
  projectId,
  image,
  lots,
  shapes,
  onReplace,
}: {
  projectId: string;
  image: PlanImage;
  lots: Lot[];
  shapes: Map<string, Point[]>;
  onReplace: () => void;
}) {
  const { width: W, height: H } = image;
  const save = useSaveShape(projectId);
  const remove = useDeleteShape(projectId);

  const viewport = useRef<HTMLDivElement>(null);
  const drag = useRef<Drag | null>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const fitK = useRef(1);
  const [view, setView] = useState<View>({ k: 0, x: 0, y: 0 });
  const viewRef = useRef(view);
  viewRef.current = view;
  const fitted = useRef(true);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Point[]>([]);
  const [hover, setHover] = useState<Point | null>(null);
  const [editing, setEditing] = useState<Point[] | null>(null);
  const [vertex, setVertex] = useState<number | null>(null);
  const [onlyTodo, setOnlyTodo] = useState(false);
  const [largeReady, setLargeReady] = useState(false);
  const [saved, setSaved] = useState(false);
  const savedTimer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(savedTimer.current), []);

  const selected = lots.find((l) => l.id === selectedId) ?? null;
  const selectedShape = selected ? shapes.get(selected.id) : undefined;
  const drawing = Boolean(selected && !selectedShape);
  const traced = lots.filter((l) => shapes.has(l.id)).length;

  // First lot to trace once the lots are known.
  useEffect(() => {
    if (selectedId || lots.length === 0) return;
    setSelectedId((lots.find((l) => !shapes.has(l.id)) ?? null)?.id ?? null);
  }, [lots, shapes, selectedId]);

  // The saved shape (or the restored one after a failure) replaces the local copy.
  useEffect(() => setEditing(null), [selectedShape]);

  /* ------------------------------------------------------------ view */

  const fit = useCallback(() => {
    const el = viewport.current;
    if (!el) return;
    const next = fitView(el.clientWidth, el.clientHeight, W, H);
    fitK.current = next.k;
    fitted.current = true;
    setView(next);
  }, [W, H]);

  useEffect(() => {
    const el = viewport.current;
    if (!el) return;
    fit();
    const observer = new ResizeObserver(() => {
      if (fitted.current) fit();
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [fit]);

  const zoomAt = useCallback((clientX: number, clientY: number, factor: number) => {
    const el = viewport.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = clientX - rect.left;
    const py = clientY - rect.top;
    fitted.current = false;
    const { min, max } = zoomBounds(fitK.current);
    setView((v) => zoomView(v, px, py, factor, min, max));
  }, []);

  const zoomCenter = (factor: number) => {
    const rect = viewport.current?.getBoundingClientRect();
    if (rect) zoomAt(rect.left + rect.width / 2, rect.top + rect.height / 2, factor);
  };

  // Wheel and trackpad pinch zoom around the pointer (not passive, to keep the page still).
  useEffect(() => {
    const el = viewport.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      zoomAt(e.clientX, e.clientY, Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.002)));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoomAt]);

  const toPoint = (clientX: number, clientY: number): Point => {
    const rect = viewport.current?.getBoundingClientRect();
    const v = viewRef.current;
    if (!rect || v.k === 0) return [0, 0];
    return [
      clamp01((clientX - rect.left - v.x) / v.k / W),
      clamp01((clientY - rect.top - v.y) / v.k / H),
    ];
  };

  /** Distance in screen pixels between two points of the plan. */
  const screenDistance = (a: Point, b: Point) =>
    Math.hypot((a[0] - b[0]) * W * viewRef.current.k, (a[1] - b[1]) * H * viewRef.current.k);

  /* ----------------------------------------------------------- edits */

  const store = (lotId: string, points: Point[]) =>
    save.mutate(
      { lotId, points },
      {
        onSuccess: () => {
          setSaved(true);
          window.clearTimeout(savedTimer.current);
          savedTimer.current = window.setTimeout(() => setSaved(false), 1600);
        },
        onError: (error) => toast.error(dbErrorMessage(error)),
      },
    );

  const select = (id: string | null) => {
    setSelectedId(id);
    setDraft([]);
    setHover(null);
    setVertex(null);
    setEditing(null);
  };

  const nextToTrace = (afterId: string) => {
    const start = lots.findIndex((l) => l.id === afterId);
    const ordered = [...lots.slice(start + 1), ...lots.slice(0, start)];
    return ordered.find((l) => !shapes.has(l.id) && l.id !== afterId) ?? null;
  };

  const close = (points: Point[]) => {
    if (!selected) return;
    if (!isValidShape(points, W, H)) {
      toast.error("Forme trop petite ou plate : placez au moins 3 points bien écartés.");
      return;
    }
    store(selected.id, points);
    const next = nextToTrace(selected.id);
    if (next) select(next.id);
    else {
      select(selected.id);
      toast.success("Tous les lots sont tracés");
    }
  };

  const removeVertex = (index: number) => {
    if (!selected || !selectedShape) return;
    if (selectedShape.length <= 3) {
      toast.error(
        "Une forme garde au moins 3 points. Utilisez « Effacer la forme » pour la supprimer.",
      );
      return;
    }
    store(
      selected.id,
      selectedShape.filter((_, i) => i !== index),
    );
    setVertex(null);
  };

  const clearShape = () => {
    if (!selected) return;
    remove.mutate(selected.id, { onError: (error) => toast.error(dbErrorMessage(error)) });
    select(selected.id);
  };

  /* -------------------------------------------------------- pointers */

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button === 2) return;
    viewport.current?.focus({ preventScroll: true });
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    try {
      viewport.current?.setPointerCapture(e.pointerId);
    } catch {
      /* pointer already released: the drag simply ends on its own */
    }

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

    const target = e.target as Element;
    const vertexEl = target.closest<SVGElement>("[data-vertex]");
    const middleEl = target.closest<SVGElement>("[data-midpoint]");
    if (selected && selectedShape && (vertexEl || middleEl)) {
      let points = [...(editing ?? selectedShape)];
      let index: number;
      if (vertexEl) index = Number(vertexEl.dataset["vertex"]);
      else {
        const side = Number(middleEl?.dataset["midpoint"]);
        const middle = midpoints(points)[side];
        if (!middle) return;
        points = [...points.slice(0, side + 1), middle, ...points.slice(side + 1)];
        index = side + 1;
      }
      setEditing(points);
      setVertex(index);
      drag.current = {
        kind: "vertex",
        pointerId: e.pointerId,
        index,
        points,
        changed: Boolean(middleEl),
      };
      return;
    }
    drag.current = {
      kind: "pending",
      pointerId: e.pointerId,
      button: e.button,
      x: e.clientX,
      y: e.clientY,
      view: viewRef.current,
      lotId: target.closest<SVGElement>("[data-lot]")?.dataset["lot"] ?? null,
    };
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (pointers.current.has(e.pointerId))
      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const d = drag.current;
    if (d?.kind === "pinch" && pointers.current.size === 2) {
      const rect = viewport.current?.getBoundingClientRect();
      const [a, b] = [...pointers.current.values()] as [
        { x: number; y: number },
        { x: number; y: number },
      ];
      if (!rect) return;
      const { min, max } = zoomBounds(fitK.current);
      fitted.current = false;
      setView(
        pinchView(
          d.view,
          { x: d.center.x - rect.left, y: d.center.y - rect.top },
          d.distance,
          { x: (a.x + b.x) / 2 - rect.left, y: (a.y + b.y) / 2 - rect.top },
          Math.hypot(a.x - b.x, a.y - b.y),
          min,
          max,
        ),
      );
      return;
    }
    if (d?.kind === "pending" && Math.hypot(e.clientX - d.x, e.clientY - d.y) > 4) {
      drag.current = { ...d, kind: "pan" };
    }
    const current = drag.current;
    if (current?.kind === "pan") {
      fitted.current = false;
      setView({
        ...current.view,
        x: current.view.x + e.clientX - current.x,
        y: current.view.y + e.clientY - current.y,
      });
    } else if (current?.kind === "vertex") {
      const point = toPoint(e.clientX, e.clientY);
      current.points = current.points.map((p, i) => (i === current.index ? point : p));
      current.changed = true;
      setEditing(current.points);
    }
    if (drawing && e.pointerType === "mouse") setHover(toPoint(e.clientX, e.clientY));
  };

  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    pointers.current.delete(e.pointerId);
    const d = drag.current;
    if (d?.kind === "pinch") {
      if (pointers.current.size === 0) drag.current = null;
      return;
    }
    drag.current = null;
    if (!d) return;
    if (d.kind === "vertex") {
      if (selected && d.changed) store(selected.id, d.points);
      else setEditing(null);
    } else if (d.kind === "pending" && d.button === 0) {
      click(toPoint(e.clientX, e.clientY), d.lotId);
    }
  };

  const click = (point: Point, lotId: string | null) => {
    if (drawing) {
      const first = draft[0];
      const last = draft[draft.length - 1];
      if (first && draft.length >= 3 && screenDistance(point, first) <= 10) return close(draft);
      // Second click of a double-click: close the shape.
      if (last && draft.length >= 3 && screenDistance(point, last) <= 4) return close(draft);
      if (last && screenDistance(point, last) <= 2) return;
      setDraft([...draft, point]);
      return;
    }
    if (lotId && lotId !== selectedId) select(lotId);
    else setVertex(null);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const handled = () => e.preventDefault();
    if (e.key === "Escape") {
      handled();
      if (draft.length) setDraft([]);
      else setVertex(null);
    } else if (e.key === "Enter" && drawing && draft.length >= 3) {
      handled();
      close(draft);
    } else if (e.key === "Backspace" && drawing && draft.length) {
      handled();
      setDraft(draft.slice(0, -1));
    } else if ((e.key === "Delete" || e.key === "Backspace") && vertex !== null) {
      handled();
      removeVertex(vertex);
    } else if (e.key === "+" || e.key === "=") {
      handled();
      zoomCenter(1.25);
    } else if (e.key === "-") {
      handled();
      zoomCenter(0.8);
    } else if (e.key === "0") {
      handled();
      fit();
    }
  };

  /* ---------------------------------------------------------- render */

  const shown = useMemo(
    () => (onlyTodo ? lots.filter((l) => !shapes.has(l.id)) : lots),
    [lots, shapes, onlyTodo],
  );
  const k = view.k || 1;
  const handlePoints = selected && selectedShape ? (editing ?? selectedShape) : null;
  const percent = Math.round((view.k / (fitK.current || 1)) * 100);

  const hint = !selected
    ? lots.length === 0
      ? "Ajoutez d'abord les lots du programme pour les tracer sur le plan."
      : "Choisissez un lot dans la liste, ou cliquez sur sa forme."
    : drawing
      ? draft.length < 3
        ? `Cliquez sur le plan pour placer les points du lot ${selected.numero}. Glissez pour déplacer le plan.`
        : "Fermez la forme sur le premier point, par double-clic ou avec Entrée. Retour arrière retire le dernier point, Échap annule."
      : "Glissez un point pour l'ajuster, cliquez au milieu d'un côté pour en ajouter un. Suppr ou clic droit retire le point choisi.";

  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      <aside className="flex w-full shrink-0 flex-col rounded-2xl border border-border bg-card lg:w-64">
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <div>
            <p className="text-sm font-medium">Lots</p>
            <p className="text-xs text-muted-foreground" aria-live="polite">
              {traced} / {lots.length} tracés
            </p>
          </div>
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            À tracer
            <Switch
              checked={onlyTodo}
              onCheckedChange={setOnlyTodo}
              aria-label="Afficher seulement les lots à tracer"
            />
          </label>
        </div>
        {lots.length === 0 ? (
          <p className="px-4 py-6 text-sm leading-relaxed text-muted-foreground">
            Aucun lot pour l'instant.{" "}
            <Link
              to="/app/projets/$id/lots"
              params={{ id: projectId }}
              className="text-foreground underline underline-offset-4"
            >
              Ajouter les lots
            </Link>
          </p>
        ) : (
          <ul
            className="max-h-64 overflow-y-auto p-2 lg:max-h-[min(64svh,640px)]"
            aria-label="Lots du programme"
          >
            {shown.map((lot) => {
              const isSelected = lot.id === selectedId;
              const done = shapes.has(lot.id);
              return (
                <li key={lot.id}>
                  <button
                    type="button"
                    onClick={() => select(lot.id)}
                    aria-pressed={isSelected}
                    aria-label={`Lot ${lot.numero}, ${STATUS_LABELS[lot.statut]}, ${done ? "tracé" : "à tracer"}`}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      isSelected ? "bg-primary/15 text-foreground" : "hover:bg-muted/50",
                    )}
                  >
                    <StatusDot status={lot.statut} />
                    <span className="font-medium">{lot.numero}</span>
                    <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
                      {lot.type}
                    </span>
                    {done ? (
                      <Check className="size-4 shrink-0 text-emerald-400" aria-hidden />
                    ) : (
                      <span className="shrink-0 text-[11px] text-amber-300/90">à tracer</span>
                    )}
                  </button>
                </li>
              );
            })}
            {shown.length === 0 ? (
              <li className="px-3 py-4 text-sm text-muted-foreground">
                Tous les lots sont tracés.
              </li>
            ) : null}
          </ul>
        )}
      </aside>

      <div className="min-w-0 flex-1 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center rounded-lg border border-border">
            <Button
              variant="ghost"
              size="icon"
              className="size-9"
              onClick={() => zoomCenter(0.8)}
              aria-label="Dézoomer"
            >
              <Minus aria-hidden />
            </Button>
            <span
              className="w-14 text-center text-xs tabular-nums text-muted-foreground"
              aria-live="polite"
            >
              {percent} %
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="size-9"
              onClick={() => zoomCenter(1.25)}
              aria-label="Zoomer"
            >
              <Plus aria-hidden />
            </Button>
          </div>
          <Button variant="outline" className="h-9" onClick={fit}>
            <Maximize aria-hidden />
            Ajuster
          </Button>
          {selected && selectedShape ? (
            <Button variant="outline" className="h-9" onClick={clearShape}>
              <Eraser aria-hidden />
              Effacer la forme
            </Button>
          ) : null}
          <span
            className={cn(
              "inline-flex items-center gap-1.5 text-xs text-emerald-300 transition-opacity duration-700",
              saved ? "opacity-100" : "opacity-0",
            )}
            role="status"
          >
            <Check className="size-3.5" aria-hidden />
            Enregistré
          </span>
          <Button variant="ghost" className="ml-auto h-9" onClick={onReplace}>
            <ImageUp aria-hidden />
            Remplacer le plan
          </Button>
        </div>

        <div
          ref={viewport}
          tabIndex={0}
          role="application"
          aria-label={
            selected
              ? `Plan du programme, lot ${selected.numero} ${drawing ? "à tracer" : "sélectionné"}`
              : "Plan du programme"
          }
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onPointerLeave={() => setHover(null)}
          onKeyDown={onKeyDown}
          onContextMenu={(e) => {
            e.preventDefault();
            const v = (e.target as Element).closest<SVGElement>("[data-vertex]");
            if (v) removeVertex(Number(v.dataset["vertex"]));
          }}
          className={cn(
            "relative h-[min(70svh,720px)] min-h-[420px] touch-none select-none overflow-hidden rounded-2xl border border-border bg-[#0a0a0a] outline-none focus-visible:ring-2 focus-visible:ring-ring",
            drawing ? "cursor-crosshair" : "cursor-grab",
          )}
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
              alt="Plan du programme"
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
              onLoad={() => setLargeReady(true)}
              className={cn(
                "pointer-events-none absolute inset-0 h-full w-full transition-opacity duration-500",
                largeReady ? "opacity-100" : "opacity-0",
              )}
            />
            <svg
              viewBox={`0 0 ${W} ${H}`}
              width={W}
              height={H}
              className="absolute inset-0 overflow-visible"
            >
              {lots.map((lot) => {
                const isSelected = lot.id === selectedId;
                const points = isSelected ? (editing ?? shapes.get(lot.id)) : shapes.get(lot.id);
                if (!points) return null;
                const [cx, cy] = centroid(points);
                return (
                  <g key={lot.id} data-lot={lot.id} className={isSelected ? "" : "cursor-pointer"}>
                    <polygon
                      points={toAttr(points, W, H)}
                      className={
                        isSelected ? "fill-primary stroke-primary" : STATUS_CLASS[lot.statut]
                      }
                      fillOpacity={isSelected ? 0.28 : 0.2}
                      strokeWidth={isSelected ? 2.5 : 1.5}
                      vectorEffect="non-scaling-stroke"
                    />
                    <text
                      x={cx * W}
                      y={cy * H}
                      fontSize={13 / k}
                      fontWeight={600}
                      textAnchor="middle"
                      dominantBaseline="central"
                      className="pointer-events-none fill-white"
                      stroke="rgba(0,0,0,0.75)"
                      strokeWidth={3 / k}
                      paintOrder="stroke"
                    >
                      {lot.numero}
                    </text>
                  </g>
                );
              })}

              {drawing && draft.length > 0 ? (
                <g className="pointer-events-none">
                  <polyline
                    points={toAttr(hover ? [...draft, hover] : draft, W, H)}
                    className="fill-primary stroke-primary"
                    fillOpacity={0.12}
                    strokeWidth={2}
                    strokeDasharray="6 4"
                    vectorEffect="non-scaling-stroke"
                  />
                  {draft.map(([x, y], i) => (
                    <circle
                      key={i}
                      cx={x * W}
                      cy={y * H}
                      r={(i === 0 && draft.length >= 3 ? 7 : 4) / k}
                      className={
                        i === 0 ? "fill-primary stroke-white" : "fill-white stroke-primary"
                      }
                      strokeWidth={1.5}
                      vectorEffect="non-scaling-stroke"
                    />
                  ))}
                </g>
              ) : null}

              {handlePoints ? (
                <g>
                  {midpoints(handlePoints).map(([x, y], i) => (
                    <circle
                      key={`m${i}`}
                      data-midpoint={i}
                      cx={x * W}
                      cy={y * H}
                      r={4 / k}
                      className="cursor-copy fill-white/60 stroke-primary"
                      strokeWidth={1}
                      vectorEffect="non-scaling-stroke"
                    />
                  ))}
                  {handlePoints.map(([x, y], i) => (
                    <circle
                      key={`v${i}`}
                      data-vertex={i}
                      cx={x * W}
                      cy={y * H}
                      r={(vertex === i ? 7 : 6) / k}
                      className={cn(
                        "cursor-move stroke-primary",
                        vertex === i ? "fill-primary" : "fill-white",
                      )}
                      strokeWidth={2}
                      vectorEffect="non-scaling-stroke"
                    />
                  ))}
                </g>
              ) : null}
            </svg>
          </div>
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground" aria-live="polite">
          {hint} Molette ou pincement pour zoomer, 0 pour ajuster.
        </p>
      </div>
    </div>
  );
}
