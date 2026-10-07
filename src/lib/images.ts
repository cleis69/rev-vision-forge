/*
 * Site photos ship as WebP in several widths (src/assets/<name>-<width>.webp,
 * made from the .jpg of the same name), so each screen downloads the size it
 * needs.
 */
const FILES = import.meta.glob<string>("../assets/*-*.webp", {
  eager: true,
  query: "?url",
  import: "default",
});

export type PhotoName =
  | "hero-villa"
  | "work-architecture"
  | "work-branding"
  | "work-drone"
  | "work-interior"
  | "work-matterport"
  | "work-photography"
  | "work-video";

export type Photo = { src: string; srcSet: string };

export function photo(name: PhotoName): Photo {
  const variants = Object.entries(FILES)
    .map(([path, url]) => {
      const m = /\/([\w-]+)-(\d+)\.webp$/.exec(path);
      return m && m[1] === name ? { width: Number(m[2]), url } : null;
    })
    .filter((v): v is { width: number; url: string } => v !== null)
    .sort((a, b) => a.width - b.width);
  const fallback = variants[1] ?? variants[0];
  if (!fallback) throw new Error(`Missing photo: ${name}`);
  return {
    src: fallback.url,
    srcSet: variants.map((v) => `${v.url} ${v.width}w`).join(", "),
  };
}
