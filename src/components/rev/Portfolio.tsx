import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, Play, X } from "lucide-react";

import {
  AD_CATEGORIES,
  AD_CATEGORY_LABELS,
  FILMS,
  adMedia,
  formatDuration,
  type Ad,
  type AdCategory,
} from "@/lib/ads";
import { clientName } from "@/lib/clients";
import { href, useLocale, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Container, Cta, Section, SectionHeading } from "./ui";
import { Reveal } from "./Reveal";

type Filter = "all" | AdCategory;

const COPY = {
  fr: {
    all: "Tout",
    title: "Des films qui [[font vendre]]",
    description: (n: number) =>
      `${n} films pour des promoteurs, des agences, des agents et des conciergeries : publicités, visites, films et 3D, en français, en darija, en néerlandais et en italien.`,
    filters: "Filtrer les films",
    seeAll: (n: number) => `Voir les ${n} films`,
    play: (t: string) => `Lire le film « ${t} »`,
    close: "Fermer",
    prev: "Film précédent",
    next: "Film suivant",
  },
  en: {
    all: "All",
    title: "Films that [[sell]]",
    description: (n: number) =>
      `${n} films for developers, agencies, agents and short-let managers: ads, tours, films and 3D, in French, Darija, Dutch and Italian.`,
    filters: "Filter the films",
    seeAll: (n: number) => `Watch all ${n} films`,
    play: (t: string) => `Play “${t}”`,
    close: "Close",
    prev: "Previous film",
    next: "Next film",
  },
};

const SCROLL_ROW =
  "-mx-5 flex snap-x snap-mandatory overflow-x-auto px-5 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden";

/** What a film's small line says: its client when named, else its category. */
const filmLabel = (ad: Ad, locale: Locale) =>
  ad.client ? clientName(ad.client) : AD_CATEGORY_LABELS[locale][ad.category];

export function Portfolio({
  limit,
  showHeading = true,
  id = "portfolio",
}: {
  limit?: number;
  showHeading?: boolean;
  id?: string;
}) {
  const locale = useLocale();
  const copy = COPY[locale];
  const [active, setActive] = useState<Filter>("all");

  const filtered = useMemo(
    () => (active === "all" ? FILMS : FILMS.filter((ad) => ad.category === active)),
    [active],
  );
  const items = limit ? filtered.slice(0, limit) : filtered;

  return (
    <Section id={id} className="border-t border-border/70">
      <Container>
        {showHeading ? (
          <SectionHeading title={copy.title} description={copy.description(FILMS.length)} />
        ) : null}

        <Reveal className={cn(showHeading && "mt-8 sm:mt-10")}>
          <div
            role="group"
            aria-label={copy.filters}
            className={cn(SCROLL_ROW, "gap-1 border-b border-border/70 sm:flex-wrap")}
          >
            {(["all", ...AD_CATEGORIES] as Filter[]).map((f) => {
              const count = f === "all" ? FILMS.length : FILMS.filter((a) => a.category === f).length;
              const on = active === f;
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => setActive(f)}
                  aria-pressed={on}
                  className={cn(
                    "relative h-11 shrink-0 snap-start whitespace-nowrap px-3 text-sm transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-foreground/70",
                    on ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {f === "all" ? copy.all : AD_CATEGORY_LABELS[locale][f]}
                  <span className="ml-1.5 tabular-nums text-muted-foreground">{count}</span>
                  <span
                    aria-hidden
                    className={cn(
                      "absolute inset-x-3 -bottom-px h-0.5 transition-colors duration-200",
                      on ? "bg-primary" : "bg-transparent",
                    )}
                  />
                </button>
              );
            })}
          </div>
        </Reveal>

        <FilmGrid ads={items} row={!!limit} className="mt-6 sm:mt-8" />

        {limit && filtered.length > limit ? (
          <div className="mt-8 flex justify-center sm:mt-10">
            <Cta href={href("portfolio", locale)} variant="ghost">
              {copy.seeAll(FILMS.length)}
              <ArrowUpRight size={16} />
            </Cta>
          </div>
        ) : null}
      </Container>
    </Section>
  );
}

/**
 * A grid of film tiles opening the player. `row` turns it into a sideways
 * row on phones (a short selection), instead of two columns.
 */
