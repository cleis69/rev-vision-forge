import { useQuery } from "@tanstack/react-query";

import { toMediaItem, type MediaItem } from "@/lib/app/media";
import { toView, type OrbitView } from "@/lib/app/orbit";
import { planImages } from "@/lib/app/plan";
import { publicUrl } from "@/lib/app/storage";
import { LOT_STATUSES, compareNumeros, type LotStatus } from "@/lib/app/lot-fields";
import { parsePoints, type Point } from "@/lib/geometry";
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
};

export type PublicProgramme = {
  id: string;
  slug: string;
  name: string;
  city: string | null;
  description: string | null;
  currency: string;
  showPrices: boolean;
  plan: ReturnType<typeof planImages>;
  organization: { name: string; logo: string | null; brandColor: string; brandFont: string | null };
  /** Situation section: shown when any of the three is set. */
  address: string | null;
  position: Position | null;
  places: Place[];
};

/** Orbital view: the sequence, and the lot of each mask colour (linked colours only). */
export type PublicOrbit = {
  frames: OrbitView[];
  masks: OrbitView[];
  colors: { hex: string; lotId: string }[];
};

export type PublicData = {
  programme: PublicProgramme;
  lots: PublicLot[];
  shapes: Map<string, Point[]>;
  media: MediaItem[];
  /** Null when the programme has no orbital view, or none of its colours is linked to a lot. */
  orbit: PublicOrbit | null;
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
  plan_image_path: string | null;
  plan_width: number | null;
  plan_height: number | null;
  organization_name: string | null;
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
  const [lots, shapes, media, orbitMedia, orbitColors] = await Promise.all([
    lotsQuery,
    supabase.from("lot_shapes").select("lot_id, points").eq("project_id", source.id),
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
      .select("hex, lot_id")
      .eq("project_id", source.id)
      .not("lot_id", "is", null),
  ]);
  if (lots.error) throw lots.error;
  if (orbitMedia.error) throw orbitMedia.error;
  if (orbitColors.error) throw orbitColors.error;
  if (shapes.error) throw shapes.error;
  if (media.error) throw media.error;

  const shapeMap = new Map<string, Point[]>();
  for (const row of shapes.data) {
    const points = parsePoints(row.points);
    if (points) shapeMap.set(row.lot_id, points);
  }

  return {
    preview,
    programme: {
      id: source.id,
      slug: source.slug,
      name: source.name,
      city: source.city,
      description: source.description,
      currency: source.currency ?? "EUR",
      showPrices,
      plan: planImages(source),
      organization: {
        name: source.organization_name ?? "",
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
              },
            ]
          : [],
      )
      .sort((a, b) => compareNumeros(a.numero, b.numero)),
    shapes: shapeMap,
    media: media.data.map(toMediaItem),
    orbit: orbitOf(orbitMedia.data, orbitColors.data),
  };
}

function orbitOf(
  rows: Parameters<typeof toView>[0][],
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
        .select("*, organization:organizations(name, logo_path, brand_color, brand_font)")
        .eq("slug", slug)
        .maybeSingle();
      if (ownError) throw ownError;
      if (!own || !own.organization) return null;
      return load(
        {
          ...own,
          organization_name: own.organization.name,
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
