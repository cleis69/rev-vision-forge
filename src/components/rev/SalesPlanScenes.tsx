import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Play } from "lucide-react";

import dChercher from "@/assets/scenes/d-chercher.mp4?url";
import dComparer from "@/assets/scenes/d-comparer.mp4?url";
import dContacter from "@/assets/scenes/d-contacter.mp4?url";
import dFiche from "@/assets/scenes/d-fiche.mp4?url";
import dVues from "@/assets/scenes/d-vues.mp4?url";
import mChercher from "@/assets/scenes/m-chercher.mp4?url";
import mComparer from "@/assets/scenes/m-comparer.mp4?url";
import mContacter from "@/assets/scenes/m-contacter.mp4?url";
import mFiche from "@/assets/scenes/m-fiche.mp4?url";
import mVues from "@/assets/scenes/m-vues.mp4?url";
import { photo } from "@/lib/images";
import { cn } from "@/lib/utils";
import { useMotionAllowed } from "./SalesPlanDemo";

/*
 * What a buyer does on the page of a programme, shown rather than told: five
 * short films of the public demo being used (a fictional programme), one per
 * moment, on a champagne stage. The films follow one another; the visitor can
 * pick a moment. Recorded on a computer and on a phone: each screen gets the
 * film of its own layout. Nothing plays with reduced motion until asked.
 */

export type SceneId = "chercher" | "fiche" | "vues" | "comparer" | "contacter";

export type SceneItem = { id: SceneId; tab: string; title: string; body: string };

const FILMS: Record<SceneId, { wide: string; tall: string }> = {
  chercher: { wide: dChercher, tall: mChercher },
  fiche: { wide: dFiche, tall: mFiche },
  vues: { wide: dVues, tall: mVues },
  comparer: { wide: dComparer, tall: mComparer },
  contacter: { wide: dContacter, tall: mContacter },
};

const widePoster = photo("demo-desktop");
const tallPoster = photo("demo-phone");

