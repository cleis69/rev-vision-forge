/**
 * REV portfolio — the films produced for real-estate clients.
 * ADS are the 21 vertical ads of the home page's phone (they have a teaser);
 * FILMS is the whole portfolio: those 21, plus agency, short-let and 3D films.
 * Ads are identified by a neutral id. A client is named (CLIENTS, see
 * clients.ts) only for the developers the owner listed on 2026-11-17.
 * Media files live outside git and are deployed with the static site under
 * /media; builds without VITE_MEDIA_BASE (e.g. Lovable) read them from the
 * production domain.
 */

export const MEDIA_BASE =
  import.meta.env.VITE_MEDIA_BASE ??
  "https://realestatevision360.com/media";

import type { Locale } from "./i18n";
import type { ClientId } from "./clients";

export const AD_CATEGORIES = ["programmes", "agences", "visites", "films"] as const;

export type AdCategory = (typeof AD_CATEGORIES)[number];

export const AD_CATEGORY_LABELS: Record<Locale, Record<AdCategory, string>> = {
  fr: {
    programmes: "Programmes neufs",
    agences: "Agences et agents",
    visites: "Visites et locations",
    films: "Films et 3D",
  },
  en: {
    programmes: "New developments",
    agences: "Agencies and agents",
    visites: "Tours and short lets",
    films: "Films and 3D",
  },
};

export type AdStats = { views: number; likes: number; leads: number };

export type Ad = {
  id: string;
  title: Record<Locale, string>;
  category: AdCategory;
  /** Duration in seconds. */
  duration: number;
  /** Spoken language when it is not French. */
  lang?: "NL" | "IT";
  /** Landscape films; the others are vertical (9:16). */
  aspect?: "16/9";
  /** Named only for the developers listed in clients.ts. */
  client?: ClientId;
};

export const ADS: Ad[] = [
  { id: "ad-01", title: { fr: "Villa à partir de 3 490 000 MAD", en: "Villa from MAD 3,490,000" }, category: "programmes", duration: 31, client: "peninsula" },
  { id: "ad-02", title: { fr: "Emplacement prisé, piscine et meilleures unités", en: "Prime location, pool and the best units" }, category: "programmes", duration: 26 },
  { id: "ad-03", title: { fr: "Y vivre ou investir, à 3 min de Guéliz", en: "Live or invest, 3 minutes from Guéliz" }, category: "programmes", duration: 23 },
  { id: "ad-04", title: { fr: "Room tour d'un appartement", en: "Apartment room tour" }, category: "visites", duration: 46 },
  { id: "ad-05", title: { fr: "Le calme, et les meilleurs lots", en: "Calm surroundings, the best plots" }, category: "programmes", duration: 26, client: "shah" },
  { id: "ad-06", title: { fr: "Des visuels qui subliment vos biens", en: "Visuals that elevate your properties" }, category: "agences", duration: 39 },
  { id: "ad-07", title: { fr: "Une offre avant la montée des prix", en: "An offer before prices go up" }, category: "programmes", duration: 30, client: "shah" },
  { id: "ad-08", title: { fr: "Vivre et investir dans le même projet", en: "Live and invest in the same project" }, category: "programmes", duration: 29, client: "emara" },
  { id: "ad-09", title: { fr: "Personal branding d'agent immobilier", en: "Real estate agent personal branding" }, category: "agences", duration: 21 },
  { id: "ad-10", title: { fr: "Room tour d'une villa", en: "Villa room tour" }, category: "visites", duration: 118 },
  { id: "ad-11", title: { fr: "Pour le prix d'un 30 m² à Paris", en: "For the price of 30 m² in Paris" }, category: "programmes", duration: 21, client: "shah" },
  { id: "ad-12", title: { fr: "Acheter sur plan, version néerlandaise", en: "Buying off-plan, Dutch version" }, category: "programmes", duration: 41, lang: "NL" },
  { id: "ad-13", title: { fr: "À 5 minutes de l'aéroport", en: "5 minutes from the airport" }, category: "programmes", duration: 27, client: "shah" },
  { id: "ad-14", title: { fr: "Room tour d'un appartement meublé", en: "Furnished apartment room tour" }, category: "visites", duration: 66 },
  { id: "ad-15", title: { fr: "Comprendre le plan de paiement", en: "Understanding the payment plan" }, category: "programmes", duration: 81, client: "shah" },
  { id: "ad-16", title: { fr: "Une villa présentée au marché néerlandais", en: "A villa presented to Dutch buyers" }, category: "programmes", duration: 33, lang: "NL", client: "peninsula" },
  { id: "ad-17", title: { fr: "Un investissement clé en main", en: "A turnkey investment" }, category: "programmes", duration: 27, client: "shah" },
  { id: "ad-18", title: { fr: "Choisir un promoteur fiable", en: "Choosing a reliable developer" }, category: "programmes", duration: 24, client: "emara" },
  { id: "ad-19", title: { fr: "Un intermédiaire de confiance, en néerlandais", en: "A trusted intermediary, in Dutch" }, category: "agences", duration: 30, lang: "NL" },
  { id: "ad-20", title: { fr: "Rêver sa vie, ou vivre son rêve", en: "Dream your life, or live your dream" }, category: "programmes", duration: 36 },
  { id: "ad-21", title: { fr: "Investir au soleil", en: "Invest in the sun" }, category: "programmes", duration: 13, client: "bm" },
];

