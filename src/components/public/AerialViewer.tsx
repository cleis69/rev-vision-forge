import { useEffect, useMemo, useRef, useState } from "react";
import { Viewer } from "@photo-sphere-viewer/core";
import { AutorotatePlugin } from "@photo-sphere-viewer/autorotate-plugin";
import { MarkersPlugin } from "@photo-sphere-viewer/markers-plugin";
import "@photo-sphere-viewer/core/index.css";
import "@photo-sphere-viewer/markers-plugin/index.css";

import { VIEWER_LANG } from "@/components/tour/arrow";
import type { LotStatus } from "@/lib/app/lot-fields";
import type { PublicLot, PublicViewPanorama } from "@/lib/public/programme";
import { cn } from "@/lib/utils";
import { Maximize, Minimize } from "lucide-react";

import { lotTagElement } from "./lot-tag";
import { ViewerControls } from "./ViewerControls";
import { StatusLegend } from "./status";

/* A view of the programme shown as a 360° panorama (an aerial view above all):
   the visitor looks around, each lot carries its number in the colour of its
   status where it stands, a click opens its sheet. On the page and in the
   iframe the wheel and one finger keep scrolling the page (Ctrl + wheel or
   two fingers turn); in presentation mode everything turns the view.
   Loaded on demand (the viewer weighs its own). */

const LANG = { ...VIEWER_LANG, autorotate: "Rotation automatique" };

export default function AerialViewer({
  panorama,
  viewName,
  lots,
  currency,
  filter,
  highlight,
  selected = null,
  variant = "page",
  resetKey = 0,
  onOpen,
}: {
  panorama: PublicViewPanorama;
  viewName: string;
  lots: PublicLot[];
  currency: string;
  filter: LotStatus | null;
  highlight?: ReadonlySet<string>;
  selected?: string | null;
  variant?: "page" | "embed" | "presentation";
  resetKey?: number;
  onOpen: (lot: PublicLot, from: "plan" | "keyboard") => void;
}) {
  const large = variant === "presentation";
  const box = useRef<HTMLDivElement>(null);
  const container = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Viewer | null>(null);
  const [ready, setReady] = useState(false);
  const byId = useMemo(() => new Map(lots.map((l) => [l.id, l])), [lots]);
  const open = useRef(onOpen);
  open.current = onOpen;
  const lotsRef = useRef(byId);
  lotsRef.current = byId;
  // Large screens get the large panorama, phones the 4 096 px one.
  const [big] = useState(() => window.innerWidth * (window.devicePixelRatio || 1) > 1700);

  // One viewer; created a tick later (a viewer destroyed while loading blocks the next one).
  useEffect(() => {
    const element = container.current;
    if (!element) return;
    let viewer: Viewer | null = null;
    const timer = window.setTimeout(() => {
      viewer = new Viewer({
        container: element,
        panorama: big ? panorama.image.large : panorama.image.small,
        defaultYaw: panorama.startYaw,
        defaultPitch: panorama.startPitch,
        defaultZoomLvl: 0,
        // Our own buttons: the viewer's bar folded the zoom into a menu on narrow screens.
        navbar: false,
        lang: LANG,
        keyboard: large ? "always" : "fullscreen",
        mousewheelCtrlKey: !large,
        touchmoveTwoFingers: !large,
        plugins: [
          [MarkersPlugin, {}],
          [
            AutorotatePlugin,
            {
              autostartDelay: 6000,
              autostartOnIdle: true,
              autorotateSpeed: "0.4rpm",
              autorotatePitch: panorama.startPitch,
            },
          ],
        ],
      });
      viewerRef.current = viewer;
      viewer.addEventListener("ready", () => setReady(true), { once: true });
      viewer
        .getPlugin<MarkersPlugin>(MarkersPlugin)
        .addEventListener("select-marker", ({ marker }) => {
          const lot = lotsRef.current.get(String(marker.data));
          if (lot) open.current(lot, "plan");
        });
    });
    return () => {
      window.clearTimeout(timer);
      viewerRef.current = null;
      viewer?.destroy();
    };
    // One panorama per view: the component is keyed by view.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The lots, in the colour of their status; the filtered ones dimmed.
  const markerKey = panorama.markers
    .map((m) => {
      const lot = byId.get(m.lotId);
      return `${m.lotId}:${m.yaw}:${m.pitch}:${lot?.statut}:${lot?.prix}:${highlight?.has(m.lotId)}:${selected === m.lotId}`;
    })
    .join("|");
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || !ready) return;
    viewer.getPlugin<MarkersPlugin>(MarkersPlugin).setMarkers(
      panorama.markers.flatMap((m) => {
        const lot = byId.get(m.lotId);
        if (!lot) return [];
        return [
          {
            id: `lot-${m.lotId}`,
            position: { yaw: m.yaw, pitch: m.pitch },
            element: lotTagElement(lot, {
              currency,
              large,
              dim: filter !== null && lot.statut !== filter,
              active: selected === lot.id || Boolean(highlight?.has(lot.id)),
            }),
            anchor: "bottom center",
            data: lot.id,
          },
        ];
      }),
    );
    // markerKey sums up the markers.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, markerKey, filter, currency, large]);

  const [full, setFull] = useState(false);
  useEffect(() => {
    const sync = () => setFull(document.fullscreenElement === box.current);
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);
  const canFull = typeof document !== "undefined" && document.fullscreenEnabled && !large;
  const toggleFull = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void box.current?.requestFullscreen().catch(() => undefined);
  };

  // Presentation left idle: back to the first direction.
  useEffect(() => {
    if (!resetKey) return;
    viewerRef.current?.animate({
      yaw: panorama.startYaw,
      pitch: panorama.startPitch,
      zoom: 0,
      speed: "4rpm",
    });
  }, [resetKey, panorama.startYaw, panorama.startPitch]);

  return (
    <div className={large ? "flex min-h-0 flex-1 flex-col gap-3" : "space-y-3"}>
      <div
        ref={box}
        className={cn(
          "relative w-full overflow-hidden rounded-2xl border border-white/10 bg-black [&_.psv-container]:[background:#000]!",
          full
            ? "h-full rounded-none"
            : large
              ? "min-h-0 flex-1"
              : "aspect-[16/10] max-h-[78svh] sm:aspect-[16/9]",
        )}
      >
        <div
          ref={container}
          role="region"
          aria-roledescription="vue 360°"
          aria-label={`${viewName} en 360°. ${panorama.markers.length} lots repérés.`}
          className="absolute inset-0"
        />
        <ViewerControls
          large={large}
          className={cn("absolute z-10", large ? "bottom-4 right-4" : "bottom-2.5 right-2.5")}
          onZoomIn={() => viewerRef.current?.zoomIn(20)}
          onZoomOut={() => viewerRef.current?.zoomOut(20)}
        >
          {canFull ? (
            <button
              type="button"
              onClick={toggleFull}
              aria-label={full ? "Quitter le plein écran" : "Plein écran"}
              className="grid size-9 place-items-center rounded-full transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            >
              {full ? (
                <Minimize className="size-4" aria-hidden />
              ) : (
                <Maximize className="size-4" aria-hidden />
              )}
            </button>
          ) : null}
        </ViewerControls>
      </div>
      <StatusLegend
        large={large}
        hint="Glissez pour regarder autour, Ctrl + molette pour zoomer, cliquez un lot pour sa fiche"
        touchHint={
          large
            ? "Glissez pour regarder autour · touchez un lot pour sa fiche"
            : "Deux doigts pour regarder autour · touchez un lot pour sa fiche"
        }
      />
    </div>
  );
}
