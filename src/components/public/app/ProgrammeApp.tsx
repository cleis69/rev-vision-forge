import { useEffect, useMemo, useRef, useState, type ComponentType } from "react";
import { Link, useNavigate, useParams, useRouter, useSearch } from "@tanstack/react-router";
import {
  ArrowRight,
  Box,
  Building2,
  CalendarCheck,
  Eye,
  Images,
  Layers,
  LayoutGrid,
  MapPin,
  Play,
  Rotate3d,
} from "lucide-react";
import { toast } from "sonner";

import { Amenities } from "@/components/public/Amenities";
import { LanguageSwitch, PoweredBy, RevBadge, StatusFilters } from "@/components/public/Common";
import { CompareBar, CompareDialog } from "@/components/public/Compare";
import { Gallery } from "@/components/public/Gallery";
import { LotCards } from "@/components/public/LotCards";
import { LotFiles } from "@/components/public/LotFiles";
import { LotSheet } from "@/components/public/LotSheet";
import { MediaViewer } from "@/components/public/MediaViewer";
import { ProgrammeViews } from "@/components/public/ProgrammeViews";
import { Situation } from "@/components/public/Situation";
import { TourButton, TourInPage, TourOverlay, type OpenTour } from "@/components/public/Tours";
import { Typologies } from "@/components/public/Typologies";
import { VisitForm } from "@/components/public/VisitForm";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import type { LotStatus } from "@/lib/app/lot-fields";
import { coverPhoto, type MediaItem } from "@/lib/app/media";
import { useCopy } from "@/lib/i18n";
import { sameType } from "@/lib/lot-types";
import { firstTab, tabOfHash, type AppTab } from "@/lib/public/app-tabs";
import { MAX_COMPARE, toggleCompared } from "@/lib/public/compare";
import { whatsappHref } from "@/lib/public/contact";
import { track } from "@/lib/public/events";
import { usePublicRoutes, usePublicText } from "@/lib/public/i18n";
import { useLiveLots } from "@/lib/public/live";
import {
  filterLots,
  canSearch,
  comparedFromLink,
  focusOf,
  NO_SEARCH,
  searchRange,
  type LotSearch,
  lotsOfView,
  sortLots,
  LOT_SORTS,
  type LotSort,
} from "@/lib/public/lot-list";
import {
  countByStatus,
  hasSituation,
  programmePrice,
  tourOfLot,
  type PublicData,
  type PublicLot,
  type PublicTour,
} from "@/lib/public/programme";
import { shareComparison, shareLot, whatsappShareUrl } from "@/lib/public/share";
import { lotMedia, showTypologies, typologies } from "@/lib/public/typologies";
import { useFollowLot, useViewKey } from "@/lib/public/use-views";
import { cn } from "@/lib/utils";
import { LotPanel } from "./LotPanel";
import { LotSearchButton, LotSearchFields } from "./LotSearch";
import { Chips, ContactLinks, HeroBackdrop, SectionTitle, Stat, WhatsAppIcon } from "./parts";

/* The page of a programme as an application (/p/$slug, /en/p/$slug): the 3D
   view fills the screen from the first second, the lots of the view beside it
   (under it on a phone), and tabs for the rest — lots, types, photos, 360°
   tour, neighbourhood, presentation. The open lot keeps its own address
   (/p/$slug/lot/$numero) and the tab is named after the # of the address. */

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

/** Wide screens get the lots beside the view and the lot sheet next to it. */
function useWide() {
  const query = "(min-width: 1024px)";
  const [wide, setWide] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const media = window.matchMedia(query);
    const sync = () => setWide(media.matches);
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);
  return wide;
}

