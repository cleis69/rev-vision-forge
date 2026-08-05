import { createFileRoute } from "@tanstack/react-router";

import { Container, PageHero, Section, SectionHeading } from "@/components/rev/ui";
import { Reveal } from "@/components/rev/Reveal";
import { FinalCta } from "@/components/rev/FinalCta";
import interior from "@/assets/work-interior.jpg";

const TITLE = "À propos de REV — Agence de croissance immobilière";
const DESCRIPTION =
  "Vision, mission, valeurs, équipe, matériel et technologies : découvrez comment REV combine production visuelle premium et infrastructure d'acquisition pour l'immobilier.";

const VALUES = [
  ["Exactitude", "Chaque image, chaque campagne, chaque séquence est mesurée sur un résultat."],
  ["Rareté", "Nous limitons volontairement le nombre de clients pour tenir le niveau d'exigence."],
  ["Vitesse", "Photos livrées en 24h, réponse aux leads en minutes, itérations chaque semaine."],
  ["Transparence", "Un dashboard partagé, des chiffres bruts, aucune métrique décorative."],
];

const TEAM = [
  ["Direction artistique", "Cadrage, lumière et cohérence visuelle sur l'ensemble des marques."],
  ["Production & post", "Photographes, pilotes drone, opérateurs Matterport, monteurs, coloristes."],
  ["Growth & media", "Stratèges acquisition, media buyers Meta / Google / TikTok, CRO."],
  ["Revenue ops", "Architectes HubSpot, automatisation, data et reporting."],
];

const GEAR = [
  "Boîtiers plein format & optiques à décentrement",
  "Gimbals et sliders cinéma",
  "Drones certifiés catégorie ouverte",
  "Matterport Pro3",
  "Éclairage continu haute puissance",
  "Suite de post-production étalonnée",
];

const TECH = [
  "HubSpot CRM",
  "Meta Business Suite",
  "Google Ads & GA4",
  "TikTok Ads Manager",
  "Matterport",
  "Blender & 3ds Max",
  "Make / n8n",
  "Looker Studio",
];

export const Route = createFileRoute("/about")({
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
  component: AboutPage,
});

function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="À propos"
        title="Nous ne vendons pas des photos. Nous vendons de la croissance."
        description="REV — Real Estate Vision est une agence de croissance dédiée à l'immobilier. Nous réunissons studio de production, cellule média et revenue operations dans une seule équipe."
        image={interior}
        imageAlt="Intérieur de résidence de luxe aux tonalités sombres"
      />

      <Section>
        <Container>
          <div className="grid gap-10 md:grid-cols-2">
            <Reveal className="surface p-10">
              <p className="text-[11px] uppercase tracking-[0.2em] text-primary">Vision</p>
              <p className="mt-6 font-display text-2xl leading-snug tracking-tight">
                L'immobilier se vendra bientôt comme une marque, pas comme une annonce.
              </p>
              <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
                Les portails uniformisent l'offre. La différence se joue désormais sur la qualité
                de l'expérience visuelle et sur la vitesse de traitement de la demande.
              </p>
            </Reveal>
            <Reveal className="surface p-10" delay={80}>
              <p className="text-[11px] uppercase tracking-[0.2em] text-primary">Mission</p>
              <p className="mt-6 font-display text-2xl leading-snug tracking-tight">
                Réduire le délai entre la première impression et la signature.
              </p>
              <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
                Nous construisons pour chaque client un système complet : contenu premium,
                acquisition pilotée et automatisation commerciale connectée au CRM.
              </p>
            </Reveal>
          </div>
        </Container>
      </Section>

      <Section className="border-t border-border/70">
        <Container>
          <SectionHeading
            eyebrow="Valeurs"
            title="Quatre principes non négociables."
            description="Ils déterminent les missions que nous acceptons et la manière dont nous les livrons."
          />
          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {VALUES.map(([title, body], i) => (
              <Reveal key={title} delay={i * 70} className="surface h-full p-8">
                <h3 className="font-display text-lg font-medium tracking-tight">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      <Section className="border-t border-border/70">
        <Container>
          <SectionHeading
            eyebrow="Équipe"
            title="Un studio et une cellule growth sous le même toit."
          />
          <div className="mt-14 grid gap-5 md:grid-cols-2">
            {TEAM.map(([title, body], i) => (
              <Reveal key={title} delay={i * 70} className="surface p-8">
                <h3 className="font-display text-lg font-medium tracking-tight">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      <Section className="border-t border-border/70">
        <Container>
          <div className="grid gap-14 lg:grid-cols-2">
            <Reveal>
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                Matériel
              </p>
              <ul className="mt-8 space-y-3">
                {GEAR.map((g) => (
                  <li key={g} className="border-b border-border pb-3 text-sm text-foreground/85">
                    {g}
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={100}>
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                Technologies
              </p>
              <div className="mt-8 flex flex-wrap gap-2">
                {TECH.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-border px-4 py-2 text-xs uppercase tracking-[0.14em] text-muted-foreground"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </Reveal>
          </div>
        </Container>
      </Section>

      <FinalCta />
    </>
  );
}
