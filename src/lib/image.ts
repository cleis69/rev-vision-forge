import { fitWithin } from "./geometry";

/* Images are sent as they are when small enough (asSent): a new compression
   loses quality. Otherwise they are resized and converted in the browser
   before upload: WebP when the browser can encode it, JPEG otherwise (older
   Safari), or PNG for a logo, which keeps its transparent background. */

export const PLAN_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_SOURCE_BYTES = 50 * 1024 * 1024;
// Largest canvas that every browser accepts (iOS Safari: 16.7 megapixels).
export const MAX_PIXELS = 16_000_000;

export class ImageError extends Error {}

export type EncodedImage = {
  blob: Blob;
  width: number;
  height: number;
  extension: "webp" | "jpg" | "png";
};

export async function decodeImage(file: File, maxBytes = MAX_SOURCE_BYTES): Promise<ImageBitmap> {
  if (!PLAN_TYPES.includes(file.type)) {
    throw new ImageError(
      "Format non pris en charge : JPEG, PNG ou WebP. Pour un plan en PDF, exportez d'abord la page en image.",
    );
  }
  if (file.size > maxBytes) {
    throw new ImageError(
      `Image trop lourde : ${Math.round(maxBytes / 1024 / 1024)} Mo au maximum.`,
    );
  }
  try {
    return await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new ImageError(
      "Impossible de lire cette image. Essayez de l'enregistrer en JPEG ou en PNG.",
    );
  }
}

const toBlob = (canvas: HTMLCanvasElement, type: string, quality: number) =>
  new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));

const SENT_AS_IS: Record<string, EncodedImage["extension"]> = {
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/png": "png",
};

/**
 * The file as sent, when it is small enough to be shown as it is: no new
 * compression, the promoter's image stays exactly as it was (null otherwise).
 */
export function asSent(
  file: File,
  bitmap: ImageBitmap,
  maxSide: number,
  maxBytes: number,
): EncodedImage | null {
  const extension = SENT_AS_IS[file.type];
  if (!extension || Math.max(bitmap.width, bitmap.height) > maxSide || file.size > maxBytes)
    return null;
  return { blob: file, width: bitmap.width, height: bitmap.height, extension };
}

/** The image reduced to fit in `maxSide` pixels (and `maxPixels` in all). */
export async function encodeImage(
  source: ImageBitmap,
  maxSide: number,
  quality = 0.85,
  fallback: "jpg" | "png" = "jpg",
  maxPixels = MAX_PIXELS,
): Promise<EncodedImage> {
  const { width, height } = fitWithin(source.width, source.height, maxSide, maxPixels);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new ImageError("Votre navigateur ne peut pas préparer l'image.");
  context.imageSmoothingQuality = "high";
  context.drawImage(source, 0, 0, width, height);

  const webp = await toBlob(canvas, "image/webp", quality);
  if (webp && webp.type === "image/webp") return { blob: webp, width, height, extension: "webp" };
  if (fallback === "png") {
    const png = await toBlob(canvas, "image/png", 1);
    if (!png) throw new ImageError("Votre navigateur ne peut pas préparer l'image.");
    return { blob: png, width, height, extension: "png" };
  }

  // JPEG has no transparency: white background under the image.
  context.globalCompositeOperation = "destination-over";
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);
  const jpeg = await toBlob(canvas, "image/jpeg", quality);
  if (!jpeg) throw new ImageError("Votre navigateur ne peut pas préparer l'image.");
  return { blob: jpeg, width, height, extension: "jpg" };
}
