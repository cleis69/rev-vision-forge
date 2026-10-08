import type { PublicLot } from "./programme";

/* Comparison of up to three lots, side by side. */

export const MAX_COMPARE = 3;

/** Price per m² of living area, when both are known and the lot is not sold. */
export function pricePerSqm(lot: PublicLot): number | null {
  if (lot.statut === "vendue" || lot.prix === null || !lot.surface_habitable) return null;
  return Math.round(lot.prix / lot.surface_habitable);
}

/** Every feature of the compared lots, in order of appearance, with the lots that have it. */
export function featureRows(lots: PublicLot[]): { feature: string; has: boolean[] }[] {
  const seen = new Map<string, string>();
  for (const lot of lots) {
    for (const f of lot.features) {
      const key = f.trim().toLowerCase();
      if (!seen.has(key)) seen.set(key, f.trim());
    }
  }
  return [...seen].map(([key, feature]) => ({
    feature,
    has: lots.map((l) => l.features.some((f) => f.trim().toLowerCase() === key)),
  }));
}

/** Lot with the lowest price per m², when at least two lots have one. */
export function bestPricePerSqm(lots: PublicLot[]): string | null {
  const priced = lots
    .map((l) => ({ id: l.id, value: pricePerSqm(l) }))
    .filter((x) => x.value !== null);
  if (priced.length < 2) return null;
  const min = Math.min(...priced.map((x) => x.value as number));
  const best = priced.filter((x) => x.value === min);
  return best.length === 1 ? (best[0]?.id ?? null) : null;
}

/** Adds or removes a lot; returns null when the comparison is already full. */
export function toggleCompared(ids: string[], id: string): string[] | null {
  if (ids.includes(id)) return ids.filter((x) => x !== id);
  if (ids.length >= MAX_COMPARE) return null;
  return [...ids, id];
}
