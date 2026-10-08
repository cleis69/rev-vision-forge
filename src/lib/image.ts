import { fitWithin } from "./geometry";

/* Plans are resized and converted in the browser before upload: WebP when the
   browser can encode it, JPEG otherwise (older Safari). */

export const PLAN_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_SOURCE_BYTES = 50 * 1024 * 1024;
// Largest canvas that every browser accepts (iOS Safari: 16.7 megapixels).
const MAX_PIXELS = 16_000_000;

export class ImageError extends Error {}

export type EncodedImage = { blob: Blob; width: number; height: number; extension: "webp" | "jpg" };

export async function decodeImage(file: File): Promise<ImageBitmap> {
  if (!PLAN_TYPES.includes(file.type)) {
    throw new ImageError(
      "Format non pris en charge : JPEG, PNG ou WebP. Pour un plan en PDF, exportez d'abord la page en image.",
    );
  }
  if (file.size > MAX_SOURCE_BYTES) throw new ImageError("Image trop lourde : 50 Mo au maximum.");
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

/** The image reduced to fit in `maxSide` pixels. */
export async function encodeImage(
  source: ImageBitmap,
  maxSide: number,
  quality = 0.85,
): Promise<EncodedImage> {
  const { width, height } = fitWithin(source.width, source.height, maxSide, MAX_PIXELS);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new ImageError("Votre navigateur ne peut pas préparer l'image.");
  context.imageSmoothingQuality = "high";
  context.drawImage(source, 0, 0, width, height);

  const webp = await toBlob(canvas, "image/webp", quality);
  if (webp && webp.type === "image/webp") return { blob: webp, width, height, extension: "webp" };

  // JPEG has no transparency: white background under the image.
  context.globalCompositeOperation = "destination-over";
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);
  const jpeg = await toBlob(canvas, "image/jpeg", quality);
  if (!jpeg) throw new ImageError("Votre navigateur ne peut pas préparer l'image.");
  return { blob: jpeg, width, height, extension: "jpg" };
}
