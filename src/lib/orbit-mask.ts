/* Orbital view: a sequence of images around the programme and the same views
   as ID masks, each lot in one flat colour on a black background (PNG,
   without anti-aliasing). The colour under the pointer says which lot it is;
   the pixels of a colour light the lot up. Pure functions, used by the
   promoter space (upload, colour → lot) and by the public viewer. */

export const ORBIT_MIN = 24;
export const ORBIT_MAX = 120;
/** Colours covering less than this share of the mask pixels are edge noise. */
export const MIN_SHARE = 0.0005;
/** Pixels darker than this on every channel are the background. */
const BACKGROUND = 24;

export const packRgb = (r: number, g: number, b: number) => (r << 16) | (g << 8) | b;

export const hexOf = (rgb: number) => `#${rgb.toString(16).padStart(6, "0")}`;

export const rgbOf = (hex: string): number => Number.parseInt(hex.slice(1), 16);

export const isBackground = (r: number, g: number, b: number) =>
  r < BACKGROUND && g < BACKGROUND && b < BACKGROUND;

/** Files in their natural order: vue-2 before vue-10. */
export function sortByName<T extends { name: string }>(files: T[]): T[] {
  const collator = new Intl.Collator("fr", { numeric: true, sensitivity: "base" });
  return [...files].sort((a, b) => collator.compare(a.name, b.name));
}

/** What is wrong with the chosen files, or null when the sequence can be uploaded. */
export function checkSequence(
  frames: { name: string; type: string }[],
  masks: { name: string; type: string }[],
): string | null {
  if (frames.length === 0) return "Choisissez les images de la séquence.";
  if (frames.length < ORBIT_MIN || frames.length > ORBIT_MAX)
    return `La séquence compte ${frames.length} images : il en faut entre ${ORBIT_MIN} et ${ORBIT_MAX} (36 à 72 conseillées).`;
  if (frames.some((f) => !["image/jpeg", "image/png", "image/webp"].includes(f.type)))
    return "Les images doivent être en JPEG, PNG ou WebP.";
  if (masks.length === 0) return "Choisissez les masques de la séquence.";
  if (masks.length !== frames.length)
    return `${frames.length} images mais ${masks.length} masques : il faut un masque par image, dans le même ordre.`;
  if (masks.some((m) => m.type !== "image/png"))
    return "Les masques doivent être en PNG : un autre format altère les couleurs.";
  return null;
}

/** Adds the colours of a mask (RGBA pixels) to the counts; returns its number of pixels. */
export function countColors(data: Uint8ClampedArray, counts: Map<number, number>): number {
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i] as number;
    const g = data[i + 1] as number;
    const b = data[i + 2] as number;
    if ((data[i + 3] as number) < 128 || isBackground(r, g, b)) continue;
    const key = packRgb(r, g, b);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return data.length / 4;
}

export type MaskColor = { hex: string; share: number };

/**
 * The lot colours of the sequence, most present first, and the share of the
 * pixels in other colours (anti-aliased edges: the masks were smoothed).
 */
export function lotColors(
  counts: Map<number, number>,
  totalPixels: number,
): { colors: MaskColor[]; noise: number } {
  const colors: MaskColor[] = [];
  let noise = 0;
  for (const [rgb, n] of counts) {
    const share = n / totalPixels;
    if (share >= MIN_SHARE) colors.push({ hex: hexOf(rgb), share });
    else noise += share;
  }
  colors.sort((a, b) => b.share - a.share);
  return { colors, noise };
}

/** Colour of the mask pixel at (x, y), or null on the background or outside. */
export function colorAt(
  mask: { data: Uint8ClampedArray; width: number; height: number },
  x: number,
  y: number,
): number | null {
  const px = Math.floor(x);
  const py = Math.floor(y);
  if (px < 0 || py < 0 || px >= mask.width || py >= mask.height) return null;
  const i = (py * mask.width + px) * 4;
  const r = mask.data[i] as number;
  const g = mask.data[i + 1] as number;
  const b = mask.data[i + 2] as number;
  return isBackground(r, g, b) ? null : packRgb(r, g, b);
}

/**
 * Pixels of an overlay (RGBA, same size as the mask): each listed colour of
 * the mask painted with its tint, everything else transparent.
 */
export function tintPixels(
  mask: { data: Uint8ClampedArray; width: number; height: number },
  tints: Map<number, readonly [number, number, number, number]>,
): Uint8ClampedArray<ArrayBuffer> {
  const out = new Uint8ClampedArray(mask.data.length);
  const { data } = mask;
  for (let i = 0; i < data.length; i += 4) {
    const tint = tints.get(
      packRgb(data[i] as number, data[i + 1] as number, data[i + 2] as number),
    );
    if (!tint) continue;
    out[i] = tint[0];
    out[i + 1] = tint[1];
    out[i + 2] = tint[2];
    out[i + 3] = tint[3];
  }
  return out;
}

/** "#c9a35b" and an opacity (0…1) → RGBA tint. */
export function tintOf(hex: string, alpha: number): readonly [number, number, number, number] {
  const rgb = rgbOf(hex);
  return [(rgb >> 16) & 255, (rgb >> 8) & 255, rgb & 255, Math.round(alpha * 255)];
}

/* Public viewer: each mask becomes a label map (one byte per pixel: 0 for
   nothing, k for the k-th lot colour), four times lighter than its pixels,
   then the lots are painted from it in the colour of their status. */

