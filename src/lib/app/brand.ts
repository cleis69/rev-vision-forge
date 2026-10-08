import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ImageError, PLAN_TYPES, decodeImage, encodeImage } from "@/lib/image";
import { getSupabase } from "@/lib/supabase/client";
import { AppError, NO_RIGHTS } from "./errors";
import { assertOwner } from "./organizations";
import { removeFiles, uploadFile } from "./storage";

/* Branding of an organization (Marque tab): logo, colour and title font of
   all its public pages. Changed by owners only (RLS on organizations). */

export type BrandValues = { brand_color: string | null; brand_font: string | null };

// Shown about 40 px high; 800 px keeps it sharp on any screen.
const LOGO_SIDE = 800;

async function updateOrganization(id: string, values: BrandValues | { logo_path: string | null }) {
  const { data, error } = await getSupabase()
    .from("organizations")
    .update(values)
    .eq("id", id)
    .select("id");
  if (error) throw error;
  if (data.length === 0) throw new AppError(NO_RIGHTS);
}

export function useUpdateBrand(organizationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: BrandValues) => updateOrganization(organizationId, values),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["memberships"] }),
  });
}

/** Uploads a new logo, then removes the previous file. */
export function useUploadLogo(organizationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ file, previous }: { file: File; previous: string | null }) => {
      if (!PLAN_TYPES.includes(file.type)) {
        throw new ImageError(
          "Format non pris en charge : PNG, JPEG ou WebP. Pour un logo en SVG, exportez-le d'abord en PNG.",
        );
      }
      await assertOwner(organizationId);
      const bitmap = await decodeImage(file);
      let logo;
      try {
        logo = await encodeImage(bitmap, LOGO_SIDE, 0.9, "png");
      } finally {
        bitmap.close();
      }
      const path = `${organizationId}/brand/logo-${crypto.randomUUID()}.${logo.extension}`;
      await uploadFile(path, logo.blob);
      try {
        await updateOrganization(organizationId, { logo_path: path });
      } catch (error) {
        await removeFiles([path]).catch(() => undefined);
        throw error;
      }
      if (previous) await removeFiles([previous]).catch(() => undefined);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["memberships"] }),
  });
}

export function useRemoveLogo(organizationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (previous: string) => {
      await updateOrganization(organizationId, { logo_path: null });
      await removeFiles([previous]).catch(() => undefined);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["memberships"] }),
  });
}
