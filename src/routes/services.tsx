import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight, Check } from "lucide-react";

import { Container, Cta, PageHero, Section } from "@/components/rev/ui";
import { Reveal } from "@/components/rev/Reveal";
import { FinalCta } from "@/components/rev/FinalCta";
import photography from "@/assets/work-photography.jpg";
import matterport from "@/assets/work-matterport.jpg";
import video from "@/assets/work-video.jpg";
import architecture from "@/assets/work-architecture.jpg";
import branding from "@/assets/work-branding.jpg";

const TITLE = "Expertises REV — Production visuelle, acquisition & automatisation";
const DESCRIPTION =
  "Photographie, vidéo, drone, Matterport, 3D, personal branding, Meta & Google Ads, landing pages, HubSpot CRM et automatisation : l'écosystème complet REV pour vendre plus vite.";

const SERVICES = [
  {
    id: "production-visuelle",
    index: "01",
    title: "Production Visuelle",
    image: photography,
    alt: "Tour résidentielle vitrée photographiée au crépuscule",
    intro:
      "Nous produisons des images de niveau publicité automobile : lumière maîtrisée, cadrage architectural, direction artistique cohérente sur l'ensemble du programme.",
    deliverables: [
      "Photographie immobilière premium",
      "Vidéo cinématographique",
      "Drone (photo & vidéo)",
      "Visites virtuelles Matterport",
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
    id: "marketing",
    index: "02",
    title: "Marketing & Contenu",
    image: branding,
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
    id: "acquisition",
    index: "03",
    title: "Acquisition & Génération de leads",
    image: video,
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
    id: "automatisation",
    index: "04",
    title: "Automatisation & CRM",
    image: matterport,
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
];

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Expertises"
        title="Quatre piliers, un seul moteur de croissance."
        description="REV n'assemble pas des prestations isolées. Chaque expertise alimente la suivante : le contenu crée l'attention, l'acquisition la capte, l'automatisation la convertit."
        image={architecture}
        imageAlt="Façade en béton aux lignes géométriques dans l'ombre"
      />

      {SERVICES.map((service, i) => (
        <Section
          key={service.id}
          id={service.id}
          className={i > 0 ? "border-t border-border/70" : ""}
        >
          <Container>
            <div className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-20">
              <Reveal className="lg:sticky lg:top-32 lg:self-start">
                <p className="font-display text-sm text-primary">{service.index}</p>
                <h2 className="mt-4 font-display text-[clamp(1.9rem,3.6vw,3rem)] font-medium leading-[1.05] tracking-[-0.03em]">
                  {service.title}
                </h2>
                <p className="mt-6 text-base leading-relaxed text-muted-foreground">
                  {service.intro}
                </p>
                <div className="mt-8 overflow-hidden rounded-2xl border border-border">
                  <img
                    src={service.image}
                    alt={service.alt}
                    loading="lazy"
                    width={1024}
                    height={768}
                    className="h-full w-full object-cover opacity-85"
                  />
                </div>
              </Reveal>

              <div className="space-y-10">
                <Reveal className="surface p-8">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                    Prestations
                  </p>
                  <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                    {service.deliverables.map((d) => (
                      <li key={d} className="flex items-start gap-3 text-sm text-foreground/85">
                        <Check size={15} className="mt-0.5 shrink-0 text-primary" />
                        {d}
                      </li>
                    ))}
                  </ul>
                </Reveal>

                <Reveal className="surface p-8" delay={80}>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                    Bénéfices
                  </p>
                  <ul className="mt-6 space-y-3">
                    {service.benefits.map((b) => (
                      <li key={b} className="text-sm leading-relaxed text-foreground/85">
                        {b}
                      </li>
                    ))}
                  </ul>
                </Reveal>

                <Reveal className="surface p-8" delay={160}>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                    Processus
                  </p>
                  <ol className="mt-6 space-y-4">
                    {service.process.map((step, idx) => (
                      <li key={step} className="flex gap-4">
                        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-border text-[11px] text-muted-foreground">
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                        <span className="text-sm leading-relaxed text-foreground/85">{step}</span>
                      </li>
                    ))}
                  </ol>
                </Reveal>

                <Reveal delay={240}>
                  <Cta href="/contact">
                    Discuter de ce pilier
                    <ArrowUpRight size={16} />
                  </Cta>
                </Reveal>
              </div>
            </div>
          </Container>
        </Section>
      ))}

      <FinalCta />
    </>
  );
}
