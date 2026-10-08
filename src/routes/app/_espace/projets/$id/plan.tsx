import { useEffect, useMemo, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Box, Plus, Settings2, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { EmptyState, SettingsSection } from "@/components/app/Blocks";
import { ConfirmDialog } from "@/components/app/ConfirmDialog";
import { PlanEditor } from "@/components/app/plan/PlanEditor";
import { PlanUploader } from "@/components/app/plan/PlanUploader";
import { useCurrentProject } from "@/components/app/ProjectContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { dbErrorMessage } from "@/lib/app/errors";
import type { Lot } from "@/lib/app/lot-fields";
import { useLots } from "@/lib/app/lots";
import { useOrbit } from "@/lib/app/orbit";
import {
  useCreateView,
  useDeleteView,
  useMoveView,
  useSetMainView,
  useShapes,
  useUpdateView,
  useUploadingView,
  useViews,
  viewImage,
  type ProjectView,
  type ShapesByView,
} from "@/lib/app/plan";
import type { Point } from "@/lib/geometry";
import { cn } from "@/lib/utils";
import {
  VIEW_KIND_LABELS,
  VIEW_PRESETS,
  hasPreset,
  levelLabel,
  type ViewKind,
  type ViewPreset,
} from "@/lib/views";

export const Route = createFileRoute("/app/_espace/projets/$id/plan")({
  component: ViewsPage,
});

/** Lots of the floor first on a floor plan: they are the ones to trace there. */
function lotsFor(view: ProjectView, lots: Lot[]): Lot[] {
  if (view.kind !== "niveau") return lots;
  return [
    ...lots.filter((l) => l.niveau === view.level),
    ...lots.filter((l) => l.niveau !== view.level),
  ];
}

function ViewsPage() {
  const { project } = useCurrentProject();
  const views = useViews(project.id);
  const lots = useLots(project.id);
  const shapes = useShapes(project.id);
  const orbit = useOrbit(project.id);
  const create = useCreateView(project.id);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [settingsOf, setSettingsOf] = useState<ProjectView | null>(null);

  const list = useMemo(
    () => [...(views.data ?? [])].sort((a, b) => a.sort_order - b.sort_order),
    [views.data],
  );
  const selected = list.find((v) => v.id === selectedId) ?? list[0] ?? null;
  const hasOrbit = (orbit.data?.frames.length ?? 0) > 0;

  const add = (preset: ViewPreset, configure = false) =>
    create.mutate(preset, {
      onSuccess: (view) => {
        setSelectedId(view.id);
        if (configure) setSettingsOf(view);
        else toast.success(`Vue « ${view.name} » ajoutée`);
      },
      onError: (error) => toast.error(dbErrorMessage(error)),
    });

  if (views.isPending || lots.isPending || shapes.isPending) {
    return (
      <div aria-busy="true" aria-label="Chargement des vues" className="space-y-4">
        <Skeleton className="h-11 w-full max-w-xl rounded-xl" />
        <Skeleton className="h-[min(70svh,720px)] min-h-[420px] w-full rounded-2xl" />
      </div>
    );
  }
  if (views.isError || lots.isError || shapes.isError) {
    return (
      <EmptyState
        title="Impossible de charger les vues"
        text="Vérifiez votre connexion internet puis rechargez la page."
      />
    );
  }

  if (list.length === 0) {
    return (
      <div className="max-w-3xl">
        <SettingsSection
          title="Vues du programme"
          description="Ajoutez les vues sur lesquelles les visiteurs choisiront leur lot : vue aérienne ou plan de masse, plan de chaque niveau, vue piéton… puis tracez les lots sur chacune."
        >
          <div className="flex flex-wrap gap-2">
            {VIEW_PRESETS.map((preset) => (
              <Button
                key={preset.name}
                variant="outline"
                className="h-10"
                disabled={create.isPending}
                onClick={() => add(preset)}
              >
                <Plus aria-hidden />
                {preset.name}
              </Button>
            ))}
          </div>
        </SettingsSection>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <ViewsBar
        views={list}
        selectedId={selected?.id ?? null}
        shapes={shapes.data}
        hasOrbit={hasOrbit}
        projectId={project.id}
        onSelect={setSelectedId}
        onAdd={add}
        adding={create.isPending}
      />
      {selected ? (
        <ViewPanel
          key={selected.id}
          view={selected}
          views={list}
          lots={lotsFor(selected, lots.data)}
          shapes={shapes.data.get(selected.id) ?? new Map<string, Point[]>()}
          onSettings={() => setSettingsOf(selected)}
          onDeleted={() => setSelectedId(null)}
        />
      ) : null}
      <ViewSettings
        view={settingsOf}
        views={list}
        projectId={project.id}
        onClose={() => setSettingsOf(null)}
      />
    </div>
  );
}

function ViewsBar({
  views,
  selectedId,
  shapes,
  hasOrbit,
  projectId,
  onSelect,
  onAdd,
  adding,
}: {
  views: ProjectView[];
  selectedId: string | null;
  shapes: ShapesByView;
  hasOrbit: boolean;
  projectId: string;
  onSelect: (id: string) => void;
  onAdd: (preset: ViewPreset, configure?: boolean) => void;
  adding: boolean;
}) {
  const setMain = useSetMainView(projectId);
  const noMain = !views.some((v) => v.is_main);
  const chip =
    "inline-flex h-10 shrink-0 items-center gap-2 rounded-full border px-4 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
  const star = <Star className="size-3.5 fill-primary text-primary" aria-label="vue principale" />;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <ul aria-label="Vues du programme" className="flex flex-wrap gap-2">
        {hasOrbit ? (
          <li>
            <Link
              to="/app/projets/$id/medias"
              params={{ id: projectId }}
              title="La vue orbitale se règle dans l'onglet Médias"
              className={cn(
                chip,
                "border-dashed border-border text-muted-foreground hover:text-foreground",
              )}
            >
              <Box className="size-4" aria-hidden />
              Vue 3D
              {noMain ? star : null}
            </Link>
          </li>
        ) : null}
        {views.map((v, i) => {
          const count = shapes.get(v.id)?.size ?? 0;
          const active = v.id === selectedId;
          return (
            <li key={v.id}>
              <button
                type="button"
                onClick={() => onSelect(v.id)}
                aria-pressed={active}
                className={cn(
                  chip,
                  active
                    ? "border-primary bg-primary/15 text-foreground"
                    : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                {v.name}
                {v.is_main || (noMain && !hasOrbit && i === 0) ? star : null}
                <span className="text-xs tabular-nums text-muted-foreground" title="Lots tracés">
                  {count}
                </span>
                {!v.image_path ? (
                  <span className="rounded bg-amber-400/15 px-1.5 py-0.5 text-[10px] text-amber-300">
                    sans image
                  </span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="h-10 rounded-full" disabled={adding}>
            <Plus aria-hidden />
            Ajouter une vue
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          {VIEW_PRESETS.map((preset) => {
            const taken = hasPreset(views, preset);
            return (
              <DropdownMenuItem key={preset.name} disabled={taken} onSelect={() => onAdd(preset)}>
                {preset.name}
                {taken ? (
                  <span className="ml-auto text-xs text-muted-foreground">déjà là</span>
                ) : null}
              </DropdownMenuItem>
            );
          })}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={() => {
              const levels = views.filter((v) => v.kind === "niveau").map((v) => v.level ?? 0);
              const top = levels.length ? Math.max(...levels) + 1 : 6;
              onAdd({ name: levelLabel(top), kind: "niveau", level: top }, true);
            }}
          >
            Un autre niveau…
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => onAdd({ name: "Nouvelle vue", kind: "autre", level: null }, true)}
          >
            Une autre vue…
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {hasOrbit && !noMain ? (
        <button
          type="button"
          onClick={() =>
            setMain.mutate(null, {
              onSuccess: () => toast.success("La vue 3D s'affichera en premier"),
              onError: (error) => toast.error(dbErrorMessage(error)),
            })
          }
          className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          Montrer la vue 3D en premier
        </button>
      ) : null}
    </div>
  );
}

function ViewPanel({
  view,
  views,
  lots,
  shapes,
  onSettings,
  onDeleted,
}: {
  view: ProjectView;
  views: ProjectView[];
  lots: Lot[];
  shapes: Map<string, Point[]>;
  onSettings: () => void;
  onDeleted: () => void;
}) {
  const { project } = useCurrentProject();
  const image = viewImage(view);
  const uploading = useUploadingView(view.id);
  const move = useMoveView(project.id);
  const setMain = useSetMainView(project.id);
  const remove = useDeleteView(project.id);
  const [replacing, setReplacing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const index = views.findIndex((v) => v.id === view.id);
  const traced = shapes.size;

  const onError = (error: unknown) => toast.error(dbErrorMessage(error));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="mr-2 font-display text-lg font-medium tracking-tight">{view.name}</h2>
        <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
          {view.kind === "niveau" && view.level !== null
            ? `Niveau ${levelLabel(view.level)}`
            : VIEW_KIND_LABELS[view.kind]}
        </span>
        <div className="ml-auto flex flex-wrap items-center gap-1">
          <Button
            variant="ghost"
            className="h-9"
            onClick={() =>
              setMain.mutate(view.is_main ? null : view.id, {
                onSuccess: () =>
                  toast.success(
                    view.is_main
                      ? "Vue principale retirée"
                      : `« ${view.name} » s'affichera en premier`,
                  ),
                onError,
              })
            }
            aria-pressed={view.is_main}
          >
            <Star className={cn(view.is_main && "fill-primary text-primary")} aria-hidden />
            {view.is_main ? "Vue principale" : "En faire la vue principale"}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-9"
            onClick={onSettings}
            aria-label="Réglages de la vue"
          >
            <Settings2 aria-hidden />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-9"
            disabled={index <= 0}
            onClick={() => move.mutate({ id: view.id, step: -1 }, { onError })}
            aria-label="Déplacer la vue vers la gauche"
          >
            <ArrowLeft aria-hidden />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-9"
            disabled={index >= views.length - 1}
            onClick={() => move.mutate({ id: view.id, step: 1 }, { onError })}
            aria-label="Déplacer la vue vers la droite"
          >
            <ArrowRight aria-hidden />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-9 text-muted-foreground hover:text-red-300"
            onClick={() => setDeleting(true)}
            aria-label="Supprimer la vue"
          >
            <Trash2 aria-hidden />
          </Button>
        </div>
      </div>

      {image ? (
        <PlanEditor
          // A new image starts with a fitted view.
          key={view.image_path}
          projectId={project.id}
          viewId={view.id}
          image={image}
          lots={lots}
          shapes={shapes}
          onReplace={() => setReplacing(true)}
        />
      ) : (
        <div className="max-w-3xl">
          <PlanUploader project={project} view={view} />
        </div>
      )}

      <Dialog open={replacing} onOpenChange={(open) => !uploading && setReplacing(open)}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Remplacer l'image de « {view.name} »</DialogTitle>
            <DialogDescription>
              {traced > 0
                ? `${traced === 1 ? "La forme déjà tracée est conservée" : `Les ${traced} formes déjà tracées sont conservées`}. Si le cadrage de la nouvelle image change, vérifiez leur position.`
                : "La nouvelle image remplacera l'actuelle."}
            </DialogDescription>
          </DialogHeader>
          <PlanUploader
            project={project}
            view={view}
            replacing
            onDone={() => setReplacing(false)}
          />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleting}
        onOpenChange={setDeleting}
        title={`Supprimer la vue « ${view.name} » ?`}
        description={
          traced > 0
            ? `Son image et les ${traced} forme${traced > 1 ? "s" : ""} tracée${traced > 1 ? "s" : ""} dessus sont effacées. Les lots restent, et leurs formes sur les autres vues aussi.`
            : "Son image est effacée. Les lots ne changent pas."
        }
        actionLabel="Supprimer la vue"
        onConfirm={async () => {
          await remove.mutateAsync(view);
          onDeleted();
          toast.success(`Vue « ${view.name} » supprimée`);
        }}
      />
    </div>
  );
}

const KINDS: ViewKind[] = ["aerienne", "toiture", "niveau", "pieton", "autre"];
const LEVELS = Array.from({ length: 23 }, (_, i) => i - 3);

/** Name, kind and floor of a view. */
function ViewSettings({
  view,
  views,
  projectId,
  onClose,
}: {
  view: ProjectView | null;
  views: ProjectView[];
  projectId: string;
  onClose: () => void;
}) {
  const update = useUpdateView(projectId);
  const [name, setName] = useState("");
  const [kind, setKind] = useState<ViewKind>("autre");
  const [level, setLevel] = useState(0);

  useEffect(() => {
    if (!view) return;
    setName(view.name);
    setKind(view.kind);
    setLevel(view.level ?? 0);
  }, [view]);

  const levelTaken =
    kind === "niveau" &&
    views.some((v) => v.id !== view?.id && v.kind === "niveau" && v.level === level);

  const save = () => {
    if (!view) return;
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Indiquez un nom.");
      return;
    }
    update.mutate(
      {
        id: view.id,
        values: { name: trimmed.slice(0, 60), kind, level: kind === "niveau" ? level : null },
      },
      {
        onSuccess: () => {
          toast.success("Vue enregistrée");
          onClose();
        },
        onError: (error) => toast.error(dbErrorMessage(error)),
      },
    );
  };

  // The name follows the type and the floor as long as it was the automatic one.
  const automatic = (n: string) =>
    n === levelLabel(level) || KINDS.some((k) => VIEW_KIND_LABELS[k] === n) || n === "Nouvelle vue";

  return (
    <Dialog open={Boolean(view)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Réglages de la vue</DialogTitle>
          <DialogDescription>
            Les niveaux s'affichent en colonne sur la page publique, du plus haut au plus bas.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <label className="block space-y-2">
            <span className="text-sm font-medium">Type</span>
            <select
              value={kind}
              onChange={(e) => {
                const next = e.target.value as ViewKind;
                if (automatic(name))
                  setName(next === "niveau" ? levelLabel(level) : VIEW_KIND_LABELS[next]);
                setKind(next);
              }}
              className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm"
            >
              {KINDS.map((k) => (
                <option key={k} value={k}>
                  {VIEW_KIND_LABELS[k]}
                </option>
              ))}
            </select>
          </label>
          {kind === "niveau" ? (
            <label className="block space-y-2">
              <span className="text-sm font-medium">Niveau</span>
              <select
                value={level}
                onChange={(e) => {
                  const next = Number(e.target.value);
                  if (automatic(name)) setName(levelLabel(next));
                  setLevel(next);
                }}
                className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm"
              >
                {LEVELS.map((l) => (
                  <option key={l} value={l}>
                    {levelLabel(l)}
                  </option>
                ))}
              </select>
              {levelTaken ? (
                <span className="block text-xs text-amber-200">
                  Ce niveau a déjà sa vue : les deux s'afficheront l'une au-dessus de l'autre.
                </span>
              ) : null}
            </label>
          ) : null}
          <label className="block space-y-2">
            <span className="text-sm font-medium">Nom affiché</span>
            <Input
              value={name}
              maxLength={60}
              onChange={(e) => setName(e.target.value)}
              className="h-10"
            />
          </label>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={save} disabled={update.isPending}>
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