const COPY = {
  fr: {
    tabs: {
      plan: "Vue 3D",
      lots: "Lots",
      typologies: "Typologies",
      galerie: "Photos",
      "visite-360": "Visite 360°",
      situation: "Quartier",
      programme: "Le programme",
    } satisfies Record<AppTab, string>,
    sorts: {
      numero: "Numéro",
      "prix-asc": "Prix croissant",
      "prix-desc": "Prix décroissant",
      surface: "Surface",
    },
    nav: "Rubriques du programme",
    unknownLot: "Ce lot n'existe pas ou n'est plus présenté.",
    compareMax: (n: number) => `${n} lots au maximum : retirez-en un pour en ajouter un autre.`,
    whatsapp: (name: string) => `Bonjour, je suis intéressé(e) par le programme ${name}.`,
    preview:
      "Aperçu : ce programme n'est pas encore publié, seuls les membres de votre organisation le voient.",
    promoterSpace: "Espace promoteur",
    bookVisit: "Planifier une visite",
    lots: "Lots",
    available: "Disponibles",
    types: "Typologies",
    from: "À partir de",
    explore: "Explorer en 3D",
    seeLots: "Voir les lots",
    film: "Le film",
    lotsTitle: "Les lots",
    byType: "Filtrer les lots par type",
    allTypes: "Tous les types",
    byLevel: "Filtrer les lots par niveau",
    allLevels: "Tous les niveaux",
    sortBy: "Trier par",
    noLotsYet: "Les lots seront bientôt présentés.",
    noMatch: "Aucun lot ne correspond à ces filtres.",
    amenities: "Prestations",
    chooseTour: "Choisir la visite",
    tourHint: "Suivez les flèches d'une pièce à l'autre, ou choisissez une pièce dans le bandeau.",
    visitIntro: (owner: string) =>
      `Laissez vos coordonnées : ${owner || "l'équipe commerciale"} vous rappelle pour organiser la visite du programme ou du lot qui vous intéresse.`,
    directly: "Ou directement",
    writeWhatsapp: "Écrire sur WhatsApp",
    contactTitle: "Une question, une visite ?",
  },
  en: {
    tabs: {
      plan: "3D view",
      lots: "Lots",
      typologies: "Types",
      galerie: "Photos",
      "visite-360": "360° tour",
      situation: "Neighbourhood",
      programme: "The programme",
    } satisfies Record<AppTab, string>,
    sorts: {
      numero: "Lot number",
      "prix-asc": "Price: low to high",
      "prix-desc": "Price: high to low",
      surface: "Living area",
    },
    nav: "Sections of the programme",
    unknownLot: "This lot does not exist or is no longer listed.",
    compareMax: (n: number) => `${n} lots at most: remove one to add another.`,
    whatsapp: (name: string) => `Hello, I am interested in the ${name} programme.`,
    preview:
      "Preview: this programme is not published yet; only members of your organisation can see it.",
    promoterSpace: "Developer area",
    bookVisit: "Book a visit",
    lots: "Lots",
    available: "Available",
    types: "Property types",
    from: "From",
    explore: "Explore in 3D",
    seeLots: "View the lots",
    film: "Watch the film",
    lotsTitle: "Lots",
    byType: "Filter lots by type",
    allTypes: "All types",
    byLevel: "Filter lots by floor",
    allLevels: "All floors",
    sortBy: "Sort by",
    noLotsYet: "The lots will be listed soon.",
    noMatch: "No lots match these filters.",
    amenities: "Amenities",
    chooseTour: "Choose the tour",
    tourHint: "Follow the arrows from room to room, or pick a room in the strip.",
    visitIntro: (owner: string) =>
      `Leave your details: ${owner || "the sales team"} will call you back to arrange a visit to the programme or the lot you are interested in.`,
    directly: "Or directly",
    writeWhatsapp: "Message on WhatsApp",
    contactTitle: "A question, a visit?",
  },
};

const TAB_ICONS: Record<AppTab, ComponentType<{ className?: string }>> = {
  plan: Box,
  lots: LayoutGrid,
  typologies: Layers,
  galerie: Images,
  "visite-360": Rotate3d,
  situation: MapPin,
  programme: Building2,
};