/** Labels of a mask: 1…n for the listed colours (in that order), 0 elsewhere. */
export function labelMap(
  mask: { data: Uint8ClampedArray; width: number; height: number },
  colors: readonly number[],
): Uint8Array {
  const index = new Map(colors.map((rgb, i) => [rgb, i + 1]));
  const out = new Uint8Array(mask.width * mask.height);
  const { data } = mask;
  for (let p = 0, i = 0; p < out.length; p++, i += 4) {
    out[p] =
      index.get(packRgb(data[i] as number, data[i + 1] as number, data[i + 2] as number)) ?? 0;
  }
  return out;
}

/** How a label is painted: a flat tint, or stripes (reserved lots). */
export type Paint = { rgba: readonly [number, number, number, number]; stripes?: number };

/**
 * Overlay pixels from a label map: label k painted with paints[k] (index 0
 * is never painted). Stripes: diagonal bands, `stripes` pixels wide, at full
 * opacity on one band out of two and a quarter of it on the other.
 */
export function paintLabels(
  labels: Uint8Array,
  width: number,
  paints: readonly (Paint | null)[],
  out: Uint8ClampedArray,
): void {
  out.fill(0);
  for (let p = 0; p < labels.length; p++) {
    const k = labels[p] as number;
    if (k === 0) continue;
    const paint = paints[k];
    if (!paint) continue;
    const i = p * 4;
    let alpha = paint.rgba[3];
    if (paint.stripes) {
      const x = p % width;
      const y = (p - x) / width;
      if (Math.floor((x + y) / paint.stripes) % 2 === 1) alpha = Math.round(alpha / 4);
    }
    out[i] = paint.rgba[0];
    out[i + 1] = paint.rgba[1];
    out[i + 2] = paint.rgba[2];
    out[i + 3] = alpha;
  }
}

export type LabelCenter = { x: number; y: number; pixels: number };

/**
 * Where to write the number of each lot on a view: for label k, the middle
 * of its pixels (0…1 of the width and height), moved onto the nearest pixel
 * of the lot when that middle falls outside it (an L-shaped lot). Null for
 * the labels absent from the view or smaller than `minPixels`.
 */
export function labelCenters(
  labels: Uint8Array,
  width: number,
  labelCount: number,
  minPixels = 1,
): (LabelCenter | null)[] {
  const height = labels.length / width;
  const sx = new Float64Array(labelCount + 1);
  const sy = new Float64Array(labelCount + 1);
  const n = new Uint32Array(labelCount + 1);
  for (let p = 0; p < labels.length; p++) {
    const k = labels[p] as number;
    if (k === 0 || k > labelCount) continue;
    const x = p % width;
    sx[k] = (sx[k] as number) + x;
    sy[k] = (sy[k] as number) + (p - x) / width;
    n[k] = (n[k] as number) + 1;
  }
  const centers: (LabelCenter | null)[] = [null];
  const astray: number[] = [];
  for (let k = 1; k <= labelCount; k++) {
    const count = n[k] as number;
    if (count < minPixels) {
      centers.push(null);
      continue;
    }
    const cx = (sx[k] as number) / count;
    const cy = (sy[k] as number) / count;
    centers.push({ x: cx, y: cy, pixels: count });
    if (labels[Math.round(cy) * width + Math.round(cx)] !== k) astray.push(k);
  }
  if (astray.length > 0) {
    // Second pass, only for the lots whose middle is outside them.
    const best = new Map(astray.map((k) => [k, { d: Infinity, x: 0, y: 0 }]));
    for (let p = 0; p < labels.length; p++) {
      const b = best.get(labels[p] as number);
      if (!b) continue;
      const c = centers[labels[p] as number] as LabelCenter;
      const x = p % width;
      const y = (p - x) / width;
      const d = (x - c.x) ** 2 + (y - c.y) ** 2;
      if (d < b.d) Object.assign(b, { d, x, y });
    }
    for (const [k, b] of best) {
      const c = centers[k] as LabelCenter;
      centers[k] = { x: b.x, y: b.y, pixels: c.pixels };
    }
  }
  return centers.map((c) =>
    c ? { x: (c.x + 0.5) / width, y: (c.y + 0.5) / height, pixels: c.pixels } : null,
  );
}

/** A mask colour of a view and the lot it is linked to. */
export type LinkedColor = { hex: string; lot_id: string | null };

/**
 * Lot of each colour of a new sequence: the one it had on this view, else the
 * one it has on the other views (when they agree), each lot once per view.
 */
export function carryLinks(
  colors: readonly { hex: string }[],
  sameView: readonly LinkedColor[],
  otherViews: readonly LinkedColor[],
): { lots: (string | null)[]; carried: number } {
  const own = new Map(sameView.filter((c) => c.lot_id).map((c) => [c.hex, c.lot_id as string]));
  const elsewhere = new Map<string, string | null>();
  for (const c of otherViews) {
    if (!c.lot_id) continue;
    const known = elsewhere.get(c.hex);
    // Two views giving two lots to one colour: no guess.
    elsewhere.set(c.hex, known === undefined || known === c.lot_id ? c.lot_id : null);
  }
  // The links of this view first, then those found elsewhere for the lots still free.
  const lots = colors.map((c) => own.get(c.hex) ?? null);
  const used = new Set(lots.filter((l): l is string => l !== null));
  let carried = 0;
  colors.forEach((c, i) => {
    const lot = elsewhere.get(c.hex);
    if (lots[i] || !lot || used.has(lot)) return;
    lots[i] = lot;
    used.add(lot);
    carried += 1;
  });
  return { lots, carried };
}
