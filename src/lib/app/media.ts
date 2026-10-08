import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { decodeImage, encodeImage, ImageError, PLAN_TYPES } from "@/lib/image";
import { getSupabase } from "@/lib/supabase/client";
import type { Enums, Json, Tables } from "@/lib/supabase/database.types";
import { checkFile, DOCUMENT_TYPES, readVideo, VIDEO_TYPES, VideoError } from "@/lib/video";
import { dbErrorMessage } from "./errors";
import type { Project } from "./projects";
import { publicUrl, removeFiles, uploadFile } from "./storage";

/* Media of a programme, in the media table, files side by side in
   <organization_id>/<project_id>/media/:
   - photos (kind "image") and plans of a type (kind "plan"): a 2 048 px WebP
     and an 800 px thumbnail;
   - videos (kind "video"): the MP4 or WebM file as sent, and a still
     (<name>-poster.webp) shown before it plays;
   - documents (kind "document"): a PDF, offered for download under its name.
   Each belongs to the programme (gallery), to a lot (its sheet), or to every
   lot of a type (Typologies section). The order of the gallery is sort_order. */

export const MEDIA_LARGE = 2048;
export const MEDIA_THUMB = 800;

export type MediaKind = Extract<Enums<"media_kind">, "image" | "plan" | "video" | "document">;
export const MEDIA_KINDS: readonly MediaKind[] = ["image", "plan", "video", "document"];

/** Photos only: outside, inside (filters of the gallery). */
export type MediaCategory = "exterieur" | "interieur";
export const CATEGORY_LABELS: Record<MediaCategory, string> = {
  exterieur: "Extérieur",
  interieur: "Intérieur",
};

export type MediaMeta = {
  width?: number;
  height?: number;
  caption?: string;
  category?: MediaCategory;
  /** Videos: length in seconds, path of the poster. */
  duration?: number;
  poster?: string;
  /** Documents: name of the file as sent, and its size in bytes. */
  name?: string;
  size?: number;
};
export type MediaItem = Omit<Tables<"media">, "meta"> & { meta: MediaMeta };

/** Owner of a media: the programme (null), a lot, or every lot of a type. */
export type MediaOwner = { lot_id: string } | { lot_type: string } | null;

export const thumbPath = (path: string) => path.replace(/(\.[a-z0-9]+)$/i, "-800$1");
export const posterPath = (path: string, extension: string) =>
  path.replace(/\.[a-z0-9]+$/i, `-poster.${extension}`);

export function mediaImage(item: Pick<MediaItem, "path" | "meta">) {
  return {
    large: publicUrl(item.path),
    thumb: publicUrl(thumbPath(item.path)),
    width: item.meta.width ?? 4,
    height: item.meta.height ?? 3,
    caption: item.meta.caption ?? "",
  };
}

export function mediaVideo(item: Pick<MediaItem, "path" | "meta">) {
  return {
    src: publicUrl(item.path),
    poster: item.meta.poster ? publicUrl(item.meta.poster) : null,
    width: item.meta.width ?? 16,
    height: item.meta.height ?? 9,
    duration: item.meta.duration ?? 0,
    caption: item.meta.caption ?? "",
  };
}

export function mediaDocument(item: Pick<MediaItem, "path" | "meta">) {
  return {
    url: publicUrl(item.path),
    name: item.meta.name ?? "Document.pdf",
    size: item.meta.size ?? 0,
    caption: item.meta.caption ?? "",
  };
}

/** Every file of a media in the storage. */
export function mediaFiles(item: Pick<MediaItem, "kind" | "path" | "meta">): string[] {
  if (item.kind === "video") return item.meta.poster ? [item.path, item.meta.poster] : [item.path];
  if (item.kind === "document") return [item.path];
  return [item.path, thumbPath(item.path)];
}

/** Label of the owner, in the promoter space. */
export const ownerOf = (item: Pick<MediaItem, "lot_id" | "lot_type">): MediaOwner =>
  item.lot_id ? { lot_id: item.lot_id } : item.lot_type ? { lot_type: item.lot_type } : null;

const readMeta = (meta: Json): MediaMeta => {
  if (!meta || typeof meta !== "object" || Array.isArray(meta)) return {};
  const { width, height, caption, category, duration, poster, name, size } = meta as Record<
    string,
    unknown
  >;
  return {
    ...(typeof width === "number" ? { width } : {}),
    ...(typeof height === "number" ? { height } : {}),
    ...(typeof caption === "string" ? { caption } : {}),
    ...(category === "exterieur" || category === "interieur" ? { category } : {}),
    ...(typeof duration === "number" ? { duration } : {}),
    ...(typeof poster === "string" ? { poster } : {}),
    ...(typeof name === "string" ? { name } : {}),
    ...(typeof size === "number" ? { size } : {}),
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
        .in("kind", [...MEDIA_KINDS])
        .order("sort_order");
      if (error) throw error;
      return data.map(toMediaItem);
    },
  });
}

