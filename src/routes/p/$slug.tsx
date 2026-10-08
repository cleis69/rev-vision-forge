import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Link,
  Outlet,
  createFileRoute,
  useNavigate,
  useParams,
  useRouter,
} from "@tanstack/react-router";
import { ArrowDown, Eye, MapPin } from "lucide-react";
import { toast } from "sonner";

import {
  PoweredBy,
  PublicLoading,
  PublicMessage,
  RevBadge,
  StatusFilters,
} from "@/components/public/Common";
import { CompareBar, CompareDialog } from "@/components/public/Compare";
import { Gallery } from "@/components/public/Gallery";
import { LotCards } from "@/components/public/LotCards";
import { LotSheet } from "@/components/public/LotSheet";
import { Presentation } from "@/components/public/Presentation";
import { Situation } from "@/components/public/Situation";
import { TourButton, TourOverlay, ToursSection, type OpenTour } from "@/components/public/Tours";
import { ProgrammeViews } from "@/components/public/ProgrammeViews";
import { useFollowLot, useViewKey } from "@/lib/public/use-views";
import { VisitForm } from "@/components/public/VisitForm";
import type { LotStatus } from "@/lib/app/lot-fields";
import { formatPrice } from "@/lib/app/lot-format";
import { mediaImage } from "@/lib/app/media";
import { MAX_COMPARE, toggleCompared } from "@/lib/public/compare";
import { track } from "@/lib/public/events";
import { useLiveLots } from "@/lib/public/live";
import {
  countByStatus,
  hasSituation,
  startingPrice,
  tourOfLot,
  usePublicProgramme,
  type PublicData,
  type PublicLot,
  type PublicTour,
} from "@/lib/public/programme";
import { shareLot, whatsappShareUrl } from "@/lib/public/share";
import { useBrandTheme } from "@/lib/public/theme";
import { cn } from "@/lib/utils";
import { levelLabel } from "@/lib/views";

type Search = { mode?: "presentation" };

export const Route = createFileRoute("/p/$slug")({
  // ?mode=presentation: full screen for the sales office tablet.
  validateSearch: (search: Record<string, unknown>): Search =>
    search["mode"] === "presentation" ? { mode: "presentation" } : {},
  component: ProgrammePage,
});

function ProgrammePage() {
  const { slug } = Route.useParams();
  const { mode } = Route.useSearch();
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
        <Programme data={query.data} slug={slug} />
      )}
      {/* /p/$slug/lot/$numero: the child route only names the open lot. */}
      <Outlet />
    </>
  );
}

const COMPARE_KEY = "rev-comparer-";

function readCompared(projectId: string): string[] {
  try {
    const ids: unknown = JSON.parse(window.sessionStorage.getItem(COMPARE_KEY + projectId) ?? "[]");
    return Array.isArray(ids)
      ? ids.filter((id): id is string => typeof id === "string").slice(0, MAX_COMPARE)
      : [];
  } catch {
    return [];
  }
}

