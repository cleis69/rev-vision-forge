import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, Play, X } from "lucide-react";

import { AD_CATEGORIES, AD_CATEGORY_LABELS, ADS, adMedia, formatDuration, type Ad, type AdCategory } from "@/lib/ads";
import { href, useLocale, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Container, Cta, Section, SectionHeading } from "./ui";
import { Reveal } from "./Reveal";

type Filter = "all" | AdCategory;

const COPY = {
  fr: {
    all: "Tout",
    eyebrow: "Portfolio",
    title: "Des ads qui font vendre.",
    description: (n: number) =>
      `${n} vidéos produites pour des promoteurs, des agences, des agents et des conciergeries, en français et en néerlandais.`,
    seeAll: (n: number) => `Voir les ${n} ads`,
    play: (t: string) => `Lire l'ad « ${t} »`,
    close: "Fermer",
    prev: "Ad précédente",
    next: "Ad suivante",
  },
  en: {
    all: "All",
    eyebrow: "Portfolio",
    title: "Ads that sell.",
    description: (n: number) =>
      `${n} videos produced for developers, agencies, agents and short-let managers, in French and Dutch.`,
    seeAll: (n: number) => `Watch all ${n} ads`,
    play: (t: string) => `Play the “${t}” ad`,
    close: "Close",
    prev: "Previous ad",
    next: "Next ad",
  },
};

const SCROLL_ROW =
  "-mx-5 flex snap-x snap-mandatory overflow-x-auto px-5 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden";

export function Portfolio({ limit, showHeading = true }: { limit?: number; showHeading?: boolean }) {
  const locale = useLocale();
  const copy = COPY[locale];
  const [active, setActive] = useState<Filter>("all");
  const [open, setOpen] = useState<number | null>(null);

  const filtered = useMemo(
    () => (active === "all" ? ADS : ADS.filter((ad) => ad.category === active)),
    [active],
  );
  const items = limit ? filtered.slice(0, limit) : filtered;

  return (
    <Section id="portfolio" className={cn("border-t border-border/70", !showHeading && "border-t-0 pt-8 sm:pt-10 lg:pt-12")}>
      <Container>
        {showHeading ? (
          <SectionHeading
            eyebrow={copy.eyebrow}
            title={copy.title}
            description={copy.description(ADS.length)}
          />
        ) : null}

        <Reveal className={cn(SCROLL_ROW, "gap-2 pb-1 sm:flex-wrap", showHeading && "mt-8 sm:mt-10")}>
          {(["all", ...AD_CATEGORIES] as Filter[]).map((f) => {
            const count = f === "all" ? ADS.length : ADS.filter((a) => a.category === f).length;
            return (
              <button
                key={f}
                type="button"
                onClick={() => setActive(f)}
                aria-pressed={active === f}
                className={cn(
                  "h-9 shrink-0 snap-start whitespace-nowrap rounded-full border px-4 text-xs uppercase tracking-[0.14em] transition-all duration-300",
                  active === f
                    ? "border-primary/50 bg-primary/10 text-foreground"
                    : "border-border text-muted-foreground hover:border-foreground/25 hover:text-foreground",
                )}
              >
                {f === "all" ? copy.all : AD_CATEGORY_LABELS[locale][f]}
                <span className="ml-2 tabular-nums text-muted-foreground">{count}</span>
              </button>
            );
          })}
        </Reveal>

        <ul
          className={cn(
            "mt-6 sm:mt-8",
            limit
              ? cn(SCROLL_ROW, "gap-3 pb-2 sm:grid sm:grid-cols-3 sm:gap-x-4 sm:gap-y-7 lg:grid-cols-4")
              : "grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 sm:gap-x-4 sm:gap-y-7 lg:grid-cols-4",
          )}
        >
          {items.map((ad, i) => (
            <li key={ad.id} className={limit ? "w-[44%] shrink-0 snap-start sm:w-auto" : undefined}>
              <AdTile ad={ad} locale={locale} onOpen={() => setOpen(i)} />
            </li>
          ))}
        </ul>

        {limit && filtered.length > limit ? (
          <div className="mt-8 flex justify-center sm:mt-10">
            <Cta href={href("portfolio", locale)} variant="ghost">
              {copy.seeAll(ADS.length)}
              <ArrowUpRight size={16} />
            </Cta>
          </div>
        ) : null}
      </Container>

      {open !== null ? (
        <AdLightbox ads={items} index={open} locale={locale} onIndexChange={setOpen} onClose={() => setOpen(null)} />
      ) : null}
    </Section>
  );
}

