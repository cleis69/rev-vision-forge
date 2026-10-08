import { useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";

import { getSupabase } from "@/lib/supabase/client";
import type { Tables, TablesUpdate } from "@/lib/supabase/database.types";
import { AppError, NO_RIGHTS } from "./errors";
import { assertOwner } from "./organizations";
import { removeFolder } from "./storage";

/* Programmes of an organization. Members create and edit them; only owners
   delete them, since that also erases their lots and visit requests (RLS). */

export type Project = Tables<"projects">;

export const CURRENCIES = [
  { code: "EUR", label: "Euro (€)" },
  { code: "MAD", label: "Dirham marocain (MAD)" },
  { code: "USD", label: "Dollar américain ($)" },
] as const;
export type Currency = (typeof CURRENCIES)[number]["code"];

export const STATUS_LABELS = { draft: "Brouillon", published: "Publié" } as const;

export function useProjects(organizationId: string | undefined) {
  return useQuery({
    queryKey: ["projects", organizationId],
    enabled: Boolean(organizationId),
    queryFn: async () => {
      const { data, error } = await getSupabase()
        .from("projects")
        .select("id, name, slug, city, status, updated_at")
        .eq("organization_id", organizationId ?? "")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

/** One programme, or null when it does not exist or is out of reach. */
export function useProject(id: string) {
  return useQuery({
    queryKey: ["project", id],
    queryFn: async (): Promise<Project | null> => {
      const { data, error } = await getSupabase()
        .from("projects")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      // An id that is not a uuid cannot match a programme.
      if (error?.code === "22P02") return null;
      if (error) throw error;
      return data;
    },
  });
}

export type NewProject = {
  organization_id: string;
  name: string;
  slug: string;
  city: string | null;
  currency: Currency;
};

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (values: NewProject) => {
      const { data, error } = await getSupabase()
        .from("projects")
        .insert(values)
        .select("*")
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (project) => {
      queryClient.setQueryData(["project", project.id], project);
      return queryClient.invalidateQueries({ queryKey: ["projects", project.organization_id] });
    },
  });
}

export function useUpdateProject(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (values: TablesUpdate<"projects">) => {
      const { data, error } = await getSupabase()
        .from("projects")
        .update(values)
        .eq("id", id)
        .select("*")
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (project) => {
      queryClient.setQueryData(["project", id], project);
      return queryClient.invalidateQueries({ queryKey: ["projects", project.organization_id] });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (project: Pick<Project, "id" | "organization_id">) => {
      // Files first (plan…): the storage rules need the programme to exist.
      await assertOwner(project.organization_id);
      await removeFolder(`${project.organization_id}/${project.id}`);
      const { data, error } = await getSupabase()
        .from("projects")
        .delete()
        .eq("id", project.id)
        .select("id");
      if (error) throw error;
      if (data.length === 0) throw new AppError(NO_RIGHTS);
      return project;
    },
    // The page leaves the programme first, then drops it from the cache
    // (forgetProject), so it never shows « introuvable » in between.
    onSuccess: (project) =>
      queryClient.invalidateQueries({ queryKey: ["projects", project.organization_id] }),
  });
}

export function forgetProject(queryClient: QueryClient, id: string) {
  queryClient.removeQueries({ queryKey: ["project", id] });
}
