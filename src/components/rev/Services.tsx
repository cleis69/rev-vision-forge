import {
  Camera,
  Film,
  Plane,
  Box,
  Building2,
  Lightbulb,
  UserRound,
  Share2,
  Target,
  Megaphone,
  Search,
  Music2,
  LayoutTemplate,
  Database,
  Mail,
  MessageCircle,
  Route,
  BarChart3,
  DoorOpen,
  type LucideIcon,
} from "lucide-react";

import { Container, Section, SectionHeading } from "./ui";
import { Reveal } from "./Reveal";

type Group = {
  index: string;
  title: string;
  summary: string;
  items: { label: string; icon: LucideIcon }[];
};

const GROUPS: Group[] = [
  {
    index: "01",
    title: "Production Visuelle",
    summary: "Des images au niveau du luxe automobile, pensées pour arrêter le scroll.",
    items: [
      { label: "Photographie Immobilière", icon: Camera },
      { label: "Vidéo cinématographique", icon: Film },
      { label: "Room Tour", icon: DoorOpen },
      { label: "Drone", icon: Plane },
      { label: "Matterport", icon: Box },
      { label: "Architecture 3D", icon: Building2 },
    ],
  },
  {
    index: "02",
    title: "Marketing",
    summary: "Positionnement, récit et contenu qui créent le désir avant la première visite.",
    items: [
      { label: "Stratégie de contenu", icon: Lightbulb },
      { label: "Personal Branding", icon: UserRound },
      { label: "Réseaux sociaux", icon: Share2 },
    ],
  },
  {
    index: "03",
    title: "Growth",
    summary: "Acquisition payante et organique conçue pour générer du pipeline qualifié.",
    items: [
      { label: "Lead Generation", icon: Target },
      { label: "Meta Ads", icon: Megaphone },
      { label: "Google Ads", icon: Search },
      { label: "TikTok Ads", icon: Music2 },
      { label: "Landing Pages", icon: LayoutTemplate },
    ],
  },
  {
    index: "04",
    title: "Automation",
    summary: "L'infrastructure qui relance, qualifie et mesure pendant que vous vendez.",
    items: [
      { label: "HubSpot CRM", icon: Database },
      { label: "WhatsApp Automation", icon: MessageCircle },
      { label: "Email Automation", icon: Mail },
      { label: "Lead Routing", icon: Route },
      { label: "Dashboards", icon: BarChart3 },
    ],
  },
];

export function Services() {
  return (
    <Section id="services" className="border-t border-border/70">
      <Container>
        <SectionHeading
          eyebrow="Nos expertises"
          title="Quatre disciplines. Un seul moteur de croissance."
          description="Nous ne vendons pas des shootings. Nous construisons toute la couche commerciale autour de vos biens."
        />

        <div className="mt-16 grid gap-5 md:grid-cols-2">
          {GROUPS.map((group, gi) => (
            <Reveal key={group.title} delay={gi * 90}>
              <article className="surface group h-full p-8 transition-all duration-500 hover:-translate-y-1 hover:border-primary/25 hover:shadow-[var(--shadow-lift)] md:p-10">
                <div className="flex items-baseline gap-3">
                  <span className="font-display text-xs tracking-[0.2em] text-primary">
                    {group.index}
                  </span>
                  <h3 className="font-display text-2xl font-medium tracking-tight">
                    {group.title}
                  </h3>
                </div>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
                  {group.summary}
                </p>
                <ul className="mt-8 space-y-1">
                  {group.items.map(({ label, icon: Icon }) => (
                    <li
                      key={label}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors duration-300 hover:bg-elevated hover:text-foreground"
                    >
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-border bg-background/60">
                        <Icon size={15} />
                      </span>
                      <span className="min-w-0 truncate">{label}</span>
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
