import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Check, Download, Mail, MessageCircle, RotateCcw } from "lucide-react";
import { toast } from "sonner";

import { EmptyState } from "@/components/app/Blocks";
import { useCurrentProject } from "@/components/app/ProjectContext";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { downloadCsv } from "@/lib/csv";
import { dbErrorMessage } from "@/lib/app/errors";
import {
  LEAD_STATUS_LABELS,
  SOURCE_LABELS,
  leadsToCsv,
  useLeads,
  useSetLeadStatus,
  whatsappReply,
  type Lead,
  type LeadStatus,
} from "@/lib/app/leads";
import { useLots } from "@/lib/app/lots";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/_espace/projets/$id/demandes")({
  component: LeadsPage,
});

const when = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" });

function LeadsPage() {
  const { project } = useCurrentProject();
  const leads = useLeads(project.id);
  const lots = useLots(project.id);
  const setStatus = useSetLeadStatus(project.id);
  const [filter, setFilter] = useState<LeadStatus | null>(null);

  const all = useMemo(() => leads.data ?? [], [leads.data]);
  const lotById = useMemo(() => new Map((lots.data ?? []).map((l) => [l.id, l])), [lots.data]);
  const count = (s: LeadStatus) => all.filter((l) => l.status === s).length;
  const shown = filter ? all.filter((l) => l.status === filter) : all;

  const change = (lead: Lead, status: LeadStatus) =>
    setStatus.mutate(
      { id: lead.id, status },
      {
        onSuccess: () =>
          toast.success(status === "traite" ? "Demande marquée comme traitée" : "Demande rouverte"),
        onError: (error) => toast.error(dbErrorMessage(error)),
      },
    );

  const exportCsv = () => {
    const date = new Date().toLocaleDateString("sv-SE");
    downloadCsv(`demandes-${project.slug}-${date}.csv`, leadsToCsv(shown, lots.data ?? []));
  };

  if (leads.isPending || lots.isPending) {
    return (
      <div aria-busy="true" aria-label="Chargement des demandes" className="space-y-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>
    );
  }
  if (leads.isError || lots.isError) {
    return (
      <EmptyState
        title="Impossible de charger les demandes"
        text="Vérifiez votre connexion internet puis rechargez la page."
      />
    );
  }

  const options: { status: LeadStatus | null; label: string; n: number }[] = [
    { status: null, label: "Toutes", n: all.length },
    { status: "nouveau", label: "Nouvelles", n: count("nouveau") },
    { status: "traite", label: "Traitées", n: count("traite") },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="group" aria-label="Filtrer les demandes" className="flex flex-wrap gap-2">
          {options.map((o) => (
            <button
              key={o.label}
              type="button"
              aria-pressed={filter === o.status}
              onClick={() => setFilter(o.status)}
              className={cn(
                "inline-flex h-9 items-center gap-2 rounded-full border px-4 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                filter === o.status
                  ? "border-primary bg-primary/15 text-foreground"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {o.label}
              <span className="tabular-nums text-muted-foreground">{o.n}</span>
            </button>
          ))}
        </div>
        <Button
          variant="outline"
          className="h-10"
          onClick={exportCsv}
          disabled={shown.length === 0}
        >
          <Download aria-hidden />
          Exporter en CSV
        </Button>
      </div>

      {all.length === 0 ? (
        <EmptyState
          title="Aucune demande pour l'instant"
          text="Les demandes de visite arrivent ici, en direct, dès qu'un visiteur remplit le formulaire de la page publique."
        />
      ) : shown.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aucune demande avec ce statut.</p>
      ) : (
        <ul className="space-y-3" aria-live="polite">
          {shown.map((lead) => {
            const lot = lead.lot_id ? lotById.get(lead.lot_id) : undefined;
            const fresh = lead.status === "nouveau";
            return (
              <li
                key={lead.id}
                className={cn(
                  "rounded-2xl border bg-card p-5",
                  fresh
                    ? "border-primary/40 shadow-[inset_3px_0_0_0_var(--primary)]"
                    : "border-border",
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 space-y-1">
                    <p className="flex flex-wrap items-center gap-2">
                      <span className="font-display text-lg font-medium tracking-tight">
                        {lead.nom}
                      </span>
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-[11px] font-medium",
                          fresh ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground",
                        )}
                      >
                        {LEAD_STATUS_LABELS[lead.status]}
                      </span>
                      {lot ? (
                        <span className="rounded-full border border-border px-2.5 py-0.5 text-[11px] text-muted-foreground">
                          Lot {lot.numero}
                          {lot.type ? ` · ${lot.type}` : ""}
                        </span>
                      ) : (
                        <span className="text-[11px] text-muted-foreground">
                          Programme en général
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {when.format(new Date(lead.created_at))} ·{" "}
                      {SOURCE_LABELS[lead.source] ?? lead.source}
                    </p>
                    <p className="flex flex-wrap gap-x-4 gap-y-1 pt-1 text-sm">
                      <a
                        href={`tel:${lead.telephone.replace(/[^\d+]/g, "")}`}
                        className="tabular-nums hover:underline"
                      >
                        {lead.telephone}
                      </a>
                      {lead.email ? (
                        <a
                          href={`mailto:${lead.email}`}
                          className="text-muted-foreground hover:text-foreground hover:underline"
                        >
                          {lead.email}
                        </a>
                      ) : null}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      asChild
                      variant="outline"
                      className="h-9 border-[#25D366]/50 text-[#5fe08f] hover:bg-[#25D366]/10 hover:text-[#7ff0a8]"
                    >
                      <a
                        href={whatsappReply(lead, lot, project.name)}
                        target="_blank"
                        rel="noopener"
                      >
                        <MessageCircle aria-hidden />
                        WhatsApp
                      </a>
                    </Button>
                    {lead.email ? (
                      <Button asChild variant="outline" className="h-9">
                        <a
                          href={`mailto:${lead.email}?subject=${encodeURIComponent(`Votre demande de visite — ${project.name}`)}`}
                        >
                          <Mail aria-hidden />
                          E-mail
                        </a>
                      </Button>
                    ) : null}
                    {fresh ? (
                      <Button className="h-9" onClick={() => change(lead, "traite")}>
                        <Check aria-hidden />
                        Marquer comme traitée
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        className="h-9"
                        onClick={() => change(lead, "nouveau")}
                      >
                        <RotateCcw aria-hidden />
                        Rouvrir
                      </Button>
                    )}
                  </div>
                </div>
                {lead.message ? (
                  <p className="mt-4 whitespace-pre-line rounded-xl bg-muted/40 px-4 py-3 text-sm leading-relaxed">
                    {lead.message}
                  </p>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
