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
 * Real statistics of each ad (views, likes, leads), shown around the hero's
 * iPhone. Only measured figures go here: an ad without an entry shows no
 * counters, so the hero shows none while this is empty.
 */
export const AD_STATS: Partial<Record<string, AdStats>> = {};

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
