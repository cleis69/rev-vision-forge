import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowUpRight, Eye, Heart, Users } from "lucide-react";

import { AD_STATS, ADS, adMedia, formatCount, type Ad } from "@/lib/ads";
import { href, useLocale, type Locale } from "@/lib/i18n";
import { useDeferredMedia } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { Container, Cta, fadeUp, headline } from "./ui";
import { LazyVideo } from "./LazyVideo";
import { PhoneReel } from "./PhoneReel";

const COPY = {
  fr: {
    eyebrow: "Agence de croissance immobilière",
    title: "Le marketing visuel qui accélère les ventes immobilières.",
    body: "Ads, room tours et personal branding pour promoteurs, agences et agents — puis l'acquisition et l'automatisation qui transforment les vues en rendez-vous.",
    ads: "Voir toutes nos ads",
    meetingShort: "Rendez-vous",
    meeting: "Prendre rendez-vous",
    views: "Vues",
    likes: "Likes",
    leads: "Leads",
  },
  en: {
    eyebrow: "Real estate growth agency",
    title: "Visual marketing that sells real estate faster.",
    body: "Ads, room tours and personal branding for developers, agencies and agents — then the acquisition and automation that turn views into viewings.",
    ads: "Watch all our ads",
    meetingShort: "Book a call",
    meeting: "Book a call",
    views: "Views",
    likes: "Likes",
    leads: "Leads",
  },
} as const;

// The two side columns split the catalogue; any tile opens in the phone.
const COLUMN_A = ADS.filter((_, i) => i % 2 === 0);
const COLUMN_B = ADS.filter((_, i) => i % 2 === 1);

export function Hero() {
  const locale = useLocale();
  const copy = COPY[locale];
  const [index, setIndex] = useState(0);
  const ad = ADS[index] ?? ADS[0]!;
  const stats = AD_STATS[ad.id];

  const showInPhone = (target: Ad) => {
    const i = ADS.findIndex((a) => a.id === target.id);
    if (i >= 0) setIndex(i);
  };

  return (
    <section id="home" className="relative overflow-hidden">
      <Container className="grid items-center gap-x-10 gap-y-7 pb-12 pt-24 sm:gap-y-9 sm:pt-28 [grid-template-areas:'text'_'reel'_'cta'] lg:min-h-[100svh] lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:pb-14 lg:pt-28 lg:[grid-template-areas:'text_reel'_'cta_reel']">
        <div className="[grid-area:text] lg:self-end">
          <h1
            className="font-display text-[clamp(2.15rem,3.7vw,3.6rem)] [text-wrap:balance] font-medium leading-[1.03] tracking-[-0.04em] text-foreground"
            style={fadeUp(0)}
          >
            {headline(copy.title)}
          </h1>

          <p
            className="mt-5 max-w-xl text-[15px] leading-relaxed text-muted-foreground sm:mt-6 md:text-lg"
            style={fadeUp(0.3)}
          >
            {copy.body}
          </p>
        </div>

        <div
          className="grid grid-cols-2 gap-2.5 [grid-area:cta] sm:flex sm:flex-wrap sm:items-center sm:gap-3 lg:self-start"
          style={fadeUp(0.4)}
        >
          <Cta href={href("portfolio", locale)} className="col-span-2">
            {copy.ads}
            <ArrowUpRight
              size={16}
              className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </Cta>
          <Cta href={href("contact", locale)} variant="ghost" className="col-span-2">
            {copy.meeting}
          </Cta>
        </div>

        <div className="relative [grid-area:reel]">
          <div className="relative mx-auto grid w-full max-w-[660px] grid-cols-1 items-center gap-5 lg:h-[min(780px,calc(100svh-130px))] lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
            <AdColumn
              ads={COLUMN_A}
              onSelect={showInPhone}
              locale={locale}
              className="hidden lg:block"
            />

            <div className="relative mx-auto">
              <PhoneReel
                ads={ADS}
                index={index}
                onIndexChange={setIndex}
                phoneClassName="w-[min(56vw,270px)] lg:w-[clamp(230px,calc((100svh-240px)*0.478),318px)]"
              />

              {/* Counters floating around the phone, only for an ad with real stats in AD_STATS */}
              <FloatingStat
                className="left-0 top-[17%] -translate-x-[40%] sm:-translate-x-[74%]"
                icon={<Eye size={15} />}
                label={copy.views}
                value={stats?.views}
                locale={locale}
                stepKey={index}
              />
              <FloatingStat
                className="left-0 top-[60%] -translate-x-[34%] sm:-translate-x-[62%]"
                icon={<Heart size={15} />}
                label={copy.likes}
                value={stats?.likes}
                locale={locale}
                stepKey={index}
              />
              <FloatingStat
                className="right-0 top-[36%] translate-x-[36%] sm:translate-x-[66%]"
                icon={<Users size={15} />}
                label={copy.leads}
                value={stats?.leads}
                locale={locale}
                prefix="+"
                stepKey={index}
                accent
              />
            </div>

            <AdColumn
              ads={COLUMN_B}
              onSelect={showInPhone}
              locale={locale}
              reverse
              className="hidden lg:block"
            />
          </div>
        </div>
      </Container>
    </section>
  );
}

