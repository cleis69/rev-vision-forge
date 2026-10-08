import { useEffect, useRef } from "react";

import type { LotStatus } from "@/lib/app/lot-fields";
import { getSupabase } from "@/lib/supabase/client";

/* Live changes of the lots of a programme, on the private Realtime channel
   "programme:<id>" fed by a database trigger (see the realtime migration).
   A signal only says which lot changed; the page reads the lots again
   through the public view, so hidden prices stay hidden. */

export type LotSignal = {
  lot_id: string;
  numero: string;
  op: "INSERT" | "UPDATE" | "DELETE";
  statut: LotStatus | null;
  avant: LotStatus | null;
};

/**
 * `onSignal` runs as soon as a signal arrives (to show the new status at once);
 * `onSignals` gets the signals of the last 250 ms, and [] after a reconnection
 * (changes may have been missed), to read the lots again.
 */
export function useLiveProgramme(
  projectId: string,
  onSignals: (signals: LotSignal[]) => void,
  onSignal?: (signal: LotSignal) => void,
) {
  const handler = useRef(onSignals);
  handler.current = onSignals;
  const immediate = useRef(onSignal);
  immediate.current = onSignal;

  useEffect(() => {
    const supabase = getSupabase();
    let pending: LotSignal[] = [];
    let timer: number | undefined;
    let subscribedOnce = false;

    const channel = supabase
      .channel(`programme:${projectId}`, { config: { private: true } })
      .on("broadcast", { event: "lot" }, ({ payload }) => {
        immediate.current?.(payload as LotSignal);
        pending.push(payload as LotSignal);
        window.clearTimeout(timer);
        timer = window.setTimeout(() => {
          const batch = pending;
          pending = [];
          handler.current(batch);
        }, 250);
      })
      .subscribe((status) => {
        if (status !== "SUBSCRIBED") return;
        if (subscribedOnce) handler.current([]);
        subscribedOnce = true;
      });

    return () => {
      window.clearTimeout(timer);
      void supabase.removeChannel(channel);
    };
  }, [projectId]);
}

const MESSAGES: Record<LotStatus, (numero: string) => string> = {
  reservee: (n) => `Le lot ${n} vient d'être réservé.`,
  vendue: (n) => `Le lot ${n} vient d'être vendu.`,
  disponible: (n) => `Le lot ${n} est de nouveau disponible.`,
};

/** Messages for the visitor: one per status change, or a summary when many lots change at once. */
export function liveMessages(signals: LotSignal[]): string[] {
  // Net change of each lot: its status before the first signal, after the last one.
  const net = new Map<string, { numero: string; from: LotStatus; to: LotStatus }>();
  for (const s of signals) {
    if (s.op !== "UPDATE" || !s.statut || !s.avant) continue;
    const known = net.get(s.lot_id);
    net.set(s.lot_id, { numero: s.numero, from: known?.from ?? s.avant, to: s.statut });
  }
  const changed = [...net.values()].filter((c) => c.from !== c.to);
  if (changed.length > 3)
    return [`Les statuts de ${changed.length} lots viennent d'être mis à jour.`];
  return changed.map((c) => MESSAGES[c.to](c.numero));
}
