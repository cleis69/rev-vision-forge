import { Container, Section, SectionHeading } from "./ui";
import { Reveal } from "./Reveal";

const STEPS = [
  { label: "Bien immobilier", note: "Analyse du bien et positionnement" },
  { label: "Production Visuelle", note: "Photo, vidéo, drone, Matterport, 3D" },
  { label: "Création de contenu", note: "Narration, formats courts, personal branding" },
  { label: "Réseaux sociaux", note: "Distribution organique et éditoriale" },
  { label: "Campagnes publicitaires", note: "Meta Ads, Google Ads, TikTok Ads" },
  { label: "Landing Page", note: "Pages de conversion à forte intention" },
  { label: "HubSpot CRM", note: "Centralisation de la donnée commerciale" },
  { label: "Qualification automatique", note: "Scoring et routage des leads" },
  { label: "Automatisation", note: "Séquences email et WhatsApp" },
  { label: "Prospects qualifiés", note: "Rendez-vous réellement exploitables" },
  { label: "Plus de ventes", note: "Délai de commercialisation réduit" },
];

export function Ecosystem() {
  return (
    <Section id="about">
      <Container>
        <SectionHeading
          eyebrow="Notre écosystème"
          title="Un système connecté, du bien immobilier à la signature."
          description="Chaque étape alimente la suivante. Le contenu crée l'attention, la stratégie la convertit, l'automatisation la démultiplie."
        />

        <div className="relative mt-20">
          <div
            className="absolute left-[15px] top-0 h-full w-px bg-gradient-to-b from-transparent via-border to-transparent md:left-1/2"
            aria-hidden
          />
          <ol className="space-y-4 md:space-y-0">
            {STEPS.map((step, i) => (
              <Reveal
                as="li"
                key={step.label}
                delay={i * 60}
                className="relative pl-12 md:grid md:grid-cols-2 md:gap-16 md:pl-0"
              >
                <span
                  className="absolute left-0 top-6 grid h-8 w-8 place-items-center rounded-full border border-border bg-card text-[11px] text-muted-foreground md:left-1/2 md:-translate-x-1/2"
                  aria-hidden
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div
                  className={
                    i % 2 === 0 ? "md:col-start-1 md:pr-16 md:text-right" : "md:col-start-2 md:pl-16"
                  }
                >
                  <div className="surface p-6 transition-all duration-500 hover:-translate-y-1 hover:border-primary/30 md:my-2">
                    <h3 className="font-display text-lg font-medium tracking-tight">
                      {step.label}
                    </h3>
                    <p className="mt-1.5 text-sm text-muted-foreground">{step.note}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </Container>
    </Section>
  );
}