export function FilmGrid({
  ads,
  row = false,
  more,
  className,
  style,
}: {
  ads: Ad[];
  row?: boolean;
  /** A last tile linking to more films. */
  more?: { href: string; label: string };
  className?: string;
  style?: CSSProperties;
}) {
  const locale = useLocale();
  const [open, setOpen] = useState<number | null>(null);
  return (
    <>
      <ul
        className={cn(
          row
            ? cn(SCROLL_ROW, "gap-3 pb-2 sm:grid sm:grid-cols-3 sm:gap-x-4 sm:gap-y-7 lg:grid-cols-4")
            : "grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 sm:gap-x-4 sm:gap-y-7 lg:grid-cols-4",
          className,
        )}
        style={style}
      >
        {ads.map((ad, i) => (
          <li key={ad.id} className={row ? "w-[44%] shrink-0 snap-start sm:w-auto" : undefined}>
            <AdTile ad={ad} locale={locale} onOpen={() => setOpen(i)} />
          </li>
        ))}
        {more ? (
          <li className={row ? "w-[44%] shrink-0 snap-start sm:w-auto" : undefined}>
            <a
              href={more.href}
              className="group flex aspect-[9/16] flex-col justify-end gap-2 rounded-[14px] border border-border p-4 text-sm font-medium transition-colors duration-200 hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/70 focus-visible:ring-offset-4 focus-visible:ring-offset-background"
            >
              <ArrowRight size={18} aria-hidden className="text-primary" />
              {more.label}
            </a>
          </li>
        ) : null}
      </ul>
      {open !== null ? (
        <AdLightbox
          ads={ads}
          index={open}
          locale={locale}
          onIndexChange={setOpen}
          onClose={() => setOpen(null)}
        />
      ) : null}
    </>
  );
}

function AdTile({ ad, locale, onOpen }: { ad: Ad; locale: Locale; onOpen: () => void }) {
  const [hover, setHover] = useState(false);
  const media = adMedia(ad.id, ad.aspect);

  return (
    <button
      type="button"
      onClick={onOpen}
      onPointerEnter={(e) => e.pointerType === "mouse" && setHover(true)}
      onPointerLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      className="group block w-full rounded-[14px] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/70 focus-visible:ring-offset-4 focus-visible:ring-offset-background"
      aria-label={COPY[locale].play(ad.title[locale])}
    >
      <span className="relative block aspect-[9/16] overflow-hidden rounded-[14px] border border-border bg-card transition-colors duration-300 group-hover:border-primary/40">
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
        <span className="absolute left-2.5 top-2.5 rounded-[6px] bg-black/60 px-2 py-0.5 text-xs tabular-nums text-white/90">
          {formatDuration(ad.duration)}
          {ad.lang ? ` · ${ad.lang}` : ""}
          {ad.aspect === "16/9" ? " · 16:9" : ""}
        </span>
        <span className="absolute inset-0 grid place-items-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-primary text-primary-foreground">
            <Play size={20} className="translate-x-0.5" />
          </span>
        </span>
      </span>
      <span className="mt-3 block text-xs text-primary">{filmLabel(ad, locale)}</span>
      <span className="mt-1 block font-display text-sm font-medium leading-snug tracking-tight">
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
  const media = adMedia(ad.id, ad.aspect);
  const wide = ad.aspect === "16/9";
  // The lightbox only exists in the browser: phones get the lighter file.
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

      <div className="flex w-full max-w-6xl items-center justify-center gap-4 md:gap-8">
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label={copy.prev}
          className="hidden h-12 w-12 shrink-0 place-items-center rounded-full border border-white/15 text-white transition-colors hover:border-primary hover:text-primary md:grid"
        >
          <ArrowLeft size={18} />
        </button>

        <div
          className={cn(
            "flex min-w-0 flex-col items-center gap-6",
            wide ? "w-full" : "md:flex-row md:items-end md:gap-10",
          )}
        >
          <video
            key={ad.id}
            src={src}
            poster={media.poster}
            controls
            autoPlay
            playsInline
            onEnded={() => go(1)}
            className={cn(
              "rounded-[14px] bg-black",
              wide
                ? "aspect-video w-full max-w-[min(92vw,1100px)]"
                : "max-h-[78svh] w-auto max-w-[88vw] md:max-h-[86svh]",
            )}
            style={wide ? undefined : { aspectRatio: "9 / 16" }}
          />
          <div className={cn("w-full text-center", wide ? "max-w-xl" : "max-w-xs md:pb-4 md:text-left")}>
            <p className="text-xs text-primary">
              {filmLabel(ad, locale)}
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
