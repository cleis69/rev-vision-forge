import { Container, PageHero, Section } from "@/components/rev/ui";
import { Reveal } from "@/components/rev/Reveal";
import { FinalCta } from "@/components/rev/FinalCta";
import { useLocale, type Locale } from "@/lib/i18n";
import { photo } from "@/lib/images";

const drone = photo("work-drone");
const interior = photo("work-interior");
const photography = photo("work-photography");
const matterport = photo("work-matterport");

type Case = {
  client: string;
  title: string;
  alt: string;
  objective: string;
  strategy: string;
  production: string;
  campaigns: string;
  automation: string;
  results: string;
  kpis: { value: string; label: string }[];
};

const IMAGES = [drone, interior, photography];

const COPY: Record<
  Locale,
  {
    eyebrow: string;
    title: string;
    description: string;
    imageAlt: string;
    labels: [string, string, string, string, string, string];
    cases: Case[];
  }
> = {
  fr: {
    eyebrow: "Études de cas",
    title: "La preuve, mesurée en contrats signés.",
    description:
      "Chaque mission est documentée de l'objectif initial aux KPIs finaux : ce que nous avons produit, diffusé, automatisé et ce que cela a changé sur le pipeline.",
    imageAlt: "Jumeau numérique 3D d'un appartement en vue maison de poupée",
    labels: ["Objectif", "Stratégie", "Production", "Campagnes", "Automatisation", "Résultats"],
    cases: [
      {
        client: "Promoteur · programme neuf",
        title: "42 lots vendus avant la livraison",
        alt: "Vue aérienne d'un programme immobilier en bord de falaise au crépuscule",
        objective:
          "Commercialiser un programme côtier de 42 lots sur un marché saturé, sans identité visuelle ni tunnel d'acquisition existant.",
        strategy:
          "Positionner le programme comme une adresse signature plutôt qu'un produit d'investissement, et concentrer l'effort média sur une audience patrimoniale locale et expatriée.",
        production:
          "Film de lancement cinématographique, masters drone, photographies d'ambiance et visites Matterport de trois typologies témoins.",
        campaigns:
          "Meta Ads en prospection vidéo et retargeting, Google Ads sur intention de marque et de quartier, landing page dédiée par typologie.",
        automation:
          "HubSpot connecté aux formulaires, scoring sur budget et horizon d'achat, routage automatique vers le conseiller référent et relances email.",
        results: "Commercialisation complète atteinte cinq mois avant la courbe d'absorption prévisionnelle.",
        kpis: [
          { value: "42", label: "Lots vendus" },
          { value: "3,1x", label: "ROAS" },
          { value: "−38%", label: "Coût par lead" },
          { value: "5 mois", label: "Avance sur planning" },
        ],
      },
      {
        client: "Agence immobilière",
        title: "D'un fichier dormant à un pipeline qualifié",
        alt: "Intérieur de résidence de luxe aux tonalités sombres",
        objective:
          "Réactiver une base de plus de 9 000 contacts inexploités et fiabiliser le suivi commercial de douze conseillers.",
        strategy:
          "Repartir de la donnée : nettoyage, segmentation par intention, puis réengagement progressif avec du contenu à valeur plutôt qu'une relance commerciale directe.",
        production:
          "Moteur de contenu mensuel : reportages de biens, formats courts conseillers et newsletters marché illustrées.",
        campaigns: "Retargeting Meta sur la base réactivée et campagnes Google sur requêtes vendeurs à forte intention.",
        automation:
          "Refonte HubSpot complète, lead scoring, séquences email et WhatsApp, alertes temps réel et dashboards par conseiller.",
        results:
          "Temps de réponse divisé par dix et nombre de visites par conseiller quasiment doublé en un trimestre.",
        kpis: [
          { value: "+186%", label: "Visites générées" },
          { value: "4 min", label: "Temps de réponse" },
          { value: "92%", label: "Leads qualifiés" },
          { value: "9 000", label: "Contacts réactivés" },
        ],
      },
      {
        client: "Agent indépendant",
        title: "Un personal branding plus performant que les portails",
        alt: "Tour résidentielle vitrée photographiée au crépuscule",
        objective:
          "Rendre un agent référent visible en dehors des portails et réduire sa dépendance aux mandats achetés.",
        strategy:
          "Construire une figure d'expert de quartier : prise de parole hebdomadaire, décryptage marché et coulisses de transactions.",
        production: "Studio mensuel, captation terrain, montage de formats verticaux et déclinaisons YouTube longues.",
        campaigns: "Amplification des meilleures vidéos organiques et tunnel d'estimation vendeur en Meta Ads.",
        automation:
          "Formulaire d'estimation connecté au CRM, séquence de nurturing vendeur et rappel automatique sous 15 minutes.",
        results: "Les demandes vendeurs entrantes sont devenues le premier canal en 90 jours.",
        kpis: [
          { value: "5,4M", label: "Vues organiques" },
          { value: "77", label: "Mandats entrants" },
          { value: "24h", label: "Livraison des assets" },
          { value: "90 j", label: "Pour inverser le canal" },
        ],
      },
    ],
  },
  en: {
    eyebrow: "Case studies",
    title: "Proof, measured in signed deals.",
    description:
      "Every engagement is documented from the initial objective to the final KPIs: what we produced, ran and automated, and what it changed in the pipeline.",
    imageAlt: "3D digital twin of an apartment in dollhouse view",
    labels: ["Objective", "Strategy", "Production", "Campaigns", "Automation", "Results"],
    cases: [
      {
        client: "Developer · new development",
        title: "42 units sold before completion",
        alt: "Aerial view of a clifftop development at dusk",
        objective:
          "Sell a 42-unit coastal development in a saturated market, with no visual identity or acquisition funnel in place.",
        strategy:
          "Position the development as a signature address rather than an investment product, and focus media spend on a local and expatriate high-net-worth audience.",
        production:
          "Cinematic launch film, drone masters, lifestyle photography and Matterport tours of three show units.",
        campaigns:
          "Meta Ads for video prospecting and retargeting, Google Ads on brand and neighbourhood intent, and a dedicated landing page per unit type.",
        automation:
          "HubSpot connected to the forms, scoring on budget and purchase timeline, automatic routing to the assigned adviser and email follow-ups.",
        results: "Fully sold five months ahead of the forecast absorption curve.",
        kpis: [
          { value: "42", label: "Units sold" },
          { value: "3.1x", label: "ROAS" },
          { value: "−38%", label: "Cost per lead" },
          { value: "5 months", label: "Ahead of schedule" },
        ],
      },
      {
        client: "Real estate agency",
        title: "From a dormant database to a qualified pipeline",
        alt: "Dark-toned luxury residence interior",
        objective:
          "Reactivate a database of more than 9,000 untapped contacts and make sales follow-up reliable across twelve advisers.",
        strategy:
          "Start from the data: clean-up, segmentation by intent, then gradual re-engagement with valuable content rather than direct sales chasers.",
        production:
          "A monthly content engine: property shoots, short adviser formats and illustrated market newsletters.",
        campaigns: "Meta retargeting on the reactivated database and Google campaigns on high-intent seller searches.",
        automation:
          "Complete HubSpot rebuild, lead scoring, email and WhatsApp sequences, real-time alerts and per-adviser dashboards.",
        results: "Response time cut tenfold and viewings per adviser almost doubled in one quarter.",
        kpis: [
          { value: "+186%", label: "Viewings generated" },
          { value: "4 min", label: "Response time" },
          { value: "92%", label: "Qualified leads" },
          { value: "9,000", label: "Contacts reactivated" },
        ],
      },
      {
        client: "Independent agent",
        title: "Personal branding that outperforms the portals",
        alt: "Glass residential tower photographed at dusk",
        objective:
          "Make a leading agent visible beyond the portals and reduce their reliance on paid-for listings.",
        strategy:
          "Build a neighbourhood-expert persona: weekly videos, market breakdowns and behind-the-scenes looks at transactions.",
        production: "Monthly studio sessions, on-location filming, vertical edits and long-form YouTube versions.",
        campaigns: "Amplifying the best organic videos, plus a seller valuation funnel on Meta Ads.",
        automation:
          "Valuation form connected to the CRM, seller nurturing sequence and an automatic call-back within 15 minutes.",
        results: "Inbound seller enquiries became the number one channel within 90 days.",
        kpis: [
          { value: "5.4M", label: "Organic views" },
          { value: "77", label: "Inbound listings" },
          { value: "24h", label: "Asset delivery" },
          { value: "90 days", label: "To flip the channel" },
        ],
      },
    ],
  },
};

