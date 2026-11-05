/* Tabs of the programme page (ProgrammeApp), named in its address (#galerie…)
   so that a link can open one; the old anchors of the page still work. */

export const APP_TABS = [
  "plan",
  "lots",
  "typologies",
  "galerie",
  "visite-360",
  "situation",
  "programme",
] as const;
export type AppTab = (typeof APP_TABS)[number];

const ALIASES: Record<string, AppTab> = {
  plan: "plan",
  "3d": "plan",
  lots: "lots",
  typologies: "typologies",
  galerie: "galerie",
  photos: "galerie",
  "visite-360": "visite-360",
  situation: "situation",
  quartier: "situation",
  programme: "programme",
  prestations: "programme",
};

/**
 * Tab named by the address, when the page has it. "#visite" (the visit
 * request, linked from the 360° tour page) opens the form over the first tab.
 */
export function tabOfHash(
  hash: string,
  available: readonly AppTab[],
): { tab: AppTab | null; visit: boolean } {
  let key = hash.replace(/^#/, "").trim().toLowerCase();
  try {
    key = decodeURIComponent(key);
  } catch {
    /* a broken escape: read as written */
  }
  if (key === "visite") return { tab: null, visit: true };
  const tab = ALIASES[key] ?? null;
  return { tab: tab && available.includes(tab) ? tab : null, visit: false };
}

/** The tab a programme opens on: its 3D view when it has one, else its presentation. */
export const firstTab = (available: readonly AppTab[]): AppTab =>
  available.includes("plan") ? "plan" : "programme";
