import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Container, PageHero, Section } from "@/components/rev/ui";
import { Reveal } from "@/components/rev/Reveal";
import { FinalCta } from "@/components/rev/FinalCta";
import architecture from "@/assets/work-architecture.jpg";
import branding from "@/assets/work-branding.jpg";
import matterport from "@/assets/work-matterport.jpg";
import video from "@/assets/work-video.jpg";
import photography from "@/assets/work-photography.jpg";
import drone from "@/assets/work-drone.jpg";
import interior from "@/assets/work-interior.jpg";

const TITLE = "Insights REV — Marketing, immobilier, Matterport, Ads & HubSpot";
const DESCRIPTION =
  "Analyses et méthodes REV : marketing immobilier, visites Matterport, Meta Ads, architecture, HubSpot et SEO pour vendre plus vite et mieux.";

const CATEGORIES = [
  "Tout",
  "Marketing",
  "Immobilier",
  "Matterport",
  "Meta Ads",
  "Architecture",
  "HubSpot",
  "SEO",
] as const;

type Category = (typeof CATEGORIES)[number];

const POSTS: {
  title: string;
  excerpt: string;
  category: Exclude<Category, "Tout">;
  date: string;
  read: string;
  image: string;
  alt: string;
}[] = [
  {
    title: "Pourquoi vos annonces premium ne convertissent pas sur mobile",
    excerpt:
      "Le cadrage horizontal hérité du print détruit la lisibilité sur un écran vertical. Voici la grille de production que nous utilisons.",
    category: "Marketing",
    date: "12 juin 2026",
    read: "6 min",
    image: photography,
    alt: "Tour résidentielle vitrée photographiée au crépuscule",
  },
  {
    title: "Matterport : ce qui change réellement sur le taux de visite physique",
    excerpt:
      "Chiffres constatés sur 38 biens : la visite virtuelle ne remplace pas la visite, elle filtre les curieux.",
    category: "Matterport",
    date: "3 juin 2026",
    read: "8 min",
    image: matterport,
    alt: "Jumeau numérique 3D d'un appartement en vue maison de poupée",
  },
  {
    title: "La structure de compte Meta Ads que nous utilisons pour un programme neuf",
    excerpt:
      "Prospection vidéo, retargeting segmenté et exclusion des acquéreurs signés : le détail du setup.",
    category: "Meta Ads",
    date: "27 mai 2026",
    read: "9 min",
    image: video,
    alt: "Terrasse de penthouse surplombant une skyline de nuit",
  },
  {
    title: "Lead scoring HubSpot pour l'immobilier : les 7 critères qui comptent",
    excerpt:
      "Budget, horizon, financement, zone, typologie, canal et vitesse de réponse. Comment les pondérer.",
    category: "HubSpot",
    date: "18 mai 2026",
    read: "7 min",
    image: interior,
    alt: "Intérieur de résidence de luxe aux tonalités sombres",
  },
  {
    title: "SEO local : dominer les requêtes vendeurs de votre secteur",
    excerpt:
      "Pages de quartier, maillage interne et preuves de transaction : la méthode qui produit des mandats entrants.",
    category: "SEO",
    date: "6 mai 2026",
    read: "10 min",
    image: drone,
    alt: "Vue aérienne d'une villa contemporaine en bord de falaise",
  },
  {
    title: "Images 3D d'architecture : quand les produire avant le permis",
    excerpt:
      "Anticiper la 3D permet de pré-commercialiser. Encore faut-il verrouiller la direction artistique en amont.",
    category: "Architecture",
    date: "22 avril 2026",
    read: "5 min",
    image: architecture,
    alt: "Façade en béton aux lignes géométriques dans l'ombre",
  },
  {
    title: "Construire une marque immobilière qui survit aux portails",
    excerpt:
      "Identité, ligne éditoriale et preuve sociale : les trois leviers qui rendent votre agence non substituable.",
    category: "Immobilier",
    date: "9 avril 2026",
    read: "6 min",
    image: branding,
    alt: "Cartes de visite noires mates avec monogramme embossé",
  },
];

export const Route = createFileRoute("/insights")({
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
  component: InsightsPage,
});

function InsightsPage() {
  const [active, setActive] = useState<Category>("Tout");
  const items = useMemo(
    () => (active === "Tout" ? POSTS : POSTS.filter((p) => p.category === active)),
    [active],
  );

  return (
    <>
      <PageHero
        eyebrow="Insights"
        title="Les méthodes derrière les résultats."
        description="Analyses de campagnes, protocoles de production et architectures CRM : ce que nous apprenons sur le terrain, documenté sans filtre."
        image={architecture}
        imageAlt="Façade en béton aux lignes géométriques dans l'ombre"
      />

      <Section>
        <Container>
          <Reveal className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setActive(c)}
                aria-pressed={active === c}
                className={cn(
                  "h-9 rounded-full border px-4 text-xs uppercase tracking-[0.14em] transition-all duration-300",
                  active === c
                    ? "border-primary/50 bg-primary/10 text-foreground"
                    : "border-border text-muted-foreground hover:border-foreground/25 hover:text-foreground",
                )}
              >
                {c}
              </button>
            ))}
          </Reveal>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map((post, i) => (
              <Reveal key={post.title} delay={i * 60}>
                <article className="group surface h-full overflow-hidden">
                  <div className="h-52 overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.alt}
                      loading="lazy"
                      width={1024}
                      height={768}
                      className="h-full w-full object-cover opacity-80 transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                    />
                  </div>
                  <div className="p-7">
                    <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                      <span className="text-primary">{post.category}</span>
                      <span>·</span>
                      <span>{post.date}</span>
                      <span>·</span>
                      <span>{post.read}</span>
                    </div>
                    <h2 className="mt-4 font-display text-lg font-medium leading-snug tracking-tight">
                      {post.title}
                    </h2>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      {post.excerpt}
                    </p>
                    <span className="mt-6 inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.16em] text-foreground/70 transition-colors group-hover:text-primary">
                      Lire l'article
                      <ArrowUpRight size={14} />
                    </span>
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
