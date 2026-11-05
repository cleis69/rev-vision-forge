import { SlidersHorizontal, X } from "lucide-react";

import { useCopy } from "@/lib/i18n";
import { usePublicText } from "@/lib/public/i18n";
import { isSearching, NO_SEARCH, type LotSearch, type searchRange } from "@/lib/public/lot-list";
import { cn } from "@/lib/utils";

/* "Rechercher": a budget, a size, bedrooms. The lots that fit stay lit on the
   3D view, the others dim; the list keeps only them. */

const COPY = {
  fr: {
    search: "Rechercher",
    budget: "Budget maximum",
    anyBudget: "Sans limite",
    upTo: (v: string) => `Jusqu'à ${v}`,
    surface: "Surface minimum",
    anySurface: "Toutes",
    atLeast: (v: string) => `${v} m² et plus`,
    bedrooms: "Chambres",
    anyBedrooms: "Toutes",
    clear: "Effacer la recherche",
    found: (n: number) => (n === 0 ? "Aucun lot" : `${n} lot${n > 1 ? "s" : ""}`),
  },
  en: {
    search: "Search",
    budget: "Maximum budget",
    anyBudget: "No limit",
    upTo: (v: string) => `Up to ${v}`,
    surface: "Minimum living area",
    anySurface: "Any",
    atLeast: (v: string) => `${v} m² or more`,
    bedrooms: "Bedrooms",
    anyBedrooms: "Any",
    clear: "Clear the search",
    found: (n: number) => (n === 0 ? "No lots" : `${n} lot${n > 1 ? "s" : ""}`),
  },
};

type Range = ReturnType<typeof searchRange>;

/** Steps of the sliders: round values a buyer would say. */
const stepOf = (span: number) => {
  const raw = span / 40;
  const power = Math.pow(10, Math.floor(Math.log10(Math.max(1, raw))));
  return Math.max(1, Math.round(raw / power) * power);
};

export function LotSearchButton({
  open,
  onToggle,
  search,
}: {
  open: boolean;
  onToggle: () => void;
  search: LotSearch;
}) {
  const copy = useCopy(COPY);
  const active = isSearching(search);
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      className={cn(
        "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70",
        active || open
          ? "border-[color:var(--brand)] text-[color:var(--brand)]"
          : "border-white/15 text-white/75 hover:border-white/35 hover:text-white",
      )}
    >
      <SlidersHorizontal className="size-3.5" aria-hidden />
      {copy.search}
      {active ? (
        <span className="size-1.5 rounded-full bg-[color:var(--brand)]" aria-hidden />
      ) : null}
    </button>
  );
}

export function LotSearchFields({
  range,
  search,
  onSearch,
  currency,
  found,
}: {
  range: Range;
  search: LotSearch;
  onSearch: (search: LotSearch) => void;
  currency: string;
  /** Lots matching, shown under the fields. */
  found: number;
}) {
  const copy = useCopy(COPY);
  const text = usePublicText();
  const { price, surface, bedrooms } = range;
  const priceStep = price ? stepOf(price.max - price.min) : 1;
  const surfaceStep = surface ? stepOf(surface.max - surface.min) : 1;
  return (
    <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      {price ? (
        <label className="block">
          <span className="flex items-baseline justify-between gap-3 text-xs text-white/60">
            {copy.budget}
            <span className="text-sm font-medium tabular-nums text-white">
              {search.maxPrice === null
                ? copy.anyBudget
                : copy.upTo(text.price(search.maxPrice, currency))}
            </span>
          </span>
          <input
            type="range"
            min={Math.floor(price.min / priceStep) * priceStep}
            max={Math.ceil(price.max / priceStep) * priceStep}
            step={priceStep}
            value={search.maxPrice ?? Math.ceil(price.max / priceStep) * priceStep}
            onChange={(e) => {
              const value = Number(e.target.value);
              onSearch({ ...search, maxPrice: value >= price.max ? null : value });
            }}
            className="mt-2 w-full accent-[color:var(--brand)]"
          />
        </label>
      ) : null}
      {surface ? (
        <label className="block">
          <span className="flex items-baseline justify-between gap-3 text-xs text-white/60">
            {copy.surface}
            <span className="text-sm font-medium tabular-nums text-white">
              {search.minSurface === null
                ? copy.anySurface
                : copy.atLeast(text.number(search.minSurface))}
            </span>
          </span>
          <input
            type="range"
            min={Math.floor(surface.min / surfaceStep) * surfaceStep}
            max={Math.floor(surface.max / surfaceStep) * surfaceStep}
            step={surfaceStep}
            value={search.minSurface ?? Math.floor(surface.min / surfaceStep) * surfaceStep}
            onChange={(e) => {
              const value = Number(e.target.value);
              onSearch({ ...search, minSurface: value <= surface.min ? null : value });
            }}
            className="mt-2 w-full accent-[color:var(--brand)]"
          />
        </label>
      ) : null}
      {bedrooms.length > 1 ? (
        <div>
          <p className="text-xs text-white/60">{copy.bedrooms}</p>
          <div role="group" aria-label={copy.bedrooms} className="mt-2 flex flex-wrap gap-1.5">
            {[null, ...bedrooms.slice(1)].map((n) => {
              const active = search.minBedrooms === n;
              return (
                <button
                  key={n ?? "toutes"}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onSearch({ ...search, minBedrooms: n })}
                  className={cn(
                    "h-8 min-w-12 rounded-full border px-3 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70",
                    active
                      ? "border-white bg-white text-black"
                      : "border-white/15 text-white/75 hover:border-white/35",
                  )}
                >
                  {n === null ? copy.anyBedrooms : `${n}+`}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
      <div className="flex items-center justify-between gap-3 text-xs">
        <span className="font-medium text-white/80">{copy.found(found)}</span>
        {isSearching(search) ? (
          <button
            type="button"
            onClick={() => onSearch(NO_SEARCH)}
            className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-white/60 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          >
            <X className="size-3.5" aria-hidden />
            {copy.clear}
          </button>
        ) : null}
      </div>
    </div>
  );
}
