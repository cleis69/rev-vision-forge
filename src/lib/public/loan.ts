/* Credit simulator of the lot sheet: the monthly payment of a loan at a
   fixed rate, as banks quote it (insurance and fees left out). */

export type LoanInput = {
  price: number;
  /** Share paid without a loan, in % of the price. */
  downPayment: number;
  years: number;
  /** Yearly rate, in %. */
  rate: number;
};

export type LoanResult = { borrowed: number; monthly: number; totalInterest: number };

export function monthlyPayment({ price, downPayment, years, rate }: LoanInput): LoanResult {
  const borrowed = Math.max(0, price * (1 - Math.min(100, Math.max(0, downPayment)) / 100));
  const months = Math.max(1, Math.round(years * 12));
  const r = Math.max(0, rate) / 100 / 12;
  const monthly = r === 0 ? borrowed / months : (borrowed * r) / (1 - Math.pow(1 + r, -months));
  return { borrowed, monthly, totalInterest: monthly * months - borrowed };
}

/** Rate shown first, by currency (the visitor changes it). */
export const defaultRate = (currency: string) => (currency === "EUR" ? 3.5 : 5);

export const LOAN_YEARS = [10, 15, 20, 25] as const;
