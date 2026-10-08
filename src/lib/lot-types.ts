import { normalizeType } from "./tours";

/* Types of lots (Villa A, Villa B…). The promoter writes a text for each
   (projects.lot_types, in the order of the Typologies section), and gives a
   type its photos, plans and brochure (media.lot_type). Types are compared
   like the 360° tours: without case, spaces tidied. */

export type LotTypeNote = { name: string; description: string };

export const MAX_LOT_TYPES = 30;
export const MAX_TYPE_DESCRIPTION = 1200;

export function parseLotTypes(value: unknown): LotTypeNote[] {
  if (!Array.isArray(value)) return [];
  return value
    .flatMap((t): LotTypeNote[] => {
      if (!t || typeof t !== "object") return [];
      const { name, description } = t as Record<string, unknown>;
      if (typeof name !== "string" || !name.trim()) return [];
      return [
        {
          name: name.trim(),
          description: typeof description === "string" ? description : "",
        },
      ];
    })
    .slice(0, MAX_LOT_TYPES);
}

export const sameType = (a: string | null | undefined, b: string | null | undefined) =>
  Boolean(a && b) && normalizeType(a as string) === normalizeType(b as string);

/** The types of the lots, once each (spelled as on their first lot): the promoter's order first, then the order of the lots. */
export function lotTypeNames(
  lots: readonly { type: string | null }[],
  notes: readonly LotTypeNote[],
): string[] {
  const names = new Map<string, string>();
  for (const lot of lots) {
    const name = lot.type?.trim();
    if (name && !names.has(normalizeType(name))) names.set(normalizeType(name), name);
  }
  const rank = new Map(notes.map((n, i) => [normalizeType(n.name), i]));
  return [...names.entries()]
    .map(([key, name], i) => ({ name, order: rank.get(key) ?? notes.length + i }))
    .sort((a, b) => a.order - b.order)
    .map((t) => t.name);
}

/** The text of a type, or an empty one. */
export const noteOf = (notes: readonly LotTypeNote[], type: string) =>
  notes.find((n) => sameType(n.name, type))?.description ?? "";

/** The notes with the text of one type changed (an empty text removes it). */
export function withNote(notes: readonly LotTypeNote[], type: string, description: string) {
  const text = description.slice(0, MAX_TYPE_DESCRIPTION);
  const others = notes.filter((n) => !sameType(n.name, type));
  const index = notes.findIndex((n) => sameType(n.name, type));
  if (!text.trim()) return others;
  const next = [...others];
  next.splice(index < 0 ? next.length : index, 0, { name: type, description: text });
  return next.slice(0, MAX_LOT_TYPES);
}

/** The notes in a new order of the types (the order of the Typologies section). */
export function orderNotes(notes: readonly LotTypeNote[], order: readonly string[]): LotTypeNote[] {
  return order
    .map((type) => notes.find((n) => sameType(n.name, type)) ?? { name: type, description: "" })
    .slice(0, MAX_LOT_TYPES);
}
