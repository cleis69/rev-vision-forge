// Unit tests of the branding (colour, contrast, fonts) and of the embed code. Run with `bun test`.
import { describe, expect, test } from "bun:test";

import {
  BRAND_FONTS,
  DEFAULT_BRAND,
  brandFont,
  brandVars,
  colorHint,
  contrastRatio,
  normalizeHex,
  textOn,
} from "../src/lib/brand";
import { HEIGHT_MESSAGE, embedCode } from "../src/lib/public/embed";

describe("couleur de marque", () => {
  test("saisie du code couleur", () => {
    expect(normalizeHex("#C9A35B")).toBe("#c9a35b");
    expect(normalizeHex(" c9a35b ")).toBe("#c9a35b");
    expect(normalizeHex("#fa0")).toBe("#ffaa00");
    expect(normalizeHex("#c9a35")).toBeNull();
    expect(normalizeHex("doré")).toBeNull();
  });

  test("contraste", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 5);
    expect(contrastRatio("#ffffff", "#000000")).toBeCloseTo(21, 5);
    expect(contrastRatio("#777777", "#777777")).toBe(1);
  });

  test("texte lisible sur la couleur", () => {
    expect(textOn(DEFAULT_BRAND)).toBe("#0a0a0a");
    expect(textOn("#ece6da")).toBe("#0a0a0a");
    expect(textOn("#1e3a8a")).toBe("#ffffff");
    expect(textOn("#7c2d12")).toBe("#ffffff");
    // Whichever is chosen, the button text stays readable.
    for (const color of ["#c9a35b", "#6fa8dc", "#d4805a", "#e11d48", "#16a34a", "#1e3a8a"]) {
      expect(contrastRatio(color, textOn(color))).toBeGreaterThanOrEqual(4.5);
    }
  });

  test("couleur trop sombre pour les pages", () => {
    expect(colorHint(DEFAULT_BRAND)).toBeNull();
    expect(colorHint("#6fa8dc")).toBeNull();
    expect(colorHint("#1e3a8a")).not.toBeNull();
    expect(colorHint("#111111")).not.toBeNull();
  });
});

describe("police des titres", () => {
  test("six polices, la première par défaut", () => {
    expect(BRAND_FONTS).toHaveLength(6);
    expect(new Set(BRAND_FONTS.map((f) => f.id)).size).toBe(6);
    expect(brandFont(null).id).toBe("space-grotesk");
    expect(brandFont("inconnue").id).toBe("space-grotesk");
    expect(brandFont("playfair-display").stack).toContain('"Playfair Display Variable"');
    expect(brandFont("fraunces").stack).toContain("serif");
  });

  test("variables CSS", () => {
    expect(brandVars(null, null)).toEqual({
      "--brand": DEFAULT_BRAND,
      "--brand-contrast": "#0a0a0a",
      "--brand-font": brandFont(null).stack,
    });
    expect(brandVars("#1E3A8A", "manrope")["--brand-contrast"]).toBe("#ffffff");
    expect(brandVars("pas une couleur", "manrope")["--brand"]).toBe(DEFAULT_BRAND);
  });
});

describe("code d'intégration", () => {
  const code = embedCode(
    "https://realestatevision360.com",
    "villas-de-demonstration",
    'Villas "A&B"',
  );

  test("iframe vers le plan du programme", () => {
    expect(code).toContain(
      '<iframe src="https://realestatevision360.com/embed/villas-de-demonstration"',
    );
    expect(code).toContain('title="Plan de vente — Villas &quot;A&amp;B&quot;"');
    expect(code).toContain("data-rev-plan");
    expect(code).toContain('allow="clipboard-write; web-share"');
  });

  test("hauteur acceptée seulement depuis REV", () => {
    expect(code).toContain('e.origin!=="https://realestatevision360.com"');
    expect(code).toContain(`e.data.type!=="${HEIGHT_MESSAGE}"`);
    expect(code).toContain("contentWindow===e.source");
  });

  test("le script redimensionne l'iframe qui a envoyé la hauteur", () => {
    const script = /<script>(.*)<\/script>/.exec(code)?.[1] ?? "";
    const listeners: ((e: unknown) => void)[] = [];
    const sender = {};
    const frames = [
      { contentWindow: {}, style: { height: "720px" } },
      { contentWindow: sender, style: { height: "720px" } },
    ];
    const run = new Function("window", "document", script);
    run(
      { addEventListener: (_: string, fn: (e: unknown) => void) => listeners.push(fn) },
      { querySelectorAll: () => frames },
    );
    const send = (e: unknown) => listeners.forEach((fn) => fn(e));
    send({
      origin: "https://ailleurs.example",
      source: sender,
      data: { type: HEIGHT_MESSAGE, height: 10 },
    });
    send({
      origin: "https://realestatevision360.com",
      source: sender,
      data: { type: "autre", height: 10 },
    });
    expect(frames[1]?.style.height).toBe("720px");
    send({
      origin: "https://realestatevision360.com",
      source: sender,
      data: { type: HEIGHT_MESSAGE, height: 1033.4 },
    });
    expect(frames[1]?.style.height).toBe("1034px");
    expect(frames[0]?.style.height).toBe("720px");
  });
});
