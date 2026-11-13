import type { Locale } from "./i18n";

/* « Je cherche… » : the sentence a buyer completes on the programme page.
   What the lots are called comes from their types ("Villa A", "Villa B" →
   a villa), so that the sentence reads "Je cherche une villa" rather than
   "un lot" whenever the programme says so itself. */

type Noun = {
  fr: { one: string; many: string; feminine: boolean };
  en: { one: string; many: string };
};

/** First word of the types (lower case, no accent) → how to call a lot. */
const NOUNS: Record<string, Noun> = {
  villa: {
    fr: { one: "villa", many: "villas", feminine: true },
    en: { one: "villa", many: "villas" },
  },
  maison: {
    fr: { one: "maison", many: "maisons", feminine: true },
    en: { one: "house", many: "houses" },
  },
  appartement: {
    fr: { one: "appartement", many: "appartements", feminine: false },
    en: { one: "apartment", many: "apartments" },
  },
  studio: {
    fr: { one: "studio", many: "studios", feminine: false },
    en: { one: "studio", many: "studios" },
  },
  duplex: {
    fr: { one: "duplex", many: "duplex", feminine: false },
    en: { one: "duplex", many: "duplexes" },
  },
  triplex: {
    fr: { one: "triplex", many: "triplex", feminine: false },
    en: { one: "triplex", many: "triplexes" },
  },
  riad: { fr: { one: "riad", many: "riads", feminine: false }, en: { one: "riad", many: "riads" } },
  penthouse: {
    fr: { one: "penthouse", many: "penthouses", feminine: false },
    en: { one: "penthouse", many: "penthouses" },
  },
  loft: { fr: { one: "loft", many: "lofts", feminine: false }, en: { one: "loft", many: "lofts" } },
  suite: {
    fr: { one: "suite", many: "suites", feminine: true },
    en: { one: "suite", many: "suites" },
  },
  bureau: {
    fr: { one: "bureau", many: "bureaux", feminine: false },
    en: { one: "office", many: "offices" },
  },
  local: {
    fr: { one: "local", many: "locaux", feminine: false },
    en: { one: "unit", many: "units" },
  },
  terrain: {
    fr: { one: "terrain", many: "terrains", feminine: false },
    en: { one: "plot", many: "plots" },
  },
  parcelle: {
    fr: { one: "parcelle", many: "parcelles", feminine: true },
    en: { one: "plot", many: "plots" },
  },
  chalet: {
    fr: { one: "chalet", many: "chalets", feminine: false },
    en: { one: "chalet", many: "chalets" },
  },
  bungalow: {
    fr: { one: "bungalow", many: "bungalows", feminine: false },
    en: { one: "bungalow", many: "bungalows" },
  },
};
const LOT: Noun = {
  fr: { one: "lot", many: "lots", feminine: false },
  en: { one: "lot", many: "lots" },
};

const firstWord = (name: string) =>
  (name.trim().split(/\s+/)[0] ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export type LotNoun = {
  /** Key of the noun shared by every type ("villa"), or null: the lots are just lots. */
  key: string | null;
  noun: Noun;
};

/** What to call a lot of this programme, from the names of its types. */
export function lotNoun(typeNames: readonly string[]): LotNoun {
  const words = [...new Set(typeNames.map(firstWord).filter(Boolean))];
  const key = words.length === 1 ? (words[0] as string) : null;
  const noun = key ? NOUNS[key] : undefined;
  return noun ? { key, noun } : { key: null, noun: LOT };
}

/** "une villa" / "a villa", "un appartement" / "an apartment". */
export function aLot({ noun }: LotNoun, locale: Locale): string {
  if (locale === "fr") return `${noun.fr.feminine ? "une" : "un"} ${noun.fr.one}`;
  return `${/^[aeiou]/.test(noun.en.one) ? "an" : "a"} ${noun.en.one}`;
}

/** "14 villas", "1 villa", in the language of the page. */
export function countLots({ noun }: LotNoun, count: number, locale: Locale): string {
  const n = locale === "fr" ? noun.fr : noun.en;
  // French counts 0 and 1 in the singular.
  const one = locale === "fr" ? count < 2 : count === 1;
  return `${count} ${one ? n.one : n.many}`;
}

/** The type as the sentence names it: "Villa A" → "A" when every lot is a villa. */
export function shortType(name: string, { key }: LotNoun): string {
  if (!key) return name.trim();
  const rest = name.trim().split(/\s+/).slice(1).join(" ");
  return rest || name.trim();
}

/** Round steps for a slider between two ends: values a buyer would say. */
export function roundStep(span: number): number {
  const raw = span / 40;
  const power = Math.pow(10, Math.floor(Math.log10(Math.max(1, raw))));
  return Math.max(1, Math.round(raw / power) * power);
}
