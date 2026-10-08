// Unit tests of the CSV import of lots. Run with `bun test`.
import { describe, expect, test } from "bun:test";

import { decodeText, detectDelimiter, parseCsv, toCsv } from "../src/lib/csv";
import { parseDecimal, parseInteger } from "../src/lib/numbers";
import {
  compareNumeros,
  fieldOfHeader,
  nextNumero,
  parseStatus,
  type Lot,
} from "../src/lib/app/lot-fields";
import { importRows, lotsToCsv, previewImport } from "../src/lib/app/lot-import";

const lot = (numero: string, extra: Partial<Lot> = {}): Lot => ({
  id: `id-${numero}`,
  project_id: "p",
  created_at: "",
  updated_at: "",
  numero,
  type: "Villa",
  surface_habitable: 200,
  surface_terrain: 500,
  chambres: 4,
  prix: 1000000,
  statut: "disponible",
  description: null,
  features: [],
  sort_order: Number(numero) || 0,
  ...extra,
});

describe("nombres", () => {
  test.each([
    ["1 250 000", 1250000],
    ["1\u00a0250\u00a0000 €", 1250000],
    ["980 000,50", 980000.5],
    ["185,5 m²", 185.5],
    ["1.250.000", 1250000],
    ["1.250.000,75", 1250000.75],
    ["1,250,000.00", 1250000],
    ["250.5", 250.5],
    ["1 250 000 MAD", 1250000],
  ])("%s", (input, expected) => {
    expect(parseDecimal(input)).toEqual({ ok: true, value: expected });
  });

  test("vide, négatif, invalide, trop grand", () => {
    expect(parseDecimal("  ")).toEqual({ ok: true, value: null });
    expect(parseDecimal("-5").ok).toBe(false);
    expect(parseDecimal("1,2 M").ok).toBe(false);
    expect(parseDecimal("abc").ok).toBe(false);
    expect(parseDecimal("100000000", { max: 1e8 }).ok).toBe(false);
  });

  test("entiers", () => {
    expect(parseInteger("4")).toEqual({ ok: true, value: 4 });
    expect(parseInteger("")).toEqual({ ok: true, value: null });
    expect(parseInteger("3,5").ok).toBe(false);
    expect(parseInteger("101", { max: 100 }).ok).toBe(false);
  });
});

describe("CSV", () => {
  test("séparateur détecté hors guillemets", () => {
    expect(detectDelimiter("numero;prix\n1;2")).toBe(";");
    expect(detectDelimiter('numero,"prix; TTC"\n1,2')).toBe(",");
    expect(detectDelimiter("numero\tprix\n1\t2")).toBe("\t");
  });

  test("guillemets, retours à la ligne et lignes vides", () => {
    const text = 'numero;description\r\n1;"Vue ""mer""; piscine"\r\n\r\n2;"Sur\ndeux lignes"\r\n';
    expect(parseCsv(text)).toEqual([
      ["numero", "description"],
      ["1", 'Vue "mer"; piscine'],
      ["2", "Sur\ndeux lignes"],
    ]);
  });

  test("aller-retour", () => {
    const rows = [["a;b", 'c"d', "e\nf", ""]];
    expect(parseCsv(toCsv(rows).replace(/^\uFEFF/, ""), ";")).toEqual(rows);
  });

  test("Windows-1252 et BOM", () => {
    const latin1 = new Uint8Array([0x52, 0xe9, 0x73, 0x65, 0x72, 0x76, 0xe9, 0x65]); // "Réservée"
    expect(decodeText(latin1.buffer)).toBe("Réservée");
    const utf8 = new TextEncoder().encode("\uFEFFRéservée");
    expect(decodeText(utf8.buffer as ArrayBuffer)).toBe("Réservée");
  });
});

