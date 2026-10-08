import { useQuery } from "@tanstack/react-query";

import { toMediaItem, type MediaItem } from "@/lib/app/media";
import { planImages } from "@/lib/app/plan";
import { publicUrl } from "@/lib/app/storage";
import type { LotStatus } from "@/lib/app/lot-fields";
import { compareNumeros } from "@/lib/app/lot-fields";
import { parsePoints, type Point } from "@/lib/geometry";
import { getSupabase } from "@/lib/supabase/client";

/* Public page of a programme (/p/$slug). Visitors read the public views
   (published programmes only, prices hidden when show_prices is off). A member
   of the organization who opens a draft gets a preview of the same page, from
   the tables their organization can read. */

export const DEFAULT_BRAND = "#c9a35b";

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
};

export type PublicData = {
  programme: PublicProgramme;
  lots: PublicLot[];
  shapes: Map<string, Point[]>;
  media: MediaItem[];
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
};

const features = (value: unknown) =>
  Array.isArray(value) ? value.filter((f): f is string => typeof f === "string") : [];

async function load(source: Source, preview: boolean): Promise<PublicData> {
  const supabase = getSupabase();
  const showPrices = source.show_prices ?? true;
  const lotsQuery = preview
    ? supabase.from("lots").select("*").eq("project_id", source.id)
    : supabase.from("public_lots").select("*").eq("project_id", source.id);
  const [lots, shapes, media] = await Promise.all([
    lotsQuery,
    supabase.from("lot_shapes").select("lot_id, points").eq("project_id", source.id),
    supabase
      .from("media")
      .select("*")
      .eq("project_id", source.id)
      .eq("kind", "image")
      .order("sort_order"),
  ]);
  if (lots.error) throw lots.error;
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
  };
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
