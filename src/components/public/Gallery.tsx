import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { mediaImage, type MediaItem } from "@/lib/app/media";

/** Photos of the programme, opened full screen with arrows (keyboard too). */
export function Gallery({ photos, name }: { photos: MediaItem[]; name: string }) {
  const [index, setIndex] = useState<number | null>(null);
  const current = index === null ? null : photos[index];
  const go = (step: number) =>
    setIndex((i) => (i === null ? i : (i + step + photos.length) % photos.length));

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <>
      <ul className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-3">
        {photos.map((photo, i) => {
          const image = mediaImage(photo);
          return (
            <li key={photo.id} className={i === 0 ? "col-span-2 lg:col-span-2 lg:row-span-2" : ""}>
              <button
                type="button"
                onClick={() => setIndex(i)}
                className="group relative block aspect-[4/3] h-full w-full overflow-hidden rounded-xl bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                aria-label={`Agrandir : ${image.caption || `photo ${i + 1} de ${name}`}`}
              >
                <img
                  src={image.thumb}
                  srcSet={`${image.thumb} 800w, ${image.large} 2048w`}
                  sizes={
                    i === 0 ? "(min-width: 1024px) 66vw, 100vw" : "(min-width: 1024px) 33vw, 50vw"
                  }
                  alt=""
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03] motion-reduce:transition-none"
                />
              </button>
            </li>
          );
        })}
      </ul>

      <Dialog
        open={current !== null && current !== undefined}
        onOpenChange={(open) => !open && setIndex(null)}
      >
        <DialogContent className="max-w-[min(96vw,1400px)] border-white/10 bg-black p-0 sm:rounded-2xl">
          {current ? (
            <figure className="relative">
              <DialogTitle className="sr-only">{name}</DialogTitle>
              <DialogDescription className="sr-only">
                Photo {(index ?? 0) + 1} sur {photos.length}
              </DialogDescription>
              <img
                src={mediaImage(current).large}
                alt={mediaImage(current).caption || `Photo ${(index ?? 0) + 1} de ${name}`}
                className="max-h-[86svh] w-full rounded-2xl object-contain"
              />
              <figcaption className="flex items-center justify-between gap-4 px-5 py-3 text-sm text-white/75">
                <span>{mediaImage(current).caption}</span>
                <span className="tabular-nums text-white/45">
                  {(index ?? 0) + 1} / {photos.length}
                </span>
              </figcaption>
              {photos.length > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={() => go(-1)}
                    aria-label="Photo précédente"
                    className="absolute left-3 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-black/60 text-white backdrop-blur hover:bg-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                  >
                    <ChevronLeft className="size-5" aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={() => go(1)}
                    aria-label="Photo suivante"
                    className="absolute right-3 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-black/60 text-white backdrop-blur hover:bg-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                  >
                    <ChevronRight className="size-5" aria-hidden />
                  </button>
                </>
              ) : null}
            </figure>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
