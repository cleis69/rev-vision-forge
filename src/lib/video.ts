import { encodeImage, ImageError, type EncodedImage } from "./image";

/* Videos are sent as they are (no conversion in the browser): the browser
   only reads their size and duration, and takes a still from them for the
   poster shown before they play. */

export const VIDEO_TYPES = ["video/mp4", "video/webm"];
export const DOCUMENT_TYPES = ["application/pdf"];
// The largest file the storage of the project accepts.
export const MAX_FILE_BYTES = 50 * 1024 * 1024;
export const POSTER_WIDTH = 1280;

export class VideoError extends Error {}

export type VideoInfo = { width: number; height: number; duration: number; poster: EncodedImage };

const UNREADABLE =
  "Vidéo illisible par ce navigateur : exportez-la en MP4 (H.264) ou en WebM, puis réessayez.";

function once(target: HTMLVideoElement, event: string, ms = 20_000) {
  return new Promise<void>((resolve, reject) => {
    const timer = window.setTimeout(() => done(new VideoError(UNREADABLE)), ms);
    const done = (error?: Error) => {
      window.clearTimeout(timer);
      target.removeEventListener(event, ok);
      target.removeEventListener("error", failed);
      if (error) reject(error);
      else resolve();
    };
    const ok = () => done();
    const failed = () => done(new VideoError(UNREADABLE));
    target.addEventListener(event, ok);
    target.addEventListener("error", failed);
  });
}

export function checkFile(file: File, types: readonly string[], what: string) {
  if (!types.includes(file.type)) throw new VideoError(`Format non pris en charge pour ${what}.`);
  if (file.size > MAX_FILE_BYTES)
    throw new VideoError(
      `Fichier trop lourd : ${MAX_FILE_BYTES / 1024 / 1024} Mo au maximum. Réduisez-le (par exemple en 1080p) puis réessayez.`,
    );
}

/** Size, duration and poster of a video file. */
export async function readVideo(file: File): Promise<VideoInfo> {
  checkFile(file, VIDEO_TYPES, "une vidéo (MP4 ou WebM)");
  const url = URL.createObjectURL(file);
  const video = document.createElement("video");
  video.muted = true;
  video.playsInline = true;
  video.preload = "auto";
  try {
    const loaded = once(video, "loadeddata");
    video.src = url;
    await loaded;
    if (!video.videoWidth || !video.videoHeight) throw new VideoError(UNREADABLE);
    // A little after the start: the first image is often black.
    const seeked = once(video, "seeked");
    video.currentTime = Math.min(1, (video.duration || 0) / 3);
    await seeked;
    const bitmap = await createImageBitmap(video);
    try {
      const poster = await encodeImage(bitmap, POSTER_WIDTH, 0.8);
      return {
        width: video.videoWidth,
        height: video.videoHeight,
        duration: Number.isFinite(video.duration) ? video.duration : 0,
        poster,
      };
    } finally {
      bitmap.close();
    }
  } catch (error) {
    if (error instanceof VideoError || error instanceof ImageError) throw error;
    throw new VideoError(UNREADABLE);
  } finally {
    video.removeAttribute("src");
    video.load();
    URL.revokeObjectURL(url);
  }
}

/** "1:05" */
export function formatDuration(seconds: number) {
  const s = Math.max(0, Math.round(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/** "2,4 Mo" */
export function formatSize(bytes: number) {
  const mb = bytes / 1024 / 1024;
  return mb >= 1
    ? `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 }).format(mb)} Mo`
    : `${Math.max(1, Math.round(bytes / 1024))} Ko`;
}
