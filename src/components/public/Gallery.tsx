import { useMemo, useState } from "react";
import { Play } from "lucide-react";

import { mediaImage, mediaVideo, type MediaItem } from "@/lib/app/media";
import { formatDuration } from "@/lib/video";
import { cn } from "@/lib/utils";
import { MediaViewer } from "./MediaViewer";

/* Gallery of the programme: photos and videos in a mosaic (the first one
   large), filters Extérieurs / Intérieurs / Vidéos when there is something
   to sort, a dozen shown and the rest on demand, all opened full screen. */

type Filter = "tout" | "exterieur" | "interieur" | "video";
const LABELS: Record<Filter, string> = {
  tout: "Tout",
  exterieur: "Extérieurs",
  interieur: "Intérieurs",
  video: "Vidéos",
};
const FIRST_SHOWN = 12;

const matches = (item: MediaItem, filter: Filter) =>
  filter === "tout" || (filter === "video" ? item.kind === "video" : item.meta.category === filter);

export function Gallery({ items, name }: { items: MediaItem[]; name: string }) {
  const [filter, setFilter] = useState<Filter>("tout");
  const [all, setAll] = useState(false);
  const [open, setOpen] = useState<number | null>(null);

  // Filters worth showing: those that leave something out.
  const filters = useMemo(() => {
    const present = (["exterieur", "interieur", "video"] as const).filter((f) => {
      const n = items.filter((m) => matches(m, f)).length;
      return n > 0 && n < items.length;
    });
    return present.length ? (["tout", ...present] as Filter[]) : [];
  }, [items]);

  const shown = items.filter((m) => matches(m, filter));
  const visible = all ? shown : shown.slice(0, FIRST_SHOWN);

  return (
    <>
      {filters.length > 0 ? (
        <div
          role="group"
          aria-label="Filtrer la galerie"
          className="-mx-5 mb-5 flex gap-2 overflow-x-auto px-5 [scrollbar-width:none] sm:mx-0 sm:px-0"
        >
          {filters.map((f) => {
            const active = f === filter;
            return (
              <button
                key={f}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  setFilter(f);
                  setAll(false);
                }}
                className={cn(
                  "inline-flex h-9 shrink-0 items-center gap-2 rounded-full border px-4 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70",
                  active
                    ? "border-white bg-white text-black"
                    : "border-white/15 text-white/75 hover:border-white/35 hover:text-white",
                )}
              >
                {LABELS[f]}
                <span className={cn("tabular-nums", active ? "text-black/55" : "text-white/45")}>
                  {items.filter((m) => matches(m, f)).length}
                </span>
              </button>
            );
          })}
        </div>
      ) : null}

      <ul className="grid auto-rows-[8.5rem] grid-cols-2 gap-2 [grid-auto-flow:dense] sm:auto-rows-[11rem] lg:grid-cols-4">
        {visible.map((item, i) => (
          <li
            key={item.id}
            className={cn(
              // A rhythm of large and small tiles, the first one larger.
              i === 0 && "col-span-2 row-span-2",
              i > 0 && i % 7 === 3 && "row-span-2",
              i > 0 && i % 7 === 6 && "col-span-2",
            )}
          >
            <Tile item={item} index={i} name={name} onOpen={() => setOpen(i)} large={i === 0} />
          </li>
        ))}
      </ul>

      {shown.length > visible.length ? (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={() => setAll(true)}
            className="inline-flex h-11 items-center rounded-full border border-white/20 px-6 text-sm font-medium text-white transition-colors hover:border-white/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          >
            Tout voir ({shown.length})
          </button>
        </div>
      ) : null}

      <MediaViewer items={shown} index={open} onIndexChange={setOpen} title={name} />
    </>
  );
}

function Tile({
  item,
  index,
  name,
  large,
  onOpen,
}: {
  item: MediaItem;
  index: number;
  name: string;
  large: boolean;
  onOpen: () => void;
}) {
  const video = item.kind === "video" ? mediaVideo(item) : null;
  const image = video ? null : mediaImage(item);
  const caption = video?.caption || image?.caption || "";
  const still = image?.thumb ?? video?.poster ?? null;
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group relative block h-full w-full overflow-hidden rounded-xl bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
      aria-label={`${video ? "Lire la vidéo" : "Agrandir"} : ${caption || `${video ? "vidéo" : "photo"} ${index + 1} de ${name}`}`}
    >
      {still ? (
        <img
          src={still}
          srcSet={image ? `${image.thumb} 800w, ${image.large} 2048w` : undefined}
          sizes={large ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 25vw, 50vw"}
          alt=""
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03] motion-reduce:transition-none"
        />
      ) : null}
      {video ? (
        <span className="absolute inset-0 grid place-items-center bg-black/20 transition-colors group-hover:bg-black/10">
          <span className="grid size-14 place-items-center rounded-full bg-black/55 text-white backdrop-blur">
            <Play className="ml-0.5 size-6 fill-current" aria-hidden />
          </span>
          {video.duration ? (
            <span className="absolute bottom-2 right-2 rounded-md bg-black/65 px-1.5 py-0.5 text-[11px] tabular-nums text-white">
              {formatDuration(video.duration)}
            </span>
          ) : null}
        </span>
      ) : null}
      {caption && large ? (
        <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-4 pb-3 pt-10 text-left text-sm text-white/90">
          {caption}
        </span>
      ) : null}
    </button>
  );
}
