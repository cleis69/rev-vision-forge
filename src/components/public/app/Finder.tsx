import { useId, useState, type ReactNode } from "react";
import { ArrowDownUp, GitCompareArrows, Plus, X } from "lucide-react";

import { priceLabel } from "@/components/public/status";
import { LOT_STATUSES, type LotStatus } from "@/lib/app/lot-fields";
import { useCopy } from "@/lib/i18n";
import { aLot, countLots, lotNoun, roundStep, shortType } from "@/lib/public/finder";
import { usePublicText } from "@/lib/public/i18n";
import {
  isSearching,
  LOT_SORTS,
  NO_SEARCH,
  type LotSearch,
  type LotSort,
  type searchRange,
} from "@/lib/public/lot-list";
import type { PublicLot } from "@/lib/public/programme";
import { cn } from "@/lib/utils";

/* « Je cherche… » : beside the 3D view (under it on a phone), the buyer
   completes one sentence — a type, bedrooms, a size, a budget — and the lots
   that fit stay lit on the view while the list keeps only them. Each word of
   the sentence opens its choice right under it. */

type Word = "type" | "bedrooms" | "surface" | "budget";

const COPY = {
  fr: {
    lead: (a: string) => `Je cherche ${a}`,
    anyType: "de tout type",
    ofType: (t: string) => `de type ${t}`,
    bedrooms: (n: number) => `avec ${n} chambre${n > 1 ? "s" : ""} ou plus`,
    surface: (v: string) => `de ${v} m² ou plus`,
    budget: (v: string) => `jusqu'à ${v}`,
    add: { bedrooms: "Chambres", surface: "Surface", budget: "Budget" },
    choose: {
      type: "Type",
      bedrooms: "Nombre de chambres",
      surface: "Surface habitable minimum",
      budget: "Budget maximum",
    },
    allTypes: "Tous les types",
    anyBedrooms: "Peu importe",
    orMore: (n: number) => `${n} ou plus`,
    noLimit: "Sans limite",
    anySurface: "Toutes",
    done: "OK",
    close: "Fermer ce choix",
    clear: "Effacer",
    match: (count: string, n: number, feminine: boolean, bare: string) =>
      n === 0
        ? `${feminine ? "Aucune" : "Aucun"} ${bare} ne correspond`
        : `${count} ${n > 1 ? "correspondent" : "correspond"}`,
    live: "Disponibilités en direct",
    sortBy: "Trier",
    sorts: {
      numero: "Numéro",
      "prix-asc": "Prix croissant",
      "prix-desc": "Prix décroissant",
      surface: "Surface",
    },
    byStatus: "Filtrer par statut",
    noLots: "Les lots seront bientôt présentés.",
    widen: "Élargissez la recherche : un autre type, moins de chambres, un budget plus haut.",
    showAll: (n: number) => `Voir les ${n} lots du programme`,
    onlyView: "Seulement ceux de cette vue",
    bedroomsShort: (n: number) => `${n} ch.`,
    compare: (numero: string, on: boolean) =>
      `${on ? "Retirer du" : "Ajouter au"} comparateur : lot ${numero}`,
    onRequestShort: "Sur demande",
  },
  en: {
    lead: (a: string) => `I'm looking for ${a}`,
    anyType: "of any type",
    ofType: (t: string) => `of type ${t}`,
    bedrooms: (n: number) => `with ${n} bedroom${n > 1 ? "s" : ""} or more`,
    surface: (v: string) => `of ${v} m² or more`,
    budget: (v: string) => `up to ${v}`,
    add: { bedrooms: "Bedrooms", surface: "Size", budget: "Budget" },
    choose: {
      type: "Type",
      bedrooms: "Number of bedrooms",
      surface: "Minimum living area",
      budget: "Maximum budget",
    },
    allTypes: "All types",
    anyBedrooms: "Any",
    orMore: (n: number) => `${n} or more`,
    noLimit: "No limit",
    anySurface: "Any",
    done: "OK",
    close: "Close this choice",
    clear: "Clear",
    match: (count: string, n: number, _feminine: boolean, bare: string) =>
      n === 0 ? `No ${bare} matches` : `${count} ${n > 1 ? "match" : "matches"}`,
    live: "Live availability",
    sortBy: "Sort",
    sorts: {
      numero: "Lot number",
      "prix-asc": "Price: low to high",
      "prix-desc": "Price: high to low",
      surface: "Living area",
    },
    byStatus: "Filter by status",
    noLots: "The lots will be listed soon.",
    widen: "Widen the search: another type, fewer bedrooms, a higher budget.",
    showAll: (n: number) => `See all ${n} lots of the programme`,
    onlyView: "Only those of this view",
    bedroomsShort: (n: number) => `${n} bed.`,
    compare: (numero: string, on: boolean) =>
      `${on ? "Remove from" : "Add to"} comparison: lot ${numero}`,
    onRequestShort: "On request",
  },
};

