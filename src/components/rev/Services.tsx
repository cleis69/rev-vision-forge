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

import { useTr } from "@/lib/i18n";
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
      { label: "Visite virtuelle 3D", icon: Box },
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

const EN: Record<string, string> = {
  "Nos expertises": "Our services",
  "Quatre disciplines. Un seul moteur de croissance.": "Four disciplines. One growth engine.",
  "Nous ne vendons pas des shootings. Nous construisons toute la couche commerciale autour de vos biens.":
    "We don't sell photo shoots. We build the entire sales layer around your properties.",
  "Production Visuelle": "Visual production",
  "Des images au niveau du luxe automobile, pensées pour arrêter le scroll.":
    "Imagery on par with luxury car campaigns, designed to stop the scroll.",
  "Photographie Immobilière": "Real estate photography",
  "Vidéo cinématographique": "Cinematic video",
  "Room Tour": "Room tour",
  Drone: "Drone",
  "Visite virtuelle 3D": "3D virtual tour",
  "Architecture 3D": "3D architecture",
  Marketing: "Marketing",
  "Positionnement, récit et contenu qui créent le désir avant la première visite.":
    "Positioning, storytelling and content that create desire before the first viewing.",
  "Stratégie de contenu": "Content strategy",
  "Personal Branding": "Personal branding",
  "Réseaux sociaux": "Social media",
  Growth: "Growth",
  "Acquisition payante et organique conçue pour générer du pipeline qualifié.":
    "Paid and organic acquisition built to generate a qualified pipeline.",
  "Lead Generation": "Lead generation",
  "Meta Ads": "Meta Ads",
  "Google Ads": "Google Ads",
  "TikTok Ads": "TikTok Ads",
  "Landing Pages": "Landing pages",
  Automation: "Automation",
  "L'infrastructure qui relance, qualifie et mesure pendant que vous vendez.":
    "The infrastructure that follows up, qualifies and measures while you sell.",
  "HubSpot CRM": "HubSpot CRM",
  "WhatsApp Automation": "WhatsApp automation",
  "Email Automation": "Email automation",
  "Lead Routing": "Lead routing",
  Dashboards: "Dashboards",
};

export function Services() {
  const tr = useTr(EN);
  return (
    <Section id="services" className="border-t border-border/70">
      <Container>
        <SectionHeading
          eyebrow={tr("Nos expertises")}
          title={tr("Quatre disciplines. Un seul moteur de croissance.")}
          description={tr(
            "Nous ne vendons pas des shootings. Nous construisons toute la couche commerciale autour de vos biens.",
          )}
        />

        <ul className="mt-8 border-t border-border sm:mt-10 lg:mt-12">
          {GROUPS.map((group, gi) => (
            <Reveal
              as="li"
              key={group.title}
              delay={gi * 60}
              className="grid gap-x-10 gap-y-2 border-b border-border/70 py-6 lg:grid-cols-[minmax(0,17rem)_minmax(0,1fr)_minmax(0,1.1fr)] lg:items-baseline lg:py-7"
            >
              <h3 className="font-display text-[22px] font-medium leading-tight tracking-tight md:text-[26px]">
                {tr(group.title)}
              </h3>
              <p className="max-w-md text-sm leading-relaxed text-muted-foreground md:text-[15px]">
                {tr(group.summary)}
              </p>
              <ul className="flex flex-wrap gap-x-2.5 gap-y-1 text-sm text-foreground/90 max-lg:mt-1">
                {group.items.map(({ label }, i) => (
                  <li key={label} className="flex items-center gap-2.5 whitespace-nowrap">
                    {i > 0 ? (
                      <span aria-hidden className="size-1 rounded-full bg-primary/70" />
                    ) : null}
                    {tr(label)}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
