import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { useLocale, useTr } from "@/lib/i18n";
import { Container, Section, SectionHeading } from "./ui";
import { Reveal } from "./Reveal";

const QUOTES = [
  {
    quote:
      "REV a transformé notre manière de commercialiser. Le contenu attire, le tunnel convertit, et le CRM ne laisse plus aucun lead refroidir.",
    name: "Directrice commerciale",
    role: "Promoteur immobilier",
  },
  {
    quote:
      "Nous cherchions un prestataire vidéo. Nous avons trouvé un partenaire de croissance. Nos délais de vente ont fondu en un trimestre.",
    name: "Fondateur",
    role: "Agence immobilière",
  },
  {
    quote:
      "La qualité de production est au niveau de l'automobile de luxe. L'acquisition et l'automatisation derrière font toute la différence.",
    name: "Agente indépendante",
    role: "Immobilier de prestige",
  },
];

const EN: Record<string, string> = {
  "Avis clients": "Client reviews",
  "Ce que disent nos partenaires.": "What our partners say.",
  "REV a transformé notre manière de commercialiser. Le contenu attire, le tunnel convertit, et le CRM ne laisse plus aucun lead refroidir.":
    "REV changed the way we market. The content attracts, the funnel converts, and the CRM never lets a lead go cold.",
  "Nous cherchions un prestataire vidéo. Nous avons trouvé un partenaire de croissance. Nos délais de vente ont fondu en un trimestre.":
    "We were looking for a video supplier. We found a growth partner. Our time to sell melted away within a quarter.",
  "La qualité de production est au niveau de l'automobile de luxe. L'acquisition et l'automatisation derrière font toute la différence.":
    "The production quality is on par with luxury car campaigns. The acquisition and automation behind it make all the difference.",
  "Directrice commerciale": "Sales director",
  "Promoteur immobilier": "Property developer",
  Fondateur: "Founder",
  "Agence immobilière": "Real estate agency",
  "Agente indépendante": "Independent agent",
  "Immobilier de prestige": "Luxury real estate",
  "Avis précédent": "Previous review",
  "Avis suivant": "Next review",
};

export function Testimonials() {
  const locale = useLocale();
  const tr = useTr(EN);
  const [index, setIndex] = useState(0);

  const go = useCallback((dir: number) => {
    setIndex((i) => (i + dir + QUOTES.length) % QUOTES.length);
  }, []);

  useEffect(() => {
    const id = setInterval(() => go(1), 7000);
    return () => clearInterval(id);
  }, [go]);

  const active = QUOTES[index] ?? QUOTES[0]!;

  return (
    <Section className="border-t border-border/70">
      <Container>
        <SectionHeading eyebrow={tr("Avis clients")} title={tr("Ce que disent nos partenaires.")} />

        <Reveal className="mt-8 sm:mt-10">
          <figure className="surface relative overflow-hidden p-6 sm:p-10 md:p-12">
            <blockquote
              key={index}
              className="max-w-3xl font-display text-[clamp(1.2rem,2.6vw,1.9rem)] font-medium leading-[1.3] tracking-[-0.02em] animate-fade-in"
            >
              {locale === "fr" ? `« ${active.quote} »` : `“${tr(active.quote)}”`}
            </blockquote>
            <figcaption className="mt-6 flex flex-wrap items-end justify-between gap-4 sm:mt-8">
              <div className="min-w-0">
                <p className="text-sm font-medium">{tr(active.name)}</p>
                <p className="mt-1 text-sm text-muted-foreground">{tr(active.role)}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="mr-3 text-xs tabular-nums text-muted-foreground">
                  {String(index + 1).padStart(2, "0")} / {String(QUOTES.length).padStart(2, "0")}
                </span>
                <button
                  type="button"
                  aria-label={tr("Avis précédent")}
                  onClick={() => go(-1)}
                  className="grid h-10 w-10 place-items-center rounded-lg border border-border transition-colors duration-300 hover:border-primary/50 hover:text-primary"
                >
                  <ArrowLeft size={16} />
                </button>
                <button
                  type="button"
                  aria-label={tr("Avis suivant")}
                  onClick={() => go(1)}
                  className="grid h-10 w-10 place-items-center rounded-lg border border-border transition-colors duration-300 hover:border-primary/50 hover:text-primary"
                >
                  <ArrowRight size={16} />
                </button>
              </div>
            </figcaption>
          </figure>
        </Reveal>
      </Container>
    </Section>
  );
}
