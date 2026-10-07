/**
 * REV ad portfolio — vertical (9:16) videos produced for real-estate clients.
 * No client is named on the site: ads are identified by a neutral id only.
 * Media files live outside git and are deployed with the static site under
 * /media; builds without VITE_MEDIA_BASE (e.g. Lovable) read them from the
 * production domain.
 */

const MEDIA_BASE =
  import.meta.env.VITE_MEDIA_BASE ??
  "https://realestatevision360.com/media";

import type { Locale } from "./i18n";

export const AD_CATEGORIES = ["programmes", "roomtours", "branding", "lifestyle"] as const;

export type AdCategory = (typeof AD_CATEGORIES)[number];

export const AD_CATEGORY_LABELS: Record<Locale, Record<AdCategory, string>> = {
  fr: {
    programmes: "Programmes neufs",
    roomtours: "Room tours",
    branding: "Personal branding",
    lifestyle: "Contenu & lifestyle",
  },
  en: {
    programmes: "New developments",
    roomtours: "Room tours",
    branding: "Personal branding",
    lifestyle: "Content & lifestyle",
  },
};

export type AdStats = { views: number; likes: number; leads: number };

export type Ad = {
  id: string;
  title: Record<Locale, string>;
  category: AdCategory;
  /** Duration in seconds. */
  duration: number;
  lang?: "NL";
};

export const ADS: Ad[] = [
  { id: "ad-01", title: { fr: "Villa à partir de 3 490 000 MAD", en: "Villa from MAD 3,490,000" }, category: "programmes", duration: 31 },
  { id: "ad-02", title: { fr: "Emplacement prisé, piscine et meilleures unités", en: "Prime location, pool and the best units" }, category: "programmes", duration: 26 },
  { id: "ad-03", title: { fr: "Y vivre ou investir, à 3 min de Guéliz", en: "Live or invest, 3 minutes from Guéliz" }, category: "programmes", duration: 23 },
  { id: "ad-04", title: { fr: "Room tour d'un appartement", en: "Apartment room tour" }, category: "roomtours", duration: 46 },
  { id: "ad-05", title: { fr: "Le calme, et les meilleurs lots", en: "Calm surroundings, the best plots" }, category: "programmes", duration: 26 },
  { id: "ad-06", title: { fr: "Des visuels qui subliment vos biens", en: "Visuals that elevate your properties" }, category: "branding", duration: 39 },
  { id: "ad-07", title: { fr: "Une offre avant la montée des prix", en: "An offer before prices go up" }, category: "programmes", duration: 30 },
  { id: "ad-08", title: { fr: "Vivre et investir dans le même projet", en: "Live and invest in the same project" }, category: "programmes", duration: 29 },
  { id: "ad-09", title: { fr: "Personal branding d'agent immobilier", en: "Real estate agent personal branding" }, category: "branding", duration: 21 },
  { id: "ad-10", title: { fr: "Room tour d'une villa", en: "Villa room tour" }, category: "roomtours", duration: 118 },
  { id: "ad-11", title: { fr: "Pour le prix d'un 30 m² à Paris", en: "For the price of 30 m² in Paris" }, category: "programmes", duration: 21 },
  { id: "ad-12", title: { fr: "Acheter sur plan, version néerlandaise", en: "Buying off-plan, Dutch version" }, category: "programmes", duration: 41, lang: "NL" },
  { id: "ad-13", title: { fr: "À 5 minutes de l'aéroport", en: "5 minutes from the airport" }, category: "programmes", duration: 27 },
  { id: "ad-14", title: { fr: "Room tour d'un appartement meublé", en: "Furnished apartment room tour" }, category: "roomtours", duration: 66 },
  { id: "ad-15", title: { fr: "Comprendre le plan de paiement", en: "Understanding the payment plan" }, category: "lifestyle", duration: 81 },
  { id: "ad-16", title: { fr: "Une villa présentée au marché néerlandais", en: "A villa presented to Dutch buyers" }, category: "programmes", duration: 33, lang: "NL" },
  { id: "ad-17", title: { fr: "Un investissement clé en main", en: "A turnkey investment" }, category: "programmes", duration: 27 },
  { id: "ad-18", title: { fr: "Choisir un promoteur fiable", en: "Choosing a reliable developer" }, category: "programmes", duration: 24 },
  { id: "ad-19", title: { fr: "Un intermédiaire de confiance, en néerlandais", en: "A trusted intermediary, in Dutch" }, category: "branding", duration: 30, lang: "NL" },
  { id: "ad-20", title: { fr: "Rêver sa vie, ou vivre son rêve", en: "Dream your life, or live your dream" }, category: "lifestyle", duration: 36 },
  { id: "ad-21", title: { fr: "Investir au soleil", en: "Invest in the sun" }, category: "programmes", duration: 13 },
];

