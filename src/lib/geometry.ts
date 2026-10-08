/* Shapes of lots on the plan. Points are stored normalized, from 0 to 1
   relative to the plan image ([x, y], x to the right, y downwards), so they
   do not depend on the size the image is shown at. */

export type Point = [number, number];

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** 5 decimals: about a tenth of a pixel on a 4 096 px plan. */
export const roundPoint = ([x, y]: Point): Point => [
  Math.round(clamp01(x) * 1e5) / 1e5,
  Math.round(clamp01(y) * 1e5) / 1e5,
];

/** Size that fits in a square of `maxSide`, keeping the ratio and at most `maxPixels`. */
export function fitWithin(
  width: number,
  height: number,
  maxSide: number,
  maxPixels = Infinity,
): { width: number; height: number } {
  let scale = Math.min(1, maxSide / Math.max(width, height));
  if (width * height * scale * scale > maxPixels) scale = Math.sqrt(maxPixels / (width * height));
  return {
    width: Math.max(1, Math.floor(width * scale)),
    height: Math.max(1, Math.floor(height * scale)),
  };
}

/** Area in pixels² of a shape drawn on a plan of `width` × `height` pixels. */
export function area(points: readonly Point[], width = 1, height = 1): number {
  let sum = 0;
  for (let i = 0; i < points.length; i++) {
    const [x1, y1] = points[i] ?? [0, 0];
    const [x2, y2] = points[(i + 1) % points.length] ?? [0, 0];
    sum += x1 * width * (y2 * height) - x2 * width * (y1 * height);
  }
  return Math.abs(sum) / 2;
}

/** A shape needs 3 points and some surface (not all on one line). */
export function isValidShape(points: readonly Point[], width = 1000, height = 1000): boolean {
  return points.length >= 3 && points.length <= 1000 && area(points, width, height) >= 4;
}

/** Centre of the surface of a shape, where its label goes. */
export function centroid(points: readonly Point[]): Point {
  let a = 0;
  let cx = 0;
  let cy = 0;
  for (let i = 0; i < points.length; i++) {
    const [x1, y1] = points[i] ?? [0, 0];
    const [x2, y2] = points[(i + 1) % points.length] ?? [0, 0];
    const cross = x1 * y2 - x2 * y1;
    a += cross;
    cx += (x1 + x2) * cross;
    cy += (y1 + y2) * cross;
  }
  if (Math.abs(a) < 1e-12) {
    // Flat shape: average of the points.
    const n = points.length || 1;
    return [points.reduce((s, p) => s + p[0], 0) / n, points.reduce((s, p) => s + p[1], 0) / n];
  }
  return [cx / (3 * a), cy / (3 * a)];
}

/** Middle of each side, where a click adds a point. */
export function midpoints(points: readonly Point[]): Point[] {
  return points.map((p, i) => {
    const q = points[(i + 1) % points.length] ?? p;
    return [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
  });
}

/** Points read from the database (jsonb), or null when they are not a shape. */
export function parsePoints(value: unknown): Point[] | null {
  if (!Array.isArray(value)) return null;
  const points: Point[] = [];
  for (const p of value) {
    if (!Array.isArray(p) || p.length !== 2) return null;
    const [x, y] = p as unknown[];
    if (typeof x !== "number" || typeof y !== "number") return null;
    points.push([x, y]);
  }
  return points;
}
