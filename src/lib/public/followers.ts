import { useQuery } from "@tanstack/react-query";

import { getSupabase } from "@/lib/supabase/client";

/* How many visitors follow each lot (asked about it or wait for it, these
   last 90 days): a count from public.lot_followers, never who. The lot sheet
   says it from two on. */

export const FOLLOWERS_SHOWN_FROM = 2;

export function useLotFollowers(projectId: string, enabled = true) {
  return useQuery({
    queryKey: ["lot-followers", projectId],
    enabled,
    staleTime: 5 * 60_000,
    queryFn: async (): Promise<ReadonlyMap<string, number>> => {
      const { data, error } = await getSupabase().rpc("lot_followers", {
        p_project_id: projectId,
      });
      // Not essential to the page: no count rather than an error.
      if (error || !data) return new Map();
      return new Map(data.map((row) => [row.lot_id, row.followers]));
    },
  });
}
