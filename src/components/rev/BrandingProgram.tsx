import { ArrowUpRight, Check } from "lucide-react";

import { adMedia } from "@/lib/ads";
import { WHATSAPP_DISPLAY, whatsappUrl } from "@/lib/contact";
import { href, useLocale } from "@/lib/i18n";
import { Container, Cta, Section, SectionHeading } from "./ui";
import { Reveal } from "./Reveal";
import { LazyVideo } from "./LazyVideo";
import { IPhone, SCREEN_VIDEO_AREA, StatusBar, TabBar } from "./IPhone";

const COPY = {
  fr: {
    eyebrow: "Programme mensuel",
    title: "Notre stratégie de personal branding immobilier.",
    description:
      "Pour les agents et les promoteurs qui veulent devenir la référence de leur marché. Scripté, filmé, monté, publié : du contenu qui vous garde devant les acheteurs toute l'année.",
    badge: "Pack mensuel",
    pack: "Pack 4 vidéos",
    packNote: "4 vidéos stratégiques chaque mois",
    from: "à partir de",
    price: "1 800 €",
    unit: "/ mois",
    features: [
      "4 vidéos stratégiques par mois",
      "Pensées pour Instagram, TikTok et YouTube Shorts",
      "Stratégie de contenu et calendrier de publication",
      "Scripts, hooks et direction créative inclus",
      "Jusqu'à 2 lieux de tournage par mois",
      "Engagement 3 mois",
    ],
    cta: "Réserver un appel",
  },
  en: {
    eyebrow: "Monthly programme",
    title: "Our real estate personal branding strategy.",
    description:
      "For agents and developers who want to become the go-to name in their market. Scripted, filmed, edited, published: content that keeps you in front of buyers all year round.",
    badge: "Monthly package",
    pack: "4-video package",
    packNote: "4 strategic videos every month",
    from: "from",
    price: "€1,800",
    unit: "/ month",
    features: [
      "4 strategic videos per month",
      "Built for Instagram, TikTok and YouTube Shorts",
      "Content strategy and posting calendar",
      "Scripts, hooks and creative direction included",
      "Up to 2 filming locations per month",
      "3-month commitment",
    ],
    cta: "Book a call",
  },
} as const;

export function BrandingProgram() {
  const locale = useLocale();
  const copy = COPY[locale];
  const media = adMedia("ad-09");

  return (
    <Section id="personal-branding" className="border-t border-border/70">
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-16">
          <div>
            <SectionHeading eyebrow={copy.eyebrow} title={copy.title} description={copy.description} />

            <Reveal delay={120} className="mt-8 sm:mt-10">
              <article className="relative rounded-2xl border border-primary bg-card p-5 sm:p-7 md:p-8">
                <span className="absolute -top-3 right-6 rounded-lg bg-primary px-3 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-primary-foreground">
                  {copy.badge}
                </span>
                <div className="flex flex-wrap items-end justify-between gap-6">
                  <div>
                    <h3 className="font-display text-xl font-medium tracking-tight">{copy.pack}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{copy.packNote}</p>
                  </div>
                  <p className="text-right">
                    <span className="block text-xs text-muted-foreground">{copy.from}</span>
                    <span className="font-display text-[2.4rem] font-medium leading-none tracking-[-0.03em] text-primary">
                      {copy.price}
                    </span>
                    <span className="ml-1.5 text-sm text-muted-foreground">{copy.unit}</span>
                  </p>
                </div>

                <ul className="mt-8 grid gap-3 border-t border-border pt-7 sm:grid-cols-2">
                  {copy.features.map((feature) => (
                    <li key={feature} className="flex gap-3 text-sm leading-relaxed">
                      <Check size={15} className="mt-1 shrink-0 text-primary" />
                      <span className="text-foreground/85">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-9 flex flex-wrap gap-3">
                  <Cta href={href("contact", locale)}>
                    {copy.cta}
                    <ArrowUpRight size={16} />
                  </Cta>
                  <Cta href={whatsappUrl(locale)} variant="ghost">
                    WhatsApp · {WHATSAPP_DISPLAY[locale]}
                  </Cta>
                </div>
              </article>
            </Reveal>
          </div>

          <Reveal delay={200} className="hidden justify-center sm:flex">
            <IPhone className="w-[min(72vw,320px)]">
              <StatusBar />
              <div className={`${SCREEN_VIDEO_AREA} overflow-hidden bg-black`}>
                <LazyVideo
                  src={media.preview}
                  still={{ src: media.stillSrc, srcSet: media.stillSrcSet }}
                  sizes="320px"
                  className="h-full w-full"
                />
              </div>
              <TabBar />
            </IPhone>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
