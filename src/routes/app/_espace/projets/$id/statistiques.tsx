import { useMemo, useState, type ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpDown, Download } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { EmptyState } from "@/components/app/Blocks";
import { useCurrentProject } from "@/components/app/ProjectContext";
import { LotStatusLabel } from "@/components/app/lots/LotStatus";
import { Kpi } from "@/components/app/stats/Kpi";
import { Button } from "@/components/ui/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { downloadCsv } from "@/lib/csv";
import { SOURCE_LABELS } from "@/lib/app/leads";
import { useLots } from "@/lib/app/lots";
import {
  PERIODS,
  conversion,
  lotRows,
  lotStatsCsv,
  useProjectStats,
  type LotSort,
  type Period,
  type ProjectStats,
} from "@/lib/app/stats";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/_espace/projets/$id/statistiques")({
  component: StatsPage,
});

const count = new Intl.NumberFormat("fr-FR");
const range = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long" });
const dayOnly = new Intl.DateTimeFormat("fr-FR", { day: "numeric" });

/** "Du 2 au 8 octobre", or "Du 25 septembre au 8 octobre". */
function periodLabel(from: string, to: string) {
  const [a, b] = [new Date(from), new Date(to)];
  const sameMonth = a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
  return `Du ${(sameMonth ? dayOnly : range).format(a)} au ${range.format(b)}`;
}
const shortDay = new Intl.DateTimeFormat("fr-FR", { weekday: "short", day: "numeric" });
const dayMonth = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" });
const fullDay = new Intl.DateTimeFormat("fr-FR", {
  weekday: "long",
  day: "numeric",
  month: "long",
});
/** "2026-10-08" read as a local calendar day. */
const localDay = (day: string) => new Date(`${day}T00:00:00`);

const chartConfig = {
  visites: { label: "Visites", color: "var(--primary)" },
  demandes: { label: "Demandes", color: "#34d399" },
} satisfies ChartConfig;

