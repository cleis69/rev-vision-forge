// Unit tests of the Aperçu tab: sales by status and type, checks of the page. Run with `bun test`.
import { describe, expect, test } from "bun:test";

import type { Lot } from "../src/lib/app/lot-fields";
import { pageChecks, percentOf, salesSummary, timeAgo } from "../src/lib/app/overview";

const lot = (id: string, type: string | null, statut: Lot["statut"], prix: number | null = null) =>
  ({ id, numero: id, type, statut, prix }) as Lot;

describe("commercialisation", () => {
  const lots = [
    lot("A1", "Villa A", "vendue", 9_000_000),
    lot("A2", "villa  a", "reservee", 8_500_000),
    lot("B1", "Villa B", "disponible", 8_000_000),
    lot("B2", "Villa B", "disponible"),
    lot("X", null, "vendue"),
  ];

  test("lots et montants par statut", () => {
    const s = salesSummary(lots, []);
    expect(s.total).toBe(5);
    expect(s.counts).toEqual({ disponible: 2, reservee: 1, vendue: 2 });
    expect(s.value).toEqual({ disponible: 8_000_000, reservee: 8_500_000, vendue: 9_000_000 });
    expect(s.unpriced).toEqual({ disponible: 1, reservee: 0, vendue: 1 });
  });

  test("par typologie, dans l'ordre des typologies, sans type en dernier", () => {
    const s = salesSummary(lots, [{ name: "Villa B", description: "" }]);
    expect(s.byType.map((t) => [t.type, t.total, t.counts.vendue + t.counts.reservee])).toEqual([
      ["Villa B", 2, 0],
      ["Villa A", 2, 2],
      [null, 1, 1],
    ]);
  });

  test("pourcentages", () => {
    expect(percentOf(3, 14)).toBe(21);
    expect(percentOf(0, 0)).toBe(0);
    expect(percentOf(14, 14)).toBe(100);
  });
});

describe("contenu de la page", () => {
  const project = {
    description: "",
    contact_phone: null,
    latitude: null,
    amenities: [],
    lot_types: [{ name: "Villa A", description: "Plain-pied" }],
    show_prices: true,
  };
  const lots = [lot("A1", "Villa A", "disponible", 1), lot("B1", "Villa B", "disponible")];
  const base = { project, lots, orbits: [], views: [], markers: [], media: [], rooms: 0 };
  const byKey = (checks: ReturnType<typeof pageChecks>) =>
    Object.fromEntries(checks.map((c) => [c.key, c]));

  test("programme vide", () => {
    const c = byKey(pageChecks({ ...base, lots: [] }));
    expect(c.views?.ok).toBe(false);
    expect(c.lots?.ok).toBe(false);
    expect(c.traced?.ok).toBe(false);
    expect(c.types).toBeUndefined();
    expect(
      pageChecks({ ...base, lots: [] })
        .filter((x) => x.essential)
        .map((x) => x.key),
    ).toEqual(["views", "lots", "traced"]);
  });

  test("vues, repères, prix, typologies", () => {
    const c = byKey(
      pageChecks({
        ...base,
        orbits: [
          { frames: [1], colors: [{ lot_id: "A1" }] },
          { frames: [], colors: [] },
        ],
        views: [{ panorama_path: "a.jpg" }, { panorama_path: null }],
        markers: [{ lot_id: "B1" }],
        media: [
          { kind: "image", lot_type: null },
          { kind: "plan", lot_type: "villa b" },
        ],
        rooms: 27,
      }),
    );
    expect(c.views?.label).toBe("2 vues prêtes");
    expect(c.traced).toMatchObject({ ok: true, label: "2 / 2 lots repérés sur au moins une vue" });
    expect(c.prices).toMatchObject({ ok: false, label: "1 / 2 lots avec leur prix" });
    expect(c.photos).toMatchObject({ ok: true, label: "1 photo" });
    expect(c.types).toMatchObject({ ok: true, label: "2 / 2 typologies présentées" });
    expect(c.tour).toMatchObject({ ok: true, label: "Visite 360° (27 pièces)" });
  });

  test("prix masqués, sur demande, tous saisis", () => {
    const hidden = byKey(pageChecks({ ...base, project: { ...project, show_prices: false } }));
    expect(hidden.prices).toMatchObject({ ok: true, label: "Prix masqués sur la page" });
    const none = [lot("A1", "Villa A", "disponible"), lot("A2", "Villa A", "vendue")];
    expect(byKey(pageChecks({ ...base, lots: none })).prices).toMatchObject({
      ok: true,
      label: "Prix sur demande",
    });
    const all = [lot("A1", "Villa A", "disponible", 1), lot("A2", "Villa A", "vendue", 2)];
    expect(byKey(pageChecks({ ...base, lots: all })).prices).toMatchObject({
      ok: true,
      label: "2 lots avec leur prix",
    });
  });
});

describe("date des demandes", () => {
  const now = new Date("2026-10-09T12:00:00").getTime();
  const at = (ms: number) => new Date(now - ms).toISOString();
  test("relative, puis la date", () => {
    expect(timeAgo(at(20_000), now)).toBe("à l'instant");
    expect(timeAgo(at(5 * 60_000), now)).toBe("il y a 5 minutes");
    expect(timeAgo(at(3 * 3_600_000), now)).toBe("il y a 3 heures");
    expect(timeAgo(at(26 * 3_600_000), now)).toBe("hier");
    expect(timeAgo(at(10 * 86_400_000), now)).toBe("29 sept.");
  });
});
