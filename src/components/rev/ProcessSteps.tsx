import type { ReactNode } from "react";
import { ArrowUpRight, CalendarCheck, Check, Focus } from "lucide-react";

import { adMedia } from "@/lib/ads";
import { href, useLocale, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Container, Cta, Section, SectionHeading } from "./ui";
import { Reveal } from "./Reveal";
import { LazyVideo } from "./LazyVideo";

const COPY = {
  fr: {
    eyebrow: "Process",
    title: "Simple comme un, deux, trois.",
    description: "De la réservation à la livraison, vous savez toujours où en est votre tournage.",
    cta: "Voir nos packs",
    step: "Étape",
    steps: [
      { title: "Réservez votre tournage", body: "En ligne, par téléphone ou sur WhatsApp, en quelques minutes." },
      { title: "Choisissez votre pack", body: "Les formats et les options dont votre bien ou votre marque a besoin." },
      { title: "Jour de tournage", body: "Notre équipe arrive sur place avec le script et les hooks prêts à tourner." },
      { title: "Livraison des contenus", body: "Vos vidéos montées, sous-titrées et prêtes à publier, sous 3 à 7 jours." },
    ],
  },
  en: {
    eyebrow: "Process",
    title: "As easy as one, two, three.",
    description: "From booking to delivery, you always know where your shoot stands.",
    cta: "See our packages",
    step: "Step",
    steps: [
      { title: "Book your shoot", body: "Online, by phone or on WhatsApp, in a few minutes." },
      { title: "Choose your package", body: "The formats and options your property or your brand needs." },
      { title: "Shoot day", body: "Our team arrives on site with the script and hooks ready to film." },
      { title: "Content delivery", body: "Your videos edited, subtitled and ready to post, within 3 to 7 days." },
    ],
  },
} as const;

const VISUALS: ((locale: Locale) => ReactNode)[] = [
  (l) => <BookingVisual locale={l} />,
  (l) => <PackVisual locale={l} />,
  () => <ShootVisual />,
  () => <DeliveryVisual />,
];

