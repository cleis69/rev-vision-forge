// Unit tests of the 360° tour alone: which tour, its link and its code. Run with `bun test`.
import { describe, expect, test } from "bun:test";

import { publicPathIn } from "../src/lib/public/i18n";
import { tourEmbedCode, tourUrl } from "../src/lib/public/embed";
import type { PublicLot, PublicTour } from "../src/lib/public/programme";
import { pickTour, tourSearch } from "../src/lib/public/tour-link";

const tour = (key: string, lotType: string | null, lotId: string | null = null) =>
  ({ key, label: lotType ?? "Lot", lotType, lotId, rooms: [] }) as unknown as PublicTour;
const lot = (id: string, numero: string, type: string) =>
  ({ id, numero, type }) as unknown as PublicLot;

describe("visite 360° seule", () => {
  const typeA = tour("type:villa a", "Villa A");
  const typeB = tour("type:villa b", "Villa B");
  const lotB2 = tour("lot:b2", null, "b2");
  const data = {
    tours: [typeA, typeB, lotB2],
    lots: [lot("a1", "A1", "Villa A"), lot("b1", "B1", "Villa B"), lot("b2", "B2", "Villa B")],
  };

  test("le type, le lot (sa visite, sinon celle de son type), sinon la première", () => {
    expect(pickTour(data, {})).toBe(typeA);
    expect(pickTour(data, { type: "villa  b" })).toBe(typeB);
    expect(pickTour(data, { lot: "B2" })).toBe(lotB2);
    expect(pickTour(data, { lot: "B1" })).toBe(typeB);
    expect(pickTour(data, { lot: "Z9", type: "Villa A" })).toBe(typeA);
    expect(pickTour({ tours: [], lots: [] }, {})).toBeNull();
  });

  test("paramètres de l'adresse", () => {
    expect(tourSearch({ type: "Villa A", lot: "", other: 3 })).toEqual({ type: "Villa A" });
    expect(tourSearch({ lot: 7 })).toEqual({});
  });

  test("lien et code, en français et en anglais", () => {
    const o = "https://realestatevision360.com";
    expect(tourUrl(o, "city-star", null)).toBe(`${o}/embed/visite/city-star`);
    expect(tourUrl(o, "city-star", { type: "Villa A" }, "en")).toBe(
      `${o}/en/embed/tour/city-star?type=Villa%20A`,
    );
    expect(tourUrl(o, "city-star", { lot: "B2" })).toBe(`${o}/embed/visite/city-star?lot=B2`);
    const code = tourEmbedCode(o, "city-star", 'City "Star"', null, "en");
    expect(code).toContain(`src="${o}/en/embed/tour/city-star"`);
    expect(code).toContain('title="360° tour — City &quot;Star&quot;"');
    expect(code).toContain("allowfullscreen");
    expect(code).toContain("gyroscope");
  });

  test("même visite dans l'autre langue", () => {
    expect(publicPathIn("/embed/visite/city-star", "en")).toBe("/en/embed/tour/city-star");
    expect(publicPathIn("/en/embed/tour/city-star", "fr")).toBe("/embed/visite/city-star");
  });
});
