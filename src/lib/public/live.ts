import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { LotStatus } from "@/lib/app/lot-fields";
import { getSupabase } from "@/lib/supabase/client";
import { useLocale, type Locale } from "./i18n";
import type { PublicData } from "./programme";

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

const MESSAGES: Record<Locale, Record<LotStatus, (numero: string) => string>> = {
  fr: {
    reservee: (n) => `Le lot ${n} vient d'être réservé.`,
    vendue: (n) => `Le lot ${n} vient d'être vendu.`,
    disponible: (n) => `Le lot ${n} est de nouveau disponible.`,
  },
  en: {
    reservee: (n) => `Lot ${n} has just been reserved.`,
    vendue: (n) => `Lot ${n} has just been sold.`,
    disponible: (n) => `Lot ${n} is available again.`,
  },
};

const SUMMARY: Record<Locale, (count: number) => string> = {
  fr: (count) => `Les statuts de ${count} lots viennent d'être mis à jour.`,
  en: (count) => `The statuses of ${count} lots have just been updated.`,
};

/** Messages for the visitor: one per status change, or a summary when many lots change at once. */
export function liveMessages(signals: LotSignal[], locale: Locale = "fr"): string[] {
  // Net change of each lot: its status before the first signal, after the last one.
  const net = new Map<string, { numero: string; from: LotStatus; to: LotStatus }>();
  for (const s of signals) {
    if (s.op !== "UPDATE" || !s.statut || !s.avant) continue;
    const known = net.get(s.lot_id);
    net.set(s.lot_id, { numero: s.numero, from: known?.from ?? s.avant, to: s.statut });
  }
  const changed = [...net.values()].filter((c) => c.from !== c.to);
  if (changed.length > 3) return [SUMMARY[locale](changed.length)];
  return changed.map((c) => MESSAGES[locale][c.to](c.numero));
}

/**
 * Live statuses on a public page (programme, embedded plan, presentation):
 * the new status shows at once, the lots are read again for prices and new
 * lots, and visitors see what changed (in the language of the page). Returns
 * the lots that just changed.
 */
export function useLiveLots(projectId: string, slug: string): ReadonlySet<string> {
  const queryClient = useQueryClient();
  const locale = useLocale();
  const [highlight, setHighlight] = useState<ReadonlySet<string>>(new Set());
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  useLiveProgramme(
    projectId,
    (signals) => {
      void queryClient.invalidateQueries({ queryKey: ["public-programme", slug] });
      for (const message of liveMessages(signals, locale)) toast(message);
    },
    (signal) => {
      setHighlight((ids) => new Set(ids).add(signal.lot_id));
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setHighlight(new Set()), 2600);
      if (signal.op !== "UPDATE" || !signal.statut) return;
      const statut = signal.statut;
      queryClient.setQueryData<PublicData | null>(["public-programme", slug], (current) =>
        current
          ? {
              ...current,
              lots: current.lots.map((l) => (l.id === signal.lot_id ? { ...l, statut } : l)),
            }
          : current,
      );
    },
  );
  return highlight;
}
