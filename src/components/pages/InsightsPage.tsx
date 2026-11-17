import { useState } from "react";
import { ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Container, PageHero, Section } from "@/components/rev/ui";
import { Reveal } from "@/components/rev/Reveal";
import { FinalCta } from "@/components/rev/FinalCta";
import { useLocale, type Locale } from "@/lib/i18n";
import { photo, type Photo } from "@/lib/images";

const architecture = photo("work-architecture");
const branding = photo("work-branding");
const matterport = photo("work-matterport");
const video = photo("work-video");
const photography = photo("work-photography");
const drone = photo("work-drone");
const interior = photo("work-interior");

const CATEGORIES = [
  "all",
  "marketing",
  "realEstate",
  "matterport",
  "metaAds",
  "architecture",
  "hubspot",
  "seo",
] as const;
type Category = (typeof CATEGORIES)[number];

const CATEGORY_LABELS: Record<Locale, Record<Category, string>> = {
  fr: {
    all: "Tout",
    marketing: "Marketing",
    realEstate: "Immobilier",
    matterport: "Visite virtuelle 3D",
    metaAds: "Meta Ads",
    architecture: "Architecture",
    hubspot: "HubSpot",
    seo: "SEO",
  },
  en: {
    all: "All",
    marketing: "Marketing",
    realEstate: "Real estate",
    matterport: "3D virtual tours",
    metaAds: "Meta Ads",
    architecture: "Architecture",
    hubspot: "HubSpot",
    seo: "SEO",
  },
};

type Post = {
  category: Exclude<Category, "all">;
  date: string;
  read: string;
  image: Photo;
  text: Record<Locale, { title: string; excerpt: string; alt: string }>;
};

const POSTS: Post[] = [
  {
    category: "marketing",
    date: "2026-06-12",
    read: "6 min",
    image: photography,
    text: {
      fr: {
        title: "Pourquoi vos annonces premium ne convertissent pas sur mobile",
        excerpt:
          "Le cadrage horizontal hérité du print détruit la lisibilité sur un écran vertical. Voici la grille de production que nous utilisons.",
        alt: "Tour résidentielle vitrée photographiée au crépuscule",
      },
      en: {
        title: "Why your premium listings don't convert on mobile",
        excerpt:
          "Horizontal framing inherited from print kills readability on a vertical screen. Here's the production grid we use.",
        alt: "Glass residential tower photographed at dusk",
      },
    },
  },
  {
    category: "matterport",
    date: "2026-06-03",
    read: "8 min",
    image: matterport,
    text: {
      fr: {
        title: "Visite virtuelle 3D : ce qui change réellement sur le taux de visite physique",
        excerpt:
          "Chiffres constatés sur 38 biens : la visite virtuelle ne remplace pas la visite, elle filtre les curieux.",
        alt: "Jumeau numérique 3D d'un appartement en vue maison de poupée",
      },
      en: {
        title: "3D virtual tours: what really changes for in-person viewings",
        excerpt:
          "Figures observed across 38 properties: the virtual tour doesn't replace the viewing, it filters out the window shoppers.",
        alt: "3D digital twin of an apartment in dollhouse view",
      },
    },
  },
  {
    category: "metaAds",
    date: "2026-05-27",
    read: "9 min",
    image: video,
    text: {
      fr: {
        title: "La structure de compte Meta Ads que nous utilisons pour un programme neuf",
        excerpt:
          "Prospection vidéo, retargeting segmenté et exclusion des acquéreurs signés : le détail du setup.",
        alt: "Terrasse de penthouse surplombant une skyline de nuit",
      },
      en: {
        title: "The Meta Ads account structure we use for a new development",
        excerpt:
          "Video prospecting, segmented retargeting and excluding buyers who have already signed: the full set-up.",
        alt: "Penthouse terrace overlooking a city skyline at night",
      },
    },
  },
  {
    category: "hubspot",
    date: "2026-05-18",
    read: "7 min",
    image: interior,
    text: {
      fr: {
        title: "Lead scoring HubSpot pour l'immobilier : les 7 critères qui comptent",
        excerpt:
          "Budget, horizon, financement, zone, typologie, canal et vitesse de réponse. Comment les pondérer.",
        alt: "Intérieur de résidence de luxe aux tonalités sombres",
      },
      en: {
        title: "HubSpot lead scoring for real estate: the 7 criteria that matter",
        excerpt:
          "Budget, timeline, financing, area, property type, channel and response speed. How to weight them.",
        alt: "Dark-toned luxury residence interior",
      },
    },
  },
  {
    category: "seo",
    date: "2026-05-06",
    read: "10 min",
    image: drone,
    text: {
      fr: {
        title: "SEO local : dominer les requêtes vendeurs de votre secteur",
        excerpt:
          "Pages de quartier, maillage interne et preuves de transaction : la méthode qui produit des mandats entrants.",
        alt: "Vue aérienne d'une villa contemporaine en bord de falaise",
      },
      en: {
        title: "Local SEO: own the seller searches in your area",
        excerpt:
          "Neighbourhood pages, internal linking and proof of past sales: the method that brings in inbound listings.",
        alt: "Aerial view of a contemporary clifftop villa",
      },
    },
  },
  {
    category: "architecture",
    date: "2026-04-22",
    read: "5 min",
    image: architecture,
    text: {
      fr: {
        title: "Images 3D d'architecture : quand les produire avant le permis",
        excerpt:
          "Anticiper la 3D permet de pré-commercialiser. Encore faut-il verrouiller la direction artistique en amont.",
        alt: "Façade en béton aux lignes géométriques dans l'ombre",
      },
      en: {
        title: "Architectural 3D renders: when to produce them before planning permission",
        excerpt:
          "Getting the 3D done early lets you start pre-sales. But the art direction has to be locked in upfront.",
        alt: "Concrete façade with geometric lines in shadow",
      },
    },
  },
  {
    category: "realEstate",
    date: "2026-04-09",
    read: "6 min",
    image: branding,
    text: {
      fr: {
        title: "Construire une marque immobilière qui survit aux portails",
        excerpt:
          "Identité, ligne éditoriale et preuve sociale : les trois leviers qui rendent votre agence non substituable.",
        alt: "Cartes de visite noires mates avec monogramme embossé",
      },
      en: {
        title: "Building a real estate brand that outlasts the portals",
        excerpt:
          "Identity, editorial line and social proof: the three levers that make your agency irreplaceable.",
        alt: "Matte black business cards with an embossed monogram",
      },
    },
  },
];

