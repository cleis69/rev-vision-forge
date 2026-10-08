import { csvNumber } from "@/lib/numbers";
import { parseCsv } from "@/lib/csv";
import type { TablesInsert } from "@/lib/supabase/database.types";
import {
  FIELD_LABELS,
  LOT_FIELDS,
  compareNumeros,
  fieldOfHeader,
  parseField,
  type Lot,
  type LotField,
  type LotValues,
} from "./lot-fields";
import { levelLabel } from "@/lib/views";

/* CSV import of lots: preview first (new, updated, unchanged or invalid
   rows), then one upsert by (project_id, numero). An empty cell keeps the
   current value; lots missing from the file are left alone. */

export const MAX_IMPORT_ROWS = 2000;

export type ImportRow = {
  /** Line in the file (the header is line 1). */
  line: number;
  numero: string;
  kind: "new" | "update" | "unchanged" | "error";
  /** Values read from the non-empty cells. */
  values: Partial<LotValues>;
  errors: string[];
};

export type ImportPreview =
  | { ok: false; error: string }
  | { ok: true; columns: LotField[]; ignored: string[]; rows: ImportRow[] };

const key = (numero: string) => numero.trim().toLowerCase();

export function previewImport(text: string, existing: readonly Lot[]): ImportPreview {
  const table = parseCsv(text);
  const [header, ...lines] = table;
  if (!header) return { ok: false, error: "Le fichier est vide." };

  const columns = new Map<LotField, number>();
  const ignored: string[] = [];
  header.forEach((cell, index) => {
    const field = fieldOfHeader(cell);
    if (field && !columns.has(field)) columns.set(field, index);
    else if (cell.trim()) ignored.push(field ? `${cell.trim()} (en double)` : cell.trim());
  });

  const numeroColumn = columns.get("numero");
  if (numeroColumn === undefined) {
    return {
      ok: false,
      error:
        "Colonne du numéro de lot introuvable. La première ligne doit contenir les en-têtes, par exemple « numero ».",
    };
  }
  if (lines.length === 0) return { ok: false, error: "Aucun lot sous la ligne des en-têtes." };
  if (lines.length > MAX_IMPORT_ROWS) {
    return {
      ok: false,
      error: `Le fichier contient ${lines.length} lots : ${MAX_IMPORT_ROWS} au maximum par import.`,
    };
  }

  const current = new Map(existing.map((lot) => [key(lot.numero), lot]));
  const seen = new Map<string, number>();

  const rows = lines.map((cells, index): ImportRow => {
    const line = index + 2;
    const errors: string[] = [];
    const values: Partial<LotValues> = {};
    const numeroCell = cells[numeroColumn] ?? "";

    for (const [field, column] of columns) {
      const cell = cells[column] ?? "";
      if (field !== "numero" && cell.trim() === "") continue;
      const result = parseField(field, cell);
      if (result.ok) Object.assign(values, { [field]: result.value });
      else
        errors.push(field === "numero" ? result.error : `${FIELD_LABELS[field]} : ${result.error}`);
    }

    const numero = numeroCell.trim();
    if (numero) {
      const first = seen.get(key(numero));
      if (first !== undefined) errors.push(`Numéro déjà présent ligne ${first}.`);
      else seen.set(key(numero), line);
    }

    const lot = current.get(key(numero));
    const kind: ImportRow["kind"] =
      errors.length > 0 ? "error" : !lot ? "new" : changes(lot, values) ? "update" : "unchanged";
    return { line, numero, kind, values, errors };
  });

  return { ok: true, columns: [...columns.keys()], ignored, rows };
}

function changes(lot: Lot, values: Partial<LotValues>) {
  return (Object.keys(values) as LotField[]).some((f) => f !== "numero" && values[f] !== lot[f]);
}

type LotRow = TablesInsert<"lots"> & LotValues & { project_id: string; sort_order: number };

/** Rows to upsert: every column is sent, the current values filling the empty cells. */
export function importRows(
  rows: readonly ImportRow[],
  existing: readonly Lot[],
  projectId: string,
): LotRow[] {
  const current = new Map(existing.map((lot) => [key(lot.numero), lot]));
  let nextSort = existing.reduce((max, lot) => Math.max(max, lot.sort_order), 0);

  return rows
    .filter((r) => r.kind === "new" || r.kind === "update")
    .sort((a, b) => compareNumeros(a.numero, b.numero))
    .map((row) => {
      const lot = current.get(key(row.numero));
      const base: LotValues = lot
        ? pickValues(lot)
        : {
            numero: row.numero,
            type: null,
            niveau: null,
            surface_habitable: null,
            surface_terrain: null,
            chambres: null,
            prix: null,
            statut: "disponible",
            description: null,
          };
      return {
        ...base,
        ...row.values,
        numero: lot?.numero ?? row.numero,
        project_id: projectId,
        sort_order: lot?.sort_order ?? ++nextSort,
      };
    });
}

const pickValues = (lot: Lot): LotValues =>
  Object.fromEntries(LOT_FIELDS.map((f) => [f, lot[f]])) as LotValues;

/* ------------------------------------------------------------------ export */

/** Same columns as the import, numbers with a decimal comma for French Excel. */
export function lotsToCsv(lots: readonly Lot[]): string[][] {
  const sorted = [...lots].sort((a, b) => compareNumeros(a.numero, b.numero));
  return [
    [...LOT_FIELDS],
    ...sorted.map((lot) => [
      lot.numero,
      lot.type ?? "",
      lot.niveau == null ? "" : levelLabel(lot.niveau),
      csvNumber(lot.surface_habitable),
      csvNumber(lot.surface_terrain),
      lot.chambres === null ? "" : String(lot.chambres),
      csvNumber(lot.prix),
      lot.statut,
      lot.description ?? "",
    ]),
  ];
}

export const CSV_TEMPLATE: string[][] = [
  [...LOT_FIELDS],
  [
    "1",
    "Villa",
    "RDC",
    "250",
    "600",
    "4",
    "1250000",
    "disponible",
    "Villa R+1 avec ascenseur et piscine privée",
  ],
  ["2", "Appartement", "R+2", "230,5", "", "4", "1180000", "reservee", ""],
];
