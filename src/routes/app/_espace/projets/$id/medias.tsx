import { useEffect, useRef, useState, type DragEvent } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, ImagePlus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { EmptyState } from "@/components/app/Blocks";
import { ConfirmDialog } from "@/components/app/ConfirmDialog";
import { useCurrentProject } from "@/components/app/ProjectContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { dbErrorMessage } from "@/lib/app/errors";
import type { Lot } from "@/lib/app/lot-fields";
import { useLots } from "@/lib/app/lots";
import {
  mediaImage,
  useDeleteMedia,
  useMedia,
  useUpdateMedia,
  useUploadMedia,
  type MediaItem,
} from "@/lib/app/media";
import { PLAN_TYPES } from "@/lib/image";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/_espace/projets/$id/medias")({
  component: MediaPage,
});

const PROGRAMME = "programme";

function MediaPage() {
  const { project } = useCurrentProject();
  const media = useMedia(project.id);
  const lots = useLots(project.id);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const upload = useUploadMedia(project, (done, total) => setProgress({ done, total }));
  const update = useUpdateMedia(project.id);
  const remove = useDeleteMedia(project.id);
  const input = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [toDelete, setToDelete] = useState<{ item: MediaItem | null; open: boolean }>({
    item: null,
    open: false,
  });

  const items = media.data ?? [];

  const send = async (files: File[]) => {
    if (files.length === 0 || upload.isPending) return;
    try {
      const report = await upload.mutateAsync(files);
      if (report.added)
        toast.success(report.added === 1 ? "Photo ajoutée" : `${report.added} photos ajoutées`);
      for (const f of report.failed) toast.error(`${f.name} : ${f.reason}`);
    } finally {
      setProgress(null);
      if (input.current) input.current.value = "";
    }
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    void send([...e.dataTransfer.files]);
  };

  const save = (changes: Parameters<typeof update.mutate>[0], message?: string) =>
    update.mutate(changes, {
      onSuccess: () => message && toast.success(message),
      onError: (error) => toast.error(dbErrorMessage(error)),
    });

  const move = (index: number, step: -1 | 1) => {
    const a = items[index];
    const b = items[index + step];
    if (!a || !b) return;
    save([
      { id: a.id, values: { sort_order: b.sort_order } },
      { id: b.id, values: { sort_order: a.sort_order } },
    ]);
  };

  if (media.isPending || lots.isPending) {
    return (
      <div
        aria-busy="true"
        aria-label="Chargement des photos"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="aspect-[4/3] rounded-2xl" />
        ))}
      </div>
    );
  }
  if (media.isError || lots.isError) {
    return (
      <EmptyState
        title="Impossible de charger les photos"
        text="Vérifiez votre connexion internet puis rechargez la page."
      />
    );
  }

  return (
    <div className="space-y-5">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!upload.isPending) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          "flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-dashed px-5 py-4 transition-colors",
          dragging ? "border-primary bg-primary/5" : "border-border",
        )}
      >
        <div className="min-w-0">
          <p className="text-sm font-medium">Photos du programme et des lots</p>
          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
            JPEG, PNG ou WebP, optimisées avant l'envoi. Déposez-les ici ou choisissez-les ; la
            première photo du programme sert d'image principale de la page publique.
          </p>
        </div>
        <Button className="h-10" onClick={() => input.current?.click()} disabled={upload.isPending}>
          <ImagePlus aria-hidden />
          {progress
            ? `Envoi ${Math.min(progress.done + 1, progress.total)} / ${progress.total}…`
            : "Ajouter des photos"}
        </Button>
        <input
          ref={input}
          type="file"
          multiple
          accept={PLAN_TYPES.join(",")}
          className="sr-only"
          tabIndex={-1}
          aria-hidden
          onChange={(e) => void send([...(e.target.files ?? [])])}
        />
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="Aucune photo pour l'instant"
          text="Ajoutez les perspectives, les photos du chantier ou de l'existant. Rattachez-les au programme pour la galerie, ou à un lot pour sa fiche."
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => (
            <MediaCard
              key={item.id}
              item={item}
              lots={lots.data}
              first={index === 0}
              last={index === items.length - 1}
              onMove={(step) => move(index, step)}
              onLot={(lotId) =>
                save(
                  [{ id: item.id, values: { lot_id: lotId } }],
                  lotId ? "Photo rattachée au lot" : "Photo rattachée au programme",
                )
              }
              onCaption={(caption) =>
                save(
                  [{ id: item.id, values: { meta: { ...item.meta, caption } } }],
                  "Légende enregistrée",
                )
              }
              onDelete={() => setToDelete({ item, open: true })}
            />
          ))}
        </ul>
      )}

      <p className="text-sm text-muted-foreground">
        Les séquences orbitales (vue aérienne, toiture, étages, vue piéton) se règlent dans l'onglet{" "}
        <Link
          to="/app/projets/$id/plan"
          params={{ id: project.id }}
          className="text-foreground underline underline-offset-4"
        >
          Vues
        </Link>
        .
      </p>

      <ConfirmDialog
        open={toDelete.open}
        onOpenChange={(open) => setToDelete((d) => ({ ...d, open }))}
        title="Supprimer cette photo ?"
        description="Elle disparaît de la page publique et de l'espace promoteur."
        actionLabel="Supprimer la photo"
        onConfirm={async () => {
          if (!toDelete.item) return;
          await remove.mutateAsync(toDelete.item);
          toast.success("Photo supprimée");
        }}
      />
    </div>
  );
}

