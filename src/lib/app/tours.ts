import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ImageError, decodeImage, encodeImage, type EncodedImage } from "@/lib/image";
import { getSupabase } from "@/lib/supabase/client";
import type { Tables, TablesUpdate } from "@/lib/supabase/database.types";
import {
  PANO_LARGE,
  PANO_MAX_BYTES,
  PANO_MAX_PIXELS,
  PANO_MIN_WIDTH,
  PANO_SMALL,
  PANO_THUMB,
  clampPitch,
  groupTours,
  isEquirectangular,
  normalizeYaw,
  roomKey,
  roomNameFromFile,
  smallPanoramaPath,
  targetKey,
  thumbPanoramaPath,
  type TourTarget,
} from "@/lib/tours";
import { AppError, NO_RIGHTS } from "./errors";
import { mediaFiles, toMediaItem } from "./media";
import type { Project } from "./projects";
import { publicUrl, removeFiles, uploadFile } from "./storage";

/* 360° tours of a programme (Visite 360° tab): panoramas in three sizes
   (8 192 px, 4 096 px, thumbnail) in <organisation>/<programme>/panoramas/,
   and the arrows between rooms. */

export type Panorama = Tables<"panoramas">;
export type PanoramaLink = Tables<"panorama_links">;
export type PanoramaImage = { large: string; small: string; thumb: string };

export const panoramaImage = (room: Pick<Panorama, "image_path">): PanoramaImage => ({
  large: publicUrl(room.image_path),
  small: publicUrl(smallPanoramaPath(room.image_path)),
  thumb: publicUrl(thumbPanoramaPath(room.image_path)),
});

export const panoramaFiles = (path: string) => [
  path,
  smallPanoramaPath(path),
  thumbPanoramaPath(path),
];

const panoramasKey = (projectId: string) => ["panoramas", projectId] as const;
const linksKey = (projectId: string) => ["panorama-links", projectId] as const;

export function usePanoramas(projectId: string) {
  return useQuery({
    queryKey: panoramasKey(projectId),
    queryFn: async () => {
      const { data, error } = await getSupabase()
        .from("panoramas")
        .select("*")
        .eq("project_id", projectId)
        .order("sort_order")
        .order("created_at");
      if (error) throw error;
      return data;
    },
  });
}

export function usePanoramaLinks(projectId: string) {
  return useQuery({
    queryKey: linksKey(projectId),
    queryFn: async () => {
      const { data, error } = await getSupabase()
        .from("panorama_links")
        .select("*")
        .eq("project_id", projectId);
      if (error) throw error;
      return data;
    },
  });
}

/** The large version: 8 192 px where the browser allows such a canvas, else as large as it can. */
export async function encodeLarge(bitmap: ImageBitmap): Promise<EncodedImage> {
  try {
    const large = await encodeImage(bitmap, PANO_LARGE, 0.82, "jpg", PANO_MAX_PIXELS);
    // An oversized canvas can come back empty instead of failing (iOS).
    if (large.blob.size > 64 * 1024) return large;
  } catch {
    // Falls back to the size every browser accepts.
  }
  return encodeImage(bitmap, PANO_LARGE, 0.82);
}

export type PanoramaProgress = { index: number; count: number; phase: "preparing" | "uploading" };
export type PanoramaReport = { added: Panorama[]; failed: { name: string; reason: string }[] };

/** Prepares and sends the panoramas one after the other, as new rooms at the end of the tour. */
export function useUploadPanoramas(
  project: Project,
  onProgress?: (progress: PanoramaProgress | null) => void,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["upload-panoramas", project.id],
    mutationFn: async ({
      target,
      files,
    }: {
      target: TourTarget;
      files: File[];
    }): Promise<PanoramaReport> => {
      const key = targetKey(target);
      const rooms = (queryClient.getQueryData<Panorama[]>(panoramasKey(project.id)) ?? []).filter(
        (r) => roomKey(r) === key,
      );
      let order = rooms.reduce((max, r) => Math.max(max, r.sort_order), -1) + 1;
      const report: PanoramaReport = { added: [], failed: [] };

      for (const [index, file] of files.entries()) {
        onProgress?.({ index, count: files.length, phase: "preparing" });
        let uploaded: string[] = [];
        try {
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
            large = await encodeLarge(bitmap);
            small = await encodeImage(bitmap, PANO_SMALL, 0.8);
            thumb = await encodeImage(bitmap, PANO_THUMB, 0.75);
          } finally {
            bitmap.close();
          }

          onProgress?.({ index, count: files.length, phase: "uploading" });
          const path = `${project.organization_id}/${project.id}/panoramas/${crypto.randomUUID()}.${large.extension}`;
          await uploadFile(path, large.blob);
          uploaded = [path];
          await uploadFile(smallPanoramaPath(path), small.blob);
          uploaded.push(smallPanoramaPath(path));
          await uploadFile(thumbPanoramaPath(path), thumb.blob);
          uploaded.push(thumbPanoramaPath(path));

          const fallback = `Pièce ${rooms.length + report.added.length + 1}`;
          const { data, error } = await getSupabase()
            .from("panoramas")
            .insert({
              project_id: project.id,
              ...("lotId" in target
                ? { lot_id: target.lotId }
                : { lot_type: target.lotType.trim() }),
              name: roomNameFromFile(file.name, fallback),
              image_path: path,
              image_width: large.width,
              image_height: large.height,
              sort_order: order,
            })
            .select("*")
            .single();
          if (error) throw error;
          order += 1;
          report.added.push(data);
        } catch (error) {
          if (uploaded.length) await removeFiles(uploaded).catch(() => undefined);
          report.failed.push({
            name: file.name,
            reason:
              error instanceof ImageError
                ? error.message
                : "Envoi impossible. Vérifiez votre connexion internet.",
          });
        }
      }
      return report;
    },
    onSuccess: (report) =>
      queryClient.setQueryData<Panorama[]>(panoramasKey(project.id), (rooms = []) => [
        ...rooms,
        ...report.added,
      ]),
    onSettled: () => onProgress?.(null),
  });
}

