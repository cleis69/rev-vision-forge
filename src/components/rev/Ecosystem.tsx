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
      { label: "Production visuelle", note: "Photo, vidéo, drone, visite virtuelle 3D" },
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
      { label: "Visual production", note: "Photo, video, drone, 3D virtual tour" },
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
  const half = Math.ceil(STEPS.length / 2);
  return (
    <Section id="about" className="border-t border-border/70">
      <Container>
        <SectionHeading eyebrow={copy.eyebrow} title={copy.title} description={copy.description} />

        {/* The order is the point: each step feeds the next, down one column then the other. */}
        <ol
          className="mt-8 grid border-t border-border sm:mt-10 lg:mt-12 lg:grid-flow-col lg:grid-cols-2 lg:gap-x-14"
          style={{ gridTemplateRows: `repeat(${half}, auto)` }}
        >
          {STEPS.map((step, i) => {
            const last = i === STEPS.length - 1;
            return (
              <Reveal
                as="li"
                key={step.label}
                delay={(i % half) * 40}
                className="grid grid-cols-[2.25rem_minmax(0,1fr)] items-baseline gap-x-3 border-b border-border/70 py-3.5 sm:grid-cols-[2.25rem_13rem_minmax(0,1fr)] sm:py-4"
              >
                <span className="font-display text-sm tabular-nums text-primary">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3
                  className={cn(
                    "font-display text-[16px] font-medium leading-snug tracking-tight sm:text-[17px]",
                    last && "text-primary",
                  )}
                >
                  {step.label}
                </h3>
                <p className="col-start-2 text-[13px] leading-snug text-muted-foreground sm:col-start-3 sm:text-sm">
                  {step.note}
                </p>
              </Reveal>
            );
          })}
        </ol>
      </Container>
    </Section>
  );
}