/**
 * A column of muted ad previews drifting endlessly — no link to the scroll.
 * Large screens only, filled once the page has loaded: phones download none
 * of it, and only the tiles inside the column fetch their clip.
 */
function AdColumn({
  ads,
  reverse = false,
  onSelect,
  locale,
  className,
}: {
  ads: Ad[];
  reverse?: boolean;
  onSelect: (ad: Ad) => void;
  locale: Locale;
  className?: string;
}) {
  const enabled = useDeferredMedia();
  const root = useRef<HTMLDivElement | null>(null);

  return (
    <div
      ref={root}
      className={cn(
        "group/col relative h-full overflow-hidden opacity-60 transition-opacity duration-500 hover:opacity-100 [mask-image:linear-gradient(180deg,transparent,black_14%,black_86%,transparent)]",
        className,
      )}
    >
      {enabled ? (
        <ul
          className="flex flex-col group-hover/col:[animation-play-state:paused] motion-reduce:[animation:none]"
          style={{
            animation: `rev-marquee-y ${ads.length * 6}s linear infinite`,
            animationDirection: reverse ? "reverse" : "normal",
          }}
        >
          {[...ads, ...ads].map((ad, i) => {
            const media = adMedia(ad.id);
            const duplicate = i >= ads.length;
            return (
              <li key={`${ad.id}-${i}`} className="pb-4" aria-hidden={duplicate}>
                <button
                  type="button"
                  tabIndex={duplicate ? -1 : 0}
                  onClick={() => onSelect(ad)}
                  aria-label={
                    locale === "fr"
                      ? `Afficher l'ad « ${ad.title.fr} » dans le téléphone`
                      : `Show the “${ad.title.en}” ad in the phone`
                  }
                  className="relative block aspect-[9/16] w-full overflow-hidden rounded-2xl border border-border bg-card transition-colors duration-300 hover:border-primary/50"
                >
                  <LazyVideo
                    src={media.preview}
                    still={{ src: media.stillSrc, srcSet: media.stillSrcSet }}
                    sizes="160px"
                    root={root}
                    rootMargin="25% 0px"
                    className="h-full w-full"
                  />
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

function FloatingStat({
  icon,
  label,
  value,
  prefix = "",
  accent = false,
  stepKey,
  locale,
  className,
}: {
  icon: ReactNode;
  label: string;
  value: number | undefined;
  prefix?: string;
  accent?: boolean;
  stepKey: number;
  locale: Locale;
  className?: string;
}) {
  if (value === undefined) return null;
  return (
    <div className={cn("pointer-events-none absolute z-10", className)}>
      <div className="flex items-center gap-2.5 rounded-xl border border-border bg-card/85 px-3 py-2 sm:rounded-2xl sm:px-4 sm:py-3">
        <span
          className={cn(
            "grid h-7 w-7 shrink-0 place-items-center rounded-lg sm:h-9 sm:w-9 sm:rounded-xl",
            accent ? "bg-primary text-primary-foreground" : "bg-elevated text-primary",
          )}
        >
          {icon}
        </span>
        <span>
          <span className="block text-xs text-muted-foreground sm:text-xs">{label}</span>
          <CountUp
            key={stepKey}
            value={value}
            prefix={prefix}
            locale={locale}
            className="block font-display text-[15px] font-medium tabular-nums tracking-tight sm:text-xl"
          />
        </span>
      </div>
    </div>
  );
}

/** Counts up to `value` when mounted; renders the final value on the server. */
function CountUp({
  value,
  prefix = "",
  locale,
  className,
}: {
  value: number;
  prefix?: string;
  locale: Locale;
  className?: string;
}) {
  const [shown, setShown] = useState(value);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const from = Math.round(value * 0.6);
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / 900);
      const eased = 1 - Math.pow(1 - t, 3);
      setShown(Math.round(from + (value - from) * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return (
    <span className={className}>
      {prefix}
      {formatCount(shown, locale)}
    </span>
  );
}
