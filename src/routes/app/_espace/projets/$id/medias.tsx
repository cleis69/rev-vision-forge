import { useMemo, useRef, useState, type DragEvent } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Upload } from "lucide-react";
import { toast } from "sonner";

import { EmptyState } from "@/components/app/Blocks";
import { ConfirmDialog } from "@/components/app/ConfirmDialog";
import { MediaCard, OwnerOptions, ownerKey, ownerOfKey } from "@/components/app/media/MediaCard";
import { useCurrentProject } from "@/components/app/ProjectContext";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { dbErrorMessage } from "@/lib/app/errors";
import { useLots } from "@/lib/app/lots";
import {
  coverPhoto,
  ACCEPTED_TYPES,
  ownerValues,
  useDeleteMedia,
  useMedia,
  useUpdateMedia,
  useUploadMedia,
  type MediaItem,
  type MediaKind,
  type MediaOwner,
} from "@/lib/app/media";
import { useUpdateProject } from "@/lib/app/projects";
import { lotTypeNames, parseLotTypes } from "@/lib/lot-types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/_espace/projets/$id/medias")({
  component: MediaPage,
});

type Filter = "tout" | MediaKind;
const FILTERS: { value: Filter; label: string }[] = [
  { value: "tout", label: "Tout" },
  { value: "image", label: "Photos" },
  { value: "plan", label: "Plans" },
  { value: "video", label: "Vidéos" },
  { value: "document", label: "Documents" },
];

const added = (n: number) => (n === 1 ? "Fichier ajouté" : `${n} fichiers ajoutés`);

