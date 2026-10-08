/* Sizes of the images resized in the browser before upload. */

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
