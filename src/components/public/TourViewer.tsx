import { useEffect, useRef, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Viewer } from "@photo-sphere-viewer/core";
import { AutorotatePlugin } from "@photo-sphere-viewer/autorotate-plugin";
import { GyroscopePlugin } from "@photo-sphere-viewer/gyroscope-plugin";
import { MarkersPlugin } from "@photo-sphere-viewer/markers-plugin";
import "@photo-sphere-viewer/core/index.css";
import "@photo-sphere-viewer/markers-plugin/index.css";
import { CalendarCheck, Maximize, Minimize, X } from "lucide-react";

import { arrowElement, VIEWER_LANG } from "@/components/tour/arrow";
import type { PublicRoom, PublicTour } from "@/lib/public/programme";
import { cn } from "@/lib/utils";
import { RevBadge } from "./Common";

/* 360° tour of the public pages, full screen: the panorama of a room, the
   arrows placed by the promoter to go to the next room, a strip of the rooms,
   a slow rotation when nobody touches it, the gyroscope on phones, and the
   visit request. Loaded on demand (the viewer weighs its own). */

const LANG = { ...VIEWER_LANG, autorotate: "Rotation automatique", gyroscope: "Gyroscope" };

export default function TourViewer({
  tour,
  onClose,
  onPlan,
  variant = "page",
}: {
  tour: PublicTour;
  onClose: () => void;
  /** Visit request (the lot's form, or the page's); null in presentation mode. */
  onPlan: (() => void) | null;
  variant?: "page" | "embed" | "presentation";
}) {
  const large = variant === "presentation";
  const box = useRef<HTMLDivElement>(null);
  // The dialog puts its content in the page after its first render: the viewer waits for it.
  const [element, setElement] = useState<HTMLDivElement | null>(null);
  const viewerRef = useRef<Viewer | null>(null);
  const [roomId, setRoomId] = useState(tour.rooms[0]?.id ?? "");
  const [shown, setShown] = useState<string | null>(null);
  const [full, setFull] = useState(false);
  const room = tour.rooms.find((r) => r.id === roomId) ?? tour.rooms[0];
  const names = new Map(tour.rooms.map((r) => [r.id, r.name]));
  // Large screens get the 8 192 px panoramas, phones the 4 096 px ones.
  const [big] = useState(() => window.innerWidth * (window.devicePixelRatio || 1) > 1700);
  const src = (r: PublicRoom) => (big ? r.image.large : r.image.small);

  const go = useRef<(id: string) => void>(() => {});
  go.current = (id) => {
    if (names.has(id)) setRoomId(id);
  };

  // One viewer; created a tick later (a viewer destroyed while loading blocks the next one).
  useEffect(() => {
    if (!element || !room) return;
    let viewer: Viewer | null = null;
    const timer = window.setTimeout(() => {
      viewer = new Viewer({
        container: element,
        panorama: src(room),
        defaultYaw: room.startYaw,
        defaultPitch: room.startPitch,
        defaultZoomLvl: 0,
        navbar: ["autorotate", "zoom", "gyroscope"],
        lang: LANG,
        keyboard: "always",
        mousewheelCtrlKey: false,
        touchmoveTwoFingers: false,
        plugins: [
          [MarkersPlugin, {}],
          [
            AutorotatePlugin,
            {
              autostartDelay: 4000,
              autostartOnIdle: true,
              autorotateSpeed: "0.6rpm",
              autorotatePitch: room.startPitch,
            },
          ],
          [GyroscopePlugin, {}],
        ],
      });
      viewerRef.current = viewer;
      viewer.addEventListener("ready", () => setShown(room.id), { once: true });
      viewer
        .getPlugin<MarkersPlugin>(MarkersPlugin)
        .addEventListener("select-marker", ({ marker }) => go.current(String(marker.data)));
    });
    return () => {
      window.clearTimeout(timer);
      viewerRef.current = null;
      viewer?.destroy();
    };
    // The first room only: the next ones go through setPanorama below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [element]);

  // Another room: a fade, looking where the promoter chose.
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || !room || shown === null || shown === room.id) return;
    let cancelled = false;
    viewer.getPlugin<MarkersPlugin>(MarkersPlugin).clearMarkers();
    viewer
      .setPanorama(src(room), {
        position: { yaw: room.startYaw, pitch: room.startPitch },
        zoom: 0,
        transition: { speed: 1100, rotation: false, effect: "fade" },
      })
      .then(() => !cancelled && setShown(room.id))
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room?.id]);

  // The arrows of the room shown, and the rooms they lead to loaded in advance.
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || !room || shown !== room.id) return;
    viewer.getPlugin<MarkersPlugin>(MarkersPlugin).setMarkers(
      room.links.map((l, i) => ({
        id: `${room.id}-${i}`,
        position: { yaw: l.yaw, pitch: l.pitch },
        element: arrowElement(names.get(l.toId) ?? "Pièce"),
        anchor: "center center",
        data: l.toId,
      })),
    );
    for (const l of room.links) {
      const next = tour.rooms.find((r) => r.id === l.toId);
      if (next) new Image().src = src(next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shown, room?.id]);

  useEffect(() => {
    const sync = () => setFull(document.fullscreenElement === box.current);
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);
  const canFull = typeof document !== "undefined" && document.fullscreenEnabled;
  const toggleFull = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void box.current?.requestFullscreen().catch(() => undefined);
  };

  const control =
    "grid place-items-center rounded-full bg-black/55 text-white/90 backdrop-blur transition-colors hover:bg-black/80 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70";

  return (
    <DialogPrimitive.Root open onOpenChange={(open) => !open && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[70] bg-black" />
        <DialogPrimitive.Content
          ref={box}
          aria-describedby={undefined}
          className="fixed inset-0 z-[70] bg-black text-white outline-none [&_.psv-container]:[background:#000]!"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div ref={setElement} className="absolute inset-0" />

          <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start gap-3 bg-gradient-to-b from-black/75 to-transparent p-4 pb-12 sm:p-6 sm:pb-16">
            <div className="min-w-0">
              <DialogPrimitive.Title
                className={cn(
                  "font-brand font-medium tracking-tight",
                  large ? "text-3xl" : "text-xl sm:text-2xl",
                )}
              >
                {room?.name}
              </DialogPrimitive.Title>
              <p className={cn("mt-1 text-white/65", large ? "text-base" : "text-xs sm:text-sm")}>
                Visite 360° · {tour.label}
                {tour.rooms.length > 1
                  ? ` · pièce ${tour.rooms.findIndex((r) => r.id === room?.id) + 1} sur ${tour.rooms.length}`
                  : ""}
              </p>
            </div>
            <div className="pointer-events-auto ml-auto flex items-center gap-2">
              <RevBadge size="sm" className="mr-1 hidden sm:inline-flex" />
              {canFull && !large ? (
                <button
                  type="button"
                  onClick={toggleFull}
                  className={cn(control, "size-11")}
                  aria-label={full ? "Quitter le plein écran" : "Plein écran"}
                >
                  {full ? (
                    <Minimize className="size-5" aria-hidden />
                  ) : (
                    <Maximize className="size-5" aria-hidden />
                  )}
                </button>
              ) : null}
              <DialogPrimitive.Close
                className={cn(control, large ? "h-12 gap-2 px-5 text-base" : "size-11")}
                aria-label="Fermer la visite"
              >
                <X className="size-5" aria-hidden />
                {large ? <span className="flex">Fermer</span> : null}
              </DialogPrimitive.Close>
            </div>
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-10 flex flex-col gap-3 p-4 sm:bottom-12 sm:p-6">
            {onPlan ? (
              <button
                type="button"
                onClick={onPlan}
                className="pointer-events-auto inline-flex h-12 items-center justify-center gap-2 self-center rounded-full bg-[color:var(--brand)] px-6 text-sm font-medium text-[color:var(--brand-contrast)] shadow-xl transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 sm:self-end"
              >
                <CalendarCheck className="size-4" aria-hidden />
                Planifier une visite
              </button>
            ) : null}
            {tour.rooms.length > 1 ? (
              <ol
                aria-label="Pièces de la visite"
                className="pointer-events-auto flex gap-2 overflow-x-auto pb-1"
              >
                {tour.rooms.map((r) => {
                  const active = r.id === room?.id;
                  return (
                    <li key={r.id} className="shrink-0">
                      <button
                        type="button"
                        onClick={() => go.current(r.id)}
                        aria-current={active ? "true" : undefined}
                        className={cn(
                          "block overflow-hidden rounded-xl border-2 bg-black/50 text-left backdrop-blur transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70",
                          large ? "w-44" : "w-28 sm:w-36",
                          active
                            ? "border-[color:var(--brand)]"
                            : "border-transparent hover:border-white/40",
                        )}
                      >
                        <img
                          src={r.image.thumb}
                          alt=""
                          className="aspect-[2/1] w-full object-cover"
                          loading="lazy"
                        />
                        <span
                          className={cn(
                            "block truncate px-2 py-1.5 font-medium",
                            large ? "text-sm" : "text-[11px] sm:text-xs",
                          )}
                        >
                          {r.name}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            ) : null}
          </div>

          {/* Phones: the logo under the title, the top bar being narrow. */}
          <RevBadge size="sm" className="absolute left-4 top-[5.25rem] sm:hidden" />
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
