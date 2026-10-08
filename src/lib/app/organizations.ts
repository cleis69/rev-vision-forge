import { useMutation, useQueryClient } from "@tanstack/react-query";

import { getSupabase } from "@/lib/supabase/client";
import { AppError, NO_RIGHTS } from "./errors";
import { removeFolder } from "./storage";

/* Organizations: created through create_organization (the creator becomes
   owner); renamed and deleted by owners only (RLS). */

export type OrganizationInput = { name: string; slug: string };

/** Stops before anything is removed when the user is not an owner of the organization. */
export async function assertOwner(organizationId: string) {
  const supabase = getSupabase();
  const { data: auth } = await supabase.auth.getSession();
  const { data, error } = await supabase
    .from("members")
    .select("role")
    .eq("organization_id", organizationId)
    .eq("user_id", auth.session?.user.id ?? "")
    .maybeSingle();
  if (error) throw error;
  if (data?.role !== "owner") throw new AppError(NO_RIGHTS);
}

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
      // Files first: the storage rules need the organization to exist.
      await assertOwner(id);
      await removeFolder(id);
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
