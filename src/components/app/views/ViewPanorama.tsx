import { Suspense, lazy, useRef, useState } from "react";
import { ImagePlus, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/app/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Lot } from "@/lib/app/lot-fields";
import type { ProjectView } from "@/lib/app/plan";
import type { Project } from "@/lib/app/projects";
import {
  panoramaError,
  useRemoveViewPanorama,
  useUploadViewPanorama,
  useViewMarkers,
} from "@/lib/app/view-panorama";
import { PLAN_TYPES } from "@/lib/image";

const ViewPanoramaEditor = lazy(() => import("./ViewPanoramaEditor"));

/* A view shown as a 360° panorama (Vues tab): sending the panorama, then
   the editor of the markers of the lots. */

export function ViewPanorama({
  project,
  view,
  lots,
}: {
  project: Project;
  view: ProjectView;
  lots: Lot[];
}) {
  const upload = useUploadViewPanorama(project);
  const remove = useRemoveViewPanorama(project.id);
  const markers = useViewMarkers(project.id);
  const input = useRef<HTMLInputElement>(null);
  const [removing, setRemoving] = useState(false);

  const send = async (file: File | undefined) => {
    if (!file) return;
    try {
      await upload.mutateAsync({ view, file });
      toast.success(view.panorama_path ? "Panorama remplacé" : "Panorama ajouté");
    } catch (error) {
      toast.error(panoramaError(error));
    } finally {
      if (input.current) input.current.value = "";
    }
  };

  const picker = (
    <input
      ref={input}
      type="file"
      accept={PLAN_TYPES.join(",")}
      className="sr-only"
      tabIndex={-1}
      aria-hidden
      onChange={(e) => void send(e.target.files?.[0])}
    />
  );

  if (!view.panorama_path) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-dashed border-border px-5 py-4">
        <div className="min-w-0 flex-1 basis-72">
          <p className="text-sm font-medium">Panorama 360° de la vue</p>
          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
            Une image équirectangulaire (deux fois plus large que haute, 6 000 px conseillés), par
            exemple un rendu aérien du programme. Vous placerez ensuite chaque lot dessus.
          </p>
        </div>
        <Button className="h-10" onClick={() => input.current?.click()} disabled={upload.isPending}>
          <ImagePlus aria-hidden />
          {upload.isPending ? "Envoi…" : "Ajouter le panorama"}
        </Button>
        {picker}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {markers.isPending ? (
        <Skeleton className="h-[min(65svh,640px)] min-h-[380px] w-full rounded-2xl" />
      ) : (
        <Suspense
          fallback={<Skeleton className="h-[min(65svh,640px)] min-h-[380px] w-full rounded-2xl" />}
        >
          <ViewPanoramaEditor
            view={view}
            lots={lots}
            markers={(markers.data ?? []).filter((m) => m.view_id === view.id)}
            currency={project.currency}
          />
        </Suspense>
      )}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          className="h-9"
          onClick={() => input.current?.click()}
          disabled={upload.isPending}
        >
          <RefreshCw aria-hidden />
          {upload.isPending ? "Envoi…" : "Remplacer le panorama"}
        </Button>
        <Button
          variant="ghost"
          className="h-9 text-muted-foreground hover:text-red-300"
          onClick={() => setRemoving(true)}
        >
          <Trash2 aria-hidden />
          Retirer le panorama
        </Button>
        {picker}
      </div>
      <ConfirmDialog
        open={removing}
        onOpenChange={setRemoving}
        title="Retirer le panorama de la vue ?"
        description="Le panorama et les repères des lots sont effacés. Les lots ne changent pas."
        actionLabel="Retirer le panorama"
        onConfirm={async () => {
          await remove.mutateAsync(view);
          toast.success("Panorama retiré");
        }}
      />
    </div>
  );
}
