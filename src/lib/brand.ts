/* Branding of the public pages (Marque tab): main colour, title font, logo.
   The pages are dark; the text on the colour (buttons, chips) is black or
   white, whichever reads better, so any colour stays legible. */

export const DEFAULT_BRAND = "#c9a35b";
/** Background of the public pages. */
export const PAGE_BACKGROUND = "#080808";
const DARK_TEXT = "#0a0a0a";
const LIGHT_TEXT = "#ffffff";

export type BrandFont = { id: string; label: string; name: string; stack: string };

const SANS = "ui-sans-serif, system-ui, sans-serif";
const SERIF = "ui-serif, Georgia, serif";

/** Title fonts, served from the site (no call to Google). The first one is the default. */
export const BRAND_FONTS: readonly BrandFont[] = [
  {
    id: "space-grotesk",
    label: "Moderne",
    name: "Space Grotesk",
    stack: `"Space Grotesk Variable", ${SANS}`,
  },
  { id: "manrope", label: "Sobre", name: "Manrope", stack: `"Manrope Variable", ${SANS}` },
  {
    id: "montserrat",
    label: "Géométrique",
    name: "Montserrat",
    stack: `"Montserrat Variable", ${SANS}`,
  },
  {
    id: "playfair-display",
    label: "Élégante",
    name: "Playfair Display",
    stack: `"Playfair Display Variable", ${SERIF}`,
  },
  { id: "fraunces", label: "Caractère", name: "Fraunces", stack: `"Fraunces Variable", ${SERIF}` },
  {
    id: "cormorant-garamond",
    label: "Classique",
    name: "Cormorant Garamond",
    stack: `"Cormorant Garamond Variable", ${SERIF}`,
  },
];

export const DEFAULT_FONT = BRAND_FONTS[0] as BrandFont;

/** The font saved for the organization; the default one when unknown or unset. */
export const brandFont = (id: string | null | undefined): BrandFont =>
  BRAND_FONTS.find((f) => f.id === id) ?? DEFAULT_FONT;

/** "#ABC", "abc" or "#aabbcc" → "#aabbcc"; null when it is not a colour. */
export function normalizeHex(value: string): string | null {
  let hex = value.trim().replace(/^#/, "").toLowerCase();
  if (/^[0-9a-f]{3}$/.test(hex)) hex = [...hex].map((c) => c + c).join("");
  return /^[0-9a-f]{6}$/.test(hex) ? `#${hex}` : null;
}

const channel = (value: number) => {
  const c = value / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};

/** Relative luminance (WCAG) of a "#rrggbb" colour. */
export function luminance(hex: string): number {
  const n = Number.parseInt(hex.slice(1), 16);
  return (
    0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255)
  );
}

/** Contrast ratio (WCAG), from 1 to 21. */
export function contrastRatio(a: string, b: string): number {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (light + 0.05) / (dark + 0.05);
}

/** Text colour on a background of the brand colour. */
export const textOn = (hex: string): string =>
  contrastRatio(hex, DARK_TEXT) >= contrastRatio(hex, LIGHT_TEXT) ? DARK_TEXT : LIGHT_TEXT;

/** Advice when the colour hardly shows on the dark pages; null when it is fine. */
export function colorHint(hex: string): string | null {
  return contrastRatio(hex, PAGE_BACKGROUND) < 3
    ? "Couleur trop sombre pour le fond noir des pages : les lots disponibles et les liens seront peu visibles. Choisissez une teinte plus claire."
    : null;
}

/** CSS variables of the brand, used by the public pages (font-brand, var(--brand)…). */
export function brandVars(color: string | null | undefined, font: string | null | undefined) {
  const brand = (color && normalizeHex(color)) || DEFAULT_BRAND;
  return {
    "--brand": brand,
    "--brand-contrast": textOn(brand),
    "--brand-font": brandFont(font).stack,
  };
}
