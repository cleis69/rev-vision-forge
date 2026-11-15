import { useState, type ReactNode } from "react";
import { BellRing, ChevronRight } from "lucide-react";

import { useCopy } from "@/lib/i18n";
import { usePublicText } from "@/lib/public/i18n";
import type { PublicLot } from "@/lib/public/programme";
import { cn } from "@/lib/utils";
import { priceLabel } from "./status";

/* Lot sheet of a reserved or sold lot: the visitor asks to be told when it is
   free again, and sees the available lots closest to it. */

const COPY = {
  fr: {
    notify: "Me prévenir s'il se libère",
    notifyTitle: (numero: string) => `Être prévenu pour le lot ${numero}`,
    others: "Disponibles et proches de ce lot",
    open: (numero: string) => `Voir le lot ${numero}`,
    bedrooms: (n: number) => `${n} ch.`,
  },
  en: {
    notify: "Tell me if it becomes available",
    notifyTitle: (numero: string) => `Be told about lot ${numero}`,
    others: "Available and close to this lot",
    open: (numero: string) => `See lot ${numero}`,
    bedrooms: (n: number) => `${n} bed`,
  },
};

export function LotUnavailable({
  lot,
  alternatives,
  currency,
  onPick,
  alertForm,
  large = false,
}: {
  lot: PublicLot;
  /** Available lots close to this one (see similarLots). */
  alternatives: PublicLot[];
  currency: string;
  onPick: ((lot: PublicLot) => void) | null;
  /** The form of the alert (a VisitForm of kind "alerte"); null where nobody can be told (sales office). */
  alertForm: ReactNode | null;
  large?: boolean;
}) {
  const copy = useCopy(COPY);
  const text = usePublicText();
  const [asking, setAsking] = useState(false);

  return (
    <div className="space-y-4">
      {alertForm ? (
        asking ? (
          <div className="rounded-[10px] border border-white/10 bg-white/[0.03] p-4">
            <p className="mb-4 flex items-center gap-2 text-sm font-medium">
              <BellRing className="size-4 text-[color:var(--brand)]" aria-hidden />
              {copy.notifyTitle(lot.numero)}
            </p>
            {alertForm}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setAsking(true)}
            className={cn(
              "inline-flex w-full items-center justify-center gap-2 rounded-[10px] border border-[color:var(--brand)] font-medium text-[color:var(--brand)] transition-colors hover:bg-[color:var(--brand)]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70",
              large ? "h-14 text-base" : "h-11 text-sm",
            )}
          >
            <BellRing className="size-4" aria-hidden />
            {copy.notify}
          </button>
        )
      ) : null}

      {alternatives.length > 0 ? (
        <div>
          <h3 className="text-xs font-medium text-white/50">{copy.others}</h3>
          <ul className="mt-3 space-y-2">
            {alternatives.map((other) => {
              const facts = [
                other.type,
                other.surface_habitable !== null
                  ? `${text.number(other.surface_habitable)} m²`
                  : null,
                other.chambres !== null ? copy.bedrooms(other.chambres) : null,
              ].filter(Boolean);
              const body = (
                <>
                  <span className="font-brand text-lg font-medium tabular-nums">
                    {other.numero}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs text-white/55">
                      {facts.join(" · ")}
                    </span>
                    <span className="block text-sm text-white">
                      {priceLabel(other, currency, text.locale)}
                    </span>
                  </span>
                  {onPick ? (
                    <ChevronRight className="size-4 shrink-0 text-white/40" aria-hidden />
                  ) : null}
                </>
              );
              return (
                <li key={other.id}>
                  {onPick ? (
                    <button
                      type="button"
                      onClick={() => onPick(other)}
                      aria-label={copy.open(other.numero)}
                      className="flex w-full items-center gap-3 rounded-[10px] border border-white/10 bg-white/[0.03] px-4 py-3 text-left transition-colors hover:border-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                    >
                      {body}
                    </button>
                  ) : (
                    <div className="flex items-center gap-3 rounded-[10px] border border-white/10 bg-white/[0.03] px-4 py-3">
                      {body}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
