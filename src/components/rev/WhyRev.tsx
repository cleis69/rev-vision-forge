import { Gem, Compass, Target, Cpu } from "lucide-react";

import { useTr } from "@/lib/i18n";
import { Container, Section, SectionHeading } from "./ui";
import { Reveal } from "./Reveal";

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
      </Container>
    </Section>
  );
}
