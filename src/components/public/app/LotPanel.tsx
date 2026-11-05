import { useState } from "react";
import { Check } from "lucide-react";

import { StatusFilters } from "@/components/public/Common";
import { StatusChip } from "@/components/public/LotDetails";
import { priceLabel } from "@/components/public/status";
import { LOT_STATUSES, type LotStatus } from "@/lib/app/lot-fields";
import { useCopy } from "@/lib/i18n";
import { usePublicText } from "@/lib/public/i18n";
import {
  canSearch,
  LOT_SORTS,
  type LotSearch,
  type LotSort,
  type searchRange,
} from "@/lib/public/lot-list";
import type { PublicLot } from "@/lib/public/programme";
import { cn } from "@/lib/utils";
import { LotSearchButton, LotSearchFields } from "./LotSearch";
import { Chips } from "./parts";

/* Beside the 3D view: the lots it shows, how many are left (a bar in the
   colours of the statuses), sorted and filtered; hovering a lot lights it up
   on the view, a click opens its sheet. Phones get it under the view. */

const COPY = {
  fr: {
    all: "Tous les lots",
    left: (free: number, total: number) =>
      free === 0
        ? `Aucun disponible sur ${total}`
        : `${free} disponible${free > 1 ? "s" : ""} sur ${total}`,
    live: "Disponibilités en direct",
    byType: "Filtrer les lots par type",
    allTypes: "Tous les types",
    sortBy: "Trier",
    sorts: {
      numero: "Numéro",
      "prix-asc": "Prix croissant",
      "prix-desc": "Prix décroissant",
      surface: "Surface",
    },
    noMatch: "Aucun lot ne correspond à ces filtres.",
    noLots: "Les lots seront bientôt présentés.",
    showAll: (n: number) => `Voir les ${n} lots du programme`,
    onlyView: "Seulement ceux de cette vue",
    bedrooms: (n: number) => `${n} ch.`,
    compare: (numero: string, on: boolean) =>
      `${on ? "Retirer du" : "Ajouter au"} comparateur : lot ${numero}`,
  },
  en: {
    all: "All lots",
    left: (free: number, total: number) =>
      free === 0 ? `None available of ${total}` : `${free} available of ${total}`,
    live: "Live availability",
    byType: "Filter lots by type",
    allTypes: "All types",
    sortBy: "Sort",
    sorts: {
      numero: "Lot number",
      "prix-asc": "Price: low to high",
      "prix-desc": "Price: high to low",
      surface: "Living area",
    },
    noMatch: "No lots match these filters.",
    noLots: "The lots will be listed soon.",
    showAll: (n: number) => `See all ${n} lots of the programme`,
    onlyView: "Only those of this view",
    bedrooms: (n: number) => `${n} bed.`,
    compare: (numero: string, on: boolean) =>
      `${on ? "Remove from" : "Add to"} comparison: lot ${numero}`,
  },
};

const BAR: Record<LotStatus, string> = {
  disponible: "bg-[color:var(--brand)]",
  reservee: "bg-amber-400",
  vendue: "bg-white/20",
};

