import { Minus, Plus } from "lucide-react";
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
   a little inertia), the arrow keys, or a slow half turn on opening; zoomed
   with the − and + buttons, a pinch, Ctrl + the wheel (the wheel alone in
   presentation) or a double tap outside the lots, then moved by dragging;
   the lots painted in the colour of their status on every image, from the
   label maps of the masks, with their number written on them; the lot under
   the pointer lit up, a click opens its sheet. The 1 280 px images turn; on
   large screens, or zoomed in, the 2 048 px one replaces the image shown
   once it stops. */

const AMBER = [251, 191, 36] as const;
const SOLD = [70, 70, 78] as const;

type Drag = { x: number; y: number; t: number; moved: boolean; pointerId: number; pan: boolean };
type Point = { x: number; y: number };

/** Zoom of the view: its scale, and where the image starts in it, in fractions of the view (0 or less). */
type Zoom = { z: number; x: number; y: number };
const WHOLE: Zoom = { z: 1, x: 0, y: 0 };
const MAX_ZOOM = 3;
const ZOOM_STEP = 1.6;
const isZoomed = (v: Zoom) => v.z > 1.001;

/** `factor` times closer, the point `from` of the view (in fractions of it) brought to `to`, the image still filling the view. */
function zoomAt(v: Zoom, factor: number, from: Point, to: Point = from): Zoom {
  const z = Math.min(MAX_ZOOM, Math.max(1, v.z * factor));
  // Nearly back to the whole view: the whole view.
  if (factor < 1 && z < 1.02) return WHOLE;
  const k = z / v.z;
  return {
    z,
    x: Math.min(0, Math.max(1 - z, to.x - (from.x - v.x) * k)),
    y: Math.min(0, Math.max(1 - z, to.y - (from.y - v.y) * k)),
  };
}

