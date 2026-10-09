import { Check, Minus, X } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { mediaImage, type MediaItem } from "@/lib/app/media";
import { useCopy } from "@/lib/i18n";
import { MAX_COMPARE, bestPricePerSqm, featureRows, pricePerSqm } from "@/lib/public/compare";
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
    region: "Comparateur",
    picked: "Comparer",
    remove: (numero: string) => `Retirer le lot ${numero} du comparateur`,
    clear: "Effacer",
    atLeastTwo: "Choisissez au moins 2 lots",
    addSecond: "Ajoutez un 2e lot",
    compare: (n: number) => `Comparer ${n} lots`,
    title: "Comparer les lots",
    description: (n: number) => `${n} lots côte à côte. Touchez un lot pour ouvrir sa fiche.`,
    criterion: "Critère",
    status: "Statut",
    price: "Prix",
    pricePerSqm: "Prix au m²",
    bestPricePerSqm: "Meilleur prix au m²",
    livingArea: "Surface habitable",
    plot: "Terrain",
    bedrooms: "Chambres",
    bathrooms: "Salles de bains",
    floor: "Niveau",
    yes: "Oui",
    no: "Non",
  },
  en: {
    region: "Comparison",
    picked: "Compare",
    remove: (numero: string) => `Remove lot ${numero} from the comparison`,
    clear: "Clear",
    atLeastTwo: "Choose at least 2 lots",
    addSecond: "Add a 2nd lot",
    compare: (n: number) => `Compare ${n} lots`,
    title: "Compare lots",
    description: (n: number) => `${n} lots side by side. Tap a lot to open its details.`,
    criterion: "Criterion",
    status: "Status",
    price: "Price",
    pricePerSqm: "Price per m²",
    bestPricePerSqm: "Best price per m²",
    livingArea: "Living area",
    plot: "Plot",
    bedrooms: "Bedrooms",
    bathrooms: "Bathrooms",
    floor: "Floor",
    yes: "Yes",
    no: "No",
  },
};

/** Bar at the bottom of the page while lots are picked for comparison. */
export function CompareBar({
  lots,
  onRemove,
  onClear,
  onCompare,
}: {
  lots: PublicLot[];
  onRemove: (lot: PublicLot) => void;
  onClear: () => void;
  onCompare: () => void;
}) {
  const copy = useCopy(COPY);
  if (lots.length === 0) return null;
  return (
    <div
      role="region"
      aria-label={copy.region}
      className="fixed inset-x-3 bottom-3 z-40 mx-auto flex max-w-2xl flex-wrap items-center gap-2 rounded-2xl border border-white/15 bg-[#111]/95 p-2.5 pl-4 text-white shadow-2xl backdrop-blur-xl sm:bottom-5"
    >
      <span className="mr-1 text-xs text-white/55">
        {copy.picked} · {lots.length}/{MAX_COMPARE}
      </span>
      <ul className="flex flex-wrap gap-1.5">
        {lots.map((lot) => (
          <li key={lot.id}>
            <button
              type="button"
              onClick={() => onRemove(lot)}
              aria-label={copy.remove(lot.numero)}
              className="inline-flex h-8 items-center gap-1 rounded-full border border-white/15 bg-white/5 pl-3 pr-2 text-sm hover:border-white/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            >
              Lot {lot.numero}
              <X className="size-3.5 text-white/60" aria-hidden />
            </button>
          </li>
        ))}
      </ul>
      <div className="ml-auto flex items-center gap-1.5">
        <button
          type="button"
          onClick={onClear}
          className="h-9 rounded-full px-3 text-sm text-white/60 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
        >
          {copy.clear}
        </button>
        <button
          type="button"
          onClick={onCompare}
          disabled={lots.length < 2}
          title={lots.length < 2 ? copy.atLeastTwo : undefined}
          className="h-9 rounded-full bg-[color:var(--brand)] px-4 text-sm font-medium text-[color:var(--brand-contrast)] transition-opacity hover:opacity-90 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
        >
          {lots.length < 2 ? copy.addSecond : copy.compare(lots.length)}
        </button>
      </div>
    </div>
  );
}

