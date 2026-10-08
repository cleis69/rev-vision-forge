// Unit tests of the plan editor computations. Run with `bun test`.
import { describe, expect, test } from "bun:test";

import {
  area,
  centroid,
  clamp01,
  fitWithin,
  isValidShape,
  midpoints,
  parsePoints,
  roundPoint,
  type Point,
} from "../src/lib/geometry";

const square: Point[] = [
  [0.1, 0.1],
  [0.3, 0.1],
  [0.3, 0.3],
  [0.1, 0.3],
];

describe("géométrie du plan", () => {
  test("dimensions de redimensionnement", () => {
    expect(fitWithin(8000, 4000, 4096)).toEqual({ width: 4096, height: 2048 });
    expect(fitWithin(3000, 6000, 1600)).toEqual({ width: 800, height: 1600 });
    expect(fitWithin(1200, 800, 4096)).toEqual({ width: 1200, height: 800 });
    const capped = fitWithin(6000, 6000, 6000, 16_000_000);
    expect(capped.width * capped.height).toBeLessThanOrEqual(16_000_000);
  });

  test("coordonnées bornées et arrondies", () => {
    expect(clamp01(-0.2)).toBe(0);
    expect(clamp01(1.4)).toBe(1);
    expect(roundPoint([0.1234567, 1.2])).toEqual([0.12346, 1]);
  });

  test("surface, centre et milieux des côtés", () => {
    expect(area(square, 1000, 1000)).toBeCloseTo(40000);
    expect(area(square, 2000, 1000)).toBeCloseTo(80000);
    const [cx, cy] = centroid(square);
    expect(cx).toBeCloseTo(0.2);
    expect(cy).toBeCloseTo(0.2);
    expect(midpoints(square)[0]).toEqual([0.2, 0.1]);
    expect(midpoints(square)[3]?.[0]).toBeCloseTo(0.1);
    expect(midpoints(square)[3]?.[1]).toBeCloseTo(0.2);
  });

  test("formes refusées", () => {
    expect(isValidShape(square)).toBe(true);
    expect(isValidShape(square.slice(0, 2))).toBe(false);
    expect(
      isValidShape([
        [0.1, 0.1],
        [0.2, 0.2],
        [0.3, 0.3],
      ]),
    ).toBe(false);
  });

  test("points lus depuis la base", () => {
    expect(parsePoints(square)).toEqual(square);
    expect(parsePoints([[0.1, "a"]])).toBeNull();
    expect(parsePoints({})).toBeNull();
  });
});
