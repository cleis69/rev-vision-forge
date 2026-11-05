import { useEffect, useRef, useState } from "react";
import { SkipForward } from "lucide-react";

import { mediaVideo, type MediaItem } from "@/lib/app/media";
import type { ViewFit } from "./OrbitViewer";
import { useCopy } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/* Camera moves of the 3D views (see lib/app/transitions.ts): when a visitor
   picks a view that has one, the video plays over the view while it loads,
   then fades into it; the main view's plays once when the page opens. Never
   with reduced motion or data saving, and a video that does not start soon
   is skipped. */

const COPY = {
  fr: { skip: "Passer" },
  en: { skip: "Skip" },
};

const START_TIMEOUT_MS = 2500;
const FADE_MS = 450;

const motionAllowed = () => {
  if (typeof window === "undefined") return false;
  const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const saving = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
    ?.saveData;
  return !still && !saving;
};

type Playing = { src: string; poster: string | null; id: number };

export function useCameraMove({
  transitions,
  introViewId,
  sessionKey,
  enabled,
  skipClassName,
  fit = null,
}: {
  transitions: Record<string, MediaItem>;
  /** View shown first: its move plays when the page opens (once per visit). */
  introViewId: string | null;
  /** Remembers, for this tab, that the opening move was seen. */
  sessionKey: string;
  enabled: boolean;
  /** Where the Skip button sits, clear of the buttons laid over the view. */
  skipClassName?: string;
  /** How the view under it sits in the box: the video ends on exactly the same picture. */
  fit?: ViewFit | null;
}) {
  const copy = useCopy(COPY);
  const [playing, setPlaying] = useState<Playing | null>(null);
  const [leaving, setLeaving] = useState(false);
  const fade = useRef(0);
  const guard = useRef(0);
  const counter = useRef(0);

  const end = () => {
    window.clearTimeout(guard.current);
    setLeaving(true);
    window.clearTimeout(fade.current);
    fade.current = window.setTimeout(() => setPlaying(null), FADE_MS);
  };

  const play = (viewId: string) => {
    const move = transitions[viewId];
    if (!enabled || !move || !motionAllowed()) return;
    const video = mediaVideo(move);
    window.clearTimeout(fade.current);
    window.clearTimeout(guard.current);
    setLeaving(false);
    setPlaying({ src: video.src, poster: video.poster, id: ++counter.current });
    // Slow network: the view rather than a frozen video.
    guard.current = window.setTimeout(end, START_TIMEOUT_MS);
  };

  // The opening move, once per visit of the programme in this tab.
  const introDone = useRef(false);
  useEffect(() => {
    if (introDone.current || !introViewId) return;
    introDone.current = true;
    try {
      if (window.sessionStorage.getItem(sessionKey)) return;
      window.sessionStorage.setItem(sessionKey, "1");
    } catch {
      /* storage unavailable: played on each opening */
    }
    play(introViewId);
    // At the first render only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The moves are fetched in advance, a few seconds after the page opened.
  const urls = enabled
    ? Object.values(transitions)
        .map((m) => mediaVideo(m).src)
        .join("|")
    : "";
  useEffect(() => {
    if (!urls || !motionAllowed()) return;
    const links: HTMLLinkElement[] = [];
    const timer = window.setTimeout(() => {
      for (const href of urls.split("|")) {
        const link = document.createElement("link");
        link.rel = "prefetch";
        link.as = "video";
        link.href = href;
        document.head.append(link);
        links.push(link);
      }
    }, 3000);
    return () => {
      window.clearTimeout(timer);
      for (const l of links) l.remove();
    };
  }, [urls]);

  useEffect(
    () => () => {
      window.clearTimeout(fade.current);
      window.clearTimeout(guard.current);
    },
    [],
  );

  const layer = playing ? (
    <div
      // A tap on the video skips it too.
      onClick={end}
      className={cn(
        "absolute inset-0 z-[5] transition-opacity ease-out",
        // A view shown whole has blurred bands of its own: the video lets them show.
        fit && !fit.cover ? "bg-transparent" : "bg-black",
        leaving && "pointer-events-none opacity-0",
      )}
      style={{ transitionDuration: `${FADE_MS}ms` }}
    >
      <video
        key={playing.id}
        src={playing.src}
        poster={playing.poster ?? undefined}
        autoPlay
        muted
        playsInline
        preload="auto"
        aria-hidden
        onPlaying={() => window.clearTimeout(guard.current)}
        onEnded={end}
        onError={end}
        className={cn("h-full w-full", fit && !fit.cover ? "object-contain" : "object-cover")}
        style={
          fit?.cover
            ? {
                objectPosition: `${fit.x * 100}% ${fit.y * 100}%`,
                transition: "object-position 500ms ease-out",
              }
            : undefined
        }
      />
      <button
        type="button"
        onClick={end}
        className={cn(
          "absolute inline-flex h-9 items-center gap-1.5 rounded-full border border-white/15 bg-black/55 px-3.5 text-xs font-medium text-white/85 backdrop-blur transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70",
          skipClassName ?? "right-4 top-4",
        )}
      >
        <SkipForward className="size-3.5" aria-hidden />
        {copy.skip}
      </button>
    </div>
  ) : null;

  return { play, layer };
}