/** The rest of the portfolio (rev-vision-forge-media/encode-v4.sh): no teaser. */
const MORE: Ad[] = [
  { id: "ad-22", title: { fr: "Un triplex à Marrakech, présenté face caméra", en: "A triplex in Marrakech, presented to camera" }, category: "agences", duration: 23 },
  { id: "ad-23", title: { fr: "Une résidence neuve, un cadre de vie avant un plan", en: "A new residence, a way of life before a floor plan" }, category: "programmes", duration: 26 },
  { id: "ad-24", title: { fr: "L'immobilier neuf à Marrakech, face caméra", en: "New-build property in Marrakech, to camera" }, category: "agences", duration: 20, client: "shams" },
  { id: "ad-25", title: { fr: "Un appartement rénové, visité face caméra", en: "A renovated flat, toured to camera" }, category: "visites", duration: 18 },
  { id: "ad-26", title: { fr: "Le budget de l'acheteur", en: "The buyer's budget" }, category: "agences", duration: 16 },
  { id: "ad-27", title: { fr: "Sur le chantier d'un programme neuf", en: "On the site of a new development" }, category: "agences", duration: 21 },
  { id: "ad-28", title: { fr: "Une publicité en darija", en: "An ad in Darija" }, category: "agences", duration: 17 },
  { id: "ad-29", title: { fr: "Une présentatrice, deux rôles", en: "One presenter, two parts" }, category: "agences", duration: 22 },
  { id: "ad-30", title: { fr: "Face caméra, avec des titres animés", en: "To camera, with animated titles" }, category: "agences", duration: 22 },
  { id: "ad-31", title: { fr: "Le film d'équipe d'une agence", en: "An agency's team film" }, category: "films", duration: 39, aspect: "16/9" },
  { id: "ad-32", title: { fr: "Deux présentateurs visitent un bien", en: "Two presenters tour a property" }, category: "visites", duration: 141 },
  { id: "ad-33", title: { fr: "L'objection de l'acheteur", en: "The buyer's objection" }, category: "agences", duration: 23 },
  { id: "ad-34", title: { fr: "Un programme dans la Palmeraie", en: "A development in the Palmeraie" }, category: "programmes", duration: 20 },
  { id: "ad-35", title: { fr: "Pas comme les autres agences", en: "Not like the other agencies" }, category: "agences", duration: 21 },
  { id: "ad-36", title: { fr: "Portée par une présentatrice", en: "Led by a presenter" }, category: "agences", duration: 29 },
  { id: "ad-37", title: { fr: "Première visite d'une résidence", en: "First visit to a residence" }, category: "programmes", duration: 30 },
  { id: "ad-38", title: { fr: "Un programme neuf à Guéliz, à pied", en: "A new development in Guéliz, on foot" }, category: "programmes", duration: 40 },
  { id: "ad-39", title: { fr: "Un riad en location saisonnière", en: "A riad for short lets" }, category: "visites", duration: 63 },
  { id: "ad-40", title: { fr: "Une villa de vacances, pièce par pièce", en: "A holiday villa, room by room" }, category: "visites", duration: 23 },
  { id: "ad-41", title: { fr: "Une villa, de la piscine à la terrasse", en: "A villa, from the pool to the terrace" }, category: "visites", duration: 62 },
  { id: "ad-42", title: { fr: "Une villa, du salon à la façade", en: "A villa, from the lounge to the façade" }, category: "visites", duration: 95 },
  { id: "ad-43", title: { fr: "Une villa visitée en deux minutes", en: "A villa toured in two minutes" }, category: "visites", duration: 112 },
  { id: "ad-44", title: { fr: "L'avancement du chantier", en: "Construction update" }, category: "programmes", duration: 27, client: "citystar" },
  { id: "ad-45", title: { fr: "Le film en images générées", en: "The AI-generated film" }, category: "films", duration: 39, aspect: "16/9", client: "citystar" },
  { id: "ad-46", title: { fr: "Le film en texte", en: "The text film" }, category: "films", duration: 42, client: "citystar" },
  { id: "ad-47", title: { fr: "Les rendus 3D en relief", en: "The 3D renders in relief" }, category: "films", duration: 36, aspect: "16/9", client: "citystar" },
  { id: "ad-48", title: { fr: "Une agente immobilière, en italien", en: "An estate agent, in Italian" }, category: "agences", duration: 21, lang: "IT" },
  { id: "ad-49", title: { fr: "Un agent immobilier, en néerlandais", en: "An estate agent, in Dutch" }, category: "agences", duration: 29, lang: "NL" },
  { id: "ad-50", title: { fr: "« Si je devais investir à Marrakech »", en: "“If I had to invest in Marrakech”" }, category: "films", duration: 26, client: "citystar" },
  { id: "ad-51", title: { fr: "« Pas fait pour tout le monde »", en: "“Not for everyone”" }, category: "films", duration: 27, client: "citystar" },
  { id: "ad-52", title: { fr: "« Venez vérifier »", en: "“Come and check”" }, category: "films", duration: 29, client: "citystar" },
  { id: "ad-53", title: { fr: "La visite en 3D", en: "The 3D tour" }, category: "films", duration: 28, client: "citystar" },
  { id: "ad-54", title: { fr: "Une journée sur place", en: "A day on site" }, category: "films", duration: 27, client: "citystar" },
];

