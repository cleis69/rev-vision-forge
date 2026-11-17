import { useEffect, useRef, useState } from "react";
import { Play } from "lucide-react";

import { sceneMedia, type CaseSlug, type SiteScene } from "@/lib/cases";
import { useLocale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { GlassStage } from "./Glass";
import { useMotionAllowed } from "./SalesPlanDemo";

/*
 * A client's website in use, on a champagne stage: one screen recording per
 * moment, on a computer or on a phone. The recordings follow one another and
 * the visitor can pick one. They play only in sight, and with reduced motion
 * only when asked.
 */

const COPY = {
  fr: { play: "Lire les enregistrements", label: "Le site, moment par moment" },
  en: { play: "Play the recordings", label: "The website, moment by moment" },
};

export function CaseScenes({ slug, scenes, caption }: { slug: CaseSlug; scenes: SiteScene[]; caption: string }) {
  const locale = useLocale();
  const copy = COPY[locale];
  const [index, setIndex] = useState(0);
  const [seen, setSeen] = useState(false);
  const [asked, setAsked] = useState(false);
  const auto = useMotionAllowed();
  const stage = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const bars = useRef<(HTMLSpanElement | null)[]>([]);
  const scene = scenes[index] ?? scenes[0];
  const running = auto || asked;

  useEffect(() => {
    const node = stage.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => setSeen(!!entry?.isIntersecting), {
      threshold: 0.3,
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const el = video.current;
    if (!el) return;
    if (!(seen && running)) {
      el.pause();
      return;
    }
    el.play().catch(() => {});
    let frame = 0;
    const tick = () => {
      const done = el.duration ? el.currentTime / el.duration : 0;
      for (const bar of bars.current) {
        if (bar) bar.style.transform = `scaleX(${bar.dataset["on"] === "1" ? done : 0})`;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [seen, running, index]);

  if (!scene) return null;
  const pick = (i: number) => {
    setIndex(i);
    if (!auto) setAsked(true);
  };
  const media = sceneMedia(slug, scene.id);
  const phone = scene.frame === "phone";

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:items-center lg:gap-14">
      <div role="tablist" aria-label={copy.label} className="order-2 border-b border-border/70 lg:order-1">
        {scenes.map((s, i) => {
          const on = i === index;
          return (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => pick(i)}
              className="group relative block w-full border-t border-border/70 py-3.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/70 lg:py-4"
            >
              <span
                ref={(el) => {
                  bars.current[i] = el;
                }}
                data-on={on ? "1" : "0"}
                aria-hidden
                className="absolute -top-px left-0 h-0.5 w-full origin-left scale-x-0 bg-primary"
              />
              <span
                className={cn(
                  "flex items-baseline gap-3 font-display text-[17px] font-medium leading-snug tracking-tight transition-colors duration-200 lg:text-[19px]",
                  on ? "text-foreground" : "text-muted-foreground group-hover:text-foreground",
                )}
              >
                <span className="w-6 shrink-0 text-xs tabular-nums text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {s.title[locale]}
              </span>
              <span
                className="grid transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
                style={{ gridTemplateRows: on ? "1fr" : "0fr", opacity: on ? 1 : 0 }}
              >
                <span className="overflow-hidden">
                  <span className="block pl-9 pt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {s.body[locale]}
                  </span>
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <GlassStage
        ref={stage}
        role="tabpanel"
        aria-label={scene.title[locale]}
        backdrop={media.poster}
        className="order-1 text-white lg:order-2"
      >
        <p className="px-5 pt-4 text-[13px] font-medium text-white/85 lg:px-7 lg:pt-5">{caption}</p>
        <div className="grid min-h-[min(80vw,30rem)] place-items-center px-5 pb-6 pt-3 lg:min-h-[28rem] lg:px-7 lg:pb-7">
          <div
            className={cn(
              "relative overflow-hidden bg-black shadow-[0_30px_60px_-24px_rgb(0_0_0/0.7)]",
              phone
                ? "aspect-[390/844] w-[min(62vw,232px)] rounded-[22px] ring-[6px] ring-[#0d0d0d]"
                : "aspect-[16/10] w-full rounded-[10px]",
            )}
          >
            <img
              src={media.poster}
              alt=""
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover object-top"
            />
            {seen || index > 0 ? (
              <video
                key={media.src}
                ref={video}
                src={media.src}
                poster={media.poster}
                muted
                playsInline
                preload="metadata"
                onEnded={() => setIndex((i) => (i + 1) % scenes.length)}
                aria-hidden
                tabIndex={-1}
                className={cn("absolute inset-0 h-full w-full object-cover object-top", !running && "opacity-0")}
              />
            ) : null}
            {!running ? (
              <button
                type="button"
                onClick={() => setAsked(true)}
                className="absolute inset-0 m-auto inline-flex h-12 w-fit items-center gap-2.5 rounded-[10px] border border-white/20 bg-black/70 px-5 text-sm font-medium text-white backdrop-blur-md transition-colors duration-200 hover:border-white/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
              >
                <Play size={14} fill="currentColor" aria-hidden />
                {copy.play}
              </button>
            ) : null}
          </div>
        </div>
      </GlassStage>
    </div>
  );
}
