import { useId, useState } from "react";
import { ChevronDown, Wallet } from "lucide-react";

import { useCopy } from "@/lib/i18n";
import { planTotal, stepAmounts, type PaymentStep } from "@/lib/payment-plan";
import { usePublicText } from "@/lib/public/i18n";
import { cn } from "@/lib/utils";

/* Lot sheet: how the buyer pays, step by step, with the amount of each step
   when the price is shown. The promoter writes the steps and the note. */

const COPY = {
  fr: {
    open: "Comment payer",
    first: (percent: string, label: string) => `${percent} % ${label.toLowerCase()}`,
    step: (n: number) => `Étape ${n}`,
  },
  en: {
    open: "How to pay",
    first: (percent: string, label: string) => `${percent}% · ${label}`,
    step: (n: number) => `Step ${n}`,
  },
};

export function PaymentPlan({
  plan,
  note,
  price,
  currency,
  large = false,
}: {
  plan: readonly PaymentStep[];
  note: string | null;
  /** Price of the lot (null when hidden): the shares only. */
  price: number | null;
  currency: string;
  large?: boolean;
}) {
  const copy = useCopy(COPY);
  const text = usePublicText();
  const [open, setOpen] = useState(false);
  const id = useId();
  if (plan.length === 0) return null;
  const amounts = price !== null && planTotal(plan) > 0 ? stepAmounts(price, plan) : null;
  const percent = (p: number) => text.number(p);
  const first = plan[0] as PaymentStep;

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
        <Wallet className="size-4 shrink-0 text-[color:var(--brand)]" aria-hidden />
        <span className="min-w-0 flex-1">
          <span className="block font-medium">{copy.open}</span>
          {!open ? (
            <span className="mt-0.5 block truncate text-xs text-white/55">
              {copy.first(percent(first.percent), first.label)}
              {amounts ? ` · ${text.price(amounts[0] as number, currency)}` : ""}
            </span>
          ) : null}
        </span>
        <ChevronDown
          className={cn("size-4 shrink-0 text-white/50 transition-transform", open && "rotate-180")}
          aria-hidden
        />
      </button>
      {open ? (
        <div id={id} className={cn("border-t border-white/10", large ? "p-5" : "p-4")}>
          <ol className="relative space-y-3">
            {plan.map((s, i) => (
              <li key={`${i}-${s.label}`} className="flex items-baseline gap-3">
                <span
                  aria-hidden
                  className="mt-1 size-2 shrink-0 self-start rounded-full bg-[color:var(--brand)]"
                />
                <span className="min-w-0 flex-1">
                  <span className="sr-only">{copy.step(i + 1)} · </span>
                  <span className={cn("text-white/85", large ? "text-base" : "text-sm")}>
                    {s.label}
                  </span>
                </span>
                <span className="shrink-0 text-right tabular-nums">
                  <span className={cn("font-medium text-white", large ? "text-base" : "text-sm")}>
                    {percent(s.percent)} %
                  </span>
                  {amounts ? (
                    <span className="block text-xs text-white/55">
                      {text.price(amounts[i] as number, currency)}
                    </span>
                  ) : null}
                </span>
              </li>
            ))}
          </ol>
          {note ? <p className="mt-4 text-[11px] leading-relaxed text-white/50">{note}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