/** The compared lots side by side. */
export function CompareDialog({
  lots,
  media,
  currency,
  open,
  onOpenChange,
  onOpenLot,
}: {
  lots: PublicLot[];
  media: MediaItem[];
  currency: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenLot: (lot: PublicLot) => void;
}) {
  const copy = useCopy(COPY);
  const text = usePublicText();
  const area = AREA[text.locale];
  const best = bestPricePerSqm(lots);
  const features = featureRows(lots);
  const photo = (lot: PublicLot) =>
    media.find((m) => m.lot_id === lot.id) ?? media.find((m) => !m.lot_id);
  const cell = "px-3 py-3 align-top";
  const head =
    "py-3 pr-3 text-left align-top text-[11px] font-medium uppercase tracking-[0.16em] text-white/45";
  const value = (v: number | null, unit: string) =>
    v === null ? <span className="text-white/35">—</span> : `${area.format(v)} ${unit}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92svh] max-w-4xl overflow-y-auto border-white/10 bg-[#0d0d0d] p-5 text-white sm:p-7">
        <DialogHeader>
          <DialogTitle className="font-brand text-2xl font-medium tracking-tight">
            {copy.title}
          </DialogTitle>
          <DialogDescription className="text-white/55">
            {copy.description(lots.length)}
          </DialogDescription>
        </DialogHeader>
        <div className="-mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
          <table className="w-full min-w-[34rem] border-collapse text-sm">
            <thead>
              <tr>
                <th scope="col" className="w-32 py-3">
                  <span className="sr-only">{copy.criterion}</span>
                </th>
                {lots.map((lot) => {
                  const p = photo(lot);
                  return (
                    <th key={lot.id} scope="col" className={cn(cell, "text-left font-normal")}>
                      <button
                        type="button"
                        onClick={() => onOpenLot(lot)}
                        className="group block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                      >
                        <span className="relative block aspect-[4/3] overflow-hidden rounded-xl bg-white/5">
                          {p ? (
                            <img
                              src={mediaImage(p).thumb}
                              alt=""
                              loading="lazy"
                              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none"
                            />
                          ) : null}
                        </span>
                        <span className="mt-3 block font-brand text-lg font-medium tracking-tight">
                          Lot {lot.numero}
                          {lot.type ? <span className="text-white/55"> · {lot.type}</span> : null}
                        </span>
                      </button>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="[&_tr]:border-t [&_tr]:border-white/10">
              <tr>
                <th scope="row" className={head}>
                  {copy.status}
                </th>
                {lots.map((lot) => (
                  <td key={lot.id} className={cell}>
                    <StatusChip status={lot.statut} />
                  </td>
                ))}
              </tr>
              <tr>
                <th scope="row" className={head}>
                  {copy.price}
                </th>
                {lots.map((lot) => (
                  <td
                    key={lot.id}
                    className={cn(cell, "font-medium", lot.statut === "vendue" && "text-white/45")}
                  >
                    {priceLabel(lot, currency, text.locale)}
                  </td>
                ))}
              </tr>
              <tr>
                <th scope="row" className={head}>
                  {copy.pricePerSqm}
                </th>
                {lots.map((lot) => {
                  const v = pricePerSqm(lot);
                  return (
                    <td key={lot.id} className={cell}>
                      {v === null ? (
                        <span className="text-white/35">—</span>
                      ) : (
                        <span
                          className={cn(best === lot.id && "font-medium text-[color:var(--brand)]")}
                        >
                          {text.price(v, currency)}
                          {best === lot.id ? (
                            <span className="block text-[11px] font-normal">
                              {copy.bestPricePerSqm}
                            </span>
                          ) : null}
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
              <tr>
                <th scope="row" className={head}>
                  {copy.livingArea}
                </th>
                {lots.map((lot) => (
                  <td key={lot.id} className={cell}>
                    {value(lot.surface_habitable, "m²")}
                  </td>
                ))}
              </tr>
              <tr>
                <th scope="row" className={head}>
                  {copy.plot}
                </th>
                {lots.map((lot) => (
                  <td key={lot.id} className={cell}>
                    {value(lot.surface_terrain, "m²")}
                  </td>
                ))}
              </tr>
              <tr>
                <th scope="row" className={head}>
                  {copy.bedrooms}
                </th>
                {lots.map((lot) => (
                  <td key={lot.id} className={cell}>
                    {lot.chambres ?? <span className="text-white/35">—</span>}
                  </td>
                ))}
              </tr>
              {lots.some((lot) => lot.salles_de_bain !== null) ? (
                <tr>
                  <th scope="row" className={head}>
                    {copy.bathrooms}
                  </th>
                  {lots.map((lot) => (
                    <td key={lot.id} className={cell}>
                      {lot.salles_de_bain ?? <span className="text-white/35">—</span>}
                    </td>
                  ))}
                </tr>
              ) : null}
              {lots.some((lot) => lot.niveau !== null) ? (
                <tr>
                  <th scope="row" className={head}>
                    {copy.floor}
                  </th>
                  {lots.map((lot) => (
                    <td key={lot.id} className={cell}>
                      {lot.niveau !== null ? (
                        text.level(lot.niveau)
                      ) : (
                        <span className="text-white/35">—</span>
                      )}
                    </td>
                  ))}
                </tr>
              ) : null}
              {features.map((row) => (
                <tr key={row.feature}>
                  <th
                    scope="row"
                    className={cn(head, "normal-case tracking-normal text-white/60 text-xs")}
                  >
                    {row.feature}
                  </th>
                  {row.has.map((has, i) => (
                    <td key={lots[i]?.id ?? i} className={cell}>
                      {has ? (
                        <Check className="size-4 text-[color:var(--brand)]" aria-label={copy.yes} />
                      ) : (
                        <Minus className="size-4 text-white/25" aria-label={copy.no} />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
