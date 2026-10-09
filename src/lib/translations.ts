import { parseAmenities } from "./amenities";
import { parseLotTypes } from "./lot-types";
import { parsePlaces } from "./location";

/* English version of the promoter's texts (projects.translations, see the
   migration plan_de_vente_translations): { en: { "<français>": "<English>" } }.
   The interface of the public pages is translated in the code; these are the
   texts written by the promoter. A text without a translation stays in French. */

export type TranslationMap = Readonly<Record<string, string>>;

export const MAX_TRANSLATION = 5000;

/** The English texts of a programme, keyed by their French text. */
export function parseTranslations(value: unknown): TranslationMap {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const en = (value as Record<string, unknown>)["en"];
  if (!en || typeof en !== "object" || Array.isArray(en)) return {};
  const map: Record<string, string> = {};
  for (const [source, target] of Object.entries(en)) {
    if (typeof target === "string" && target.trim()) map[source] = target;
  }
  return map;
}

/** The English version of a text when there is one, else the text itself. */
export function translate<T extends string | null | undefined>(map: TranslationMap, text: T): T {
  if (!text) return text;
  return (map[text.trim()] ?? map[text] ?? text) as T;
}

/** The translations with the English version of one French text set (an empty one removes it). */
export function withTranslation(
  map: TranslationMap,
  source: string,
  target: string,
): { en: Record<string, string> } {
  const key = source.trim();
  const { [key]: _old, ...rest } = map;
  const text = target.trim().slice(0, MAX_TRANSLATION);
  return { en: text ? { ...rest, [key]: text } : rest };
}

export type TextGroup =
  | "presentation"
  | "prestations"
  | "typologies"
  | "situation"
  | "vues"
  | "visite"
  | "lots"
  | "medias";

export const GROUP_LABELS: Record<TextGroup, string> = {
  presentation: "Présentation",
  prestations: "Prestations",
  typologies: "Typologies",
  situation: "Situation",
  vues: "Vues",
  visite: "Visite 360°",
  lots: "Lots",
  medias: "Légendes des médias",
};

export type SourceText = { text: string; group: TextGroup };

/**
 * Every French text of the promoter shown on the public page, once each, in
 * the order of the page. Names of programmes and types (Villa A…) are names:
 * they are not translated.
 */
export function sourceTexts({
  project,
  lots,
  media,
  views,
  rooms,
}: {
  project: {
    description: string | null;
    city: string | null;
    amenities: unknown;
    lot_types: unknown;
    places: unknown;
  };
  lots: readonly { description: string | null; features?: unknown }[];
  media: readonly { kind: string; meta: { caption?: string | undefined } }[];
  views: readonly { name: string }[];
  rooms: readonly { name: string }[];
}): SourceText[] {
  const seen = new Set<string>();
  const list: SourceText[] = [];
  const add = (group: TextGroup, text: string | null | undefined) => {
    const t = text?.trim();
    if (!t || seen.has(t)) return;
    seen.add(t);
    list.push({ text: t, group });
  };
  add("presentation", project.description);
  add("presentation", project.city);
  for (const a of parseAmenities(project.amenities)) add("prestations", a.label);
  for (const t of parseLotTypes(project.lot_types)) add("typologies", t.description);
  for (const p of parsePlaces(project.places)) add("situation", p.name);
  for (const v of views) add("vues", v.name);
  for (const r of rooms) add("visite", r.name);
  for (const l of lots) {
    add("lots", l.description);
    if (Array.isArray(l.features))
      for (const f of l.features) if (typeof f === "string") add("lots", f);
  }
  for (const m of media)
    if (m.kind !== "orbit_frame" && m.kind !== "orbit_mask") add("medias", m.meta.caption);
  return list;
}
