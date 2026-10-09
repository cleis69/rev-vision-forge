import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ImageError, decodeImage, encodeImage } from "@/lib/image";
import { getSupabase } from "@/lib/supabase/client";
import type { Tables } from "@/lib/supabase/database.types";
import {
  PANO_MAX_BYTES,
  PANO_MIN_WIDTH,
  PANO_SMALL,
  PANO_THUMB,
  clampPitch,
  isEquirectangular,
  normalizeYaw,
  smallPanoramaPath,
  thumbPanoramaPath,
} from "@/lib/tours";
import { dbErrorMessage } from "./errors";
import type { ProjectView } from "./plan";
import type { Project } from "./projects";
import { publicUrl, removeFiles, uploadFile } from "./storage";
import { encodeLarge, panoramaFiles } from "./tours";

/* A view of the programme shown as a 360° panorama (an aerial view above
   all) rather than an orbital sequence: the panorama in three sizes in
   <organisation>/<programme>/views/<view>/, and a marker for each lot it
   shows, placed by the promoter where the lot stands (Vues tab). */

export type ViewMarker = Tables<"view_markers">;

export const viewPanoramaImage = (path: string) => ({
  large: publicUrl(path),
  small: publicUrl(smallPanoramaPath(path)),
  thumb: publicUrl(thumbPanoramaPath(path)),
});

const viewsKey = (projectId: string) => ["views", projectId] as const;
const markersKey = (projectId: string) => ["view-markers", projectId] as const;

const replaceView = (views: ProjectView[] = [], view: ProjectView) =>
  views.map((v) => (v.id === view.id ? view : v));

/** Sends the panorama of a view (replacing the previous one). */
export function useUploadViewPanorama(project: Project) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ view, file }: { view: ProjectView; file: File }) => {
      const bitmap = await decodeImage(file, PANO_MAX_BYTES);
      let large, small, thumb;
      try {
        if (!isEquirectangular(bitmap.width, bitmap.height)) {
          throw new ImageError(
            `Ce n'est pas un panorama 360° : l'image doit être deux fois plus large que haute (${bitmap.width} × ${bitmap.height} px).`,
          );
        }
        if (bitmap.width < PANO_MIN_WIDTH) {
          throw new ImageError(
            `Panorama trop petit : ${PANO_MIN_WIDTH} px de large au moins, 6 000 px ou plus conseillés.`,
          );
        }
        large = await encodeLarge(bitmap, file);
        small = await encodeImage(bitmap, PANO_SMALL, 0.88);
        thumb = await encodeImage(bitmap, PANO_THUMB, 0.75);
      } finally {
        bitmap.close();
      }
      const path = `${project.organization_id}/${project.id}/views/${view.id}/${crypto.randomUUID()}.${large.extension}`;
      const uploaded: string[] = [];
      try {
        await uploadFile(path, large.blob);
        uploaded.push(path);
        await uploadFile(smallPanoramaPath(path), small.blob);
        uploaded.push(smallPanoramaPath(path));
        await uploadFile(thumbPanoramaPath(path), thumb.blob);
        uploaded.push(thumbPanoramaPath(path));
        const { data, error } = await getSupabase()
          .from("project_views")
          .update({
            panorama_path: path,
            panorama_width: large.width,
            panorama_height: large.height,
          })
          .eq("id", view.id)
          .select("*")
          .single();
        if (error) throw error;
        if (view.panorama_path)
          await removeFiles(panoramaFiles(view.panorama_path)).catch(() => undefined);
        return data;
      } catch (error) {
        if (uploaded.length) await removeFiles(uploaded).catch(() => undefined);
        throw error;
      }
    },
    onSuccess: (view) =>
      queryClient.setQueryData<ProjectView[]>(viewsKey(project.id), (views) =>
        replaceView(views, view),
      ),
  });
}

/** The view goes back to having no panorama; its markers go with it. */
export function useRemoveViewPanorama(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (view: ProjectView) => {
      const supabase = getSupabase();
      const { error: markersError } = await supabase
        .from("view_markers")
        .delete()
        .eq("view_id", view.id);
      if (markersError) throw markersError;
      const { data, error } = await supabase
        .from("project_views")
        .update({ panorama_path: null, panorama_width: null, panorama_height: null })
        .eq("id", view.id)
        .select("*")
        .single();
      if (error) throw error;
      if (view.panorama_path)
        await removeFiles(panoramaFiles(view.panorama_path)).catch(() => undefined);
      return data;
    },
    onSuccess: (view) => {
      queryClient.setQueryData<ProjectView[]>(viewsKey(projectId), (views) =>
        replaceView(views, view),
      );
      queryClient.setQueryData<ViewMarker[]>(markersKey(projectId), (markers = []) =>
        markers.filter((m) => m.view_id !== view.id),
      );
    },
  });
}

export function useViewMarkers(projectId: string) {
  return useQuery({
    queryKey: markersKey(projectId),
    queryFn: async () => {
      const { data, error } = await getSupabase()
        .from("view_markers")
        .select("*")
        .eq("project_id", projectId);
      if (error) throw error;
      return data;
    },
  });
}

/** Places (or moves) the marker of a lot on a view. */
export function useSaveViewMarker(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (values: { viewId: string; lotId: string; yaw: number; pitch: number }) => {
      const { data, error } = await getSupabase()
        .from("view_markers")
        .upsert(
          {
            project_id: projectId,
            view_id: values.viewId,
            lot_id: values.lotId,
            yaw: normalizeYaw(values.yaw),
            pitch: clampPitch(values.pitch),
          },
          { onConflict: "view_id,lot_id" },
        )
        .select("*")
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (marker) =>
      queryClient.setQueryData<ViewMarker[]>(markersKey(projectId), (markers = []) => [
        ...markers.filter((m) => !(m.view_id === marker.view_id && m.lot_id === marker.lot_id)),
        marker,
      ]),
  });
}

export function useDeleteViewMarker(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await getSupabase().from("view_markers").delete().eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: (id) =>
      queryClient.setQueryData<ViewMarker[]>(markersKey(projectId), (markers = []) =>
        markers.filter((m) => m.id !== id),
      ),
  });
}

export const panoramaError = (error: unknown) =>
  error instanceof ImageError ? error.message : dbErrorMessage(error);
