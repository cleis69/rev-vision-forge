import { useTr } from "@/lib/i18n";
import { Container, Section, SectionHeading } from "./ui";
import { Reveal } from "./Reveal";

const PILLARS = [
  {
    title: "Production Premium",
    body: "Des standards empruntés à la mode et à l'automobile de luxe, appliqués à l'immobilier.",
  },
  {
    title: "Marketing Stratégique",
    body: "Positionnement, offre et récit définis avant la première image capturée.",
  },
  {
    title: "Lead Generation",
    body: "Acquisition construite autour de l'intention d'achat, pas des impressions.",
  },
  {
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
          description={tr(
            "Quatre expertises dont la valeur se démultiplie lorsqu'elles vivent dans une seule équipe.",
          )}
        />

        <ul className="mt-8 grid border-t border-border sm:mt-10 sm:grid-cols-2 sm:gap-x-14 lg:mt-12">
          {PILLARS.map(({ title, body }, i) => (
            <Reveal
              as="li"
              key={title}
              delay={(i % 2) * 60}
              className="border-b border-border/70 py-5 sm:py-6"
            >
              <h3 className="font-display text-[19px] font-medium leading-snug tracking-tight md:text-[22px]">
                {tr(title)}
              </h3>
              <p className="mt-1.5 max-w-md text-sm leading-relaxed text-muted-foreground md:text-[15px]">
                {tr(body)}
              </p>
            </Reveal>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
