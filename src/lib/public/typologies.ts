import type { MediaItem } from "@/lib/app/media";
import { lotTypeNames, noteOf, sameType } from "@/lib/lot-types";
import type { PublicData, PublicLot } from "./programme";

/* Typologies section of the public page: one card per type of lot (Villa A,
   Villa B…), with its lots, its figures, and the media given to the type. */

export type Range = { min: number; max: number };

export type Typology = {
  name: string;
  description: string;
  lots: PublicLot[];
  available: number;
  surface: Range | null;
  terrain: Range | null;
  chambres: Range | null;
  sallesDeBain: Range | null;
  /** Lowest price of its available lots (prices shown only). */
  priceFrom: number | null;
  photos: MediaItem[];
  plans: MediaItem[];
  videos: MediaItem[];
  documents: MediaItem[];
};

function range(values: (number | null)[]): Range | null {
  const known = values.filter((v): v is number => v !== null);
  return known.length ? { min: Math.min(...known), max: Math.max(...known) } : null;
}

export function typologies(data: PublicData): Typology[] {
  const { lots, programme } = data;
  const ofType = (items: MediaItem[], name: string) =>
    items.filter((m) => sameType(m.lot_type, name));
  return lotTypeNames(lots, programme.lotTypes).map((name) => {
    const own = lots.filter((l) => sameType(l.type, name));
    const free = own.filter((l) => l.statut === "disponible");
    const prices = free.flatMap((l) => (l.prix === null ? [] : [l.prix]));
    const ids = new Set(own.map((l) => l.id));
    const photos = ofType(data.media, name);
    return {
      name,
      description: noteOf(programme.lotTypes, name),
      lots: own,
      available: free.length,
      surface: range(own.map((l) => l.surface_habitable)),
      terrain: range(own.map((l) => l.surface_terrain)),
      chambres: range(own.map((l) => l.chambres)),
      sallesDeBain: range(own.map((l) => l.salles_de_bain)),
      priceFrom: prices.length ? Math.min(...prices) : null,
      // A type without photos of its own shows those of its lots.
      photos: photos.length ? photos : data.media.filter((m) => m.lot_id && ids.has(m.lot_id)),
      plans: ofType(data.plans, name),
      videos: ofType(data.videos, name),
      documents: ofType(data.documents, name),
    };
  });
}

/** The section is worth showing: several types, or one with something of its own. */
export const showTypologies = (list: Typology[]) =>
  list.length > 1 ||
  list.some((t) => t.description || t.plans.length || t.documents.length || t.videos.length);

/** "585 m²", "248 – 312 m²" */
export function rangeLabel(r: Range, unit = "") {
  const f = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });
  const text = r.min === r.max ? f.format(r.min) : `${f.format(r.min)} – ${f.format(r.max)}`;
  return unit ? `${text} ${unit}` : text;
}

/** Media of a lot for its sheet: its own photos, else those of its type; the plans and brochure of its type. */
export function lotMedia(data: PublicData, lot: Pick<PublicLot, "id" | "type">) {
  const own = data.media.filter((m) => m.lot_id === lot.id);
  const ofType = (items: MediaItem[]) => items.filter((m) => sameType(m.lot_type, lot.type));
  return {
    photos: own.length ? own : ofType(data.media),
    plans: ofType(data.plans),
    documents: [...data.documents.filter((m) => m.lot_id === lot.id), ...ofType(data.documents)],
    videos: [...data.videos.filter((m) => m.lot_id === lot.id), ...ofType(data.videos)],
  };
}