function MediaCard({
  item,
  lots,
  first,
  last,
  onMove,
  onLot,
  onCaption,
  onDelete,
}: {
  item: MediaItem;
  lots: Lot[];
  first: boolean;
  last: boolean;
  onMove: (step: -1 | 1) => void;
  onLot: (lotId: string | null) => void;
  onCaption: (caption: string) => void;
  onDelete: () => void;
}) {
  const image = mediaImage(item);
  const [caption, setCaption] = useState(image.caption);
  // Saved a second after the last key, or when the field loses focus.
  const saved = useRef(image.caption);
  const commit = (value: string) => {
    const text = value.trim();
    if (text === saved.current) return;
    saved.current = text;
    onCaption(text);
  };
  const commitRef = useRef(commit);
  commitRef.current = commit;
  useEffect(() => {
    const timer = window.setTimeout(() => commitRef.current(caption), 1000);
    return () => window.clearTimeout(timer);
  }, [caption]);
  const latest = useRef(caption);
  latest.current = caption;
  // Leaving the page before the delay: the caption typed so far is kept.
  useEffect(() => () => commitRef.current(latest.current), []);
  const lot = lots.find((l) => l.id === item.lot_id);
  const label = image.caption || (lot ? `Photo du lot ${lot.numero}` : "Photo du programme");

  return (
    <li className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="relative aspect-[4/3] bg-muted">
        <img
          src={image.thumb}
          alt={label}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <span className="absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur">
          {lot ? `Lot ${lot.numero}` : "Programme"}
        </span>
      </div>
      <div className="space-y-3 p-3">
        <Input
          value={caption}
          onChange={(e) => setCaption(e.target.value.slice(0, 200))}
          onBlur={() => commit(caption)}
          onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
          placeholder="Légende (facultatif)"
          aria-label={`Légende, ${label}`}
          className="h-10"
        />
        <div className="flex items-center gap-2">
          <Select
            value={item.lot_id ?? PROGRAMME}
            onValueChange={(v) => onLot(v === PROGRAMME ? null : v)}
          >
            <SelectTrigger className="h-10 flex-1" aria-label={`Rattachement, ${label}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={PROGRAMME}>Programme (galerie)</SelectItem>
              {lots.map((l) => (
                <SelectItem key={l.id} value={l.id}>
                  Lot {l.numero}
                  {l.type ? ` · ${l.type}` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="icon"
            className="size-10"
            disabled={first}
            onClick={() => onMove(-1)}
            aria-label={`Avancer, ${label}`}
          >
            <ArrowLeft aria-hidden />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-10"
            disabled={last}
            onClick={() => onMove(1)}
            aria-label={`Reculer, ${label}`}
          >
            <ArrowRight aria-hidden />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-10 text-red-300 hover:bg-destructive/10 hover:text-red-200"
            onClick={onDelete}
            aria-label={`Supprimer, ${label}`}
          >
            <Trash2 aria-hidden />
          </Button>
        </div>
      </div>
    </li>
  );
}
