import { levelLabel } from "@/lib/views";
import { STATUS_LABELS, type LotField, type LotValues } from "./lot-fields";

const decimal = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 });
const prices = new Map<string, Intl.NumberFormat>();

/** Price in French (1 250 000 €), or in British English (€1,250,000) on the English pages. */
export function formatPrice(value: number, currency: string, locale: "fr" | "en" = "fr"): string {
  const key = `${locale}:${currency}`;
  let format = prices.get(key);
  if (!format) {
    try {
      format = new Intl.NumberFormat(locale === "en" ? "en-GB" : "fr-FR", {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
        minimumFractionDigits: 0,
      });
    } catch {
      format = decimal;
    }
    prices.set(key, format);
  }
  return format.format(value);
}

/** Value of a field as shown in the table; null when empty. */
export function formatField(
  field: LotField,
  values: Partial<LotValues>,
  currency: string,
): string | null {
  const value = values[field];
  if (value === null || value === undefined || value === "") return null;
  switch (field) {
    case "surface_habitable":
    case "surface_terrain":
      return `${decimal.format(Number(value))} m²`;
    case "prix":
      return formatPrice(Number(value), currency);
    case "chambres":
    case "salles_de_bain":
      return String(value);
    case "niveau":
      return levelLabel(Number(value));
    case "statut":
      return STATUS_LABELS[value as LotValues["statut"]];
    default:
      return String(value);
  }
}

/** "Villa · 250 m² · 4 ch. · 1 250 000 € · Réservé", for the import preview. */
export function summarize(values: Partial<LotValues>, currency: string): string {
  const parts: string[] = [];
  const type = formatField("type", values, currency);
  const surface = formatField("surface_habitable", values, currency);
  const terrain = formatField("surface_terrain", values, currency);
  const rooms = formatField("chambres", values, currency);
  const baths = formatField("salles_de_bain", values, currency);
  const price = formatField("prix", values, currency);
  const status = formatField("statut", values, currency);
  if (type) parts.push(type);
  if (surface) parts.push(surface);
  if (terrain) parts.push(`terrain ${terrain}`);
  if (rooms) parts.push(`${rooms} ch.`);
  if (baths) parts.push(`${baths} sdb`);
  if (price) parts.push(price);
  if (status) parts.push(status);
  return parts.join(" · ");
}
