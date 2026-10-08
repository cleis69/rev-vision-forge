// Unit tests of the orbital view masks: order, checks, colours, hit test, highlight. Run with `bun test`.
import { describe, expect, test } from "bun:test";

import {
  checkSequence,
  colorAt,
  countColors,
  hexOf,
  labelMap,
  lotColors,
  packRgb,
  paintLabels,
  rgbOf,
  sortByName,
  tintOf,
  tintPixels,
} from "../src/lib/orbit-mask";
import { loadingOrder, nearestLoaded } from "../src/lib/use-orbit-frames";

const files = (n: number, type: string, prefix = "vue") =>
  Array.from({ length: n }, (_, i) => ({ name: `${prefix}-${i + 1}.png`, type }));

/** A mask of w × h pixels from a list of [r, g, b] (row by row). */
function mask(w: number, h: number, pixels: [number, number, number][]) {
  const data = new Uint8ClampedArray(w * h * 4);
  pixels.forEach(([r, g, b], i) => data.set([r, g, b, 255], i * 4));
  return { data, width: w, height: h };
}

describe("séquence", () => {
  test("ordre naturel des fichiers", () => {
    const sorted = sortByName([
      { name: "vue-10.png" },
      { name: "vue-2.png" },
      { name: "vue-1.png" },
    ]);
    expect(sorted.map((f) => f.name)).toEqual(["vue-1.png", "vue-2.png", "vue-10.png"]);
  });

  test("contrôles", () => {
    expect(checkSequence(files(48, "image/jpeg"), files(48, "image/png", "masque"))).toBeNull();
    expect(checkSequence([], [])).not.toBeNull();
    expect(checkSequence(files(12, "image/jpeg"), files(12, "image/png"))).toContain(
      "entre 24 et 120",
    );
    expect(checkSequence(files(48, "image/jpeg"), files(47, "image/png"))).toContain("47 masques");
    expect(checkSequence(files(48, "image/jpeg"), files(48, "image/jpeg"))).toContain("PNG");
    expect(checkSequence(files(48, "image/gif"), files(48, "image/png"))).toContain("JPEG");
  });
});

describe("couleurs des masques", () => {
  test("hexadécimal", () => {
    expect(hexOf(packRgb(201, 163, 91))).toBe("#c9a35b");
    expect(rgbOf("#c9a35b")).toBe(packRgb(201, 163, 91));
    expect(tintOf("#ff8000", 0.5)).toEqual([255, 128, 0, 128]);
  });

  test("fond noir ignoré, bords lissés comptés à part", () => {
    const counts = new Map<number, number>();
    // 10 000 pixels: 6 000 black, 2 500 red, 1 496 blue, 4 edge pixels in other colours.
    const pixels: [number, number, number][] = [
      ...Array<[number, number, number]>(6000).fill([0, 0, 0]),
      ...Array<[number, number, number]>(2500).fill([255, 0, 0]),
      ...Array<[number, number, number]>(1496).fill([0, 0, 255]),
      [128, 0, 127],
      [127, 0, 128],
      [12, 10, 8],
      [200, 0, 40],
    ];
    const total = countColors(mask(100, 100, pixels).data, counts);
    expect(total).toBe(10000);
    const { colors, noise } = lotColors(counts, total);
    expect(colors.map((c) => c.hex)).toEqual(["#ff0000", "#0000ff"]);
    expect(colors[0]?.share).toBeCloseTo(0.25, 5);
    expect(noise).toBeCloseTo(3 / 10000, 6);
  });

  test("lot sous le pointeur", () => {
    const m = mask(2, 2, [
      [0, 0, 0],
      [255, 0, 0],
      [0, 0, 255],
      [5, 5, 5],
    ]);
    expect(colorAt(m, 1.7, 0.2)).toBe(packRgb(255, 0, 0));
    expect(colorAt(m, 0, 1)).toBe(packRgb(0, 0, 255));
    expect(colorAt(m, 0, 0)).toBeNull();
    expect(colorAt(m, 1, 1)).toBeNull();
    expect(colorAt(m, 5, 0)).toBeNull();
  });

  test("surbrillance d'un lot", () => {
    const m = mask(3, 1, [
      [255, 0, 0],
      [0, 0, 255],
      [255, 0, 0],
    ]);
    const out = tintPixels(m, new Map([[packRgb(255, 0, 0), [1, 2, 3, 4] as const]]));
    expect([...out]).toEqual([1, 2, 3, 4, 0, 0, 0, 0, 1, 2, 3, 4]);
  });
});

describe("préchargement des vues", () => {
  test("une vue sur 8 d'abord, puis le reste, sans doublon", () => {
    const order = loadingOrder(48);
    expect(order.slice(0, 6)).toEqual([0, 8, 16, 24, 32, 40]);
    expect(order.slice(6, 12)).toEqual([4, 12, 20, 28, 36, 44]);
    expect(new Set(order).size).toBe(48);
    expect(loadingOrder(5)).toEqual([0, 4, 2, 1, 3]);
  });

  test("vue chargée la plus proche, en faisant le tour", () => {
    const loaded = [true, false, false, false, false, false, false, true];
    expect(nearestLoaded(loaded, 0)).toBe(0);
    expect(nearestLoaded(loaded, 2)).toBe(0);
    expect(nearestLoaded(loaded, 6)).toBe(7);
    expect(nearestLoaded([false, false], 1)).toBe(-1);
  });
});

describe("visionneuse publique", () => {
  test("carte des lots : 1 octet par pixel", () => {
    const m = mask(3, 1, [
      [255, 0, 0],
      [0, 0, 0],
      [0, 0, 255],
    ]);
    expect([...labelMap(m, [packRgb(0, 0, 255), packRgb(255, 0, 0)])]).toEqual([2, 0, 1]);
  });

  test("couleur unie, hachures, lot non peint", () => {
    // 4 × 2 pixels: label 1 everywhere on row 0, label 2 on row 1.
    const labels = Uint8Array.from([1, 1, 1, 1, 2, 2, 2, 2]);
    const out = new Uint8ClampedArray(labels.length * 4);
    paintLabels(labels, 4, [null, { rgba: [10, 20, 30, 200] }, null], out);
    expect([...out.slice(0, 4)]).toEqual([10, 20, 30, 200]);
    expect([...out.slice(16, 20)]).toEqual([0, 0, 0, 0]);
    paintLabels(labels, 4, [null, { rgba: [1, 2, 3, 200], stripes: 1 }, null], out);
    // Stripes one pixel wide: full opacity, then a quarter, and so on.
    expect([0, 1, 2, 3].map((x) => out[x * 4 + 3])).toEqual([200, 50, 200, 50]);
  });
});
