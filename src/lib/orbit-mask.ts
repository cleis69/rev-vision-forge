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
