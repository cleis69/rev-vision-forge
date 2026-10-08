import { useMutation, useQueryClient } from "@tanstack/react-query";

import { getSupabase } from "@/lib/supabase/client";
import { AppError, NO_RIGHTS } from "./errors";

/* Organizations: created through create_organization (the creator becomes
   owner); renamed and deleted by owners only (RLS). */

export type OrganizationInput = { name: string; slug: string };

export function useCreateOrganization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, slug }: OrganizationInput) => {
      const { data, error } = await getSupabase().rpc("create_organization", {
        p_name: name,
        p_slug: slug,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["memberships"] }),
  });
}

export function useUpdateOrganization(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (values: OrganizationInput) => {
      const { data, error } = await getSupabase()
        .from("organizations")
        .update(values)
        .eq("id", id)
        .select("id, name, slug")
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["memberships"] }),
  });
}

/** Deletes the organization with its programmes, lots and visit requests. */
export function useDeleteOrganization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await getSupabase()
        .from("organizations")
        .delete()
        .eq("id", id)
        .select("id");
      if (error) throw error;
      if (data.length === 0) throw new AppError(NO_RIGHTS);
    },
    onSuccess: async () => {
      queryClient.removeQueries({ queryKey: ["projects"] });
      queryClient.removeQueries({ queryKey: ["project"] });
      await queryClient.invalidateQueries({ queryKey: ["memberships"] });
    },
  });
}