/**
 * PROVISOIRE — chiffres de démonstration affichés autour de l'iPhone du hero.
 * À remplacer par les vraies statistiques (vues, likes, leads) de chaque ad
 * avant de promouvoir le site.
 */
export const AD_STATS: Record<string, AdStats> = {
  "ad-01": { views: 182400, likes: 6700, leads: 74 },
  "ad-02": { views: 96300, likes: 3100, leads: 41 },
  "ad-03": { views: 118500, likes: 4200, leads: 52 },
  "ad-04": { views: 54800, likes: 1900, leads: 23 },
  "ad-05": { views: 87200, likes: 2800, leads: 36 },
  "ad-06": { views: 63400, likes: 2500, leads: 29 },
  "ad-07": { views: 102900, likes: 3600, leads: 47 },
  "ad-08": { views: 74100, likes: 2400, leads: 33 },
  "ad-09": { views: 128700, likes: 5400, leads: 58 },
  "ad-10": { views: 49600, likes: 1700, leads: 19 },
  "ad-11": { views: 141300, likes: 5100, leads: 61 },
  "ad-12": { views: 68800, likes: 2200, leads: 31 },
  "ad-13": { views: 92500, likes: 3000, leads: 39 },
  "ad-14": { views: 45200, likes: 1500, leads: 17 },
  "ad-15": { views: 71200, likes: 2300, leads: 37 },
  "ad-16": { views: 59700, likes: 1900, leads: 26 },
  "ad-17": { views: 83600, likes: 2700, leads: 35 },
  "ad-18": { views: 66100, likes: 2100, leads: 28 },
  "ad-19": { views: 52300, likes: 1800, leads: 22 },
  "ad-20": { views: 97800, likes: 4600, leads: 34 },
  "ad-21": { views: 38900, likes: 1300, leads: 15 },
};

/** Bump when media files are re-encoded, so browsers and the CDN fetch the new ones. */
const MEDIA_VERSION = "3";

/**
 * Renditions of each ad (rev-vision-forge-media/encode-v3.sh, stills-v3.py):
 * - teaser: first 10 s in 576p, with sound — the muted hero reel
 * - sd: the whole ad in 576p — the reel with sound on, the lightbox on phones
 * - full: the whole ad in 720p — the lightbox on larger screens
 * - preview: 6 s muted loop in 360p — tiles and side columns
 * - stills: WebP in 288/360/432/576 px wide, for <img srcSet>
 */
const STILL_WIDTHS = [288, 360, 432, 576] as const;

/** Width of the phone screen in the hero, for the stills' `sizes`. */
export const REEL_SIZES = "(min-width: 1024px) 318px, (min-width: 482px) 270px, 56vw";

export function adMedia(id: string) {
  const v = `?v=${MEDIA_VERSION}`;
  const still = (w: number) => `${MEDIA_BASE}/still/${id}-${w}.webp${v}`;
  return {
    teaser: `${MEDIA_BASE}/teaser/${id}.mp4${v}`,
    sd: `${MEDIA_BASE}/sd/${id}.mp4${v}`,
    full: `${MEDIA_BASE}/full/${id}.mp4${v}`,
    preview: `${MEDIA_BASE}/preview/${id}.mp4${v}`,
    /** Largest still, for <video poster>. */
    poster: still(576),
    stillSrc: still(360),
    stillSrcSet: STILL_WIDTHS.map((w) => `${still(w)} ${w}w`).join(", "),
  };
}

export const formatCount = (n: number, locale: Locale = "fr") =>
  n.toLocaleString(locale === "fr" ? "fr-FR" : "en-GB");

export const formatDuration = (s: number) =>
  `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}`;
