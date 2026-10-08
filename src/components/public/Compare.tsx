import { Check, Minus, X } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatPrice } from "@/lib/app/lot-format";
import { mediaImage, type MediaItem } from "@/lib/app/media";
import { MAX_COMPARE, bestPricePerSqm, featureRows, pricePerSqm } from "@/lib/public/compare";
import type { PublicLot } from "@/lib/public/programme";
import { cn } from "@/lib/utils";
import { levelLabel } from "@/lib/views";
import { StatusChip } from "./LotDetails";
import { priceLabel } from "./status";

const area = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });

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
  if (lots.length === 0) return null;
  return (
    <div
      role="region"
      aria-label="Comparateur"
      className="fixed inset-x-3 bottom-3 z-40 mx-auto flex max-w-2xl flex-wrap items-center gap-2 rounded-2xl border border-white/15 bg-[#111]/95 p-2.5 pl-4 text-white shadow-2xl backdrop-blur-xl sm:bottom-5"
    >
      <span className="mr-1 text-xs text-white/55">
        Comparer · {lots.length}/{MAX_COMPARE}
      </span>
      <ul className="flex flex-wrap gap-1.5">
        {lots.map((lot) => (
          <li key={lot.id}>
            <button
              type="button"
              onClick={() => onRemove(lot)}
              aria-label={`Retirer le lot ${lot.numero} du comparateur`}
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
          Effacer
        </button>
        <button
          type="button"
          onClick={onCompare}
          disabled={lots.length < 2}
          title={lots.length < 2 ? "Choisissez au moins 2 lots" : undefined}
          className="h-9 rounded-full bg-[color:var(--brand)] px-4 text-sm font-medium text-[color:var(--brand-contrast)] transition-opacity hover:opacity-90 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
        >
          {lots.length < 2 ? "Ajoutez un 2e lot" : `Comparer ${lots.length} lots`}
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
            Comparer les lots
          </DialogTitle>
          <DialogDescription className="text-white/55">
            {lots.length} lots côte à côte. Touchez un lot pour ouvrir sa fiche.
          </DialogDescription>
        </DialogHeader>
        <div className="-mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
          <table className="w-full min-w-[34rem] border-collapse text-sm">
            <thead>
              <tr>
                <th scope="col" className="w-32 py-3">
                  <span className="sr-only">Critère</span>
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
                  Statut
                </th>
                {lots.map((lot) => (
                  <td key={lot.id} className={cell}>
                    <StatusChip status={lot.statut} />
                  </td>
                ))}
              </tr>
              <tr>
                <th scope="row" className={head}>
                  Prix
                </th>
                {lots.map((lot) => (
                  <td
                    key={lot.id}
                    className={cn(cell, "font-medium", lot.statut === "vendue" && "text-white/45")}
                  >
                    {priceLabel(lot, currency)}
                  </td>
                ))}
              </tr>
              <tr>
                <th scope="row" className={head}>
                  Prix au m²
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
                          {formatPrice(v, currency)}
                          {best === lot.id ? (
                            <span className="block text-[11px] font-normal">
                              Meilleur prix au m²
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
                  Surface habitable
                </th>
                {lots.map((lot) => (
                  <td key={lot.id} className={cell}>
                    {value(lot.surface_habitable, "m²")}
                  </td>
                ))}
              </tr>
              <tr>
                <th scope="row" className={head}>
                  Terrain
                </th>
                {lots.map((lot) => (
                  <td key={lot.id} className={cell}>
                    {value(lot.surface_terrain, "m²")}
                  </td>
                ))}
              </tr>
              <tr>
                <th scope="row" className={head}>
                  Chambres
                </th>
                {lots.map((lot) => (
                  <td key={lot.id} className={cell}>
                    {lot.chambres ?? <span className="text-white/35">—</span>}
                  </td>
                ))}
              </tr>
              {lots.some((lot) => lot.niveau !== null) ? (
                <tr>
                  <th scope="row" className={head}>
                    Niveau
                  </th>
                  {lots.map((lot) => (
                    <td key={lot.id} className={cell}>
                      {lot.niveau !== null ? (
                        levelLabel(lot.niveau)
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
                        <Check className="size-4 text-[color:var(--brand)]" aria-label="Oui" />
                      ) : (
                        <Minus className="size-4 text-white/25" aria-label="Non" />
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
