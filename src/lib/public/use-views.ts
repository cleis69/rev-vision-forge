import { useEffect, useState } from "react";

import { ORBIT, firstView, viewForLot } from "@/lib/views";
import type { PublicData, PublicLot } from "./programme";

/* Which view of the programme the public pages show (see ProgrammeViews). */

export type ViewKey = string;

/** Chosen view (the main one at first), kept valid when the views change. */
export function useViewKey(data: PublicData) {
  const hasOrbit = Boolean(data.orbit);
  const initial = firstView(data.views, hasOrbit);
  const [key, setKey] = useState<ViewKey | null>(initial);
  const valid =
    (key === ORBIT && hasOrbit) || (key !== null && data.views.some((v) => v.id === key));
  return [valid ? key : initial, setKey] as const;
}

/** Lots of the orbital view (colours linked to a lot). */
export const orbitLotsOf = (data: PublicData): ReadonlySet<string> =>
  new Set(data.orbit?.colors.map((c) => c.lotId) ?? []);

/** Moves to a view showing the lot when the current one does not (shared link, a lot picked from the list…). */
export function useFollowLot(
  data: PublicData,
  lot: PublicLot | null,
  setKey: (update: (key: ViewKey | null) => ViewKey | null) => void,
) {
  const lotId = lot?.id;
  const niveau = lot?.niveau ?? null;
  useEffect(() => {
    if (!lotId) return;
    setKey((key) => viewForLot(data.views, { id: lotId, niveau }, key, orbitLotsOf(data)));
    // Only a new lot moves the view; the visitor's own choice is kept afterwards.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lotId]);
}
