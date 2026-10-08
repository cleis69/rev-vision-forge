import { useQuery } from "@tanstack/react-query";

import { toMediaItem, type MediaItem } from "@/lib/app/media";
import { toView, type OrbitView } from "@/lib/app/orbit";
import { panoramaImage, type PanoramaImage } from "@/lib/app/tours";
import { publicUrl } from "@/lib/app/storage";
import { LOT_STATUSES, compareNumeros, type LotStatus } from "@/lib/app/lot-fields";
import type { Tables } from "@/lib/supabase/database.types";
import { groupTours, roomTarget, tourKeyForLot } from "@/lib/tours";
import type { ViewLike } from "@/lib/views";
import { getSupabase } from "@/lib/supabase/client";
import { DEFAULT_BRAND } from "@/lib/brand";
import { isPosition, parsePlaces, type Place, type Position } from "@/lib/location";

/* Public page of a programme (/p/$slug). Visitors read the public views
   (published programmes only, prices hidden when show_prices is off). A member
   of the organization who opens a draft gets a preview of the same page, from
   the tables their organization can read. */

export type PublicLot = {
  id: string;
  numero: string;
  type: string | null;
  surface_habitable: number | null;
  surface_terrain: number | null;
  chambres: number | null;
  prix: number | null;
  statut: LotStatus;
  description: string | null;
  features: string[];
  /** Floor: -1 for R-1, 0 for the ground floor… */
  niveau: number | null;
};

/** Orbital sequence of a view, and the lot of each mask colour (linked colours only). */
export type PublicOrbit = {
  frames: OrbitView[];
  masks: OrbitView[];
  colors: { hex: string; lotId: string }[];
};

/** A view of the programme (aerial view, roof, floor, pedestrian view…) and its sequence. */
export type PublicView = ViewLike & {
  orbit: PublicOrbit;
  /** Lots shown on this view (their colour is linked). */
  lots: ReadonlySet<string>;
};

/** A room of a 360° tour: its panorama, the direction on arrival, the arrows to the other rooms. */
export type PublicRoom = {
  id: string;
  name: string;
  startYaw: number;
  startPitch: number;
  image: PanoramaImage;
  links: { toId: string; yaw: number; pitch: number }[];
};

/** A 360° tour, for one lot or for every lot of a type; its first room is the entrance. */
export type PublicTour = {
  key: string;
  /** "Villa" for a type, "Lot 7" for a lot. */
  label: string;
  lotId: string | null;
  lotType: string | null;
  rooms: PublicRoom[];
};

export type PublicProgramme = {
  id: string;
  slug: string;
  name: string;
  city: string | null;
  description: string | null;
  currency: string;
  showPrices: boolean;
  organization: {
    name: string;
    /** "rev" for REV's own programmes (the demo), whose logo is already REV's. */
    slug: string;
    logo: string | null;
    brandColor: string;
    brandFont: string | null;
  };
  /** Situation section: shown when any of the three is set. */
  address: string | null;
  position: Position | null;
  places: Place[];
};

export type PublicData = {
  programme: PublicProgramme;
  lots: PublicLot[];
  /** Views with a sequence and a linked colour, in the promoter's order (floors are sorted by the pages). */
  views: PublicView[];
  media: MediaItem[];
  /** 360° tours with at least one room, types first. */
  tours: PublicTour[];
  /** Draft seen by a member of its organization. */
  preview: boolean;
};

type Source = {
  id: string;
  slug: string;
  name: string;
  city: string | null;
  description: string | null;
  currency: string | null;
  show_prices: boolean | null;
  organization_name: string | null;
  organization_slug: string | null;
  organization_logo_path: string | null;
  brand_color: string | null;
  brand_font: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  places: unknown;
};

const features = (value: unknown) =>
  Array.isArray(value) ? value.filter((f): f is string => typeof f === "string") : [];

