import { Suspense, lazy, useMemo, useRef, useState, type DragEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, ImageUp, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { FormMessage as Notice } from "@/components/app/AuthCard";
import { EmptyState, SettingsSection } from "@/components/app/Blocks";
import { ConfirmDialog } from "@/components/app/ConfirmDialog";
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
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { dbErrorMessage } from "@/lib/app/errors";
import { compareNumeros, type Lot } from "@/lib/app/lot-fields";
import { useLots } from "@/lib/app/lots";
import {
  panoramaImage,
  useDeletePanoramas,
  useMovePanorama,
  usePanoramaLinks,
  usePanoramas,
  useUpdatePanorama,
  useUploadPanoramas,
  type Panorama,
  type PanoramaLink,
  type PanoramaProgress,
  type PanoramaReport,
} from "@/lib/app/tours";
import { PLAN_TYPES } from "@/lib/image";
import {
  groupTours,
  normalizeType,
  targetKey,
  unreachableRooms,
  type TourTarget,
} from "@/lib/tours";
import { cn } from "@/lib/utils";
import { floorName } from "@/lib/views";

const PanoramaEditor = lazy(() => import("@/components/app/tour/PanoramaEditor"));

export const Route = createFileRoute("/app/_espace/projets/$id/visite")({
  component: ToursPage,
});

type Tour = { key: string; target: TourTarget; label: string; rooms: Panorama[] };

/** Types of lot of the programme, as first typed, with their number of lots. */
function lotTypes(lots: Lot[]): Map<string, { label: string; count: number }> {
  const types = new Map<string, { label: string; count: number }>();
  for (const lot of lots) {
    if (!lot.type?.trim()) continue;
    const key = normalizeType(lot.type);
    const type = types.get(key);
    types.set(key, { label: type?.label ?? lot.type.trim(), count: (type?.count ?? 0) + 1 });
  }
  return types;
}

function ToursPage() {
  const { project } = useCurrentProject();
  const lots = useLots(project.id);
  const panoramas = usePanoramas(project.id);
  const links = usePanoramaLinks(project.id);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [draft, setDraft] = useState<TourTarget | null>(null);
  const [creating, setCreating] = useState(false);

  const types = useMemo(() => lotTypes(lots.data ?? []), [lots.data]);
  const tours = useMemo((): Tour[] => {
    const byKey = groupTours(panoramas.data ?? []);
    const lotById = new Map((lots.data ?? []).map((l) => [l.id, l]));
    const list: Tour[] = [...byKey].map(([key, rooms]) => {
      const first = rooms[0]!;
      const target: TourTarget = first.lot_id
        ? { lotId: first.lot_id }
        : { lotType: first.lot_type ?? "" };
      return { key, target, label: tourLabel(target, types, lotById), rooms };
    });
    if (draft && !byKey.has(targetKey(draft)))
      list.push({
        key: targetKey(draft),
        target: draft,
        label: tourLabel(draft, types, lotById),
        rooms: [],
      });
    // Types first, then lots in the order of their numbers.
    return list.sort((a, b) => {
      if ("lotType" in a.target !== "lotType" in b.target) return "lotType" in a.target ? -1 : 1;
      if ("lotType" in a.target && "lotType" in b.target)
        return a.label.localeCompare(b.label, "fr");
      const na = "lotId" in a.target ? (lotById.get(a.target.lotId)?.numero ?? "") : "";
      const nb = "lotId" in b.target ? (lotById.get(b.target.lotId)?.numero ?? "") : "";
      return compareNumeros(na, nb);
    });
  }, [panoramas.data, lots.data, types, draft]);

  const selected = tours.find((t) => t.key === selectedKey) ?? tours[0] ?? null;

  if (lots.isPending || panoramas.isPending || links.isPending) {
    return (
      <div aria-busy="true" aria-label="Chargement des visites" className="space-y-4">
        <Skeleton className="h-11 w-full max-w-xl rounded-xl" />
        <Skeleton className="h-[min(65svh,640px)] min-h-[380px] w-full rounded-2xl" />
      </div>
    );
  }
  if (lots.isError || panoramas.isError || links.isError) {
    return (
      <EmptyState
        title="Impossible de charger les visites"
        text="Vérifiez votre connexion internet puis rechargez la page."
      />
    );
  }

  const newTour = (
    <NewTourDialog
      open={creating}
      onOpenChange={setCreating}
      lots={lots.data}
      types={types}
      taken={new Set(tours.filter((t) => t.rooms.length > 0).map((t) => t.key))}
      onCreate={(target) => {
        setDraft(target);
        setSelectedKey(targetKey(target));
        setCreating(false);
      }}
    />
  );

  if (tours.length === 0) {
    return (
      <div className="max-w-3xl">
        <SettingsSection
          title="Visite 360°"
          description="Une visite réunit les panoramas 360° des pièces d'un logement, reliés par des flèches. Faites-en une par type de lot (elle s'affiche dans la fiche de chaque lot de ce type) ou pour un lot précis."
        >
          <Button
            className="h-11"
            onClick={() => setCreating(true)}
            disabled={lots.data.length === 0}
          >
            <Plus aria-hidden />
            Créer une visite
          </Button>
          {lots.data.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Ajoutez d'abord les lots du programme, dans l'onglet Lots.
            </p>
          ) : null}
        </SettingsSection>
        {newTour}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <ul aria-label="Visites du programme" className="flex flex-wrap gap-2">
          {tours.map((tour) => {
            const active = tour.key === selected?.key;
            return (
              <li key={tour.key}>
                <button
                  type="button"
                  onClick={() => setSelectedKey(tour.key)}
                  aria-pressed={active}
                  className={cn(
                    "inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    active
                      ? "border-primary bg-primary/15 text-foreground"
                      : "border-border text-muted-foreground hover:text-foreground",
                  )}
                >
                  {tour.label}
                  <span className="text-xs tabular-nums text-muted-foreground" title="Pièces">
                    {tour.rooms.length}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        <Button variant="outline" className="h-10 rounded-full" onClick={() => setCreating(true)}>
          <Plus aria-hidden />
          Nouvelle visite
        </Button>
      </div>

      {selected ? (
        <TourPanel
          key={selected.key}
          tour={selected}
          links={links.data}
          lots={lots.data}
          types={types}
          tours={tours}
          onDeleted={() => {
            setDraft(null);
            setSelectedKey(null);
          }}
        />
      ) : null}
      {newTour}
    </div>
  );
}

function tourLabel(
  target: TourTarget,
  types: Map<string, { label: string }>,
  lotById: Map<string, Lot>,
): string {
  if ("lotType" in target) return types.get(normalizeType(target.lotType))?.label ?? target.lotType;
  const lot = lotById.get(target.lotId);
  return lot ? `Lot ${lot.numero}` : "Lot supprimé";
}

function TourPanel({
  tour,
  links,
  lots,
  types,
  tours,
  onDeleted,
}: {
  tour: Tour;
  links: PanoramaLink[];
  lots: Lot[];
  types: Map<string, { label: string; count: number }>;
  tours: Tour[];
  onDeleted: () => void;
}) {
  const { project } = useCurrentProject();
  const [roomId, setRoomId] = useState<string | null>(null);
  const [renaming, setRenaming] = useState<Panorama | null>(null);
  const [deletingRoom, setDeletingRoom] = useState<Panorama | null>(null);
  const [deletingTour, setDeletingTour] = useState(false);
  const [refused, setRefused] = useState<PanoramaReport["failed"]>([]);
  const move = useMovePanorama(project.id);
  const remove = useDeletePanoramas(project.id);
  const onError = (error: unknown) => toast.error(dbErrorMessage(error));
  const onReport = (report: PanoramaReport | null) => {
    setRefused(report?.failed ?? []);
    const first = report?.added[0];
    if (first) setRoomId(first.id);
  };

  const room = tour.rooms.find((r) => r.id === roomId) ?? tour.rooms[0] ?? null;
  const ids = new Set(tour.rooms.map((r) => r.id));
  const tourLinks = links.filter((l) => ids.has(l.from_id) && ids.has(l.to_id));
  const unreachable = unreachableRooms(tour.rooms, tourLinks);
  const index = room ? tour.rooms.findIndex((r) => r.id === room.id) : -1;

  let where: string;
  if ("lotType" in tour.target) {
    const count = types.get(normalizeType(tour.target.lotType))?.count ?? 0;
    where =
      count === 0
        ? "Aucun lot n'a ce type pour l'instant : renseignez le champ Type dans l'onglet Lots."
        : `Montrée dans la fiche ${count === 1 ? "du lot" : `des ${count} lots`} de type « ${tour.label} », sauf ceux qui ont leur propre visite.`;
  } else {
    const lotId = tour.target.lotId;
    const lot = lots.find((l) => l.id === lotId);
    const typeTour = lot?.type?.trim()
      ? tours.some((t) => t.key === `type:${normalizeType(lot.type ?? "")}` && t.rooms.length > 0)
      : false;
    where = typeTour
      ? `Montrée dans la fiche du ${tour.label.toLowerCase()}, à la place de la visite de son type.`
      : `Montrée dans la fiche du ${tour.label.toLowerCase()}.`;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start gap-2">
        <div className="mr-auto min-w-0">
          <h2 className="font-display text-lg font-medium tracking-tight">
            Visite · {"lotType" in tour.target ? `type « ${tour.label} »` : tour.label}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{where}</p>
        </div>
        {tour.rooms.length > 0 ? (
          <Button
            variant="ghost"
            className="h-9 text-muted-foreground hover:text-red-300"
            onClick={() => setDeletingTour(true)}
          >
            <Trash2 aria-hidden />
            Supprimer la visite
          </Button>
        ) : null}
      </div>

      {refused.length > 0 ? (
        <Notice tone="error">
          {refused.length === 1
            ? "Un panorama n'a pas été ajouté"
            : `${refused.length} panoramas n'ont pas été ajoutés`}{" "}
          : {refused.map((f) => `${f.name} : ${f.reason}`).join(" · ")}
        </Notice>
      ) : null}

      {tour.rooms.length === 0 ? (
        <div className="max-w-3xl">
          <PanoramaUploader target={tour.target} large onReport={onReport} />
        </div>
      ) : (
        <>
          <div className="flex gap-3 overflow-x-auto pb-1">
            <ol aria-label="Pièces de la visite" className="flex gap-3">
              {tour.rooms.map((r, i) => {
                const active = r.id === room?.id;
                const exits = tourLinks.filter((l) => l.from_id === r.id).length;
                return (
                  <li key={r.id} className="shrink-0">
                    <button
                      type="button"
                      onClick={() => setRoomId(r.id)}
                      aria-pressed={active}
                      className={cn(
                        "w-40 overflow-hidden rounded-xl border text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        active ? "border-primary" : "border-border hover:border-foreground/30",
                      )}
                    >
                      <span className="relative block">
                        <img
                          src={panoramaImage(r).thumb}
                          alt=""
                          className="aspect-[2/1] w-full object-cover"
                          loading="lazy"
                        />
                        {i === 0 ? (
                          <span className="absolute left-1.5 top-1.5 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-medium text-white">
                            Entrée
                          </span>
                        ) : null}
                      </span>
                      <span className="block px-2.5 py-2">
                        <span className="block truncate text-sm font-medium">{r.name}</span>
                        <span
                          className={cn(
                            "block text-[11px]",
                            unreachable.has(r.id) ? "text-amber-300" : "text-muted-foreground",
                          )}
                        >
                          {unreachable.has(r.id)
                            ? "aucune flèche n'y mène"
                            : `${exits} passage${exits > 1 ? "s" : ""}`}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
            <PanoramaUploader target={tour.target} onReport={onReport} />
          </div>

          {room ? (
            <>
              <div className="flex flex-wrap items-center gap-1">
                <h3 className="mr-2 font-medium">{room.name}</h3>
                <Button variant="ghost" className="h-9" onClick={() => setRenaming(room)}>
                  <Pencil aria-hidden />
                  Nom et étage
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-9"
                  disabled={index <= 0}
                  onClick={() => move.mutate({ id: room.id, step: -1 }, { onError })}
                  aria-label="Déplacer la pièce vers la gauche"
                  title={index === 1 ? "La première pièce est l'entrée de la visite" : undefined}
                >
                  <ArrowLeft aria-hidden />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-9"
                  disabled={index >= tour.rooms.length - 1}
                  onClick={() => move.mutate({ id: room.id, step: 1 }, { onError })}
                  aria-label="Déplacer la pièce vers la droite"
                >
                  <ArrowRight aria-hidden />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-9 text-muted-foreground hover:text-red-300"
                  onClick={() => setDeletingRoom(room)}
                  aria-label="Supprimer la pièce"
                >
                  <Trash2 aria-hidden />
                </Button>
              </div>
              <Suspense
                fallback={
                  <Skeleton className="h-[min(65svh,640px)] min-h-[380px] w-full rounded-2xl" />
                }
              >
                <PanoramaEditor
                  projectId={project.id}
                  room={room}
                  rooms={tour.rooms}
                  links={tourLinks}
                  onOpenRoom={setRoomId}
                />
              </Suspense>
            </>
          ) : null}
        </>
      )}

      <RenameRoomDialog room={renaming} onClose={() => setRenaming(null)} />

      <ConfirmDialog
        open={deletingRoom !== null}
        onOpenChange={(open) => !open && setDeletingRoom(null)}
        title={`Supprimer la pièce « ${deletingRoom?.name ?? ""} » ?`}
        description="Son panorama et les passages qui y mènent ou en partent sont supprimés."
        actionLabel="Supprimer la pièce"
        onConfirm={async () => {
          if (!deletingRoom) return;
          await remove.mutateAsync([deletingRoom]);
          setRoomId(null);
          toast.success(`Pièce « ${deletingRoom.name} » supprimée`);
        }}
      />
      <ConfirmDialog
        open={deletingTour}
        onOpenChange={setDeletingTour}
        title="Supprimer la visite ?"
        description={
          tour.rooms.length === 1
            ? "Sa pièce, son panorama et ses passages sont supprimés."
            : `Les ${tour.rooms.length} pièces, leurs panoramas et leurs passages sont supprimés.`
        }
        actionLabel="Supprimer la visite"
        onConfirm={async () => {
          await remove.mutateAsync(tour.rooms);
          onDeleted();
          toast.success("Visite supprimée");
        }}
      />
    </div>
  );
}

const progressText = ({ index, count, phase }: PanoramaProgress) =>
  `${phase === "preparing" ? "Préparation" : "Envoi"} du panorama${count > 1 ? ` ${index + 1} sur ${count}` : ""}…`;

/** Adds rooms: one or several panoramas at once, chosen or dropped. */
function PanoramaUploader({
  target,
  large = false,
  onReport,
}: {
  target: TourTarget;
  large?: boolean;
  /** null when a new batch starts. */
  onReport: (report: PanoramaReport | null) => void;
}) {
  const { project } = useCurrentProject();
  const [progress, setProgress] = useState<PanoramaProgress | null>(null);
  const upload = useUploadPanoramas(project, setProgress);
  const input = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const busy = upload.isPending;

  const send = async (list: FileList | null | undefined) => {
    const files = [...(list ?? [])];
    if (files.length === 0 || busy) return;
    onReport(null);
    try {
      const report = await upload.mutateAsync({ target, files });
      if (report.added.length > 0) {
        toast.success(
          report.added.length === 1 ? "Pièce ajoutée" : `${report.added.length} pièces ajoutées`,
        );
      }
      onReport(report);
    } catch (error) {
      toast.error(dbErrorMessage(error));
    } finally {
      if (input.current) input.current.value = "";
    }
  };

  const drop = {
    onDragOver: (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (!busy) setDragging(true);
    },
    onDragLeave: () => setDragging(false),
    onDrop: (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragging(false);
      void send(e.dataTransfer.files);
    },
  };

  const status = busy && progress ? progressText(progress) : null;

  return (
    <div className={cn("space-y-3", !large && "shrink-0")}>
      {large ? (
        <div
          {...drop}
          aria-busy={busy}
          className={cn(
            "flex flex-col items-center gap-3 rounded-2xl border border-dashed px-6 py-14 text-center transition-colors",
            dragging ? "border-primary bg-primary/5" : "border-border",
          )}
        >
          <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
            <ImageUp className="size-5" aria-hidden />
          </span>
          {status ? (
            <p className="text-sm font-medium" role="status">
              {status}
            </p>
          ) : (
            <>
              <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
                Panoramas 360° équirectangulaires (deux fois plus larges que hauts), un par pièce,
                en JPEG, PNG ou WebP. Vous pouvez en envoyer plusieurs d'un coup : la première pièce
                est l'entrée de la visite. Le nom du fichier devient le nom de la pièce.
              </p>
              <Button type="button" className="h-11" onClick={() => input.current?.click()}>
                Choisir les panoramas
              </Button>
              <p className="text-xs text-muted-foreground">ou déposez-les ici</p>
            </>
          )}
        </div>
      ) : (
        <div
          {...drop}
          className={cn(
            "flex h-full w-40 flex-col items-center justify-center gap-2 rounded-xl border border-dashed p-3 text-center transition-colors",
            dragging ? "border-primary bg-primary/5" : "border-border",
          )}
        >
          {status ? (
            <p className="text-xs font-medium" role="status">
              {status}
            </p>
          ) : (
            <Button
              type="button"
              variant="ghost"
              className="h-auto flex-col gap-1.5 py-3 text-sm"
              onClick={() => input.current?.click()}
            >
              <Plus aria-hidden />
              Ajouter des pièces
            </Button>
          )}
        </div>
      )}
      <input
        ref={input}
        type="file"
        multiple
        accept={PLAN_TYPES.join(",")}
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(e) => void send(e.target.files)}
      />
    </div>
  );
}

function RenameRoomDialog({ room, onClose }: { room: Panorama | null; onClose: () => void }) {
  const { project } = useCurrentProject();
  const update = useUpdatePanorama(project.id);
  const [name, setName] = useState("");
  const [level, setLevel] = useState<string>("");
  const [shownId, setShownId] = useState<string | null>(null);
  if (room && room.id !== shownId) {
    setShownId(room.id);
    setName(room.name);
    setLevel(room.level === null ? "" : String(room.level));
  }

  const save = () => {
    if (!room) return;
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Indiquez un nom.");
      return;
    }
    update.mutate(
      {
        id: room.id,
        values: { name: trimmed.slice(0, 60), level: level === "" ? null : Number(level) },
      },
      {
        onSuccess: () => {
          toast.success("Pièce enregistrée");
          setShownId(null);
          onClose();
        },
        onError: (error) => toast.error(dbErrorMessage(error)),
      },
    );
  };

  return (
    <Dialog
      open={room !== null}
      onOpenChange={(open) => {
        if (!open) {
          setShownId(null);
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nom et étage de la pièce</DialogTitle>
          <DialogDescription>
            Le nom s'affiche sur les flèches qui y mènent ; avec l'étage, la visite range ses pièces
            par niveau.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
        >
          <div className="space-y-3">
            <Input
              value={name}
              maxLength={60}
              onChange={(e) => setName(e.target.value)}
              className="h-10"
              aria-label="Nom de la pièce"
              autoFocus
            />
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              aria-label="Étage de la pièce"
              className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm"
            >
              <option value="">Étage non précisé</option>
              {[-2, -1, 0, 1, 2, 3, 4, 5].map((l) => (
                <option key={l} value={l}>
                  {floorName(l)}
                </option>
              ))}
            </select>
          </div>
          <DialogFooter className="mt-5">
            <Button type="button" variant="ghost" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={update.isPending}>
              Enregistrer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/** Chooses what the new tour is for: every lot of a type, or one lot. */
function NewTourDialog({
  open,
  onOpenChange,
  lots,
  types,
  taken,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lots: Lot[];
  types: Map<string, { label: string; count: number }>;
  taken: ReadonlySet<string>;
  onCreate: (target: TourTarget) => void;
}) {
  const freeTypes = [...types].filter(([key]) => !taken.has(`type:${key}`));
  const freeLots = [...lots]
    .filter((l) => !taken.has(`lot:${l.id}`))
    .sort((a, b) => compareNumeros(a.numero, b.numero));
  const [kind, setKind] = useState<"type" | "lot">(freeTypes.length > 0 ? "type" : "lot");
  const [typeKey, setTypeKey] = useState("");
  const [lotId, setLotId] = useState("");

  const chosenType = typeKey || freeTypes[0]?.[0] || "";
  const chosenLot = lotId || freeLots[0]?.id || "";
  const canCreate = kind === "type" ? Boolean(chosenType) : Boolean(chosenLot);

  const create = () => {
    if (kind === "type") {
      const type = types.get(chosenType);
      if (type) onCreate({ lotType: type.label });
    } else if (chosenLot) onCreate({ lotId: chosenLot });
  };

  const select = "h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nouvelle visite 360°</DialogTitle>
          <DialogDescription>
            Une visite par type de lot sert à tous les lots de ce type ; une visite propre à un lot
            passe avant celle de son type.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <fieldset className="grid gap-2">
            <legend className="sr-only">La visite est pour</legend>
            <label className="flex items-start gap-3 rounded-xl border border-border p-3 has-[:checked]:border-primary">
              <input
                type="radio"
                name="tour-kind"
                checked={kind === "type"}
                onChange={() => setKind("type")}
                disabled={freeTypes.length === 0}
                className="mt-1 accent-[color:var(--primary)]"
              />
              <span className="min-w-0 flex-1 space-y-2">
                <span className="block text-sm font-medium">Un type de lot</span>
                {types.size === 0 ? (
                  <span className="block text-xs text-muted-foreground">
                    Aucun lot n'a de type : renseignez le champ Type dans l'onglet Lots.
                  </span>
                ) : freeTypes.length === 0 ? (
                  <span className="block text-xs text-muted-foreground">
                    Chaque type a déjà sa visite.
                  </span>
                ) : (
                  <select
                    value={chosenType}
                    onChange={(e) => {
                      setTypeKey(e.target.value);
                      setKind("type");
                    }}
                    className={select}
                    aria-label="Type de lot"
                  >
                    {freeTypes.map(([key, type]) => (
                      <option key={key} value={key}>
                        {type.label} ({type.count} lot{type.count > 1 ? "s" : ""})
                      </option>
                    ))}
                  </select>
                )}
              </span>
            </label>
            <label className="flex items-start gap-3 rounded-xl border border-border p-3 has-[:checked]:border-primary">
              <input
                type="radio"
                name="tour-kind"
                checked={kind === "lot"}
                onChange={() => setKind("lot")}
                disabled={freeLots.length === 0}
                className="mt-1 accent-[color:var(--primary)]"
              />
              <span className="min-w-0 flex-1 space-y-2">
                <span className="block text-sm font-medium">Un lot précis</span>
                {freeLots.length === 0 ? (
                  <span className="block text-xs text-muted-foreground">
                    Chaque lot a déjà sa visite.
                  </span>
                ) : (
                  <select
                    value={chosenLot}
                    onChange={(e) => {
                      setLotId(e.target.value);
                      setKind("lot");
                    }}
                    className={select}
                    aria-label="Lot"
                  >
                    {freeLots.map((lot) => (
                      <option key={lot.id} value={lot.id}>
                        Lot {lot.numero}
                        {lot.type ? ` · ${lot.type}` : ""}
                      </option>
                    ))}
                  </select>
                )}
              </span>
            </label>
          </fieldset>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={create} disabled={!canCreate}>
            Continuer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
