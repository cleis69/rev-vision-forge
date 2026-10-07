import { useEffect, useState } from "react";
import { Gem, Compass, Target, Cpu } from "lucide-react";

import { prefersReducedMotion } from "@/lib/motion";
import { useTr } from "@/lib/i18n";
import { Container, Section, SectionHeading } from "./ui";
import { Reveal, useReveal } from "./Reveal";

const PILLARS = [
  {
    icon: Gem,
    title: "Production Premium",
    body: "Des standards empruntés à la mode et à l'automobile de luxe, appliqués à l'immobilier.",
  },
  {
    icon: Compass,
    title: "Marketing Stratégique",
    body: "Positionnement, offre et récit définis avant la première image capturée.",
  },
  {
    icon: Target,
    title: "Lead Generation",
    body: "Acquisition construite autour de l'intention d'achat, pas des impressions.",
  },
  {
    icon: Cpu,
    title: "Automatisation CRM",
    body: "HubSpot, routage et relances qui gardent chaque opportunité vivante.",
  },
];

const STATS = [
  { value: 250, suffix: "+", label: "Projets réalisés" },
  { value: 98, suffix: "%", label: "Clients satisfaits" },
  { value: 24, suffix: "h", label: "Délai de livraison" },
  { value: 7, suffix: "+", label: "Années d'expérience" },
];

function Counter({ value, suffix }: { value: number; suffix: string }) {
  const { ref, revealed } = useReveal<HTMLParagraphElement>();
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (!revealed) return;
    if (prefersReducedMotion()) {
      setShown(value);
      return;
    }
    // 1.8 s ease-out count, as before ("power2.out").
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / 1800);
      setShown(Math.round(value * (1 - (1 - p) ** 2)));
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [revealed, value]);

  return (
    <p
      ref={ref}
      className="font-display text-[clamp(2.4rem,5vw,3.6rem)] font-medium leading-none tracking-[-0.04em]"
    >
      <span>{shown}</span>
      <span className="text-primary">{suffix}</span>
    </p>
  );
}

const EN: Record<string, string> = {
  "Pourquoi REV": "Why REV",
  "Un partenaire, pas un prestataire.": "A partner, not a supplier.",
  "Quatre expertises dont la valeur se démultiplie lorsqu'elles vivent dans une seule équipe.":
    "Four areas of expertise that multiply in value when they live in one team.",
  "Production Premium": "Premium production",
  "Des standards empruntés à la mode et à l'automobile de luxe, appliqués à l'immobilier.":
    "Standards borrowed from fashion and luxury cars, applied to real estate.",
  "Marketing Stratégique": "Strategic marketing",
  "Positionnement, offre et récit définis avant la première image capturée.":
    "Positioning, offer and story defined before the first frame is shot.",
  "Lead Generation": "Lead generation",
  "Acquisition construite autour de l'intention d'achat, pas des impressions.":
    "Acquisition built around buying intent, not impressions.",
  "Automatisation CRM": "CRM automation",
  "HubSpot, routage et relances qui gardent chaque opportunité vivante.":
    "HubSpot, routing and follow-ups that keep every opportunity alive.",
  "Projets réalisés": "Projects delivered",
  "Clients satisfaits": "Satisfied clients",
  "Délai de livraison": "Delivery time",
  "Années d'expérience": "Years of experience",
};

export function WhyRev() {
  const tr = useTr(EN);
  return (
    <Section className="border-t border-border/70">
      <Container>
        <SectionHeading
          eyebrow={tr("Pourquoi REV")}
          title={tr("Un partenaire, pas un prestataire.")}
          description={tr("Quatre expertises dont la valeur se démultiplie lorsqu'elles vivent dans une seule équipe.")}
        />

        <div className="mt-8 grid grid-cols-2 gap-2.5 sm:mt-10 sm:gap-4 lg:mt-12 lg:grid-cols-4">
          {PILLARS.map(({ icon: Icon, title, body }, i) => (
            <Reveal key={title} delay={i * 80}>
              <article className="surface h-full p-4 transition-all duration-500 hover:-translate-y-1 hover:border-primary/25 sm:p-6 lg:p-7">
                <span className="grid h-9 w-9 place-items-center rounded-xl border border-border bg-background/60 sm:h-11 sm:w-11">
                  <Icon size={18} className="text-primary" />
                </span>
                <h3 className="mt-4 font-display text-[15px] font-medium leading-snug tracking-tight sm:mt-5 sm:text-lg">{tr(title)}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground sm:text-sm">{tr(body)}</p>
              </article>
            </Reveal>
          ))}
        </div>

        <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-border pt-8 sm:mt-12 sm:pt-10 lg:grid-cols-4">
          {STATS.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 80}>
              <Counter value={stat.value} suffix={stat.suffix} />
              <p className="mt-3 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                {tr(stat.label)}
              </p>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
