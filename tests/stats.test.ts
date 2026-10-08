// Unit tests of the statistics tab: trends, conversion, rows per lot, CSV. Run with `bun test`.
import { describe, expect, test } from "bun:test";

import type { Lot } from "../src/lib/app/lot-fields";
import { conversion, lotRows, lotStatsCsv, trend } from "../src/lib/app/stats";

describe("tendance", () => {
  test("hausse, baisse, stable", () => {
    expect(trend(112, 100)).toEqual({ kind: "up", percent: 12 });
    expect(trend(80, 100)).toEqual({ kind: "down", percent: 20 });
    expect(trend(100, 100)).toEqual({ kind: "same" });
    expect(trend(1001, 1000)).toEqual({ kind: "same" });
  });

  test("sans période précédente", () => {
    expect(trend(5, 0)).toEqual({ kind: "new" });
    expect(trend(0, 0)).toEqual({ kind: "none" });
    expect(trend(0, 4)).toEqual({ kind: "down", percent: 100 });
  });

  test("taux de demandes", () => {
    expect(conversion(3, 120)).toBe(2.5);
    expect(conversion(1, 3)).toBe(33.3);
    expect(conversion(0, 50)).toBe(0);
    expect(conversion(2, 0)).toBeNull();
  });
});

const lot = (id: string, numero: string, statut: Lot["statut"] = "disponible") =>
  ({ id, numero, type: "Villa", statut }) as Lot;
const lots = [lot("a", "1"), lot("b", "2", "vendue"), lot("c", "10"), lot("d", "3")];
const counts = [
  { lot_id: "c", vues: 12, clics: 4, partages: 1, demandes: 0 },
  { lot_id: "a", vues: 12, clics: 9, partages: 0, visites_360: 3, demandes: 2 },
  { lot_id: "b", vues: 3, clics: 1, partages: 0, demandes: 0 },
  // A lot deleted since: ignored.
  { lot_id: "z", vues: 40, clics: 0, partages: 0, demandes: 0 },
];

describe("par lot", () => {
  test("tous les lots, du plus vu au moins vu", () => {
    const rows = lotRows(lots, counts);
    expect(rows.map((r) => r.numero)).toEqual(["1", "10", "2", "3"]);
    expect(rows[3]).toMatchObject({
      numero: "3",
      vues: 0,
      clics: 0,
      partages: 0,
      visites_360: 0,
      demandes: 0,
    });
  });

  test("tri par colonne", () => {
    expect(lotRows(lots, counts, "clics").map((r) => r.numero)).toEqual(["1", "10", "2", "3"]);
    expect(lotRows(lots, counts, "partages").map((r) => r.numero)).toEqual(["10", "1", "2", "3"]);
    expect(lotRows(lots, counts, "numero").map((r) => r.numero)).toEqual(["1", "2", "3", "10"]);
  });

  test("export CSV", () => {
    const csv = lotStatsCsv(lotRows(lots, counts));
    expect(csv[0]).toEqual([
      "lot",
      "type",
      "statut",
      "vues_fiche",
      "clics_plan",
      "partages",
      "visites_360",
      "demandes",
    ]);
    // Counts read before step 16 have no 360° tours: 0.
    expect(csv[1]).toEqual(["1", "Villa", "Disponible", "12", "9", "0", "3", "2"]);
    expect(csv[3]).toEqual(["2", "Villa", "Vendu", "3", "1", "0", "0", "0"]);
    expect(csv).toHaveLength(5);
  });
});