export function useUpdatePanorama(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, values }: { id: string; values: TablesUpdate<"panoramas"> }) => {
      const { data, error } = await getSupabase()
        .from("panoramas")
        .update(values)
        .eq("id", id)
        .select("*");
      if (error) throw error;
      const saved = data[0];
      if (!saved) throw new AppError(NO_RIGHTS);
      return saved;
    },
    onSuccess: (room) =>
      queryClient.setQueryData<Panorama[]>(panoramasKey(projectId), (rooms = []) =>
        rooms.map((r) => (r.id === room.id ? room : r)),
      ),
  });
}

/** Moves a room one place earlier (-1) or later (1) in its tour; the first one is the entrance. */
export function useMovePanorama(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, step }: { id: string; step: -1 | 1 }) => {
      const all = queryClient.getQueryData<Panorama[]>(panoramasKey(projectId)) ?? [];
      const room = all.find((r) => r.id === id);
      if (!room) return all;
      const tour = [...(groupTours(all).get(roomKey(room)) ?? [])];
      const i = tour.findIndex((r) => r.id === id);
      const j = i + step;
      if (j < 0 || j >= tour.length) return all;
      tour.splice(i, 1);
      tour.splice(j, 0, room);
      const supabase = getSupabase();
      for (const [order, r] of tour.entries()) {
        if (r.sort_order === order) continue;
        const { error } = await supabase
          .from("panoramas")
          .update({ sort_order: order })
          .eq("id", r.id);
        if (error) throw error;
      }
      const orders = new Map(tour.map((r, order) => [r.id, order]));
      return all.map((r) => (orders.has(r.id) ? { ...r, sort_order: orders.get(r.id)! } : r));
    },
    onSuccess: (rooms) => queryClient.setQueryData(panoramasKey(projectId), rooms),
  });
}

/** Deletes rooms (one, or a whole tour), their arrows (cascade) and their files. */
export function useDeletePanoramas(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (rooms: Panorama[]) => {
      const ids = rooms.map((r) => r.id);
      const { data, error } = await getSupabase()
        .from("panoramas")
        .delete()
        .in("id", ids)
        .select("id");
      if (error) throw error;
      if (data.length < ids.length) throw new AppError(NO_RIGHTS);
      await removeFiles(rooms.flatMap((r) => panoramaFiles(r.image_path))).catch(() => undefined);
      return new Set(ids);
    },
    onSuccess: (removed) => {
      queryClient.setQueryData<Panorama[]>(panoramasKey(projectId), (rooms = []) =>
        rooms.filter((r) => !removed.has(r.id)),
      );
      queryClient.setQueryData<PanoramaLink[]>(linksKey(projectId), (links = []) =>
        links.filter((l) => !removed.has(l.from_id) && !removed.has(l.to_id)),
      );
    },
  });
}

/** Places (or moves) the arrow from one room to another. */
export function useSaveLink(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      fromId,
      toId,
      yaw,
      pitch,
    }: {
      fromId: string;
      toId: string;
      yaw: number;
      pitch: number;
    }) => {
      const { data, error } = await getSupabase()
        .from("panorama_links")
        .upsert(
          {
            project_id: projectId,
            from_id: fromId,
            to_id: toId,
            yaw: normalizeYaw(yaw),
            pitch: clampPitch(pitch),
          },
          { onConflict: "from_id,to_id" },
        )
        .select("*")
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (link) =>
      queryClient.setQueryData<PanoramaLink[]>(linksKey(projectId), (links = []) => [
        ...links.filter((l) => !(l.from_id === link.from_id && l.to_id === link.to_id)),
        link,
      ]),
  });
}

export function useDeleteLink(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await getSupabase().from("panorama_links").delete().eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: (id) =>
      queryClient.setQueryData<PanoramaLink[]>(linksKey(projectId), (links = []) =>
        links.filter((l) => l.id !== id),
      ),
  });
}

/** Files of the lots about to be deleted: their media and the rooms of their own tour. */
export async function lotFiles(ids: string[]): Promise<string[]> {
  const supabase = getSupabase();
  const [rooms, photos] = await Promise.all([
    supabase.from("panoramas").select("image_path").in("lot_id", ids),
    supabase.from("media").select("*").in("lot_id", ids),
  ]);
  return [
    ...(rooms.data ?? []).flatMap((r) => panoramaFiles(r.image_path)),
    ...(photos.data ?? []).flatMap((m) => mediaFiles(toMediaItem(m))),
  ];
}