export function ProcessSteps() {
  const locale = useLocale();
  const copy = COPY[locale];
  const STEPS = copy.steps.map((step, i) => ({ ...step, visual: VISUALS[i]!(locale) }));
  return (
    <Section id="process" className="border-t border-border/70">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-8">
          <SectionHeading eyebrow={copy.eyebrow} title={copy.title} description={copy.description} />
          <Reveal>
            <Cta href={href("pricing", locale)} variant="ghost">
              {copy.cta}
              <ArrowUpRight size={16} />
            </Cta>
          </Reveal>
        </div>

        <ol className="-mx-5 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 [scrollbar-width:none] sm:mx-0 sm:mt-10 sm:grid sm:snap-none sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0 lg:mt-12 lg:grid-cols-4 [&::-webkit-scrollbar]:hidden">
          {STEPS.map((step, i) => (
            <Reveal as="li" key={step.title} delay={i * 90} className="w-[80%] shrink-0 snap-start sm:w-auto">
              <article className="surface group h-full overflow-hidden p-3">
                <div className="relative aspect-[5/4] overflow-hidden rounded-[calc(var(--radius-xl)-6px)] border border-border/60 bg-background sm:aspect-square">
                  {step.visual}
                  <span className="absolute left-3 top-3 z-10 rounded-full bg-black/60 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-primary backdrop-blur-md">
                    {copy.step} {i + 1}
                  </span>
                </div>
                <div className="px-3 pb-3 pt-5">
                  <h3 className="font-display text-lg font-medium tracking-tight">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </ol>
      </Container>
    </Section>
  );
}

/* ----------------------------------------------------------- step visuals */

const DAYS: Record<Locale, string[]> = {
  fr: ["L", "M", "M", "J", "V", "S", "D"],
  en: ["M", "T", "W", "T", "F", "S", "S"],
};

function BookingVisual({ locale }: { locale: Locale }) {
  // Two weeks of the calendar; the 14th is booked.
  const cells = Array.from({ length: 14 }, (_, i) => i + 9);
  return (
    <div className="flex h-full flex-col justify-center px-4 pb-4 pt-11">
      <div className="flex items-center justify-between text-xs">
        <span className="font-display font-medium">{locale === "fr" ? "Votre créneau" : "Your slot"}</span>
        <CalendarCheck size={15} className="text-primary" />
      </div>
      <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[10px] text-muted-foreground">
        {DAYS[locale].map((d, i) => (
          <span key={i} className="pb-1">
            {d}
          </span>
        ))}
        {cells.map((day, i) => (
          <span
            key={i}
            className={cn(
              "grid h-7 place-items-center rounded-md tabular-nums",
              day === 14 && "bg-primary font-medium text-primary-foreground",
              day !== 14 && "bg-card",
            )}
          >
            {day}
          </span>
        ))}
      </div>
      <div className="mt-3 flex gap-2 text-[11px]">
        {["09:00", "11:30", "15:00"].map((t) => (
          <span
            key={t}
            className={cn(
              "flex-1 rounded-lg border py-1 text-center tabular-nums",
              t === "11:30"
                ? "border-primary bg-primary/10 text-foreground"
                : "border-border text-muted-foreground",
            )}
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

function PackVisual({ locale }: { locale: Locale }) {
  const packs =
    locale === "fr"
      ? [
          { name: "Pack Photo", price: "290 €" },
          { name: "Pack Photo + Vidéo", price: "590 €", active: true },
          { name: "Pack 4 vidéos", price: "1 800 € / mois" },
        ]
      : [
          { name: "Photo package", price: "€290" },
          { name: "Photo + video package", price: "€590", active: true },
          { name: "4-video package", price: "€1,800 / mo" },
        ];
  return (
    <div className="flex h-full flex-col justify-center gap-2 px-4 pb-4 pt-11">
      {packs.map((p) => (
        <div
          key={p.name}
          className={cn(
            "flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-xs transition-colors",
            p.active ? "border-primary bg-primary/10" : "border-border bg-card",
          )}
        >
          <span className="flex items-center gap-2.5">
            <span
              className={cn(
                "grid h-4 w-4 shrink-0 place-items-center rounded-full border",
                p.active ? "border-primary bg-primary text-primary-foreground" : "border-border",
              )}
            >
              {p.active ? <Check size={10} strokeWidth={3} /> : null}
            </span>
            <span className={p.active ? "text-foreground" : "text-muted-foreground"}>{p.name}</span>
          </span>
          <span className="shrink-0 font-display font-medium tabular-nums text-primary">{p.price}</span>
        </div>
      ))}
    </div>
  );
}

function ShootVisual() {
  return (
    <div className="relative h-full bg-[radial-gradient(ellipse_at_center,color-mix(in_oklab,var(--primary)_10%,transparent),transparent_70%)]">
      {/* Viewfinder corners */}
      <span className="absolute left-5 top-12 h-6 w-6 border-l-2 border-t-2 border-foreground/70" />
      <span className="absolute right-5 top-12 h-6 w-6 border-r-2 border-t-2 border-foreground/70" />
      <span className="absolute bottom-12 left-5 h-6 w-6 border-b-2 border-l-2 border-foreground/70" />
      <span className="absolute bottom-12 right-5 h-6 w-6 border-b-2 border-r-2 border-foreground/70" />
      {/* Rule of thirds */}
      <span className="absolute inset-x-5 top-[38%] h-px bg-foreground/10" />
      <span className="absolute inset-x-5 top-[62%] h-px bg-foreground/10" />
      <span className="absolute inset-y-12 left-[36%] w-px bg-foreground/10" />
      <span className="absolute inset-y-12 left-[64%] w-px bg-foreground/10" />
      <Focus size={30} strokeWidth={1.4} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-primary" />
      <span className="absolute right-5 top-4 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.14em]">
        <span className="h-2 w-2 animate-pulse rounded-full bg-[#e5484d]" />
        Rec
      </span>
      <span className="absolute bottom-4 left-5 text-[10px] tabular-nums text-muted-foreground">
        00:12:48
      </span>
      <span className="absolute bottom-4 right-5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        4K · 9:16
      </span>
    </div>
  );
}

function DeliveryVisual() {
  const media = adMedia("ad-07");
  return (
    <LazyVideo
      src={media.preview}
      still={{ src: media.stillSrc, srcSet: media.stillSrcSet }}
      sizes="(min-width: 1024px) 270px, 80vw"
      className="h-full w-full transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
    />
  );
}
