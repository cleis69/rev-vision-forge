import { ArrowUpRight } from "lucide-react";

import { href, useLocale, useTr } from "@/lib/i18n";
import { Container, Cta, Section, SectionHeading } from "./ui";
import { Reveal } from "./Reveal";
import { photo } from "@/lib/images";

const drone = photo("work-drone");
const interior = photo("work-interior");
const photography = photo("work-photography");

const CASES = [
  {
    client: "Promoteur · programme neuf",
    title: "42 lots vendus avant la livraison",
    image: drone,
    alt: "Vue aérienne d'un programme immobilier en bord de falaise au crépuscule",
    challenge:
      "Un programme côtier lancé sur un marché saturé, sans identité visuelle ni tunnel d'acquisition.",
    solution:
      "Film de lancement cinématographique, masters drone, visites Matterport et landing page de conversion alimentée par Meta et Google Ads.",
    results:
      "Commercialisation complète atteinte cinq mois avant la courbe d'absorption prévisionnelle.",
    kpis: [
      { value: "42", label: "Lots vendus" },
      { value: "3,1x", label: "ROAS" },
      { value: "−38%", label: "Coût par lead" },
    ],
  },
  {
    client: "Agence immobilière",
    title: "D'un fichier dormant à un pipeline qualifié",
    image: interior,
    alt: "Intérieur de résidence de luxe aux tonalités sombres",
    challenge:
      "Une agence disposant d'un beau portefeuille mais d'un CRM saturé de leads non traités.",
    solution:
      "Refonte HubSpot, scoring des leads, automatisations email et WhatsApp, et moteur de contenu premium mensuel.",
    results:
      "Temps de réponse divisé par dix et nombre de visites par conseiller quasiment doublé en un trimestre.",
    kpis: [
      { value: "+186%", label: "Visites générées" },
      { value: "4 min", label: "Temps de réponse" },
      { value: "92%", label: "Leads qualifiés" },
    ],
  },
  {
    client: "Agent indépendant",
    title: "Un personal branding plus performant que les portails",
    image: photography,
    alt: "Tour résidentielle vitrée photographiée au crépuscule",
    challenge:
      "Un agent référent invisible en dehors des portails et dépendant de mandats achetés.",
    solution:
      "Production personal branding, distribution hebdomadaire en format court et tunnel d'acquisition de mandats.",
    results: "Les demandes vendeurs entrantes sont devenues le premier canal en 90 jours.",
    kpis: [
      { value: "5,4M", label: "Vues organiques" },
      { value: "77", label: "Mandats entrants" },
      { value: "24h", label: "Livraison des assets" },
    ],
  },
];

