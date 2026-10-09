import { useId, type ReactNode } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Check, ChevronRight, Copy, ExternalLink, Globe, MonitorPlay, X } from "lucide-react";
import { toast } from "sonner";

import { StatusBadge } from "@/components/app/Blocks";
import { useCurrentProject } from "@/components/app/ProjectContext";
import { StatusDot } from "@/components/app/lots/LotStatus";
import { STATUS_BG } from "@/components/app/lots/status-colors";
import { Kpi } from "@/components/app/stats/Kpi";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SOURCE_LABELS, useLeads } from "@/lib/app/leads";
import type { LotStatus } from "@/lib/app/lot-fields";
import { formatPrice } from "@/lib/app/lot-format";
import { useLots } from "@/lib/app/lots";
import { coverPhoto, mediaImage, useMedia } from "@/lib/app/media";
import { useOrbits } from "@/lib/app/orbit";
import {
  pageChecks,
  percentOf,
  salesSummary,
  timeAgo,
  type CheckTab,
  type SalesLine,
} from "@/lib/app/overview";
import { useViews } from "@/lib/app/plan";
import { lotRows, useProjectStats } from "@/lib/app/stats";
import { usePanoramas } from "@/lib/app/tours";
import { useViewMarkers } from "@/lib/app/view-panorama";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/_espace/projets/$id/apercu")({
  component: OverviewPage,
});

/* Aperçu: the programme at a glance — sales, visit requests, the last
   7 days, the public page and what it still lacks, each with a link to the
   tab where it is handled. */

const TAB_ROUTES = {
  plan: "/app/projets/$id/plan",
  lots: "/app/projets/$id/lots",
  typologies: "/app/projets/$id/typologies",
  medias: "/app/projets/$id/medias",
  visite: "/app/projets/$id/visite",
  reglages: "/app/projets/$id/reglages",
} as const satisfies Record<CheckTab, string>;

// Sold first: the bar fills from the left as the programme sells.
const BAR_ORDER: readonly LotStatus[] = ["vendue", "reservee", "disponible"];
const PLURAL_LABELS: Record<LotStatus, string> = {
  vendue: "Vendus",
  reservee: "Réservés",
  disponible: "Disponibles",
};

function OverviewPage() {
  return (
    <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
      <div className="space-y-4">
        <Sales />
        <Requests />
        <Activity />
      </div>
      <div className="space-y-4">
        <PublicPage />
        <Contents />
      </div>
    </div>
  );
}