describe("champs", () => {
  test("en-têtes", () => {
    expect(fieldOfHeader("N°")).toBe("numero");
    expect(fieldOfHeader("Numéro du lot")).toBe("numero");
    expect(fieldOfHeader("Prix (€)")).toBe("prix");
    expect(fieldOfHeader("Surface habitable (m²)")).toBe("surface_habitable");
    expect(fieldOfHeader("Terrain m²")).toBe("surface_terrain");
    expect(fieldOfHeader("Statut")).toBe("statut");
    expect(fieldOfHeader("Couleur")).toBeUndefined();
  });

  test("statuts", () => {
    expect(parseStatus("Réservée")).toBe("reservee");
    expect(parseStatus("VENDU")).toBe("vendue");
    expect(parseStatus("dispo")).toBe("disponible");
    expect(parseStatus("")).toBeNull();
    expect(parseStatus("bientôt")).toBeUndefined();
  });

  test("ordre naturel et numéro suivant", () => {
    expect(["10", "2", "A10", "A2", "1"].sort(compareNumeros)).toEqual([
      "1",
      "2",
      "10",
      "A2",
      "A10",
    ]);
    expect(nextNumero([])).toBe("1");
    expect(nextNumero(["1", "2", "14"])).toBe("15");
    expect(nextNumero(["A1", "A2"])).toBe("A3");
    expect(nextNumero(["V01", "V09", "Parking"])).toBe("V10");
    expect(nextNumero(["1", "2", "V1"])).toBe("3");
    expect(nextNumero(["Parking"])).toBe("1");
  });
});

describe("import", () => {
  const existing = [lot("1"), lot("2", { prix: 900000 })];

  test("nouveaux, mises à jour, inchangés, erreurs", () => {
    const csv = [
      "N°;Type;Prix (€);Statut;Couleur",
      "1;Villa;1 000 000;disponible;bleu", // unchanged
      "2;;950 000;Réservée;", // update, empty type kept
      "3;Villa;1 100 000;;", // new, status defaults to disponible
      "4;Villa;1,2 M;;", // invalid price
      ";Villa;;;", // missing number
      "3;Villa;;vendu;", // duplicate in file
      "5;Villa;;bientôt;", // unknown status
    ].join("\n");
    const preview = previewImport(csv, existing);
    if (!preview.ok) throw new Error(preview.error);
    expect(preview.ignored).toEqual(["Couleur"]);
    expect(preview.rows.map((r) => [r.line, r.kind])).toEqual([
      [2, "unchanged"],
      [3, "update"],
      [4, "new"],
      [5, "error"],
      [6, "error"],
      [7, "error"],
      [8, "error"],
    ]);
    expect(preview.rows[3]?.errors[0]).toContain("Prix");
    expect(preview.rows[5]?.errors[0]).toContain("ligne 4");

    const rows = importRows(preview.rows, existing, "p");
    expect(rows.map((r) => r.numero)).toEqual(["2", "3"]);
    expect(rows[0]).toMatchObject({
      numero: "2",
      type: "Villa",
      prix: 950000,
      statut: "reservee",
      chambres: 4,
      sort_order: 2,
    });
    expect(rows[1]).toMatchObject({
      numero: "3",
      type: "Villa",
      prix: 1100000,
      statut: "disponible",
      chambres: null,
      sort_order: 3,
    });
  });

  test("le numéro existant garde sa casse", () => {
    const preview = previewImport("numero;prix\na1;5", [lot("A1")]);
    if (!preview.ok) throw new Error(preview.error);
    expect(importRows(preview.rows, [lot("A1")], "p")[0]?.numero).toBe("A1");
  });

  test("fichiers refusés", () => {
    expect(previewImport("", existing).ok).toBe(false);
    expect(previewImport("type;prix\nVilla;5", existing).ok).toBe(false);
    expect(previewImport("numero;prix", existing).ok).toBe(false);
  });

  test("l'export se réimporte sans changement", () => {
    const csv = toCsv(lotsToCsv(existing)).replace(/^\uFEFF/, "");
    const preview = previewImport(csv, existing);
    if (!preview.ok) throw new Error(preview.error);
    expect(preview.rows.every((r) => r.kind === "unchanged")).toBe(true);
  });
});
