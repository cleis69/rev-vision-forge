import { useEffect, useRef, useState } from "react";
import {
  Camera,
  Clapperboard,
  Database,
  Filter,
  Home,
  LayoutTemplate,
  Megaphone,
  Share2,
  TrendingUp,
  UserCheck,
  Workflow,
  type LucideIcon,
} from "lucide-react";

import { useCopy } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Container, Section, SectionHeading } from "./ui";
import { Reveal } from "./Reveal";
import { useMotionAllowed } from "./SalesPlanDemo";

const COPY = {
  fr: {
    eyebrow: "Notre écosystème",
    title: "Un système [[connecté]], du bien immobilier à la signature.",
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
    title: "One [[connected]] system, from the property to the signed deal.",
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

/** One icon per step, in the order of the steps. */
const ICONS: LucideIcon[] = [
  Home,
  Camera,
  Clapperboard,
  Share2,
  Megaphone,
  LayoutTemplate,
  Database,
  Filter,
  Workflow,
  UserCheck,
  TrendingUp,
];

/*
 * The steps as tiles; a champagne light travels from the property to the
 * sale, one step after the other, while the grid is in sight (still, on the
 * last step, for visitors who prefer less motion).
 */
export function Ecosystem() {
  const copy = useCopy(COPY);
  const STEPS = copy.steps;
  const motion = useMotionAllowed();
  const grid = useRef<HTMLOListElement>(null);
  const [seen, setSeen] = useState(false);
  const [lit, setLit] = useState(STEPS.length - 1);

  useEffect(() => {
    const node = grid.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => setSeen(!!entry?.isIntersecting), {
      threshold: 0.35,
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!(seen && motion)) return;
    let step = 0;
    setLit(0);
    let timer = 0;
    const next = () => {
      step = (step + 1) % STEPS.length;
      setLit(step);
      // The light rests a little longer on the sale before starting again.
      timer = window.setTimeout(next, step === STEPS.length - 1 ? 2200 : 850);
    };
    timer = window.setTimeout(next, 850);
    return () => window.clearTimeout(timer);
  }, [seen, motion, STEPS.length]);

  return (
    <Section id="about" className="border-t border-border/70">
      <Container>
        <SectionHeading eyebrow={copy.eyebrow} title={copy.title} description={copy.description} />

        {/* The order is the point: each step feeds the next. */}
        <ol
          ref={grid}
          className="mt-8 grid grid-cols-2 gap-2 sm:mt-10 sm:grid-cols-3 sm:gap-2.5 lg:mt-12 lg:grid-cols-4"
        >
          {STEPS.map((step, i) => {
            const on = i === lit;
            const last = i === STEPS.length - 1;
            const Icon = ICONS[i] ?? TrendingUp;
            return (
              <Reveal as="li" key={step.label} delay={i * 35} className={cn(last && "col-span-2")}>
                <div
                  className={cn(
                    "flex h-full min-h-[8.5rem] flex-col justify-between gap-4 rounded-[14px] border p-4 transition-colors duration-500 sm:min-h-[9.5rem] sm:p-5",
                    on
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border/80 bg-card/40 text-foreground",
                  )}
                >
                  <span className="flex items-center justify-between">
                    <Icon size={20} strokeWidth={1.5} aria-hidden className={on ? "" : "text-primary"} />
                    <span
                      className={cn(
                        "text-xs tabular-nums transition-colors duration-500",
                        on ? "text-primary-foreground/70" : "text-muted-foreground",
                      )}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </span>
                  <span>
                    <h3 className="font-display text-[15px] font-medium leading-snug tracking-tight sm:text-[17px]">
                      {step.label}
                    </h3>
                    <p
                      className={cn(
                        "mt-1 text-[12.5px] leading-snug transition-colors duration-500 sm:text-[13px]",
                        on ? "text-primary-foreground/75" : "text-muted-foreground",
                      )}
                    >
                      {step.note}
                    </p>
                  </span>
                </div>
              </Reveal>
            );
          })}
        </ol>
      </Container>
    </Section>
  );
}
