import { ArrowUpRight } from "lucide-react";

import { Container, Cta, PageHero, Section } from "@/components/rev/ui";
import { Reveal } from "@/components/rev/Reveal";
import { FinalCta } from "@/components/rev/FinalCta";
import { ServiceVisual } from "@/components/rev/ServiceVisuals";
import { cn } from "@/lib/utils";
import { href, useLocale, type Locale } from "@/lib/i18n";
import { photo } from "@/lib/images";

const architecture = photo("work-architecture");

type Service = {
  title: string;
  alt: string;
  intro: string;
  deliverables: string[];
  benefits: string[];
  process: string[];
};

/** Anchor ids, shared by both languages (the home page links to the anchors). */
const PILLARS = [
  { id: "production-visuelle" },
  { id: "marketing" },
  { id: "acquisition" },
  { id: "automatisation" },
];

const COPY: Record<
  Locale,
  {
    eyebrow: string;
    title: string;
    description: string;
    imageAlt: string;
    deliverables: string;
    benefits: string;
    process: string;
    cta: string;
    services: Service[];
  }
> = {
  fr: {
    eyebrow: "Expertises",
    title: "Quatre piliers, un seul [[moteur de croissance]].",
    description:
      "REV n'assemble pas des prestations isolées. Chaque expertise alimente la suivante : le contenu crée l'attention, l'acquisition la capte, l'automatisation la convertit.",
    imageAlt: "Façade en béton aux lignes géométriques dans l'ombre",
    deliverables: "Prestations",
    benefits: "Bénéfices",
    process: "Processus",
    cta: "Discuter de ce pilier",
    services: [
      {
        title: "Production Visuelle",
        alt: "Tour résidentielle vitrée photographiée au crépuscule",
        intro:
          "Nous produisons des images de niveau publicité automobile : lumière maîtrisée, cadrage architectural, direction artistique cohérente sur l'ensemble du programme.",
        deliverables: [
          "Photographie immobilière premium",
          "Vidéo cinématographique",
          "Drone (photo & vidéo)",
          "Visites virtuelles 3D",
          "Architecture 3D & visualisation",
          "Home staging virtuel",
        ],
        benefits: [
          "Un bien perçu au-dessus de sa catégorie de prix",
          "Des annonces qui arrêtent le scroll sur mobile",
          "Des assets réutilisables en organique et en paid",
        ],
        process: [
          "Repérage et direction artistique",
          "Tournage et captation multi-format",
          "Post-production et étalonnage",
          "Livraison des masters sous 24 à 72 heures",
        ],
      },
      {
        title: "Marketing & Contenu",
        alt: "Cartes de visite noires mates avec monogramme embossé",
        intro:
          "Le contenu construit l'autorité avant la visite. Nous transformons vos biens et votre expertise en une ligne éditoriale reconnaissable.",
        deliverables: [
          "Création de contenu stratégique",
          "Personal branding dirigeants & agents",
          "Social media (Instagram, LinkedIn, TikTok, YouTube)",
          "Direction artistique et identité de marque",
        ],
        benefits: [
          "Une marque mémorable, pas un catalogue d'annonces",
          "Un flux régulier de formats courts performants",
          "Des mandats entrants générés par la notoriété",
        ],
        process: [
          "Audit de positionnement et angles éditoriaux",
          "Calendrier mensuel et scripts",
          "Production et montage",
          "Publication, analyse, itération",
        ],
      },
      {
        title: "Acquisition & Génération de leads",
        alt: "Terrasse de penthouse surplombant une skyline de nuit",
        intro:
          "Nous connectons vos meilleurs contenus à des campagnes payantes et des pages de conversion pensées pour l'intention d'achat.",
        deliverables: [
          "Lead generation multicanal",
          "Meta Ads",
          "Google Ads",
          "TikTok Ads",
          "Acquisition organique & SEO local",
          "Landing pages haute conversion",
        ],
        benefits: [
          "Un coût par lead qualifié piloté chaque semaine",
          "Un pipeline prévisible, indépendant des portails",
          "Une attribution claire du média au contrat signé",
        ],
        process: [
          "Structure de comptes et audiences",
          "Création des landing pages et du tracking",
          "Tests créatifs et itérations hebdomadaires",
          "Scaling des campagnes rentables",
        ],
      },
      {
        title: "Automatisation & CRM",
        alt: "Jumeau numérique 3D d'un appartement en vue maison de poupée",
        intro:
          "Un lead non traité est un lead perdu. Nous industrialisons le suivi commercial pour que chaque opportunité reçoive une réponse en minutes.",
        deliverables: [
          "HubSpot CRM (structure & migration)",
          "Automatisation email",
          "Automatisation WhatsApp",
          "Lead scoring",
          "Lead routing",
          "Dashboards de performance",
        ],
        benefits: [
          "Temps de réponse divisé par dix",
          "Zéro lead oublié dans une boîte mail",
          "Une visibilité temps réel sur le pipeline",
        ],
        process: [
          "Cartographie du cycle de vente",
          "Paramétrage CRM et pipelines",
          "Séquences automatisées et scoring",
          "Formation des équipes et reporting",
        ],
      },
    ],
  },
  en: {
    eyebrow: "Services",
    title: "Four pillars, one [[growth engine]].",
    description:
      "REV doesn't bolt together isolated services. Each one feeds the next: content creates attention, acquisition captures it, automation converts it.",
    imageAlt: "Concrete façade with geometric lines in shadow",
    deliverables: "Deliverables",
    benefits: "Benefits",
    process: "Process",
    cta: "Discuss this pillar",
    services: [
      {
        title: "Visual Production",
        alt: "Glass residential tower photographed at dusk",
        intro:
          "We produce imagery on a par with car advertising: controlled light, architectural framing and consistent art direction across the whole development.",
        deliverables: [
          "Premium real estate photography",
          "Cinematic video",
          "Drone (photo & video)",
          "3D virtual tours",
          "3D architecture & visualisation",
          "Virtual home staging",
        ],
        benefits: [
          "A property perceived above its price bracket",
          "Listings that stop the scroll on mobile",
          "Assets you can reuse in organic and paid",
        ],
        process: [
          "Location scouting and art direction",
          "Multi-format shoot",
          "Post-production and colour grading",
          "Masters delivered within 24 to 72 hours",
        ],
      },
      {
        title: "Marketing & Content",
        alt: "Matte black business cards with an embossed monogram",
        intro:
          "Content builds authority before the viewing. We turn your properties and your expertise into a recognisable editorial line.",
        deliverables: [
          "Strategic content creation",
          "Personal branding for executives & agents",
          "Social media (Instagram, LinkedIn, TikTok, YouTube)",
          "Art direction and brand identity",
        ],
        benefits: [
          "A memorable brand, not a catalogue of listings",
          "A steady flow of high-performing short formats",
          "Inbound listings driven by your reputation",
        ],
        process: [
          "Positioning audit and editorial angles",
          "Monthly calendar and scripts",
          "Production and editing",
          "Publishing, analysis, iteration",
        ],
      },
      {
        title: "Acquisition & Lead Generation",
        alt: "Penthouse terrace overlooking a city skyline at night",
        intro:
          "We connect your best content to paid campaigns and conversion pages designed around purchase intent.",
        deliverables: [
          "Multichannel lead generation",
          "Meta Ads",
          "Google Ads",
          "TikTok Ads",
          "Organic acquisition & local SEO",
          "High-converting landing pages",
        ],
        benefits: [
          "Cost per qualified lead managed every week",
          "A predictable pipeline, independent of the portals",
          "Clear attribution from media to signed contract",
        ],
        process: [
          "Account structure and audiences",
          "Landing pages and tracking set-up",
          "Creative testing and weekly iterations",
          "Scaling the profitable campaigns",
        ],
      },
      {
        title: "Automation & CRM",
        alt: "3D digital twin of an apartment in dollhouse view",
        intro:
          "An unanswered lead is a lost lead. We systematise sales follow-up so that every opportunity gets a reply within minutes.",
        deliverables: [
          "HubSpot CRM (structure & migration)",
          "Email automation",
          "WhatsApp automation",
          "Lead scoring",
          "Lead routing",
          "Performance dashboards",
        ],
        benefits: [
          "Response time cut tenfold",
          "Zero leads forgotten in an inbox",
          "Real-time visibility on your pipeline",
        ],
        process: [
          "Mapping the sales cycle",
          "CRM and pipeline set-up",
          "Automated sequences and scoring",
          "Team training and reporting",
        ],
      },
    ],
  },
};