function Panel({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  const id = useId();
  return (
    <section aria-labelledby={id} className="rounded-2xl border border-border bg-card p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 id={id} className="font-display text-lg font-medium tracking-tight">
          {title}
        </h2>
        {action}
      </div>
      <div className="mt-3.5">{children}</div>
    </section>
  );
}

function TabLink({
  to,
  children,
}: {
  to: (typeof TAB_ROUTES)[CheckTab] | DashboardTab;
  children: string;
}) {
  const { project } = useCurrentProject();
  return (
    <Link
      to={to}
      params={{ id: project.id }}
      className="inline-flex shrink-0 items-center gap-0.5 rounded text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {children}
      <ChevronRight className="size-4" aria-hidden />
    </Link>
  );
}
type DashboardTab =
  "/app/projets/$id/demandes" | "/app/projets/$id/statistiques" | "/app/projets/$id/partage";

/** The lots of a line, by status, as one bar. */
function StatusBar({ line, className }: { line: SalesLine; className?: string }) {
  const label = BAR_ORDER.map((s) => `${line.counts[s]} ${PLURAL_LABELS[s].toLowerCase()}`).join(
    ", ",
  );
  return (
    <div
      role="img"
      aria-label={`${label} sur ${line.total}`}
      className={cn("flex overflow-hidden rounded-full bg-muted", className)}
    >
      {BAR_ORDER.map((s) =>
        line.counts[s] > 0 ? (
          <span
            key={s}
            className={cn("h-full", STATUS_BG[s])}
            style={{ width: `${(line.counts[s] / line.total) * 100}%` }}
          />
        ) : null,
      )}
    </div>
  );
}

function Sales() {
  const { project } = useCurrentProject();
  const lots = useLots(project.id);

  if (lots.isPending) return <Skeleton className="h-64 rounded-2xl" />;
  const summary = salesSummary(lots.data ?? [], project.lot_types);
  const { total, counts, value, unpriced } = summary;
  const placed = counts.vendue + counts.reservee;
  const anyPrice = BAR_ORDER.some((s) => value[s] > 0);
  const missing = BAR_ORDER.reduce((n, s) => n + unpriced[s], 0);

  return (
    <Panel title="Commercialisation" action={<TabLink to={TAB_ROUTES.lots}>Lots</TabLink>}>
      {lots.isError ? (
        <p className="text-sm text-muted-foreground">
          Impossible de charger les lots. Vérifiez votre connexion internet puis rechargez la page.
        </p>
      ) : total === 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Aucun lot pour l'instant : créez-les un par un ou importez un fichier CSV.
          </p>
          <Button asChild className="h-10">
            <Link to={TAB_ROUTES.lots} params={{ id: project.id }}>
              Créer les lots
            </Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {BAR_ORDER.map((s) => (
              <div key={s} className="rounded-xl border border-border bg-background/40 p-3">
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <StatusDot status={s} />
                  {PLURAL_LABELS[s]}
                </p>
                <p className="mt-1 font-display text-2xl font-medium tabular-nums tracking-tight">
                  {counts[s]}
                </p>
                {value[s] > 0 ? (
                  <p className="mt-0.5 truncate text-xs tabular-nums text-muted-foreground">
                    {formatPrice(value[s], project.currency)}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
          <StatusBar line={summary} className="mt-4 h-2.5" />
          <p className="mt-2 text-sm">
            <span className="font-medium tabular-nums">{percentOf(placed, total)} %</span>{" "}
            <span className="text-muted-foreground">
              des {total} lots vendus ou réservés · {percentOf(counts.vendue, total)} % vendus
            </span>
          </p>
          {!anyPrice ? (
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {project.show_prices
                ? "Aucun prix saisi : la page indique « Prix sur demande ». Pour suivre les montants, saisissez-les dans Lots et décochez « Afficher les prix » dans Réglages."
                : "Aucun prix saisi : saisissez-les dans Lots pour suivre les montants. Ils restent masqués sur la page."}
            </p>
          ) : missing > 0 ? (
            <p className="mt-1 text-xs text-muted-foreground">
              {missing} lot{missing > 1 ? "s" : ""} sans prix, non compté
              {missing > 1 ? "s" : ""} dans les montants.
            </p>
          ) : null}

          {summary.byType.length > 1 ? (
            <div className="mt-5 border-t border-border pt-4">
              <h3 className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Par typologie
              </h3>
              <ul className="mt-3 space-y-2.5">
                {summary.byType.map((line) => (
                  <li
                    key={line.type ?? ""}
                    className="grid grid-cols-[minmax(0,7.5rem)_minmax(0,1fr)_auto] items-center gap-3 text-sm"
                  >
                    <span className="truncate">{line.type ?? "Sans type"}</span>
                    <StatusBar line={line} className="h-2" />
                    <span className="text-xs tabular-nums text-muted-foreground">
                      {line.counts.vendue + line.counts.reservee} / {line.total}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </>
      )}
    </Panel>
  );
}

function Requests() {
  const { project } = useCurrentProject();
  const leads = useLeads(project.id);
  const lots = useLots(project.id);
  const numeros = new Map((lots.data ?? []).map((l) => [l.id, l.numero]));
  const list = leads.data ?? [];
  const fresh = list.filter((l) => l.status === "nouveau").length;

  return (
    <Panel
      title="Demandes de visite"
      action={<TabLink to="/app/projets/$id/demandes">Toutes</TabLink>}
    >
      {leads.isPending ? (
        <Skeleton className="h-24 rounded-xl" />
      ) : leads.isError ? (
        <p className="text-sm text-muted-foreground">
          Impossible de charger les demandes. Rechargez la page.
        </p>
      ) : list.length === 0 ? (
        <p className="text-sm leading-relaxed text-muted-foreground">
          Aucune demande pour l'instant. Elles arrivent ici en direct, depuis la page du programme,
          le plan intégré à votre site et le bureau de vente.
        </p>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            {fresh > 0 ? (
              <span className="font-medium text-foreground">
                {fresh} nouvelle{fresh > 1 ? "s" : ""}
              </span>
            ) : (
              "Toutes traitées"
            )}{" "}
            · {list.length} au total
          </p>
          <ul className="mt-3 divide-y divide-border">
            {list.slice(0, 5).map((lead) => {
              const numero = lead.lot_id ? numeros.get(lead.lot_id) : undefined;
              return (
                <li key={lead.id} className="flex items-center gap-3 py-2.5 text-sm">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{lead.nom}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {numero ? `Lot ${numero}` : "Le programme"} ·{" "}
                      {SOURCE_LABELS[lead.source] ?? lead.source}
                    </p>
                  </div>
                  {lead.status === "nouveau" ? (
                    <span className="shrink-0 rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-medium text-primary">
                      Nouvelle
                    </span>
                  ) : null}
                  <time
                    dateTime={lead.created_at}
                    className="w-24 shrink-0 text-right text-xs text-muted-foreground"
                  >
                    {timeAgo(lead.created_at)}
                  </time>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </Panel>
  );
}

function Activity() {
  const { project } = useCurrentProject();
  const stats = useProjectStats(project.id, 7);
  const lots = useLots(project.id);
  const data = stats.data;
  const top =
    data && lots.data
      ? lotRows(lots.data, data.lots)
          .filter((r) => r.vues > 0)
          .slice(0, 3)
      : [];
  const compared = "vs 7 jours précédents";

  return (
    <Panel
      title="7 derniers jours"
      action={<TabLink to="/app/projets/$id/statistiques">Statistiques</TabLink>}
    >
      {stats.isPending ? (
        <Skeleton className="h-24 rounded-xl" />
      ) : stats.isError || !data ? (
        <p className="text-sm text-muted-foreground">
          Impossible de charger les statistiques. Rechargez la page.
        </p>
      ) : (
        <>
          {project.status !== "published" ? (
            <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
              Programme en brouillon : les visites seront comptées dès sa publication.
            </p>
          ) : null}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
            <Kpi
              compact
              label="Visites"
              value={data.totals.visites}
              previous={data.previous.visites}
              compared={compared}
            />
            <Kpi
              compact
              label="Fiches vues"
              value={data.totals.vues_lot}
              previous={data.previous.vues_lot}
              compared={compared}
            />
            <Kpi
              compact
              label="Visites 360°"
              value={data.totals.visites_360 ?? 0}
              previous={data.previous.visites_360 ?? 0}
              compared={compared}
            />
            <Kpi
              compact
              label="Demandes"
              value={data.totals.demandes}
              previous={data.previous.demandes}
              compared={compared}
            />
          </div>
          {top.length > 0 ? (
            <div className="mt-4">
              <h3 className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Lots les plus regardés
              </h3>
              <ol className="mt-2 space-y-1.5 text-sm">
                {top.map((row) => (
                  <li key={row.id} className="flex items-center gap-2">
                    <StatusDot status={row.statut} />
                    <span className="font-medium">Lot {row.numero}</span>
                    {row.type ? <span className="text-muted-foreground">· {row.type}</span> : null}
                    <span className="ml-auto text-xs tabular-nums text-muted-foreground">
                      {row.vues} vue{row.vues > 1 ? "s" : ""}
                      {row.demandes > 0
                        ? ` · ${row.demandes} demande${row.demandes > 1 ? "s" : ""}`
                        : ""}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          ) : null}
        </>
      )}
    </Panel>
  );
}

function PublicPage() {
  const { project } = useCurrentProject();
  const media = useMedia(project.id);
  const cover = coverPhoto(media.data ?? [], project.cover_media_id);
  const image = cover ? mediaImage(cover) : null;
  const url = `${window.location.origin}/p/${project.slug}`;
  const published = project.status === "published";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Lien copié");
    } catch {
      toast.error("Copie impossible : ouvrez l'onglet Partage pour copier le lien.");
    }
  };

  return (
    <Panel title="Page publique" action={<StatusBadge status={project.status} />}>
      <Link
        to="/app/projets/$id/medias"
        params={{ id: project.id }}
        className="group relative mb-3.5 block aspect-[16/9] overflow-hidden rounded-xl border border-border bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {image ? (
          <img
            src={image.thumb}
            alt=""
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />
        ) : null}
        <span className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-black/75 to-transparent px-3 pb-2.5 pt-8 text-xs text-white">
          <span className="font-medium">
            {image ? "Photo d'accueil" : media.isPending ? "" : "Aucune photo d'accueil"}
          </span>
          <span className="inline-flex items-center gap-0.5 text-white/80 group-hover:text-white">
            {image ? "Changer" : "Ajouter"}
            <ChevronRight className="size-3.5" aria-hidden />
          </span>
        </span>
      </Link>
      <p className="truncate font-mono text-[12px] text-muted-foreground" title={url}>
        {url.replace(/^https?:\/\//, "")}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button variant="outline" size="sm" className="h-9" onClick={() => void copy()}>
          <Copy aria-hidden />
          Copier
        </Button>
        <Button asChild variant="outline" size="sm" className="h-9">
          <a href={url} target="_blank" rel="noopener">
            <ExternalLink aria-hidden />
            {published ? "Ouvrir" : "Aperçu"}
          </a>
        </Button>
        <Button asChild variant="outline" size="sm" className="h-9">
          <a href={`${url}?mode=presentation`} target="_blank" rel="noopener">
            <MonitorPlay aria-hidden />
            Présentation
          </a>
        </Button>
      </div>
      {published ? null : (
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-3.5">
          <p className="text-xs leading-relaxed text-muted-foreground">
            En brouillon : visible seulement par votre organisation.
          </p>
          <Button asChild size="sm" className="h-9 shrink-0">
            <Link to="/app/projets/$id/partage" params={{ id: project.id }}>
              <Globe aria-hidden />
              Publier
            </Link>
          </Button>
        </div>
      )}
    </Panel>
  );
}

function Contents() {
  const { project } = useCurrentProject();
  const lots = useLots(project.id);
  const orbits = useOrbits(project.id);
  const views = useViews(project.id);
  const markers = useViewMarkers(project.id);
  const media = useMedia(project.id);
  const rooms = usePanoramas(project.id);
  const loading = [lots, orbits, views, markers, media, rooms].some((q) => q.isPending);

  if (loading) return <Skeleton className="h-80 rounded-2xl" />;
  const checks = pageChecks({
    project,
    lots: lots.data ?? [],
    orbits: [...(orbits.data?.values() ?? [])],
    views: views.data ?? [],
    markers: markers.data ?? [],
    media: media.data ?? [],
    rooms: rooms.data?.length ?? 0,
  });
  const done = checks.filter((c) => c.ok).length;

  return (
    <Panel
      title="Contenu de la page"
      action={
        <span className="text-sm tabular-nums text-muted-foreground">
          {done} / {checks.length}
        </span>
      }
    >
      <div
        role="progressbar"
        aria-label="Contenu de la page"
        aria-valuemin={0}
        aria-valuemax={checks.length}
        aria-valuenow={done}
        className="h-1.5 overflow-hidden rounded-full bg-muted"
      >
        <span
          className="block h-full rounded-full bg-primary"
          style={{ width: `${(done / checks.length) * 100}%` }}
        />
      </div>
      <ul className="-mx-2 mt-3">
        {checks.map((c) => (
          <li key={c.key}>
            <Link
              to={TAB_ROUTES[c.tab]}
              params={{ id: project.id }}
              className="group flex min-h-10 items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span
                className={cn(
                  "grid size-5 shrink-0 place-items-center rounded-full",
                  c.ok ? "bg-emerald-500/15 text-emerald-300" : "bg-muted text-muted-foreground",
                )}
              >
                {c.ok ? (
                  <Check className="size-3.5" aria-hidden />
                ) : (
                  <X className="size-3.5" aria-hidden />
                )}
              </span>
              <span className={cn("min-w-0 flex-1", c.ok ? "" : "text-muted-foreground")}>
                {c.label}
                {!c.ok && c.essential ? (
                  <span className="ml-1.5 text-[11px] font-medium text-amber-300">essentiel</span>
                ) : null}
              </span>
              <span className="sr-only">{c.ok ? "fait" : "à faire"}</span>
              <ChevronRight
                className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
                aria-hidden
              />
            </Link>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
