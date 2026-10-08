import { createFileRoute } from "@tanstack/react-router";
import { Check, Copy, ExternalLink, Globe, Lock, X } from "lucide-react";
import { toast } from "sonner";

import { SettingsSection, StatusBadge } from "@/components/app/Blocks";
import { useCurrentProject } from "@/components/app/ProjectContext";
import { Button } from "@/components/ui/button";
import { dbErrorMessage } from "@/lib/app/errors";
import { useLots } from "@/lib/app/lots";
import { useMedia } from "@/lib/app/media";
import { planImages, useShapes } from "@/lib/app/plan";
import { useUpdateProject } from "@/lib/app/projects";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/_espace/projets/$id/partage")({
  component: SharePage,
});

function SharePage() {
  const { project } = useCurrentProject();
  const lots = useLots(project.id);
  const shapes = useShapes(project.id);
  const media = useMedia(project.id);
  const update = useUpdateProject(project.id);
  const url = `${window.location.origin}/p/${project.slug}`;
  const published = project.status === "published";

  const lotCount = lots.data?.length ?? 0;
  const traced = lots.data?.filter((l) => shapes.data?.has(l.id)).length ?? 0;
  const checks = [
    { ok: Boolean(planImages(project)), label: "Plan téléversé" },
    { ok: lotCount > 0, label: lotCount > 0 ? `${lotCount} lots créés` : "Lots créés" },
    {
      ok: lotCount > 0 && traced === lotCount,
      label:
        lotCount > 0
          ? `${traced} / ${lotCount} lots tracés sur le plan`
          : "Lots tracés sur le plan",
    },
    { ok: (media.data?.length ?? 0) > 0, label: "Photos ajoutées (facultatif)", optional: true },
  ];
  const ready = checks.every((c) => c.ok || c.optional);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Lien copié");
    } catch {
      toast.error("Copie impossible : sélectionnez le lien et copiez-le.");
    }
  };

  const setStatus = (status: "draft" | "published") =>
    update.mutate(
      { status },
      {
        onSuccess: () =>
          toast.success(status === "published" ? "Programme publié" : "Programme dépublié"),
        onError: (error) => toast.error(dbErrorMessage(error)),
      },
    );

  return (
    <div className="max-w-3xl space-y-6">
      <SettingsSection
        title="Page publique"
        description="La page du programme, à partager par WhatsApp, e-mail ou sur votre site. Elle n'est pas référencée par Google."
      >
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status={project.status} />
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            {published ? (
              <Globe className="size-4" aria-hidden />
            ) : (
              <Lock className="size-4" aria-hidden />
            )}
            {published
              ? "Visible par toute personne qui a le lien"
              : "Visible seulement par les membres de votre organisation"}
          </span>
        </div>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <input
            readOnly
            value={url}
            onFocus={(e) => e.currentTarget.select()}
            aria-label="Lien de la page publique"
            className="h-11 min-w-0 flex-1 rounded-md border border-input bg-transparent px-3 font-mono text-[13px] text-foreground"
          />
          <div className="flex gap-2">
            <Button variant="outline" className="h-11" onClick={() => void copy()}>
              <Copy aria-hidden />
              Copier
            </Button>
            <Button asChild variant="outline" className="h-11">
              <a href={url} target="_blank" rel="noopener">
                <ExternalLink aria-hidden />
                {published ? "Ouvrir" : "Aperçu"}
              </a>
            </Button>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-border pt-5">
          {published ? (
            <Button
              variant="outline"
              className="h-11"
              onClick={() => setStatus("draft")}
              disabled={update.isPending}
            >
              Dépublier
            </Button>
          ) : (
            <Button
              className="h-11"
              onClick={() => setStatus("published")}
              disabled={update.isPending}
            >
              <Globe aria-hidden />
              Publier le programme
            </Button>
          )}
          <p className="text-xs leading-relaxed text-muted-foreground">
            {published
              ? "Dépublier rend la page inaccessible aux visiteurs ; le lien fonctionnera de nouveau dès la prochaine publication."
              : ready
                ? "Tout est prêt."
                : "Vous pouvez publier dès maintenant, mais la page sera plus complète une fois la liste ci-dessous cochée."}
          </p>
        </div>
      </SettingsSection>

      <SettingsSection title="Avant de publier">
        <ul className="space-y-2.5">
          {checks.map((c) => (
            <li key={c.label} className="flex items-center gap-2.5 text-sm">
              <span
                className={cn(
                  "grid size-5 place-items-center rounded-full",
                  c.ok ? "bg-emerald-500/15 text-emerald-300" : "bg-muted text-muted-foreground",
                )}
              >
                {c.ok ? (
                  <Check className="size-3.5" aria-hidden />
                ) : (
                  <X className="size-3.5" aria-hidden />
                )}
              </span>
              <span className={c.ok ? "" : "text-muted-foreground"}>{c.label}</span>
              <span className="sr-only">{c.ok ? "fait" : "à faire"}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-muted-foreground">
          Le code d'intégration (iframe) pour votre site arrive avec le mode présentation.
        </p>
      </SettingsSection>
    </div>
  );
}
