import { useState } from "react";
import { FileDown, Play } from "lucide-react";

import { mediaDocument, mediaImage, mediaVideo, type MediaItem } from "@/lib/app/media";
import { formatSize } from "@/lib/video";
import { MediaViewer } from "./MediaViewer";

/** Plans, videos and brochure of a lot (its own, and those of its type), in its sheet. */
export function LotFiles({
  plans,
  videos,
  documents,
  title,
}: {
  plans: MediaItem[];
  videos: MediaItem[];
  documents: MediaItem[];
  title: string;
}) {
  const [viewing, setViewing] = useState<{ items: MediaItem[]; index: number } | null>(null);
  if (plans.length + videos.length + documents.length === 0) return null;
  const tiles = [...plans, ...videos];
  return (
    <div className="space-y-3">
      {tiles.length > 0 ? (
        <ul className="flex gap-2 overflow-x-auto [scrollbar-width:none]">
          {tiles.map((item, i) => {
            const video = item.kind === "video" ? mediaVideo(item) : null;
            const still = video ? video.poster : mediaImage(item).thumb;
            return (
              <li key={item.id} className="shrink-0">
                <button
                  type="button"
                  onClick={() => setViewing({ items: tiles, index: i })}
                  className="relative block h-20 w-28 overflow-hidden rounded-lg border border-white/10 bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                  aria-label={video ? "Lire la vidéo" : `Agrandir le plan ${i + 1}`}
                >
                  {still ? (
                    <img
                      src={still}
                      alt=""
                      loading="lazy"
                      className={
                        video
                          ? "absolute inset-0 h-full w-full object-cover"
                          : "absolute inset-0 h-full w-full object-contain"
                      }
                    />
                  ) : null}
                  {video ? (
                    <span className="absolute inset-0 grid place-items-center bg-black/30 text-white">
                      <Play className="size-5 fill-current" aria-hidden />
                    </span>
                  ) : (
                    <span className="absolute bottom-1 left-1 rounded bg-black/65 px-1.5 py-0.5 text-[10px] text-white">
                      Plan
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
      {documents.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {documents.map((doc) => {
            const file = mediaDocument(doc);
            return (
              <a
                key={doc.id}
                href={file.url}
                download={file.name}
                target="_blank"
                rel="noopener"
                className="inline-flex h-10 items-center gap-2 rounded-full border border-white/20 px-4 text-sm text-white transition-colors hover:border-white/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
              >
                <FileDown className="size-4" aria-hidden />
                {file.caption || "Brochure"}
                {file.size ? (
                  <span className="text-xs text-white/50">PDF · {formatSize(file.size)}</span>
                ) : null}
              </a>
            );
          })}
        </div>
      ) : null}
      <MediaViewer
        items={viewing?.items ?? []}
        index={viewing?.index ?? null}
        onIndexChange={(index) => setViewing((v) => (v && index !== null ? { ...v, index } : null))}
        title={title}
      />
    </div>
  );
}
