import { useQuery } from "@tanstack/react-query";

import { getSupabase } from "@/lib/supabase/client";
import { STATUS_LABELS, compareNumeros, type Lot } from "./lot-fields";

/* Statistics of a programme (Statistiques tab), computed by the database
   function project_stats for the last 7 or 30 days. A visit is one browser
   tab open on a public page (no cookie, no account). */

export const PERIODS = [7, 30] as const;
export type Period = (typeof PERIODS)[number];

export type Totals = {
  visites: number;
  vues_page: number;
  vues_lot: number;
  clics_lot: number;
  partages: number;
  /** Openings of a 360° tour (absent before step 16). */
  visites_360?: number;
  demandes: number;
};
export type DayStats = { day: string; visites: number; vues_lot: number; demandes: number };
export type LotCounts = {
  lot_id: string;
  vues: number;
  clics: number;
  partages: number;
  visites_360?: number;
  demandes: number;
};
export type ProjectStats = {
  days: number;
  from: string;
  to: string;
  totals: Totals;
  previous: Totals;
  daily: DayStats[];
  lots: LotCounts[];
  sources: Record<string, number>;
};

const timeZone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
};

export function useProjectStats(projectId: string, days: Period) {
  return useQuery({
    queryKey: ["stats", projectId, days],
    queryFn: async () => {
      const { data, error } = await getSupabase().rpc("project_stats", {
        p_project_id: projectId,
        p_days: days,
        p_tz: timeZone(),
      });
      if (error) throw error;
      return data as unknown as ProjectStats;
    },
    // New visits come in all day: read again when the user comes back to the tab.
    refetchOnWindowFocus: true,
  });
}

export type Trend =
  { kind: "none" } | { kind: "new" } | { kind: "same" } | { kind: "up" | "down"; percent: number };

/** Change from the previous period of the same length. */
export function trend(current: number, previous: number): Trend {
  if (previous === 0) return current === 0 ? { kind: "none" } : { kind: "new" };
  const percent = Math.round(((current - previous) / previous) * 100);
  if (percent === 0) return { kind: "same" };
  return { kind: percent > 0 ? "up" : "down", percent: Math.abs(percent) };
}

/** Share of visits that ended in a visit request, in percent (one decimal); null without visits. */
export function conversion(requests: number, visits: number): number | null {
  if (visits === 0) return null;
  return Math.round((requests / visits) * 1000) / 10;
}

export type LotRow = Pick<Lot, "id" | "numero" | "type" | "statut"> &
  Required<Omit<LotCounts, "lot_id">>;
export type LotSort = "vues" | "clics" | "partages" | "visites_360" | "demandes" | "numero";

/** Every lot of the programme with its figures (0 when nobody looked at it), most viewed first. */
export function lotRows(lots: Lot[], counts: LotCounts[], sort: LotSort = "vues"): LotRow[] {
  const byLot = new Map(counts.map((c) => [c.lot_id, c]));
  const rows = lots.map((lot) => {
    const c = byLot.get(lot.id);
    return {
      id: lot.id,
      numero: lot.numero,
      type: lot.type,
      statut: lot.statut,
      vues: c?.vues ?? 0,
      clics: c?.clics ?? 0,
      partages: c?.partages ?? 0,
      visites_360: c?.visites_360 ?? 0,
      demandes: c?.demandes ?? 0,
    };
  });
  return rows.sort((a, b) =>
    sort === "numero"
      ? compareNumeros(a.numero, b.numero)
      : b[sort] - a[sort] ||
        b.vues - a.vues ||
        b.demandes - a.demandes ||
        compareNumeros(a.numero, b.numero),
  );
}

/** Rows of the CSV export (French Excel: ";" separator, see downloadCsv). */
export function lotStatsCsv(rows: LotRow[]): string[][] {
  return [
    ["lot", "type", "statut", "vues_fiche", "clics_plan", "partages", "visites_360", "demandes"],
    ...rows.map((r) => [
      r.numero,
      r.type ?? "",
      STATUS_LABELS[r.statut],
      String(r.vues),
      String(r.clics),
      String(r.partages),
      String(r.visites_360),
      String(r.demandes),
    ]),
  ];
}
