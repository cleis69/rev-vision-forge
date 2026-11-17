import { MEDIA_BASE } from "./ads";
import type { ClientId } from "./clients";
import { PAGES, type Locale } from "./i18n";

/*
 * Case studies: two programmes the owner asked to show in full (2026-11-17).
 * Facts only — what was delivered, as published on the clients' own sites
 * and on the agency's case studies; no figures or results that were not
 * measured. Media live with the films under /media/cases/<slug>/ (outside
 * git): the clients' pictures are kept as delivered, with lighter copies
 * only for display.
 */

export type CaseSlug = "citystar" | "mars-cabin";

type Text = Record<Locale, string>;

export type SiteScene = {
  id: string;
  frame: "desktop" | "phone";
  tab: Text;
  title: Text;
  body: Text;
};

export type GalleryImage = { src: string; full?: string; width: number; height: number; alt: Text };

export type Gallery = {
  id: string;
  title: Text;
  text: Text;
  layout: "posts" | "pages" | "single";
  images: GalleryImage[];
};

export type CaseStudy = {
  slug: CaseSlug;
  client: ClientId;
  name: string;
  year: string;
  website: { label: string; href: string };
  /** The programme's page on the REV 3D sales plan, and a capture of it. */
  salesPlan?: Record<Locale, string>;
  planShot?: { src: string; small: string };
  /** Hero: a film (landscape) or a capture of the site. */
  hero: { film: string; poster: string } | { shot: string; shotSmall: string };
  copy: Record<
    Locale,
    {
      title: string;
      summary: string;
      card: string;
      facts: { label: string; value: string }[];
      delivered: { title: string; body: string }[];
      seoTitle: string;
      seoDescription: string;
    }
  >;
  scenes?: SiteScene[];
  galleries: Gallery[];
};

const media = (slug: CaseSlug, file: string) => `${MEDIA_BASE}/cases/${slug}/${file}`;

export const sceneMedia = (slug: CaseSlug, id: string) => ({
  src: media(slug, `site-${id}.mp4`),
  poster: media(slug, `site-${id}.webp`),
});

/** Instagram posts kept for the page (4:5), by their file number. */
const POSTS: { n: string; fr: string; en: string }[] = [
  { n: "01", fr: "Quatorze villas, pas une de plus", en: "Fourteen villas, not one more" },
  { n: "02", fr: "Jusqu'à 2 000 m² de terrain pour une seule villa", en: "Up to 2,000 m² of land for a single villa" },
  { n: "03", fr: "À l'abri des regards", en: "Away from prying eyes" },
  { n: "05", fr: "Loin de l'agitation, proche de l'essentiel", en: "Far from the bustle, close to what matters" },
  { n: "06", fr: "Visitez depuis Paris, Bruxelles ou Montréal", en: "Visit from Paris, Brussels or Montreal" },
  { n: "07", fr: "Livraison prévue en août 2027", en: "Delivery planned for August 2027" },
  { n: "08", fr: "À 19 minutes", en: "19 minutes away" },
  { n: "09", fr: "Bientôt, pousser la porte", en: "Soon, opening the door" },
];