export function ProgrammeApp({ data, slug }: { data: PublicData; slug: string }) {
  const { programme, lots, media, preview, tours } = data;
  const navigate = useNavigate();
  const router = useRouter();
  const routes = usePublicRoutes();
  const copy = useCopy(COPY);
  const text = usePublicText();
  const { locale } = text;
  const wide = useWide();
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
    toast.error(copy.unknownLot, { id: "lot-inconnu" });
    void navigate({ to: routes.programme, params: { slug }, replace: true, resetScroll: false });
  }, [numero, lot, navigate, slug, routes.programme, copy.unknownLot]);

  const lotId = lot?.id;
  useEffect(() => {
    if (lotId && !preview) track(programme.id, "vue_lot", lotId);
  }, [lotId, preview, programme.id]);

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
  // A comparison received as a link (?comparer=A1,B2): those lots, side by side.
  const { comparer } = useSearch({ strict: false }) as { comparer?: string };
  useEffect(() => {
    if (!comparer) return;
    const received = comparedFromLink(comparer, lots, MAX_COMPARE);
    if (received.length > 0) setCompareIds(received.map((l) => l.id));
    if (received.length >= 2) setComparing(true);
    void navigate({
      to: routes.programme,
      params: { slug },
      search: {},
      replace: true,
      resetScroll: false,
    });
    // The link is read once, when the page opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const toggleCompare = (target: PublicLot) => {
    const next = toggleCompared(compareIds, target.id);
    if (!next) {
      toast.error(copy.compareMax(MAX_COMPARE));
      return;
    }
    setCompareIds(next);
  };

  const highlight = useLiveLots(programme.id, slug);

  /* ----- media: the photos of the programme and of the types, and the videos */
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
  const heroPhoto = coverPhoto(media, programme.coverId);
  // In the background: the shortest video of the programme (a loop); "Le film": the longest.
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
  const [tagline, rest] = useMemo(() => {
    const t = programme.description?.trim() ?? "";
    const cut = t.indexOf("\n");
    return cut < 0 ? [t, ""] : [t.slice(0, cut).trim(), t.slice(cut + 1).trim()];
  }, [programme.description]);
  const from = programmePrice(programme, lots);
  const types = useMemo(() => typologies(data), [data]);
  const withTypes = showTypologies(types);
  const typeNames = useMemo(() => types.map((t) => t.name), [types]);
  const phone = programme.phone;
  const whatsappText = copy.whatsapp(programme.name);

  /* ----- tabs */
  const hasViews = data.views.length > 0;
  const tabs = useMemo(
    () =>
      (
        [
          hasViews && "plan",
          "lots",
          withTypes && "typologies",
          gallery.length > 0 && "galerie",
          tours.length > 0 && "visite-360",
          hasSituation(programme) && "situation",
          "programme",
        ] as const
      ).filter((t): t is AppTab => Boolean(t)),
    [hasViews, withTypes, gallery.length, tours.length, programme],
  );
  const [visitOpen, setVisitOpen] = useState(false);
  const [tab, setTabState] = useState<AppTab>(() => {
    const asked = tabOfHash(window.location.hash, tabs);
    return asked.tab ?? firstTab(tabs);
  });
  useEffect(() => {
    if (tabOfHash(window.location.hash, tabs).visit) setVisitOpen(true);
    // The address at the first render only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const activeTab = tabs.includes(tab) ? tab : firstTab(tabs);
  const scroller = useRef<HTMLDivElement>(null);
  const setTab = (next: AppTab) => {
    if (lot) close();
    setTabState(next);
    scroller.current?.scrollTo({ top: 0 });
    const url = `${window.location.pathname}${window.location.search}#${next}`;
    window.history.replaceState(window.history.state, "", url);
  };

  /* ----- views: the main one first; an opened lot brings its view */
  const [viewKey, setViewKey] = useViewKey(data);
  useFollowLot(data, lot, setViewKey);
  const currentView = data.views.find((v) => v.id === viewKey) ?? null;
  const firstFrame = currentView?.orbit?.frames[0];
  const stageHeight =
    !wide && firstFrame
      ? `min(60svh, calc(100vw * ${(firstFrame.height / firstFrame.width).toFixed(4)} + 7.5rem))`
      : null;

  /* ----- filters, shared by the list beside the view and the Lots tab */
  const [filter, setFilter] = useState<LotStatus | null>(null);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [levelFilter, setLevelFilter] = useState<number | null>(null);
  const [sort, setSort] = useState<LotSort>("numero");
  const [hovered, setHovered] = useState<string | null>(null);
  const [allLots, setAllLots] = useState(false);
  useEffect(() => setAllLots(false), [viewKey]);
  const [search, setSearch] = useState<LotSearch>(NO_SEARCH);
  const [searchingLots, setSearchingLots] = useState(false);
  const range = useMemo(() => searchRange(lots), [lots]);
  const focus = useMemo(() => focusOf(lots, typeFilter, search), [lots, typeFilter, search]);

  const viewLots = lotsOfView(lots, currentView);
  const scoped = viewLots.length < lots.length;
  const panelLots = scoped && !allLots ? viewLots : lots;
  const panelShown = sortLots(
    filterLots(panelLots, { status: filter, type: typeFilter, search }),
    sort,
  );

  const levels = useMemo(
    () =>
      [...new Set(lots.flatMap((l) => (l.niveau === null ? [] : [l.niveau])))].sort(
        (a, b) => b - a,
      ),
    [lots],
  );
  const listShown = sortLots(
    filterLots(lots, { status: filter, type: typeFilter, level: levelFilter, search }),
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

  function open(target: PublicLot, from: "plan" | "list" | "keyboard" | "compare") {
    if (!preview && from === "plan") track(programme.id, "clic_lot", target.id);
    // Back closes the panel when it was opened on this page.
    if (!numero) openedHere.current = true;
    void navigate({
      to: routes.lot,
      params: { slug, numero: target.numero },
      replace: Boolean(numero),
      resetScroll: false,
    });
  }

  function close() {
    if (openedHere.current) router.history.back();
    else
      void navigate({ to: routes.programme, params: { slug }, replace: true, resetScroll: false });
  }

  /* ----- 360° tours: full screen, from the tab or from the sheet of a lot */
  const [touring, setTouring] = useState<OpenTour | null>(null);
  const [askVisit, setAskVisit] = useState<{ lotId: string } | null>(null);
  const openTour = (tour: PublicTour, lotIdOfTour: string | null, roomId?: string) => {
    setTouring({ tour, lotId: lotIdOfTour, ...(roomId ? { roomId } : {}) });
    if (!preview) track(programme.id, "visite_360", lotIdOfTour ?? tour.lotId ?? undefined);
  };
  const [pageTourKey, setPageTourKey] = useState<string | null>(null);
  const pageTour = tours.find((t) => t.key === pageTourKey) ?? tours[0] ?? null;
  // The visit request: the form of the lot (its sheet), else the one of the programme.
  const planFromTour = ({ tour, lotId: tourLot }: OpenTour) => {
    setTouring(null);
    const target = lots.find((l) => l.id === (tourLot ?? tour.lotId));
    if (target && target.statut !== "vendue") {
      if (target.id !== lot?.id) open(target, "list");
      setAskVisit({ lotId: target.id });
    } else {
      setVisitOpen(true);
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
    setTab(hasViews ? "plan" : "lots");
  };

  const tabButton = (t: AppTab, compact: boolean) => {
    const Icon = TAB_ICONS[t];
    const active = activeTab === t;
    return (
      <button
        key={t}
        type="button"
        onClick={() => setTab(t)}
        aria-current={active ? "page" : undefined}
        className={cn(
          "inline-flex shrink-0 items-center gap-2 rounded-full font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70",
          compact ? "h-9 px-3.5 text-[13px]" : "h-9 px-2.5 text-[13px] xl:px-3.5 xl:text-sm",
          active ? "bg-white text-black" : "text-white/70 hover:bg-white/5 hover:text-white",
        )}
      >
        <Icon className={cn("size-4", !compact && "hidden xl:block")} aria-hidden />
        {copy.tabs[t]}
      </button>
    );
  };

  const footer = (
    <footer className="border-t border-white/10">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-6 text-xs text-white/45 sm:px-8">
        <span>
          {programme.name}
          {programme.organization.name ? ` · ${programme.organization.name}` : ""}
        </span>
        <PoweredBy />
      </div>
    </footer>
  );

  const container = "mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10";

  return (
    <div className="fixed inset-0 flex flex-col bg-[#080808] text-white">
      {preview ? (
        <div className="shrink-0 bg-amber-400 px-5 py-2 text-center text-sm font-medium text-black">
          <Eye className="mr-2 inline size-4 align-[-3px]" aria-hidden />
          {copy.preview}{" "}
          <Link to="/app" className="underline underline-offset-4">
            {copy.promoterSpace}
          </Link>
        </div>
      ) : null}

      <header className="relative z-30 flex h-14 shrink-0 items-center gap-3 border-b border-white/10 bg-[#080808] px-4 sm:px-6 lg:h-16">
        <div className="flex min-w-0 items-center gap-3 lg:max-w-[15rem] lg:shrink-0 xl:max-w-[18rem]">
          {programme.organization.logo ? (
            <img
              src={programme.organization.logo}
              alt={programme.organization.name}
              className="h-7 w-auto shrink-0 sm:h-8"
            />
          ) : null}
          <div className="min-w-0">
            <h1 className="truncate font-brand text-base font-medium leading-tight tracking-tight sm:text-lg">
              {programme.name}
            </h1>
            {programme.city || !programme.organization.logo ? (
              <p className="truncate text-[11px] leading-tight text-white/50">
                {[programme.city, programme.organization.logo ? null : programme.organization.name]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            ) : null}
          </div>
        </div>

        <nav
          aria-label={copy.nav}
          className="mx-auto hidden min-w-0 items-center gap-0.5 overflow-x-auto rounded-full border border-white/10 bg-white/[0.03] p-1 [scrollbar-width:none] lg:flex"
        >
          {tabs.map((t) => tabButton(t, false))}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-2 lg:ml-0">
          {/* REV's own programmes carry its logo already, when they have one. */}
          {programme.organization.slug !== "rev" || !programme.organization.logo ? (
            <RevBadge size="sm" className="hidden sm:inline-flex" />
          ) : null}
          <LanguageSwitch />
          <button
            type="button"
            onClick={() => setVisitOpen(true)}
            aria-label={copy.bookVisit}
            title={copy.bookVisit}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-white/20 px-3 text-sm text-white transition-colors hover:border-white/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 2xl:px-4"
          >
            <CalendarCheck className="size-4" aria-hidden />
            <span className="hidden 2xl:inline">{copy.bookVisit}</span>
          </button>
          {phone ? (
            <a
              href={whatsappHref(phone, whatsappText)}
              target="_blank"
              rel="noopener"
              aria-label={copy.writeWhatsapp}
              title={copy.writeWhatsapp}
              className="inline-flex h-10 items-center gap-2 rounded-full bg-[#25D366] px-3 text-sm font-medium text-black transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 xl:px-4"
            >
              <WhatsAppIcon className="size-5" />
              <span className="hidden xl:inline">WhatsApp</span>
            </a>
          ) : null}
        </div>
      </header>

      {tabs.length > 1 ? (
        <nav
          aria-label={copy.nav}
          className="flex shrink-0 gap-1 overflow-x-auto border-b border-white/10 px-3 py-2 [scrollbar-width:none] lg:hidden"
        >
          {tabs.map((t) => tabButton(t, true))}
        </nav>
      ) : null}

      <main className="relative min-h-0 flex-1">
        {activeTab === "plan" ? (
          <div
            ref={scroller}
            className={cn(
              "h-full overflow-y-auto lg:flex lg:overflow-hidden",
              compared.length > 0 && "pb-28 lg:pb-0",
            )}
          >
            <div
              className="relative h-[60svh] min-h-[300px] lg:!h-auto lg:min-h-0 lg:flex-1"
              // Phones: a sequence keeps its format, with room above and below for the buttons.
              style={stageHeight ? { height: stageHeight } : undefined}
            >
              <ProgrammeViews
                data={data}
                viewKey={viewKey}
                onViewChange={setViewKey}
                filter={filter}
                focus={focus}
                highlight={highlight}
                selected={hovered ?? lot?.id ?? null}
                variant="app"
                onOpen={open}
              />
            </div>
            <aside
              aria-label={copy.lotsTitle}
              className={cn(
                "lg:flex lg:w-[400px] lg:shrink-0 lg:flex-col lg:overflow-y-auto lg:border-l lg:border-white/10",
                compared.length > 0 && "lg:pb-24",
              )}
            >
              <LotPanel
                title={scoped && !allLots ? (currentView?.name ?? null) : null}
                scoped={scoped ? { showingAll: allLots, total: lots.length } : null}
                lots={panelLots}
                shown={panelShown}
                types={withTypes || typeNames.length > 1 ? typeNames : []}
                status={filter}
                onStatus={setFilter}
                type={typeFilter}
                onType={setTypeFilter}
                sort={sort}
                onSort={setSort}
                currency={programme.currency}
                highlight={highlight}
                activeId={lot?.id ?? null}
                compareIds={compareIds}
                onToggleCompare={toggleCompare}
                onHover={setHovered}
                onOpen={(l) => open(l, "list")}
                onToggleScope={() => setAllLots((v) => !v)}
                search={search}
                onSearch={setSearch}
                range={range}
              />
              <PoweredBy className="mt-auto px-5 pb-6 pt-8" />
            </aside>
          </div>
        ) : activeTab === "visite-360" && pageTour ? (
          <div className="relative h-full">
            <TourInPage
              tour={pageTour}
              onPlan={() => setVisitOpen(true)}
              onExpand={(roomId) => openTour(pageTour, null, roomId)}
              className="absolute inset-0 h-full rounded-none border-0"
            />
            {tours.length > 1 ? (
              <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-center p-3">
                <div className="pointer-events-auto rounded-full border border-white/10 bg-black/60 p-1 backdrop-blur-md">
                  <Chips
                    label={copy.chooseTour}
                    options={tours.map((t) => ({ value: t.key, label: t.label }))}
                    value={pageTour.key}
                    onChange={(key) => setPageTourKey(key)}
                    className="mx-0 max-w-[calc(100vw-2rem)] px-0"
                  />
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <div
            ref={scroller}
            className={cn("h-full overflow-y-auto", compared.length > 0 && "pb-28")}
          >
            {activeTab === "programme" ? (
              <>
                <section className="relative isolate overflow-hidden">
                  <HeroBackdrop photo={heroPhoto} video={heroVideo} />
                  <div
                    className={cn(
                      "mx-auto flex max-w-6xl flex-col px-5 sm:px-8",
                      heroPhoto || heroVideo
                        ? "min-h-[62svh] justify-end pb-8 pt-20 sm:pb-10"
                        : "pb-8 pt-10",
                    )}
                  >
                    {programme.city ? (
                      <p className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.24em] text-[color:var(--brand)]">
                        <MapPin className="size-3.5" aria-hidden />
                        {programme.city}
                      </p>
                    ) : null}
                    <h2 className="mt-4 max-w-3xl font-brand text-5xl font-medium leading-[0.95] tracking-tight drop-shadow-[0_2px_24px_rgba(0,0,0,0.45)] sm:text-7xl">
                      {programme.name}
                    </h2>
                    {tagline ? (
                      <p className="mt-5 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">
                        {tagline}
                      </p>
                    ) : null}
                    <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-white/10 bg-black/45 p-4 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between sm:p-5">
                      <dl className="grid grid-cols-2 gap-x-8 gap-y-3 sm:flex sm:flex-wrap sm:gap-x-10">
                        <Stat label={copy.lots}>{lots.length}</Stat>
                        <Stat label={copy.available}>{counts.disponible}</Stat>
                        {types.length > 1 ? <Stat label={copy.types}>{types.length}</Stat> : null}
                        {from !== null ? (
                          <Stat label={copy.from}>{text.price(from, programme.currency)}</Stat>
                        ) : null}
                      </dl>
                      <div className="flex flex-wrap gap-2.5">
                        <button
                          type="button"
                          onClick={() => setTab(hasViews ? "plan" : "lots")}
                          className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-[color:var(--brand)] px-6 text-sm font-medium text-[color:var(--brand-contrast)] transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 sm:flex-none"
                        >
                          {hasViews ? copy.explore : copy.seeLots}
                          <ArrowRight className="size-4" aria-hidden />
                        </button>
                        {ownVideos.length > 0 ? (
                          <button
                            type="button"
                            onClick={() => setFilm(filmIndex)}
                            className="inline-flex h-12 items-center gap-2 rounded-full border border-white/25 px-5 text-sm font-medium text-white transition-colors hover:border-white/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                          >
                            <Play className="size-4 fill-current" aria-hidden />
                            {copy.film}
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </section>
                {rest ? (
                  <section className="border-t border-white/10">
                    <p className="mx-auto max-w-6xl whitespace-pre-line px-5 py-8 text-base leading-relaxed text-white/70 sm:px-8 sm:py-10 sm:text-lg">
                      {rest}
                    </p>
                  </section>
                ) : null}
                {programme.amenities.length > 0 ? (
                  <section id="prestations" className="border-t border-white/10">
                    <div className={container}>
                      <SectionTitle title={copy.amenities} />
                      <div className="mt-6">
                        <Amenities items={programme.amenities} />
                      </div>
                    </div>
                  </section>
                ) : null}
                <section className="border-t border-white/10">
                  <div
                    className={cn(container, "flex flex-wrap items-center justify-between gap-6")}
                  >
                    <div className="max-w-xl">
                      <SectionTitle title={copy.contactTitle} />
                      <p className="mt-3 text-base leading-relaxed text-white/65">
                        {copy.visitIntro(programme.organization.name)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setVisitOpen(true)}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[color:var(--brand)] px-5 text-sm font-medium text-[color:var(--brand-contrast)] transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                      >
                        <CalendarCheck className="size-4" aria-hidden />
                        {copy.bookVisit}
                      </button>
                      {phone ? <ContactLinks phone={phone} text={whatsappText} /> : null}
                    </div>
                  </div>
                </section>
              </>
            ) : activeTab === "lots" ? (
              <section className={container}>
                <SectionTitle title={copy.lotsTitle}>
                  <StatusFilters
                    value={filter}
                    onChange={setFilter}
                    counts={counts}
                    total={lots.length}
                  />
                </SectionTitle>
                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-3">
                  {canSearch(range) ? (
                    <LotSearchButton
                      open={searchingLots}
                      onToggle={() => setSearchingLots((o) => !o)}
                      search={search}
                    />
                  ) : null}
                  {types.length > 1 ? (
                    <Chips
                      label={copy.byType}
                      options={[
                        { value: null, label: copy.allTypes },
                        ...types.map((t) => ({ value: t.name, label: t.name })),
                      ]}
                      value={typeFilter}
                      onChange={setTypeFilter}
                    />
                  ) : null}
                  {levels.length > 1 ? (
                    <Chips
                      label={copy.byLevel}
                      options={[
                        { value: null, label: copy.allLevels },
                        ...levels.map((level) => ({ value: level, label: text.level(level) })),
                      ]}
                      value={levelFilter}
                      onChange={setLevelFilter}
                    />
                  ) : null}
                  {lots.length > 3 ? (
                    <label className="ml-auto flex items-center gap-2 text-xs text-white/55">
                      {copy.sortBy}
                      <select
                        value={sort}
                        onChange={(e) => setSort(e.target.value as LotSort)}
                        className="h-8 rounded-full border border-white/15 bg-transparent px-3 text-xs text-white/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 [&>option]:bg-[#111]"
                      >
                        {LOT_SORTS.map((s) => (
                          <option key={s} value={s}>
                            {copy.sorts[s]}
                          </option>
                        ))}
                      </select>
                    </label>
                  ) : null}
                </div>
                {canSearch(range) && searchingLots ? (
                  <div className="mt-4 max-w-xl">
                    <LotSearchFields
                      range={range}
                      search={search}
                      onSearch={setSearch}
                      currency={programme.currency}
                      found={listShown.length}
                    />
                  </div>
                ) : null}
                {listShown.length === 0 ? (
                  <p className="mt-8 text-sm text-white/60">
                    {lots.length === 0 ? copy.noLotsYet : copy.noMatch}
                  </p>
                ) : (
                  <div className="mt-5">
                    <LotCards
                      lots={listShown}
                      currency={programme.currency}
                      highlight={highlight}
                      onOpen={(l) => open(l, "list")}
                      compare={{ ids: compareIds, onToggle: toggleCompare }}
                      photoOf={photoOf}
                    />
                  </div>
                )}
              </section>
            ) : activeTab === "typologies" ? (
              <section className={container}>
                <SectionTitle title={copy.types} />
                <div className="mt-6">
                  <Typologies
                    types={types}
                    currency={programme.currency}
                    showPrices={programme.showPrices}
                    onShowLots={showLotsOfType}
                    tourFor={typeTour}
                  />
                </div>
              </section>
            ) : activeTab === "galerie" ? (
              <section className={container}>
                <SectionTitle title={copy.tabs.galerie}>
                  {ownVideos.length > 0 ? (
                    <button
                      type="button"
                      onClick={() => setFilm(filmIndex)}
                      className="inline-flex h-10 items-center gap-2 rounded-full border border-white/25 px-4 text-sm text-white transition-colors hover:border-white/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                    >
                      <Play className="size-4 fill-current" aria-hidden />
                      {copy.film}
                    </button>
                  ) : null}
                </SectionTitle>
                <div className="mt-6">
                  <Gallery items={gallery} name={programme.name} />
                </div>
              </section>
            ) : activeTab === "situation" ? (
              <section className={container}>
                <Situation programme={programme} />
              </section>
            ) : null}
            {footer}
          </div>
        )}
      </main>

      <MediaViewer items={ownVideos} index={film} onIndexChange={setFilm} title={programme.name} />

      <Sheet open={visitOpen} onOpenChange={setVisitOpen}>
        <SheetContent
          side="right"
          className="w-full overflow-y-auto border-white/10 bg-[#0d0d0d] p-0 text-white sm:max-w-md"
        >
          <div className="p-6">
            <SheetTitle className="font-brand text-2xl font-medium tracking-tight text-white">
              {copy.bookVisit}
            </SheetTitle>
            <SheetDescription className="mt-2 text-sm leading-relaxed text-white/65">
              {copy.visitIntro(programme.organization.name)}
            </SheetDescription>
            {phone ? (
              <div className="mt-5 flex flex-col gap-2">
                <p className="text-[11px] uppercase tracking-[0.2em] text-white/50">
                  {copy.directly}
                </p>
                <ContactLinks phone={phone} text={whatsappText} />
              </div>
            ) : null}
            <div className="mt-6">
              <VisitForm
                projectId={programme.id}
                slug={programme.slug}
                owner={programme.organization.name}
                lots={lots}
                preview={preview}
              />
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <LotSheet
        lot={shown}
        photos={shownMedia?.photos ?? []}
        currency={programme.currency}
        open={Boolean(lot)}
        onOpenChange={(o) => !o && close()}
        askVisit={askVisit}
        modal={!wide}
        // Under the bar of the page, over the list of the lots.
        className={wide && !preview ? "top-16 h-[calc(100%-4rem)]" : undefined}
        actions={
          lot
            ? {
                compared: compareIds.includes(lot.id),
                onToggleCompare: () => toggleCompare(lot),
                onShare: () => void shareLot(programme, lot, !preview, locale),
                whatsappUrl: whatsappShareUrl(programme, lot, locale),
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
        onShare={() => void shareComparison(programme, compared, locale)}
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
