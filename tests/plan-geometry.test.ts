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
import { clampView, fitView, pinchView, zoomView } from "../src/lib/viewport";

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

describe("zoom du plan", () => {
  test("vue ajustée et centrée", () => {
    expect(fitView(1000, 500, 4000, 2500, 1)).toEqual({ k: 0.2, x: 100, y: 0 });
  });

  test("le point sous la souris reste en place", () => {
    const v = { k: 0.2, x: 100, y: 0 };
    const z = zoomView(v, 300, 200, 2, 0.1, 4);
    expect(z.k).toBe(0.4);
    // content point under (300, 200) before and after
    expect((300 - v.x) / v.k).toBeCloseTo((300 - z.x) / z.k);
    expect((200 - v.y) / v.k).toBeCloseTo((200 - z.y) / z.k);
    expect(zoomView(v, 0, 0, 100, 0.1, 4).k).toBe(4);
  });

  test("un plan zoomé ne sort pas du cadre", () => {
    const inside = clampView({ k: 1, x: 500, y: -5000 }, 1000, 500, 4000, 2500);
    expect(inside).toEqual({ k: 1, x: 0, y: -2000 });
    // smaller than the viewport: centred
    expect(clampView({ k: 0.1, x: 0, y: 0 }, 1000, 500, 4000, 2500)).toEqual({
      k: 0.1,
      x: 300,
      y: 125,
    });
  });

  test("pincement", () => {
    const v = { k: 0.2, x: 0, y: 0 };
    const p = pinchView(v, { x: 100, y: 100 }, 100, { x: 100, y: 100 }, 200, 0.1, 4);
    expect(p.k).toBe(0.4);
    expect((100 - p.x) / p.k).toBeCloseTo(500);
  });
});
