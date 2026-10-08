import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { EmptyState, SettingsSection } from "@/components/app/Blocks";
import { PlanEditor } from "@/components/app/plan/PlanEditor";
import { PlanUploader } from "@/components/app/plan/PlanUploader";
import { useCurrentProject } from "@/components/app/ProjectContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useLots } from "@/lib/app/lots";
import { planImages, useShapes, useUploadingPlan } from "@/lib/app/plan";

export const Route = createFileRoute("/app/_espace/projets/$id/plan")({
  component: PlanPage,
});

function PlanPage() {
  const { project } = useCurrentProject();
  const image = planImages(project);
  const lots = useLots(project.id);
  const shapes = useShapes(project.id);
  const uploading = useUploadingPlan(project.id);
  const [replacing, setReplacing] = useState(false);

  if (!image) {
    return (
      <div className="max-w-3xl">
        <SettingsSection
          title="Plan du programme"
          description="Téléversez la vue aérienne ou le plan de masse, puis tracez chaque lot dessus. Les visiteurs choisiront leur lot directement sur ce plan."
        >
          <PlanUploader project={project} />
        </SettingsSection>
      </div>
    );
  }

  if (lots.isPending || shapes.isPending) {
    return (
      <div
        aria-busy="true"
        aria-label="Chargement du plan"
        className="flex flex-col gap-4 lg:flex-row"
      >
        <Skeleton className="h-64 w-full rounded-2xl lg:w-64" />
        <Skeleton className="h-[min(70svh,720px)] min-h-[420px] flex-1 rounded-2xl" />
      </div>
    );
  }
  if (lots.isError || shapes.isError) {
    return (
      <EmptyState
        title="Impossible de charger le plan"
        text="Vérifiez votre connexion internet puis rechargez la page."
      />
    );
  }

  const traced = lots.data.filter((l) => shapes.data.has(l.id)).length;

  return (
    <>
      {/* A new image starts with a fitted view. */}
      <PlanEditor
        key={project.plan_image_path}
        projectId={project.id}
        image={image}
        lots={lots.data}
        shapes={shapes.data}
        onReplace={() => setReplacing(true)}
      />
      <Dialog open={replacing} onOpenChange={(open) => !uploading && setReplacing(open)}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Remplacer le plan</DialogTitle>
            <DialogDescription>
              {traced > 0
                ? `${traced === 1 ? "La forme déjà tracée est conservée" : `Les ${traced} formes déjà tracées sont conservées`}. Si le cadrage de la nouvelle image change, vérifiez leur position.`
                : "La nouvelle image remplacera l'actuelle."}
            </DialogDescription>
          </DialogHeader>
          <PlanUploader project={project} replacing onDone={() => setReplacing(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
