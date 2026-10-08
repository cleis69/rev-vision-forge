import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { fitWithin } from "@/lib/geometry";
import { ImageError, encodeImage } from "@/lib/image";
import {
  carryLinks,
  checkSequence,
  countColors,
  lotColors,
  sortByName,
  type MaskColor,
} from "@/lib/orbit-mask";
import { getSupabase } from "@/lib/supabase/client";
import type { Tables } from "@/lib/supabase/database.types";
import { AppError } from "./errors";
import type { ProjectView } from "./plan";
import type { Project } from "./projects";
import { publicUrl, removeFiles, removeFolder, uploadFile } from "./storage";

/* Orbital sequences of the views of a programme (Vues tab): every view
   (aerial view, roof, each floor, pedestrian view…) turns. Images in WebP at
   2 048 px and 1 280 px (phones), masks in PNG at 1 024 px resized without
   smoothing, so their colours stay exact. Files in
   <org>/<project>/orbit/<sequence>/, a new folder for each sequence (files
   never change once uploaded). Media rows: kind orbit_frame and orbit_mask
   with the view, sort_order = position in the sequence. Each view links its
   own colours to lots. */

export const FRAME_LARGE = 2048;
export const FRAME_SMALL = 1280;
export const MASK_WIDTH = 1024;

export const smallFramePath = (path: string) => path.replace(/(\.[a-z0-9]+)$/i, "-1280$1");

export type OrbitView = { id: string; path: string; index: number; width: number; height: number };
export type OrbitColor = Tables<"orbit_colors">;
export type Orbit = { frames: OrbitView[]; masks: OrbitView[]; colors: OrbitColor[] };
/** Sequences of the programme, by view. */
export type Orbits = Map<string, Orbit>;

const EMPTY: Orbit = { frames: [], masks: [], colors: [] };
export const orbitOfView = (orbits: Orbits | undefined, viewId: string): Orbit =>
  orbits?.get(viewId) ?? EMPTY;

export const frameUrls = (frame: OrbitView) => ({
  large: publicUrl(frame.path),
  small: publicUrl(smallFramePath(frame.path)),
});

const orbitKey = (projectId: string) => ["orbit", projectId] as const;

export const toView = (row: Tables<"media">): OrbitView => {
  const meta = (row.meta ?? {}) as Record<string, unknown>;
  return {
    id: row.id,
    path: row.path,
    index: row.sort_order,
    width: typeof meta["width"] === "number" ? meta["width"] : 16,
    height: typeof meta["height"] === "number" ? meta["height"] : 9,
  };
};

/** Groups sequence rows and colours by view. */
export function groupOrbits(media: Tables<"media">[], colors: OrbitColor[]): Orbits {
  const orbits: Orbits = new Map();
  const of = (viewId: string) => {
    let orbit = orbits.get(viewId);
    if (!orbit) orbits.set(viewId, (orbit = { frames: [], masks: [], colors: [] }));
    return orbit;
  };
  for (const row of media) {
    if (!row.view_id) continue;
    if (row.kind === "orbit_frame") of(row.view_id).frames.push(toView(row));
    else if (row.kind === "orbit_mask") of(row.view_id).masks.push(toView(row));
  }
  for (const color of colors) of(color.view_id).colors.push(color);
  for (const orbit of orbits.values()) {
    orbit.frames.sort((a, b) => a.index - b.index);
    orbit.masks.sort((a, b) => a.index - b.index);
    orbit.colors.sort((a, b) => b.share - a.share);
  }
  return orbits;
}

export async function loadOrbits(projectId: string): Promise<Orbits> {
  const supabase = getSupabase();
  const [media, colors] = await Promise.all([
    supabase
      .from("media")
      .select("*")
      .eq("project_id", projectId)
      .in("kind", ["orbit_frame", "orbit_mask"])
      .order("sort_order"),
    supabase.from("orbit_colors").select("*").eq("project_id", projectId),
  ]);
  if (media.error) throw media.error;
  if (colors.error) throw colors.error;
  return groupOrbits(media.data, colors.data);
}

export function useOrbits(projectId: string) {
  return useQuery({ queryKey: orbitKey(projectId), queryFn: () => loadOrbits(projectId) });
}

/** Folders of a sequence (one per upload). */
const foldersOf = (orbit: Pick<Orbit, "frames" | "masks">) =>
  new Set([...orbit.frames, ...orbit.masks].map((v) => v.path.slice(0, v.path.lastIndexOf("/"))));

/** Reads an image without colour management, so a mask keeps its exact colours. */
async function decode(file: File, exact: boolean): Promise<ImageBitmap> {
  try {
    return await createImageBitmap(
      file,
      exact
        ? { colorSpaceConversion: "none", premultiplyAlpha: "none" }
        : { imageOrientation: "from-image" },
    );
  } catch {
    throw new ImageError(`Impossible de lire « ${file.name} ».`);
  }
}

