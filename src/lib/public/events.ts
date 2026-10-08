import { getSupabase } from "@/lib/supabase/client";
import type { Enums } from "@/lib/supabase/database.types";

/* Visits of the public pages, for the statistics of the promoter space:
   anonymous, one random id per browser tab (sessionStorage), no cookie. */

const KEY = "rev-visit";
const fallback = crypto.randomUUID();

/** Random id of this browser tab, shared by the visit statistics and the rate limit of visit requests. */
export function sessionId(): string {
  try {
    let id = window.sessionStorage.getItem(KEY);
    if (!id) {
      id = crypto.randomUUID();
      window.sessionStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    // Storage blocked: an id for this page only, never one shared by every such visitor.
    return fallback;
  }
}

/** Fire and forget: a lost event never bothers the visitor. */
export function track(projectId: string, type: Enums<"lot_event_type">, lotId?: string) {
  void getSupabase()
    .from("lot_events")
    .insert({ project_id: projectId, type, lot_id: lotId ?? null, session_id: sessionId() })
    .then(
      () => undefined,
      () => undefined,
    );
}
