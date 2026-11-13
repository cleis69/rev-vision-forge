/* How a buyer pays a lot (projects.payment_plan): steps written by the
   promoter, each with its share of the price, often following the works in
   an off-plan sale; and the rental values that start the yield simulator of
   the lot sheets (projects.rental). Same limits as the database. */

export type PaymentStep = { label: string; percent: number };
/** Starting values of the yield simulator; it shows when a rate per night is set. */
export type Rental = { nightly: number | null; occupancy: number | null; charges: number | null };

export const MAX_PAYMENT_STEPS = 12;
export const MAX_PAYMENT_LABEL = 80;
export const MAX_PAYMENT_NOTE = 300;
export const NO_RENTAL: Rental = { nightly: null, occupancy: null, charges: null };

/** A plan to start from: the instalments follow the works. */
export const PAYMENT_TEMPLATE: readonly PaymentStep[] = [
  { label: "À la réservation", percent: 30 },
  { label: "Fondations achevées", percent: 20 },
  { label: "Gros œuvre achevé", percent: 20 },
  { label: "Finitions achevées", percent: 20 },
  { label: "Remise des clés", percent: 10 },
];

const isNumber = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);

export function parsePaymentPlan(value: unknown): PaymentStep[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((s): PaymentStep[] => {
    if (!s || typeof s !== "object") return [];
    const { label, percent } = s as Record<string, unknown>;
    if (typeof label !== "string" || !label.trim() || !isNumber(percent)) return [];
    if (percent <= 0 || percent > 100) return [];
    return [{ label: label.trim(), percent }];
  });
}

export function parseRental(value: unknown): Rental {
  if (!value || typeof value !== "object" || Array.isArray(value)) return NO_RENTAL;
  const { nightly, occupancy, charges } = value as Record<string, unknown>;
  return {
    nightly: isNumber(nightly) && nightly > 0 ? nightly : null,
    occupancy: isNumber(occupancy) && occupancy >= 0 && occupancy <= 100 ? occupancy : null,
    charges: isNumber(charges) && charges >= 0 && charges <= 90 ? charges : null,
  };
}

/** Total of the shares, rounded to the hundredth (100 when the plan is complete). */
export const planTotal = (plan: readonly PaymentStep[]) =>
  Math.round(plan.reduce((sum, s) => sum + s.percent, 0) * 100) / 100;

/**
 * Amount of each step for a price, rounded to the unit; the last step takes
 * what rounding left, so that the amounts add up to the price when the plan
 * makes 100 %.
 */
export function stepAmounts(price: number, plan: readonly PaymentStep[]): number[] {
  const amounts = plan.map((s) => Math.round((price * s.percent) / 100));
  if (plan.length > 0 && planTotal(plan) === 100) {
    const others = amounts.slice(0, -1).reduce((sum, a) => sum + a, 0);
    amounts[amounts.length - 1] = Math.round(price) - others;
  }
  return amounts;
}
