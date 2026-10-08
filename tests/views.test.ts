// Unit tests of the views of a programme and the floors of the lots. Run with `bun test`.
import { describe, expect, test } from "bun:test";

import { parseField } from "../src/lib/app/lot-fields";
import {
  ORBIT,
  VIEW_PRESETS,
  firstView,
  floorsDown,
  hasPreset,
  levelLabel,
  parseLevel,
  sideViews,
  viewForLot,
  type ViewLike,
} from "../src/lib/views";

const view = (
  id: string,
  kind: ViewLike["kind"],
  level: number | null,
  order: number,
  main = false,
) => ({
  id,
  name: kind === "niveau" && level !== null ? levelLabel(level) : id,
  kind,
  level,
  sort_order: order,
  is_main: main,
});

describe("niveaux", () => {
  test("libellés", () => {
    expect(levelLabel(-1)).toBe("R-1");
    expect(levelLabel(0)).toBe("RDC");
    expect(levelLabel(5)).toBe("R+5");
  });

  test("saisie et import", () => {
    expect(parseLevel("")).toBeNull();
    for (const s of ["RDC", "rdc", "Rez-de-chaussée", "rez de chaussée", "R0", "0"])
      expect(parseLevel(s)).toBe(0);
    for (const s of ["R+2", "r+2", "R 2", "R2", "2", "+2", "2e", "2ème étage", "2 étage"])
      expect(parseLevel(s)).toBe(2);
    for (const s of ["R-1", "-1", "sous-sol", "SS", "S1"]) expect(parseLevel(s)).toBe(-1);
    expect(parseLevel("SS2")).toBe(-2);
    expect(parseLevel("grenier")).toBeUndefined();
    expect(parseLevel("R+150")).toBeUndefined();
    expect(parseField("niveau", "R+3")).toEqual({ ok: true, value: 3 });
    expect(parseField("niveau", "toit").ok).toBe(false);
  });
});

describe("vues", () => {
  const views = [
    view("aerienne", "aerienne", null, 0),
    view("r1", "niveau", 1, 1),
    view("rdc", "niveau", 0, 2),
    view("pieton", "pieton", null, 3),
    view("r-1", "niveau", -1, 4),
  ];

  test("vues proposées", () => {
    expect(VIEW_PRESETS.map((p) => p.name)).toEqual([
      "Vue aérienne",
      "Toiture",
      "R-1",
      "RDC",
      "R+1",
      "R+2",
      "R+3",
      "R+4",
      "R+5",
      "Vue piéton",
    ]);
    expect(hasPreset(views, { name: "RDC", kind: "niveau", level: 0 })).toBe(true);
    expect(hasPreset(views, { name: "R+2", kind: "niveau", level: 2 })).toBe(false);
    expect(hasPreset(views, { name: "Toiture", kind: "toiture", level: null })).toBe(false);
  });

  test("colonne d'étages du haut vers le bas, autres vues dans l'ordre choisi", () => {
    expect(floorsDown(views).map((v) => v.id)).toEqual(["r1", "rdc", "r-1"]);
    expect(sideViews(views).map((v) => v.id)).toEqual(["aerienne", "pieton"]);
  });

  test("vue montrée d'abord", () => {
    expect(firstView(views, true)).toBe(ORBIT);
    expect(firstView(views, false)).toBe("aerienne");
    expect(
      firstView([...views.slice(0, 2), { ...view("rdc", "niveau", 0, 2), is_main: true }], true),
    ).toBe("rdc");
    expect(firstView([], false)).toBeNull();
  });

  test("vue d'un lot", () => {
    const withLots = [
      { ...views[0]!, lots: new Set(["a", "b"]) },
      { ...views[1]!, lots: new Set(["c"]) },
      { ...views[2]!, lots: new Set(["a", "d"]) },
      { ...views[3]!, lots: new Set<string>() },
      { ...views[4]!, lots: new Set<string>() },
    ];
    const orbitLots = new Set(["a", "e"]);
    // Already on a view that shows it: nothing moves.
    expect(viewForLot(withLots, { id: "a", niveau: 0 }, "aerienne", orbitLots)).toBe("aerienne");
    expect(viewForLot(withLots, { id: "a", niveau: 0 }, ORBIT, orbitLots)).toBe(ORBIT);
    // The floor of the lot first.
    expect(viewForLot(withLots, { id: "a", niveau: 0 }, "pieton", orbitLots)).toBe("rdc");
    expect(viewForLot(withLots, { id: "c", niveau: null }, ORBIT, orbitLots)).toBe("r1");
    expect(viewForLot(withLots, { id: "e", niveau: null }, "aerienne", orbitLots)).toBe(ORBIT);
    // Shown nowhere: the view does not change.
    expect(viewForLot(withLots, { id: "z", niveau: null }, "pieton", orbitLots)).toBe("pieton");
  });
});