const COPY = {
  fr: {
    title: "Les méthodes derrière les résultats.",
    description:
      "Analyses de campagnes, protocoles de production et architectures CRM : ce que nous apprenons sur le terrain, documenté sans filtre.",
    imageAlt: "Façade en béton aux lignes géométriques dans l'ombre",
    read: "Lire l'article",
  },
  en: {
    title: "The methods behind the results.",
    description:
      "Campaign breakdowns, production protocols and CRM architectures: what we learn in the field, documented without a filter.",
    imageAlt: "Concrete façade with geometric lines in shadow",
    read: "Read the article",
  },
} as const;

/** "12 juin 2026" / "12 June 2026", fixed to UTC so prerendered and live dates match. */
function formatDate(iso: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${iso}T12:00:00Z`));
}

export function InsightsPage() {
  const locale = useLocale();
  const copy = COPY[locale];
  const [active, setActive] = useState<Category>("all");
  const items = active === "all" ? POSTS : POSTS.filter((p) => p.category === active);

  return (
    <>
      <PageHero
        eyebrow="Insights"
        title={copy.title}
        description={copy.description}
        image={architecture}
        imageAlt={copy.imageAlt}
      />

      <Section>
        <Container>
          <Reveal className="-mx-5 flex gap-1 overflow-x-auto border-b border-border/70 px-5 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0 [&::-webkit-scrollbar]:hidden">
            {CATEGORIES.map((c) => {
              const on = active === c;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setActive(c)}
                  aria-pressed={on}
                  className={cn(
                    "relative h-11 shrink-0 whitespace-nowrap px-3 text-sm transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-foreground/70",
                    on ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {CATEGORY_LABELS[locale][c]}
                  <span
                    aria-hidden
                    className={cn(
                      "absolute inset-x-3 -bottom-px h-0.5 transition-colors duration-200",
                      on ? "bg-primary" : "bg-transparent",
                    )}
                  />
                </button>
              );
            })}
          </Reveal>

          <div className="mt-6 grid gap-4 sm:mt-8 md:grid-cols-2 lg:grid-cols-3">
            {items.map((post, i) => {
              const text = post.text[locale];
              return (
                <Reveal key={post.date} delay={i * 60}>
                  <article className="group surface h-full overflow-hidden">
                    <div className="h-44 overflow-hidden sm:h-48">
                      <img
                        src={post.image.src}
                        srcSet={post.image.srcSet}
                        sizes="(min-width: 1240px) 390px, (min-width: 1024px) 32vw, (min-width: 768px) 50vw, 100vw"
                        alt={text.alt}
                        loading="lazy"
                        width={1024}
                        height={768}
                        className="h-full w-full object-cover opacity-80 transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
                      />
                    </div>
                    <div className="p-5 sm:p-6">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="text-primary">
                          {CATEGORY_LABELS[locale][post.category]}
                        </span>
                        <span>·</span>
                        <time dateTime={post.date}>{formatDate(post.date, locale)}</time>
                        <span>·</span>
                        <span>{post.read}</span>
                      </div>
                      <h2 className="mt-4 font-display text-lg font-medium leading-snug tracking-tight">
                        {text.title}
                      </h2>
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                        {text.excerpt}
                      </p>
                      <span className="mt-6 inline-flex items-center gap-1.5 text-xs text-foreground/70 transition-colors group-hover:text-primary">
                        {copy.read}
                        <ArrowUpRight size={14} />
                      </span>
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </Container>
      </Section>

      <FinalCta />
    </>
  );
}