/** Mask reduced to MASK_WIDTH without smoothing: no new colours on the edges. */
async function encodeMask(bitmap: ImageBitmap) {
  const { width, height } = fitWithin(bitmap.width, bitmap.height, MASK_WIDTH, 16_000_000);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new ImageError("Votre navigateur ne peut pas préparer les masques.");
  context.imageSmoothingEnabled = false;
  context.drawImage(bitmap, 0, 0, width, height);
  const pixels = context.getImageData(0, 0, width, height).data;
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) throw new ImageError("Votre navigateur ne peut pas préparer les masques.");
  return { blob, width, height, pixels };
}

export type OrbitReport = {
  frames: number;
  colors: MaskColor[];
  noise: number;
  /** Colours linked to a lot from another view. */
  carried: number;
};

export function useUploadOrbit(
  project: Project,
  view: Pick<ProjectView, "id">,
  onProgress?: (done: number, total: number) => void,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      frames: frameFiles,
      masks: maskFiles,
    }: {
      frames: File[];
      masks: File[];
    }): Promise<OrbitReport> => {
      const problem = checkSequence(frameFiles, maskFiles);
      if (problem) throw new AppError(problem);
      const frames = sortByName(frameFiles);
      const masks = sortByName(maskFiles);
      const orbits =
        queryClient.getQueryData<Orbits>(orbitKey(project.id)) ?? (await loadOrbits(project.id));
      const previous = orbitOfView(orbits, view.id);
      const otherColors = [...orbits].flatMap(([id, o]) => (id === view.id ? [] : o.colors));
      const folder = `${project.organization_id}/${project.id}/orbit/${crypto.randomUUID()}`;
      const uploaded: string[] = [];
      const counts = new Map<number, number>();
      let pixels = 0;
      let ratio = 0;
      const frameRows: { path: string; width: number; height: number }[] = [];
      const maskRows: { path: string; width: number; height: number }[] = [];
      let found: { colors: MaskColor[]; noise: number; carried: number } = {
        colors: [],
        noise: 0,
        carried: 0,
      };

      try {
        for (let i = 0; i < frames.length; i++) {
          onProgress?.(i, frames.length);
          const name = String(i + 1).padStart(3, "0");
          const [frame, mask] = [frames[i] as File, masks[i] as File];

          const image = await decode(frame, false);
          const maskBitmap = await decode(mask, true);
          try {
            const r = image.width / image.height;
            if (i === 0) ratio = r;
            else if (Math.abs(r - ratio) / ratio > 0.01)
              throw new AppError(`« ${frame.name} » n'a pas le même format que la première image.`);
            if (Math.abs(maskBitmap.width / maskBitmap.height - r) / r > 0.01)
              throw new AppError(`Le masque « ${mask.name} » n'a pas le format de son image.`);

            const large = await encodeImage(image, FRAME_LARGE, 0.82);
            const small = await encodeImage(image, FRAME_SMALL, 0.8);
            const encodedMask = await encodeMask(maskBitmap);
            pixels += countColors(encodedMask.pixels, counts);

            const framePath = `${folder}/vue-${name}.${large.extension}`;
            const maskPath = `${folder}/masque-${name}.png`;
            await Promise.all([
              uploadFile(framePath, large.blob),
              uploadFile(smallFramePath(framePath), small.blob),
              uploadFile(maskPath, encodedMask.blob),
            ]);
            uploaded.push(framePath, smallFramePath(framePath), maskPath);
            frameRows.push({ path: framePath, width: large.width, height: large.height });
            maskRows.push({
              path: maskPath,
              width: encodedMask.width,
              height: encodedMask.height,
            });
          } finally {
            image.close();
            maskBitmap.close();
          }
        }
        onProgress?.(frames.length, frames.length);

        const { colors, noise } = lotColors(counts, pixels);
        if (colors.length === 0)
          throw new AppError(
            "Aucune couleur de lot trouvée : les masques semblent entièrement noirs.",
          );
        if (colors.length > 400)
          throw new AppError(
            `${colors.length} couleurs différentes dans les masques : ils ont sans doute été lissés. Exportez-les sans anticrénelage.`,
          );

        const supabase = getSupabase();
        const rows = [
          ...frameRows.map((f, i) => ({ kind: "orbit_frame" as const, sort_order: i, ...f })),
          ...maskRows.map((m, i) => ({ kind: "orbit_mask" as const, sort_order: i, ...m })),
        ].map(({ kind, sort_order, path, width, height }) => ({
          project_id: project.id,
          view_id: view.id,
          kind,
          sort_order,
          path,
          meta: { width, height },
        }));
        const inserted = await supabase.from("media").insert(rows).select("id");
        if (inserted.error) throw inserted.error;

        // Same colour, same lot: the links of this view are kept, those of the other views reused.
        const { lots, carried } = carryLinks(colors, previous.colors, otherColors);
        found = { colors, noise, carried };
        // Freed first: a lot moving to another colour must not meet itself.
        const cleared = previous.colors.some((c) => c.lot_id)
          ? await supabase.from("orbit_colors").update({ lot_id: null }).eq("view_id", view.id)
          : { error: null };
        const saved = cleared.error
          ? cleared
          : await supabase.from("orbit_colors").upsert(
              colors.map((c, i) => ({
                project_id: project.id,
                view_id: view.id,
                hex: c.hex,
                share: Math.min(1, c.share),
                lot_id: lots[i] ?? null,
              })),
              { onConflict: "view_id,hex" },
            );
        if (saved.error) {
          // The links as they were, then the new rows go.
          for (const c of previous.colors) {
            if (c.lot_id)
              await supabase.from("orbit_colors").update({ lot_id: c.lot_id }).eq("id", c.id);
          }
          await supabase
            .from("media")
            .delete()
            .in(
              "id",
              inserted.data.map((r) => r.id),
            );
          throw saved.error;
        }
        const gone = previous.colors.filter((c) => !colors.some((n) => n.hex === c.hex));
        if (gone.length > 0)
          await supabase
            .from("orbit_colors")
            .delete()
            .in(
              "id",
              gone.map((c) => c.id),
            );
      } catch (error) {
        await removeFiles(uploaded).catch(() => undefined);
        throw error;
      }

      // The new sequence is saved: the previous one goes.
      const old = [...previous.frames, ...previous.masks];
      if (old.length > 0) {
        await getSupabase()
          .from("media")
          .delete()
          .in(
            "id",
            old.map((v) => v.id),
          );
        for (const f of foldersOf(previous)) await removeFolder(f).catch(() => undefined);
      }
      return { frames: frames.length, ...found };
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: orbitKey(project.id) }),
  });
}

