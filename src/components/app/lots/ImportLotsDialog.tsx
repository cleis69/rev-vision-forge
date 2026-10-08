import { useRef, useState, type DragEvent } from "react";
import { Download, FileUp } from "lucide-react";
import { toast } from "sonner";

import { FormMessage as Notice } from "@/components/app/AuthCard";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { decodeText, downloadCsv } from "@/lib/csv";
import { FIELD_LABELS, type Lot } from "@/lib/app/lot-fields";
import { summarize } from "@/lib/app/lot-format";
import {
  CSV_TEMPLATE,
  importRows,
  previewImport,
  type ImportPreview,
  type ImportRow,
} from "@/lib/app/lot-import";
import { lotErrorMessage, useImportLots } from "@/lib/app/lots";
import { cn } from "@/lib/utils";

/* Loaded on demand (React.lazy): the CSV reader is only needed here. */

const MAX_BYTES = 2 * 1024 * 1024;

const KIND: Record<
  ImportRow["kind"],
  { label: string; counted: [string, string]; className: string }
> = {
  new: {
    label: "Nouveau",
    counted: ["nouveau", "nouveaux"],
    className: "bg-emerald-500/15 text-emerald-300",
  },
  update: {
    label: "Mise à jour",
    counted: ["mise à jour", "mises à jour"],
    className: "bg-primary/15 text-primary",
  },
  unchanged: {
    label: "Inchangé",
    counted: ["inchangé", "inchangés"],
    className: "bg-muted text-muted-foreground",
  },
  error: {
    label: "Erreur",
    counted: ["erreur", "erreurs"],
    className: "bg-destructive/20 text-red-300",
  },
};

