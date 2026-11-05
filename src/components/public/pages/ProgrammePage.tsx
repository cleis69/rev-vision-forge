import { Outlet } from "@tanstack/react-router";

import { ProgrammeApp } from "@/components/public/app/ProgrammeApp";
import { PublicLoading, PublicMessage } from "@/components/public/Common";
import { Presentation } from "@/components/public/Presentation";
import { usePublicProgramme } from "@/lib/public/programme";
import { useBrandTheme } from "@/lib/public/theme";

/* Page of a programme, in French (/p/$slug) or in English (/en/p/$slug): the
   application (ProgrammeApp), or the sales office's presentation mode. */

export type ProgrammeSearch = { mode?: "presentation"; comparer?: string };

/**
 * ?mode=presentation: full screen for the sales office tablet.
 * ?comparer=A1,B2: a comparison sent by a visitor, opened for the one who receives it.
 */
export const programmeSearch = (search: Record<string, unknown>): ProgrammeSearch => {
  const comparer = search["comparer"];
  return {
    ...(search["mode"] === "presentation" ? { mode: "presentation" as const } : {}),
    ...(typeof comparer === "string" && comparer.trim()
      ? { comparer: comparer.trim().slice(0, 200) }
      : {}),
  };
};

export function ProgrammePage({ slug, mode }: { slug: string; mode?: "presentation" | undefined }) {
  const query = usePublicProgramme(slug);
  const organization = query.data?.programme.organization;
  useBrandTheme(organization?.brandColor ?? null, organization?.brandFont ?? null);

  if (query.isPending) return <PublicLoading />;
  if (query.isError || !query.data) return <PublicMessage failed={query.isError} />;
  return (
    <>
      {mode === "presentation" ? (
        <Presentation data={query.data} slug={slug} />
      ) : (
        <ProgrammeApp data={query.data} slug={slug} />
      )}
      {/* /p/$slug/lot/$numero: the child route only names the open lot. */}
      <Outlet />
    </>
  );
}