const DOT: Record<LotStatus, string> = {
  disponible: "bg-[color:var(--brand)]",
  reservee: "bg-amber-400",
  vendue: "bg-white/35",
};
const STATUS_INK: Record<LotStatus, string> = {
  disponible: "text-[color:var(--brand)]",
  reservee: "text-amber-300",
  vendue: "text-white/50",
};

const choice = (active: boolean) =>
  cn(
    "inline-flex h-10 items-center rounded-[10px] border px-3.5 text-sm transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70",
    active
      ? "border-white bg-white font-medium text-black"
      : "border-white/15 text-white/80 hover:border-white/40 hover:text-white",
  );

export function Finder({
  viewName,
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
  children,
}: {
  /** Name of the view whose lots are listed, or null for the whole programme. */
  viewName: string | null;
  /** The list holds the lots of the view only (a button shows them all). */
  scoped: { showingAll: boolean; total: number } | null;
  /** Lots of the view (or of the programme), before the choices: the counts. */
  lots: PublicLot[];
  /** The same, filtered and sorted. */
  shown: PublicLot[];
  /** Names of the types, in the promoter's order (the sentence offers them from two on). */
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
  /** Under the list: the other sections of the programme (phones). */
  children?: ReactNode;
}) {
  const copy = useCopy(COPY);
  const text = usePublicText();
  const { locale } = text;
  const panel = useId();
  const [open, setOpen] = useState<Word | null>(null);

  const noun = lotNoun(types);
  const bare = locale === "fr" ? noun.noun.fr.one : noun.noun.en.one;
  const { price, surface, bedrooms } = range;
  const offers: Record<Word, boolean> = {
    type: types.length > 1,
    bedrooms: bedrooms.length > 1,
    surface: surface !== null,
    budget: price !== null,
  };
  const set: Record<Word, boolean> = {
    type: type !== null,
    bedrooms: search.minBedrooms !== null,
    surface: search.minSurface !== null,
    budget: search.maxPrice !== null,
  };
  const narrowed = set.type || isSearching(search) || status !== null;

  const counts = Object.fromEntries(
    LOT_STATUSES.map((s) => [s, lots.filter((l) => l.statut === s).length]),
  ) as Record<LotStatus, number>;
  const present = LOT_STATUSES.filter((s) => counts[s] > 0);
  // Prices on request for every lot still for sale: said once, not on each line.
  const priced = lots.some((l) => l.statut !== "vendue" && l.prix !== null);

  const clause: Record<Word, string | null> = {
    type: offers.type ? (type === null ? copy.anyType : copy.ofType(shortType(type, noun))) : null,
    bedrooms: search.minBedrooms !== null ? copy.bedrooms(search.minBedrooms) : null,
    surface: search.minSurface !== null ? copy.surface(text.number(search.minSurface)) : null,
    budget: search.maxPrice !== null ? copy.budget(text.price(search.maxPrice, currency)) : null,
  };
  const words = (["type", "bedrooms", "surface", "budget"] as const).filter(
    (w) => clause[w] !== null,
  );
  const toAdd = (["bedrooms", "surface", "budget"] as const).filter((w) => offers[w] && !set[w]);

  const toggle = (word: Word) => setOpen((o) => (o === word ? null : word));
  const clear = () => {
    onType(null);
    onSearch(NO_SEARCH);
    onStatus(null);
    setOpen(null);
  };

  const priceStep = price ? roundStep(price.max - price.min) : 1;
  const surfaceStep = surface ? roundStep(surface.max - surface.min) : 1;

  return (
    <div className="flex flex-col">
      <div className="px-5 pb-4 pt-5 lg:px-6 lg:pt-6">
        <h2 className="font-brand text-[22px] font-medium leading-[1.42] tracking-[-0.01em] text-white lg:text-[26px] lg:leading-[1.36]">
          {copy.lead(aLot(noun, locale))}
          {words.map((word, i) => (
            <span key={word}>
              {i === 0 ? " " : ", "}
              <button
                type="button"
                onClick={() => toggle(word)}
                aria-expanded={open === word}
                aria-controls={panel}
                className={cn(
                  "-mx-1 rounded-md px-1 text-left text-[color:var(--brand)] underline decoration-1 underline-offset-[6px] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70",
                  open === word
                    ? "bg-[color:var(--brand)]/15 decoration-[color:var(--brand)]"
                    : "decoration-[color:var(--brand)]/45 hover:decoration-[color:var(--brand)]",
                )}
              >
                {clause[word]}
              </button>
            </span>
          ))}
          .
        </h2>

        {toAdd.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {toAdd.map((word) => (
              <button
                key={word}
                type="button"
                onClick={() => toggle(word)}
                aria-expanded={open === word}
                aria-controls={panel}
                className={cn(
                  "inline-flex h-9 items-center gap-1.5 rounded-[10px] border border-dashed px-3 text-[13px] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70",
                  open === word
                    ? "border-[color:var(--brand)] text-[color:var(--brand)]"
                    : "border-white/25 text-white/70 hover:border-white/50 hover:text-white",
                )}
              >
                <Plus className="size-3.5" aria-hidden />
                {copy.add[word]}
              </button>
            ))}
          </div>
        ) : null}

        {open ? (
          <div
            id={panel}
            role="group"
            aria-label={copy.choose[open]}
            className="mt-4 rounded-[10px] border border-white/10 bg-white/[0.04] p-3.5 duration-200 animate-in fade-in slide-in-from-top-1 motion-reduce:animate-none"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-white/60">{copy.choose[open]}</p>
              <button
                type="button"
                onClick={() => setOpen(null)}
                aria-label={copy.close}
                className="-mr-1 grid size-8 place-items-center rounded-md text-white/60 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
              >
                <X className="size-4" aria-hidden />
              </button>
            </div>

            {open === "type" ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {[null, ...types].map((t) => (
                  <button
                    key={t ?? "tous"}
                    type="button"
                    aria-pressed={type === t}
                    onClick={() => {
                      onType(t);
                      setOpen(null);
                    }}
                    className={choice(type === t)}
                  >
                    {t ?? copy.allTypes}
                  </button>
                ))}
              </div>
            ) : null}

            {open === "bedrooms" ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {[null, ...bedrooms.slice(1)].map((n) => (
                  <button
                    key={n ?? "toutes"}
                    type="button"
                    aria-pressed={search.minBedrooms === n}
                    onClick={() => {
                      onSearch({ ...search, minBedrooms: n });
                      setOpen(null);
                    }}
                    className={choice(search.minBedrooms === n)}
                  >
                    {n === null ? copy.anyBedrooms : copy.orMore(n)}
                  </button>
                ))}
              </div>
            ) : null}

            {open === "surface" && surface ? (
              <Slider
                value={search.minSurface ?? Math.floor(surface.min / surfaceStep) * surfaceStep}
                min={Math.floor(surface.min / surfaceStep) * surfaceStep}
                max={Math.floor(surface.max / surfaceStep) * surfaceStep}
                step={surfaceStep}
                label={copy.choose.surface}
                shown={
                  search.minSurface === null
                    ? copy.anySurface
                    : `${text.number(search.minSurface)} m²`
                }
                onChange={(value) =>
                  onSearch({ ...search, minSurface: value <= surface.min ? null : value })
                }
                done={copy.done}
                onDone={() => setOpen(null)}
              />
            ) : null}

            {open === "budget" && price ? (
              <Slider
                value={search.maxPrice ?? Math.ceil(price.max / priceStep) * priceStep}
                min={Math.floor(price.min / priceStep) * priceStep}
                max={Math.ceil(price.max / priceStep) * priceStep}
                step={priceStep}
                label={copy.choose.budget}
                shown={
                  search.maxPrice === null ? copy.noLimit : text.price(search.maxPrice, currency)
                }
                onChange={(value) =>
                  onSearch({ ...search, maxPrice: value >= price.max ? null : value })
                }
                done={copy.done}
                onDone={() => setOpen(null)}
              />
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="border-y border-white/10 px-5 py-3 lg:px-6">
        <div className="flex items-center justify-between gap-3">
          <p className="flex min-w-0 items-baseline gap-2 text-sm font-medium" aria-live="polite">
            <span className="relative flex size-2 shrink-0 translate-y-[-1px]" title={copy.live}>
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400/60 motion-reduce:animate-none" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
              <span className="sr-only">{copy.live}</span>
            </span>
            <span
              key={`${shown.length}-${narrowed}`}
              className="duration-200 animate-in fade-in motion-reduce:animate-none"
            >
              {narrowed
                ? copy.match(
                    countLots(noun, shown.length, locale),
                    shown.length,
                    noun.noun.fr.feminine,
                    bare,
                  )
                : countLots(noun, lots.length, locale)}
              {viewName ? <span className="font-normal text-white/55"> · {viewName}</span> : null}
              {!priced && lots.some((l) => l.statut !== "vendue") ? (
                <span className="font-normal text-white/55"> · {text.onRequest}</span>
              ) : null}
            </span>
          </p>
          <div className="flex shrink-0 items-center gap-1">
            {lots.length > 3 ? (
              <label className="relative inline-flex h-8 items-center text-xs text-white/65">
                <span className="sr-only">{copy.sortBy}</span>
                <ArrowDownUp
                  className="pointer-events-none absolute left-1.5 size-3.5 text-white/50"
                  aria-hidden
                />
                <select
                  value={sort}
                  onChange={(e) => onSort(e.target.value as LotSort)}
                  className="h-8 appearance-none rounded-md bg-transparent pl-6 pr-1 text-xs text-white/75 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 [&>option]:bg-[#111]"
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
        </div>

        {present.length > 1 || narrowed ? (
          <div className="mt-1.5 flex items-center justify-between gap-3">
            {present.length > 1 ? (
              <div
                role="group"
                aria-label={copy.byStatus}
                className="-ml-2 flex min-w-0 flex-wrap items-center gap-x-1 gap-y-1 text-xs"
              >
                {present.map((s) => (
                  <button
                    key={s}
                    type="button"
                    aria-pressed={status === s}
                    onClick={() => onStatus(status === s ? null : s)}
                    className={cn(
                      "inline-flex h-8 items-center gap-1.5 rounded-md px-2 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70",
                      status === s ? "bg-white/10 text-white" : "text-white/65 hover:text-white",
                      status !== null && status !== s && "opacity-55",
                    )}
                  >
                    <span className={cn("size-2 rounded-full", DOT[s])} aria-hidden />
                    <span className="tabular-nums">{counts[s]}</span>
                    {(counts[s] > 1 ? text.statusPlural[s] : text.status[s]).toLowerCase()}
                  </button>
                ))}
              </div>
            ) : (
              <span />
            )}
            {narrowed ? (
              <button
                type="button"
                onClick={clear}
                className="inline-flex h-8 shrink-0 items-center rounded-md px-2 text-xs text-white/65 underline decoration-white/30 underline-offset-4 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
              >
                {copy.clear}
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      {shown.length === 0 ? (
        <p className="px-5 py-8 text-sm leading-relaxed text-white/65 lg:px-6">
          {lots.length === 0 ? copy.noLots : copy.widen}
        </p>
      ) : (
        <ul className="divide-y divide-white/[0.07]" onMouseLeave={() => onHover(null)}>
          {shown.map((lot) => {
            const compared = compareIds.includes(lot.id);
            const facts = [
              lot.type,
              lot.surface_habitable !== null ? `${text.number(lot.surface_habitable)} m²` : null,
              lot.chambres !== null ? copy.bedroomsShort(lot.chambres) : null,
              lot.niveau !== null && lot.type === null ? text.level(lot.niveau) : null,
            ].filter(Boolean);
            return (
              <li
                key={lot.id}
                className={cn(
                  "flex items-center transition-colors duration-700",
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
                  className="flex min-h-[68px] min-w-0 flex-1 items-center gap-3 py-3 pl-5 pr-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/60 lg:pl-6"
                >
                  <span
                    className={cn(
                      "w-14 shrink-0 font-brand text-[26px] font-medium leading-none tabular-nums tracking-tight",
                      lot.statut === "vendue" && "text-white/45",
                    )}
                  >
                    {lot.numero}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] text-white/70">
                      {facts.join(" · ")}
                    </span>
                    <span className="mt-1 flex items-baseline justify-between gap-3">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 text-xs",
                          STATUS_INK[lot.statut],
                        )}
                      >
                        <span
                          className={cn("size-1.5 rounded-full", DOT[lot.statut])}
                          aria-hidden
                        />
                        {text.status[lot.statut]}
                      </span>
                      {priced && lot.statut !== "vendue" ? (
                        <span className="whitespace-nowrap text-sm font-medium tabular-nums text-white">
                          {lot.prix !== null
                            ? priceLabel(lot, currency, locale)
                            : copy.onRequestShort}
                        </span>
                      ) : null}
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
                    "mr-3 grid size-10 shrink-0 place-items-center rounded-[10px] border transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 lg:mr-4",
                    compared
                      ? "border-[color:var(--brand)] bg-[color:var(--brand)] text-[color:var(--brand-contrast)]"
                      : "border-transparent text-white/40 hover:border-white/25 hover:text-white",
                  )}
                >
                  <GitCompareArrows className="size-4" aria-hidden />
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
          className="mx-5 mt-4 inline-flex h-11 items-center justify-center rounded-[10px] border border-white/15 px-4 text-[13px] text-white/75 transition-colors duration-200 hover:border-white/40 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 lg:mx-6"
        >
          {scoped.showingAll ? copy.onlyView : copy.showAll(scoped.total)}
        </button>
      ) : null}

      {children}
    </div>
  );
}

function Slider({
  value,
  min,
  max,
  step,
  label,
  shown,
  onChange,
  done,
  onDone,
}: {
  value: number;
  min: number;
  max: number;
  step: number;
  label: string;
  /** The value as the buyer reads it. */
  shown: string;
  onChange: (value: number) => void;
  done: string;
  onDone: () => void;
}) {
  return (
    <div className="mt-1">
      <p className="font-brand text-xl font-medium tabular-nums tracking-tight">{shown}</p>
      <div className="mt-2 flex items-center gap-3">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          aria-label={label}
          aria-valuetext={shown}
          onChange={(e) => onChange(Number(e.target.value))}
          className="h-8 min-w-0 flex-1 accent-[color:var(--brand)]"
        />
        <button type="button" onClick={onDone} className={choice(true)}>
          {done}
        </button>
      </div>
    </div>
  );
}