async function load(source: Source, preview: boolean): Promise<PublicData> {
  const supabase = getSupabase();
  const showPrices = source.show_prices ?? true;
  const lotsQuery = preview
    ? supabase.from("lots").select("*").eq("project_id", source.id)
    : supabase.from("public_lots").select("*").eq("project_id", source.id);
  const [lots, views, media, orbitMedia, orbitColors, rooms, links] = await Promise.all([
    lotsQuery,
    supabase
      .from("project_views")
      .select("id, name, kind, level, sort_order, is_main")
      .eq("project_id", source.id)
      .order("sort_order"),
    supabase
      .from("media")
      .select("*")
      .eq("project_id", source.id)
      .eq("kind", "image")
      .order("sort_order"),
    supabase
      .from("media")
      .select("*")
      .eq("project_id", source.id)
      .in("kind", ["orbit_frame", "orbit_mask"])
      .order("sort_order"),
    supabase
      .from("orbit_colors")
      .select("view_id, hex, lot_id, share")
      .eq("project_id", source.id)
      .not("lot_id", "is", null)
      .order("share", { ascending: false }),
    supabase.from("panoramas").select("*").eq("project_id", source.id).order("sort_order"),
    supabase
      .from("panorama_links")
      .select("from_id, to_id, yaw, pitch")
      .eq("project_id", source.id),
  ]);
  if (lots.error) throw lots.error;
  if (orbitMedia.error) throw orbitMedia.error;
  if (orbitColors.error) throw orbitColors.error;
  if (views.error) throw views.error;
  if (media.error) throw media.error;
  if (rooms.error) throw rooms.error;
  if (links.error) throw links.error;

  const publicViews = views.data.flatMap((v): PublicView[] => {
    const orbit = orbitOf(
      orbitMedia.data.filter((m) => m.view_id === v.id),
      orbitColors.data.filter((c) => c.view_id === v.id),
    );
    if (!orbit) return [];
    return [
      {
        id: v.id,
        name: v.name,
        kind: v.kind,
        level: v.level,
        sort_order: v.sort_order,
        is_main: v.is_main,
        orbit,
        lots: new Set(orbit.colors.map((c) => c.lotId)),
      },
    ];
  });

  const lotNumbers = new Map(
    lots.data.flatMap((l) => (l.id && l.numero ? [[l.id, l.numero]] : [])),
  );
  const tours: PublicTour[] = [...groupTours(rooms.data)].flatMap(([key, list]) => {
    const ids = new Set(list.map((r) => r.id));
    const target = roomTarget(list[0]!);
    if ("lotId" in target && !lotNumbers.has(target.lotId)) return [];
    return [
      {
        key,
        label: "lotId" in target ? `Lot ${lotNumbers.get(target.lotId)}` : target.lotType,
        lotId: "lotId" in target ? target.lotId : null,
        lotType: "lotType" in target ? target.lotType : null,
        rooms: list.map((r) => ({
          id: r.id,
          name: r.name,
          startYaw: r.start_yaw,
          startPitch: r.start_pitch,
          image: panoramaImage(r),
          links: links.data
            .filter((l) => l.from_id === r.id && ids.has(l.to_id))
            .map((l) => ({ toId: l.to_id, yaw: l.yaw, pitch: l.pitch })),
        })),
      },
    ];
  });
  tours.sort(
    (a, b) =>
      Number(a.lotId !== null) - Number(b.lotId !== null) || a.label.localeCompare(b.label, "fr"),
  );

  return {
    preview,
    tours,
    programme: {
      id: source.id,
      slug: source.slug,
      name: source.name,
      city: source.city,
      description: source.description,
      currency: source.currency ?? "EUR",
      showPrices,
      organization: {
        name: source.organization_name ?? "",
        slug: source.organization_slug ?? "",
        logo: source.organization_logo_path ? publicUrl(source.organization_logo_path) : null,
        brandColor: source.brand_color ?? DEFAULT_BRAND,
        brandFont: source.brand_font,
      },
      address: source.address?.trim() || null,
      position: isPosition(source.latitude, source.longitude)
        ? { lat: source.latitude as number, lng: source.longitude as number }
        : null,
      places: parsePlaces(source.places),
    },
    lots: lots.data
      .flatMap((l) =>
        l.id && l.numero && l.statut
          ? [
              {
                id: l.id,
                numero: l.numero,
                type: l.type,
                surface_habitable: l.surface_habitable,
                surface_terrain: l.surface_terrain,
                chambres: l.chambres,
                // The preview shows what visitors will see.
                prix: showPrices ? l.prix : null,
                statut: l.statut,
                description: l.description,
                features: features(l.features),
                niveau: l.niveau ?? null,
              },
            ]
          : [],
      )
      .sort((a, b) => compareNumeros(a.numero, b.numero)),
    views: publicViews,
    media: media.data.map(toMediaItem),
  };
}

/** The sequence of a view, or null when it has none or no colour is linked to a lot. */
function orbitOf(
  rows: Tables<"media">[],
  colors: { hex: string; lot_id: string | null }[],
): PublicOrbit | null {
  const frames = rows.filter((r) => r.kind === "orbit_frame").map(toView);
  const masks = rows.filter((r) => r.kind === "orbit_mask").map(toView);
  const linked = colors.flatMap((c) => (c.lot_id ? [{ hex: c.hex, lotId: c.lot_id }] : []));
  if (frames.length === 0 || frames.length !== masks.length || linked.length === 0) return null;
  return { frames, masks, colors: linked };
}

export function usePublicProgramme(slug: string) {
  return useQuery({
    queryKey: ["public-programme", slug],
    queryFn: async (): Promise<PublicData | null> => {
      const supabase = getSupabase();
      const { data: published, error } = await supabase
        .from("public_projects")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      if (published?.id && published.slug && published.name) {
        return load(
          { ...published, id: published.id, slug: published.slug, name: published.name },
          false,
        );
      }

      const { data: auth } = await supabase.auth.getSession();
      if (!auth.session) return null;
      const { data: own, error: ownError } = await supabase
        .from("projects")
        .select("*, organization:organizations(name, slug, logo_path, brand_color, brand_font)")
        .eq("slug", slug)
        .maybeSingle();
      if (ownError) throw ownError;
      if (!own || !own.organization) return null;
      return load(
        {
          ...own,
          organization_name: own.organization.name,
          organization_slug: own.organization.slug,
          organization_logo_path: own.organization.logo_path,
          brand_color: own.organization.brand_color,
          brand_font: own.organization.brand_font,
        },
        own.status !== "published",
      );
    },
  });
}

/** Lowest price of the available lots, when prices are shown. */
export function startingPrice(lots: PublicLot[]): number | null {
  const prices = lots
    .filter((l) => l.statut === "disponible" && l.prix !== null)
    .map((l) => l.prix as number);
  return prices.length ? Math.min(...prices) : null;
}

/** Number of lots of each status. */
export const countByStatus = (lots: PublicLot[]) =>
  Object.fromEntries(
    LOT_STATUSES.map((s) => [s, lots.filter((l) => l.statut === s).length]),
  ) as Record<LotStatus, number>;

/** True when the programme has something to show in its Situation section. */
export const hasSituation = (p: PublicProgramme) =>
  Boolean(p.address || p.position || p.places.length > 0);

/** The 360° tour shown for a lot: its own, else the one of its type. */
export function tourOfLot(tours: PublicTour[], lot: Pick<PublicLot, "id" | "type">) {
  const key = tourKeyForLot(lot, new Set(tours.map((t) => t.key)));
  return key ? (tours.find((t) => t.key === key) ?? null) : null;
}
