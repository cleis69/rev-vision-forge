import { useMutation, useMutationState, useQuery, useQueryClient } from "@tanstack/react-query";

import { decodeImage, encodeImage } from "@/lib/image";
import { parsePoints, roundPoint, type Point } from "@/lib/geometry";
import { getSupabase } from "@/lib/supabase/client";
import type { Project } from "./projects";
import { publicUrl, removeFiles, smallPlanPath, uploadFile } from "./storage";

/* Plan of a programme (one image, two sizes) and the shapes of its lots. */

export const PLAN_LARGE = 4096;
export const PLAN_SMALL = 1600;

export function planImages(
  project: Pick<Project, "plan_image_path" | "plan_width" | "plan_height">,
) {
  const { plan_image_path: path, plan_width: width, plan_height: height } = project;
  if (!path || !width || !height) return null;
  return { large: publicUrl(path), small: publicUrl(smallPlanPath(path)), width, height };
}

export type UploadPhase = "preparing" | "uploading";

/** Resizes the image, uploads both sizes, points the programme to them, then removes the old plan. */
export function useUploadPlan(project: Project, onPhase?: (phase: UploadPhase) => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["upload-plan", project.id],
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
          .from("projects")
          .update({ plan_image_path: path, plan_width: large.width, plan_height: large.height })
          .eq("id", project.id)
          .select("*")
          .single();
        if (error) throw error;
        // The new plan is in place: the old files are no longer used.
        const old = project.plan_image_path;
        if (old) await removeFiles([old, smallPlanPath(old)]).catch(() => undefined);
        return data;
      } catch (error) {
        await removeFiles([path, smallPath]).catch(() => undefined);
        throw error;
      }
    },
    onSuccess: (saved) => {
      queryClient.setQueryData(["project", saved.id], saved);
      return queryClient.invalidateQueries({ queryKey: ["projects", saved.organization_id] });
    },
  });
}

/** True while a plan of this programme is being uploaded. */
export const useUploadingPlan = (projectId: string) =>
  useMutationState({ filters: { mutationKey: ["upload-plan", projectId], status: "pending" } })
    .length > 0;

/* ------------------------------------------------------------------ shapes */

const shapesKey = (projectId: string) => ["shapes", projectId] as const;

/** Shapes of the programme, by lot id. */
export function useShapes(projectId: string) {
  return useQuery({
    queryKey: shapesKey(projectId),
    queryFn: async () => {
      const { data, error } = await getSupabase()
        .from("lot_shapes")
        .select("lot_id, points")
        .eq("project_id", projectId);
      if (error) throw error;
      const shapes = new Map<string, Point[]>();
      for (const row of data) {
        const points = parsePoints(row.points);
        if (points) shapes.set(row.lot_id, points);
      }
      return shapes;
    },
  });
}

/** Saves the shape of a lot right away (one shape per lot); goes back on failure. */
export function useSaveShape(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ lotId, points }: { lotId: string; points: Point[] }) => {
      const { error } = await getSupabase()
        .from("lot_shapes")
        .upsert(
          { lot_id: lotId, project_id: projectId, points: points.map(roundPoint) },
          { onConflict: "lot_id" },
        );
      if (error) throw error;
    },
    onMutate: async ({ lotId, points }) => {
      await queryClient.cancelQueries({ queryKey: shapesKey(projectId) });
      const previous = queryClient.getQueryData<Map<string, Point[]>>(shapesKey(projectId));
      queryClient.setQueryData<Map<string, Point[]>>(shapesKey(projectId), (shapes) =>
        new Map(shapes).set(lotId, points.map(roundPoint)),
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
    mutationFn: async (lotId: string) => {
      const { error } = await getSupabase().from("lot_shapes").delete().eq("lot_id", lotId);
      if (error) throw error;
    },
    onMutate: async (lotId) => {
      await queryClient.cancelQueries({ queryKey: shapesKey(projectId) });
      const previous = queryClient.getQueryData<Map<string, Point[]>>(shapesKey(projectId));
      queryClient.setQueryData<Map<string, Point[]>>(shapesKey(projectId), (shapes) => {
        const next = new Map(shapes);
        next.delete(lotId);
        return next;
      });
      return { previous };
    },
    onError: (_error, _lotId, context) => {
      if (context?.previous) queryClient.setQueryData(shapesKey(projectId), context.previous);
    },
  });
}
