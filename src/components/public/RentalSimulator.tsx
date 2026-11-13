import { useId, useState } from "react";
import { ChevronDown, TrendingUp } from "lucide-react";

import { useCopy } from "@/lib/i18n";
import type { Rental } from "@/lib/payment-plan";
import { usePublicText } from "@/lib/public/i18n";
import { DEFAULT_CHARGES, DEFAULT_OCCUPANCY, rentalYield } from "@/lib/public/rental";
import { cn } from "@/lib/utils";

/* Lot sheet of a lot with a price, when the promoter gave a rate per night:
   what the buyer would earn renting it out. The buyer changes the rate, the
   occupancy and the charges; an estimate, said as such. */

const COPY = {
  fr: {
    open: "Simuler ma rentabilité",
    nightly: "Loyer par nuit",
    occupancy: "Taux d'occupation",
    nights: (n: number) => `${n} nuits par an`,
    charges: "Charges et gestion",
    ofRents: "des loyers",
    netYield: "Rendement net estimé",
    perYear: (amount: string) => `${amount} nets par an`,
    gross: (amount: string, rate: string) => `Loyers bruts : ${amount} (${rate} %)`,
    note: "Estimation indicative, avant impôts et crédit.",
  },
  en: {
    open: "Estimate my rental yield",
    nightly: "Rent per night",
    occupancy: "Occupancy",
    nights: (n: number) => `${n} nights a year`,
    charges: "Charges and management",
    ofRents: "of the rents",
    netYield: "Estimated net yield",
    perYear: (amount: string) => `${amount} net a year`,
    gross: (amount: string, rate: string) => `Gross rents: ${amount} (${rate}%)`,
    note: "Indicative estimate, before taxes and loan.",
  },
};

export function RentalSimulator({
  price,
  currency,
  rental,
  large = false,
}: {
  price: number;
  currency: string;
  /** The promoter's starting values (a rate per night set). */
  rental: Rental & { nightly: number };
  large?: boolean;
}) {
  const copy = useCopy(COPY);
  const text = usePublicText();
  const [open, setOpen] = useState(false);
  const [nightly, setNightly] = useState(rental.nightly);
  const [occupancy, setOccupancy] = useState(rental.occupancy ?? DEFAULT_OCCUPANCY);
  const [charges, setCharges] = useState(rental.charges ?? DEFAULT_CHARGES);
  const id = useId();
  const result = rentalYield({ price, nightly, occupancy, charges });
  const rate = (r: number) => text.number(r);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03]">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={id}
        className={cn(
          "flex w-full items-center gap-3 rounded-2xl text-left transition-colors hover:bg-white/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70",
          large ? "px-5 py-4 text-base" : "px-4 py-3 text-sm",
        )}
      >
        <TrendingUp className="size-4 shrink-0 text-[color:var(--brand)]" aria-hidden />
        <span className="flex-1 font-medium">{copy.open}</span>
        {!open ? (
          <span className="shrink-0 text-xs tabular-nums text-white/55">
            {rate(result.netYield)} %
          </span>
        ) : null}
        <ChevronDown
          className={cn("size-4 shrink-0 text-white/50 transition-transform", open && "rotate-180")}
          aria-hidden
        />
      </button>
      {open ? (
        <div id={id} className={cn("space-y-4 border-t border-white/10", large ? "p-5" : "p-4")}>
          <label className="flex items-center justify-between gap-3 text-xs text-white/60">
            {copy.nightly}
            <span className="flex items-center gap-1.5">
              <input
                type="number"
                inputMode="decimal"
                min={1}
                step={50}
                value={nightly}
                onChange={(e) => {
                  const value = Number(e.target.value.replace(",", "."));
                  if (Number.isFinite(value) && value >= 0) setNightly(Math.min(1e7, value));
                }}
                className="h-8 w-28 rounded-full border border-white/15 bg-transparent px-3 text-right text-sm tabular-nums text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
              />
              {currency}
            </span>
          </label>
          <label className="block">
            <span className="flex items-baseline justify-between text-xs text-white/60">
              {copy.occupancy}
              <span className="text-sm font-medium tabular-nums text-white">
                {occupancy} % · {copy.nights(result.nights)}
              </span>
            </span>
            <input
              type="range"
              min={10}
              max={95}
              step={5}
              value={occupancy}
              onChange={(e) => setOccupancy(Number(e.target.value))}
              className="mt-2 w-full accent-[color:var(--brand)]"
            />
          </label>
          <label className="block">
            <span className="flex items-baseline justify-between text-xs text-white/60">
              {copy.charges}
              <span className="text-sm font-medium tabular-nums text-white">
                {charges} % {copy.ofRents}
              </span>
            </span>
            <input
              type="range"
              min={0}
              max={60}
              step={5}
              value={charges}
              onChange={(e) => setCharges(Number(e.target.value))}
              className="mt-2 w-full accent-[color:var(--brand)]"
            />
          </label>
          <div className="rounded-xl bg-white/[0.05] p-4">
            <p className="text-xs text-white/60">{copy.netYield}</p>
            <p className="mt-1 font-brand text-2xl font-medium tabular-nums tracking-tight">
              {rate(result.netYield)} %
            </p>
            <p className="mt-1 text-xs text-white/55">
              {copy.perYear(text.price(Math.round(result.net), currency))}
            </p>
            <p className="mt-0.5 text-xs text-white/45">
              {copy.gross(text.price(Math.round(result.gross), currency), rate(result.grossYield))}
            </p>
          </div>
          <p className="text-[11px] text-white/45">{copy.note}</p>
        </div>
      ) : null}
    </div>
  );
}
