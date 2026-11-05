import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getSupabase } from "@/lib/supabase/client";
import type { Json } from "@/lib/supabase/database.types";
import { checkFile, readVideo, VIDEO_TYPES, VideoError } from "@/lib/video";
import { dbErrorMessage } from "./errors";
import { mediaFiles, posterPath, toMediaItem, type MediaItem, type MediaMeta } from "./media";
import type { Project } from "./projects";
import { removeFiles, uploadFile } from "./storage";

/* Camera moves of the 3D views (Vues tab): one video per view, exported from
   a 3D software and ending on the first image of the view. The public
   pages play it when a visitor picks that view, and the one of the main view
   when the page opens. Stored as a video of the media table whose
   meta.transition names the view (no gallery, no owner), files in
   <organization>/<project>/media/ like the other videos. */

export const TRANSITION_MAX_SECONDS = 20;

const transitionsKey = (projectId: string) => ["transitions", projectId] as const;

/** Camera move of each view: view id → video. */
export function useTransitions(projectId: string) {
  return useQuery({
    queryKey: transitionsKey(projectId),
    queryFn: async () => {
      const { data, error } = await getSupabase()
        .from("media")
        .select("*")
        .eq("project_id", projectId)
        .eq("kind", "video")
        .not("meta->>transition", "is", null);
      if (error) throw error;
      const byView = new Map<string, MediaItem>();
      for (const item of data.map(toMediaItem))
        if (item.meta.transition) byView.set(item.meta.transition, item);
      return byView;
    },
  });
}

/** Rows and files of the camera moves of a view (before it is deleted, or replaced). */
export async function removeTransitions(projectId: string, viewId: string) {
  const { data, error } = await getSupabase()
    .from("media")
    .delete()
    .eq("project_id", projectId)
    .eq("kind", "video")
    .eq("meta->>transition", viewId)
    .select("*");
  if (error) throw error;
  const files = data.flatMap((row) => mediaFiles(toMediaItem(row)));
  if (files.length) await removeFiles(files).catch(() => undefined);
}

/** Sends the camera move of a view, in place of the one it had. */
export function useUploadTransition(project: Project) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ viewId, file }: { viewId: string; file: File }) => {
      checkFile(file, VIDEO_TYPES, "une vidéo (MP4 ou WebM)");
      const info = await readVideo(file);
      if (info.duration > TRANSITION_MAX_SECONDS)
        throw new VideoError(
          `Vidéo de ${Math.round(info.duration)} s : un mouvement de caméra dure quelques secondes (${TRANSITION_MAX_SECONDS} s au plus).`,
        );
      const folder = `${project.organization_id}/${project.id}/media`;
      const path = `${folder}/${crypto.randomUUID()}.${file.type === "video/webm" ? "webm" : "mp4"}`;
      const poster = posterPath(path, info.poster.extension);
      const sent: string[] = [];
      try {
        await uploadFile(path, file);
        sent.push(path);
        await uploadFile(poster, info.poster.blob);
        sent.push(poster);
        await removeTransitions(project.id, viewId);
        const meta: MediaMeta = {
          width: info.width,
          height: info.height,
          duration: Math.round(info.duration * 10) / 10,
          poster,
          transition: viewId,
        };
        const { error } = await getSupabase()
          .from("media")
          .insert({
            project_id: project.id,
            kind: "video",
            path,
            meta: meta as Json,
            sort_order: 0,
          });
        if (error) throw error;
      } catch (error) {
        if (sent.length) await removeFiles(sent).catch(() => undefined);
        throw error instanceof VideoError ? error : new Error(dbErrorMessage(error));
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: transitionsKey(project.id) }),
  });
}

export function useDeleteTransition(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (viewId: string) => removeTransitions(projectId, viewId),
    onSettled: () => queryClient.invalidateQueries({ queryKey: transitionsKey(projectId) }),
  });
}
