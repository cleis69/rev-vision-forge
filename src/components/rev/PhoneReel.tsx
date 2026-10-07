import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp, Play, Volume2, VolumeX } from "lucide-react";

import { AD_CATEGORY_LABELS, REEL_SIZES, adMedia, type Ad } from "@/lib/ads";
import { useLocale } from "@/lib/i18n";
import { prefersReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { IPhone, SCREEN_VIDEO_AREA, StatusBar, TabBar } from "./IPhone";

const COPY = {
  fr: { region: "carrousel", label: "Ads réalisées par REV", soundOn: "Activer le son", soundOff: "Couper le son", play: "Lire la vidéo", prev: "Ad précédente", next: "Ad suivante" },
  en: { region: "carousel", label: "Ads produced by REV", soundOn: "Turn sound on", soundOff: "Mute", play: "Play video", prev: "Previous ad", next: "Next ad" },
} as const;

/**
 * Muted ads move on after this many seconds; with sound on they play to the
 * end. While muted the phone plays the 10-second teaser of each ad, and
 * switches to the whole ad as soon as the sound is turned on.
 */
const MUTED_MAX_SECONDS = 9;
const SWIPE_MS = 700;

/**
 * An iPhone playing the ads one after another, swiping up like a short-video
 * feed. It advances on its own, on swipe or on the arrows — never on scroll.
 */
export function PhoneReel({
  ads,
  index,
  onIndexChange,
  className,
  phoneClassName,
}: {
  ads: Ad[];
  index: number;
  onIndexChange: (next: number) => void;
  className?: string;
  phoneClassName?: string;
}) {
  const n = ads.length;
  const locale = useLocale();
  const copy = COPY[locale];
  const root = useRef<HTMLDivElement | null>(null);
  const videos = useRef(new Map<string, HTMLVideoElement>());
  const touchY = useRef<number | null>(null);
  const [muted, setMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [blocked, setBlocked] = useState(false);
  const [visible, setVisible] = useState(true);
  // Neighbouring ads only fetch their still and first bytes once one ad plays.
  const [started, setStarted] = useState(false);

  const go = useCallback(
    (dir: number) => onIndexChange((index + dir + n) % n),
    [index, n, onIndexChange],
  );

  // Pause while the phone is off screen or the tab is hidden.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry?.isIntersecting ?? true), {
      threshold: 0.2,
    });
    io.observe(el);
    const onVis = () => setVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVis);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  // Play the current ad from the start; pause the others.
  useEffect(() => {
    const current = ads[index];
    setProgress(0);
    videos.current.forEach((video, id) => {
      if (id !== current?.id || !visible) {
        video.pause();
        return;
      }
      const media = adMedia(id);
      setSource(video, muted ? media.teaser : media.sd);
      video.muted = muted;
      if (prefersReducedMotion() && muted) {
        setBlocked(true);
        return;
      }
      video.currentTime = 0;
      video
        .play()
        .then(() => setBlocked(false))
        .catch((error: DOMException) => {
          // AbortError only means a newer play/pause call superseded this one.
          if (error.name === "NotAllowedError") setBlocked(true);
        });
    });
    // Sound is applied separately so toggling it never restarts the ad.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, ads, visible]);

  // Once an ad plays, let the next one fetch its first bytes for a quick start.
  useEffect(() => {
    if (!started) return;
    const next = ads[(index + 1) % n];
    const video = next ? videos.current.get(next.id) : undefined;
    if (video && next && !video.dataset["src"]) {
      video.preload = "metadata";
      setSource(video, adMedia(next.id).teaser);
    }
  }, [started, index, ads, n]);

  useEffect(() => {
    const current = ads[index];
    const video = current ? videos.current.get(current.id) : undefined;
    if (video) video.muted = muted;
  }, [muted, index, ads]);

  // Runs inside the click, so playback with sound is allowed everywhere.
  const toggleSound = () => {
    const current = ads[index];
    const video = current ? videos.current.get(current.id) : undefined;
    if (video && current && muted) {
      const t = video.currentTime;
      if (setSource(video, adMedia(current.id).sd) && t > 0) {
        video.addEventListener("loadedmetadata", () => (video.currentTime = t), { once: true });
      }
      video.muted = false;
      video
        .play()
        .then(() => setBlocked(false))
        .catch(() => setBlocked(true));
    } else if (video) {
      video.muted = true;
    }
    setMuted((m) => !m);
  };

  const onTime = (ad: Ad, video: HTMLVideoElement) => {
    if (ad.id !== ads[index]?.id || !video.duration) return;
    const limit = muted ? Math.min(video.duration, MUTED_MAX_SECONDS) : video.duration;
    setProgress(Math.min(1, video.currentTime / limit));
    if (muted && !prefersReducedMotion() && video.currentTime >= MUTED_MAX_SECONDS) go(1);
  };

  const playCurrent = () => {
    const current = ads[index];
    const video = current ? videos.current.get(current.id) : undefined;
    video
      ?.play()
      .then(() => setBlocked(false))
      .catch(() => setBlocked(true));
  };

  const current = ads[index];

  return (
    <div ref={root} className={cn("relative", className)}>
      <div
        role="region"
        aria-roledescription={copy.region}
        aria-label={copy.label}
        onTouchStart={(e) => {
          touchY.current = e.touches[0]?.clientY ?? null;
        }}
        onTouchEnd={(e) => {
          const start = touchY.current;
          const end = e.changedTouches[0]?.clientY;
          touchY.current = null;
          if (start == null || end == null) return;
          if (Math.abs(start - end) > 40) go(start > end ? 1 : -1);
        }}
      >
        <IPhone className={phoneClassName}>
          <StatusBar />
          <div className={cn(SCREEN_VIDEO_AREA, "overflow-hidden bg-black")}>
            {ads.map((ad, i) => {
              let offset = (i - index + n) % n;
              if (offset > n / 2) offset -= n;
              // Only the current ad and its neighbours exist; the rest costs nothing.
              if (Math.abs(offset) > 1) return null;
              const media = adMedia(ad.id);
              return (
                <div
                  key={ad.id}
                  aria-hidden={offset !== 0}
                  className="absolute inset-0"
                  style={{
                    transform: `translate3d(0, ${offset * 100}%, 0)`,
                    transition: `transform ${SWIPE_MS}ms cubic-bezier(0.65, 0, 0.35, 1)`,
                  }}
                >
                  {/* The still is the largest thing on the page (LCP): a real <img>, sized to the screen. */}
                  {offset === 0 || started ? (
                    <img
                      src={media.stillSrc}
                      srcSet={media.stillSrcSet}
                      sizes={REEL_SIZES}
                      alt=""
                      decoding="async"
                      fetchPriority={offset === 0 ? "high" : "low"}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : null}
                  <video
                    ref={(el) => {
                      if (el) videos.current.set(ad.id, el);
                      else videos.current.delete(ad.id);
                    }}
                    muted
                    playsInline
                    preload="none"
                    // Shown only once it really plays: the still stays visible until then.
                    onPlaying={(e) => {
                      e.currentTarget.dataset["playing"] = "";
                      setStarted(true);
                    }}
                    onEmptied={(e) => delete e.currentTarget.dataset["playing"]}
                    onTimeUpdate={(e) => onTime(ad, e.currentTarget)}
                    onEnded={() => offset === 0 && go(1)}
                    className="relative h-full w-full object-cover opacity-0 transition-opacity duration-300 data-[playing]:opacity-100"
                  />
                </div>
              );
            })}

            <span className="absolute left-[3.5cqw] top-[3.5cqw] z-10 rounded-full bg-black/50 px-[3cqw] py-[1.4cqw] text-[3cqw] font-medium uppercase tracking-[0.12em] text-white backdrop-blur-md">
              {current ? AD_CATEGORY_LABELS[locale][current.category] : null}
              {current?.lang ? ` · ${current.lang}` : ""}
            </span>

            <button
              type="button"
              onClick={toggleSound}
              aria-label={muted ? copy.soundOn : copy.soundOff}
              aria-pressed={!muted}
              className="absolute right-[3.5cqw] top-[3cqw] z-10 grid h-[10cqw] w-[10cqw] place-items-center rounded-full bg-black/50 text-white backdrop-blur-md transition-colors hover:bg-black/75"
            >
              {muted ? (
                <VolumeX className="h-[4.6cqw] w-[4.6cqw]" />
              ) : (
                <Volume2 className="h-[4.6cqw] w-[4.6cqw]" />
              )}
            </button>

            <div className="absolute inset-x-[4cqw] bottom-[2.5cqw] z-10 h-[0.7cqw] overflow-hidden rounded-full bg-white/25">
              <div
                className="h-full origin-left bg-primary"
                style={{ transform: `scaleX(${progress})` }}
              />
            </div>

            {blocked ? (
              <button
                type="button"
                onClick={playCurrent}
                aria-label={copy.play}
                className="absolute inset-0 z-20 grid place-items-center bg-black/30"
              >
                <span className="grid h-[17cqw] w-[17cqw] place-items-center rounded-full bg-primary text-primary-foreground">
                  <Play className="h-[6cqw] w-[6cqw] translate-x-[0.4cqw]" />
                </span>
              </button>
            ) : null}
          </div>
          <TabBar />
        </IPhone>
      </div>

      <div className="mt-5 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label={copy.prev}
          className="grid h-10 w-10 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
        >
          <ChevronUp size={17} />
        </button>
        <span className="min-w-[4.5rem] text-center text-xs tabular-nums text-muted-foreground">
          {String(index + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
        </span>
        <button
          type="button"
          onClick={() => go(1)}
          aria-label={copy.next}
          className="grid h-10 w-10 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
        >
          <ChevronDown size={17} />
        </button>
      </div>
    </div>
  );
}

/** Point a video at `src` unless it already is; returns whether it changed. */
function setSource(video: HTMLVideoElement, src: string) {
  if (video.dataset["src"] === src) return false;
  video.dataset["src"] = src;
  video.src = src;
  return true;
}
