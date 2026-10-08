import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowDown, BedDouble, Eye, MapPin, Maximize2 } from "lucide-react";

import { Gallery } from "@/components/public/Gallery";
import { LotSheet, StatusChip } from "@/components/public/LotSheet";
import { PublicPlan, priceLabel } from "@/components/public/PublicPlan";
import { Skeleton } from "@/components/ui/skeleton";
import { LOT_STATUSES, STATUS_LABELS, type LotStatus } from "@/lib/app/lot-fields";
import { formatPrice } from "@/lib/app/lot-format";
import { mediaImage } from "@/lib/app/media";
import { track } from "@/lib/public/events";
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
  return <Programme data={query.data} />;
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

function Programme({ data }: { data: PublicData }) {
  const { programme, lots, shapes, media, preview } = data;
  const [filter, setFilter] = useState<LotStatus | null>(null);
  const [sheet, setSheet] = useState<{ lot: PublicLot | null; open: boolean }>({
    lot: null,
    open: false,
  });
  const tracked = useRef(false);

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
    const owner = programme.organization.name;
    document.title = owner ? `${programme.name} — ${owner}` : programme.name;
    if (!preview && !tracked.current) {
      tracked.current = true;
      track(programme.id, "vue_page");
    }
  }, [programme, preview]);

  const open = (lot: PublicLot, from: "plan" | "list" | "keyboard") => {
    setSheet({ lot, open: true });
    if (preview) return;
    if (from === "plan") track(programme.id, "clic_lot", lot.id);
    track(programme.id, "vue_lot", lot.id);
  };

  const style = {
    "--brand": programme.organization.brandColor,
    ...(programme.organization.brandFont ? { fontFamily: programme.organization.brandFont } : {}),
  } as CSSProperties;

  return (
    <div style={style} className="min-h-svh bg-[#080808] text-white">
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
                  <li key={lot.id}>
                    <button
                      type="button"
                      onClick={() => open(lot, "list")}
                      className="group flex h-full w-full flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-left transition-colors hover:border-white/25 hover:bg-white/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
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
        lot={sheet.lot}
        photos={media.filter((m) => m.lot_id && m.lot_id === sheet.lot?.id)}
        currency={programme.currency}
        open={sheet.open}
        onOpenChange={(o) => setSheet((s) => ({ ...s, open: o }))}
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
