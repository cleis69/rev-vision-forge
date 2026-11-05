import { useId, useState } from "react";
import { Calculator, ChevronDown } from "lucide-react";

import { useCopy } from "@/lib/i18n";
import { usePublicText } from "@/lib/public/i18n";
import { defaultRate, LOAN_YEARS, monthlyPayment } from "@/lib/public/loan";
import { cn } from "@/lib/utils";

/* Sheet of a lot with a price: what the buyer would pay each month, with
   their down payment, length and rate. An estimate, said as such. */

const COPY = {
  fr: {
    open: "Simuler mon crédit",
    downPayment: "Apport",
    years: "Durée",
    yearsValue: (n: number) => `${n} ans`,
    rate: "Taux annuel",
    monthly: "Mensualité estimée",
    perMonth: "/ mois",
    borrowed: (amount: string) => `Montant emprunté : ${amount}`,
    note: "Estimation indicative, hors assurance et frais de dossier.",
  },
  en: {
    open: "Estimate my mortgage",
    downPayment: "Down payment",
    years: "Length",
    yearsValue: (n: number) => `${n} years`,
    rate: "Yearly rate",
    monthly: "Estimated monthly payment",
    perMonth: "/ month",
    borrowed: (amount: string) => `Amount borrowed: ${amount}`,
    note: "Indicative estimate, excluding insurance and fees.",
  },
};

export function LoanSimulator({
  price,
  currency,
  large = false,
}: {
  price: number;
  currency: string;
  large?: boolean;
}) {
  const copy = useCopy(COPY);
  const text = usePublicText();
  const [open, setOpen] = useState(false);
  const [downPayment, setDownPayment] = useState(20);
  const [years, setYears] = useState<number>(20);
  const [rate, setRate] = useState(() => defaultRate(currency));
  const id = useId();
  const result = monthlyPayment({ price, downPayment, years, rate });

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
        <Calculator className="size-4 text-[color:var(--brand)]" aria-hidden />
        <span className="flex-1 font-medium">{copy.open}</span>
        <ChevronDown
          className={cn("size-4 text-white/50 transition-transform", open && "rotate-180")}
          aria-hidden
        />
      </button>
      {open ? (
        <div id={id} className={cn("space-y-4 border-t border-white/10", large ? "p-5" : "p-4")}>
          <label className="block">
            <span className="flex items-baseline justify-between text-xs text-white/60">
              {copy.downPayment}
              <span className="text-sm font-medium tabular-nums text-white">
                {downPayment} % · {text.price(Math.round((price * downPayment) / 100), currency)}
              </span>
            </span>
            <input
              type="range"
              min={0}
              max={60}
              step={5}
              value={downPayment}
              onChange={(e) => setDownPayment(Number(e.target.value))}
              className="mt-2 w-full accent-[color:var(--brand)]"
            />
          </label>
          <div>
            <p className="text-xs text-white/60">{copy.years}</p>
            <div role="group" aria-label={copy.years} className="mt-2 flex gap-1.5">
              {LOAN_YEARS.map((y) => (
                <button
                  key={y}
                  type="button"
                  aria-pressed={years === y}
                  onClick={() => setYears(y)}
                  className={cn(
                    "h-8 flex-1 rounded-full border text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70",
                    years === y
                      ? "border-white bg-white text-black"
                      : "border-white/15 text-white/75 hover:border-white/35",
                  )}
                >
                  {copy.yearsValue(y)}
                </button>
              ))}
            </div>
          </div>
          <label className="flex items-center justify-between gap-3 text-xs text-white/60">
            {copy.rate}
            <span className="flex items-center gap-1.5">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                max={15}
                step={0.1}
                value={rate}
                onChange={(e) => {
                  const value = Number(e.target.value.replace(",", "."));
                  if (Number.isFinite(value)) setRate(Math.min(15, Math.max(0, value)));
                }}
                className="h-8 w-20 rounded-full border border-white/15 bg-transparent px-3 text-right text-sm tabular-nums text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
              />
              %
            </span>
          </label>
          <div className="rounded-xl bg-white/[0.05] p-4">
            <p className="text-xs text-white/60">{copy.monthly}</p>
            <p className="mt-1 font-brand text-2xl font-medium tabular-nums tracking-tight">
              {text.price(Math.round(result.monthly), currency)}{" "}
              <span className="text-sm text-white/55">{copy.perMonth}</span>
            </p>
            <p className="mt-1 text-xs text-white/55">
              {copy.borrowed(text.price(Math.round(result.borrowed), currency))}
            </p>
          </div>
          <p className="text-[11px] text-white/45">{copy.note}</p>
        </div>
      ) : null}
    </div>
  );
}
