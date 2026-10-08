import { brandFont } from "./brand";

/* Title fonts of the public pages, loaded only when a page uses them.
   Space Grotesk is already part of the site (styles.css). */

const LOADERS: Record<string, () => Promise<unknown>> = {
  "space-grotesk": () => Promise.resolve(),
  manrope: () => import("@fontsource-variable/manrope/index.css"),
  montserrat: () => import("@fontsource-variable/montserrat/index.css"),
  "playfair-display": () => import("@fontsource-variable/playfair-display/index.css"),
  fraunces: () => import("@fontsource-variable/fraunces/index.css"),
  "cormorant-garamond": () => import("@fontsource-variable/cormorant-garamond/index.css"),
};

/** Fire and forget: until the font arrives, titles use the fallback of its stack. */
export function loadBrandFont(id: string | null | undefined) {
  const loader = LOADERS[brandFont(id).id];
  void loader?.().catch(() => undefined);
}

export function loadAllBrandFonts() {
  for (const id of Object.keys(LOADERS)) loadBrandFont(id);
}
