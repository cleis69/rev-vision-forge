import { useRef } from "react";
import { useGSAP } from "@gsap/react";

import { EASE, ensureGsap, prefersReducedMotion } from "@/lib/gsap";
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
  const timelineRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      const root = timelineRef.current;
      if (!root) return;
      const { gsap } = ensureGsap();
      const line = root.querySelector<HTMLElement>("[data-eco-line]");
      const nodes = root.querySelectorAll<HTMLElement>("[data-eco-node]");
      const segments = root.querySelectorAll<HTMLElement>("[data-eco-segment]");

      if (prefersReducedMotion()) {
        gsap.set([line, ...nodes, ...segments], { opacity: 1, scaleY: 1, scaleX: 1 });
        return;
      }

      const tl = gsap.timeline({
        scrollTrigger: { trigger: root, start: "top 78%", end: "bottom 70%", scrub: 0.6, once: false },
      });

      tl.fromTo(line, { scaleY: 0 }, { scaleY: 1, ease: "none", duration: STEPS.length });
      nodes.forEach((node, i) => {
        tl.fromTo(
          node,
          { opacity: 0, scale: 0.4 },
          { opacity: 1, scale: 1, duration: 0.4, ease: EASE },
          i * 0.92,
        );
      });
      segments.forEach((segment, i) => {
        tl.fromTo(
          segment,
          { scaleX: 0 },
          { scaleX: 1, duration: 0.5, ease: EASE },
          i * 0.92 + 0.12,
        );
      });
    },
    { scope: timelineRef },
  );

  return (
    <Section id="about">
      <Container>
        <SectionHeading
          eyebrow="Notre écosystème"
          title="Un système connecté, du bien immobilier à la signature."
          description="Chaque étape alimente la suivante. Le contenu crée l'attention, la stratégie la convertit, l'automatisation la démultiplie."
        />

        <div className="relative mt-20" ref={timelineRef}>
          <div
            data-eco-line
            className="absolute left-[15px] top-0 h-full w-px origin-top bg-gradient-to-b from-transparent via-primary/45 to-transparent md:left-1/2"
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
                  data-eco-node
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
                  <span
                    data-eco-segment
                    aria-hidden
                    className={
                      i % 2 === 0
                        ? "absolute left-[15px] top-10 hidden h-px w-10 bg-primary/40 md:left-1/2 md:block md:origin-right md:-translate-x-full"
                        : "absolute left-[15px] top-10 hidden h-px w-10 origin-left bg-primary/40 md:left-1/2 md:block"
                    }
                  />
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