export function ServicesPage() {
  const locale = useLocale();
  const copy = COPY[locale];
  return (
    <>
      <PageHero
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
        image={architecture}
        imageAlt={copy.imageAlt}
      />

      {PILLARS.map((pillar, i) => {
        const service = copy.services[i];
        if (!service) return null;
        const flip = i % 2 === 1;
        return (
          <Section
            key={pillar.id}
            id={pillar.id}
            className={i > 0 ? "border-t border-border/70" : ""}
          >
            <Container>
              <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16">
                <Reveal className={cn(flip && "lg:order-2")}>
                  <p className="font-display text-sm tabular-nums text-primary">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <h2 className="mt-3 font-display text-[clamp(1.6rem,3vw,2.6rem)] font-medium leading-[1.08] tracking-[-0.03em]">
                    {service.title}
                  </h2>
                  <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted-foreground md:text-base">
                    {service.intro}
                  </p>
                  <dl className="mt-7 grid gap-x-8 border-t border-border/70 sm:grid-cols-2">
                    <div className="border-b border-border/70 py-4 sm:border-b-0">
                      <dt className="text-xs text-muted-foreground">{copy.deliverables}</dt>
                      <dd className="mt-2">
                        <ul className="space-y-1.5 text-sm text-foreground/90">
                          {service.deliverables.map((d) => (
                            <li key={d}>{d}</li>
                          ))}
                        </ul>
                      </dd>
                    </div>
                    <div className="py-4">
                      <dt className="text-xs text-muted-foreground">{copy.benefits}</dt>
                      <dd className="mt-2">
                        <ul className="space-y-1.5 text-sm text-foreground/90">
                          {service.benefits.map((b) => (
                            <li key={b}>{b}</li>
                          ))}
                        </ul>
                      </dd>
                    </div>
                  </dl>
                  <ol className="border-t border-border/70 pt-4 text-sm text-muted-foreground">
                    <li className="mb-2 text-xs">{copy.process}</li>
                    <li className="flex flex-wrap gap-x-2 gap-y-1">
                      {service.process.map((step, idx) => (
                        <span key={step} className="whitespace-nowrap">
                          <span className="tabular-nums text-primary">{idx + 1}</span> {step}
                          {idx < service.process.length - 1 ? <span className="pl-2 text-border">·</span> : null}
                        </span>
                      ))}
                    </li>
                  </ol>
                  <div className="mt-7">
                    <Cta href={href("contact", locale)}>
                      {copy.cta}
                      <ArrowUpRight size={16} />
                    </Cta>
                  </div>
                </Reveal>
                <Reveal delay={120} className={cn(flip && "lg:order-1")}>
                  <ServiceVisual id={pillar.id} locale={locale} />
                </Reveal>
              </div>
            </Container>
          </Section>
        );
      })}

      <FinalCta />
    </>
  );
}
