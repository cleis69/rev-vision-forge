/* Numbers typed by people or found in spreadsheets, French style first:
   "1 250 000", "980 000,50 €", "185,5 m²", "1.250.000", "1,250,000.00". */

export type Parsed = { ok: true; value: number | null } | { ok: false; error: string };

const NOISE = /[\s\u00a0\u202f'€$]|eur|mad|usd|dhs?|m²|m2/gi;

/** Decimal number ≥ 0 with at most 2 decimals; empty input gives null. */
export function parseDecimal(input: string, { max = 1e12 }: { max?: number } = {}): Parsed {
  let s = input.trim().replace(NOISE, "");
  if (s === "") return { ok: true, value: null };
  if (s.startsWith("-")) return { ok: false, error: "Le nombre doit être positif." };

  const lastComma = s.lastIndexOf(",");
  const lastDot = s.lastIndexOf(".");
  if (lastComma >= 0 && lastDot >= 0) {
    // Both present: the rightmost one is the decimal separator.
    const decimal = lastComma > lastDot ? "," : ".";
    const thousands = decimal === "," ? "." : ",";
    s = s.split(thousands).join("").replace(decimal, ".");
  } else if (lastComma >= 0) {
    s = s.split(",").length > 2 ? s.split(",").join("") : s.replace(",", ".");
  } else if (lastDot >= 0 && s.split(".").length > 2) {
    s = s.split(".").join("");
  }

  if (!/^\d+(\.\d+)?$/.test(s)) return { ok: false, error: "Nombre invalide." };
  const value = Math.round(Number(s) * 100) / 100;
  if (!Number.isFinite(value) || value >= max) return { ok: false, error: "Nombre trop grand." };
  return { ok: true, value };
}

/** Whole number ≥ 0; empty input gives null. */
export function parseInteger(input: string, { max = 1000 }: { max?: number } = {}): Parsed {
  const s = input.trim().replace(/[\s\u00a0\u202f]/g, "");
  if (s === "") return { ok: true, value: null };
  if (!/^\d+$/.test(s)) return { ok: false, error: "Nombre entier attendu." };
  const value = Number(s);
  if (value > max) return { ok: false, error: "Nombre trop grand." };
  return { ok: true, value };
}

/** "1250000.5" for CSV files opened in a French Excel: decimal comma, no thousands separator. */
export function csvNumber(value: number | null): string {
  return value === null ? "" : String(value).replace(".", ",");
}
