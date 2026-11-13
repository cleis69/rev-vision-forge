// Unit tests of « Je cherche… »: what the lots are called, from the names of their types. Run with `bun test`.
import { describe, expect, test } from "bun:test";

import { aLot, countLots, lotNoun, roundStep, shortType } from "../src/lib/public/finder";

describe("what a lot is called", () => {
  test("every type starts with the same known word: that word", () => {
    const noun = lotNoun(["Villa A", "Villa B", "villa C"]);
    expect(noun.key).toBe("villa");
    expect(aLot(noun, "fr")).toBe("une villa");
    expect(aLot(noun, "en")).toBe("a villa");
    expect(countLots(noun, 14, "fr")).toBe("14 villas");
    expect(countLots(noun, 1, "fr")).toBe("1 villa");
    expect(countLots(noun, 0, "fr")).toBe("0 villa");
    expect(countLots(noun, 0, "en")).toBe("0 villas");
  });

  test("accents and gender", () => {
    expect(aLot(lotNoun(["Appartement T2", "Appartement T3"]), "fr")).toBe("un appartement");
    expect(aLot(lotNoun(["Appartement T2", "Appartement T3"]), "en")).toBe("an apartment");
    expect(countLots(lotNoun(["Bureau 1", "Bureau 2"]), 3, "fr")).toBe("3 bureaux");
    expect(countLots(lotNoun(["Bureau 1", "Bureau 2"]), 3, "en")).toBe("3 offices");
  });

  test("mixed or unknown types: a lot", () => {
    for (const types of [["Studio", "T2", "T3"], ["Type 1", "Type 2"], []]) {
      const noun = lotNoun(types);
      expect(noun.key).toBeNull();
      expect(aLot(noun, "fr")).toBe("un lot");
      expect(aLot(noun, "en")).toBe("a lot");
    }
  });

  test("the type as the sentence names it", () => {
    const villas = lotNoun(["Villa A", "Villa B"]);
    expect(shortType("Villa A", villas)).toBe("A");
    expect(shortType("Villa Prestige Sud", villas)).toBe("Prestige Sud");
    expect(shortType("Villa", villas)).toBe("Villa");
    expect(shortType("Studio", lotNoun(["Studio", "T2"]))).toBe("Studio");
  });
});

test("round steps for the sliders", () => {
  expect(roundStep(70)).toBe(2);
  expect(roundStep(1_500_000)).toBe(40_000);
  expect(roundStep(0)).toBe(1);
});
