import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { decodeImage, encodeImage, ImageError } from "@/lib/image";
import { getSupabase } from "@/lib/supabase/client";
import type { Json, Tables } from "@/lib/supabase/database.types";
import { dbErrorMessage } from "./errors";
import type { Project } from "./projects";
import { publicUrl, removeFiles, uploadFile } from "./storage";

/* Photos of a programme (lot_id null) or of a lot, in the media table
   (kind "image"): a 2 048 px WebP and an 800 px thumbnail, side by side in
   <organization_id>/<project_id>/media/. The order of the gallery is sort_order. */

export const MEDIA_LARGE = 2048;
export const MEDIA_THUMB = 800;

export type MediaMeta = { width?: number; height?: number; caption?: string };
export type MediaItem = Omit<Tables<"media">, "meta"> & { meta: MediaMeta };

export const thumbPath = (path: string) => path.replace(/(\.[a-z0-9]+)$/i, "-800$1");

export function mediaImage(item: Pick<MediaItem, "path" | "meta">) {
  return {
    large: publicUrl(item.path),
    thumb: publicUrl(thumbPath(item.path)),
    width: item.meta.width ?? 4,
    height: item.meta.height ?? 3,
    caption: item.meta.caption ?? "",
  };
}

const readMeta = (meta: Json): MediaMeta => {
  if (!meta || typeof meta !== "object" || Array.isArray(meta)) return {};
  const { width, height, caption } = meta as Record<string, unknown>;
  return {
    ...(typeof width === "number" ? { width } : {}),
    ...(typeof height === "number" ? { height } : {}),
    ...(typeof caption === "string" ? { caption } : {}),
  };
};

export const toMediaItem = (row: Tables<"media">): MediaItem => ({
  ...row,
  meta: readMeta(row.meta),
});

const mediaKey = (projectId: string) => ["media", projectId] as const;

export function useMedia(projectId: string) {
  return useQuery({
    queryKey: mediaKey(projectId),
    queryFn: async () => {
      const { data, error } = await getSupabase()
        .from("media")
        .select("*")
        .eq("project_id", projectId)
        .eq("kind", "image")
        .order("sort_order");
      if (error) throw error;
      return data.map(toMediaItem);
    },
  });
}

export type UploadReport = { added: number; failed: { name: string; reason: string }[] };

/** Uploads photos one after the other; a file that fails does not stop the others. */
export function useUploadMedia(
  project: Project,
  onProgress?: (done: number, total: number) => void,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (files: File[]): Promise<UploadReport> => {
      const current = queryClient.getQueryData<MediaItem[]>(mediaKey(project.id)) ?? [];
      let order = current.reduce((max, m) => Math.max(max, m.sort_order), 0);
      const report: UploadReport = { added: 0, failed: [] };
      for (const [index, file] of files.entries()) {
        onProgress?.(index, files.length);
        let uploaded: string[] = [];
        try {
          const bitmap = await decodeImage(file);
          let large, thumb;
          try {
            large = await encodeImage(bitmap, MEDIA_LARGE, 0.82);
            thumb = await encodeImage(bitmap, MEDIA_THUMB, 0.8);
          } finally {
            bitmap.close();
          }
          const path = `${project.organization_id}/${project.id}/media/${crypto.randomUUID()}.${large.extension}`;
          await uploadFile(path, large.blob);
          uploaded = [path];
          await uploadFile(thumbPath(path), thumb.blob);
          uploaded.push(thumbPath(path));
          const { error } = await getSupabase()
            .from("media")
            .insert({
              project_id: project.id,
              kind: "image",
              path,
              sort_order: ++order,
              meta: { width: large.width, height: large.height },
            });
          if (error) throw error;
          report.added++;
        } catch (error) {
          if (uploaded.length) await removeFiles(uploaded).catch(() => undefined);
          report.failed.push({
            name: file.name,
            reason: error instanceof ImageError ? error.message : dbErrorMessage(error),
          });
        }
      }
      onProgress?.(files.length, files.length);
      return report;
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: mediaKey(project.id) }),
  });
}

type MediaChange = { lot_id?: string | null; meta?: MediaMeta; sort_order?: number };

/** Saves a caption, a lot or a position right away; goes back on failure. */
export function useUpdateMedia(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (changes: { id: string; values: MediaChange }[]) => {
      const results = await Promise.all(
        changes.map(({ id, values: { meta, ...rest } }) =>
          getSupabase()
            .from("media")
            .update({ ...rest, ...(meta ? { meta: meta as Json } : {}) })
            .eq("id", id),
        ),
      );
      const failed = results.find((r) => r.error);
      if (failed?.error) throw failed.error;
    },
    onMutate: async (changes) => {
      await queryClient.cancelQueries({ queryKey: mediaKey(projectId) });
      const previous = queryClient.getQueryData<MediaItem[]>(mediaKey(projectId));
      const byId = new Map(changes.map((c) => [c.id, c.values]));
      queryClient.setQueryData<MediaItem[]>(mediaKey(projectId), (items = []) =>
        items
          .map((m) => {
            const values = byId.get(m.id);
            return values ? { ...m, ...values, meta: values.meta ?? m.meta } : m;
          })
          .sort((a, b) => a.sort_order - b.sort_order),
      );
      return { previous };
    },
    onError: (_error, _changes, context) => {
      if (context?.previous) queryClient.setQueryData(mediaKey(projectId), context.previous);
    },
  });
}

export function useDeleteMedia(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (item: MediaItem) => {
      const { error } = await getSupabase().from("media").delete().eq("id", item.id);
      if (error) throw error;
      // The programme still exists, so its files can be removed afterwards.
      await removeFiles([item.path, thumbPath(item.path)]).catch(() => undefined);
      return item.id;
    },
    onSuccess: (id) =>
      queryClient.setQueryData<MediaItem[]>(mediaKey(projectId), (items = []) =>
        items.filter((m) => m.id !== id),
      ),
  });
}
