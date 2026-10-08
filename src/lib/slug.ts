import { z } from "zod";

/** Same rule as the database: lowercase letters and digits, single hyphens inside. */
export const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** "Villas d'Été — Marrakech" → "villas-d-ete-marrakech". */
export function slugify(value: string, max = 80): string {
  return value
    .replace(/[œŒ]/g, "oe")
    .replace(/[æÆ]/g, "ae")
    .replace(/ß/g, "ss")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, max)
    .replace(/-+$/, "");
}

export const slugSchema = (max: number) =>
  z
    .string()
    .trim()
    .min(1, "Indiquez une adresse.")
    .max(max, `${max} caractères au maximum.`)
    .regex(
      SLUG_PATTERN,
      "Lettres minuscules, chiffres et tirets uniquement, sans tiret au début ni à la fin.",
    );
