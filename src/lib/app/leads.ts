import { useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getSupabase } from "@/lib/supabase/client";
import type { Enums, Tables } from "@/lib/supabase/database.types";
import type { Lot } from "./lot-fields";

/* Visit requests of a programme. Members read them and change their status
   (RLS: update of the status column only); new ones arrive live. */

export type Lead = Omit<Tables<"leads">, "ip_hash" | "session_id">;
export type LeadStatus = Enums<"lead_status">;

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  nouveau: "Nouvelle",
  traite: "Traitée",
};
export const SOURCE_LABELS: Record<string, string> = {
  page: "Page du programme",
  embed: "Site du promoteur",
  presentation: "Bureau de vente",
};

const COLUMNS =
  "id, created_at, project_id, lot_id, nom, telephone, email, message, source, status, notified_at";
const leadsKey = (projectId: string) => ["leads", projectId] as const;

export function useLeads(projectId: string) {
  return useQuery({
    queryKey: leadsKey(projectId),
    queryFn: async () => {
      const { data, error } = await getSupabase()
        .from("leads")
        .select(COLUMNS)
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Lead[];
    },
  });
}

export function useSetLeadStatus(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: LeadStatus }) => {
      const { error } = await getSupabase().from("leads").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: leadsKey(projectId) });
      const previous = queryClient.getQueryData<Lead[]>(leadsKey(projectId));
      queryClient.setQueryData<Lead[]>(leadsKey(projectId), (leads = []) =>
        leads.map((l) => (l.id === id ? { ...l, status } : l)),
      );
      return { previous };
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(leadsKey(projectId), context.previous);
    },
  });
}

/** New and changed requests, as they happen (Realtime, filtered by RLS). */
export function useLiveLeads(projectId: string, onNew?: (lead: Lead) => void) {
  const queryClient = useQueryClient();
  const handler = useRef(onNew);
  handler.current = onNew;

  useEffect(() => {
    const supabase = getSupabase();
    const channel = supabase
      .channel(`leads:${projectId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "leads", filter: `project_id=eq.${projectId}` },
        (payload) => {
          if (payload.eventType === "INSERT") handler.current?.(payload.new as Lead);
          void queryClient.invalidateQueries({ queryKey: leadsKey(projectId) });
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [projectId, queryClient]);
}

/** Number for wa.me: digits only, international prefix "+" or "00" dropped. */
export const whatsappDigits = (phone: string) =>
  phone
    .replace(/[^\d+]/g, "")
    .replace(/^\+/, "")
    .replace(/^00/, "");

export function whatsappReply(lead: Lead, lot: Lot | undefined, programme: string): string {
  const about = lot ? `du lot ${lot.numero}${lot.type ? ` (${lot.type})` : ""} ` : "";
  const text = `Bonjour ${lead.nom}, suite à votre demande de visite ${about}pour le programme ${programme}, je vous propose d'en parler.`;
  return `https://wa.me/${whatsappDigits(lead.telephone)}?text=${encodeURIComponent(text)}`;
}

const stamp = new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short" });

/** Rows of the CSV export (French Excel: ";" separator, see downloadCsv). */
export function leadsToCsv(leads: Lead[], lots: Lot[]): string[][] {
  const byId = new Map(lots.map((l) => [l.id, l]));
  return [
    ["date", "nom", "telephone", "email", "lot", "message", "source", "statut"],
    ...leads.map((lead) => [
      stamp.format(new Date(lead.created_at)),
      lead.nom,
      lead.telephone,
      lead.email ?? "",
      lead.lot_id ? (byId.get(lead.lot_id)?.numero ?? "") : "",
      lead.message ?? "",
      SOURCE_LABELS[lead.source] ?? lead.source,
      LEAD_STATUS_LABELS[lead.status],
    ]),
  ];
}
