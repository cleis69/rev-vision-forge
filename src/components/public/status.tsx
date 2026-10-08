import { STATUS_LABELS } from "@/lib/app/lot-fields";
import { formatPrice } from "@/lib/app/lot-format";
import type { PublicLot } from "@/lib/public/programme";
import { cn } from "@/lib/utils";

/* Status and price of a lot as the public pages write them, and the legend of
   the colours painted on the views. */

/** "Disponible · 1 250 000 €", or just "Vendu". */
export function statusAndPrice(lot: PublicLot, currency: string) {
  return lot.statut === "vendue"
    ? STATUS_LABELS.vendue
    : `${STATUS_LABELS[lot.statut]} · ${priceLabel(lot, currency)}`;
}

export function priceLabel(lot: PublicLot, currency: string) {
  if (lot.statut === "vendue") return "Vendu";
  return lot.prix !== null ? formatPrice(lot.prix, currency) : "Prix sur demande";
}

/** Colours of the statuses, as drawn on the views, and how to use them. */
export function StatusLegend({
  large = false,
  hint,
  touchHint,
}: {
  large?: boolean;
  /** With a mouse. */
  hint: string;
  /** With a finger (phones, and the sales office tablet). */
  touchHint: string;
}) {
  return (
    <ul
      className={cn(
        "flex flex-wrap items-center gap-x-5 gap-y-2 pt-2 text-white/70",
        large ? "text-sm" : "text-xs",
      )}
      aria-label="Légende"
    >
      <li className="flex items-center gap-2">
        <span
          className="size-3 rounded-sm border"
          style={{
            background: "color-mix(in srgb, var(--brand) 45%, transparent)",
            borderColor: "var(--brand)",
          }}
          aria-hidden
        />
        Disponible
      </li>
      <li className="flex items-center gap-2">
        <span
          className="size-3 rounded-sm border border-amber-400/90"
          style={{
            background:
              "repeating-linear-gradient(45deg, rgba(251,191,36,0.85) 0 2px, rgba(251,191,36,0.15) 2px 5px)",
          }}
          aria-hidden
        />
        Réservé
      </li>
      <li className="flex items-center gap-2">
        <span className="size-3 rounded-sm border border-zinc-400/70 bg-zinc-600/70" aria-hidden />
        Vendu
      </li>
      {large ? (
        <li className="text-white/45">{touchHint}</li>
      ) : (
        <>
          <li className="hidden text-white/45 sm:block">{hint}</li>
          <li className="text-white/45 sm:hidden">{touchHint}</li>
        </>
      )}
    </ul>
  );
}
