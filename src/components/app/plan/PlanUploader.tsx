import { useRef, useState, type DragEvent } from "react";
import { ImageUp } from "lucide-react";
import { toast } from "sonner";

import { FormMessage as Notice } from "@/components/app/AuthCard";
import { Button } from "@/components/ui/button";
import { dbErrorMessage } from "@/lib/app/errors";
import { PLAN_LARGE, useUploadViewImage, type ProjectView, type UploadPhase } from "@/lib/app/plan";
import type { Project } from "@/lib/app/projects";
import { ImageError, PLAN_TYPES } from "@/lib/image";
import { cn } from "@/lib/utils";

const PHASES: Record<UploadPhase, string> = {
  preparing: "Préparation de l'image…",
  uploading: "Envoi de l'image…",
};

/** Drop zone for the image of a view (aerial view, floor plan, pedestrian view…). */
export function PlanUploader({
  project,
  view,
  replacing = false,
  onDone,
}: {
  project: Project;
  view: ProjectView;
  replacing?: boolean;
  onDone?: () => void;
}) {
  const [phase, setPhase] = useState<UploadPhase | null>(null);
  const upload = useUploadViewImage(project, view, setPhase);
  const input = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const busy = upload.isPending;

  const send = async (file: File | undefined) => {
    if (!file || busy) return;
    setError(null);
    try {
      await upload.mutateAsync(file);
      toast.success(replacing ? "Image remplacée" : "Image téléversée");
      onDone?.();
    } catch (e) {
      setError(e instanceof ImageError ? e.message : dbErrorMessage(e));
    } finally {
      setPhase(null);
      if (input.current) input.current.value = "";
    }
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    void send(e.dataTransfer.files[0]);
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!busy) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        aria-busy={busy}
        className={cn(
          "flex flex-col items-center gap-3 rounded-2xl border border-dashed px-6 py-14 text-center transition-colors",
          dragging ? "border-primary bg-primary/5" : "border-border",
        )}
      >
        <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
          <ImageUp className="size-5" aria-hidden />
        </span>
        {busy && phase ? (
          <p className="text-sm font-medium" role="status">
            {PHASES[phase]}
          </p>
        ) : (
          <>
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
              {view.kind === "niveau"
                ? `Plan du niveau ${view.name}`
                : view.kind === "pieton"
                  ? "Perspective depuis la rue"
                  : view.kind === "toiture"
                    ? "Vue de la toiture"
                    : "Vue aérienne ou plan de masse"}
              , en JPEG, PNG ou WebP. L'image est optimisée avant l'envoi (WebP,{" "}
              {PLAN_LARGE.toLocaleString("fr-FR")} px au plus).
            </p>
            <Button type="button" className="h-11" onClick={() => input.current?.click()}>
              {replacing ? "Choisir la nouvelle image" : "Choisir une image"}
            </Button>
            <p className="text-xs text-muted-foreground">ou déposez-la ici</p>
          </>
        )}
      </div>
      {error ? <Notice tone="error">{error}</Notice> : null}
      <input
        ref={input}
        type="file"
        accept={PLAN_TYPES.join(",")}
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(e) => void send(e.target.files?.[0])}
      />
    </div>
  );
}