/** Links a colour of the masks to a lot (or to none). */
export function useLinkColor(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      viewId,
      lotId,
    }: {
      id: string;
      viewId: string;
      lotId: string | null;
    }) => {
      const supabase = getSupabase();
      // A lot has one colour on a view: the one it had before is freed.
      if (lotId) {
        const freed = await supabase
          .from("orbit_colors")
          .update({ lot_id: null })
          .eq("view_id", viewId)
          .eq("lot_id", lotId)
          .neq("id", id);
        if (freed.error) throw freed.error;
      }
      const { error } = await supabase.from("orbit_colors").update({ lot_id: lotId }).eq("id", id);
      if (error) throw error;
    },
    onMutate: async ({ id, viewId, lotId }) => {
      await queryClient.cancelQueries({ queryKey: orbitKey(projectId) });
      const previous = queryClient.getQueryData<Orbits>(orbitKey(projectId));
      queryClient.setQueryData<Orbits>(orbitKey(projectId), (orbits) => {
        const orbit = orbits?.get(viewId);
        if (!orbits || !orbit) return orbits;
        const next = new Map(orbits);
        next.set(viewId, {
          ...orbit,
          colors: orbit.colors.map((c) =>
            c.id === id
              ? { ...c, lot_id: lotId }
              : lotId && c.lot_id === lotId
                ? { ...c, lot_id: null }
                : c,
          ),
        });
        return next;
      });
      return { previous };
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(orbitKey(projectId), context.previous);
    },
  });
}

/** Removes the sequence of a view: its images, masks and colours (the view stays). */
export function useDeleteOrbit(project: Project) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (viewId: string) => {
      const orbit = orbitOfView(queryClient.getQueryData<Orbits>(orbitKey(project.id)), viewId);
      const supabase = getSupabase();
      const media = await supabase
        .from("media")
        .delete()
        .eq("view_id", viewId)
        .in("kind", ["orbit_frame", "orbit_mask"]);
      if (media.error) throw media.error;
      const colors = await supabase.from("orbit_colors").delete().eq("view_id", viewId);
      if (colors.error) throw colors.error;
      for (const f of foldersOf(orbit)) await removeFolder(f).catch(() => undefined);
      return viewId;
    },
    onSuccess: (viewId) =>
      queryClient.setQueryData<Orbits>(orbitKey(project.id), (orbits) => {
        const next = new Map(orbits);
        next.delete(viewId);
        return next;
      }),
  });
}

/** Folders of the sequence of a view, read before the view is deleted (its rows go with it). */
export async function viewOrbitFolders(viewId: string): Promise<string[]> {
  const { data, error } = await getSupabase()
    .from("media")
    .select("path")
    .eq("view_id", viewId)
    .in("kind", ["orbit_frame", "orbit_mask"]);
  if (error) throw error;
  return [...new Set(data.map((m) => m.path.slice(0, m.path.lastIndexOf("/"))))];
}