function AdTile({ ad, locale, onOpen }: { ad: Ad; locale: Locale; onOpen: () => void }) {
  const [hover, setHover] = useState(false);
  const media = adMedia(ad.id);

  return (
    <button
      type="button"
      onClick={onOpen}
      onPointerEnter={(e) => e.pointerType === "mouse" && setHover(true)}
      onPointerLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      className="group block w-full text-left"
      aria-label={COPY[locale].play(ad.title[locale])}
    >
      <span className="relative block aspect-[9/16] overflow-hidden rounded-2xl border border-border bg-card transition-colors duration-500 group-hover:border-primary/40">
        <img
          src={media.stillSrc}
          srcSet={media.stillSrcSet}
          sizes="(min-width: 1240px) 280px, (min-width: 1024px) 23vw, (min-width: 640px) 31vw, 46vw"
          alt=""
          loading="lazy"
          decoding="async"
          width={360}
          height={640}
          className="absolute inset-0 h-full w-full object-cover"
        />
        {hover ? (
          <video
            src={media.preview}
            muted
            loop
            autoPlay
            playsInline
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : null}
        <span className="absolute left-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-medium tabular-nums text-white/90 backdrop-blur-md">
          {formatDuration(ad.duration)}
          {ad.lang ? ` · ${ad.lang}` : ""}
        </span>
        <span className="absolute inset-0 grid place-items-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg">
            <Play size={20} className="translate-x-0.5" />
          </span>
        </span>
      </span>
      <span className="mt-3 block text-[10px] uppercase tracking-[0.18em] text-primary">
        {AD_CATEGORY_LABELS[locale][ad.category]}
      </span>
      <span className="mt-1.5 block font-display text-sm font-medium leading-snug tracking-tight">
        {ad.title[locale]}
      </span>
    </button>
  );
}

export function AdLightbox({
  ads,
  index,
  locale,
  onIndexChange,
  onClose,
}: {
  ads: Ad[];
  index: number;
  locale: Locale;
  onIndexChange: (i: number) => void;
  onClose: () => void;
}) {
  const copy = COPY[locale];
  const ad = ads[index];
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const go = useCallback(
    (dir: number) => onIndexChange((index + dir + ads.length) % ads.length),
    [index, ads.length, onIndexChange],
  );

  useEffect(() => {
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [go, onClose]);

  if (!ad) return null;
  const media = adMedia(ad.id);
  // The lightbox only exists in the browser: phones get the lighter 576p file.
  const src = window.matchMedia("(min-width: 768px)").matches ? media.full : media.sd;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={ad.title[locale]}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/92 p-4 backdrop-blur-xl animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
        aria-label={copy.close}
        className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full border border-white/15 text-white transition-colors hover:border-primary hover:text-primary"
      >
        <X size={18} />
      </button>

      <div className="flex w-full max-w-5xl items-center justify-center gap-4 md:gap-8">
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label={copy.prev}
          className="hidden h-12 w-12 shrink-0 place-items-center rounded-full border border-white/15 text-white transition-colors hover:border-primary hover:text-primary md:grid"
        >
          <ArrowLeft size={18} />
        </button>

        <div className="flex flex-col items-center gap-6 md:flex-row md:items-end md:gap-10">
          <video
            key={ad.id}
            src={src}
            poster={media.poster}
            controls
            autoPlay
            playsInline
            onEnded={() => go(1)}
            className="max-h-[78svh] w-auto max-w-[88vw] rounded-2xl bg-black md:max-h-[86svh]"
            style={{ aspectRatio: "9 / 16" }}
          />
          <div className="w-full max-w-xs text-center md:pb-4 md:text-left">
            <p className="text-[10px] uppercase tracking-[0.18em] text-primary">
              {AD_CATEGORY_LABELS[locale][ad.category]}
              {ad.lang ? ` · ${ad.lang}` : ""}
            </p>
            <p className="mt-2 font-display text-xl font-medium leading-snug tracking-tight text-white">
              {ad.title[locale]}
            </p>
            <p className="mt-4 text-xs tabular-nums text-white/50">
              {String(index + 1).padStart(2, "0")} / {String(ads.length).padStart(2, "0")}
            </p>
            <div className="mt-5 flex justify-center gap-3 md:hidden">
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label={copy.prev}
                className="grid h-11 w-11 place-items-center rounded-full border border-white/15 text-white"
              >
                <ArrowLeft size={18} />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label={copy.next}
                className="grid h-11 w-11 place-items-center rounded-full border border-white/15 text-white"
              >
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => go(1)}
          aria-label={copy.next}
          className="hidden h-12 w-12 shrink-0 place-items-center rounded-full border border-white/15 text-white transition-colors hover:border-primary hover:text-primary md:grid"
        >
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