export default function ImportLotsDialog({
  projectId,
  currency,
  lots,
  open,
  onOpenChange,
}: {
  projectId: string;
  currency: string;
  lots: Lot[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const importLots = useImportLots(projectId);
  const input = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<string | null>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [dragging, setDragging] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const reset = () => {
    setFile(null);
    setPreview(null);
    setNotice(null);
    if (input.current) input.current.value = "";
  };

  const read = async (chosen: File | undefined) => {
    if (!chosen) return;
    setNotice(null);
    if (chosen.size > MAX_BYTES) {
      setFile(chosen.name);
      setPreview({ ok: false, error: "Fichier trop lourd : 2 Mo au maximum." });
      return;
    }
    setFile(chosen.name);
    setPreview(previewImport(decodeText(await chosen.arrayBuffer()), lots));
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    void read(e.dataTransfer.files[0]);
  };

  const rows = preview?.ok ? preview.rows : [];
  const count = (kind: ImportRow["kind"]) => rows.filter((r) => r.kind === kind).length;
  const toImport = count("new") + count("update");

  const submit = async () => {
    if (!preview?.ok || toImport === 0) return;
    setNotice(null);
    try {
      await importLots.mutateAsync(importRows(preview.rows, lots, projectId));
      const added = count("new");
      const updated = count("update");
      const parts = [
        added ? `${added} ${added === 1 ? "ajouté" : "ajoutés"}` : null,
        updated ? `${updated} mis à jour` : null,
      ].filter(Boolean);
      toast.success(`Import terminé : ${parts.join(", ")}`);
      onOpenChange(false);
      reset();
    } catch (error) {
      setNotice(lotErrorMessage(error));
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (importLots.isPending) return;
        onOpenChange(next);
        if (!next) reset();
      }}
    >
      <DialogContent className="flex max-h-[90svh] flex-col sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Importer des lots</DialogTitle>
          <DialogDescription>
            Fichier CSV avec une ligne d'en-têtes : numero, type, surface_habitable,
            surface_terrain, chambres, prix, statut, description. Les lots existants sont mis à jour
            d'après leur numéro ; une case vide garde la valeur actuelle.
          </DialogDescription>
        </DialogHeader>

        {!preview ? (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={cn(
              "flex flex-col items-center gap-3 rounded-2xl border border-dashed px-6 py-12 text-center transition-colors",
              dragging ? "border-primary bg-primary/5" : "border-border",
            )}
          >
            <FileUp className="size-6 text-primary" aria-hidden />
            <p className="text-sm text-muted-foreground">Déposez votre fichier ici, ou</p>
            <Button type="button" className="h-11" onClick={() => input.current?.click()}>
              Choisir un fichier CSV
            </Button>
            <button
              type="button"
              onClick={() => downloadCsv("modele-lots.csv", CSV_TEMPLATE)}
              className="mt-2 inline-flex items-center gap-1.5 rounded text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Download className="size-4" aria-hidden />
              Télécharger le modèle CSV
            </button>
          </div>
        ) : !preview.ok ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{file}</p>
            <Notice tone="error">{preview.error}</Notice>
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2 text-sm" role="status">
              <span className="mr-1 truncate text-muted-foreground">{file}</span>
              {(["new", "update", "unchanged", "error"] as const).map((kind) =>
                count(kind) ? (
                  <span
                    key={kind}
                    className={cn(
                      "rounded-full px-2.5 py-1 text-xs font-medium",
                      KIND[kind].className,
                    )}
                  >
                    {count(kind)} {KIND[kind].counted[count(kind) > 1 ? 1 : 0]}
                  </span>
                ) : null,
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Colonnes reconnues : {preview.columns.map((c) => FIELD_LABELS[c]).join(", ")}.
              {preview.ignored.length > 0
                ? ` Colonnes ignorées : ${preview.ignored.join(", ")}.`
                : null}
            </p>
            <div className="min-h-0 flex-1 overflow-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-card text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th scope="col" className="px-3 py-2 font-medium">
                      Ligne
                    </th>
                    <th scope="col" className="px-3 py-2 font-medium">
                      N°
                    </th>
                    <th scope="col" className="px-3 py-2 font-medium">
                      État
                    </th>
                    <th scope="col" className="px-3 py-2 font-medium">
                      Contenu
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.line} className="border-t border-border/60 align-top">
                      <td className="px-3 py-2 tabular-nums text-muted-foreground">{row.line}</td>
                      <td className="px-3 py-2 font-medium">{row.numero || "—"}</td>
                      <td className="px-3 py-2">
                        <span
                          className={cn(
                            "whitespace-nowrap rounded-full px-2 py-0.5 text-xs",
                            KIND[row.kind].className,
                          )}
                        >
                          {KIND[row.kind].label}
                        </span>
                      </td>
                      <td
                        className={cn(
                          "px-3 py-2",
                          row.kind === "error" ? "text-red-300" : "text-muted-foreground",
                        )}
                      >
                        {row.kind === "error"
                          ? row.errors.join(" ")
                          : summarize(row.values, currency) || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {count("error") > 0 ? (
              <p className="text-xs text-muted-foreground">
                Les lignes en erreur ne seront pas importées. Corrigez-les dans le fichier puis
                importez-le de nouveau.
              </p>
            ) : null}
          </div>
        )}

        {notice ? <Notice tone="error">{notice}</Notice> : null}

        <input
          ref={input}
          type="file"
          accept=".csv,text/csv,text/plain"
          className="sr-only"
          tabIndex={-1}
          aria-hidden
          onChange={(e) => void read(e.target.files?.[0])}
        />

        <DialogFooter className="gap-3 sm:gap-3">
          {preview ? (
            <Button
              type="button"
              variant="outline"
              className="h-11"
              onClick={reset}
              disabled={importLots.isPending}
            >
              Choisir un autre fichier
            </Button>
          ) : null}
          {preview?.ok ? (
            <Button
              type="button"
              className="h-11"
              onClick={() => void submit()}
              disabled={toImport === 0 || importLots.isPending}
            >
              {importLots.isPending
                ? "Import…"
                : toImport === 0
                  ? "Rien à importer"
                  : `Importer ${toImport} ${toImport === 1 ? "lot" : "lots"}`}
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
