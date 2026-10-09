import { Bath, BedDouble, GitCompareArrows, Maximize2, Trees } from "lucide-react";

import { mediaImage, type MediaItem } from "@/lib/app/media";
import { useCopy } from "@/lib/i18n";
import { NUMBER_LOCALE, usePublicText, type Locale } from "@/lib/public/i18n";
import type { PublicLot } from "@/lib/public/programme";
import { cn } from "@/lib/utils";
import { StatusChip } from "./LotDetails";
import { priceLabel } from "./status";

const AREA: Record<Locale, Intl.NumberFormat> = {
  fr: new Intl.NumberFormat(NUMBER_LOCALE.fr, { maximumFractionDigits: 0 }),
  en: new Intl.NumberFormat(NUMBER_LOCALE.en, { maximumFractionDigits: 0 }),
};

const COPY = {
  fr: {
    bedrooms: (n: number) => `${n} ch.`,
    bathrooms: (n: number) => `${n} sdb`,
    plot: (area: string) => `Terrain ${area} m²`,
    compare: "Comparer",
    toggle: (compared: boolean, numero: string) =>
      `${compared ? "Retirer du" : "Ajouter au"} comparateur : lot ${numero}`,
  },
  en: {
    bedrooms: (n: number) => `${n} bed`,
    bathrooms: (n: number) => `${n} bath`,
    plot: (area: string) => `Plot ${area} m²`,
    compare: "Compare",
    toggle: (compared: boolean, numero: string) =>
      `${compared ? "Remove from" : "Add to"} comparison: lot ${numero}`,
  },
};

/** Grid of the lots: under the plan on the programme page, or instead of it when there is none. */
export function LotCards({
  lots,
  currency,
  highlight,
  onOpen,
  compare,
  photoOf,
}: {
  lots: PublicLot[];
  currency: string;
  highlight: ReadonlySet<string>;
  onOpen: (lot: PublicLot) => void;
  /** "Comparer" button on each card (programme page only). */
  compare?: { ids: string[]; onToggle: (lot: PublicLot) => void };
  /** Photo of a lot (its own, else one of its type). */
  photoOf?: (lot: PublicLot) => MediaItem | null;
}) {
  const copy = useCopy(COPY);
  const text = usePublicText();
  const area = AREA[text.locale];
  const withPhotos = Boolean(photoOf && lots.some((l) => photoOf(l)));
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {lots.map((lot) => {
        const compared = compare?.ids.includes(lot.id) ?? false;
        const photo = withPhotos ? photoOf?.(lot) : null;
        const image = photo ? mediaImage(photo) : null;
        const sold = lot.statut === "vendue";
        return (
          <li key={lot.id} className="relative">
            <button
              type="button"
              onClick={() => onOpen(lot)}
              className={cn(
                "group flex h-full w-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] text-left transition-colors duration-700 hover:border-white/25 hover:bg-white/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70",
                withPhotos ? "flex-row sm:flex-col" : "flex-col",
                highlight.has(lot.id) && "border-white/60 bg-white/[0.09] duration-150",
              )}
            >
              {withPhotos ? (
                <span className="relative w-28 shrink-0 bg-white/5 sm:aspect-[2/1] sm:w-full">
                  {image ? (
                    <img
                      src={image.thumb}
                      alt=""
                      loading="lazy"
                      className={cn(
                        "absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03] motion-reduce:transition-none",
                        sold && "opacity-50 grayscale",
                      )}
                    />
                  ) : null}
                  <StatusChip
                    status={lot.statut}
                    className="absolute left-3 top-3 hidden bg-black/60 backdrop-blur sm:inline-flex"
                  />
                </span>
              ) : null}
              <span
                className={cn(
                  "flex min-w-0 flex-1 flex-col p-4 sm:p-5",
                  compare && "pb-14 sm:pb-16",
                )}
              >
                <span className="flex items-start justify-between gap-3">
                  <span className="min-w-0 font-brand text-lg font-medium tracking-tight">
                    Lot {lot.numero}
                    {lot.type ? <span className="text-white/55"> · {lot.type}</span> : null}
                  </span>
                  <StatusChip
                    status={lot.statut}
                    className={cn("shrink-0", withPhotos && "sm:hidden")}
                  />
                </span>
                <span className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-white/60">
                  {lot.niveau !== null ? <span>{text.level(lot.niveau)}</span> : null}
                  {lot.surface_habitable !== null ? (
                    <span className="inline-flex items-center gap-1.5">
                      <Maximize2 className="size-3.5" aria-hidden />
                      {area.format(lot.surface_habitable)} m²
                    </span>
                  ) : null}
                  {lot.chambres !== null ? (
                    <span className="inline-flex items-center gap-1.5">
                      <BedDouble className="size-3.5" aria-hidden />
                      {copy.bedrooms(lot.chambres)}
                    </span>
                  ) : null}
                  {lot.salles_de_bain !== null ? (
                    <span className="inline-flex items-center gap-1.5">
                      <Bath className="size-3.5" aria-hidden />
                      {copy.bathrooms(lot.salles_de_bain)}
                    </span>
                  ) : null}
                  {lot.surface_terrain !== null ? (
                    <span className="inline-flex items-center gap-1.5">
                      <Trees className="size-3.5" aria-hidden />
                      {copy.plot(area.format(lot.surface_terrain))}
                    </span>
                  ) : null}
                </span>
                <span
                  className={cn(
                    "mt-auto pt-4 text-base font-medium",
                    sold ? "text-white/45" : "text-white",
                  )}
                >
                  {priceLabel(lot, currency, text.locale)}
                </span>
              </span>
            </button>
            {compare ? (
              <button
                type="button"
                onClick={() => compare.onToggle(lot)}
                aria-pressed={compared}
                aria-label={copy.toggle(compared, lot.numero)}
                className={cn(
                  "absolute bottom-3.5 right-3.5 inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 sm:bottom-4 sm:right-4",
                  compared
                    ? "border-[color:var(--brand)] bg-[color:var(--brand)]/15 text-[color:var(--brand)]"
                    : "border-white/15 bg-[#0b0b0b]/60 text-white/60 hover:border-white/35 hover:text-white",
                )}
              >
                <GitCompareArrows className="size-3.5" aria-hidden />
                {copy.compare}
              </button>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
