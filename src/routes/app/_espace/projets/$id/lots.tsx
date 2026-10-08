import { Suspense, lazy, useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ChevronDown, Download, FileUp, ListPlus, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { EmptyState } from "@/components/app/Blocks";
import { ConfirmDialog } from "@/components/app/ConfirmDialog";
import { useCurrentProject } from "@/components/app/ProjectContext";
import { AddLotsDialog } from "@/components/app/lots/AddLotsDialog";
import { LotDetailsSheet } from "@/components/app/lots/LotDetailsSheet";
import { LotStatusLabel } from "@/components/app/lots/LotStatus";
import { LotTypesDatalist, LotsTable, type Editing } from "@/components/app/lots/LotsTable";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { downloadCsv } from "@/lib/csv";
import {
  LOT_STATUSES,
  STATUS_LABELS,
  nextNumero,
  type Lot,
  type LotStatus,
} from "@/lib/app/lot-fields";
import { lotsToCsv } from "@/lib/app/lot-import";
import {
  lotErrorMessage,
  useCreateLots,
  useDeleteLots,
  useLots,
  useSetLotsStatus,
} from "@/lib/app/lots";

const ImportLotsDialog = lazy(() => import("@/components/app/lots/ImportLotsDialog"));

export const Route = createFileRoute("/app/_espace/projets/$id/lots")({
  component: LotsPage,
});

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

function LotsPage() {
  const { project } = useCurrentProject();
  const query = useLots(project.id);
  const lots = useMemo(() => query.data ?? [], [query.data]);
  const create = useCreateLots(project.id);
  const remove = useDeleteLots(project.id);
  const setStatus = useSetLotsStatus(project.id);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState<Editing>(null);
  const [details, setDetails] = useState<{ lot: Lot | null; open: boolean }>({
    lot: null,
    open: false,
  });
  const [toDelete, setToDelete] = useState<{ lots: Lot[]; open: boolean }>({
    lots: [],
    open: false,
  });
  const [adding, setAdding] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importLoaded, setImportLoaded] = useState(false);

  // Forget selected lots that no longer exist.
  useEffect(() => {
    setSelected((current) => {
      const ids = new Set(lots.map((l) => l.id));
      const kept = [...current].filter((id) => ids.has(id));
      return kept.length === current.size ? current : new Set(kept);
    });
  }, [lots]);

  const counts = useMemo(() => {
    const by = (s: LotStatus) => lots.filter((l) => l.statut === s).length;
    return {
      disponible: by("disponible"),
      reservee: by("reservee"),
      vendue: by("vendue"),
      noPrice: lots.filter((l) => l.prix === null).length,
    };
  }, [lots]);

  const selectedLots = lots.filter((l) => selected.has(l.id));

  const addOne = async () => {
    const sort = lots.reduce((max, l) => Math.max(max, l.sort_order), 0) + 1;
    try {
      const [lot] = await create.mutateAsync([
        { numero: nextNumero(lots.map((l) => l.numero)), sort_order: sort },
      ]);
      if (lot) setEditing({ id: lot.id, field: "type" });
    } catch (error) {
      toast.error(lotErrorMessage(error));
    }
  };

  const changeStatus = async (statut: LotStatus) => {
    const ids = selectedLots.map((l) => l.id);
    try {
      await setStatus.mutateAsync({ ids, statut });
      toast.success(
        `${plural(ids.length, "lot passé", "lots passés")} en « ${STATUS_LABELS[statut]} »`,
      );
    } catch (error) {
      toast.error(lotErrorMessage(error));
    }
  };

  const openImport = () => {
    setImportLoaded(true);
    setImporting(true);
  };

  const exportCsv = () => {
    const date = new Date().toLocaleDateString("sv-SE"); // AAAA-MM-JJ
    downloadCsv(`lots-${project.slug}-${date}.csv`, lotsToCsv(lots));
  };

  if (query.isPending) {
    return (
      <div aria-busy="true" aria-label="Chargement des lots" className="space-y-3">
        <Skeleton className="h-10 w-full max-w-xl" />
        <Skeleton className="h-72 w-full rounded-2xl" />
      </div>
    );
  }
  if (query.isError) {
    return (
      <EmptyState
        title="Impossible de charger les lots"
        text="Vérifiez votre connexion internet puis rechargez la page."
      />
    );
  }

  return (
    <div className="space-y-5">
      <LotTypesDatalist />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <dl className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          <div className="flex items-baseline gap-1.5">
            <dt className="text-muted-foreground">Lots</dt>
            <dd className="font-medium tabular-nums">{lots.length}</dd>
          </div>
          {LOT_STATUSES.map((status) => (
            <div key={status} className="flex items-baseline gap-1.5">
              <dt>
                <LotStatusLabel status={status} />
              </dt>
              <dd className="font-medium tabular-nums">{counts[status]}</dd>
            </div>
          ))}
          {counts.noPrice > 0 && lots.length > 0 ? (
            <div className="flex items-baseline gap-1.5">
              <dt className="text-muted-foreground">Sans prix</dt>
              <dd className="font-medium tabular-nums">{counts.noPrice}</dd>
            </div>
          ) : null}
        </dl>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" className="h-10" onClick={openImport}>
            <FileUp aria-hidden />
            Importer
          </Button>
          <Button
            variant="outline"
            className="h-10"
            onClick={exportCsv}
            disabled={lots.length === 0}
          >
            <Download aria-hidden />
            Exporter
          </Button>
          <Button variant="outline" className="h-10" onClick={() => setAdding(true)}>
            <ListPlus aria-hidden />
            Ajouter des lots
          </Button>
          <Button className="h-10" onClick={() => void addOne()} disabled={create.isPending}>
            <Plus aria-hidden />
            Ajouter un lot
          </Button>
        </div>
      </div>

      {selectedLots.length > 0 ? (
        <div
          role="region"
          aria-label="Actions sur la sélection"
          className="flex flex-wrap items-center gap-2 rounded-xl border border-primary/30 bg-primary/[0.06] px-4 py-2.5"
        >
          <span className="mr-2 text-sm font-medium">
            {plural(selectedLots.length, "lot sélectionné", "lots sélectionnés")}
          </span>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-9" disabled={setStatus.isPending}>
                Changer le statut
                <ChevronDown aria-hidden />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {LOT_STATUSES.map((status) => (
                <DropdownMenuItem key={status} onSelect={() => void changeStatus(status)}>
                  <LotStatusLabel status={status} />
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="outline"
            className="h-9 border-destructive/50 text-red-300 hover:bg-destructive/10 hover:text-red-200"
            onClick={() => setToDelete({ lots: selectedLots, open: true })}
          >
            <Trash2 aria-hidden />
            Supprimer
          </Button>
          <Button variant="ghost" className="ml-auto h-9" onClick={() => setSelected(new Set())}>
            <X aria-hidden />
            Désélectionner
          </Button>
        </div>
      ) : null}

      {lots.length === 0 ? (
        <EmptyState
          title="Aucun lot pour l'instant"
          text="Ajoutez vos lots un par un, plusieurs d'un coup, ou importez-les depuis un fichier CSV (Excel, Numbers, Google Sheets)."
        >
          <div className="flex flex-col gap-2">
            <Button className="h-11" onClick={() => setAdding(true)}>
              <ListPlus aria-hidden />
              Ajouter des lots
            </Button>
            <Button variant="outline" className="h-11" onClick={openImport}>
              <FileUp aria-hidden />
              Importer un CSV
            </Button>
          </div>
        </EmptyState>
      ) : (
        <LotsTable
          projectId={project.id}
          lots={lots}
          currency={project.currency}
          selected={selected}
          onSelectedChange={setSelected}
          editing={editing}
          onEditingChange={setEditing}
          onDetails={(lot) => setDetails({ lot, open: true })}
          onDelete={(lot) => setToDelete({ lots: [lot], open: true })}
        />
      )}

      <AddLotsDialog projectId={project.id} lots={lots} open={adding} onOpenChange={setAdding} />

      {importLoaded ? (
        <Suspense fallback={null}>
          <ImportLotsDialog
            projectId={project.id}
            currency={project.currency}
            lots={lots}
            open={importing}
            onOpenChange={setImporting}
          />
        </Suspense>
      ) : null}

      <LotDetailsSheet
        projectId={project.id}
        currency={project.currency}
        lot={details.lot ? (lots.find((l) => l.id === details.lot?.id) ?? details.lot) : null}
        lots={lots}
        open={details.open}
        onOpenChange={(open) => setDetails((d) => ({ ...d, open }))}
      />

      <ConfirmDialog
        open={toDelete.open}
        onOpenChange={(open) => setToDelete((d) => ({ ...d, open }))}
        title={
          toDelete.lots.length === 1
            ? `Supprimer le lot n° ${toDelete.lots[0]?.numero} ?`
            : `Supprimer ${toDelete.lots.length} lots ?`
        }
        description={`${toDelete.lots.length === 1 ? "Le lot, ses formes sur les vues, ses photos et sa visite 360° sont supprimés" : "Les lots, leurs formes sur les vues, leurs photos et leurs visites 360° sont supprimés"}. Les demandes de visite qui les concernent sont conservées, comme les visites 360° faites pour un type de lot.`}
        actionLabel={toDelete.lots.length === 1 ? "Supprimer le lot" : "Supprimer les lots"}
        onConfirm={async () => {
          const ids = toDelete.lots.map((l) => l.id);
          await remove.mutateAsync(ids);
          toast.success(ids.length === 1 ? "Lot supprimé" : `${ids.length} lots supprimés`);
        }}
      />
    </div>
  );
}