function Programme({ data, slug }: { data: PublicData; slug: string }) {
  const { programme, lots, media, preview, tours } = data;
  const navigate = useNavigate();
  const router = useRouter();
  const [filter, setFilter] = useState<LotStatus | null>(null);
  const tracked = useRef(false);

  /* ----- open lot: from the address /p/$slug/lot/$numero (shareable link) */
  const { numero } = useParams({ strict: false }) as { numero?: string };
  const lot = numero ? (lots.find((l) => l.numero === numero) ?? null) : null;
  // Kept while the panel closes, so its content does not vanish mid-animation.
  const [shownLot, setShownLot] = useState<PublicLot | null>(lot);
  useEffect(() => {
    if (lot) setShownLot(lot);
  }, [lot]);
  const openedHere = useRef(false);
  useEffect(() => {
    if (!numero) openedHere.current = false;
  }, [numero]);

  useEffect(() => {
    if (!numero || lot) return;
    toast.error("Ce lot n'existe pas ou n'est plus présenté.", { id: "lot-inconnu" });
    void navigate({ to: "/p/$slug", params: { slug }, replace: true, resetScroll: false });
  }, [numero, lot, navigate, slug]);

  const lotId = lot?.id;
  useEffect(() => {
    if (lotId && !preview) track(programme.id, "vue_lot", lotId);
  }, [lotId, preview, programme.id]);

  /* ----- comparison (kept for the visit, in this tab) */
  const [compareIds, setCompareIds] = useState<string[]>(() => readCompared(programme.id));
  useEffect(() => {
    try {
      window.sessionStorage.setItem(COMPARE_KEY + programme.id, JSON.stringify(compareIds));
    } catch {
      /* storage unavailable: the comparison lasts until the page closes */
    }
  }, [compareIds, programme.id]);
  const compared = compareIds.flatMap((id) => lots.filter((l) => l.id === id));
  const [comparing, setComparing] = useState(false);
  const toggleCompare = (target: PublicLot) => {
    const next = toggleCompared(compareIds, target.id);
    if (!next) {
      toast.error(`${MAX_COMPARE} lots au maximum : retirez-en un pour en ajouter un autre.`);
      return;
    }
    setCompareIds(next);
  };

  const highlight = useLiveLots(programme.id, slug);

  const gallery = useMemo(() => media.filter((m) => !m.lot_id), [media]);
  const hero = gallery[0] ? mediaImage(gallery[0]) : null;
  const counts = useMemo(() => countByStatus(lots), [lots]);
  const from = programme.showPrices ? startingPrice(lots) : null;
  // Views of the programme: the main one first; an opened lot brings its view.
  const hasViews = data.views.length > 0;
  const [viewKey, setViewKey] = useViewKey(data);
  useFollowLot(data, lot, setViewKey);
  // Floors of the lots, top floor first: a filter of the list when there are several.
  const levels = useMemo(
    () =>
      [...new Set(lots.flatMap((l) => (l.niveau === null ? [] : [l.niveau])))].sort(
        (a, b) => b - a,
      ),
    [lots],
  );
  const [levelFilter, setLevelFilter] = useState<number | null>(null);
  const shownLots = lots.filter(
    (l) => (!filter || l.statut === filter) && (levelFilter === null || l.niveau === levelFilter),
  );

  useEffect(() => {
    if (!preview && !tracked.current) {
      tracked.current = true;
      track(programme.id, "vue_page");
    }
  }, [programme.id, preview]);

  // Same titles as the link previews written by the Worker.
  const lotLabel = lot ? `Lot ${lot.numero}${lot.type ? ` · ${lot.type}` : ""}` : null;
  useEffect(() => {
    const owner = programme.organization.name;
    document.title = lotLabel
      ? `${lotLabel} — ${programme.name}`
      : owner
        ? `${programme.name} — ${owner}`
        : programme.name;
  }, [lotLabel, programme.name, programme.organization.name]);

  const open = (target: PublicLot, from: "plan" | "list" | "keyboard" | "compare") => {
    if (!preview && from === "plan") track(programme.id, "clic_lot", target.id);
    // Back closes the panel when it was opened on this page.
    if (!numero) openedHere.current = true;
    void navigate({
      to: "/p/$slug/lot/$numero",
      params: { slug, numero: target.numero },
      replace: Boolean(numero),
      resetScroll: false,
    });
  };

  const close = () => {
    if (openedHere.current) router.history.back();
    else void navigate({ to: "/p/$slug", params: { slug }, replace: true, resetScroll: false });
  };

  /* ----- 360° tours: full screen, from the section or from the sheet of a lot */
  const [touring, setTouring] = useState<OpenTour | null>(null);
  const [askVisit, setAskVisit] = useState<{ lotId: string } | null>(null);
  const openTour = (tour: PublicTour, lotId: string | null) => {
    setTouring({ tour, lotId });
    if (!preview) track(programme.id, "visite_360", lotId ?? tour.lotId ?? undefined);
  };
  // The visit request: the form of the lot (its sheet), else the one of the page.
  const planFromTour = ({ tour, lotId }: OpenTour) => {
    setTouring(null);
    const target = lots.find((l) => l.id === (lotId ?? tour.lotId));
    if (target && target.statut !== "vendue") {
      if (target.id !== lot?.id) open(target, "list");
      setAskVisit({ lotId: target.id });
    } else {
      document.getElementById("visite")?.scrollIntoView({ block: "start" });
    }
  };
  const lotTour = lot ? tourOfLot(tours, lot) : null;

  return (
    <div
      // Room for the comparison bar at the bottom of the page.
      className={cn("min-h-svh bg-[#080808] text-white", compared.length > 0 && "pb-36 sm:pb-24")}
    >
      {preview ? (
        <div className="bg-amber-400 px-5 py-2 text-center text-sm font-medium text-black">
          <Eye className="mr-2 inline size-4 align-[-3px]" aria-hidden />
          Aperçu : ce programme n'est pas encore publié, seuls les membres de votre organisation le
          voient.{" "}
          <Link to="/app" className="underline underline-offset-4">
            Espace promoteur
          </Link>
        </div>
      ) : null}

      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#080808]/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-5 sm:px-8">
          {programme.organization.logo ? (
            <img
              src={programme.organization.logo}
              alt={programme.organization.name}
              className="h-8 w-auto shrink-0"
            />
          ) : (
            <span className="truncate font-brand text-base font-medium tracking-tight">
              {programme.organization.name}
            </span>
          )}
          <nav
            aria-label="Sections"
            className="ml-auto hidden items-center gap-6 text-sm text-white/70 md:flex"
          >
            {hasViews ? (
              <a href="#plan" className="hover:text-white">
                Plan de vente
              </a>
            ) : null}
            <a href="#lots" className="hover:text-white">
              Lots
            </a>
            {gallery.length > 0 ? (
              <a href="#galerie" className="hover:text-white">
                Galerie
              </a>
            ) : null}
            {tours.length > 0 ? (
              <a href="#visite-360" className="hover:text-white">
                Visite 360°
              </a>
            ) : null}
            {hasSituation(programme) ? (
              <a href="#situation" className="hover:text-white">
                Situation
              </a>
            ) : null}
            <a
              href="#visite"
              className="rounded-full border border-white/20 px-4 py-1.5 text-white hover:border-white/50"
            >
              Planifier une visite
            </a>
          </nav>
          {programme.organization.slug !== "rev" ? <RevBadge className="ml-auto md:ml-0" /> : null}
        </div>
      </header>

      <main>
        <section className="relative isolate overflow-hidden">
          {hero ? (
            <>
              <img
                src={hero.large}
                srcSet={`${hero.thumb} 800w, ${hero.large} 2048w`}
                sizes="100vw"
                alt=""
                fetchPriority="high"
                className="absolute inset-0 -z-10 h-full w-full object-cover"
              />
              <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/50 via-black/55 to-[#080808]" />
            </>
          ) : null}
          <div
            className={cn(
              "mx-auto max-w-6xl px-5 sm:px-8",
              hero ? "pb-20 pt-28 sm:pb-28 sm:pt-40" : "pb-12 pt-16 sm:pt-20",
            )}
          >
            {programme.city ? (
              <p className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.24em] text-[color:var(--brand)]">
                <MapPin className="size-3.5" aria-hidden />
                {programme.city}
              </p>
            ) : null}
            <h1 className="mt-4 max-w-3xl font-brand text-4xl font-medium leading-[1.05] tracking-tight sm:text-6xl">
              {programme.name}
            </h1>
            {programme.description ? (
              <p className="mt-6 max-w-2xl whitespace-pre-line text-base leading-relaxed text-white/75">
                {programme.description}
              </p>
            ) : null}
            <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-4">
              <Stat label="Lots">{lots.length}</Stat>
              <Stat label="Disponibles">{counts.disponible}</Stat>
              {from !== null ? (
                <Stat label="À partir de">{formatPrice(from, programme.currency)}</Stat>
              ) : null}
            </dl>
            <div className="mt-10 flex flex-wrap gap-3">
              {hasViews ? (
                <a
                  href="#plan"
                  className="inline-flex h-12 items-center gap-2 rounded-full bg-[color:var(--brand)] px-6 text-sm font-medium text-[color:var(--brand-contrast)] transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                >
                  Voir le plan de vente
                  <ArrowDown className="size-4" aria-hidden />
                </a>
              ) : null}
              <a
                href="#visite"
                className="inline-flex h-12 items-center rounded-full border border-white/25 px-6 text-sm font-medium text-white transition-colors hover:border-white/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
              >
                Planifier une visite
              </a>
            </div>
          </div>
        </section>

        {hasViews ? (
          <section id="plan" className="scroll-mt-20 border-t border-white/10">
            <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
              <SectionTitle title="Plan de vente">
                <StatusFilters
                  value={filter}
                  onChange={setFilter}
                  counts={counts}
                  total={lots.length}
                />
              </SectionTitle>
              <div className="mt-8">
                <ProgrammeViews
                  data={data}
                  viewKey={viewKey}
                  onViewChange={setViewKey}
                  filter={filter}
                  highlight={highlight}
                  onOpen={open}
                />
              </div>
            </div>
          </section>
        ) : null}

        <section id="lots" className="scroll-mt-20 border-t border-white/10">
          <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
            <SectionTitle title="Les lots">
              <StatusFilters
                value={filter}
                onChange={setFilter}
                counts={counts}
                total={lots.length}
              />
            </SectionTitle>
            {levels.length > 1 ? (
              <div
                role="group"
                aria-label="Filtrer les lots par niveau"
                className="mt-4 flex flex-wrap gap-2"
              >
                {[null, ...levels].map((level) => {
                  const active = levelFilter === level;
                  return (
                    <button
                      key={level ?? "tous"}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setLevelFilter(level)}
                      className={cn(
                        "inline-flex h-8 items-center rounded-full border px-3.5 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70",
                        active
                          ? "border-[color:var(--brand)] text-[color:var(--brand)]"
                          : "border-white/15 text-white/65 hover:text-white",
                      )}
                    >
                      {level === null ? "Tous les niveaux" : levelLabel(level)}
                    </button>
                  );
                })}
              </div>
            ) : null}
            {shownLots.length === 0 ? (
              <p className="mt-8 text-sm text-white/60">
                {lots.length === 0
                  ? "Les lots seront bientôt présentés."
                  : "Aucun lot avec ce statut."}
              </p>
            ) : (
              <div className="mt-8">
                <LotCards
                  lots={shownLots}
                  currency={programme.currency}
                  highlight={highlight}
                  onOpen={(l) => open(l, "list")}
                  compare={{ ids: compareIds, onToggle: toggleCompare }}
                />
              </div>
            )}
          </div>
        </section>

        {gallery.length > 0 ? (
          <section id="galerie" className="scroll-mt-20 border-t border-white/10">
            <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
              <SectionTitle title="Galerie" />
              <div className="mt-8">
                <Gallery photos={gallery} name={programme.name} />
              </div>
            </div>
          </section>
        ) : null}

        {tours.length > 0 ? (
          <section id="visite-360" className="scroll-mt-20 border-t border-white/10">
            <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
              <SectionTitle title="Visite 360°" />
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/65">
                Entrez dans les logements : tournez la tête du bout du doigt, et suivez les flèches
                d'une pièce à l'autre.
              </p>
              <div className="mt-8">
                <ToursSection tours={tours} lots={lots} onOpen={(t) => openTour(t, null)} />
              </div>
            </div>
          </section>
        ) : null}

        {hasSituation(programme) ? (
          <section id="situation" className="scroll-mt-20 border-t border-white/10">
            <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
              <Situation programme={programme} />
            </div>
          </section>
        ) : null}

        <section id="visite" className="scroll-mt-20 border-t border-white/10">
          <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[1fr_1.3fr]">
            <div>
              <SectionTitle title="Planifier une visite" />
              <p className="mt-4 max-w-md text-base leading-relaxed text-white/65">
                Laissez vos coordonnées : {programme.organization.name || "l'équipe commerciale"}{" "}
                vous rappelle pour organiser la visite du programme ou du lot qui vous intéresse.
              </p>
            </div>
            <VisitForm
              projectId={programme.id}
              slug={programme.slug}
              owner={programme.organization.name}
              lots={lots}
              preview={preview}
            />
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-8 text-xs text-white/45 sm:px-8">
          <span>
            {programme.name}
            {programme.organization.name ? ` · ${programme.organization.name}` : ""}
          </span>
          <PoweredBy />
        </div>
      </footer>

      <LotSheet
        lot={lot ?? shownLot}
        photos={media.filter((m) => m.lot_id && m.lot_id === (lot ?? shownLot)?.id)}
        currency={programme.currency}
        open={Boolean(lot)}
        onOpenChange={(o) => !o && close()}
        askVisit={askVisit}
        actions={
          lot
            ? {
                compared: compareIds.includes(lot.id),
                onToggleCompare: () => toggleCompare(lot),
                onShare: () => void shareLot(programme, lot, !preview),
                whatsappUrl: whatsappShareUrl(programme, lot),
                onWhatsApp: () => {
                  if (!preview) track(programme.id, "partage", lot.id);
                },
                tour: lotTour ? (
                  <TourButton tour={lotTour} onOpen={() => openTour(lotTour, lot.id)} />
                ) : null,
                visit:
                  lot.statut === "vendue" ? null : (
                    <VisitForm
                      projectId={programme.id}
                      slug={programme.slug}
                      owner={programme.organization.name}
                      lot={lot}
                      preview={preview}
                    />
                  ),
              }
            : null
        }
      />

      <TourOverlay open={touring} onClose={() => setTouring(null)} onPlan={planFromTour} />

      <CompareBar
        lots={compared}
        onRemove={(l) => toggleCompare(l)}
        onClear={() => setCompareIds([])}
        onCompare={() => setComparing(true)}
      />
      <CompareDialog
        lots={compared}
        media={media}
        currency={programme.currency}
        open={comparing && compared.length >= 2}
        onOpenChange={setComparing}
        onOpenLot={(l) => {
          setComparing(false);
          open(l, "compare");
        }}
      />
    </div>
  );
}

function Stat({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-[0.2em] text-white/50">{label}</dt>
      <dd className="mt-1.5 font-brand text-2xl font-medium tracking-tight">{children}</dd>
    </div>
  );
}

function SectionTitle({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <h2 className="font-brand text-3xl font-medium tracking-tight sm:text-4xl">{title}</h2>
      {children}
    </div>
  );
}