function StatsPage() {
  const { project } = useCurrentProject();
  const [days, setDays] = useState<Period>(7);
  const stats = useProjectStats(project.id, days);
  const lots = useLots(project.id);
  const [sort, setSort] = useState<LotSort>("vues");

  const data = stats.data;
  const rows = useMemo(
    () => (data && lots.data ? lotRows(lots.data, data.lots, sort) : []),
    [data, lots.data, sort],
  );

  const exportCsv = () => {
    const date = new Date().toLocaleDateString("sv-SE");
    downloadCsv(`statistiques-${project.slug}-${days}-jours-${date}.csv`, lotStatsCsv(rows));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div role="group" aria-label="Période" className="flex gap-2">
            {PERIODS.map((p) => (
              <button
                key={p}
                type="button"
                aria-pressed={days === p}
                onClick={() => setDays(p)}
                className={cn(
                  "inline-flex h-9 items-center rounded-full border px-4 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  days === p
                    ? "border-primary bg-primary/15 text-foreground"
                    : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                {p} derniers jours
              </button>
            ))}
          </div>
          {data ? (
            <p className="text-sm text-muted-foreground">{periodLabel(data.from, data.to)}</p>
          ) : null}
        </div>
        <Button variant="outline" className="h-10" onClick={exportCsv} disabled={rows.length === 0}>
          <Download aria-hidden />
          Exporter en CSV
        </Button>
      </div>

      {project.status !== "published" ? (
        <p className="rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">
          Ce programme n'est pas publié : aucune visite n'est enregistrée tant qu'il est en
          brouillon.
        </p>
      ) : null}

      {stats.isPending || lots.isPending ? (
        <div aria-busy="true" aria-label="Chargement des statistiques" className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-72 rounded-2xl" />
        </div>
      ) : stats.isError || lots.isError || !data ? (
        <EmptyState
          title="Impossible de charger les statistiques"
          text="Vérifiez votre connexion internet puis rechargez la page."
        />
      ) : (
        <StatsView data={data} rows={rows} sort={sort} onSort={setSort} days={days} />
      )}
    </div>
  );
}

function StatsView({
  data,
  rows,
  sort,
  onSort,
  days,
}: {
  data: ProjectStats;
  rows: ReturnType<typeof lotRows>;
  sort: LotSort;
  onSort: (sort: LotSort) => void;
  days: Period;
}) {
  const { totals, previous } = data;
  const rate = conversion(totals.demandes, totals.visites);
  const empty = totals.visites === 0 && totals.demandes === 0;
  const compared = `vs ${days} jours précédents`;
  const still =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi
          label="Visites"
          hint="Un onglet ouvert sur la page, le plan intégré ou le mode présentation."
          value={totals.visites}
          previous={previous.visites}
          compared={compared}
        />
        <Kpi
          label="Fiches de lots vues"
          value={totals.vues_lot}
          previous={previous.vues_lot}
          compared={compared}
        />
        <Kpi
          label="Clics sur le plan"
          value={totals.clics_lot}
          previous={previous.clics_lot}
          compared={compared}
        />
        <Kpi
          label="Demandes de visite"
          value={totals.demandes}
          previous={previous.demandes}
          compared={compared}
          extra={rate !== null ? `${String(rate).replace(".", ",")} % des visites` : undefined}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        {count.format(totals.vues_page)} affichage{totals.vues_page > 1 ? "s" : ""} de la page ·{" "}
        {count.format(totals.partages)} partage{totals.partages > 1 ? "s" : ""} de lots ·{" "}
        {count.format(totals.visites_360 ?? 0)} visite{(totals.visites_360 ?? 0) > 1 ? "s" : ""}{" "}
        360° ouverte{(totals.visites_360 ?? 0) > 1 ? "s" : ""}. Vos propres visites, quand vous êtes
        connecté à l'espace promoteur, ne sont pas comptées.
      </p>

      {empty ? (
        <EmptyState
          title="Aucune visite sur cette période"
          text="Les visites de la page publique et du plan intégré à votre site, ainsi que les demandes, apparaîtront ici dès qu'un visiteur ouvrira le lien du programme."
        />
      ) : (
        <>
          <Card title="Par jour">
            <ChartContainer config={chartConfig} className="h-64 w-full">
              <BarChart data={data.daily} margin={{ left: -16, right: 8, top: 8 }}>
                <CartesianGrid vertical={false} strokeOpacity={0.15} />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  minTickGap={12}
                  tickFormatter={(day: string) =>
                    (days === 7 ? shortDay : dayMonth).format(localDay(day))
                  }
                />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={40} />
                <ChartTooltip
                  cursor={{ fillOpacity: 0.08 }}
                  content={
                    <ChartTooltipContent
                      labelFormatter={(_, payload) => {
                        const day = (payload?.[0]?.payload as { day?: string } | undefined)?.day;
                        return day ? fullDay.format(localDay(day)) : "";
                      }}
                    />
                  }
                />
                <Bar
                  dataKey="visites"
                  fill="var(--color-visites)"
                  radius={[4, 4, 0, 0]}
                  isAnimationActive={!still}
                />
                <Bar
                  dataKey="demandes"
                  fill="var(--color-demandes)"
                  radius={[4, 4, 0, 0]}
                  isAnimationActive={!still}
                />
              </BarChart>
            </ChartContainer>
            <ul className="mt-3 flex gap-5 text-xs text-muted-foreground" aria-hidden>
              <li className="flex items-center gap-2">
                <span className="size-2.5 rounded-sm bg-primary" />
                Visites
              </li>
              <li className="flex items-center gap-2">
                <span className="size-2.5 rounded-sm bg-emerald-400" />
                Demandes de visite
              </li>
            </ul>
          </Card>

          <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
            <LotTable rows={rows} sort={sort} onSort={onSort} />
            <Sources sources={data.sources} total={totals.demandes} />
          </div>
        </>
      )}
    </>
  );
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4 sm:p-5">
      <h2 className="font-display text-lg font-medium tracking-tight">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

const COLUMNS: { key: LotSort; label: string }[] = [
  { key: "vues", label: "Vues de la fiche" },
  { key: "clics", label: "Clics sur le plan" },
  { key: "partages", label: "Partages" },
  { key: "visites_360", label: "Visites 360°" },
  { key: "demandes", label: "Demandes" },
];

function LotTable({
  rows,
  sort,
  onSort,
}: {
  rows: ReturnType<typeof lotRows>;
  sort: LotSort;
  onSort: (sort: LotSort) => void;
}) {
  const max = Math.max(1, ...rows.map((r) => r.vues));
  const unseen = rows.filter((r) => r.vues === 0 && r.clics === 0).length;

  return (
    <Card title="Par lot">
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aucun lot dans ce programme.</p>
      ) : (
        <>
          <div className="-mx-5 overflow-x-auto sm:-mx-6">
            <table className="w-full min-w-[700px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th
                    scope="col"
                    className="px-5 pb-3 font-normal sm:pl-6"
                    aria-sort={sort === "numero" ? "ascending" : "none"}
                  >
                    <SortButton active={sort === "numero"} onClick={() => onSort("numero")}>
                      Lot
                    </SortButton>
                  </th>
                  <th scope="col" className="px-3 pb-3 font-normal">
                    Statut
                  </th>
                  {COLUMNS.map((c) => (
                    <th
                      key={c.key}
                      scope="col"
                      className="px-3 pb-3 text-right font-normal last:pr-5 sm:last:pr-6"
                      aria-sort={sort === c.key ? "descending" : "none"}
                    >
                      <SortButton active={sort === c.key} onClick={() => onSort(c.key)}>
                        {c.label}
                      </SortButton>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const quiet = r.vues === 0 && r.clics === 0 && r.demandes === 0;
                  return (
                    <tr key={r.id} className="border-b border-border/60 last:border-0">
                      <th
                        scope="row"
                        className={cn(
                          "whitespace-nowrap px-5 py-3 text-left font-medium sm:pl-6",
                          quiet && "text-muted-foreground",
                        )}
                      >
                        Lot {r.numero}
                        {r.type ? (
                          <span className="font-normal text-muted-foreground"> · {r.type}</span>
                        ) : null}
                      </th>
                      <td className="whitespace-nowrap px-3 py-3">
                        <LotStatusLabel status={r.statut} />
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums">
                        <span className="inline-flex items-center justify-end gap-3">
                          <span
                            aria-hidden
                            className="hidden h-1.5 w-16 overflow-hidden rounded-full bg-muted sm:block"
                          >
                            <span
                              className="block h-full rounded-full bg-primary"
                              style={{ width: `${(r.vues / max) * 100}%` }}
                            />
                          </span>
                          {count.format(r.vues)}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums">{count.format(r.clics)}</td>
                      <td className="px-3 py-3 text-right tabular-nums">
                        {count.format(r.partages)}
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums">
                        {count.format(r.visites_360)}
                      </td>
                      <td
                        className={cn(
                          "px-3 py-3 pr-5 text-right tabular-nums sm:pr-6",
                          r.demandes > 0 && "font-medium text-emerald-300",
                        )}
                      >
                        {count.format(r.demandes)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {unseen > 0 ? (
            <p className="mt-4 text-xs text-muted-foreground">
              {unseen === rows.length
                ? "Aucun lot n'a été consulté sur la période."
                : `${unseen} lot${unseen > 1 ? "s n'ont" : " n'a"} été ni ouvert${unseen > 1 ? "s" : ""} ni cliqué${unseen > 1 ? "s" : ""} sur la période.`}
            </p>
          ) : null}
        </>
      )}
    </Card>
  );
}

function SortButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 rounded hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        active && "text-foreground",
      )}
    >
      {children}
      <ArrowUpDown className={cn("size-3", active ? "opacity-100" : "opacity-40")} aria-hidden />
    </button>
  );
}

const SOURCE_ORDER = ["page", "embed", "presentation"];

function Sources({ sources, total }: { sources: Record<string, number>; total: number }) {
  const keys = [...SOURCE_ORDER, ...Object.keys(sources).filter((k) => !SOURCE_ORDER.includes(k))];
  return (
    <Card title="Origine des demandes">
      {total === 0 ? (
        <p className="text-sm text-muted-foreground">Aucune demande sur la période.</p>
      ) : (
        <ul className="space-y-4">
          {keys.map((key) => {
            const n = sources[key] ?? 0;
            const share = Math.round((n / total) * 100);
            return (
              <li key={key}>
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span>{SOURCE_LABELS[key] ?? key}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {count.format(n)} · {share} %
                  </span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden>
                  <div
                    className="h-full rounded-full bg-emerald-400"
                    style={{ width: `${share}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
