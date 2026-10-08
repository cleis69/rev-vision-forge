import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getSupabase } from "@/lib/supabase/client";
import type { Tables, TablesUpdate } from "@/lib/supabase/database.types";
import type { ViewPreset } from "@/lib/views";
import { AppError, NO_RIGHTS } from "./errors";
import { viewOrbitFolders, type Orbits } from "./orbit";
import { removeFolder } from "./storage";

/* Views of a programme (Vues tab): aerial view, roof, floors, pedestrian
   view…, each an orbital sequence (see orbit.ts), in the promoter's order;
   one of them can be shown first on the public pages. */

export type ProjectView = Tables<"project_views">;

const viewsKey = (projectId: string) => ["views", projectId] as const;

export function useViews(projectId: string) {
  return useQuery({
    queryKey: viewsKey(projectId),
    queryFn: async () => {
      const { data, error } = await getSupabase()
        .from("project_views")
        .select("*")
        .eq("project_id", projectId)
        .order("sort_order")
        .order("created_at");
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateView(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (preset: ViewPreset) => {
      const views = queryClient.getQueryData<ProjectView[]>(viewsKey(projectId)) ?? [];
      const order = views.reduce((max, v) => Math.max(max, v.sort_order), -1) + 1;
      const { data, error } = await getSupabase()
        .from("project_views")
        .insert({ project_id: projectId, ...preset, sort_order: order })
        .select("*")
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (view) =>
      queryClient.setQueryData<ProjectView[]>(viewsKey(projectId), (views = []) => [
        ...views,
        view,
      ]),
  });
}

export function useUpdateView(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, values }: { id: string; values: TablesUpdate<"project_views"> }) => {
      const { data, error } = await getSupabase()
        .from("project_views")
        .update(values)
        .eq("id", id)
        .select("*");
      if (error) throw error;
      const saved = data[0];
      if (!saved) throw new AppError(NO_RIGHTS);
      return saved;
    },
    onSuccess: (view) =>
      queryClient.setQueryData<ProjectView[]>(viewsKey(projectId), (views = []) =>
        views.map((v) => (v.id === view.id ? view : v)),
      ),
  });
}

/** Marks the view shown first on the public pages (null: the first one). */
export function useSetMainView(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string | null) => {
      const supabase = getSupabase();
      // One main view per programme: the previous one first.
      const cleared = await supabase
        .from("project_views")
        .update({ is_main: false })
        .eq("project_id", projectId)
        .eq("is_main", true);
      if (cleared.error) throw cleared.error;
      if (id) {
        const set = await supabase.from("project_views").update({ is_main: true }).eq("id", id);
        if (set.error) throw set.error;
      }
      return id;
    },
    onSuccess: (id) =>
      queryClient.setQueryData<ProjectView[]>(viewsKey(projectId), (views = []) =>
        views.map((v) => ({ ...v, is_main: v.id === id })),
      ),
  });
}

/** Moves a view one place to the left (-1) or to the right (1). */
export function useMoveView(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, step }: { id: string; step: -1 | 1 }) => {
      const views = [...(queryClient.getQueryData<ProjectView[]>(viewsKey(projectId)) ?? [])].sort(
        (a, b) => a.sort_order - b.sort_order,
      );
      const i = views.findIndex((v) => v.id === id);
      const j = i + step;
      if (i < 0 || j < 0 || j >= views.length) return views;
      const [moved] = views.splice(i, 1);
      if (moved) views.splice(j, 0, moved);
      // Orders rewritten 0, 1, 2…: the list stays tidy whatever happened before.
      const supabase = getSupabase();
      for (const [order, v] of views.entries()) {
        if (v.sort_order === order) continue;
        const { error } = await supabase
          .from("project_views")
          .update({ sort_order: order })
          .eq("id", v.id);
        if (error) throw error;
      }
      return views.map((v, order) => ({ ...v, sort_order: order }));
    },
    onSuccess: (views) => queryClient.setQueryData(viewsKey(projectId), views),
  });
}

/** Deletes a view, its sequence and colours (cascade), then the files of the sequence. */
export function useDeleteView(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (view: ProjectView) => {
      const folders = await viewOrbitFolders(view.id);
      const { data, error } = await getSupabase()
        .from("project_views")
        .delete()
        .eq("id", view.id)
        .select("id");
      if (error) throw error;
      if (data.length === 0) throw new AppError(NO_RIGHTS);
      for (const f of folders) await removeFolder(f).catch(() => undefined);
      return view.id;
    },
    onSuccess: (id) => {
      queryClient.setQueryData<ProjectView[]>(viewsKey(projectId), (views = []) =>
        views.filter((v) => v.id !== id),
      );
      queryClient.setQueryData<Orbits>(["orbit", projectId], (orbits) => {
        const next = new Map(orbits);
        next.delete(id);
        return next;
      });
    },
  });
}
