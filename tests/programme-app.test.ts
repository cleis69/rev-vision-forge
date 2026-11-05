// Unit tests of the programme page as an application: its tabs and the list of the lots. Run with `bun test`.
import { describe, expect, test } from "bun:test";

import { firstTab, tabOfHash } from "../src/lib/public/app-tabs";
import { filterLots, focusOfType, lotsOfView, sortLots } from "../src/lib/public/lot-list";
import type { PublicLot } from "../src/lib/public/programme";

const lot = (numero: string, more: Partial<PublicLot> = {}): PublicLot => ({
  id: `id-${numero}`,
  numero,
  type: "Villa A",
  surface_habitable: null,
  surface_terrain: null,
  chambres: null,
  salles_de_bain: null,
  prix: null,
  statut: "disponible",
  description: null,
  features: [],
  niveau: null,
  ...more,
});

describe("onglets de la page", () => {
  const all = ["plan", "lots", "galerie", "programme"] as const;

  test("l'adresse ouvre l'onglet, les anciennes ancres aussi", () => {
    expect(tabOfHash("#galerie", all)).toEqual({ tab: "galerie", visit: false });
    expect(tabOfHash("#photos", all)).toEqual({ tab: "galerie", visit: false });
    expect(tabOfHash("#prestations", all)).toEqual({ tab: "programme", visit: false });
    expect(tabOfHash("#3D", all)).toEqual({ tab: "plan", visit: false });
  });

  test("un onglet que la page n'a pas, ou rien : aucun", () => {
    expect(tabOfHash("#situation", all)).toEqual({ tab: null, visit: false });
    expect(tabOfHash("", all)).toEqual({ tab: null, visit: false });
    expect(tabOfHash("#%E0%A4%A", all)).toEqual({ tab: null, visit: false });
  });

  test("#visite demande le formulaire de visite", () => {
    expect(tabOfHash("#visite", all)).toEqual({ tab: null, visit: true });
  });

  test("premier onglet : la vue 3D s'il y en a une, sinon le programme", () => {
    expect(firstTab(all)).toBe("plan");
    expect(firstTab(["lots", "programme"])).toBe("programme");
  });
});

describe("liste des lots", () => {
  const lots = [
    lot("1", { prix: 900, surface_habitable: 200, niveau: 0 }),
    lot("2", { prix: null, surface_habitable: 300, statut: "reservee", type: "Villa B" }),
    lot("3", { prix: 500, surface_habitable: null, statut: "vendue", niveau: 1 }),
  ];

  test("tri : prix croissant ou décroissant, surface ; les valeurs manquantes à la fin", () => {
    expect(sortLots(lots, "prix-asc").map((l) => l.numero)).toEqual(["3", "1", "2"]);
    expect(sortLots(lots, "prix-desc").map((l) => l.numero)).toEqual(["1", "3", "2"]);
    expect(sortLots(lots, "surface").map((l) => l.numero)).toEqual(["2", "1", "3"]);
    expect(sortLots(lots, "numero")).not.toBe(lots);
  });

  test("filtres : statut, type, niveau", () => {
    expect(filterLots(lots, { status: "reservee", type: null }).map((l) => l.numero)).toEqual([
      "2",
    ]);
    expect(filterLots(lots, { status: null, type: "villa a" }).map((l) => l.numero)).toEqual([
      "1",
      "3",
    ]);
    expect(filterLots(lots, { status: null, type: null, level: 1 }).map((l) => l.numero)).toEqual([
      "3",
    ]);
  });

  test("à côté d'une vue : ses lots, ou tous quand elle n'en montre aucun", () => {
    expect(lotsOfView(lots, { lots: new Set(["id-2"]) }).map((l) => l.numero)).toEqual(["2"]);
    expect(lotsOfView(lots, { lots: new Set() })).toHaveLength(3);
    expect(lotsOfView(lots, null)).toHaveLength(3);
  });

  test("un type choisi éclaire ses lots sur la vue 3D", () => {
    expect(focusOfType(lots, null)).toBeNull();
    expect([...(focusOfType(lots, "Villa B") ?? [])]).toEqual(["id-2"]);
  });
});
