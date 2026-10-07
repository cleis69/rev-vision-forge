import { Container, PageHero, Section, SectionHeading } from "@/components/rev/ui";
import { Reveal } from "@/components/rev/Reveal";
import { FinalCta } from "@/components/rev/FinalCta";
import { useLocale, type Locale } from "@/lib/i18n";
import { photo } from "@/lib/images";

const interior = photo("work-interior");

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

type Pair = [string, string];

const COPY: Record<
  Locale,
  {
    eyebrow: string;
    title: string;
    description: string;
    imageAlt: string;
    vision: { title: string; body: string };
    mission: { title: string; body: string };
    values: { eyebrow: string; title: string; description: string; items: Pair[] };
    team: { eyebrow: string; title: string; items: Pair[] };
    gearLabel: string;
    gear: string[];
    techLabel: string;
  }
> = {
  fr: {
    eyebrow: "À propos",
    title: "Nous ne vendons pas des photos. Nous vendons de la croissance.",
    description:
      "REV — Real Estate Vision est une agence de croissance dédiée à l'immobilier. Nous réunissons studio de production, cellule média et revenue operations dans une seule équipe.",
    imageAlt: "Intérieur de résidence de luxe aux tonalités sombres",
    vision: {
      title: "L'immobilier se vendra bientôt comme une marque, pas comme une annonce.",
      body: "Les portails uniformisent l'offre. La différence se joue désormais sur la qualité de l'expérience visuelle et sur la vitesse de traitement de la demande.",
    },
    mission: {
      title: "Réduire le délai entre la première impression et la signature.",
      body: "Nous construisons pour chaque client un système complet : contenu premium, acquisition pilotée et automatisation commerciale connectée au CRM.",
    },
    values: {
      eyebrow: "Valeurs",
      title: "Quatre principes non négociables.",
      description: "Ils déterminent les missions que nous acceptons et la manière dont nous les livrons.",
      items: [
        ["Exactitude", "Chaque image, chaque campagne, chaque séquence est mesurée sur un résultat."],
        ["Rareté", "Nous limitons volontairement le nombre de clients pour tenir le niveau d'exigence."],
        ["Vitesse", "Photos livrées en 24h, réponse aux leads en minutes, itérations chaque semaine."],
        ["Transparence", "Un dashboard partagé, des chiffres bruts, aucune métrique décorative."],
      ],
    },
    team: {
      eyebrow: "Équipe",
      title: "Un studio et une cellule growth sous le même toit.",
      items: [
        ["Direction artistique", "Cadrage, lumière et cohérence visuelle sur l'ensemble des marques."],
        ["Production & post", "Photographes, pilotes drone, opérateurs Matterport, monteurs, coloristes."],
        ["Growth & media", "Stratèges acquisition, media buyers Meta / Google / TikTok, CRO."],
        ["Revenue ops", "Architectes HubSpot, automatisation, data et reporting."],
      ],
    },
    gearLabel: "Matériel",
    gear: [
      "Boîtiers plein format & optiques à décentrement",
      "Gimbals et sliders cinéma",
      "Drones certifiés catégorie ouverte",
      "Matterport Pro3",
      "Éclairage continu haute puissance",
      "Suite de post-production étalonnée",
    ],
    techLabel: "Technologies",
  },
  en: {
    eyebrow: "About",
    title: "We don't sell photos. We sell growth.",
    description:
      "REV — Real Estate Vision is a growth agency dedicated to real estate. We bring a production studio, a media unit and revenue operations together in one team.",
    imageAlt: "Dark-toned luxury residence interior",
    vision: {
      title: "Real estate will soon be sold like a brand, not like a listing.",
      body: "Portals make every offer look the same. The difference now lies in the quality of the visual experience and in how fast enquiries are handled.",
    },
    mission: {
      title: "Shorten the time between first impression and signature.",
      body: "For every client we build a complete system: premium content, managed acquisition and sales automation connected to the CRM.",
    },
    values: {
      eyebrow: "Values",
      title: "Four non-negotiable principles.",
      description: "They decide which engagements we take on and how we deliver them.",
      items: [
        ["Precision", "Every image, every campaign, every sequence is measured against a result."],
        ["Scarcity", "We deliberately limit the number of clients to keep our standards high."],
        ["Speed", "Photos delivered in 24h, leads answered in minutes, iterations every week."],
        ["Transparency", "A shared dashboard, raw numbers, no vanity metrics."],
      ],
    },
    team: {
      eyebrow: "Team",
      title: "A studio and a growth unit under one roof.",
      items: [
        ["Art direction", "Framing, light and visual consistency across every brand."],
        ["Production & post", "Photographers, drone pilots, Matterport operators, editors, colourists."],
        ["Growth & media", "Acquisition strategists, Meta / Google / TikTok media buyers, CRO."],
        ["Revenue ops", "HubSpot architects, automation, data and reporting."],
      ],
    },
    gearLabel: "Equipment",
    gear: [
      "Full-frame bodies & tilt-shift lenses",
      "Cinema gimbals and sliders",
      "Open-category certified drones",
      "Matterport Pro3",
      "High-output continuous lighting",
      "Calibrated post-production suite",
    ],
    techLabel: "Technology",
  },
};

export function AboutPage() {
  const copy = COPY[useLocale()];
  return (
    <>
      <PageHero
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
        image={interior}
        imageAlt={copy.imageAlt}
      />

      <Section>
        <Container>
          <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
            {(
              [
                ["Vision", copy.vision],
                ["Mission", copy.mission],
              ] as const
            ).map(([label, block], i) => (
              <Reveal key={label} className="surface p-6 sm:p-8" delay={i * 80}>
                <p className="text-[11px] uppercase tracking-[0.2em] text-primary">{label}</p>
                <p className="mt-4 font-display text-xl leading-snug tracking-tight sm:text-2xl">{block.title}</p>
                <p className="mt-5 text-sm leading-relaxed text-muted-foreground">{block.body}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      <Section className="border-t border-border/70">
        <Container>
          <SectionHeading
            eyebrow={copy.values.eyebrow}
            title={copy.values.title}
            description={copy.values.description}
          />
          <div className="mt-8 grid grid-cols-2 gap-3 sm:mt-10 sm:gap-4 lg:grid-cols-4">
            {copy.values.items.map(([title, body], i) => (
              <Reveal key={title} delay={i * 70} className="surface h-full p-4 sm:p-6">
                <h3 className="font-display text-lg font-medium tracking-tight">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      <Section className="border-t border-border/70">
        <Container>
          <SectionHeading eyebrow={copy.team.eyebrow} title={copy.team.title} />
          <div className="mt-8 grid gap-3 sm:mt-10 sm:gap-4 md:grid-cols-2">
            {copy.team.items.map(([title, body], i) => (
              <Reveal key={title} delay={i * 70} className="surface p-5 sm:p-6">
                <h3 className="font-display text-lg font-medium tracking-tight">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      <Section className="border-t border-border/70">
        <Container>
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
            <Reveal>
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{copy.gearLabel}</p>
              <ul className="mt-5 space-y-2.5">
                {copy.gear.map((g) => (
                  <li key={g} className="border-b border-border pb-3 text-sm text-foreground/85">
                    {g}
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={100}>
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{copy.techLabel}</p>
              <div className="mt-5 flex flex-wrap gap-2">
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
