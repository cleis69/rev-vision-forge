import { BedDouble, GitCompareArrows, Maximize2 } from "lucide-react";

import type { PublicLot } from "@/lib/public/programme";
import { cn } from "@/lib/utils";
import { StatusChip } from "./LotDetails";
import { priceLabel } from "./PublicPlan";

const area = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });

/** Grid of the lots: under the plan on the programme page, or instead of it when there is none. */
export function LotCards({
  lots,
  currency,
  highlight,
  onOpen,
  compare,
}: {
  lots: PublicLot[];
  currency: string;
  highlight: ReadonlySet<string>;
  onOpen: (lot: PublicLot) => void;
  /** "Comparer" button on each card (programme page only). */
  compare?: { ids: string[]; onToggle: (lot: PublicLot) => void };
}) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {lots.map((lot) => {
        const compared = compare?.ids.includes(lot.id) ?? false;
        return (
          <li key={lot.id} className="relative">
            <button
              type="button"
              onClick={() => onOpen(lot)}
              className={cn(
                "group flex h-full w-full flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-left transition-colors duration-700 hover:border-white/25 hover:bg-white/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70",
                compare && "pb-16",
                highlight.has(lot.id) && "border-white/60 bg-white/[0.09] duration-150",
              )}
            >
              <span className="flex items-start justify-between gap-3">
                <span className="font-brand text-lg font-medium tracking-tight">
                  Lot {lot.numero}
                  {lot.type ? <span className="text-white/55"> · {lot.type}</span> : null}
                </span>
                <StatusChip status={lot.statut} />
              </span>
              <span className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-white/60">
                {lot.surface_habitable !== null ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Maximize2 className="size-3.5" aria-hidden />
                    {area.format(lot.surface_habitable)} m²
                  </span>
                ) : null}
                {lot.chambres !== null ? (
                  <span className="inline-flex items-center gap-1.5">
                    <BedDouble className="size-3.5" aria-hidden />
                    {lot.chambres} ch.
                  </span>
                ) : null}
                {lot.surface_terrain !== null ? (
                  <span>Terrain {area.format(lot.surface_terrain)} m²</span>
                ) : null}
              </span>
              <span
                className={cn(
                  "mt-auto pt-5 text-base font-medium",
                  lot.statut === "vendue" && "text-white/45",
                )}
              >
                {priceLabel(lot, currency)}
              </span>
            </button>
            {compare ? (
              <button
                type="button"
                onClick={() => compare.onToggle(lot)}
                aria-pressed={compared}
                aria-label={`${compared ? "Retirer du" : "Ajouter au"} comparateur : lot ${lot.numero}`}
                className={cn(
                  "absolute bottom-4 right-4 inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70",
                  compared
                    ? "border-[color:var(--brand)] bg-[color:var(--brand)]/15 text-[color:var(--brand)]"
                    : "border-white/15 text-white/60 hover:border-white/35 hover:text-white",
                )}
              >
                <GitCompareArrows className="size-3.5" aria-hidden />
                Comparer
              </button>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