export const CASES: CaseStudy[] = [
  {
    slug: "citystar",
    client: "citystar",
    name: "CITYSTAR",
    year: "2026",
    website: { label: "citystar.ma", href: "https://www.citystar.ma" },
    salesPlan: { fr: "/p/city-star", en: "/en/p/city-star" },
    planShot: { src: media("citystar", "plan-1440.webp"), small: media("citystar", "plan-960.webp") },
    hero: { film: `${MEDIA_BASE}/full/ad-47.mp4`, poster: `${MEDIA_BASE}/poster/ad-47-1280.webp` },
    copy: {
      fr: {
        title: "CITYSTAR, quatorze villas à Marrakech : le site, les films et le plan de vente 3D",
        summary:
          "Résidence privée de 14 villas contemporaines à Oulad Hassoune, près de la Palmeraie. Nous avons conçu le site en six langues avec son CRM et ses e-mails, réalisé les films et les pubs 3D, tenu le compte Instagram, refait la brochure, dessiné le logo, puis publié le programme sur notre plan de vente 3D.",
        card: "Le site en six langues, les films, Instagram, la brochure, le logo et le plan de vente 3D d'un programme de 14 villas.",
        facts: [
          { label: "Lieu", value: "Oulad Hassoune, Marrakech" },
          { label: "Programme", value: "14 villas, trois architectures" },
          { label: "Site", value: "Six langues" },
          { label: "Année", value: "2026" },
        ],
        delivered: [
          {
            title: "Le site et son CRM",
            body: "citystar.ma en français, anglais, espagnol, italien, néerlandais et norvégien. Chaque demande de brochure, de plans ou d'échéancier arrive dans le CRM avec la villa et la langue du contact.",
          },
          {
            title: "Les e-mails",
            body: "Huit e-mails en trois semaines après la demande de dossier, arrêtés dès que l'acheteur répond ; puis la visite, l'accueil des acquéreurs et le chantier. Quinze modèles en six langues : quatre-vingt-dix e-mails.",
          },
          {
            title: "L'espace propriétaire",
            body: "Une connexion sans mot de passe pour suivre l'avancement, les photos et les paiements depuis l'étranger, et deux simulateurs : rendement locatif, échéancier avec crédit.",
          },
          {
            title: "Les films et les pubs 3D",
            body: "Un film en images générées, un film en texte, les rendus mis en relief et cinq pubs faites des seuls rendus, sans tournage.",
          },
          {
            title: "Instagram, la brochure et le logo",
            body: "Une direction artistique pour le compte et ses publications semaine par semaine, une brochure de 28 pages en français et en anglais, et le logo « Constellation ».",
          },
          {
            title: "Le plan de vente 3D",
            body: "Les 14 villas sur notre plan de vente : la résidence en 3D qui tourne, le statut de chaque villa en direct et la visite 360° de la villa A, pièce par pièce.",
          },
        ],
        seoTitle: "CITYSTAR, 14 villas à Marrakech : site, films et plan de vente 3D | REV",
        seoDescription:
          "Étude de cas : pour CITYSTAR, 14 villas à Marrakech, REV a conçu le site en six langues et son CRM, les films et pubs 3D, Instagram, la brochure, le logo et le plan de vente 3D.",
      },
      en: {
        title: "CITYSTAR, fourteen villas in Marrakech: the website, the films and the 3D sales plan",
        summary:
          "A private residence of 14 contemporary villas in Oulad Hassoune, near the Palmeraie. We designed the website in six languages with its CRM and emails, made the films and 3D ads, ran the Instagram account, redid the brochure, drew the logo, then published the development on our 3D sales plan.",
        card: "The six-language website, films, Instagram, brochure, logo and 3D sales plan of a 14-villa development.",
        facts: [
          { label: "Location", value: "Oulad Hassoune, Marrakech" },
          { label: "Development", value: "14 villas, three designs" },
          { label: "Website", value: "Six languages" },
          { label: "Year", value: "2026" },
        ],
        delivered: [
          {
            title: "The website and its CRM",
            body: "citystar.ma in French, English, Spanish, Italian, Dutch and Norwegian. Every request for the brochure, plans or payment schedule reaches the CRM with the villa and the contact's language.",
          },
          {
            title: "The emails",
            body: "Eight emails over three weeks after a request, stopped as soon as the buyer replies; then the visit, the welcome of new owners and the building site. Fifteen templates in six languages: ninety emails.",
          },
          {
            title: "The owners' area",
            body: "A password-free login to follow progress, photos and payments from abroad, and two simulators: rental yield, and a payment schedule with a mortgage.",
          },
          {
            title: "The films and 3D ads",
            body: "An AI-generated film, a text film, the renders set in relief and five ads made from the renders alone, with no shoot.",
          },
          {
            title: "Instagram, the brochure and the logo",
            body: "An art direction for the account and its posts week by week, a 28-page brochure in French and English, and the “Constellation” logo.",
          },
          {
            title: "The 3D sales plan",
            body: "The 14 villas on our sales plan: the residence in 3D, turning, the live status of every villa, and the 360° tour of villa A, room by room.",
          },
        ],
        seoTitle: "CITYSTAR, 14 villas in Marrakech: website, films and 3D sales plan | REV",
        seoDescription:
          "Case study: for CITYSTAR, 14 villas in Marrakech, REV designed the six-language website and its CRM, the films and 3D ads, Instagram, the brochure, the logo and the 3D sales plan.",
      },
    },
    scenes: [
      {
        id: "accueil",
        frame: "desktop",
        tab: { fr: "Accueil", en: "Home" },
        title: { fr: "L'accueil du site", en: "The home page" },
        body: {
          fr: "Les trois types de villas, la galerie et la visite 360°, la carte et les temps de trajet, le parcours d'achat chez le notaire et le calendrier du chantier.",
          en: "The three villa types, the gallery and the 360° tour, the map and travel times, the purchase steps with the notary and the building schedule.",
        },
      },
      {
        id: "dossier",
        frame: "desktop",
        tab: { fr: "Dossier", en: "Request" },
        title: { fr: "La page dossier", en: "The request page" },
        body: {
          fr: "Pour les acheteurs venus de la publicité : brochure, plans et échéancier demandés en un formulaire, qui arrive dans le CRM avec la villa et la langue.",
          en: "For buyers coming from ads: brochure, plans and payment schedule asked for in one form, which reaches the CRM with the villa and the language.",
        },
      },
      {
        id: "telephone",
        frame: "phone",
        tab: { fr: "Téléphone", en: "Phone" },
        title: { fr: "La même page, sur téléphone", en: "The same page, on a phone" },
        body: {
          fr: "Pensée d'abord pour le téléphone, d'où arrivent les acheteurs de la publicité.",
          en: "Designed first for the phone, where buyers from the ads arrive.",
        },
      },
      {
        id: "langues",
        frame: "desktop",
        tab: { fr: "Six langues", en: "Six languages" },
        title: { fr: "Six langues", en: "Six languages" },
        body: {
          fr: "Français, anglais, espagnol, italien, néerlandais et norvégien : chaque page existe dans la langue de l'acheteur.",
          en: "French, English, Spanish, Italian, Dutch and Norwegian: every page exists in the buyer's language.",
        },
      },
      {
        id: "emails",
        frame: "phone",
        tab: { fr: "E-mails", en: "Emails" },
        title: { fr: "Les e-mails, lus sur téléphone", en: "The emails, read on a phone" },
        body: {
          fr: "La campagne qui suit chaque demande : huit e-mails en trois semaines, dans la langue du contact.",
          en: "The campaign that follows every request: eight emails over three weeks, in the contact's language.",
        },
      },
      {
        id: "espaces",
        frame: "desktop",
        tab: { fr: "Espaces", en: "Areas" },
        title: { fr: "L'espace propriétaire et l'espace promoteur", en: "The owners' and developer's areas" },
        body: {
          fr: "L'acquéreur suit son chantier, ses photos et ses paiements ; le promoteur suit ses acheteurs.",
          en: "Buyers follow their building site, photos and payments; the developer follows the buyers.",
        },
      },
    ],
    galleries: [
      {
        id: "instagram",
        title: { fr: "Instagram", en: "Instagram" },
        text: {
          fr: "Une direction artistique pour le compte, puis des publications, des carrousels et des légendes préparés semaine par semaine.",
          en: "An art direction for the account, then posts, carousels and captions prepared week by week.",
        },
        layout: "posts",
        images: POSTS.map((post) => ({
          src: media("citystar", `instagram/post-${post.n}-540.webp`),
          full: media("citystar", `instagram/post-${post.n}.png`),
          width: 1080,
          height: 1350,
          alt: { fr: `Publication Instagram : ${post.fr}`, en: `Instagram post: ${post.en}` },
        })),
      },
      {
        id: "brochure",
        title: { fr: "La brochure", en: "The brochure" },
        text: {
          fr: "28 pages A4 à l'italienne, en français et en anglais : le domaine, les trois types de villas, leurs plans et leurs surfaces.",
          en: "28 landscape A4 pages, in French and English: the estate, the three villa types, their plans and floor areas.",
        },
        layout: "pages",
        images: [
          ["01", "Couverture de la brochure", "The brochure's cover"],
          ["05", "Quatorze villas, trois architectures", "Fourteen villas, three designs"],
          ["06", "Le plan de masse du domaine", "The estate's site plan"],
          ["07", "Une architecture exigeante", "Demanding architecture"],
        ].map(([n, fr, en]) => ({
          src: media("citystar", `brochure-${n}.webp`),
          width: 1200,
          height: 849,
          alt: { fr: `Brochure CITYSTAR : ${fr}`, en: `CITYSTAR brochure: ${en}` },
        })),
      },
      {
        id: "logo",
        title: { fr: "Le logo", en: "The logo" },
        text: {
          fr: "L'étoile du logo d'origine redessinée en un C de sept étoiles sur une grille de trois sur trois.",
          en: "The star of the original logo redrawn as a C of seven stars on a three-by-three grid.",
        },
        layout: "single",
        images: [
          {
            src: media("citystar", "logo.webp"),
            width: 1352,
            height: 792,
            alt: {
              fr: "Le logo CITYSTAR Properties sur fond clair et sur fond sombre, en version empilée et en avatar",
              en: "The CITYSTAR Properties logo on light and dark grounds, stacked and as an avatar",
            },
          },
        ],
      },
    ],
  },
  {
    slug: "mars-cabin",
    client: "mars-cabin",
    name: "Mars Cabin Morocco",
    year: "2026",
    website: { label: "marscabinmorocco.com", href: "https://marscabinmorocco.com" },
    hero: { shot: media("mars-cabin", "shot-1440.webp"), shotSmall: media("mars-cabin", "shot-960.webp") },
    copy: {
      fr: {
        title: "Mars Cabin Morocco : le logo, le site et la brochure d'un projet de retraites en cabines",
        summary:
          "Initiative privée de Bivety Group : des cabines fabriquées en usine, installées dans de petites retraites au cœur des montagnes, des forêts et des oasis du Maroc. Nous avons dessiné le logo, conçu et mis en ligne le site pour les investisseurs et les futurs hôtes, réalisé la brochure et les rendus 3D de la cabine.",
        card: "Le logo, le site pour les investisseurs et les futurs hôtes, la brochure et les rendus 3D d'un projet de retraites en cabines.",
        facts: [
          { label: "Lieu", value: "Maroc" },
          { label: "Site", value: "En anglais" },
          { label: "Brochure", value: "14 pages" },
          { label: "Année", value: "2026" },
        ],
        delivered: [
          {
            title: "Le logo",
            body: "Un « M » dessiné par deux sommets du Haut Atlas, devant un disque terracotta : la planète Mars, ou le soleil qui se lève sur la terre rouge du Maroc.",
          },
          {
            title: "Le site",
            body: "Deux publics : les investisseurs demandent la note de présentation, les futurs hôtes s'inscrivent sur la liste d'attente. Chaque demande est enregistrée puis transmise par e-mail.",
          },
          {
            title: "Le contenu",
            body: "La cabine de 36,8 m² livrée en un seul module, ses intérieurs, sa fabrication et ses certificats, trois déclinaisons marocaines présentées comme des concepts créés par IA, et six territoires d'étude sur une carte.",
          },
          {
            title: "La brochure",
            body: "14 pages A4 à l'italienne, qui reprennent le parcours du site pour les investisseurs.",
          },
          {
            title: "La cabine en 3D",
            body: "Quatre styles de rendu étudiés pour la présenter : maquette, vue en coupe, dessin au trait et affiche.",
          },
        ],
        seoTitle: "Mars Cabin Morocco : logo, site et brochure | REV",
        seoDescription:
          "Étude de cas : pour Mars Cabin Morocco, projet de retraites en cabines au Maroc, REV a dessiné le logo, conçu le site pour investisseurs et futurs hôtes, la brochure de 14 pages et les rendus 3D.",
      },
      en: {
        title: "Mars Cabin Morocco: the logo, website and brochure of a cabin retreat project",
        summary:
          "A private initiative of Bivety Group: factory-built cabins set in small retreats in the mountains, forests and oases of Morocco. We drew the logo, designed and launched the website for investors and future guests, and made the brochure and the cabin's 3D renders.",
        card: "The logo, the website for investors and future guests, the brochure and the 3D renders of a cabin retreat project.",
        facts: [
          { label: "Location", value: "Morocco" },
          { label: "Website", value: "In English" },
          { label: "Brochure", value: "14 pages" },
          { label: "Year", value: "2026" },
        ],
        delivered: [
          {
            title: "The logo",
            body: "An “M” drawn by two peaks of the High Atlas, in front of a terracotta disc: the planet Mars, or the sun rising over Morocco's red earth.",
          },
          {
            title: "The website",
            body: "Two audiences: investors ask for the information memorandum, future guests join the waiting list. Every request is saved, then forwarded by email.",
          },
          {
            title: "The content",
            body: "The 36.8 m² cabin delivered as a single module, its interiors, how it is made and its certificates, three Moroccan variations presented as AI-made concepts, and six study areas on a map.",
          },
          {
            title: "The brochure",
            body: "14 landscape A4 pages that follow the website's path for investors.",
          },
          {
            title: "The cabin in 3D",
            body: "Four rendering styles explored to present it: model, cutaway, line drawing and poster.",
          },
        ],
        seoTitle: "Mars Cabin Morocco: logo, website and brochure | REV",
        seoDescription:
          "Case study: for Mars Cabin Morocco, a cabin retreat project in Morocco, REV drew the logo, designed the website for investors and future guests, the 14-page brochure and the 3D renders.",
      },
    },
    galleries: [
      {
        id: "logo",
        title: { fr: "Le logo", en: "The logo" },
        text: {
          fr: "Version principale, sur fond sombre, en une couleur, empilée, et le symbole seul.",
          en: "Main version, on a dark ground, in one colour, stacked, and the symbol alone.",
        },
        layout: "single",
        images: [
          {
            src: media("mars-cabin", "logo.webp"),
            width: 1400,
            height: 1091,
            alt: {
              fr: "Le logo Mars Cabin Morocco dans ses cinq versions",
              en: "The Mars Cabin Morocco logo in its five versions",
            },
          },
        ],
      },
      {
        id: "brochure",
        title: { fr: "La brochure", en: "The brochure" },
        text: {
          fr: "14 pages A4 à l'italienne, pour les investisseurs.",
          en: "14 landscape A4 pages, for investors.",
        },
        layout: "pages",
        images: [
          ["01", "Couverture de la brochure", "The brochure's cover"],
          ["03", "La cabine, un module tout compris", "The cabin, an all-in module"],
          ["05", "Les intérieurs", "The interiors"],
          ["11", "La carte des six territoires d'étude", "The map of the six study areas"],
        ].map(([n, fr, en]) => ({
          src: media("mars-cabin", `brochure-${n}.webp`),
          width: 1200,
          height: 848,
          alt: { fr: `Brochure Mars Cabin : ${fr}`, en: `Mars Cabin brochure: ${en}` },
        })),
      },
      {
        id: "cabine",
        title: { fr: "La cabine en 3D", en: "The cabin in 3D" },
        text: {
          fr: "Maquette, vue en coupe, dessin au trait et affiche.",
          en: "Model, cutaway, line drawing and poster.",
        },
        layout: "single",
        images: [
          {
            src: media("mars-cabin", "cabine-3d.webp"),
            width: 1600,
            height: 1209,
            alt: {
              fr: "La cabine Mars Cabin en quatre styles de rendu 3D",
              en: "The Mars Cabin in four 3D rendering styles",
            },
          },
        ],
      },
    ],
  },
];

export const caseBySlug = (slug: string) => CASES.find((c) => c.slug === slug);

/** /portfolio/<slug> in French, /en/portfolio/<slug> in English. */
export const casePath = (slug: CaseSlug, locale: Locale) => `${PAGES.portfolio[locale]}/${slug}`;
