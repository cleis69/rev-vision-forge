import { labelMap } from "./orbit-mask";

/* Masks of the orbital view, read pixel by pixel in the browser. Fetched as
   files (the bucket allows any origin), decoded without colour management so
   the colours stay exact. The promoter space keeps their pixels (loadMask);
   the public viewer keeps only their label maps (loadLabels), 4 times lighter. */

export type MaskData = { data: Uint8ClampedArray; width: number; height: number };

const cache = new Map<string, Promise<MaskData>>();

async function read(url: string): Promise<MaskData> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Masque introuvable (${res.status})`);
  const bitmap = await createImageBitmap(await res.blob(), {
    colorSpaceConversion: "none",
    premultiplyAlpha: "none",
  });
  try {
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) throw new Error("Canvas indisponible");
    context.drawImage(bitmap, 0, 0);
    const { data } = context.getImageData(0, 0, bitmap.width, bitmap.height);
    return { data, width: bitmap.width, height: bitmap.height };
  } finally {
    bitmap.close();
  }
}

export function loadMask(url: string): Promise<MaskData> {
  let mask = cache.get(url);
  if (!mask) {
    mask = read(url);
    cache.set(url, mask);
    // A failed read can be tried again.
    mask.catch(() => cache.delete(url));
  }
  return mask;
}

export type LabelData = { labels: Uint8Array; width: number; height: number };

/** Label map of a mask for the given lot colours (see labelMap); its pixels are not kept. */
export async function loadLabels(url: string, colors: readonly number[]): Promise<LabelData> {
  const mask = await read(url);
  return { labels: labelMap(mask, colors), width: mask.width, height: mask.height };
}
