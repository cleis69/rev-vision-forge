import { createFileRoute } from "@tanstack/react-router";

import { Container, PageHero, Section } from "@/components/rev/ui";
import { Reveal } from "@/components/rev/Reveal";
import { FinalCta } from "@/components/rev/FinalCta";
import drone from "@/assets/work-drone.jpg";
import interior from "@/assets/work-interior.jpg";
import photography from "@/assets/work-photography.jpg";
import matterport from "@/assets/work-matterport.jpg";

const TITLE = "Études de cas REV — Résultats mesurés en contrats signés";
const DESCRIPTION =
  "Programmes neufs, agences et agents : objectifs, stratégie, production, campagnes, automatisation et KPIs détaillés de missions menées par REV.";

const CASES = [
  {
    client: "Meridian Développement",
    title: "42 lots vendus avant la livraison",
    image: drone,
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
    results:
      "Commercialisation complète atteinte cinq mois avant la courbe d'absorption prévisionnelle.",
    kpis: [
      { value: "42", label: "Lots vendus" },
      { value: "3,1x", label: "ROAS" },
      { value: "−38%", label: "Coût par lead" },
      { value: "5 mois", label: "Avance sur planning" },
    ],
  },
  {
    client: "Alta Group",
    title: "D'un fichier dormant à un pipeline qualifié",
    image: interior,
    alt: "Intérieur de résidence de luxe aux tonalités sombres",
    objective:
      "Réactiver une base de plus de 9 000 contacts inexploités et fiabiliser le suivi commercial de douze conseillers.",
    strategy:
      "Repartir de la donnée : nettoyage, segmentation par intention, puis réengagement progressif avec du contenu à valeur plutôt qu'une relance commerciale directe.",
    production:
      "Moteur de contenu mensuel : reportages de biens, formats courts conseillers et newsletters marché illustrées.",
    campaigns:
      "Retargeting Meta sur la base réactivée et campagnes Google sur requêtes vendeurs à forte intention.",
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
    client: "Orion Estates",
    title: "Un personal branding plus performant que les portails",
    image: photography,
    alt: "Tour résidentielle vitrée photographiée au crépuscule",
    objective:
      "Rendre un agent référent visible en dehors des portails et réduire sa dépendance aux mandats achetés.",
    strategy:
      "Construire une figure d'expert de quartier : prise de parole hebdomadaire, décryptage marché et coulisses de transactions.",
    production:
      "Studio mensuel, captation terrain, montage de formats verticaux et déclinaisons YouTube longues.",
    campaigns:
      "Amplification des meilleures vidéos organiques et tunnel d'estimation vendeur en Meta Ads.",
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
];

export const Route = createFileRoute("/case-studies")({
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
  component: CaseStudiesPage,
});

function CaseStudiesPage() {
  return (
    <>
      <PageHero
        eyebrow="Études de cas"
        title="La preuve, mesurée en contrats signés."
        description="Chaque mission est documentée de l'objectif initial aux KPIs finaux : ce que nous avons produit, diffusé, automatisé et ce que cela a changé sur le pipeline."
        image={matterport}
        imageAlt="Jumeau numérique 3D d'un appartement en vue maison de poupée"
      />

      <Section>
        <Container>
          <div className="space-y-8">
            {CASES.map((item, i) => (
              <Reveal key={item.client} delay={i * 80}>
                <article className="surface overflow-hidden">
                  <div className="relative h-[280px] overflow-hidden md:h-[380px]">
                    <img
                      src={item.image}
                      alt={item.alt}
                      loading="lazy"
                      width={1600}
                      height={900}
                      className="h-full w-full object-cover opacity-80 transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-105"
                    />
                    <div
                      className="absolute inset-0"
                      style={{ background: "var(--gradient-veil)" }}
                      aria-hidden
                    />
                    <div className="absolute bottom-0 left-0 p-8 md:p-12">
                      <p className="text-[11px] uppercase tracking-[0.22em] text-primary">
                        {item.client}
                      </p>
                      <h2 className="mt-3 max-w-2xl font-display text-[clamp(1.5rem,3vw,2.4rem)] font-medium leading-tight tracking-[-0.02em]">
                        {item.title}
                      </h2>
                    </div>
                  </div>

                  <div className="p-8 md:p-12">
                    <dl className="grid gap-6 md:grid-cols-2">
                      {[
                        ["Objectif", item.objective],
                        ["Stratégie", item.strategy],
                        ["Production", item.production],
                        ["Campagnes", item.campaigns],
                        ["Automatisation", item.automation],
                        ["Résultats", item.results],
                      ].map(([label, body]) => (
                        <div key={label} className="border-t border-border pt-5">
                          <dt className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                            {label}
                          </dt>
                          <dd className="mt-2 text-sm leading-relaxed text-foreground/85">
                            {body}
                          </dd>
                        </div>
                      ))}
                    </dl>

                    <div className="mt-12 grid grid-cols-2 gap-6 border-t border-border pt-8 md:grid-cols-4">
                      {item.kpis.map((kpi) => (
                        <div key={kpi.label}>
                          <p className="font-display text-3xl font-medium tracking-tight">
                            {kpi.value}
                          </p>
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
