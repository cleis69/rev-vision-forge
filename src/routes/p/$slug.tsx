import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import {
  Link,
  Outlet,
  createFileRoute,
  useNavigate,
  useParams,
  useRouter,
} from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowDown, BedDouble, Eye, GitCompareArrows, MapPin, Maximize2 } from "lucide-react";
import { toast } from "sonner";

import { CompareBar, CompareDialog } from "@/components/public/Compare";
import { Gallery } from "@/components/public/Gallery";
import { LotSheet, StatusChip } from "@/components/public/LotSheet";
import { PublicPlan, priceLabel } from "@/components/public/PublicPlan";
import { Skeleton } from "@/components/ui/skeleton";
import { LOT_STATUSES, STATUS_LABELS, type LotStatus } from "@/lib/app/lot-fields";
import { formatPrice } from "@/lib/app/lot-format";
import { mediaImage } from "@/lib/app/media";
import { MAX_COMPARE, toggleCompared } from "@/lib/public/compare";
import { track } from "@/lib/public/events";
import { liveMessages, useLiveProgramme } from "@/lib/public/live";
import {
  startingPrice,
  usePublicProgramme,
  type PublicData,
  type PublicLot,
} from "@/lib/public/programme";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/p/$slug")({
  component: ProgrammePage,
});

const area = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });

function ProgrammePage() {
  const { slug } = Route.useParams();
  const query = usePublicProgramme(slug);

  if (query.isPending) {
    return (
      <div
        className="min-h-svh bg-[#080808] px-5 py-10 sm:px-10"
        aria-busy="true"
        aria-label="Chargement du programme"
      >
        <div className="mx-auto max-w-6xl space-y-6">
          <Skeleton className="h-6 w-40 bg-white/10" />
          <Skeleton className="h-14 w-full max-w-xl bg-white/10" />
          <Skeleton className="aspect-[16/9] w-full rounded-2xl bg-white/10" />
        </div>
      </div>
    );
  }
  if (query.isError || !query.data) {
    return (
      <Message
        title={
          query.isError ? "Page momentanément indisponible" : "Ce programme n'est pas en ligne"
        }
        text={
          query.isError
            ? "Vérifiez votre connexion internet puis rechargez la page."
            : "Il n'existe pas, ou il n'est pas encore (ou plus) publié."
        }
      />
    );
  }
  return (
    <>
      <Programme data={query.data} slug={slug} />
      {/* /p/$slug/lot/$numero: the child route only names the open lot. */}
      <Outlet />
    </>
  );
}

function Message({ title, text }: { title: string; text: string }) {
  useEffect(() => {
    document.title = title;
  }, [title]);
  return (
    <main className="grid min-h-svh place-items-center bg-[#080808] px-6 text-center text-white">
      <div>
        <h1 className="font-display text-2xl font-medium tracking-tight">{title}</h1>
        <p className="mt-3 text-sm text-white/60">{text}</p>
        <PoweredBy className="mt-10" />
      </div>
    </main>
  );
}

