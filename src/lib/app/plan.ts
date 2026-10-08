import { useMutation, useMutationState, useQuery, useQueryClient } from "@tanstack/react-query";

import { decodeImage, encodeImage } from "@/lib/image";
import { parsePoints, roundPoint, type Point } from "@/lib/geometry";
import { getSupabase } from "@/lib/supabase/client";
import type { Tables, TablesUpdate } from "@/lib/supabase/database.types";
import type { ViewPreset } from "@/lib/views";
import { AppError, NO_RIGHTS } from "./errors";
import type { Project } from "./projects";
import { publicUrl, removeFiles, smallPlanPath, uploadFile } from "./storage";

/* Views of a programme (Vues tab): aerial view, roof, floors, pedestrian
   view…, each with its image in two sizes, and the shapes of the lots on
   each view (a lot can be traced on several views, once on each). */

export const PLAN_LARGE = 4096;
export const PLAN_SMALL = 1600;

export type ProjectView = Tables<"project_views">;
export type PlanImage = { large: string; small: string; width: number; height: number };

export function viewImage(
  view: Pick<ProjectView, "image_path" | "image_width" | "image_height">,
): PlanImage | null {
  const { image_path: path, image_width: width, image_height: height } = view;
  if (!path || !width || !height) return null;
  return { large: publicUrl(path), small: publicUrl(smallPlanPath(path)), width, height };
}

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

/** Marks the view shown first on the public pages (null: the default one). */
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

/** Deletes a view, its shapes (cascade) and its image. */
export function useDeleteView(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (view: ProjectView) => {
      const { data, error } = await getSupabase()
        .from("project_views")
        .delete()
        .eq("id", view.id)
        .select("id");
      if (error) throw error;
      if (data.length === 0) throw new AppError(NO_RIGHTS);
      if (view.image_path)
        await removeFiles([view.image_path, smallPlanPath(view.image_path)]).catch(() => undefined);
      return view.id;
    },
    onSuccess: (id) => {
      queryClient.setQueryData<ProjectView[]>(viewsKey(projectId), (views = []) =>
        views.filter((v) => v.id !== id),
      );
      queryClient.setQueryData<ShapesByView>(shapesKey(projectId), (shapes) => {
        const next = new Map(shapes);
        next.delete(id);
        return next;
      });
    },
  });
}

export type UploadPhase = "preparing" | "uploading";

/** Resizes the image, uploads both sizes, points the view to them, then removes the old image. */
export function useUploadViewImage(
  project: Project,
  view: ProjectView,
  onPhase?: (phase: UploadPhase) => void,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["upload-view", view.id],
    mutationFn: async (file: File) => {
      onPhase?.("preparing");
      const bitmap = await decodeImage(file);
      let large, small;
      try {
        large = await encodeImage(bitmap, PLAN_LARGE);
        small = await encodeImage(bitmap, PLAN_SMALL);
      } finally {
        bitmap.close();
      }

      onPhase?.("uploading");
      const path = `${project.organization_id}/${project.id}/plan/${crypto.randomUUID()}.${large.extension}`;
      const smallPath = smallPlanPath(path);
      await uploadFile(path, large.blob);
      try {
        await uploadFile(smallPath, small.blob);
        const { data, error } = await getSupabase()
          .from("project_views")
          .update({ image_path: path, image_width: large.width, image_height: large.height })
          .eq("id", view.id)
          .select("*")
          .single();
        if (error) throw error;
        // The new image is in place: the old files are no longer used.
        const old = view.image_path;
        if (old) await removeFiles([old, smallPlanPath(old)]).catch(() => undefined);
        return data;
      } catch (error) {
        await removeFiles([path, smallPath]).catch(() => undefined);
        throw error;
      }
    },
    onSuccess: (saved) =>
      queryClient.setQueryData<ProjectView[]>(viewsKey(project.id), (views = []) =>
        views.map((v) => (v.id === saved.id ? saved : v)),
      ),
  });
}

/** True while an image of this view is being uploaded. */
export const useUploadingView = (viewId: string) =>
  useMutationState({ filters: { mutationKey: ["upload-view", viewId], status: "pending" } })
    .length > 0;

/* ------------------------------------------------------------------ shapes */

/** Shapes of the programme: by view, then by lot. */
export type ShapesByView = Map<string, Map<string, Point[]>>;

const shapesKey = (projectId: string) => ["shapes", projectId] as const;

export function useShapes(projectId: string) {
  return useQuery({
    queryKey: shapesKey(projectId),
    queryFn: async () => {
      const { data, error } = await getSupabase()
        .from("lot_shapes")
        .select("view_id, lot_id, points")
        .eq("project_id", projectId);
      if (error) throw error;
      const shapes: ShapesByView = new Map();
      for (const row of data) {
        const points = parsePoints(row.points);
        if (!points) continue;
        const view = shapes.get(row.view_id) ?? new Map<string, Point[]>();
        view.set(row.lot_id, points);
        shapes.set(row.view_id, view);
      }
      return shapes;
    },
  });
}

const withShape = (
  shapes: ShapesByView | undefined,
  viewId: string,
  lotId: string,
  points: Point[] | null,
): ShapesByView => {
  const next = new Map(shapes);
  const view = new Map(next.get(viewId));
  if (points) view.set(lotId, points);
  else view.delete(lotId);
  next.set(viewId, view);
  return next;
};

/** Saves the shape of a lot on a view right away; goes back on failure. */
export function useSaveShape(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      viewId,
      lotId,
      points,
    }: {
      viewId: string;
      lotId: string;
      points: Point[];
    }) => {
      const { error } = await getSupabase()
        .from("lot_shapes")
        .upsert(
          {
            view_id: viewId,
            lot_id: lotId,
            project_id: projectId,
            points: points.map(roundPoint),
          },
          { onConflict: "lot_id,view_id" },
        );
      if (error) throw error;
    },
    onMutate: async ({ viewId, lotId, points }) => {
      await queryClient.cancelQueries({ queryKey: shapesKey(projectId) });
      const previous = queryClient.getQueryData<ShapesByView>(shapesKey(projectId));
      queryClient.setQueryData<ShapesByView>(shapesKey(projectId), (shapes) =>
        withShape(shapes, viewId, lotId, points.map(roundPoint)),
      );
      return { previous };
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(shapesKey(projectId), context.previous);
    },
  });
}

export function useDeleteShape(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ viewId, lotId }: { viewId: string; lotId: string }) => {
      const { error } = await getSupabase()
        .from("lot_shapes")
        .delete()
        .eq("view_id", viewId)
        .eq("lot_id", lotId);
      if (error) throw error;
    },
    onMutate: async ({ viewId, lotId }) => {
      await queryClient.cancelQueries({ queryKey: shapesKey(projectId) });
      const previous = queryClient.getQueryData<ShapesByView>(shapesKey(projectId));
      queryClient.setQueryData<ShapesByView>(shapesKey(projectId), (shapes) =>
        withShape(shapes, viewId, lotId, null),
      );
      return { previous };
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(shapesKey(projectId), context.previous);
    },
  });
}

/** Lots traced on at least one view. */
export const tracedLots = (shapes: ShapesByView | undefined): Set<string> =>
  new Set([...(shapes?.values() ?? [])].flatMap((view) => [...view.keys()]));