export function LotPanel({
  title,
  scoped,
  lots,
  shown,
  types,
  status,
  onStatus,
  type,
  onType,
  sort,
  onSort,
  currency,
  highlight,
  activeId,
  compareIds,
  onToggleCompare,
  onHover,
  onOpen,
  onToggleScope,
  search,
  onSearch,
  range,
  className,
}: {
  /** Name of the view shown, or null for the whole programme. */
  title: string | null;
  /** The list holds the lots of the view only (a button shows them all). */
  scoped: { showingAll: boolean; total: number } | null;
  /** Lots of the view (or of the programme), before the filters: the counts and the bar. */
  lots: PublicLot[];
  /** The same, filtered and sorted. */
  shown: PublicLot[];
  types: string[];
  status: LotStatus | null;
  onStatus: (status: LotStatus | null) => void;
  type: string | null;
  onType: (type: string | null) => void;
  sort: LotSort;
  onSort: (sort: LotSort) => void;
  currency: string;
  highlight: ReadonlySet<string>;
  activeId: string | null;
  compareIds: string[];
  onToggleCompare: (lot: PublicLot) => void;
  onHover: (lotId: string | null) => void;
  onOpen: (lot: PublicLot) => void;
  onToggleScope: () => void;
  search: LotSearch;
  onSearch: (search: LotSearch) => void;
  /** Ends of the search, from all the lots. */
  range: ReturnType<typeof searchRange>;
  className?: string;
}) {
  const copy = useCopy(COPY);
  const text = usePublicText();
  const counts = Object.fromEntries(
    LOT_STATUSES.map((s) => [s, lots.filter((l) => l.statut === s).length]),
  ) as Record<LotStatus, number>;
  // One segment per lot while they fit, else the share of each status.
  const segments = lots.length <= 30;
  const [searching, setSearching] = useState(false);
  const searchable = canSearch(range);

  return (
    <div className={cn("flex flex-col", className)}>
      <div className="space-y-3 px-5 pb-4 pt-5">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="min-w-0 truncate font-brand text-2xl font-medium tracking-tight">
            {title ?? copy.all}
          </h2>
          <p className="shrink-0 text-xs text-white/60">
            {copy.left(counts.disponible, lots.length)}
          </p>
        </div>
        {lots.length > 0 ? (
          <div className="flex h-2 gap-[3px] overflow-hidden rounded-full" aria-hidden>
            {segments
              ? lots.map((l) => (
                  <span key={l.id} className={cn("flex-1 rounded-full", BAR[l.statut])} />
                ))
              : LOT_STATUSES.map((s) =>
                  counts[s] ? (
                    <span
                      key={s}
                      className={cn("rounded-full", BAR[s])}
                      style={{ flex: counts[s] }}
                    />
                  ) : null,
                )}
          </div>
        ) : null}
        <p className="flex items-center gap-2 text-[11px] text-white/50">
          <span className="relative flex size-2" aria-hidden>
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400/60 motion-reduce:animate-none" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
          </span>
          {copy.live}
        </p>
      </div>

      <div className="space-y-3 border-y border-white/10 px-5 py-3">
        <StatusFilters
          value={status}
          onChange={onStatus}
          counts={counts}
          total={lots.length}
          small
        />
        <div className="flex items-center gap-2">
          {searchable ? (
            <LotSearchButton
              open={searching}
              onToggle={() => setSearching((o) => !o)}
              search={search}
            />
          ) : null}
          {types.length > 1 ? (
            <Chips
              label={copy.byType}
              options={[
                { value: null, label: copy.allTypes },
                ...types.map((t) => ({ value: t, label: t })),
              ]}
              value={type}
              onChange={onType}
              className="mx-0 min-w-0 max-w-none flex-1 flex-nowrap overflow-x-auto px-0 sm:mx-0 sm:flex-nowrap sm:px-0"
            />
          ) : null}
          {lots.length > 3 ? (
            <label className="ml-auto flex shrink-0 items-center gap-2 text-xs text-white/55">
              <span className="sr-only sm:not-sr-only">{copy.sortBy}</span>
              <select
                value={sort}
                onChange={(e) => onSort(e.target.value as LotSort)}
                className="h-8 rounded-full border border-white/15 bg-transparent px-3 text-xs text-white/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 [&>option]:bg-[#111]"
              >
                {LOT_SORTS.map((s) => (
                  <option key={s} value={s}>
                    {copy.sorts[s]}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
        </div>
        {searchable && searching ? (
          <LotSearchFields
            range={range}
            search={search}
            onSearch={onSearch}
            currency={currency}
            found={shown.length}
          />
        ) : null}
      </div>

      {shown.length === 0 ? (
        <p className="px-5 py-8 text-sm text-white/60">
          {lots.length === 0 ? copy.noLots : copy.noMatch}
        </p>
      ) : (
        <ul className="divide-y divide-white/[0.06]" onMouseLeave={() => onHover(null)}>
          {shown.map((lot) => {
            const compared = compareIds.includes(lot.id);
            const facts = [
              lot.type,
              lot.surface_habitable !== null ? `${text.number(lot.surface_habitable)} m²` : null,
              lot.chambres !== null ? copy.bedrooms(lot.chambres) : null,
              lot.niveau !== null && lot.type === null ? text.level(lot.niveau) : null,
            ].filter(Boolean);
            return (
              <li
                key={lot.id}
                className={cn(
                  "group relative flex items-center transition-colors duration-700",
                  activeId === lot.id ? "bg-white/[0.07]" : "hover:bg-white/[0.04]",
                  highlight.has(lot.id) && "bg-white/[0.1] duration-150",
                )}
              >
                <button
                  type="button"
                  onClick={() => onOpen(lot)}
                  onMouseEnter={() => onHover(lot.id)}
                  onFocus={() => onHover(lot.id)}
                  onBlur={() => onHover(null)}
                  className="flex min-w-0 flex-1 items-center gap-4 py-3 pl-5 pr-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/60"
                >
                  <span
                    className={cn(
                      "w-14 shrink-0 font-brand text-2xl font-medium tabular-nums tracking-tight",
                      lot.statut === "vendue" && "text-white/45",
                    )}
                  >
                    {lot.numero}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs text-white/60">
                      {facts.join(" · ")}
                    </span>
                    <span className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1">
                      {lot.statut !== "vendue" ? (
                        <span className="text-sm font-medium tabular-nums">
                          {priceLabel(lot, currency, text.locale)}
                        </span>
                      ) : null}
                      <StatusChip status={lot.statut} className="px-2 py-0.5 text-[10px]" />
                    </span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => onToggleCompare(lot)}
                  aria-pressed={compared}
                  aria-label={copy.compare(lot.numero, compared)}
                  title={copy.compare(lot.numero, compared)}
                  className={cn(
                    "mr-4 grid size-8 shrink-0 place-items-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70",
                    compared
                      ? "border-[color:var(--brand)] bg-[color:var(--brand)] text-[color:var(--brand-contrast)]"
                      : "border-white/20 text-transparent hover:border-white/50 hover:text-white/50",
                  )}
                >
                  <Check className="size-4" aria-hidden />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {scoped ? (
        <button
          type="button"
          onClick={onToggleScope}
          className="mx-5 mt-3 inline-flex h-10 items-center justify-center rounded-full border border-white/15 px-4 text-xs text-white/75 transition-colors hover:border-white/40 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
        >
          {scoped.showingAll ? copy.onlyView : copy.showAll(scoped.total)}
        </button>
      ) : null}
    </div>
  );
}
