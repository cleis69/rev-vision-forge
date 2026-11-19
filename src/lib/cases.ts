import { MEDIA_BASE } from "./ads";
import type { ClientId } from "./clients";
import { PAGES, type Locale } from "./i18n";

/*
 * Case studies: CITYSTAR and Mars Cabin in full, then the other developers the
 * owner listed (2026-11-17), from their films, scripts and reports.
 * Facts only — what was delivered, as published on the clients' own sites
 * and on the agency's case studies; no figures or results that were not
 * measured. Media live with the films under /media/cases/<slug>/ (outside
 * git): the clients' pictures are kept as delivered, with lighter copies
 * only for display.
 */

export type CaseSlug =
  | "citystar"
  | "mars-cabin"
  | "shams"
  | "allinkech"
  | "peninsula"
  | "bm";

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
  website?: { label: string; href: string };
  /** The programme's page on the REV 3D sales plan, and a capture of it. */
  salesPlan?: Record<Locale, string>;
  planShot?: { src: string; small: string };
  /**
   * Hero: a landscape film (looping, or played once and held on its last
   * image), a capture of the site, one of the films in a phone (by its id), or
   * the client's logo.
   */
  hero:
    | { film: string; poster: string; once?: { end: string } }
    | { shot: string; shotSmall: string }
    | { phone: string }
    | { logo: true };
  copy: Record<
    Locale,
    {
      title: string;
      summary: string;
      card: string;
      facts: { label: string; value: string }[];
      delivered: { title: string; body: string }[];
      /** One line above the films (their number is added before it). */
      filmsNote?: string;
      /** Measured results, from the client's own reports. */
      results?: { value: string; label: string }[];
      resultsNote?: string;
      seoTitle: string;
      seoDescription: string;
    }
  >;
  scenes?: SiteScene[];
  galleries: Gallery[];
};

