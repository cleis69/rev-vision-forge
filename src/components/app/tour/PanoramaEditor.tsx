import { useEffect, useRef, useState } from "react";
import { Viewer } from "@photo-sphere-viewer/core";
import { MarkersPlugin } from "@photo-sphere-viewer/markers-plugin";
import "@photo-sphere-viewer/core/index.css";
import "@photo-sphere-viewer/markers-plugin/index.css";
import { DoorOpen, LocateFixed, Move, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { arrowElement, VIEWER_LANG } from "@/components/tour/arrow";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { dbErrorMessage } from "@/lib/app/errors";
import {
  panoramaImage,
  useDeleteLink,
  useSaveLink,
  useUpdatePanorama,
  type Panorama,
  type PanoramaLink,
} from "@/lib/app/tours";
import { clampPitch, normalizeYaw } from "@/lib/tours";
import { cn } from "@/lib/utils";

/* Editor of one room of a tour: the panorama in the viewer, the arrows to the
   other rooms (click where the door is, then choose the room), and the
   direction shown on arrival. Loaded on demand: the viewer weighs its own. */

type Mode = { kind: "view" } | { kind: "add" } | { kind: "move"; link: PanoramaLink };
type Spot = { yaw: number; pitch: number };

export default function PanoramaEditor({
  projectId,
  room,
  rooms,
  links,
  onOpenRoom,
}: {
  projectId: string;
  room: Panorama;
  rooms: Panorama[];
  /** Arrows of the tour (all rooms). */
  links: PanoramaLink[];
  onOpenRoom: (id: string) => void;
}) {
  const container = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Viewer | null>(null);
  const [shown, setShown] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>({ kind: "view" });
  const [spot, setSpot] = useState<Spot | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const saveLink = useSaveLink(projectId);
  const deleteLink = useDeleteLink(projectId);
  const update = useUpdatePanorama(projectId);

  const exits = links.filter((l) => l.from_id === room.id);
  const names = new Map(rooms.map((r) => [r.id, r.name]));
  const selected = exits.find((l) => l.id === selectedId) ?? null;
  const onError = (error: unknown) => toast.error(dbErrorMessage(error));

  // The viewer's handlers read the latest state through a ref.
  const state = useRef({ mode, onPlace: (_spot: Spot) => {} });
  state.current.mode = mode;
  state.current.onPlace = (at: Spot) => {
    if (mode.kind === "add") setSpot(at);
    else if (mode.kind === "move") {
      saveLink.mutate(
        { fromId: mode.link.from_id, toId: mode.link.to_id, ...at },
        { onSuccess: () => toast.success("Passage déplacé"), onError },
      );
      setMode({ kind: "view" });
    }
  };

  // One viewer for the editor; rooms are swapped inside it. Created a tick
  // later: a viewer destroyed while loading would leave the next one waiting
  // on the same aborted download (three shares requests to one address).
  useEffect(() => {
    const element = container.current;
    if (!element) return;
    let viewer: Viewer | null = null;
    const timer = window.setTimeout(() => {
      viewer = new Viewer({
        container: element,
        panorama: panoramaImage(room).small,
        defaultYaw: room.start_yaw,
        defaultPitch: room.start_pitch,
        defaultZoomLvl: 0,
        navbar: ["zoom"],
        lang: VIEWER_LANG,
        mousewheelCtrlKey: false,
        plugins: [[MarkersPlugin, {}]],
      });
      viewerRef.current = viewer;
      viewer.addEventListener("ready", () => setShown(room.id), { once: true });
      viewer.addEventListener("click", ({ data }) => {
        if (data.marker || data.rightclick) return;
        if (state.current.mode.kind === "view") {
          setSelectedId(null);
          return;
        }
        state.current.onPlace({ yaw: data.yaw, pitch: data.pitch });
      });
      viewer
        .getPlugin<MarkersPlugin>(MarkersPlugin)
        .addEventListener("select-marker", ({ marker }) => {
          if (state.current.mode.kind !== "view") return;
          setSelectedId(marker.id);
        });
    });
    return () => {
      window.clearTimeout(timer);
      viewerRef.current = null;
      viewer?.destroy();
    };
    // The first room only: the next ones go through setPanorama below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || shown === null || shown === room.id) return;
    let cancelled = false;
    setSelectedId(null);
    setMode({ kind: "view" });
    viewer
      .setPanorama(panoramaImage(room).small, {
        position: { yaw: room.start_yaw, pitch: room.start_pitch },
        zoom: 0,
        transition: false,
      })
      .then(() => !cancelled && setShown(room.id))
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
    // Only a change of room reloads the panorama.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room.id, room.image_path]);

  // Arrows of the room shown.
  const markerKey = exits
    .map((l) => `${l.id}:${l.yaw}:${l.pitch}:${names.get(l.to_id)}:${l.id === selectedId}`)
    .join("|");
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || shown !== room.id) return;
    viewer.getPlugin<MarkersPlugin>(MarkersPlugin).setMarkers(
      exits.map((l) => ({
        id: l.id,
        position: { yaw: l.yaw, pitch: l.pitch },
        element: arrowElement(names.get(l.to_id) ?? "Pièce", { selected: l.id === selectedId }),
        anchor: "center center",
      })),
    );
    // markerKey sums up the arrows.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markerKey, shown, room.id]);

  const saveStart = () => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    const { yaw, pitch } = viewer.getPosition();
    update.mutate(
      { id: room.id, values: { start_yaw: normalizeYaw(yaw), start_pitch: clampPitch(pitch) } },
      { onSuccess: () => toast.success("Vue de départ enregistrée"), onError },
    );
  };

  const choose = (toId: string) => {
    if (!spot) return;
    saveLink.mutate(
      { fromId: room.id, toId, ...spot },
      {
        onSuccess: () => toast.success(`Passage vers « ${names.get(toId)} » placé`),
        onError,
      },
    );
    setSpot(null);
    setMode({ kind: "view" });
  };

  const others = rooms.filter((r) => r.id !== room.id);
  const placing = mode.kind !== "view";

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {placing ? (
          <>
            <p className="text-sm text-foreground" role="status">
              {mode.kind === "add"
                ? "Cliquez dans le panorama à l'endroit de la porte ou du passage."
                : `Cliquez au nouvel emplacement du passage vers « ${names.get(mode.link.to_id)} ».`}
            </p>
            <Button variant="ghost" className="h-9" onClick={() => setMode({ kind: "view" })}>
              Annuler
            </Button>
          </>
        ) : selected ? (
          <>
            <p className="mr-1 text-sm">
              Passage vers <span className="font-medium">« {names.get(selected.to_id)} »</span>
            </p>
            <Button variant="outline" className="h-9" onClick={() => onOpenRoom(selected.to_id)}>
              <DoorOpen aria-hidden />
              Aller dans cette pièce
            </Button>
            <Button
              variant="outline"
              className="h-9"
              onClick={() => setMode({ kind: "move", link: selected })}
            >
              <Move aria-hidden />
              Déplacer
            </Button>
            <Button
              variant="ghost"
              className="h-9 text-muted-foreground hover:text-red-300"
              onClick={() =>
                deleteLink.mutate(selected.id, {
                  onSuccess: () => toast.success("Passage supprimé"),
                  onError,
                })
              }
            >
              <Trash2 aria-hidden />
              Supprimer
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-9"
              onClick={() => setSelectedId(null)}
              aria-label="Fermer"
            >
              <X aria-hidden />
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="outline"
              className="h-9"
              disabled={others.length === 0}
              title={others.length === 0 ? "Ajoutez d'abord une autre pièce" : undefined}
              onClick={() => {
                setSelectedId(null);
                setMode({ kind: "add" });
              }}
            >
              <Plus aria-hidden />
              Ajouter un passage
            </Button>
            <Button
              variant="outline"
              className="h-9"
              onClick={saveStart}
              disabled={update.isPending}
            >
              <LocateFixed aria-hidden />
              Partir de cette vue
            </Button>
            <p className="text-xs text-muted-foreground">
              {exits.length === 0
                ? "Aucun passage depuis cette pièce."
                : `${exits.length} passage${exits.length > 1 ? "s" : ""} · cliquez sur une flèche pour la modifier.`}
            </p>
          </>
        )}
      </div>

      <div
        ref={container}
        className={cn(
          // The viewer's own light background, made dark (its styles are not in a layer).
          "relative h-[min(65svh,640px)] min-h-[380px] w-full overflow-hidden rounded-2xl border border-border bg-black [&_.psv-container]:[background:#0a0a0a]!",
          placing && "[&_.psv-canvas-container]:!cursor-crosshair",
        )}
      />

      <Dialog open={spot !== null} onOpenChange={(open) => !open && setSpot(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Ce passage mène à…</DialogTitle>
            <DialogDescription>
              La flèche s'affiche à l'endroit cliqué, avec le nom de la pièce.
            </DialogDescription>
          </DialogHeader>
          <ul className="grid gap-2 sm:grid-cols-2">
            {others.map((r) => {
              const linked = exits.some((l) => l.to_id === r.id);
              return (
                <li key={r.id}>
                  <button
                    type="button"
                    onClick={() => choose(r.id)}
                    className="flex w-full items-center gap-3 rounded-xl border border-border p-2 text-left transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <img
                      src={panoramaImage(r).thumb}
                      alt=""
                      className="h-10 w-20 shrink-0 rounded-md object-cover"
                      loading="lazy"
                    />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">{r.name}</span>
                      {linked ? (
                        <span className="block text-xs text-muted-foreground">
                          déjà relié : la flèche sera déplacée
                        </span>
                      ) : null}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </DialogContent>
      </Dialog>
    </div>
  );
}
