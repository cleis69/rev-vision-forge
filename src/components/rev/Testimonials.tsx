import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { Container, Section, SectionHeading } from "./ui";
import { Reveal } from "./Reveal";

const QUOTES = [
  {
    quote:
      "REV a transformé notre manière de commercialiser. Le contenu attire, le tunnel convertit, et le CRM ne laisse plus aucun lead refroidir.",
    name: "Camille Vasseur",
    role: "Directrice commerciale, Meridian Développement",
  },
  {
    quote:
      "Nous cherchions un prestataire vidéo. Nous avons trouvé un partenaire de croissance. Nos délais de vente ont fondu en un trimestre.",
    name: "Yanis Berthier",
    role: "Fondateur, Alta Group",
  },
  {
    quote:
      "La qualité de production est au niveau de l'automobile de luxe. L'acquisition et l'automatisation derrière font toute la différence.",
    name: "Sofia Marchetti",
    role: "Agent indépendante, Orion Estates",
  },
];

export function Testimonials() {
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
        <SectionHeading eyebrow="Avis clients" title="Ce que disent nos partenaires." />

        <Reveal className="mt-14">
          <figure className="surface relative overflow-hidden p-10 md:p-16">
            <blockquote
              key={index}
              className="max-w-3xl font-display text-[clamp(1.35rem,3vw,2.1rem)] font-medium leading-[1.25] tracking-[-0.02em] animate-fade-in"
            >
              « {active.quote} »
            </blockquote>
            <figcaption className="mt-10 flex flex-wrap items-end justify-between gap-6">
              <div className="min-w-0">
                <p className="text-sm font-medium">{active.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">{active.role}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="mr-3 text-xs tabular-nums text-muted-foreground">
                  {String(index + 1).padStart(2, "0")} / {String(QUOTES.length).padStart(2, "0")}
                </span>
                <button
                  type="button"
                  aria-label="Avis précédent"
                  onClick={() => go(-1)}
                  className="grid h-10 w-10 place-items-center rounded-full border border-border transition-colors duration-300 hover:border-primary/50 hover:text-primary"
                >
                  <ArrowLeft size={16} />
                </button>
                <button
                  type="button"
                  aria-label="Avis suivant"
                  onClick={() => go(1)}
                  className="grid h-10 w-10 place-items-center rounded-full border border-border transition-colors duration-300 hover:border-primary/50 hover:text-primary"
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