const byId = new Map([...ADS, ...MORE].map((ad) => [ad.id, ad]));

/**
 * The whole portfolio, in the order of the "All" view: categories alternate,
 * and the first eight (the home page) show the range of the work.
 */
export const FILMS: Ad[] = [
  "ad-53", "ad-01", "ad-24", "ad-05", "ad-50", "ad-10", "ad-34", "ad-18",
  "ad-45", "ad-22", "ad-16", "ad-39", "ad-02", "ad-29", "ad-54", "ad-11",
  "ad-43", "ad-38", "ad-08", "ad-30", "ad-47", "ad-03", "ad-40", "ad-17",
  "ad-36", "ad-51", "ad-07", "ad-41", "ad-12", "ad-48", "ad-46", "ad-13",
  "ad-04", "ad-23", "ad-33", "ad-15", "ad-42", "ad-21", "ad-35",
  "ad-52", "ad-37", "ad-14", "ad-09", "ad-31", "ad-20", "ad-25", "ad-28",
  "ad-44", "ad-06", "ad-32", "ad-19", "ad-26", "ad-27", "ad-49",
].map((id) => {
  const ad = byId.get(id);
  if (!ad) throw new Error(`Unknown film ${id}`);
  return ad;
});

/** Films of one client, in portfolio order. */
export const filmsOf = (client: ClientId) => FILMS.filter((ad) => ad.client === client);

/**
 * Real statistics of each ad (views, likes, leads), shown around the hero's
 * iPhone. Only measured figures go here: an ad without an entry shows no
 * counters, so the hero shows none while this is empty.
 */
export const AD_STATS: Partial<Record<string, AdStats>> = {};

/** Bump when media files are re-encoded, so browsers and the CDN fetch the new ones. */
const MEDIA_VERSION = "3";

/**
 * Renditions of each ad (rev-vision-forge-media/encode-v3.sh, stills-v3.py):
 * (and encode-v4.sh for the rest of FILMS, which have no teaser):
 * - teaser: first 10 s in 576p, with sound — the muted hero reel (ADS only)
 * - sd: the whole ad in 576p — the reel with sound on, the lightbox on phones
 * - full: the whole ad in 720p — the lightbox on larger screens
 * - preview: 6 s muted loop in 360p — tiles and side columns
 * - stills: WebP in 288/360/432/576 px wide, for <img srcSet>
 */
const STILL_WIDTHS = [288, 360, 432, 576] as const;

/** Width of the phone screen in the hero, for the stills' `sizes`. */
export const REEL_SIZES = "(min-width: 1024px) 318px, (min-width: 482px) 270px, 56vw";

export function adMedia(id: string, aspect?: Ad["aspect"]) {
  const v = `?v=${MEDIA_VERSION}`;
  const still = (w: number) => `${MEDIA_BASE}/still/${id}-${w}.webp${v}`;
  return {
    teaser: `${MEDIA_BASE}/teaser/${id}.mp4${v}`,
    sd: `${MEDIA_BASE}/sd/${id}.mp4${v}`,
    full: `${MEDIA_BASE}/full/${id}.mp4${v}`,
    preview: `${MEDIA_BASE}/preview/${id}.mp4${v}`,
    /** For <video poster>: the largest still, or a 16:9 frame for landscape films. */
    poster: aspect === "16/9" ? `${MEDIA_BASE}/poster/${id}-1280.webp${v}` : still(576),
    stillSrc: still(360),
    stillSrcSet: STILL_WIDTHS.map((w) => `${still(w)} ${w}w`).join(", "),
  };
}

export const formatCount = (n: number, locale: Locale = "fr") =>
  n.toLocaleString(locale === "fr" ? "fr-FR" : "en-GB");

export const formatDuration = (s: number) =>
  `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}`;
