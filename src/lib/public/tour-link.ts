import { sameType } from "@/lib/lot-types";
import { tourOfLot, type PublicData, type PublicTour } from "./programme";

/* Which 360° tour the page of the tour alone shows (/embed/visite/$slug):
   ?type=Villa A or ?lot=A1, else the first tour of the programme. */

export type TourSearch = { type?: string; lot?: string };

export const tourSearch = (search: Record<string, unknown>): TourSearch => ({
  ...(typeof search["type"] === "string" && search["type"].trim() ? { type: search["type"] } : {}),
  ...(typeof search["lot"] === "string" && search["lot"].trim() ? { lot: search["lot"] } : {}),
});

/** The tour named by the address (a lot's, else its type's; or a type's), else the first one. */
export function pickTour(
  data: Pick<PublicData, "lots" | "tours">,
  search: TourSearch,
): PublicTour | null {
  if (search.lot) {
    const lot = data.lots.find((l) => l.numero === search.lot);
    const tour = lot ? tourOfLot(data.tours, lot) : null;
    if (tour) return tour;
  }
  if (search.type) {
    const tour = data.tours.find((t) => t.lotType && sameType(t.lotType, search.type));
    if (tour) return tour;
  }
  return data.tours[0] ?? null;
}
