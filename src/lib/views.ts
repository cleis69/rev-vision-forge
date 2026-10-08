/* Views of a programme (aerial view, roof, floors from R-1 to R+n,
   pedestrian view…), each an orbital sequence, and floors of the lots:
   labels, typed values, and which view shows a lot. Shared by the promoter
   space and the public pages. */

export type ViewKind = "aerienne" | "toiture" | "niveau" | "pieton" | "autre";
export type ViewLike = {
  id: string;
  name: string;
  kind: ViewKind;
  level: number | null;
  sort_order: number;
  is_main: boolean;
};

export const LEVEL_MIN = -9;
export const LEVEL_MAX = 99;

/** -1 → "R-1", 0 → "RDC", 2 → "R+2". */
export function levelLabel(level: number): string {
  if (level === 0) return "RDC";
  return level < 0 ? `R${level}` : `R+${level}`;
}

const fold = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim();

/**
 * Floor typed or imported: "RDC", "rez-de-chaussée", "R+2", "R2", "2", "2e",
 * "2ème étage", "R-1", "-1", "sous-sol", "SS2"… Empty gives null; undefined
 * when unreadable or out of range.
 */
export function parseLevel(input: string): number | null | undefined {
  const s = fold(input);
  if (s === "") return null;
  const inRange = (n: number) => (n >= LEVEL_MIN && n <= LEVEL_MAX ? n : undefined);
  if (["rdc", "rez de chaussee", "rez-de-chaussee", "rez", "gf"].includes(s)) return 0;
  let m = /^r ?([+-]) ?(\d{1,2})$/.exec(s);
  if (m) return inRange((m[1] === "-" ? -1 : 1) * Number(m[2]));
  m = /^r ?(\d{1,2})$/.exec(s) ?? /^([+-]?\d{1,2})$/.exec(s);
  if (m) return inRange(Number(m[1]));
  m = /^(\d{1,2}) ?(?:e|er|ere|eme)? ?(?:etage)?$/.exec(s);
  if (m) return inRange(Number(m[1]));
  m = /^(?:sous-sol|sous sol|ss|s) ?(\d)?$/.exec(s);
  if (m) return inRange(-Number(m[1] ?? 1));
  return undefined;
}

export const VIEW_KIND_LABELS: Record<ViewKind, string> = {
  aerienne: "Vue aérienne",
  toiture: "Toiture",
  niveau: "Niveau",
  pieton: "Vue piéton",
  autre: "Autre vue",
};

export type ViewPreset = { name: string; kind: ViewKind; level: number | null };

/** Views added in one click in the Vues tab. */
export const VIEW_PRESETS: readonly ViewPreset[] = [
  { name: "Vue aérienne", kind: "aerienne", level: null },
  { name: "Toiture", kind: "toiture", level: null },
  ...[-1, 0, 1, 2, 3, 4, 5].map((level) => ({
    name: levelLabel(level),
    kind: "niveau" as const,
    level,
  })),
  { name: "Vue piéton", kind: "pieton", level: null },
];

/** True when the programme already has this preset (same kind, same floor). */
export const hasPreset = (views: readonly ViewLike[], preset: ViewPreset) =>
  views.some(
    (v) => v.kind === preset.kind && (preset.kind !== "niveau" || v.level === preset.level),
  );

/** Floors from the top down (R+5 … RDC … R-1), as on a building. */
export const floorsDown = <T extends ViewLike>(views: readonly T[]): T[] =>
  views.filter((v) => v.kind === "niveau").sort((a, b) => (b.level ?? 0) - (a.level ?? 0));

/** The other views, in the order chosen by the promoter. */
export const sideViews = <T extends ViewLike>(views: readonly T[]): T[] =>
  views.filter((v) => v.kind !== "niveau").sort((a, b) => a.sort_order - b.sort_order);

/** View shown first: the one marked main, else the first of the other views, else the top floor. */
export function firstView(views: readonly ViewLike[]): string | null {
  const main = views.find((v) => v.is_main);
  if (main) return main.id;
  const ordered = [...sideViews(views), ...floorsDown(views)];
  return ordered[0]?.id ?? null;
}

/**
 * View to show for a lot: the current one when the lot is on it, else the
 * first one that shows it (the floors of its level first), else the current one.
 */
export function viewForLot(
  views: readonly (ViewLike & { lots: ReadonlySet<string> })[],
  lot: { id: string; niveau: number | null },
  current: string | null,
): string | null {
  const here = views.find((v) => v.id === current);
  if (here?.lots.has(lot.id)) return current;
  const floor = views.find(
    (v) => v.kind === "niveau" && v.level === lot.niveau && v.lots.has(lot.id),
  );
  if (floor) return floor.id;
  const any = [...sideViews(views), ...floorsDown(views)].find((v) => v.lots.has(lot.id));
  return any ? any.id : current;
}
