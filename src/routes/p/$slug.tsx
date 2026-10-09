import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Link,
  Outlet,
  createFileRoute,
  useNavigate,
  useParams,
  useRouter,
} from "@tanstack/react-router";
import { ArrowDown, CalendarCheck, Eye, MapPin, Menu, Phone, Play } from "lucide-react";
import { toast } from "sonner";

import { Amenities } from "@/components/public/Amenities";
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
import { LotFiles } from "@/components/public/LotFiles";
import { LotSheet } from "@/components/public/LotSheet";
import { MediaViewer } from "@/components/public/MediaViewer";
import { Presentation } from "@/components/public/Presentation";
import { Situation } from "@/components/public/Situation";
import { TourButton, TourInPage, TourOverlay, type OpenTour } from "@/components/public/Tours";
import { Typologies } from "@/components/public/Typologies";
import { ProgrammeViews } from "@/components/public/ProgrammeViews";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { useFollowLot, useViewKey } from "@/lib/public/use-views";
import { VisitForm } from "@/components/public/VisitForm";
import type { LotStatus } from "@/lib/app/lot-fields";
import { formatPrice } from "@/lib/app/lot-format";
import { mediaImage, mediaVideo, type MediaItem } from "@/lib/app/media";
import { sameType } from "@/lib/lot-types";
import { MAX_COMPARE, toggleCompared } from "@/lib/public/compare";
import { phoneLabel, telHref, whatsappHref } from "@/lib/public/contact";
import { track } from "@/lib/public/events";
import { useLiveLots } from "@/lib/public/live";
import {
  countByStatus,
  hasSituation,
  programmePrice,
  tourOfLot,
  usePublicProgramme,
  type PublicData,
  type PublicLot,
  type PublicTour,
} from "@/lib/public/programme";
import { shareLot, whatsappShareUrl } from "@/lib/public/share";
import { useBrandTheme } from "@/lib/public/theme";
import { lotMedia, showTypologies, typologies } from "@/lib/public/typologies";
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

type Sort = "numero" | "prix-asc" | "prix-desc" | "surface";
const SORTS: { value: Sort; label: string }[] = [
  { value: "numero", label: "Numéro" },
  { value: "prix-asc", label: "Prix croissant" },
  { value: "prix-desc", label: "Prix décroissant" },
  { value: "surface", label: "Surface" },
];

