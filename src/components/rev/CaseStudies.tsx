import drone from "@/assets/work-drone.jpg";
import interior from "@/assets/work-interior.jpg";
import photography from "@/assets/work-photography.jpg";
import { Container, Section, SectionHeading } from "./ui";
import { Reveal } from "./Reveal";

const CASES = [
  {
    client: "Meridian Développement",
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
    client: "Alta Group",
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
    client: "Orion Estates",
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

export function CaseStudies() {
  return (
    <Section id="case-studies" className="border-t border-border/70">
      <Container>
        <SectionHeading
          eyebrow="Études de cas"
          title="La preuve, mesurée en contrats signés."
          description="Une sélection de missions où production visuelle et infrastructure d'acquisition avancent ensemble."
        />

        <div className="mt-16 space-y-6">
          {CASES.map((item, i) => (
            <Reveal key={item.client} delay={i * 80}>
              <article className="surface overflow-hidden">
                <div className="grid lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
                  <div className="relative min-h-[260px] overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.alt}
                      loading="lazy"
                      width={1024}
                      height={768}
                      className="h-full w-full object-cover opacity-80 transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-105"
                    />
                  </div>
                  <div className="p-8 md:p-12">
                    <p className="text-[11px] uppercase tracking-[0.22em] text-primary">
                      {item.client}
                    </p>
                    <h3 className="mt-4 font-display text-[clamp(1.5rem,2.6vw,2.1rem)] font-medium leading-tight tracking-[-0.02em]">
                      {item.title}
                    </h3>

                    <dl className="mt-8 space-y-5">
                      {[
                        ["Problématique", item.challenge],
                        ["Solution", item.solution],
                        ["Résultats", item.results],
                      ].map(([label, body]) => (
                        <div key={label} className="grid gap-1 sm:grid-cols-[130px_minmax(0,1fr)]">
                          <dt className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                            {label}
                          </dt>
                          <dd className="text-sm leading-relaxed text-foreground/85">{body}</dd>
                        </div>
                      ))}
                    </dl>

                    <div className="mt-10 grid grid-cols-3 gap-4 border-t border-border pt-6">
                      {item.kpis.map((kpi) => (
                        <div key={kpi.label}>
                          <p className="font-display text-2xl font-medium tracking-tight">
                            {kpi.value}
                          </p>
                          <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                            {kpi.label}
                          </p>
                        </div>
                      ))}
                    </div>
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