export function SalesPlanScenes({
  items,
  label,
  caption,
  demoHref,
  openDemo,
  play,
  alt,
}: {
  items: SceneItem[];
  /** Names the set of moments for assistive technology. */
  label: string;
  /** Whose page this is, written on the stage. */
  caption: string;
  demoHref: string;
  openDemo: string;
  /** Label of the play button shown when films do not start by themselves. */
  play: string;
  alt: string;
}) {
  const [index, setIndex] = useState(0);
  // The layout filmed for this screen, known once in the browser.
  const [tall, setTall] = useState<boolean | null>(null);
  const [seen, setSeen] = useState(false);
  const [asked, setAsked] = useState(false);
  const auto = useMotionAllowed();
  const stage = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  // The fill of the current moment, on the lines (computer) and on the rail (phone).
  const bars = useRef<(HTMLSpanElement | null)[]>([]);
  const railBars = useRef<(HTMLSpanElement | null)[]>([]);
  const item = items[index] ?? items[0];
  const running = auto || asked;

  useEffect(() => {
    const query = window.matchMedia("(max-width: 1023px)");
    const sync = () => setTall(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const node = stage.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => setSeen(!!entry?.isIntersecting), {
      threshold: 0.3,
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Plays in sight only; the line of the current moment fills as its film runs.
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
      for (const bar of [...bars.current, ...railBars.current]) {
        if (bar) bar.style.transform = `scaleX(${bar.dataset["on"] === "1" ? done : 0})`;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [seen, running, index, tall]);

  if (!item) return null;
  const pick = (i: number) => {
    setIndex(i);
    if (!auto) setAsked(true);
  };
  const next = () => setIndex((i) => (i + 1) % items.length);
  const src = tall === null ? null : FILMS[item.id][tall ? "tall" : "wide"];

  return (
    <div className="mt-8 grid gap-6 sm:mt-10 lg:grid-cols-[minmax(0,21rem)_minmax(0,1fr)] lg:items-center lg:gap-14">
      {/* Phones: the moments as a rail above the stage. */}
      <div
        role="tablist"
        aria-label={label}
        className="-mx-5 flex overflow-x-auto px-2 [scrollbar-width:none] sm:mx-0 sm:px-0 lg:hidden [&::-webkit-scrollbar]:hidden"
      >
        {items.map((it, i) => (
          <button
            key={it.id}
            type="button"
            role="tab"
            aria-selected={i === index}
            onClick={() => pick(i)}
            className={cn(
              "relative h-11 shrink-0 rounded-[6px] px-3 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/70",
              i === index ? "text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {it.tab}
            <span
              aria-hidden
              className={cn(
                "absolute inset-x-3 bottom-0 h-0.5 transition-colors duration-200",
                i === index ? "bg-foreground/20" : "bg-transparent",
              )}
            />
            <span
              ref={(el) => {
                railBars.current[i] = el;
              }}
              data-on={i === index ? "1" : "0"}
              aria-hidden
              className="absolute inset-x-3 bottom-0 h-0.5 origin-left scale-x-0 bg-primary"
            />
          </button>
        ))}
      </div>

      {/* Computers: the moments as lines; the current one tells more. */}
      <div role="tablist" aria-label={label} className="hidden border-b border-border/70 lg:block">
        {items.map((it, i) => {
          const on = i === index;
          return (
            <button
              key={it.id}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => pick(i)}
              className="group relative block w-full border-t border-border/70 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/70"
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
                  "block font-display text-[19px] font-medium leading-snug tracking-tight transition-colors duration-200",
                  on ? "text-foreground" : "text-muted-foreground group-hover:text-foreground",
                )}
              >
                {it.title}
              </span>
              <span
                className="grid transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
                style={{ gridTemplateRows: on ? "1fr" : "0fr", opacity: on ? 1 : 0 }}
              >
                <span className="overflow-hidden">
                  <span className="block pt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {it.body}
                  </span>
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div
        ref={stage}
        role="tabpanel"
        aria-label={item.title}
        className="-mx-5 overflow-hidden bg-primary text-primary-foreground sm:mx-0 sm:rounded-[14px]"
      >
        <div className="flex items-center justify-between gap-4 px-5 pt-4 text-[13px] lg:px-7 lg:pt-5">
          <span className="font-medium">{caption}</span>
          <a
            href={demoHref}
            target="_blank"
            rel="noopener"
            className="inline-flex h-8 shrink-0 items-center gap-1 rounded-[6px] font-medium underline decoration-black/30 underline-offset-4 transition-colors duration-200 hover:decoration-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/70"
          >
            {openDemo}
            <ArrowUpRight size={14} aria-hidden />
          </a>
        </div>
        <div className="px-5 pb-6 pt-3 lg:px-7 lg:pb-7">
          <div className="relative mx-auto aspect-[390/844] w-[min(100%,270px)] overflow-hidden rounded-[22px] bg-black shadow-[0_30px_60px_-24px_rgb(0_0_0/0.7)] lg:aspect-[16/10] lg:w-full lg:rounded-[10px]">
            <picture>
              <source
                media="(min-width: 1024px)"
                srcSet={widePoster.srcSet}
                sizes="(min-width: 1240px) 720px, 60vw"
              />
              <img
                src={tallPoster.src}
                srcSet={tallPoster.srcSet}
                sizes="270px"
                alt={alt}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover object-top"
              />
            </picture>
            {src && (seen || index > 0) ? (
              <video
                key={src}
                ref={video}
                src={src}
                poster={(tall ? tallPoster : widePoster).src}
                muted
                playsInline
                preload="metadata"
                onEnded={next}
                aria-hidden
                tabIndex={-1}
                className={cn(
                  "absolute inset-0 h-full w-full object-cover object-top",
                  !running && "opacity-0",
                )}
              />
            ) : null}
            {!running ? (
              <button
                type="button"
                onClick={() => setAsked(true)}
                className="absolute inset-0 m-auto inline-flex h-12 w-fit items-center gap-2.5 rounded-[10px] border border-white/20 bg-black/70 px-5 text-sm font-medium text-white backdrop-blur-md transition-colors duration-200 hover:border-white/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
              >
                <Play size={14} fill="currentColor" aria-hidden />
                {play}
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Phones: what the current moment is, under the stage. */}
      <div className="lg:hidden">
        <p className="font-display text-[19px] font-medium leading-snug tracking-tight">
          {item.title}
        </p>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
      </div>
    </div>
  );
}
