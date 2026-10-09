import { useEffect, useRef, useState, type PointerEvent } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { mediaImage, mediaVideo, type MediaItem } from "@/lib/app/media";
import { useCopy } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/* Full-screen viewer of photos, plans and videos: arrows, keyboard, swipe on
   a phone; a video plays with its sound, the others are paused. */

const COPY = {
  fr: {
    position: (n: number, count: number) => `${n} sur ${count}`,
    close: "Fermer",
    video: (title: string) => `Vidéo, ${title}`,
    plan: (title: string) => `Plan, ${title}`,
    photo: (title: string) => `Photo, ${title}`,
    previous: "Précédent",
    next: "Suivant",
  },
  en: {
    position: (n: number, count: number) => `${n} of ${count}`,
    close: "Close",
    video: (title: string) => `Video, ${title}`,
    plan: (title: string) => `Floor plan, ${title}`,
    photo: (title: string) => `Photo, ${title}`,
    previous: "Previous",
    next: "Next",
  },
};

export function MediaViewer({
  items,
  index,
  onIndexChange,
  title,
}: {
  items: MediaItem[];
  /** Item shown; null when closed. */
  index: number | null;
  onIndexChange: (index: number | null) => void;
  /** For screen readers: the programme, or the type of lot. */
  title: string;
}) {
  const copy = useCopy(COPY);
  const current = index === null ? undefined : items[index];
  const count = items.length;
  const go = (step: number) =>
    onIndexChange(index === null ? null : (index + step + count) % count);
  const goRef = useRef(go);
  goRef.current = go;

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goRef.current(1);
      if (e.key === "ArrowLeft") goRef.current(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index]);

  // A horizontal swipe changes the item.
  const swipe = useRef<{ x: number; y: number; id: number } | null>(null);
  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse") return;
    swipe.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
  };
  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    const s = swipe.current;
    swipe.current = null;
    if (!s || s.id !== e.pointerId || count < 2) return;
    const dx = e.clientX - s.x;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(e.clientY - s.y) * 1.5) go(dx < 0 ? 1 : -1);
  };

  const caption = current
    ? current.kind === "video"
      ? mediaVideo(current).caption
      : mediaImage(current).caption
    : "";

  return (
    <Dialog open={Boolean(current)} onOpenChange={(open) => !open && onIndexChange(null)}>
      <DialogContent
        className="flex h-[100svh] max-h-none w-screen max-w-none flex-col gap-0 rounded-none border-0 bg-black/95 p-0 sm:rounded-none [&>button:last-child]:hidden"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      >
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <DialogDescription className="sr-only">
          {copy.position((index ?? 0) + 1, count)}
        </DialogDescription>
        <div className="flex h-14 shrink-0 items-center justify-between gap-4 px-4 text-sm text-white/70 sm:px-6">
          <span className="tabular-nums">
            {(index ?? 0) + 1} / {count}
          </span>
          <button
            type="button"
            onClick={() => onIndexChange(null)}
            aria-label={copy.close}
            className="grid size-10 place-items-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>

        <div className="relative grid min-h-0 flex-1 place-items-center px-2 sm:px-16">
          {current ? <Shown key={current.id} item={current} title={title} /> : null}
          {count > 1 ? (
            <>
              <Arrow side="left" onClick={() => go(-1)} />
              <Arrow side="right" onClick={() => go(1)} />
            </>
          ) : null}
        </div>

        <p className="min-h-14 shrink-0 px-6 py-4 text-center text-sm text-white/75">{caption}</p>
      </DialogContent>
    </Dialog>
  );
}

function Shown({ item, title }: { item: MediaItem; title: string }) {
  const copy = useCopy(COPY);
  const [loaded, setLoaded] = useState(false);
  if (item.kind === "video") {
    const video = mediaVideo(item);
    return (
      <video
        src={video.src}
        poster={video.poster ?? undefined}
        controls
        autoPlay
        playsInline
        className="max-h-full max-w-full rounded-lg bg-black"
        aria-label={video.caption || copy.video(title)}
      />
    );
  }
  const image = mediaImage(item);
  return (
    <>
      {/* The thumbnail at once, the large image over it once loaded. */}
      <img
        src={image.thumb}
        alt=""
        aria-hidden
        className={cn(
          "absolute max-h-full max-w-[calc(100%-1rem)] object-contain blur-sm transition-opacity sm:max-w-[calc(100%-8rem)]",
          loaded && "opacity-0",
          item.kind === "plan" && "bg-white",
        )}
      />
      <img
        src={image.large}
        alt={image.caption || (item.kind === "plan" ? copy.plan(title) : copy.photo(title))}
        onLoad={() => setLoaded(true)}
        className={cn(
          "relative max-h-full max-w-full object-contain transition-opacity duration-300",
          loaded ? "opacity-100" : "opacity-0",
          item.kind === "plan" && "rounded-lg bg-white",
        )}
      />
    </>
  );
}

function Arrow({ side, onClick }: { side: "left" | "right"; onClick: () => void }) {
  const copy = useCopy(COPY);
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === "left" ? copy.previous : copy.next}
      className={cn(
        "absolute top-1/2 hidden size-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 sm:grid",
        side === "left" ? "left-3" : "right-3",
      )}
    >
      <Icon className="size-6" aria-hidden />
    </button>
  );
}
