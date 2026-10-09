import { useEffect, useRef, useState } from "react";
import { Viewer } from "@photo-sphere-viewer/core";
import { MarkersPlugin } from "@photo-sphere-viewer/markers-plugin";
import "@photo-sphere-viewer/core/index.css";
import "@photo-sphere-viewer/markers-plugin/index.css";
import { Check, Crosshair, LocateFixed, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { lotTagElement } from "@/components/public/lot-tag";
import { VIEWER_LANG } from "@/components/tour/arrow";
import { Button } from "@/components/ui/button";
import { dbErrorMessage } from "@/lib/app/errors";
import type { Lot } from "@/lib/app/lot-fields";
import { useUpdateView, type ProjectView } from "@/lib/app/plan";
import {
  useDeleteViewMarker,
  useSaveViewMarker,
  viewPanoramaImage,
  type ViewMarker,
} from "@/lib/app/view-panorama";
import type { PublicLot } from "@/lib/public/programme";
import { clampPitch, normalizeYaw } from "@/lib/tours";
import { cn } from "@/lib/utils";

/* Editor of a 360° view: the panorama, the marker of each lot where it
   stands. Pick a lot, click where it is; the next lot without a marker is
   picked at once, to place them one after the other. Loaded on demand: the
   viewer weighs its own. */

const asTag = (lot: Lot) =>
  ({ ...lot, features: [], niveau: lot.niveau ?? null }) as unknown as PublicLot;

export default function ViewPanoramaEditor({
  view,
  lots,
  markers,
  currency,
}: {
  view: ProjectView;
  lots: Lot[];
  /** Markers of this view. */
  markers: ViewMarker[];
  currency: string;
}) {
  const container = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Viewer | null>(null);
  const [ready, setReady] = useState(false);
  const [lotId, setLotId] = useState<string | null>(null);
  const [placing, setPlacing] = useState(false);
  const save = useSaveViewMarker(view.project_id);
  const remove = useDeleteViewMarker(view.project_id);
  const update = useUpdateView(view.project_id);
  const onError = (error: unknown) => toast.error(dbErrorMessage(error));

  const placed = new Map(markers.map((m) => [m.lot_id, m]));
  const lot = lots.find((l) => l.id === lotId) ?? null;
  const nextUnplaced = (after: string | null) => {
    const start = after ? lots.findIndex((l) => l.id === after) + 1 : 0;
    return [...lots.slice(start), ...lots.slice(0, start)].find(
      (l) => !placed.has(l.id) && l.id !== after,
    );
  };

  // The viewer's handlers read the latest state through a ref.
  const state = useRef({
    placing,
    place: (_yaw: number, _pitch: number) => {},
    pick: (_id: string) => {},
  });
  state.current.placing = placing;
  state.current.place = (yaw, pitch) => {
    if (!lot) return;
    const current = lot;
    save.mutate(
      { viewId: view.id, lotId: current.id, yaw, pitch },
      {
        onSuccess: () => {
          toast.success(`Lot ${current.numero} placé`);
          const next = nextUnplaced(current.id);
          if (next) setLotId(next.id);
          else {
            setPlacing(false);
            setLotId(null);
          }
        },
        onError,
      },
    );
  };
  state.current.pick = (id) => {
    setLotId(id);
    setPlacing(false);
  };

  useEffect(() => {
    const element = container.current;
    if (!element || !view.panorama_path) return;
    let viewer: Viewer | null = null;
    const timer = window.setTimeout(() => {
      viewer = new Viewer({
        container: element,
        panorama: viewPanoramaImage(view.panorama_path as string).small,
        defaultYaw: view.start_yaw,
        defaultPitch: view.start_pitch,
        defaultZoomLvl: 0,
        navbar: ["zoom"],
        lang: VIEWER_LANG,
        mousewheelCtrlKey: false,
        plugins: [[MarkersPlugin, {}]],
      });
      viewerRef.current = viewer;
      viewer.addEventListener("ready", () => setReady(true), { once: true });
      viewer.addEventListener("click", ({ data }) => {
        if (data.marker || data.rightclick || !state.current.placing) return;
        state.current.place(data.yaw, data.pitch);
      });
      viewer
        .getPlugin<MarkersPlugin>(MarkersPlugin)
        .addEventListener("select-marker", ({ marker }) => state.current.pick(String(marker.data)));
    });
    return () => {
      window.clearTimeout(timer);
      viewerRef.current = null;
      viewer?.destroy();
    };
  }, [view.panorama_path, view.start_yaw, view.start_pitch]);

  const markerKey = markers
    .map((m) => `${m.lot_id}:${m.yaw}:${m.pitch}`)
    .concat(lotId ?? "")
    .join("|");
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || !ready) return;
    viewer.getPlugin<MarkersPlugin>(MarkersPlugin).setMarkers(
      markers.flatMap((m) => {
        const target = lots.find((l) => l.id === m.lot_id);
        if (!target) return [];
        return [
          {
            id: m.id,
            position: { yaw: m.yaw, pitch: m.pitch },
            element: lotTagElement(asTag(target), { currency, active: target.id === lotId }),
            anchor: "bottom center",
            data: target.id,
          },
        ];
      }),
    );
    // markerKey sums up the markers.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, markerKey]);

  const saveStart = () => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    const { yaw, pitch } = viewer.getPosition();
    update.mutate(
      { id: view.id, values: { start_yaw: normalizeYaw(yaw), start_pitch: clampPitch(pitch) } },
      { onSuccess: () => toast.success("Vue de départ enregistrée"), onError },
    );
  };

  const marker = lot ? placed.get(lot.id) : undefined;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {placing && lot ? (
          <>
            <p className="text-sm" role="status">
              Cliquez dans le panorama sur le lot <span className="font-medium">{lot.numero}</span>
              {lot.type ? ` (${lot.type})` : ""}.
            </p>
            <Button variant="ghost" className="h-9" onClick={() => setPlacing(false)}>
              Terminer
            </Button>
          </>
        ) : lot ? (
          <>
            <p className="mr-1 text-sm">
              Lot <span className="font-medium">{lot.numero}</span>
              {marker ? " · placé" : " · pas encore placé"}
            </p>
            <Button variant="outline" className="h-9" onClick={() => setPlacing(true)}>
              <Crosshair aria-hidden />
              {marker ? "Déplacer" : "Placer"}
            </Button>
            {marker ? (
              <Button
                variant="ghost"
                className="h-9 text-muted-foreground hover:text-red-300"
                onClick={() =>
                  remove.mutate(marker.id, {
                    onSuccess: () => toast.success(`Repère du lot ${lot.numero} retiré`),
                    onError,
                  })
                }
              >
                <Trash2 aria-hidden />
                Retirer
              </Button>
            ) : null}
            <Button
              variant="ghost"
              size="icon"
              className="size-9"
              onClick={() => setLotId(null)}
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
              disabled={lots.length === 0}
              onClick={() => {
                const first = nextUnplaced(null) ?? lots[0];
                if (!first) return;
                setLotId(first.id);
                setPlacing(true);
              }}
            >
              <Crosshair aria-hidden />
              {markers.length === 0 ? "Placer les lots" : "Placer les lots restants"}
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
              {placed.size} / {lots.length} lots placés · cliquez sur un repère pour le modifier.
            </p>
          </>
        )}
      </div>

      <div
        ref={container}
        className={cn(
          "relative h-[min(65svh,640px)] min-h-[380px] w-full overflow-hidden rounded-2xl border border-border bg-black [&_.psv-container]:[background:#0a0a0a]!",
          placing && "[&_.psv-canvas-container]:!cursor-crosshair",
        )}
      />

      <ul aria-label="Lots de la vue" className="flex flex-wrap gap-1.5">
        {lots.map((l) => {
          const done = placed.has(l.id);
          const active = l.id === lotId;
          return (
            <li key={l.id}>
              <button
                type="button"
                onClick={() => {
                  setLotId(l.id);
                  setPlacing(!done);
                }}
                aria-pressed={active}
                className={cn(
                  "inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  active
                    ? "border-primary bg-primary/15 text-foreground"
                    : done
                      ? "border-border text-foreground"
                      : "border-dashed border-border text-muted-foreground hover:text-foreground",
                )}
              >
                {done ? <Check className="size-3 text-primary" aria-hidden /> : null}
                {l.numero}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