const NB = "\u00a0";

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
  { n: "09", fr: "Bientôt, pousser la porte", en: "Soon, opening the door" },
  { n: "10", fr: "Réserver en confiance", en: "Booking with confidence" },
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
    hero: {
      film: media("citystar", "intro-3d.mp4"),
      poster: media("citystar", "intro-3d-start.webp"),
      once: { end: media("citystar", "intro-3d-end.webp") },
    },
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
            body: "Des pubs faites à partir des rendus, sans tournage, le suivi du chantier, et la résidence modélisée en 3D, survolée et photographiée du ciel.",
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
        filmsNote: "des pubs faites à partir des rendus 3D et le suivi du chantier.",
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
            body: "Ads made from the renders with no shoot, construction updates, and the residence modelled in 3D, flown over and photographed from the air.",
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
        filmsNote: "ads made from the 3D renders and construction updates.",
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
        id: "3d",
        title: { fr: "La résidence en 3D", en: "The residence in 3D" },
        text: {
          fr: "Les 14 villas modélisées d'après le plan de masse, puis photographiées du ciel, de jour et au crépuscule : les mêmes images que la vue 3D du plan de vente.",
          en: "The 14 villas modelled from the site plan, then photographed from the air, by day and at dusk: the same images as the sales plan's 3D view.",
        },
        layout: "pages",
        images: [
          ["01-vue-aerienne-residence", "La résidence vue du ciel, de jour", "The residence from the air, by day"],
          ["02-vue-aerienne-crepuscule", "La résidence vue du ciel, au crépuscule", "The residence from the air, at dusk"],
        ].map(([f, fr, en]) => ({
          src: media("citystar", `${f}-1600.webp`),
          full: media("citystar", `${f}.png`),
          width: 3840,
          height: 2160,
          alt: { fr: `CITYSTAR en 3D${NB}: ${fr}`, en: `CITYSTAR in 3D: ${en}` },
        })),
      },
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
          ["11", "La villa A, avec ascenseur", "Villa A, with a lift"],
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
  {
    slug: "shams",
    client: "shams",
    name: "Shams Immo",
    year: "2026",
    hero: { phone: "ad-29" },
    copy: {
      fr: {
        title: "Shams Immo : des publicités face caméra, en français et en darija",
        summary:
          "Shams Immo vend de l'immobilier neuf à Marrakech. Nous avons écrit, tourné et monté ses publicités face caméra, une idée par film — le prix d'entrée, le paiement en plusieurs fois, la plus-value, l'objection de l'acheteur —, puis les avons habillées en motion design.",
        card: "Huit publicités face caméra pour une agence d'immobilier neuf, en français et en darija, habillées en motion design.",
        facts: [
          { label: "Lieu", value: "Marrakech" },
          { label: "Langues", value: "Français, darija" },
          { label: "Films", value: "8" },
          { label: "Année", value: "2026" },
        ],
        delivered: [
          {
            title: "Les scripts",
            body: "Une seule idée par publicité, en cinq répliques : le prix d'entrée et la livraison, le paiement jusqu'à la livraison, la plus-value, le budget, l'objection.",
          },
          {
            title: "Le tournage",
            body: "Une présentatrice face caméra, en extérieur et en intérieur, en 4K vertical, avec plusieurs prises par réplique.",
          },
          {
            title: "Le montage",
            body: "La meilleure prise de chaque réplique, coupée à l'image près, la voix nettoyée et mise au même niveau sur toutes les pubs.",
          },
          {
            title: "Le motion design",
            body: "Sous-titres mot à mot, plan de paiement animé qui passe derrière la présentatrice, logo en 3D et cartes « derniers lots », aux couleurs de la marque.",
          },
        ],
        filmsNote: "publicités face caméra, en français et en darija.",
        seoTitle: "Shams Immo : publicités face caméra en français et en darija | REV",
        seoDescription:
          "Étude de cas : pour Shams Immo, agence d'immobilier neuf à Marrakech, REV a écrit, tourné, monté et habillé en motion design huit publicités face caméra, en français et en darija.",
      },
      en: {
        title: "Shams Immo: ads to camera, in French and Darija",
        summary:
          "Shams Immo sells new-build property in Marrakech. We wrote, shot and edited its ads to camera, one idea per film — the entry price, paying in instalments, capital gain, the buyer's objection — then dressed them with motion design.",
        card: "Eight ads to camera for a new-build agency, in French and Darija, dressed with motion design.",
        facts: [
          { label: "Location", value: "Marrakech" },
          { label: "Languages", value: "French, Darija" },
          { label: "Films", value: "8" },
          { label: "Year", value: "2026" },
        ],
        delivered: [
          {
            title: "The scripts",
            body: "A single idea per ad, in five lines: the entry price and delivery, paying until delivery, capital gain, the budget, the objection.",
          },
          {
            title: "The shoot",
            body: "A presenter to camera, outdoors and indoors, in vertical 4K, with several takes per line.",
          },
          {
            title: "The edit",
            body: "The best take of every line, cut to the frame, the voice cleaned and levelled across all the ads.",
          },
          {
            title: "The motion design",
            body: "Word-by-word captions, an animated payment plan that passes behind the presenter, a 3D logo and “last units” cards, in the brand's colours.",
          },
        ],
        filmsNote: "ads to camera, in French and Darija.",
        seoTitle: "Shams Immo: ads to camera in French and Darija | REV",
        seoDescription:
          "Case study: for Shams Immo, a new-build agency in Marrakech, REV wrote, shot, edited and dressed with motion design eight ads to camera, in French and Darija.",
      },
    },
    galleries: [],
  },
  {
    slug: "allinkech",
    client: "allinkech",
    name: "All In Kech",
    year: "2026",
    hero: { phone: "ad-58" },
    copy: {
      fr: {
        title: "All In Kech : des visites face caméra et le projet SERA à Guéliz, en motion design",
        summary:
          "All In Kech est une agence immobilière à Marrakech. Nous avons tourné ses visites face caméra — un triplex, un appartement rénové —, présenté le projet SERA à Guéliz avec la carte de ses trajets à pied, puis habillé ce film en motion design et en trois versions testées sur Instagram.",
        card: "Des visites face caméra, le projet SERA à Guéliz, et sa version en motion design testée en trois habillages.",
        facts: [
          { label: "Lieu", value: "Marrakech" },
          { label: "Projet", value: "SERA, à Guéliz" },
          { label: "Films", value: "4" },
          { label: "Année", value: "2026" },
        ],
        delivered: [
          {
            title: "Les visites",
            body: "Un triplex et un appartement rénové, présentés face caméra et filmés sur place, en vertical, avec et sans le prix à l'écran.",
          },
          {
            title: "Le projet SERA",
            body: "La présentation du projet à Guéliz, avec la carte du quartier et les trajets à pied jusqu'au Jardin Majorelle, au Carré Eden et à la Plaza.",
          },
          {
            title: "Le motion design",
            body: "Le même film habillé image par image aux couleurs de l'agence, or et terracotta : sous-titres calés sur la voix, cartes, chiffres et plans redessinés.",
          },
          {
            title: "Les trial reels",
            body: "Trois habillages du même film, publiés pour voir lequel retient le mieux sur Instagram avant de pousser le gagnant.",
          },
          {
            title: "Les scripts",
            body: "Pour un riad à Bab Debbagh : l'accroche sur le rooftop, les trajets jusqu'à la médina, Majorelle et Guéliz, puis le riad rénové et meublé.",
          },
        ],
        filmsNote: "visites, présentation du projet SERA et sa version en motion design.",
        seoTitle: "All In Kech : visites face caméra et projet SERA à Guéliz | REV",
        seoDescription:
          "Étude de cas : pour All In Kech, agence immobilière à Marrakech, REV a tourné des visites face caméra, présenté le projet SERA à Guéliz et l'a habillé en motion design.",
      },
      en: {
        title: "All In Kech: tours to camera and the SERA project in Guéliz, in motion design",
        summary:
          "All In Kech is a real estate agency in Marrakech. We shot its tours to camera — a triplex, a renovated flat —, presented the SERA project in Guéliz with a map of its walking routes, then dressed that film in motion design and in three versions tested on Instagram.",
        card: "Tours to camera, the SERA project in Guéliz, and its motion design version tested in three treatments.",
        facts: [
          { label: "Location", value: "Marrakech" },
          { label: "Project", value: "SERA, in Guéliz" },
          { label: "Films", value: "4" },
          { label: "Year", value: "2026" },
        ],
        delivered: [
          {
            title: "The tours",
            body: "A triplex and a renovated flat, presented to camera and filmed on location, vertically, with and without the price on screen.",
          },
          {
            title: "The SERA project",
            body: "The project's presentation in Guéliz, with the neighbourhood map and walking routes to the Majorelle Garden, Carré Eden and the Plaza.",
          },
          {
            title: "The motion design",
            body: "The same film dressed frame by frame in the agency's colours, gold and terracotta: captions timed to the voice, cards, figures and redrawn shots.",
          },
          {
            title: "The trial reels",
            body: "Three treatments of the same film, published to see which one holds viewers best on Instagram before pushing the winner.",
          },
          {
            title: "The scripts",
            body: "For a riad in Bab Debbagh: the hook on the rooftop, the routes to the medina, Majorelle and Guéliz, then the renovated, furnished riad.",
          },
        ],
        filmsNote: "tours, the SERA project and its motion design version.",
        seoTitle: "All In Kech: tours to camera and the SERA project in Guéliz | REV",
        seoDescription:
          "Case study: for All In Kech, a real estate agency in Marrakech, REV shot tours to camera, presented the SERA project in Guéliz and dressed it in motion design.",
      },
    },
    galleries: [],
  },
  {
    slug: "peninsula",
    client: "peninsula",
    name: "Villa Peninsula",
    year: "2026",
    website: { label: "villa-peninsula.com", href: "https://villa-peninsula.com" },
    hero: { phone: "ad-01" },
    copy: {
      fr: {
        title: "Villa Peninsula : une résidence de 92 villas, présentée en français et en néerlandais",
        summary:
          "Résidence privée de 92 villas avec piscine, 60 Oasis et 32 Atlas, sur la route d'Amizmiz, face à l'Atlas et à moins de 15 minutes du centre de Marrakech. Nous avons tourné ses publicités : la présentation de la résidence en français, et une version en néerlandais pour les acheteurs néerlandophones.",
        card: "Les publicités d'une résidence de 92 villas, en français et en néerlandais.",
        facts: [
          { label: "Lieu", value: "Route d'Amizmiz, Marrakech" },
          { label: "Résidence", value: "92 villas" },
          { label: "Langues", value: "Français, néerlandais" },
          { label: "Année", value: "2026" },
        ],
        delivered: [
          {
            title: "Le film de présentation",
            body: "La résidence présentée face caméra, de la villa à la piscine, jusqu'au formulaire pour recevoir la liste des villas.",
          },
          {
            title: "La version néerlandaise",
            body: "Le même parcours, tourné en néerlandais, pour un marché où le programme recrute une partie de ses acheteurs.",
          },
          {
            title: "Les fins de film",
            body: "Chaque film se termine sur le logo et sur l'action attendue : compléter le formulaire.",
          },
        ],
        filmsNote: "films de présentation, en français et en néerlandais.",
        seoTitle: "Villa Peninsula : publicités en français et en néerlandais | REV",
        seoDescription:
          "Étude de cas : pour Villa Peninsula, résidence de 92 villas route d'Amizmiz à Marrakech, REV a tourné les publicités de présentation en français et en néerlandais.",
      },
      en: {
        title: "Villa Peninsula: a 92-villa residence, presented in French and Dutch",
        summary:
          "A private residence of 92 villas with pools, 60 Oasis and 32 Atlas, on the Amizmiz road, facing the Atlas and less than 15 minutes from central Marrakech. We shot its ads: the residence presented in French, and a Dutch version for Dutch-speaking buyers.",
        card: "The ads of a 92-villa residence, in French and Dutch.",
        facts: [
          { label: "Location", value: "Amizmiz road, Marrakech" },
          { label: "Residence", value: "92 villas" },
          { label: "Languages", value: "French, Dutch" },
          { label: "Year", value: "2026" },
        ],
        delivered: [
          {
            title: "The presentation film",
            body: "The residence presented to camera, from the villa to the pool, ending on the form to receive the list of villas.",
          },
          {
            title: "The Dutch version",
            body: "The same path, shot in Dutch, for a market where the development finds part of its buyers.",
          },
          {
            title: "The endings",
            body: "Every film ends on the logo and on the expected action: filling in the form.",
          },
        ],
        filmsNote: "presentation films, in French and Dutch.",
        seoTitle: "Villa Peninsula: ads in French and Dutch | REV",
        seoDescription:
          "Case study: for Villa Peninsula, a 92-villa residence on the Amizmiz road in Marrakech, REV shot the presentation ads in French and Dutch.",
      },
    },
    galleries: [],
  },
  {
    slug: "bm",
    client: "bm",
    name: "BM Immobilier",
    year: "2026",
    hero: { logo: true },
    copy: {
      fr: {
        title: "BM Immobilier : six semaines de campagnes au Maroc pour une agence de Marrakech",
        summary:
          "Agence immobilière à Marrakech, BM Immobilier voulait se faire connaître au Maroc. Nous avons tourné ses publicités face caméra et dans les biens, monté une version par réseau, puis suivi les campagnes Snapchat et Facebook pendant six semaines.",
        card: "Six semaines de campagnes Snapchat et Facebook au Maroc pour une agence de Marrakech.",
        facts: [
          { label: "Lieu", value: "Marrakech" },
          { label: "Réseaux", value: "Snapchat, Facebook, TikTok" },
          { label: "Campagnes", value: "6 semaines" },
          { label: "Année", value: "2026" },
        ],
        delivered: [
          {
            title: "Le tournage",
            body: "Face caméra et dans les biens : les villas, les intérieurs, les rendez-vous, jusqu'à la remise des clés.",
          },
          {
            title: "Les déclinaisons",
            body: "Une version par réseau, pour Snapchat, Facebook et TikTok, avec la nouvelle identité de l'agence en fin de film.",
          },
          {
            title: "Le suivi des campagnes",
            body: "Un rapport par plateforme et par création, et les prochaines étapes : décliner la vidéo gagnante, passer d'un objectif de trafic à un objectif de demandes.",
          },
        ],
        filmsNote: "publicités pour l'agence.",
        results: [
          { value: `100${NB}056`, label: "affichages" },
          { value: `3${NB}678`, label: "clics" },
          { value: "1,66 %", label: "de clics sur les affichages Snapchat" },
        ],
        resultsNote: "Campagnes Snapchat et Facebook au Maroc, du 1er janvier au 14 février 2026, d'après le rapport des plateformes.",
        seoTitle: "BM Immobilier : publicités Snapchat, Facebook et TikTok | REV",
        seoDescription:
          "Étude de cas : pour BM Immobilier, agence à Marrakech, REV a tourné les publicités, monté les versions Snapchat, Facebook et TikTok et suivi six semaines de campagnes au Maroc.",
      },
      en: {
        title: "BM Immobilier: six weeks of campaigns in Morocco for a Marrakech agency",
        summary:
          "A real estate agency in Marrakech, BM Immobilier wanted to be known in Morocco. We shot its ads to camera and in the properties, edited a version per network, then followed the Snapchat and Facebook campaigns for six weeks.",
        card: "Six weeks of Snapchat and Facebook campaigns in Morocco for a Marrakech agency.",
        facts: [
          { label: "Location", value: "Marrakech" },
          { label: "Networks", value: "Snapchat, Facebook, TikTok" },
          { label: "Campaigns", value: "6 weeks" },
          { label: "Year", value: "2026" },
        ],
        delivered: [
          {
            title: "The shoot",
            body: "To camera and in the properties: the villas, the interiors, the meetings, up to the handover of the keys.",
          },
          {
            title: "The versions",
            body: "One version per network, for Snapchat, Facebook and TikTok, with the agency's new identity at the end of each film.",
          },
          {
            title: "Following the campaigns",
            body: "A report by platform and by creative, and the next steps: build on the winning video, move from a traffic goal to an enquiries goal.",
          },
        ],
        filmsNote: "ads for the agency.",
        results: [
          { value: "100,056", label: "impressions" },
          { value: "3,678", label: "clicks" },
          { value: "1.66%", label: "click-through rate on Snapchat" },
        ],
        resultsNote: "Snapchat and Facebook campaigns in Morocco, 1 January to 14 February 2026, from the platforms' report.",
        seoTitle: "BM Immobilier: Snapchat, Facebook and TikTok ads | REV",
        seoDescription:
          "Case study: for BM Immobilier, an agency in Marrakech, REV shot the ads, edited the Snapchat, Facebook and TikTok versions and followed six weeks of campaigns in Morocco.",
      },
    },
    galleries: [],
  },
];

export const caseBySlug = (slug: string) => CASES.find((c) => c.slug === slug);

/** The picture blurred behind a case's glass stage. */
export function heroBackdrop(study: CaseStudy): string | undefined {
  const hero = study.hero;
  if ("film" in hero) return hero.once?.end ?? hero.poster;
  if ("shot" in hero) return hero.shotSmall;
  if ("phone" in hero) return `${MEDIA_BASE}/still/${hero.phone}-360.webp?v=3`;
  return undefined;
}

/** /portfolio/<slug> in French, /en/portfolio/<slug> in English. */
export const casePath = (slug: CaseSlug, locale: Locale) => `${PAGES.portfolio[locale]}/${slug}`;
