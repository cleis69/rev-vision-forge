/* Zoom and pan of a plan shown at its own pixel size inside a viewport:
   the layer is drawn at translate(x, y) scale(k). Shared by the editor and
   the public plan. */

export type View = { k: number; x: number; y: number };
type Pt = { x: number; y: number };

/** Whole image visible and centred, with a small margin. */
export function fitView(
  viewWidth: number,
  viewHeight: number,
  width: number,
  height: number,
  margin = 0.96,
): View {
  const k = Math.min(viewWidth / width, viewHeight / height) * margin;
  return { k, x: (viewWidth - width * k) / 2, y: (viewHeight - height * k) / 2 };
}

/** Zoom limits around the fitted scale. */
export const zoomBounds = (fitK: number) => ({ min: fitK * 0.5, max: Math.max(fitK * 24, 2) });

const clamp = (k: number, min: number, max: number) => Math.min(Math.max(k, min), max);

/** Zooms by `factor`, keeping the point at (px, py) of the viewport in place. */
export function zoomView(
  v: View,
  px: number,
  py: number,
  factor: number,
  min: number,
  max: number,
): View {
  const k = clamp(v.k * factor, min, max);
  return { k, x: px - ((px - v.x) * k) / v.k, y: py - ((py - v.y) * k) / v.k };
}

/** Two-finger zoom: the point under the first centre follows the fingers. */
export function pinchView(
  start: View,
  startCenter: Pt,
  startDistance: number,
  center: Pt,
  distance: number,
  min: number,
  max: number,
): View {
  const k = clamp((start.k * distance) / startDistance, min, max);
  const ox = (startCenter.x - start.x) / start.k;
  const oy = (startCenter.y - start.y) / start.k;
  return { k, x: center.x - ox * k, y: center.y - oy * k };
}

/** Keeps a zoomed image covering the viewport (no empty band once zoomed in). */
export function clampView(
  v: View,
  viewWidth: number,
  viewHeight: number,
  width: number,
  height: number,
): View {
  const w = width * v.k;
  const h = height * v.k;
  const x = w <= viewWidth ? (viewWidth - w) / 2 : Math.min(0, Math.max(viewWidth - w, v.x));
  const y = h <= viewHeight ? (viewHeight - h) / 2 : Math.min(0, Math.max(viewHeight - h, v.y));
  return { k: v.k, x, y };
}
