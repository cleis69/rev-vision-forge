/* 360° tours: equirectangular panoramas, one per room, made for one lot or
   for every lot of one type, with arrows from room to room. The first room
   is the entrance. Shared by the promoter space and the public pages. */

export const TAU = Math.PI * 2;

export const PANO_LARGE = 8192;
export const PANO_SMALL = 4096;
export const PANO_THUMB = 640;
// Room for an 8 192 × 4 096 px panorama, where the browser allows it.
export const PANO_MAX_PIXELS = PANO_LARGE * (PANO_LARGE / 2);
export const PANO_MIN_WIDTH = 2048;
export const PANO_MAX_BYTES = 120 * 1024 * 1024;

const withSuffix = (path: string, suffix: string) => path.replace(/(\.[a-z0-9]+)$/i, `${suffix}$1`);
/** 4 096 px version, for phones and the editor. */
export const smallPanoramaPath = (path: string) => withSuffix(path, `-${PANO_SMALL}`);
export const thumbPanoramaPath = (path: string) => withSuffix(path, `-${PANO_THUMB}`);

/** True for an equirectangular panorama: twice as wide as high (2 % tolerance). */
export const isEquirectangular = (width: number, height: number) =>
  height > 0 && Math.abs(width / height - 2) <= 0.04;

export type TourRoom = {
  id: string;
  lot_id: string | null;
  lot_type: string | null;
  name: string;
  sort_order: number;
};
export type TourLink = { from_id: string; to_id: string };

/** Type of lot as compared: without case, accents kept, spaces tidied. */
export const normalizeType = (type: string) =>
  type.trim().replace(/\s+/g, " ").toLocaleLowerCase("fr-FR");

/** A tour for one lot ("lot:<id>") or for every lot of one type ("type:<type>"). */
export type TourTarget = { lotId: string } | { lotType: string };

export const targetKey = (target: TourTarget) =>
  "lotId" in target ? `lot:${target.lotId}` : `type:${normalizeType(target.lotType)}`;

export const roomKey = (room: Pick<TourRoom, "lot_id" | "lot_type">) =>
  room.lot_id ? `lot:${room.lot_id}` : `type:${normalizeType(room.lot_type ?? "")}`;

export const roomTarget = (room: Pick<TourRoom, "lot_id" | "lot_type">): TourTarget =>
  room.lot_id ? { lotId: room.lot_id } : { lotType: (room.lot_type ?? "").trim() };

/** Rooms grouped by tour, each tour in its order (entrance first). */
export function groupTours<T extends TourRoom>(rooms: readonly T[]): Map<string, T[]> {
  const tours = new Map<string, T[]>();
  for (const room of rooms) {
    const key = roomKey(room);
    tours.set(key, [...(tours.get(key) ?? []), room]);
  }
  for (const list of tours.values()) list.sort((a, b) => a.sort_order - b.sort_order);
  return tours;
}

/** Tour shown for a lot: its own, else the one of its type, else none. */
export function tourKeyForLot(
  lot: { id: string; type: string | null },
  keys: ReadonlySet<string>,
): string | null {
  const own = `lot:${lot.id}`;
  if (keys.has(own)) return own;
  if (lot.type?.trim()) {
    const byType = `type:${normalizeType(lot.type)}`;
    if (keys.has(byType)) return byType;
  }
  return null;
}

/** Yaw brought between 0 and 2π, rounded (what the database accepts). */
export function normalizeYaw(yaw: number): number {
  const y = Math.round((((yaw % TAU) + TAU) % TAU) * 1e5) / 1e5;
  return y >= TAU ? 0 : y;
}

/** Pitch kept between -π/2 and π/2, rounded. */
export const clampPitch = (pitch: number) =>
  Math.round(Math.max(-1.5707, Math.min(1.5707, pitch)) * 1e5) / 1e5;

/** Room name from a file name: "02_salon-sejour.jpg" gives "Salon sejour". */
export function roomNameFromFile(fileName: string, fallback: string): string {
  const base = fileName
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[_\-.]+/g, " ")
    .replace(/^\s*\d+\s*/, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!base || /^(img|dsc|pano|panorama|equirect\w*)?\s*\d*$/i.test(base)) return fallback;
  return (base.charAt(0).toLocaleUpperCase("fr-FR") + base.slice(1)).slice(0, 60);
}

/** Rooms of a tour that the arrows never reach from the entrance (the first room). */
export function unreachableRooms(rooms: readonly TourRoom[], links: readonly TourLink[]) {
  const ids = new Set(rooms.map((r) => r.id));
  const entrance = rooms[0]?.id;
  const seen = new Set<string>(entrance ? [entrance] : []);
  const queue = entrance ? [entrance] : [];
  while (queue.length) {
    const from = queue.shift();
    for (const link of links) {
      if (link.from_id === from && ids.has(link.to_id) && !seen.has(link.to_id)) {
        seen.add(link.to_id);
        queue.push(link.to_id);
      }
    }
  }
  return new Set(rooms.filter((r) => !seen.has(r.id)).map((r) => r.id));
}