/** Files the media tab takes, by kind. */
export const ACCEPTED_TYPES = [...PLAN_TYPES, ...VIDEO_TYPES, ...DOCUMENT_TYPES];

export type UploadReport = { added: number; failed: { name: string; reason: string }[] };
export type UploadRequest = {
  files: File[];
  owner?: MediaOwner;
  /** Images sent as plans of their type rather than photos. */
  asPlan?: boolean;
};

/** Uploads files one after the other; a file that fails does not stop the others. */
export function useUploadMedia(
  project: Project,
  onProgress?: (done: number, total: number) => void,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ files, owner = null, asPlan = false }: UploadRequest) => {
      const current = queryClient.getQueryData<MediaItem[]>(mediaKey(project.id)) ?? [];
      let order = current.reduce((max, m) => Math.max(max, m.sort_order), 0);
      const report: UploadReport = { added: 0, failed: [] };
      const folder = `${project.organization_id}/${project.id}/media`;
      for (const [index, file] of files.entries()) {
        onProgress?.(index, files.length);
        const uploaded: string[] = [];
        const send = async (path: string, blob: Blob) => {
          await uploadFile(path, blob);
          uploaded.push(path);
        };
        try {
          const id = crypto.randomUUID();
          let row: { kind: MediaKind; path: string; meta: MediaMeta };
          if (VIDEO_TYPES.includes(file.type)) {
            const info = await readVideo(file);
            const path = `${folder}/${id}.${file.type === "video/webm" ? "webm" : "mp4"}`;
            const poster = posterPath(path, info.poster.extension);
            await send(path, file);
            await send(poster, info.poster.blob);
            row = {
              kind: "video",
              path,
              meta: {
                width: info.width,
                height: info.height,
                duration: Math.round(info.duration * 10) / 10,
                poster,
              },
            };
          } else if (DOCUMENT_TYPES.includes(file.type)) {
            checkFile(file, DOCUMENT_TYPES, "un document (PDF)");
            const path = `${folder}/${id}.pdf`;
            await send(path, file);
            row = { kind: "document", path, meta: { name: file.name, size: file.size } };
          } else {
            const bitmap = await decodeImage(file);
            let large, thumb;
            try {
              large = await encodeImage(bitmap, MEDIA_LARGE, 0.82);
              thumb = await encodeImage(bitmap, MEDIA_THUMB, 0.8);
            } finally {
              bitmap.close();
            }
            const path = `${folder}/${id}.${large.extension}`;
            await send(path, large.blob);
            await send(thumbPath(path), thumb.blob);
            row = {
              kind: asPlan ? "plan" : "image",
              path,
              meta: { width: large.width, height: large.height },
            };
          }
          const { error } = await getSupabase()
            .from("media")
            .insert({
              project_id: project.id,
              kind: row.kind,
              path: row.path,
              meta: row.meta as Json,
              sort_order: ++order,
              lot_id: owner && "lot_id" in owner ? owner.lot_id : null,
              lot_type: owner && "lot_type" in owner ? owner.lot_type : null,
            });
          if (error) throw error;
          report.added++;
        } catch (error) {
          if (uploaded.length) await removeFiles(uploaded).catch(() => undefined);
          report.failed.push({
            name: file.name,
            reason:
              error instanceof ImageError || error instanceof VideoError
                ? error.message
                : dbErrorMessage(error),
          });
        }
      }
      onProgress?.(files.length, files.length);
      return report;
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: mediaKey(project.id) }),
  });
}

export type MediaChange = {
  lot_id?: string | null;
  lot_type?: string | null;
  kind?: "image" | "plan";
  meta?: MediaMeta;
  sort_order?: number;
};

/** Values of a new owner: the other owner cleared. */
export const ownerValues = (owner: MediaOwner): MediaChange => ({
  lot_id: owner && "lot_id" in owner ? owner.lot_id : null,
  lot_type: owner && "lot_type" in owner ? owner.lot_type : null,
});

/** Saves a caption, an owner or a position right away; goes back on failure. */
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
      await removeFiles(mediaFiles(item)).catch(() => undefined);
      return item.id;
    },
    onSuccess: (id) =>
      queryClient.setQueryData<MediaItem[]>(mediaKey(projectId), (items = []) =>
        items.filter((m) => m.id !== id),
      ),
  });
}
