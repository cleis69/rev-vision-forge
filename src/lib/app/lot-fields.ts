import { parseDecimal, parseInteger, type Parsed } from "@/lib/numbers";
import type { Enums, Tables } from "@/lib/supabase/database.types";

/* Fields of a lot: labels, limits (same as the database) and how a typed or
   imported value is read. Shared by the table, the details panel and the CSV import. */

export type Lot = Tables<"lots">;
export type LotStatus = Enums<"lot_status">;

export const LOT_STATUSES: readonly LotStatus[] = ["disponible", "reservee", "vendue"];

export const STATUS_LABELS: Record<LotStatus, string> = {
  disponible: "Disponible",
  reservee: "Réservé",
  vendue: "Vendu",
};

export const LOT_TYPES = [
  "Villa",
  "Appartement",
  "Maison",
  "Duplex",
  "Penthouse",
  "Terrain",
  "Commerce",
  "Bureau",
];

/** Fields that can be typed in a cell or imported, in the order of the CSV file. */
export const LOT_FIELDS = [
  "numero",
  "type",
  "surface_habitable",
  "surface_terrain",
  "chambres",
  "prix",
  "statut",
  "description",
] as const;
export type LotField = (typeof LOT_FIELDS)[number];
export type LotValues = Pick<Lot, LotField>;

export const FIELD_LABELS: Record<LotField, string> = {
  numero: "N°",
  type: "Type",
  surface_habitable: "Surface habitable",
  surface_terrain: "Terrain",
  chambres: "Chambres",
  prix: "Prix",
  statut: "Statut",
  description: "Description",
};

const fold = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

/** "Réservée", "RESERVE", "réservé" → reservee. */
export function parseStatus(input: string): LotStatus | null | undefined {
  const s = fold(input);
  if (s === "") return null;
  if (["disponible", "dispo", "libre", "available"].includes(s)) return "disponible";
  if (["reservee", "reserve", "reservation", "option", "reserved"].includes(s)) return "reservee";
  if (["vendue", "vendu", "sold", "vente"].includes(s)) return "vendue";
  return undefined;
}

const HEADER_ALIASES: Record<LotField, string[]> = {
  numero: [
    "numero",
    "n",
    "no",
    "num",
    "lot",
    "n lot",
    "numero lot",
    "numero du lot",
    "n du lot",
    "reference",
    "ref",
  ],
  type: ["type", "typologie", "type de lot"],
  surface_habitable: [
    "surface habitable",
    "surface",
    "habitable",
    "shab",
    "surface m",
    "surface m2",
    "surface habitable m",
    "surface habitable m2",
  ],
  surface_terrain: [
    "surface terrain",
    "terrain",
    "terrain m",
    "terrain m2",
    "surface du terrain",
    "parcelle",
  ],
  chambres: ["chambres", "chambre", "nb chambres", "nombre de chambres", "ch"],
  prix: ["prix", "prix eur", "prix ttc", "prix de vente", "tarif"],
  statut: ["statut", "status", "etat", "disponibilite"],
  description: ["description", "descriptif", "commentaire", "remarques"],
};

/** Field of a column header ("N°", "Prix (€)", "Surface habitable (m²)"…), if any. */
export function fieldOfHeader(header: string): LotField | undefined {
  const h = fold(header.replace(/\(.*?\)/g, " "));
  return LOT_FIELDS.find((f) => HEADER_ALIASES[f].includes(h));
}

/** Natural order of lot numbers: 2 before 10, A2 before A10. */
export const compareNumeros = new Intl.Collator("fr", { numeric: true, sensitivity: "base" })
  .compare;

/** "V12" → { prefix: "V", number: 12, width: 2 }; null without a trailing number. */
export function splitNumero(
  numero: string,
): { prefix: string; number: number; width: number } | null {
  const match = /^(.*?)(\d+)$/.exec(numero.trim());
  if (!match) return null;
  const digits = match[2] ?? "";
  return { prefix: match[1] ?? "", number: Number(digits), width: digits.length };
}

/** Number that follows the lots' numbering: 14 → 15, V3 → V4, A09 → A10. */
export function nextNumero(existing: readonly string[]): string {
  const taken = new Set(existing.map((n) => n.trim().toLowerCase()));
  const series = new Map<string, { count: number; max: number; width: number }>();
  for (const numero of existing) {
    const parts = splitNumero(numero);
    if (!parts) continue;
    const s = series.get(parts.prefix) ?? { count: 0, max: -1, width: 1 };
    s.count++;
    if (parts.number > s.max) {
      s.max = parts.number;
      s.width = parts.width;
    }
    series.set(parts.prefix, s);
  }
  // The most used prefix wins ("V" when the lots are V1, V2, V3).
  const [prefix, s] = [...series].sort((a, b) => b[1].count - a[1].count)[0] ?? [
    "",
    { count: 0, max: 0, width: 1 },
  ];
  const make = (n: number) => prefix + String(n).padStart(s.width, "0");
  let next = s.max + 1;
  while (taken.has(make(next).toLowerCase())) next++;
  return make(next);
}

export type FieldResult<F extends LotField> =
  { ok: true; value: LotValues[F] } | { ok: false; error: string };

/** Reads a typed or imported value of a field. Empty gives null, except for the number and the status. */
export function parseField<F extends LotField>(field: F, input: string): FieldResult<F> {
  const s = input.trim();
  const ok = (value: unknown) => ({ ok: true, value }) as FieldResult<F>;
  const fail = (error: string) => ({ ok: false, error }) as FieldResult<F>;
  const num = (r: Parsed) => (r.ok ? ok(r.value) : fail(r.error));

  switch (field) {
    case "numero":
      if (s === "") return fail("Le numéro est obligatoire.");
      return s.length > 40 ? fail("40 caractères au maximum.") : ok(s);
    case "type":
      return s.length > 60 ? fail("60 caractères au maximum.") : ok(s || null);
    case "description":
      return s.length > 4000 ? fail("4 000 caractères au maximum.") : ok(s || null);
    case "surface_habitable":
    case "surface_terrain":
      return num(parseDecimal(s, { max: 1e8 }));
    case "prix":
      return num(parseDecimal(s, { max: 1e12 }));
    case "chambres":
      return num(parseInteger(s, { max: 100 }));
    case "statut": {
      const status = parseStatus(s);
      if (status === undefined) return fail("Valeur inconnue (disponible, réservé ou vendu).");
      return ok(status ?? "disponible");
    }
    default:
      return fail("Champ inconnu.");
  }
}

/** Value shown in an input to edit a field. */
export function fieldInput(field: LotField, value: LotValues[LotField]): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "number")
    return field === "chambres" ? String(value) : String(value).replace(".", ",");
  return String(value);
}