function MediaPage() {
  const { project } = useCurrentProject();
  const media = useMedia(project.id);
  const lots = useLots(project.id);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const upload = useUploadMedia(project, (done, total) => setProgress({ done, total }));
  const update = useUpdateMedia(project.id);
  const remove = useDeleteMedia(project.id);
  const updateProject = useUpdateProject(project.id);
  const cover = coverPhoto(media.data ?? [], project.cover_media_id);
  const input = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [target, setTarget] = useState<MediaOwner>(null);
  const [filter, setFilter] = useState<Filter>("tout");
  const [toDelete, setToDelete] = useState<{ item: MediaItem | null; open: boolean }>({
    item: null,
    open: false,
  });

  const items = media.data ?? [];
  const shown = filter === "tout" ? items : items.filter((m) => m.kind === filter);
  const types = useMemo(
    () => lotTypeNames(lots.data ?? [], parseLotTypes(project.lot_types)),
    [lots.data, project.lot_types],
  );

  const send = async (files: File[]) => {
    if (files.length === 0 || upload.isPending) return;
    try {
      const report = await upload.mutateAsync({ files, owner: target });
      if (report.added) toast.success(added(report.added));
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

  // Moves among the media shown: the order of the others does not change.
  const move = (index: number, step: -1 | 1) => {
    const a = shown[index];
    const b = shown[index + step];
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
        aria-label="Chargement des médias"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="aspect-[16/10] rounded-xl" />
        ))}
      </div>
    );
  }
  if (media.isError || lots.isError) {
    return (
      <EmptyState
        title="Impossible de charger les médias"
        text="Vérifiez votre connexion internet puis rechargez la page."
      />
    );
  }

  return (
    <div className="space-y-4">
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
        <div className="min-w-0 flex-1 basis-72">
          <p className="text-sm font-medium">Photos, plans, vidéos et brochures</p>
          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
            Photos JPEG, PNG ou WebP (gardées telles quelles jusqu'à 4 096 px), vidéos MP4 ou WebM
            et documents PDF jusqu'à 50 Mo. L'étoile choisit la photo d'accueil, en haut de la page
            et dans les aperçus de lien (sinon, la première photo du programme) ; la vidéo la plus
            courte passe en fond sur ordinateur, la plus longue devient « Voir le film ».
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={ownerKey(target)} onValueChange={(v) => setTarget(ownerOfKey(v))}>
            <SelectTrigger className="h-10 w-56" aria-label="Rattacher les nouveaux fichiers à">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <OwnerOptions lots={lots.data} types={types} />
            </SelectContent>
          </Select>
          <Button
            className="h-10"
            onClick={() => input.current?.click()}
            disabled={upload.isPending}
          >
            <Upload aria-hidden />
            {progress
              ? `Envoi ${Math.min(progress.done + 1, progress.total)} / ${progress.total}…`
              : "Ajouter des fichiers"}
          </Button>
        </div>
        <input
          ref={input}
          type="file"
          multiple
          accept={ACCEPTED_TYPES.join(",")}
          className="sr-only"
          tabIndex={-1}
          aria-hidden
          onChange={(e) => void send([...(e.target.files ?? [])])}
        />
      </div>

      {items.length > 0 ? (
        <div role="group" aria-label="Filtrer les médias" className="flex flex-wrap gap-2">
          {FILTERS.map((f) => {
            const count =
              f.value === "tout" ? items.length : items.filter((m) => m.kind === f.value).length;
            if (f.value !== "tout" && count === 0) return null;
            const active = filter === f.value;
            return (
              <button
                key={f.value}
                type="button"
                aria-pressed={active}
                onClick={() => setFilter(f.value)}
                className={cn(
                  "inline-flex h-9 items-center gap-2 rounded-full border px-4 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  active
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                {f.label}
                <span className="tabular-nums text-muted-foreground">{count}</span>
              </button>
            );
          })}
        </div>
      ) : null}

      {items.length === 0 ? (
        <EmptyState
          title="Aucun média pour l'instant"
          text="Ajoutez les perspectives, le film du programme, les plans de chaque type et les brochures. Rattachez-les au programme pour la galerie, à un type pour la rubrique Typologies, ou à un lot pour sa fiche."
        />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {shown.map((item, index) => (
            <MediaCard
              key={item.id}
              item={item}
              lots={lots.data}
              types={types}
              first={index === 0}
              last={index === shown.length - 1}
              onMove={(step) => move(index, step)}
              onOwner={(owner) =>
                save(
                  [{ id: item.id, values: ownerValues(owner) }],
                  !owner
                    ? "Rattaché au programme"
                    : "lot_id" in owner
                      ? "Rattaché au lot"
                      : `Rattaché au type ${owner.lot_type}`,
                )
              }
              onCaption={(caption) =>
                save(
                  [{ id: item.id, values: { meta: { ...item.meta, caption } } }],
                  "Légende enregistrée",
                )
              }
              onCategory={(category) => {
                const { category: _old, ...meta } = item.meta;
                save([{ id: item.id, values: { meta: category ? { ...meta, category } : meta } }]);
              }}
              onPlan={(plan) =>
                save(
                  [{ id: item.id, values: { kind: plan ? "plan" : "image" } }],
                  plan ? "Marqué comme plan" : "Marqué comme photo",
                )
              }
              onDelete={() => setToDelete({ item, open: true })}
              cover={item.id === cover?.id}
              onCover={
                item.kind === "image"
                  ? () =>
                      updateProject.mutate(
                        { cover_media_id: item.id },
                        {
                          onSuccess: () => toast.success("Photo d'accueil choisie"),
                          onError: (error) => toast.error(dbErrorMessage(error)),
                        },
                      )
                  : undefined
              }
            />
          ))}
        </ul>
      )}

      <p className="text-sm text-muted-foreground">
        Les textes de chaque type se rédigent dans l'onglet{" "}
        <Link
          to="/app/projets/$id/typologies"
          params={{ id: project.id }}
          className="text-foreground underline underline-offset-4"
        >
          Typologies
        </Link>
        , les séquences orbitales dans l'onglet{" "}
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
        title="Supprimer ce média ?"
        description="Il disparaît de la page publique et de l'espace promoteur."
        actionLabel="Supprimer"
        onConfirm={async () => {
          if (!toDelete.item) return;
          await remove.mutateAsync(toDelete.item);
          toast.success("Média supprimé");
        }}
      />
    </div>
  );
}
