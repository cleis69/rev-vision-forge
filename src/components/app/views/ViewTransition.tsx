import { useRef, useState } from "react";
import { Clapperboard, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/app/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { mediaVideo } from "@/lib/app/media";
import type { ProjectView } from "@/lib/app/plan";
import type { Project } from "@/lib/app/projects";
import {
  TRANSITION_MAX_SECONDS,
  useDeleteTransition,
  useTransitions,
  useUploadTransition,
} from "@/lib/app/transitions";
import { formatDuration, VIDEO_TYPES } from "@/lib/video";

/* Camera move of a view (Vues tab): a short video exported from a 3D
   software, that ends on the first image of the view. Played on the public
   pages when a visitor picks the view; for the main view, when the page opens. */

export function ViewTransition({ project, view }: { project: Project; view: ProjectView }) {
  const transitions = useTransitions(project.id);
  const upload = useUploadTransition(project);
  const remove = useDeleteTransition(project.id);
  const input = useRef<HTMLInputElement>(null);
  const [removing, setRemoving] = useState(false);
  const current = transitions.data?.get(view.id) ?? null;
  const video = current ? mediaVideo(current) : null;

  const send = (file: File | undefined) => {
    if (!file) return;
    upload.mutate(
      { viewId: view.id, file },
      {
        onSuccess: () => toast.success(`Mouvement de caméra ajouté à « ${view.name} »`),
        onError: (error) => toast.error(error.message),
      },
    );
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 max-w-2xl">
          <h3 className="flex items-center gap-2 font-display text-base font-medium tracking-tight">
            <Clapperboard className="size-4 text-primary" aria-hidden />
            Mouvement de caméra
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Une courte vidéo qui arrive sur cette vue, exportée de votre logiciel 3D : sa dernière
            image doit être la première de la vue. Elle se joue quand l'acheteur choisit la vue
            {view.is_main ? ", et à l'ouverture de la page" : ""}. MP4 ou WebM,{" "}
            {TRANSITION_MAX_SECONDS} secondes au plus.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            className="h-9"
            disabled={upload.isPending}
            onClick={() => input.current?.click()}
          >
            {current ? <RefreshCw aria-hidden /> : <Clapperboard aria-hidden />}
            {upload.isPending
              ? "Envoi en cours…"
              : current
                ? "Remplacer la vidéo"
                : "Ajouter une vidéo"}
          </Button>
          {current ? (
            <Button
              variant="ghost"
              className="h-9 text-muted-foreground hover:text-red-300"
              onClick={() => setRemoving(true)}
            >
              <Trash2 aria-hidden />
              Retirer
            </Button>
          ) : null}
        </div>
      </div>
      <input
        ref={input}
        type="file"
        accept={VIDEO_TYPES.join(",")}
        className="hidden"
        onChange={(e) => {
          send(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      {video ? (
        <div className="mt-4 flex flex-wrap items-end gap-4">
          <video
            src={video.src}
            poster={video.poster ?? undefined}
            controls
            muted
            playsInline
            preload="none"
            className="aspect-video w-full max-w-sm rounded-xl border border-border bg-black object-contain"
          />
          <p className="text-xs text-muted-foreground">
            {formatDuration(video.duration)} · {video.width} × {video.height} px
          </p>
        </div>
      ) : null}
      <ConfirmDialog
        open={removing}
        onOpenChange={setRemoving}
        title="Retirer le mouvement de caméra ?"
        description="La vue s'affichera directement, sans vidéo d'arrivée."
        actionLabel="Retirer la vidéo"
        onConfirm={async () => {
          await remove.mutateAsync(view.id);
          toast.success("Mouvement de caméra retiré");
        }}
      />
    </div>
  );
}