/** Lots in that order; those without the value (price on request…) last. */
function sortLots(lots: PublicLot[], sort: Sort) {
  if (sort === "numero") return lots;
  const value = (l: PublicLot) => (sort === "surface" ? l.surface_habitable : l.prix);
  const sign = sort === "prix-desc" || sort === "surface" ? -1 : 1;
  return [...lots].sort((a, b) => {
    const va = value(a);
    const vb = value(b);
    if (va === null || vb === null) return Number(va === null) - Number(vb === null);
    return (va - vb) * sign;
  });
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

  /* ----- media: the gallery has the photos of the programme and of the types, and the videos */
  const ownVideos = useMemo(
    () => data.videos.filter((m) => !m.lot_id && !m.lot_type),
    [data.videos],
  );
  const gallery = useMemo(
    () =>
      [...media.filter((m) => !m.lot_id), ...data.videos.filter((m) => !m.lot_id)].sort(
        (a, b) => a.sort_order - b.sort_order,
      ),
    [media, data.videos],
  );
  const heroPhoto = media.find((m) => !m.lot_id && !m.lot_type) ?? media[0] ?? null;
  // In the background: the shortest video of the programme (a loop); "Voir le film": the longest.
  const heroVideo =
    ownVideos.reduce<MediaItem | null>(
      (best, v) => (!best || (v.meta.duration ?? 0) < (best.meta.duration ?? 0) ? v : best),
      null,
    ) ?? null;
  const filmIndex = ownVideos.reduce(
    (best, v, i) => ((v.meta.duration ?? 0) > (ownVideos[best]?.meta.duration ?? 0) ? i : best),
    0,
  );
  const [film, setFilm] = useState<number | null>(null);

  const counts = useMemo(() => countByStatus(lots), [lots]);
  // The first paragraph of the description in the hero, the rest under it.
  const [tagline, rest] = useMemo(() => {
    const text = programme.description?.trim() ?? "";
    const cut = text.indexOf("\n");
    return cut < 0 ? [text, ""] : [text.slice(0, cut).trim(), text.slice(cut + 1).trim()];
  }, [programme.description]);
  const from = programmePrice(programme, lots);
  const types = useMemo(() => typologies(data), [data]);
  const withTypes = showTypologies(types);
  const phone = programme.phone;

  // Views of the programme: the main one first; an opened lot brings its view.
  const hasViews = data.views.length > 0;
  const [viewKey, setViewKey] = useViewKey(data);
  useFollowLot(data, lot, setViewKey);

  /* ----- list of the lots: status, type, floor, order */
  const levels = useMemo(
    () =>
      [...new Set(lots.flatMap((l) => (l.niveau === null ? [] : [l.niveau])))].sort(
        (a, b) => b - a,
      ),
    [lots],
  );
  const [levelFilter, setLevelFilter] = useState<number | null>(null);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [sort, setSort] = useState<Sort>("numero");
  const shownLots = sortLots(
    lots.filter(
      (l) =>
        (!filter || l.statut === filter) &&
        (levelFilter === null || l.niveau === levelFilter) &&
        (typeFilter === null || sameType(l.type, typeFilter)),
    ),
    sort,
  );
  // A lot without photos of its own takes one of its type, each lot another one.
  const photoOf = (l: PublicLot): MediaItem | null => {
    const own = media.find((m) => m.lot_id === l.id);
    if (own) return own;
    const type = types.find((t) => sameType(t.name, l.type));
    if (!type?.photos.length) return null;
    const rank = Math.max(
      0,
      type.lots.findIndex((x) => x.id === l.id),
    );
    return type.photos[rank % type.photos.length] ?? null;
  };

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
  const openTour = (tour: PublicTour, lotId: string | null, roomId?: string) => {
    setTouring({ tour, lotId, ...(roomId ? { roomId } : {}) });
    if (!preview) track(programme.id, "visite_360", lotId ?? tour.lotId ?? undefined);
  };
  // The tour shown next to the sales plan (the first one, unless the visitor picks another).
  const [pageTourKey, setPageTourKey] = useState<string | null>(null);
  const pageTour = tours.find((t) => t.key === pageTourKey) ?? tours[0] ?? null;
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
  const shown = lot ?? shownLot;
  const lotTour = lot ? tourOfLot(tours, lot) : null;
  const shownMedia = shown ? lotMedia(data, shown) : null;
  const typeTour = (type: string) => {
    const tour = tours.find((t) => sameType(t.lotType, type));
    return tour ? <TourButton tour={tour} onOpen={() => openTour(tour, null)} /> : null;
  };

  const showLotsOfType = (type: string) => {
    setTypeFilter(type);
    setFilter(null);
    setLevelFilter(null);
    document.getElementById("lots")?.scrollIntoView({ block: "start" });
  };

  /* ----- sections, for the menu */
  const sections = [
    hasViews && { id: "plan", label: "Plan de vente" },
    withTypes && { id: "typologies", label: "Typologies" },
    { id: "lots", label: "Lots" },
    programme.amenities.length > 0 && { id: "prestations", label: "Prestations" },
    gallery.length > 0 && { id: "galerie", label: "Galerie" },
    tours.length > 0 && { id: "visite-360", label: "Visite 360°" },
    hasSituation(programme) && { id: "situation", label: "Situation" },
  ].filter((s): s is { id: string; label: string } => Boolean(s));
  const [menu, setMenu] = useState(false);
  const whatsappText = `Bonjour, je suis intéressé(e) par le programme ${programme.name}.`;

  return (
    <div
      className={cn(
        "min-h-svh bg-[#080808] text-white",
        // Room for the action bar of the phones, or the comparison bar.
        compared.length > 0 ? "pb-36 sm:pb-24" : "pb-24 md:pb-0",
      )}
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
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-5 sm:px-8 lg:gap-6">
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
            className="ml-auto hidden items-center gap-5 text-sm text-white/70 lg:flex"
          >
            {sections.map((s) => (
              <a key={s.id} href={`#${s.id}`} className="hover:text-white">
                {s.label}
              </a>
            ))}
            <a
              href="#visite"
              className="rounded-full border border-white/20 px-4 py-1.5 text-white hover:border-white/50"
            >
              Planifier une visite
            </a>
          </nav>
          {programme.organization.slug !== "rev" ? <RevBadge className="ml-auto lg:ml-0" /> : null}
          <button
            type="button"
            onClick={() => setMenu(true)}
            className={cn(
              "grid size-10 shrink-0 place-items-center rounded-full border border-white/15 text-white/85 transition-colors hover:border-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 lg:hidden",
              programme.organization.slug === "rev" && "ml-auto",
            )}
            aria-label="Menu des rubriques"
          >
            <Menu className="size-5" aria-hidden />
          </button>
        </div>
      </header>

      <Sheet open={menu} onOpenChange={setMenu}>
        <SheetContent
          side="right"
          className="w-[min(20rem,85vw)] border-white/10 bg-[#0d0d0d] p-0 text-white"
        >
          <SheetTitle className="px-6 pb-2 pt-6 font-brand text-lg font-medium">
            {programme.name}
          </SheetTitle>
          <SheetDescription className="sr-only">Rubriques de la page</SheetDescription>
          <nav aria-label="Rubriques" className="px-3 py-2">
            {[...sections, { id: "visite", label: "Planifier une visite" }].map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                onClick={() => setMenu(false)}
                className="flex h-12 items-center rounded-xl px-3 text-base text-white/85 transition-colors hover:bg-white/5 hover:text-white"
              >
                {s.label}
              </a>
            ))}
          </nav>
          {phone ? (
            <div className="space-y-2 border-t border-white/10 p-6">
              <ContactLinks phone={phone} text={whatsappText} />
            </div>
          ) : null}
        </SheetContent>
      </Sheet>

      <main>
        <section className="relative isolate overflow-hidden">
          <HeroBackdrop photo={heroPhoto} video={heroVideo} />
          <div
            className={cn(
              "mx-auto flex max-w-6xl flex-col px-5 sm:px-8",
              heroPhoto || heroVideo
                ? "min-h-[74svh] justify-end pb-8 pt-24 sm:min-h-[84svh] sm:pb-12"
                : "pb-10 pt-12 sm:pt-14",
            )}
          >
            <div className="flex flex-wrap items-end justify-between gap-8">
              <div className="min-w-0 max-w-3xl">
                <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-medium uppercase tracking-[0.24em] text-[color:var(--brand)]">
                  {programme.city ? (
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="size-3.5" aria-hidden />
                      {programme.city}
                    </span>
                  ) : null}
                </p>
                <h1 className="mt-4 font-brand text-5xl font-medium leading-[0.95] tracking-tight drop-shadow-[0_2px_24px_rgba(0,0,0,0.45)] sm:text-7xl">
                  {programme.name}
                </h1>
                {tagline ? (
                  <p className="mt-5 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">
                    {tagline}
                  </p>
                ) : null}
              </div>
              {gallery.length > 2 ? (
                <a
                  href="#galerie"
                  className="group hidden shrink-0 items-center gap-3 rounded-2xl border border-white/15 bg-black/35 p-2 pr-4 text-sm text-white/90 backdrop-blur transition-colors hover:border-white/40 lg:flex"
                >
                  <span className="flex -space-x-6">
                    {gallery
                      .filter((m) => m.kind === "image")
                      .slice(1, 4)
                      .map((m) => (
                        <img
                          key={m.id}
                          src={mediaImage(m).thumb}
                          alt=""
                          className="size-14 rounded-xl border-2 border-black/60 object-cover transition-transform duration-500 group-hover:translate-x-1"
                        />
                      ))}
                  </span>
                  <span>
                    <span className="block font-medium">Galerie</span>
                    <span className="block text-xs text-white/55">{gallery.length} médias</span>
                  </span>
                </a>
              ) : null}
            </div>

            <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-white/10 bg-black/45 p-4 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <dl className="grid grid-cols-2 gap-x-8 gap-y-3 sm:flex sm:flex-wrap sm:gap-x-10">
                <Stat label="Lots">{lots.length}</Stat>
                <Stat label="Disponibles">{counts.disponible}</Stat>
                {types.length > 1 ? <Stat label="Typologies">{types.length}</Stat> : null}
                {from !== null ? (
                  <Stat label="À partir de">{formatPrice(from, programme.currency)}</Stat>
                ) : null}
              </dl>
              <div className="flex flex-wrap gap-2.5">
                <a
                  href={hasViews || pageTour ? "#plan" : withTypes ? "#typologies" : "#lots"}
                  className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-[color:var(--brand)] px-6 text-sm font-medium text-[color:var(--brand-contrast)] transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 sm:flex-none"
                >
                  {hasViews ? "Voir le plan de vente" : pageTour ? "Visite 360°" : "Voir les lots"}
                  <ArrowDown className="size-4" aria-hidden />
                </a>
                {ownVideos.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => setFilm(filmIndex)}
                    className="inline-flex h-12 items-center gap-2 rounded-full border border-white/25 px-5 text-sm font-medium text-white transition-colors hover:border-white/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                  >
                    <Play className="size-4 fill-current" aria-hidden />
                    Le film
                  </button>
                ) : null}
                <a
                  href="#visite"
                  className="hidden h-12 items-center rounded-full border border-white/25 px-5 text-sm font-medium text-white transition-colors hover:border-white/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 sm:inline-flex"
                >
                  Planifier une visite
                </a>
              </div>
            </div>
          </div>
        </section>
        {rest ? (
          <section aria-label="Le programme" className="border-t border-white/10">
            <p className="mx-auto max-w-6xl whitespace-pre-line px-5 py-8 text-base leading-relaxed text-white/70 sm:px-8 sm:py-10 sm:text-lg">
              {rest}
            </p>
          </section>
        ) : null}
        <MediaViewer
          items={ownVideos}
          index={film}
          onIndexChange={setFilm}
          title={programme.name}
        />

        {hasViews || pageTour ? (
          <section id="plan" className="scroll-mt-20 border-t border-white/10">
            <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
              <SectionTitle title={hasViews ? "Plan de vente" : "Visite 360°"}>
                {hasViews ? (
                  <StatusFilters
                    value={filter}
                    onChange={setFilter}
                    counts={counts}
                    total={lots.length}
                  />
                ) : null}
              </SectionTitle>
              <div
                className={cn(
                  "mt-6 grid gap-6",
                  // The 360° tour beside the sales plan on a wide screen, under it on a phone.
                  hasViews && pageTour && "lg:grid-cols-[1.45fr_1fr]",
                )}
              >
                {hasViews ? (
                  <div className="min-w-0">
                    <ProgrammeViews
                      data={data}
                      viewKey={viewKey}
                      onViewChange={setViewKey}
                      filter={filter}
                      highlight={highlight}
                      onOpen={open}
                    />
                  </div>
                ) : null}
                {pageTour ? (
                  <div id="visite-360" className="flex min-w-0 scroll-mt-24 flex-col gap-3">
                    {hasViews || tours.length > 1 ? (
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        {hasViews ? (
                          <h3 className="font-brand text-lg font-medium tracking-tight">
                            Visite 360°
                          </h3>
                        ) : null}
                        {tours.length > 1 ? (
                          <Chips
                            label="Choisir la visite"
                            options={tours.map((t) => ({ value: t.key, label: t.label }))}
                            value={pageTour.key}
                            onChange={(key) => setPageTourKey(key)}
                          />
                        ) : null}
                      </div>
                    ) : null}
                    <TourInPage
                      tour={pageTour}
                      onPlan={null}
                      onExpand={(roomId) => openTour(pageTour, null, roomId)}
                      className={
                        hasViews
                          ? "aspect-[4/3] w-full lg:aspect-auto lg:min-h-[340px] lg:flex-1"
                          : "aspect-[4/3] max-h-[78svh] w-full sm:aspect-[16/9]"
                      }
                    />
                    <p className="text-xs text-white/45">
                      Suivez les flèches d'une pièce à l'autre, ou choisissez une pièce dans le
                      bandeau.
                      <span className="sm:hidden"> Deux doigts pour regarder autour.</span>
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          </section>
        ) : null}

        {withTypes ? (
          <section id="typologies" className="scroll-mt-20 border-t border-white/10">
            <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
              <SectionTitle title="Typologies" />
              <div className="mt-6">
                <Typologies
                  types={types}
                  currency={programme.currency}
                  showPrices={programme.showPrices}
                  onShowLots={showLotsOfType}
                  tourFor={typeTour}
                />
              </div>
            </div>
          </section>
        ) : null}

        <section id="lots" className="scroll-mt-20 border-t border-white/10">
          <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
            <SectionTitle title="Les lots">
              <StatusFilters
                value={filter}
                onChange={setFilter}
                counts={counts}
                total={lots.length}
              />
            </SectionTitle>
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-3">
              {types.length > 1 ? (
                <Chips
                  label="Filtrer les lots par type"
                  options={[
                    { value: null, label: "Tous les types" },
                    ...types.map((t) => ({ value: t.name, label: t.name })),
                  ]}
                  value={typeFilter}
                  onChange={setTypeFilter}
                />
              ) : null}
              {levels.length > 1 ? (
                <Chips
                  label="Filtrer les lots par niveau"
                  options={[
                    { value: null, label: "Tous les niveaux" },
                    ...levels.map((level) => ({ value: level, label: levelLabel(level) })),
                  ]}
                  value={levelFilter}
                  onChange={setLevelFilter}
                />
              ) : null}
              {lots.length > 3 ? (
                <label className="ml-auto flex items-center gap-2 text-xs text-white/55">
                  Trier par
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value as Sort)}
                    className="h-8 rounded-full border border-white/15 bg-transparent px-3 text-xs text-white/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 [&>option]:bg-[#111]"
                  >
                    {SORTS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}
            </div>
            {shownLots.length === 0 ? (
              <p className="mt-8 text-sm text-white/60">
                {lots.length === 0
                  ? "Les lots seront bientôt présentés."
                  : "Aucun lot ne correspond à ces filtres."}
              </p>
            ) : (
              <div className="mt-5">
                <LotCards
                  lots={shownLots}
                  currency={programme.currency}
                  highlight={highlight}
                  onOpen={(l) => open(l, "list")}
                  compare={{ ids: compareIds, onToggle: toggleCompare }}
                  photoOf={photoOf}
                />
              </div>
            )}
          </div>
        </section>

        {programme.amenities.length > 0 ? (
          <section id="prestations" className="scroll-mt-20 border-t border-white/10">
            <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
              <SectionTitle title="Prestations" />
              <div className="mt-6">
                <Amenities items={programme.amenities} />
              </div>
            </div>
          </section>
        ) : null}

        {gallery.length > 0 ? (
          <section id="galerie" className="scroll-mt-20 border-t border-white/10">
            <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
              <SectionTitle title="Galerie" />
              <div className="mt-6">
                <Gallery items={gallery} name={programme.name} />
              </div>
            </div>
          </section>
        ) : null}

        {hasSituation(programme) ? (
          <section id="situation" className="scroll-mt-20 border-t border-white/10">
            <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
              <Situation programme={programme} />
            </div>
          </section>
        ) : null}

        <section id="visite" className="scroll-mt-20 border-t border-white/10">
          <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 sm:px-8 sm:py-14 lg:grid-cols-[1fr_1.3fr] lg:gap-12">
            <div>
              <SectionTitle title="Planifier une visite" />
              <p className="mt-3 max-w-md text-base leading-relaxed text-white/65">
                Laissez vos coordonnées : {programme.organization.name || "l'équipe commerciale"}{" "}
                vous rappelle pour organiser la visite du programme ou du lot qui vous intéresse.
              </p>
              {phone ? (
                <div className="mt-6 flex max-w-sm flex-col gap-2">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-white/50">
                    Ou directement
                  </p>
                  <ContactLinks phone={phone} text={whatsappText} />
                </div>
              ) : null}
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
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-6 text-xs text-white/45 sm:px-8">
          <span>
            {programme.name}
            {programme.organization.name ? ` · ${programme.organization.name}` : ""}
          </span>
          <PoweredBy />
        </div>
      </footer>

      {/* Phones: the visit request and the phone always at hand. */}
      {compared.length === 0 ? (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-[#080808]/90 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl md:hidden">
          <div className="flex gap-2">
            <a
              href="#visite"
              className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-[color:var(--brand)] px-5 text-sm font-medium text-[color:var(--brand-contrast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            >
              <CalendarCheck className="size-4" aria-hidden />
              Planifier une visite
            </a>
            {phone ? (
              <>
                <a
                  href={telHref(phone)}
                  aria-label={`Appeler le ${phoneLabel(phone)}`}
                  className="grid size-12 shrink-0 place-items-center rounded-full border border-white/20 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                >
                  <Phone className="size-5" aria-hidden />
                </a>
                <a
                  href={whatsappHref(phone, whatsappText)}
                  target="_blank"
                  rel="noopener"
                  aria-label="Écrire sur WhatsApp"
                  className="grid size-12 shrink-0 place-items-center rounded-full border border-[#25D366]/50 text-[#5fe08f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                >
                  <WhatsAppIcon className="size-5" />
                </a>
              </>
            ) : null}
          </div>
        </div>
      ) : null}

      <LotSheet
        lot={shown}
        photos={shownMedia?.photos ?? []}
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
                tour:
                  lotTour || shownMedia?.plans.length || shownMedia?.documents.length ? (
                    <div className="space-y-3">
                      {lotTour ? (
                        <TourButton tour={lotTour} onOpen={() => openTour(lotTour, lot.id)} />
                      ) : null}
                      {shownMedia ? (
                        <LotFiles
                          plans={shownMedia.plans}
                          videos={shownMedia.videos}
                          documents={shownMedia.documents}
                          title={`Lot ${lot.numero}`}
                        />
                      ) : null}
                    </div>
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

/** Background of the top of the page: the first video of the programme on a computer, else its first photo. */
function HeroBackdrop({ photo, video }: { photo: MediaItem | null; video: MediaItem | null }) {
  const [motion, setMotion] = useState(false);
  useEffect(() => {
    if (!video) return;
    const wide = window.matchMedia("(min-width: 768px)").matches;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saving = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
      ?.saveData;
    setMotion(wide && !still && !saving);
  }, [video]);
  const clip = video ? mediaVideo(video) : null;
  const image = photo ? mediaImage(photo) : null;
  if (!clip && !image) return null;
  return (
    <>
      {image ? (
        <img
          src={image.large}
          srcSet={`${image.thumb} 800w, ${image.large} 2048w`}
          sizes="100vw"
          alt=""
          fetchPriority="high"
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        />
      ) : clip?.poster ? (
        <img
          src={clip.poster}
          alt=""
          fetchPriority="high"
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        />
      ) : null}
      {clip && motion ? (
        <video
          src={clip.src}
          poster={clip.poster ?? image?.large}
          autoPlay
          muted
          loop
          playsInline
          aria-hidden
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        />
      ) : null}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/45 via-transparent to-[#080808]" />
      {/* The text stays readable over a busy image. */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/65 via-black/20 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-2/3 bg-gradient-to-t from-[#080808] via-[#080808]/70 to-transparent" />
    </>
  );
}

function ContactLinks({ phone, text }: { phone: string; text: string }) {
  return (
    <>
      <a
        href={telHref(phone)}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-white/20 px-5 text-sm text-white transition-colors hover:border-white/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
      >
        <Phone className="size-4" aria-hidden />
        {phoneLabel(phone)}
      </a>
      <a
        href={whatsappHref(phone, text)}
        target="_blank"
        rel="noopener"
        className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#25D366]/50 px-5 text-sm text-[#5fe08f] transition-colors hover:border-[#25D366] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
      >
        <WhatsAppIcon className="size-4" />
        Écrire sur WhatsApp
      </a>
    </>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.2h.01c5.46 0 9.9-4.45 9.9-9.91A9.85 9.85 0 0 0 12.04 2Zm0 18.15h-.01a8.23 8.23 0 0 1-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.25-8.23a8.2 8.2 0 0 1 8.23 8.24c0 4.54-3.7 8.23-8.22 8.23Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.4-.12-.56.13-.17.25-.64.8-.78.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.23.25-.86.85-.86 2.07s.89 2.4 1.01 2.56c.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.29Z" />
    </svg>
  );
}

function Stat({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-[0.2em] text-white/50">{label}</dt>
      <dd className="mt-1 font-brand text-xl font-medium tracking-tight sm:text-2xl">{children}</dd>
    </div>
  );
}

function SectionTitle({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <h2 className="font-brand text-2xl font-medium tracking-tight sm:text-3xl">{title}</h2>
      {children}
    </div>
  );
}

function Chips<T extends string | number>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T | null; label: string }[];
  value: T | null;
  onChange: (value: T | null) => void;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className="-mx-5 flex max-w-[100vw] gap-2 overflow-x-auto px-5 [scrollbar-width:none] sm:mx-0 sm:max-w-full sm:flex-wrap sm:px-0"
    >
      {options.map((o) => {
        const active = value === o.value;
        return (
          <button
            key={o.value ?? "tous"}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(o.value)}
            className={cn(
              "inline-flex h-8 shrink-0 items-center rounded-full border px-3.5 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70",
              active
                ? "border-[color:var(--brand)] text-[color:var(--brand)]"
                : "border-white/15 text-white/65 hover:text-white",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
