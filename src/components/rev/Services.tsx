import {
  Camera,
  Film,
  Plane,
  Box,
  Building2,
  Lightbulb,
  PenTool,
  UserRound,
  Share2,
  Target,
  Megaphone,
  Search,
  Music2,
  Filter,
  LayoutTemplate,
  Workflow,
  Database,
  Mail,
  MessageCircle,
  Route,
  BarChart3,
  type LucideIcon,
} from "lucide-react";

import { Container, Section, SectionHeading } from "./ui";
import { Reveal } from "./Reveal";

type Group = {
  title: string;
  summary: string;
  items: { label: string; icon: LucideIcon }[];
};

const GROUPS: Group[] = [
  {
    title: "Visual Production",
    summary: "Cinema-grade assets that make a property impossible to scroll past.",
    items: [
      { label: "Real Estate Photography", icon: Camera },
      { label: "Cinematic Videos", icon: Film },
      { label: "Drone", icon: Plane },
      { label: "Matterport", icon: Box },
      { label: "3D Architectural Visualization", icon: Building2 },
    ],
  },
  {
    title: "Marketing",
    summary: "Positioning, story and content that build desire before the first viewing.",
    items: [
      { label: "Creative Strategy", icon: Lightbulb },
      { label: "Content Creation", icon: PenTool },
      { label: "Personal Branding", icon: UserRound },
      { label: "Social Media", icon: Share2 },
    ],
  },
  {
    title: "Growth",
    summary: "Paid acquisition engineered for qualified buyer and seller pipeline.",
    items: [
      { label: "Lead Generation", icon: Target },
      { label: "Meta Ads", icon: Megaphone },
      { label: "Google Ads", icon: Search },
      { label: "TikTok Ads", icon: Music2 },
      { label: "Funnels", icon: Filter },
      { label: "Landing Pages", icon: LayoutTemplate },
    ],
  },
  {
    title: "Automation",
    summary: "The infrastructure that follows up, routes and reports while you sell.",
    items: [
      { label: "HubSpot CRM", icon: Database },
      { label: "Email Automation", icon: Mail },
      { label: "WhatsApp Automation", icon: MessageCircle },
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
          eyebrow="Services"
          title="Four disciplines. One growth engine."
          description="We do not sell shoots. We build the full commercial layer around your inventory."
        />

        <div className="mt-16 grid gap-5 md:grid-cols-2">
          {GROUPS.map((group, gi) => (
            <Reveal key={group.title} delay={gi * 90}>
              <article className="surface group h-full p-8 transition-all duration-500 hover:-translate-y-1 hover:border-primary/25 hover:shadow-[var(--shadow-lift)]">
                <div className="flex items-center gap-3">
                  <Workflow size={16} className="text-primary" />
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