export function CaseStudiesPage() {
  const copy = COPY[useLocale()];
  return (
    <>
      <PageHero
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
        image={matterport}
        imageAlt={copy.imageAlt}
      />

      <Section>
        <Container>
          <div className="space-y-4 sm:space-y-6">
            {copy.cases.map((item, i) => (
              <Reveal key={item.client} delay={i * 80}>
                <article className="surface overflow-hidden">
                  <div className="relative h-[200px] overflow-hidden sm:h-[260px] md:h-[320px]">
                    <img
                      src={IMAGES[i]?.src}
                      srcSet={IMAGES[i]?.srcSet}
                      sizes="(min-width: 1240px) 1180px, 100vw"
                      alt={item.alt}
                      loading="lazy"
                      width={1600}
                      height={900}
                      className="h-full w-full object-cover opacity-80 transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-105"
                    />
                    <div className="absolute inset-0" style={{ background: "var(--gradient-veil)" }} aria-hidden />
                    <div className="absolute bottom-0 left-0 p-5 sm:p-8 md:p-10">
                      <p className="text-[11px] uppercase tracking-[0.22em] text-primary">{item.client}</p>
                      <h2 className="mt-3 max-w-2xl font-display text-[clamp(1.5rem,3vw,2.4rem)] font-medium leading-tight tracking-[-0.02em]">
                        {item.title}
                      </h2>
                    </div>
                  </div>

                  <div className="p-5 sm:p-8 md:p-10">
                    <dl className="grid gap-4 md:grid-cols-2 md:gap-x-8">
                      {[
                        item.objective,
                        item.strategy,
                        item.production,
                        item.campaigns,
                        item.automation,
                        item.results,
                      ].map((body, k) => (
                        <div key={copy.labels[k]} className="border-t border-border pt-5">
                          <dt className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                            {copy.labels[k]}
                          </dt>
                          <dd className="mt-2 text-sm leading-relaxed text-foreground/85">{body}</dd>
                        </div>
                      ))}
                    </dl>

                    <div className="mt-8 grid grid-cols-2 gap-5 border-t border-border pt-6 md:grid-cols-4">
                      {item.kpis.map((kpi) => (
                        <div key={kpi.label}>
                          <p className="font-display text-3xl font-medium tracking-tight">{kpi.value}</p>
                          <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                            {kpi.label}
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

      <FinalCta />
    </>
  );
}
