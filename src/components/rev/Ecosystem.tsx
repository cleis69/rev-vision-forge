import { ArrowRight } from "lucide-react";

import { useCopy } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Container, Section, SectionHeading } from "./ui";
import { Reveal } from "./Reveal";

const COPY = {
  fr: {
    eyebrow: "Notre écosystème",
    title: "Un système connecté, du bien immobilier à la signature.",
    description:
      "Chaque étape alimente la suivante. Le contenu crée l'attention, la stratégie la convertit, l'automatisation la démultiplie.",
    steps: [
      { label: "Bien immobilier", note: "Analyse du bien et positionnement" },
      { label: "Production visuelle", note: "Photo, vidéo, drone, Matterport, 3D" },
      { label: "Création de contenu", note: "Narration, formats courts, personal branding" },
      { label: "Réseaux sociaux", note: "Distribution organique et éditoriale" },
      { label: "Campagnes publicitaires", note: "Meta Ads, Google Ads, TikTok Ads" },
      { label: "Landing page", note: "Pages de conversion à forte intention" },
      { label: "HubSpot CRM", note: "Centralisation de la donnée commerciale" },
      { label: "Qualification automatique", note: "Scoring et routage des leads" },
      { label: "Automatisation", note: "Séquences email et WhatsApp" },
      { label: "Prospects qualifiés", note: "Rendez-vous réellement exploitables" },
      { label: "Plus de ventes", note: "Délai de commercialisation réduit" },
    ],
  },
  en: {
    eyebrow: "Our ecosystem",
    title: "One connected system, from the property to the signed deal.",
    description:
      "Each step feeds the next. Content creates attention, strategy converts it, automation multiplies it.",
    steps: [
      { label: "The property", note: "Property analysis and positioning" },
      { label: "Visual production", note: "Photo, video, drone, Matterport, 3D" },
      { label: "Content creation", note: "Storytelling, short formats, personal branding" },
      { label: "Social media", note: "Organic and editorial distribution" },
      { label: "Ad campaigns", note: "Meta Ads, Google Ads, TikTok Ads" },
      { label: "Landing page", note: "High-intent conversion pages" },
      { label: "HubSpot CRM", note: "All sales data in one place" },
      { label: "Automatic qualification", note: "Lead scoring and routing" },
      { label: "Automation", note: "Email and WhatsApp sequences" },
      { label: "Qualified prospects", note: "Viewings that actually lead somewhere" },
      { label: "More sales", note: "Shorter time on the market" },
    ],
  },
};

export function Ecosystem() {
  const copy = useCopy(COPY);
  const STEPS = copy.steps;
  return (
    <Section id="about" className="border-t border-border/70">
      <Container>
        <SectionHeading eyebrow={copy.eyebrow} title={copy.title} description={copy.description} />

        <ol className="mt-8 grid grid-cols-2 gap-2.5 sm:mt-10 sm:grid-cols-3 sm:gap-3 lg:mt-12 lg:grid-cols-4">
          {STEPS.map((step, i) => {
            const last = i === STEPS.length - 1;
            return (
              <Reveal
                as="li"
                key={step.label}
                delay={(i % 4) * 60}
                className={cn(
                  "surface relative flex flex-col p-4 sm:p-5",
                  last && "col-span-2 border-primary/40 sm:col-span-1",
                )}
              >
                <span className="flex items-center justify-between text-[11px] font-medium tracking-[0.2em] text-primary">
                  {String(i + 1).padStart(2, "0")}
                  {!last ? (
                    <ArrowRight size={14} aria-hidden className="text-muted-foreground/60" />
                  ) : null}
                </span>
                <h3 className="mt-3 font-display text-[15px] font-medium leading-snug tracking-tight sm:text-base">
                  {step.label}
                </h3>
                <p className="mt-1 text-[13px] leading-snug text-muted-foreground">{step.note}</p>
              </Reveal>
            );
          })}
        </ol>
      </Container>
    </Section>
  );
}