/** Distance between two fingers, and the point between them. */
function pinchOf(pointers: Map<number, Point>) {
  const [a, b] = [...pointers.values()] as [Point, Point];
  return { dist: Math.hypot(a.x - b.x, a.y - b.y), x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

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
            data.labels.length * 0.0003,
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

/** The 2 048 px image of the one shown, fetched once it is no longer to `wait` (turning, or not needed). */
function useSharpFrame(urls: readonly string[], index: number, wait: boolean) {
  const sharp = useRef(new Map<number, HTMLImageElement>());
  const [loaded, setLoaded] = useState(0);
  useEffect(() => {
    sharp.current = new Map();
  }, [urls]);
  useEffect(() => {
    if (wait || sharp.current.has(index)) return;
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
  }, [urls, index, wait]);
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
  // On a page or in an iframe the wheel keeps scrolling: Ctrl (or a trackpad pinch) zooms.
  const wheelZooms = variant === "presentation";
  const count = orbit.frames.length;
  const first = orbit.frames[0];

  // Large screens: the 2 048 px image of the one shown once it stops; phones only when zoomed in.
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
  const largeList = useMemo(() => frameKey.split("|").map((path) => publicUrl(path)), [frameKey]);
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
  const [panning, setPanning] = useState(false);
  const [wheelHint, setWheelHint] = useState(false);
  const pos = useRef(0);
  const velocity = useRef(0);
  const frame = useRef(0);
  const drag = useRef<Drag | null>(null);
  const pointers = useRef(new Map<number, Point>());
  const pinch = useRef<{ dist: number; x: number; y: number } | null>(null);
  const lastTap = useRef<{ t: number; x: number; y: number } | null>(null);
  const touched = useRef(false);
  const turned = useRef(false);
  const frameCanvas = useRef<HTMLCanvasElement>(null);
  const overlay = useRef<HTMLCanvasElement>(null);
  const pixels = useRef<ImageData | null>(null);
  const box = useRef<HTMLDivElement>(null);
  const group = useRef<HTMLDivElement>(null);
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

  const [zoom, setZoomState] = useState<Zoom>(WHOLE);
  const zoomRef = useRef(zoom);
  const zoomGoal = useRef<Zoom | null>(null);
  const zoomFrame = useRef(0);
  const zoomed = isZoomed(zoom);
  const setZoom = useCallback((next: Zoom) => {
    zoomRef.current = next;
    setZoomState(next);
  }, []);
  const stopZoom = useCallback(() => {
    cancelAnimationFrame(zoomFrame.current);
    zoomGoal.current = null;
  }, []);
  useEffect(() => () => cancelAnimationFrame(zoomFrame.current), []);

  /** To that zoom smoothly (buttons, double tap, keyboard). */
  const animateZoom = useCallback(
    (goal: Zoom) => {
      stopZoom();
      const from = zoomRef.current;
      if (still) {
        setZoom(goal);
        return;
      }
      zoomGoal.current = goal;
      const start = performance.now();
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / 240);
        const e = 1 - Math.pow(1 - t, 3);
        setZoom(
          t < 1
            ? {
                z: from.z + (goal.z - from.z) * e,
                x: from.x + (goal.x - from.x) * e,
                y: from.y + (goal.y - from.y) * e,
              }
            : goal,
        );
        if (t < 1) zoomFrame.current = requestAnimationFrame(step);
        else zoomGoal.current = null;
      };
      zoomFrame.current = requestAnimationFrame(step);
    },
    [setZoom, stopZoom, still],
  );

  /** The buttons and the keyboard: `factor` times closer around the middle, or the whole view (0). */
  const zoomBy = (factor: number) => {
    touched.current = true;
    stopMotion();
    const middle = { x: 0.5, y: 0.5 };
    animateZoom(factor === 0 ? WHOLE : zoomAt(zoomGoal.current ?? zoomRef.current, factor, middle));
  };

  // Presentation left idle: back to the first view, whole.
  useEffect(() => {
    if (!resetKey) return;
    stopMotion();
    stopZoom();
    setZoom(WHOLE);
    goTo(0);
  }, [resetKey, goTo, stopMotion, stopZoom, setZoom]);

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

  // The wheel and the fingers, with listeners of our own: React's are passive, and the
  // page must neither scroll nor zoom instead of the view.
  useEffect(() => {
    const el = group.current;
    if (!el) return;
    let hintTimer = 0;
    const onWheel = (e: WheelEvent) => {
      if (!wheelZooms && !e.ctrlKey && !e.metaKey) {
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
          setWheelHint(true);
          window.clearTimeout(hintTimer);
          hintTimer = window.setTimeout(() => setWheelHint(false), 1400);
        }
        return;
      }
      e.preventDefault();
      touched.current = true;
      stopMotion();
      stopZoom();
      setWheelHint(false);
      const rect = el.getBoundingClientRect();
      const dy =
        e.deltaMode === 1 ? e.deltaY * 16 : e.deltaMode === 2 ? e.deltaY * rect.height : e.deltaY;
      const at = {
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      };
      // A notch of the wheel and the many small steps of a trackpad pinch alike.
      setZoom(zoomAt(zoomRef.current, Math.exp(-Math.max(-40, Math.min(40, dy)) * 0.008), at));
    };
    const onTouchMove = (e: TouchEvent) => {
      // Two fingers zoom the view, not the page; zoomed in, one finger moves in the image.
      if (e.cancelable && (e.touches.length > 1 || isZoomed(zoomRef.current))) e.preventDefault();
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => {
      window.clearTimeout(hintTimer);
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("touchmove", onTouchMove);
    };
  }, [wheelZooms, setZoom, stopMotion, stopZoom]);

  const { sharp, loaded: sharpLoaded } = useSharpFrame(
    largeList,
    index,
    moving || !(big || zoomed),
  );

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

  // The overlay is zoomed with the view: its rectangle on screen still finds the lot.
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
    stopZoom();
    // A new gesture: no finger left over from the last one.
    if (e.isPrimary) {
      pointers.current.clear();
      pinch.current = null;
    }
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size >= 2) {
      // Two fingers: a pinch, neither a turn nor a tap.
      drag.current = null;
      setPanning(false);
      setHover(null);
      pinch.current = pinchOf(pointers.current);
      for (const id of pointers.current.keys()) {
        try {
          e.currentTarget.setPointerCapture(id);
        } catch {
          /* pointer already gone */
        }
      }
      return;
    }
    velocity.current = 0;
    drag.current = {
      x: e.clientX,
      y: e.clientY,
      t: performance.now(),
      moved: false,
      pointerId: e.pointerId,
      // Zoomed in, dragging moves in the image instead of turning.
      pan: isZoomed(zoomRef.current),
    };
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const p = pointers.current.get(e.pointerId);
    if (p) {
      p.x = e.clientX;
      p.y = e.clientY;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const before = pinch.current;
    if (before) {
      if (pointers.current.size < 2) return;
      const now = pinchOf(pointers.current);
      pinch.current = now;
      // Closer as the fingers part, the point between them following them.
      setZoom(
        zoomAt(
          zoomRef.current,
          now.dist / Math.max(1, before.dist),
          { x: (before.x - rect.left) / rect.width, y: (before.y - rect.top) / rect.height },
          { x: (now.x - rect.left) / rect.width, y: (now.y - rect.top) / rect.height },
        ),
      );
      return;
    }
    const d = drag.current;
    if (d && d.pointerId === e.pointerId) {
      const dx = e.clientX - d.x;
      const dy = e.clientY - d.y;
      if (!d.moved && (d.pan ? Math.hypot(dx, dy) : Math.abs(dx)) > 5) {
        d.moved = true;
        if (d.pan) setPanning(true);
        else setMoving(true);
        setHover(null);
        try {
          e.currentTarget.setPointerCapture(e.pointerId);
        } catch {
          /* pointer already gone */
        }
      }
      if (d.moved) {
        const now = performance.now();
        if (d.pan) {
          setZoom(
            zoomAt(zoomRef.current, 1, { x: 0, y: 0 }, { x: dx / rect.width, y: dy / rect.height }),
          );
        } else {
          const views = -dx / stepPx();
          goTo(pos.current + views);
          const dt = Math.max(1, now - d.t);
          velocity.current = 0.7 * velocity.current + 0.3 * (views / dt);
        }
        d.x = e.clientX;
        d.y = e.clientY;
        d.t = now;
      }
      return;
    }
    if (e.pointerType !== "mouse" || moving) return;
    const label = labelAt(e.clientX, e.clientY);
    setHover(
      label && lotByLabel[label]
        ? { label, x: e.clientX - rect.left, y: e.clientY - rect.top }
        : null,
    );
  };

  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    pointers.current.delete(e.pointerId);
    if (pinch.current) {
      // The pinch ends with the last finger: the one left neither turns nor taps.
      if (pointers.current.size === 0) pinch.current = null;
      return;
    }
    const d = drag.current;
    if (!d || d.pointerId !== e.pointerId) return;
    drag.current = null;
    if (d.pan) setPanning(false);
    if (!d.moved) {
      setMoving(false);
      const lot = lotByLabel[labelAt(e.clientX, e.clientY)];
      if (lot) {
        lastTap.current = null;
        onOpen(lot, "plan");
        return;
      }
      // Two taps (or a double click) outside the lots: closer there, or the whole view again.
      const now = performance.now();
      const last = lastTap.current;
      if (last && now - last.t < 350 && Math.hypot(e.clientX - last.x, e.clientY - last.y) < 30) {
        lastTap.current = null;
        const rect = e.currentTarget.getBoundingClientRect();
        const at = {
          x: (e.clientX - rect.left) / rect.width,
          y: (e.clientY - rect.top) / rect.height,
        };
        animateZoom(isZoomed(zoomRef.current) ? WHOLE : zoomAt(WHOLE, 2.5, at));
      } else {
        lastTap.current = { t: now, x: e.clientX, y: e.clientY };
      }
      return;
    }
    if (d.pan) return;
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

  const onPointerCancel = (e: PointerEvent<HTMLDivElement>) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size === 0) pinch.current = null;
    drag.current = null;
    setMoving(false);
    setPanning(false);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "+" || e.key === "=" || e.key === "-" || e.key === "_" || e.key === "0") {
      e.preventDefault();
      zoomBy(e.key === "0" ? 0 : e.key === "+" || e.key === "=" ? ZOOM_STEP : 1 / ZOOM_STEP);
      return;
    }
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    touched.current = true;
    stopMotion();
    goTo(Math.round(pos.current) + (e.key === "ArrowRight" ? 1 : -1));
  };

  const tipLot = hover ? lotByLabel[hover.label] : null;
  const loading = ready < Math.min(6, count);

  // Numbers of the lots, where they are on the image shown (zoomed in: those in sight).
  const shownMap = nearestLoaded(maps.current, index);
  const centers = shownMap >= 0 ? (maps.current[shownMap]?.centers ?? []) : [];
  const tags = size
    ? centers.flatMap((c, label) => {
        const lot = c ? lotByLabel[label] : null;
        if (!c || !lot) return [];
        const x = (zoom.x + c.x * zoom.z) * size.w;
        const y = (zoom.y + c.y * zoom.z) * size.h;
        return x < -24 || y < -12 || x > size.w + 24 || y > size.h + 12 ? [] : [{ lot, x, y }];
      })
    : [];

  const control = cn(
    "grid place-items-center rounded-full transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 disabled:pointer-events-none disabled:opacity-35",
    large ? "h-11 min-w-11" : "h-9 min-w-9",
  );

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
          ref={group}
          role="group"
          tabIndex={0}
          aria-roledescription="vue 3D"
          aria-label={`${viewName}, image ${index + 1} sur ${count}. Flèches gauche et droite pour tourner, plus et moins pour zoomer.`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerCancel}
          onPointerLeave={() => setHover(null)}
          onKeyDown={onKeyDown}
          className={cn(
            "relative select-none outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/60",
            moving || panning ? "cursor-grabbing" : tipLot ? "cursor-pointer" : "cursor-grab",
            // Vertical swipes keep scrolling the page, unless zoomed in; nothing to scroll in presentation.
            large || zoomed ? "touch-none" : "touch-pan-y",
          )}
          style={size ? { width: size.w, height: size.h } : { width: "100%", height: "100%" }}
        >
          <div className="absolute inset-0 overflow-hidden">
            <div
              aria-hidden
              className="absolute inset-0 origin-top-left"
              style={
                zoomed
                  ? {
                      transform: `translate(${zoom.x * 100}%, ${zoom.y * 100}%) scale(${zoom.z})`,
                    }
                  : undefined
              }
            >
              <canvas
                ref={frameCanvas}
                className="pointer-events-none absolute inset-0 h-full w-full"
              />
              <canvas
                ref={overlay}
                className="pointer-events-none absolute inset-0 h-full w-full"
              />
            </div>
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
          </div>
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

        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-0 grid place-items-center bg-black/40 transition-opacity duration-300",
            wheelHint ? "opacity-100" : "opacity-0",
          )}
        >
          <p className="rounded-full bg-black/75 px-4 py-2 text-sm font-medium text-white">
            Ctrl + molette pour zoomer
          </p>
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
        ) : (
          <div
            role="group"
            aria-label="Zoom"
            className={cn(
              "absolute flex items-center gap-0.5 rounded-full border border-white/15 bg-black/65 p-1 text-white shadow-lg backdrop-blur",
              large ? "bottom-4 right-4" : "bottom-2.5 right-2.5",
            )}
          >
            {zoomed ? (
              <button
                type="button"
                onClick={() => zoomBy(0)}
                className={cn(control, "px-3 font-medium", large ? "text-sm" : "text-xs")}
              >
                Vue entière
              </button>
            ) : null}
            <button
              type="button"
              aria-label="Dézoomer"
              disabled={!zoomed}
              onClick={() => zoomBy(1 / ZOOM_STEP)}
              className={control}
            >
              <Minus aria-hidden className={large ? "size-5" : "size-4"} />
            </button>
            <button
              type="button"
              aria-label="Zoomer"
              disabled={zoom.z >= MAX_ZOOM - 0.01}
              onClick={() => zoomBy(ZOOM_STEP)}
              className={control}
            >
              <Plus aria-hidden className={large ? "size-5" : "size-4"} />
            </button>
          </div>
        )}
      </div>

      <StatusLegend
        large={large}
        hint={
          zoomed
            ? "Glissez pour vous déplacer dans l'image, dézoomez pour tourner"
            : "Glissez pour tourner, Ctrl + molette pour zoomer, cliquez un lot pour sa fiche"
        }
        touchHint={
          zoomed
            ? "Glissez pour vous déplacer · dézoomez pour tourner"
            : "Glissez pour tourner · pincez pour zoomer · touchez un lot pour sa fiche"
        }
      />
    </div>
  );
}
