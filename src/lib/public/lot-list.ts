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

/** The visitor's search: a budget, a size, bedrooms (null: any). */
export type LotSearch = {
  maxPrice: number | null;
  minSurface: number | null;
  minBedrooms: number | null;
};
export const NO_SEARCH: LotSearch = { maxPrice: null, minSurface: null, minBedrooms: null };
export const isSearching = (s: LotSearch) =>
  s.maxPrice !== null || s.minSurface !== null || s.minBedrooms !== null;

export type LotFilters = {
  status: LotStatus | null;
  type: string | null;
  level?: number | null;
  search?: LotSearch;
};

/** A lot within the search; one whose value is unknown (price on request…) is left out. */
const withinSearch = (l: PublicLot, s: LotSearch | undefined) =>
  !s ||
  ((s.maxPrice === null || (l.prix !== null && l.prix <= s.maxPrice)) &&
    (s.minSurface === null ||
      (l.surface_habitable !== null && l.surface_habitable >= s.minSurface)) &&
    (s.minBedrooms === null || (l.chambres !== null && l.chambres >= s.minBedrooms)));

/** Lots passing the visitor's filters (null: any). */
export const filterLots = (lots: readonly PublicLot[], f: LotFilters): PublicLot[] =>
  lots.filter(
    (l) =>
      (!f.status || l.statut === f.status) &&
      (f.type === null || sameType(l.type, f.type)) &&
      (f.level === undefined || f.level === null || l.niveau === f.level) &&
      withinSearch(l, f.search),
  );

/** Ends of the search: the prices, sizes and bedrooms the lots have (null: nothing to search). */
export function searchRange(lots: readonly PublicLot[]) {
  const span = (values: (number | null)[]) => {
    const known = values.filter((v): v is number => v !== null);
    if (known.length < 2) return null;
    const min = Math.min(...known);
    const max = Math.max(...known);
    return min < max ? { min, max } : null;
  };
  const free = lots.filter((l) => l.statut !== "vendue");
  return {
    price: span(free.map((l) => l.prix)),
    surface: span(free.map((l) => l.surface_habitable)),
    bedrooms: [...new Set(free.flatMap((l) => (l.chambres === null ? [] : [l.chambres])))].sort(
      (a, b) => a - b,
    ),
  };
}

/** Lots listed beside a view: those it shows, or all of them when it shows none. */
export const lotsOfView = (
  lots: readonly PublicLot[],
  view: { lots: ReadonlySet<string> } | null,
): PublicLot[] =>
  !view || view.lots.size === 0 ? [...lots] : lots.filter((l) => view.lots.has(l.id));

/** Lots of the type and search chosen, for the 3D view to dim the others (null: none chosen). */
export const focusOf = (
  lots: readonly PublicLot[],
  type: string | null,
  search: LotSearch = NO_SEARCH,
) =>
  type === null && !isSearching(search)
    ? null
    : new Set(filterLots(lots, { status: null, type, search }).map((l) => l.id));

/** Lots named by a comparison link (?comparer=A1,B2), in its order (unknown numbers left out). */
export const comparedFromLink = (value: string, lots: readonly PublicLot[], max: number) =>
  [...new Set(value.split(",").map((n) => n.trim()))]
    .flatMap((n) => lots.filter((l) => l.numero === n))
    .slice(0, max);

/** Whether the lots differ enough for a search (budget, size or bedrooms). */
export const canSearch = (range: ReturnType<typeof searchRange>) =>
  Boolean(range.price || range.surface || range.bedrooms.length > 1);
