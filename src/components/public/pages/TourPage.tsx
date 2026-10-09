import { Suspense, lazy, useEffect, useRef } from "react";
import { ExternalLink } from "lucide-react";

import { LanguageSwitch, PublicMessage } from "@/components/public/Common";
import { useCopy } from "@/lib/i18n";
import { track } from "@/lib/public/events";
import { useLocale } from "@/lib/public/i18n";
import { usePublicProgramme, type PublicData, type PublicTour } from "@/lib/public/programme";
import { pickTour, type TourSearch } from "@/lib/public/tour-link";
import { useBrandTheme } from "@/lib/public/theme";

/* The 360° tour alone, filling the page: a link of its own, or an iframe on
   the promoter's site (code in the Partage tab). /embed/visite/$slug in
   French, /en/embed/tour/$slug in English; ?type=Villa A or ?lot=A1 picks the
   tour when the programme has several, else the first one is shown. */

const TourAlone = lazy(() =>
  import("@/components/public/TourViewer").then((m) => ({ default: m.TourAlone })),
);

const COPY = {
  fr: {
    loading: "Chargement de la visite…",
    tour: "Visite 360°",
    programme: "Voir le programme",
    noTour: "Pas de visite 360° pour ce programme",
    noTourText: "Elle n'est pas encore en ligne, ou elle a été retirée.",
  },
  en: {
    loading: "Loading the tour…",
    tour: "360° tour",
    programme: "View the programme",
    noTour: "No 360° tour for this programme",
    noTourText: "It is not online yet, or it has been removed.",
  },
};

function Loading({ label }: { label: string }) {
  return (
    <div
      className="fixed inset-0 grid place-items-center bg-black text-sm text-white/60"
      aria-busy="true"
    >
      {label}
    </div>
  );
}

export function TourPage({ slug, search }: { slug: string; search: TourSearch }) {
  const copy = useCopy(COPY);
  const query = usePublicProgramme(slug);
  const organization = query.data?.programme.organization;
  useBrandTheme(organization?.brandColor ?? null, organization?.brandFont ?? null);

  if (query.isPending) return <Loading label={copy.loading} />;
  if (query.isError || !query.data) return <PublicMessage failed={query.isError} />;
  const tour = pickTour(query.data, search);
  if (!tour) {
    return (
      <main className="grid min-h-svh place-items-center bg-[#080808] px-6 text-center text-white">
        <div>
          <h1 className="font-brand text-2xl font-medium tracking-tight">{copy.noTour}</h1>
          <p className="mt-3 text-sm text-white/60">{copy.noTourText}</p>
        </div>
      </main>
    );
  }
  return <Tour data={query.data} tour={tour} slug={slug} />;
}

function Tour({ data, tour, slug }: { data: PublicData; tour: PublicTour; slug: string }) {
  const copy = useCopy(COPY);
  const locale = useLocale();
  const { programme, preview } = data;

  // One opening of the tour, for the statistics (none for a draft seen by its team).
  const tracked = useRef(false);
  useEffect(() => {
    if (tracked.current || preview) return;
    tracked.current = true;
    track(programme.id, "visite_360", tour.lotId ?? undefined);
  }, [preview, programme.id, tour.lotId]);

  useEffect(() => {
    document.title = `${copy.tour} — ${programme.name}`;
  }, [copy.tour, programme.name]);

  // The programme page opens in a new tab: from an iframe, the promoter's site stays open.
  const pageUrl = `${window.location.origin}${locale === "en" ? "/en" : ""}/p/${slug}`;
  const control =
    "inline-flex h-11 items-center gap-2 rounded-full bg-black/55 px-3 text-sm text-white/90 backdrop-blur transition-colors hover:bg-black/80 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 sm:px-4";

  return (
    <Suspense fallback={<Loading label={copy.loading} />}>
      <TourAlone
        tour={tour}
        onPlan={() => window.open(`${pageUrl}#visite`, "_blank", "noopener")}
        actions={
          <>
            <LanguageSwitch className="hidden bg-black/55 backdrop-blur sm:inline-flex" />
            <a
              href={pageUrl}
              target="_blank"
              rel="noopener"
              className={control}
              aria-label={copy.programme}
            >
              <ExternalLink className="size-4" aria-hidden />
              <span className="hidden md:inline">{copy.programme}</span>
            </a>
          </>
        }
      />
    </Suspense>
  );
}