function PoweredBy({ className }: { className?: string }) {
  return (
    <p className={cn("text-xs text-white/40", className)}>
      Propulsé par{" "}
      <a
        href="https://realestatevision360.com/"
        className="text-white/60 underline-offset-4 hover:text-white hover:underline"
      >
        REV
      </a>
    </p>
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
  const { programme, lots, shapes, media, preview } = data;
  const navigate = useNavigate();
  const router = useRouter();
  const queryClient = useQueryClient();
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

  /* ----- live status: the lots are read again, visitors see what changed */
  const [highlight, setHighlight] = useState<ReadonlySet<string>>(new Set());
  const highlightTimer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(highlightTimer.current), []);
  useLiveProgramme(
    programme.id,
    (signals) => {
      void queryClient.invalidateQueries({ queryKey: ["public-programme", slug] });
      for (const message of liveMessages(signals)) toast(message);
    },
    // The new status shows at once; the read that follows brings prices and new lots.
    (signal) => {
      setHighlight((ids) => new Set(ids).add(signal.lot_id));
      window.clearTimeout(highlightTimer.current);
      highlightTimer.current = window.setTimeout(() => setHighlight(new Set()), 2600);
      if (signal.op !== "UPDATE" || !signal.statut) return;
      const statut = signal.statut;
      queryClient.setQueryData<PublicData | null>(["public-programme", slug], (current) =>
        current
          ? {
              ...current,
              lots: current.lots.map((l) => (l.id === signal.lot_id ? { ...l, statut } : l)),
            }
          : current,
      );
    },
  );

  /* ----- sharing a lot */
  const lotUrl = (l: PublicLot) =>
    `${window.location.origin}/p/${programme.slug}/lot/${encodeURIComponent(l.numero)}`;
  const lotTitle = (l: PublicLot) =>
    `Lot ${l.numero}${l.type ? ` · ${l.type}` : ""} — ${programme.name}`;
  const share = async (l: PublicLot) => {
    const url = lotUrl(l);
    if (!preview) track(programme.id, "partage", l.id);
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: lotTitle(l), url });
      } catch {
        /* cancelled by the visitor */
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Lien du lot copié");
    } catch {
      toast(url);
    }
  };

  const gallery = useMemo(() => media.filter((m) => !m.lot_id), [media]);
  const hero = gallery[0] ? mediaImage(gallery[0]) : null;
  const counts = useMemo(
    () =>
      Object.fromEntries(
        LOT_STATUSES.map((s) => [s, lots.filter((l) => l.statut === s).length]),
      ) as Record<LotStatus, number>,
    [lots],
  );
  const from = programme.showPrices ? startingPrice(lots) : null;
  const plan = programme.plan && lots.some((l) => shapes.has(l.id)) ? programme.plan : null;
  const shownLots = filter ? lots.filter((l) => l.statut === filter) : lots;

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

  const style = {
    "--brand": programme.organization.brandColor,
    ...(programme.organization.brandFont ? { fontFamily: programme.organization.brandFont } : {}),
  } as CSSProperties;

  return (
    <div
      style={style}
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
              className="h-8 w-auto"
            />
          ) : (
            <span className="truncate font-display text-base font-medium tracking-tight">
              {programme.organization.name}
            </span>
          )}
          <nav
            aria-label="Sections"
            className="ml-auto hidden items-center gap-6 text-sm text-white/70 sm:flex"
          >
            {plan ? (
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
          </nav>
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
            <h1 className="mt-4 max-w-3xl font-display text-4xl font-medium leading-[1.05] tracking-tight sm:text-6xl">
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
            {plan ? (
              <a
                href="#plan"
                className="mt-10 inline-flex h-12 items-center gap-2 rounded-full bg-[color:var(--brand)] px-6 text-sm font-medium text-black transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
              >
                Voir le plan de vente
                <ArrowDown className="size-4" aria-hidden />
              </a>
            ) : null}
          </div>
        </section>

        {plan ? (
          <section id="plan" className="scroll-mt-20 border-t border-white/10">
            <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
              <SectionTitle title="Plan de vente">
                <Filters value={filter} onChange={setFilter} counts={counts} total={lots.length} />
              </SectionTitle>
              <div className="mt-8">
                <PublicPlan
                  image={plan}
                  lots={lots}
                  shapes={shapes}
                  currency={programme.currency}
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
              <Filters value={filter} onChange={setFilter} counts={counts} total={lots.length} />
            </SectionTitle>
            {shownLots.length === 0 ? (
              <p className="mt-8 text-sm text-white/60">
                {lots.length === 0
                  ? "Les lots seront bientôt présentés."
                  : "Aucun lot avec ce statut."}
              </p>
            ) : (
              <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {shownLots.map((lot) => (
                  <li key={lot.id} className="relative">
                    <button
                      type="button"
                      onClick={() => open(lot, "list")}
                      className={cn(
                        "group flex h-full w-full flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-5 pb-16 text-left transition-colors duration-700 hover:border-white/25 hover:bg-white/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70",
                        highlight.has(lot.id) && "border-white/60 bg-white/[0.09] duration-150",
                      )}
                    >
                      <span className="flex items-start justify-between gap-3">
                        <span className="font-display text-lg font-medium tracking-tight">
                          Lot {lot.numero}
                          {lot.type ? <span className="text-white/55"> · {lot.type}</span> : null}
                        </span>
                        <StatusChip status={lot.statut} />
                      </span>
                      <span className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-white/60">
                        {lot.surface_habitable !== null ? (
                          <span className="inline-flex items-center gap-1.5">
                            <Maximize2 className="size-3.5" aria-hidden />
                            {area.format(lot.surface_habitable)} m²
                          </span>
                        ) : null}
                        {lot.chambres !== null ? (
                          <span className="inline-flex items-center gap-1.5">
                            <BedDouble className="size-3.5" aria-hidden />
                            {lot.chambres} ch.
                          </span>
                        ) : null}
                        {lot.surface_terrain !== null ? (
                          <span>Terrain {area.format(lot.surface_terrain)} m²</span>
                        ) : null}
                      </span>
                      <span
                        className={cn(
                          "mt-auto pt-5 text-base font-medium",
                          lot.statut === "vendue" && "text-white/45",
                        )}
                      >
                        {priceLabel(lot, programme.currency)}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleCompare(lot)}
                      aria-pressed={compareIds.includes(lot.id)}
                      aria-label={`${compareIds.includes(lot.id) ? "Retirer du" : "Ajouter au"} comparateur : lot ${lot.numero}`}
                      className={cn(
                        "absolute bottom-4 right-4 inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70",
                        compareIds.includes(lot.id)
                          ? "border-[color:var(--brand)] bg-[color:var(--brand)]/15 text-[color:var(--brand)]"
                          : "border-white/15 text-white/60 hover:border-white/35 hover:text-white",
                      )}
                    >
                      <GitCompareArrows className="size-3.5" aria-hidden />
                      Comparer
                    </button>
                  </li>
                ))}
              </ul>
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
        actions={
          lot
            ? {
                compared: compareIds.includes(lot.id),
                onToggleCompare: () => toggleCompare(lot),
                onShare: () => void share(lot),
                whatsappUrl: `https://wa.me/?text=${encodeURIComponent(`${lotTitle(lot)} ${lotUrl(lot)}`)}`,
                onWhatsApp: () => {
                  if (!preview) track(programme.id, "partage", lot.id);
                },
              }
            : null
        }
      />

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
      <dd className="mt-1.5 font-display text-2xl font-medium tracking-tight">{children}</dd>
    </div>
  );
}

function SectionTitle({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <h2 className="font-display text-3xl font-medium tracking-tight sm:text-4xl">{title}</h2>
      {children}
    </div>
  );
}

function Filters({
  value,
  onChange,
  counts,
  total,
}: {
  value: LotStatus | null;
  onChange: (status: LotStatus | null) => void;
  counts: Record<LotStatus, number>;
  total: number;
}) {
  const options: { status: LotStatus | null; label: string; count: number }[] = [
    { status: null, label: "Tous", count: total },
    ...LOT_STATUSES.map((s) => ({ status: s, label: `${STATUS_LABELS[s]}s`, count: counts[s] })),
  ];
  return (
    <div role="group" aria-label="Filtrer les lots par statut" className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = value === o.status;
        return (
          <button
            key={o.label}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(o.status)}
            className={cn(
              "inline-flex h-9 items-center gap-2 rounded-full border px-4 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70",
              active
                ? "border-white bg-white text-black"
                : "border-white/15 text-white/75 hover:border-white/35 hover:text-white",
            )}
          >
            {o.label}
            <span className={cn("tabular-nums", active ? "text-black/60" : "text-white/45")}>
              {o.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
