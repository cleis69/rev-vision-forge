import type { LotStatus } from "@/lib/app/lot-fields";
import { sameType } from "@/lib/lot-types";
import type { PublicLot } from "./programme";

/* The list of the lots on the programme page: beside the 3D view (the lots of
   the view shown) and in the Lots tab (all of them), with the same filters. */

export type LotSort = "numero" | "prix-asc" | "prix-desc" | "surface";
export const LOT_SORTS: readonly LotSort[] = ["numero", "prix-asc", "prix-desc", "surface"];

/** Lots in that order; those without the value (price on request…) last. */
export function sortLots(lots: readonly PublicLot[], sort: LotSort): PublicLot[] {
  if (sort === "numero") return [...lots];
  const value = (l: PublicLot) => (sort === "surface" ? l.surface_habitable : l.prix);
  const sign = sort === "prix-desc" || sort === "surface" ? -1 : 1;
  return [...lots].sort((a, b) => {
    const va = value(a);
    const vb = value(b);
    if (va === null || vb === null) return Number(va === null) - Number(vb === null);
    return (va - vb) * sign;
  });
}

export type LotFilters = {
  status: LotStatus | null;
  type: string | null;
  level?: number | null;
};

/** Lots passing the visitor's filters (null: any). */
export const filterLots = (lots: readonly PublicLot[], f: LotFilters): PublicLot[] =>
  lots.filter(
    (l) =>
      (!f.status || l.statut === f.status) &&
      (f.type === null || sameType(l.type, f.type)) &&
      (f.level === undefined || f.level === null || l.niveau === f.level),
  );

/** Lots listed beside a view: those it shows, or all of them when it shows none. */
export const lotsOfView = (
  lots: readonly PublicLot[],
  view: { lots: ReadonlySet<string> } | null,
): PublicLot[] =>
  !view || view.lots.size === 0 ? [...lots] : lots.filter((l) => view.lots.has(l.id));

/** Lots of a type, for the 3D view to dim the others (null: no type chosen). */
export const focusOfType = (lots: readonly PublicLot[], type: string | null) =>
  type === null ? null : new Set(lots.filter((l) => sameType(l.type, type)).map((l) => l.id));
