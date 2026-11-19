/**
 * REV portfolio — the films produced for real-estate clients.
 * ADS are the 12 vertical ads of the home page's phone (they have a teaser);
 * FILMS is the whole portfolio: those 12, plus agency, short-let and 3D films.
 * Ads are identified by a neutral id. A client is named (CLIENTS, see
 * clients.ts) only for the developers the owner listed on 2026-11-17, from the
 * file name or the logo at the end of the film.
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
  { id: "ad-24", title: { fr: "L'immobilier neuf à Marrakech, face caméra", en: "New-build property in Marrakech, to camera" }, category: "agences", duration: 20, client: "shams" },
  { id: "ad-50", title: { fr: "« Si je devais investir à Marrakech »", en: "“If I had to invest in Marrakech”" }, category: "films", duration: 26, client: "citystar" },
  { id: "ad-04", title: { fr: "Room tour d'un appartement", en: "Apartment room tour" }, category: "visites", duration: 46 },
  { id: "ad-38", title: { fr: "Un programme neuf à Guéliz, à pied", en: "A new development in Guéliz, on foot" }, category: "programmes", duration: 40, client: "allinkech" },
  { id: "ad-06", title: { fr: "Des visuels qui subliment vos biens", en: "Visuals that elevate your properties" }, category: "agences", duration: 39 },
  { id: "ad-10", title: { fr: "Room tour d'une villa", en: "Villa room tour" }, category: "visites", duration: 118 },
  { id: "ad-30", title: { fr: "Face caméra, avec des titres animés", en: "To camera, with animated titles" }, category: "agences", duration: 22, client: "shams" },
  { id: "ad-16", title: { fr: "Une villa présentée au marché néerlandais", en: "A villa presented to Dutch buyers" }, category: "programmes", duration: 33, lang: "NL", client: "peninsula" },
  { id: "ad-14", title: { fr: "Room tour d'un appartement meublé", en: "Furnished apartment room tour" }, category: "visites", duration: 66 },
  { id: "ad-12", title: { fr: "Acheter sur plan, version néerlandaise", en: "Buying off-plan, Dutch version" }, category: "programmes", duration: 41, lang: "NL" },
  { id: "ad-19", title: { fr: "Un intermédiaire de confiance, en néerlandais", en: "A trusted intermediary, in Dutch" }, category: "agences", duration: 30, lang: "NL" },
];

/**
 * The rest of the portfolio (rev-vision-forge-media/encode-v4.sh): no teaser.
 * Left out: ad-45, ad-46, ad-47, ad-51, ad-53, ad-54 (CITYSTAR, they show the
 * old site plan or aerials made from it), the BM Immobilier films (owner's
 * request, 2026-11-17), and every film of two former clients (owner's request,
 * 2026-11-19).
 */
const MORE: Ad[] = [
  { id: "ad-22", title: { fr: "Un triplex à Marrakech, présenté face caméra", en: "A triplex in Marrakech, presented to camera" }, category: "agences", duration: 23, client: "allinkech" },
  { id: "ad-25", title: { fr: "Un appartement rénové, visité face caméra", en: "A renovated flat, toured to camera" }, category: "visites", duration: 18, client: "allinkech" },
  { id: "ad-26", title: { fr: "Le budget de l'acheteur", en: "The buyer's budget" }, category: "agences", duration: 16, client: "shams" },
  { id: "ad-28", title: { fr: "Une publicité en darija", en: "An ad in Darija" }, category: "agences", duration: 17, client: "shams" },
  { id: "ad-29", title: { fr: "Une présentatrice, deux rôles", en: "One presenter, two parts" }, category: "agences", duration: 22, client: "shams" },
  { id: "ad-31", title: { fr: "Le film d'équipe d'une agence", en: "An agency's team film" }, category: "films", duration: 39, aspect: "16/9" },
  { id: "ad-32", title: { fr: "Deux présentateurs visitent un bien", en: "Two presenters tour a property" }, category: "visites", duration: 141 },
  { id: "ad-33", title: { fr: "L'objection de l'acheteur", en: "The buyer's objection" }, category: "agences", duration: 23, client: "shams" },
  { id: "ad-34", title: { fr: "Un programme dans la Palmeraie", en: "A development in the Palmeraie" }, category: "programmes", duration: 20, client: "shams" },
  { id: "ad-35", title: { fr: "Pas comme les autres agences", en: "Not like the other agencies" }, category: "agences", duration: 21, client: "shams" },
  { id: "ad-39", title: { fr: "Un riad en location saisonnière", en: "A riad for short lets" }, category: "visites", duration: 63 },
  { id: "ad-40", title: { fr: "Une villa de vacances, pièce par pièce", en: "A holiday villa, room by room" }, category: "visites", duration: 23 },
  { id: "ad-41", title: { fr: "Une villa, de la piscine à la terrasse", en: "A villa, from the pool to the terrace" }, category: "visites", duration: 62 },
  { id: "ad-42", title: { fr: "Une villa, du salon à la façade", en: "A villa, from the lounge to the façade" }, category: "visites", duration: 95 },
  { id: "ad-43", title: { fr: "Une villa visitée en deux minutes", en: "A villa toured in two minutes" }, category: "visites", duration: 112 },
  { id: "ad-44", title: { fr: "L'avancement du chantier", en: "Construction update" }, category: "programmes", duration: 27, client: "citystar" },
  { id: "ad-48", title: { fr: "Une agente immobilière, en italien", en: "An estate agent, in Italian" }, category: "agences", duration: 21, lang: "IT" },
  { id: "ad-49", title: { fr: "Un agent immobilier, en néerlandais", en: "An estate agent, in Dutch" }, category: "agences", duration: 29, lang: "NL" },
  { id: "ad-52", title: { fr: "« Venez vérifier »", en: "“Come and check”" }, category: "films", duration: 29, client: "citystar" },
  { id: "ad-58", title: { fr: "Le projet SERA, en motion design", en: "The SERA project, in motion design" }, category: "programmes", duration: 40, client: "allinkech" },
];

const byId = new Map([...ADS, ...MORE].map((ad) => [ad.id, ad]));

/**
 * The whole portfolio, in the order of the "All" view: categories alternate,
 * and the first eight (the home page) show the range of the work.
 */
export const FILMS: Ad[] = [
  "ad-01", "ad-24", "ad-50", "ad-10", "ad-34",
  "ad-22", "ad-16", "ad-39", "ad-29",
  "ad-43", "ad-58", "ad-48", "ad-30", "ad-40",
  "ad-41", "ad-12", "ad-38",
  "ad-04", "ad-33", "ad-42", "ad-35",
  "ad-52", "ad-14", "ad-31", "ad-25", "ad-28",
  "ad-44", "ad-06", "ad-32", "ad-19", "ad-26", "ad-49",
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
 * - teaser: first 10 s in 576p, with sound — the muted hero reel (ADS only;
 *   ad-24, ad-30, ad-38 and ad-50 were added on 2026-11-19 with encode-v3's settings)
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