/** English copy of the case studies, keyed by the French text (shared with /case-studies). */
export const CASES_EN: Record<string, string> = {
  "3,1x": "3.1x",
  "5,4M": "5.4M",
  "42": "42",
  "−38%": "−38%",
  "+186%": "+186%",
  "4 min": "4 min",
  "92%": "92%",
  "77": "77",
  "24h": "24h",
  "Études de cas": "Case studies",
  "La preuve, mesurée en contrats signés.": "Proof, measured in signed deals.",
  "Une sélection de missions où production visuelle et infrastructure d'acquisition avancent ensemble.":
    "A selection of projects where visual production and acquisition infrastructure move forward together.",
  "Toutes les études de cas": "All case studies",
  "Promoteur · programme neuf": "Developer · new development",
  "42 lots vendus avant la livraison": "42 units sold before completion",
  "Vue aérienne d'un programme immobilier en bord de falaise au crépuscule":
    "Aerial view of a clifftop development at dusk",
  "Un programme côtier lancé sur un marché saturé, sans identité visuelle ni tunnel d'acquisition.":
    "A coastal development launched in a saturated market, with no visual identity and no acquisition funnel.",
  "Film de lancement cinématographique, masters drone, visites Matterport et landing page de conversion alimentée par Meta et Google Ads.":
    "A cinematic launch film, drone masters, Matterport tours and a conversion landing page fed by Meta and Google Ads.",
  "Commercialisation complète atteinte cinq mois avant la courbe d'absorption prévisionnelle.":
    "Fully sold five months ahead of the forecast absorption curve.",
  "Lots vendus": "Units sold",
  ROAS: "ROAS",
  "Coût par lead": "Cost per lead",
  "Agence immobilière": "Real estate agency",
  "D'un fichier dormant à un pipeline qualifié": "From a dormant database to a qualified pipeline",
  "Intérieur de résidence de luxe aux tonalités sombres": "Dark-toned luxury residence interior",
  "Une agence disposant d'un beau portefeuille mais d'un CRM saturé de leads non traités.":
    "An agency with a strong portfolio but a CRM clogged with unanswered leads.",
  "Refonte HubSpot, scoring des leads, automatisations email et WhatsApp, et moteur de contenu premium mensuel.":
    "A HubSpot rebuild, lead scoring, email and WhatsApp automation, and a monthly premium content engine.",
  "Temps de réponse divisé par dix et nombre de visites par conseiller quasiment doublé en un trimestre.":
    "Response time cut tenfold and viewings per agent almost doubled in one quarter.",
  "Visites générées": "Viewings generated",
  "Temps de réponse": "Response time",
  "Leads qualifiés": "Qualified leads",
  "Agent indépendant": "Independent agent",
  "Un personal branding plus performant que les portails": "Personal branding that outperforms the portals",
  "Tour résidentielle vitrée photographiée au crépuscule": "Glass residential tower photographed at dusk",
  "Un agent référent invisible en dehors des portails et dépendant de mandats achetés.":
    "A leading agent invisible outside the portals and dependent on paid-for listings.",
  "Production personal branding, distribution hebdomadaire en format court et tunnel d'acquisition de mandats.":
    "Personal branding production, weekly short-form distribution and a listing acquisition funnel.",
  "Les demandes vendeurs entrantes sont devenues le premier canal en 90 jours.":
    "Inbound seller enquiries became the number-one channel within 90 days.",
  "Vues organiques": "Organic views",
  "Mandats entrants": "Inbound listings",
  "Livraison des assets": "Asset delivery",
};

export function CaseStudies() {
  const locale = useLocale();
  const tr = useTr(CASES_EN);
  return (
    <Section id="case-studies" className="border-t border-border/70">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            eyebrow={tr("Études de cas")}
            title={tr("La preuve, mesurée en contrats signés.")}
            description={tr("Une sélection de missions où production visuelle et infrastructure d'acquisition avancent ensemble.")}
          />
          <Reveal>
            <Cta href={href("cases", locale)} variant="ghost">
              {tr("Toutes les études de cas")}
              <ArrowUpRight size={16} />
            </Cta>
          </Reveal>
        </div>

        <div className="-mx-5 mt-8 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] sm:mx-0 sm:mt-10 sm:grid sm:snap-none sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0 md:grid-cols-3 lg:mt-12 [&::-webkit-scrollbar]:hidden">
          {CASES.map((item, i) => (
            <Reveal key={item.client} delay={i * 80} className="h-full w-[85%] shrink-0 snap-start sm:w-auto">
              <article className="surface flex h-full flex-col overflow-hidden">
                <div className="relative aspect-[16/9] overflow-hidden">
                  <img
                    src={item.image.src}
                    srcSet={item.image.srcSet}
                    sizes="(min-width: 1240px) 390px, (min-width: 768px) 32vw, (min-width: 640px) 50vw, 85vw"
                    alt={tr(item.alt)}
                    loading="lazy"
                    width={1024}
                    height={576}
                    className="h-full w-full object-cover opacity-85 transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-105"
                  />
                </div>
                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-primary">{tr(item.client)}</p>
                  <h3 className="mt-2.5 font-display text-lg font-medium leading-snug tracking-[-0.01em]">
                    {tr(item.title)}
                  </h3>
                  <p className="mb-5 mt-2 text-sm leading-relaxed text-muted-foreground">{tr(item.results)}</p>
                  <div className="mt-auto grid grid-cols-3 gap-3 border-t border-border pt-4">
                    {item.kpis.map((kpi) => (
                      <div key={kpi.label}>
                        <p className="font-display text-xl font-medium tracking-tight">{tr(kpi.value)}</p>
                        <p className="mt-0.5 text-[10px] uppercase leading-tight tracking-[0.12em] text-muted-foreground">
                          {tr(kpi.label)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
