import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Viewer } from "@photo-sphere-viewer/core";
import { AutorotatePlugin } from "@photo-sphere-viewer/autorotate-plugin";
import { GyroscopePlugin } from "@photo-sphere-viewer/gyroscope-plugin";
import { MarkersPlugin } from "@photo-sphere-viewer/markers-plugin";
import "@photo-sphere-viewer/core/index.css";
import "@photo-sphere-viewer/markers-plugin/index.css";
import { CalendarCheck, Compass, Maximize, Minimize, Rotate3d, X } from "lucide-react";

import { arrowElement, viewerLang } from "@/components/tour/arrow";
import { useCopy } from "@/lib/i18n";
import { floorText, useLocale } from "@/lib/public/i18n";
import type { PublicRoom, PublicTour } from "@/lib/public/programme";
import { cn } from "@/lib/utils";
import { RevBadge } from "./Common";
import { ViewerControls } from "./ViewerControls";

/* 360° tour of the public pages: the panorama of a room, the arrows placed by
   the promoter to go to the next room, a strip of the rooms, a slow rotation
   when nobody touches it, the gyroscope on phones, and the visit request.
   Full screen (TourViewer), or inside the page next to the sales plan
   (TourInline), where the wheel and one finger keep scrolling the page.
   Loaded on demand (the viewer weighs its own). */

const COPY = {
  fr: {
    autorotate: "Rotation automatique",
    room: "Pièce",
    tour: "Visite 360°",
    roomOf: (n: number, total: number) => ` · pièce ${n} sur ${total}`,
    gyroscope: "Regarder en bougeant le téléphone",
    plan: "Planifier une visite",
    floors: "Étages",
    rooms: "Pièces de la visite",
    fullscreen: "Plein écran",
    exitFullscreen: "Quitter le plein écran",
    closeTour: "Fermer la visite",
    close: "Fermer",
    expand: "Ouvrir la visite en plein écran",
    loading: "Chargement de la visite…",
  },
  en: {
    autorotate: "Auto-rotation",
    room: "Room",
    tour: "360° tour",
    roomOf: (n: number, total: number) => ` · room ${n} of ${total}`,
    gyroscope: "Look around by moving your phone",
    plan: "Book a visit",
    floors: "Floors",
    rooms: "Rooms of the tour",
    fullscreen: "Full screen",
    exitFullscreen: "Exit full screen",
    closeTour: "Close the tour",
    close: "Close",
    expand: "Open the tour in full screen",
    loading: "Loading the tour…",
  },
};
// A click on − or + : a fifth of the zoom range.
const ZOOM_STEP = 20;

const control =
  "grid place-items-center rounded-full bg-black/55 text-white/90 backdrop-blur transition-colors hover:bg-black/80 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70";

function TourStage({
  tour,
  startRoomId,
  variant,
  inline,
  onPlan,
  Title,
  actions,
  onRoomChange,
}: {
  tour: PublicTour;
  startRoomId?: string | undefined;
  variant: "page" | "embed" | "presentation";
  inline: boolean;
  onPlan: (() => void) | null;
  Title: ElementType;
  /** Buttons at the top right (full screen, close…). */
  actions: ReactNode;
  onRoomChange?: ((id: string) => void) | undefined;
}) {
  const large = variant === "presentation";
  const locale = useLocale();
  const copy = COPY[locale];
  // The dialog puts its content in the page after its first render: the viewer waits for it.
  const [element, setElement] = useState<HTMLDivElement | null>(null);
  const viewerRef = useRef<Viewer | null>(null);
  const [roomId, setRoomId] = useState(
    tour.rooms.some((r) => r.id === startRoomId)
      ? (startRoomId as string)
      : (tour.rooms[0]?.id ?? ""),
  );
  const [shown, setShown] = useState<string | null>(null);
  // Phones: look around by moving the phone (null where it is not available).
  const [gyro, setGyro] = useState<"on" | "off" | null>(null);
  const room = tour.rooms.find((r) => r.id === roomId) ?? tour.rooms[0];
  const names = new Map(tour.rooms.map((r) => [r.id, r.name]));
  // Large screens get the large panoramas, phones (and the page) the 4 096 px ones.
  const [big] = useState(
    () => !inline && window.innerWidth * (window.devicePixelRatio || 1) > 1700,
  );
  const src = (r: PublicRoom) => (big ? r.image.large : r.image.small);

  const onRoomChangeRef = useRef(onRoomChange);
  onRoomChangeRef.current = onRoomChange;
  useEffect(() => {
    if (room) onRoomChangeRef.current?.(room.id);
  }, [room]);

  // Floors of the tour: tabs, each listing its rooms; the tab follows the room shown.
  const floors = [...new Set(tour.rooms.flatMap((r) => (r.level === null ? [] : [r.level])))].sort(
    (a, b) => a - b,
  );
  const byFloor = floors.length > 1;
  const roomFloor = room?.level ?? null;
  const [floor, setFloor] = useState<number | null>(roomFloor);
  useEffect(() => {
    setFloor(roomFloor);
  }, [roomFloor]);
  const listed = byFloor ? tour.rooms.filter((r) => r.level === floor) : tour.rooms;
  const others = byFloor ? tour.rooms.filter((r) => r.level === null) : [];
  // An arrow to another floor says which one.
  const arrowLabel = (toId: string) => {
    const target = tour.rooms.find((r) => r.id === toId);
    if (!target) return copy.room;
    return byFloor && target.level !== null && target.level !== roomFloor
      ? `${floorText(target.level, locale)} · ${target.name}`
      : target.name;
  };

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
        // Our own zoom buttons: the viewer's bar folded the zoom into a menu on narrow screens.
        navbar: false,
        lang: { ...viewerLang(locale), autorotate: copy.autorotate, gyroscope: "Gyroscope" },
        keyboard: inline ? "fullscreen" : "always",
        // In the page, the wheel scrolls (Ctrl zooms) and one finger scrolls too.
        mousewheelCtrlKey: inline,
        touchmoveTwoFingers: inline,
        plugins: [
          [MarkersPlugin, {}],
          [
            AutorotatePlugin,
            {
              autostartDelay: inline ? 6000 : 4000,
              autostartOnIdle: true,
              autorotateSpeed: "0.6rpm",
              autorotatePitch: room.startPitch,
            },
          ],
          ...(inline ? [] : [[GyroscopePlugin, {}] as [typeof GyroscopePlugin, object]]),
        ],
      });
      viewerRef.current = viewer;
      viewer.addEventListener("ready", () => setShown(room.id), { once: true });
      if (!inline) {
        const gyroscope = viewer.getPlugin<GyroscopePlugin>(GyroscopePlugin);
        void gyroscope.isSupported().then((ok) => setGyro(ok ? "off" : null));
        gyroscope.addEventListener("gyroscope-updated", ({ gyroscopeEnabled }) =>
          setGyro(gyroscopeEnabled ? "on" : "off"),
        );
      }
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
        element: arrowElement(arrowLabel(l.toId)),
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

  const index = tour.rooms.findIndex((r) => r.id === room?.id);

  return (
    <>
      <div ref={setElement} className="absolute inset-0" />

      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 flex items-start gap-3 bg-gradient-to-b from-black/75 to-transparent",
          inline ? "p-3 pb-10 sm:p-4 sm:pb-12" : "p-4 pb-12 sm:p-6 sm:pb-16",
        )}
      >
        <div className="min-w-0">
          <Title
            className={cn(
              "font-brand font-medium tracking-tight",
              large ? "text-3xl" : inline ? "text-base sm:text-lg" : "text-xl sm:text-2xl",
            )}
          >
            {room?.name}
          </Title>
          <p
            className={cn(
              "mt-0.5 text-white/65",
              large ? "text-base" : inline ? "text-[11px] sm:text-xs" : "text-xs sm:text-sm",
            )}
          >
            {copy.tour} · {tour.label}
            {tour.rooms.length > 1 ? copy.roomOf(index + 1, tour.rooms.length) : ""}
          </p>
        </div>
        <div className="pointer-events-auto ml-auto flex items-center gap-2">
          <ViewerControls
            large={large}
            className={inline ? "hidden sm:flex" : undefined}
            onZoomIn={() => viewerRef.current?.zoomIn(ZOOM_STEP)}
            onZoomOut={() => viewerRef.current?.zoomOut(ZOOM_STEP)}
          >
            {gyro ? (
              <button
                type="button"
                aria-pressed={gyro === "on"}
                aria-label={copy.gyroscope}
                onClick={() =>
                  viewerRef.current?.getPlugin<GyroscopePlugin>(GyroscopePlugin).toggle()
                }
                className={cn(
                  "grid size-9 place-items-center rounded-full transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70",
                  gyro === "on" && "bg-white/20",
                )}
              >
                <Compass className="size-4" aria-hidden />
              </button>
            ) : null}
          </ViewerControls>
          {actions}
        </div>
      </div>

      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 flex flex-col",
          inline ? "bottom-10 gap-2 px-3 pb-1" : "bottom-10 gap-3 p-4 sm:bottom-12 sm:p-6",
        )}
      >
        {onPlan ? (
          <button
            type="button"
            onClick={onPlan}
            className={cn(
              "pointer-events-auto inline-flex items-center justify-center gap-2 self-center rounded-full bg-[color:var(--brand)] font-medium text-[color:var(--brand-contrast)] shadow-xl transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 sm:self-end",
              inline ? "h-10 px-4 text-xs" : "h-12 px-6 text-sm",
            )}
          >
            <CalendarCheck className="size-4" aria-hidden />
            {copy.plan}
          </button>
        ) : null}
        {byFloor ? (
          <div
            role="group"
            aria-label={copy.floors}
            className="pointer-events-auto flex gap-1.5 self-start rounded-full bg-black/55 p-1 backdrop-blur"
          >
            {floors.map((f) => {
              const active = f === floor;
              const count = tour.rooms.filter((r) => r.level === f).length;
              return (
                <button
                  key={f}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    setFloor(f);
                    // The floor opens on its first room.
                    if (room?.level !== f) {
                      const first = tour.rooms.find((r) => r.level === f);
                      if (first) go.current(first.id);
                    }
                  }}
                  className={cn(
                    "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70",
                    large
                      ? "h-11 px-5 text-base"
                      : inline
                        ? "h-7 px-3 text-[11px]"
                        : "h-9 px-4 text-sm",
                    active
                      ? "bg-white text-black"
                      : "text-white/80 hover:bg-white/10 hover:text-white",
                  )}
                >
                  {floorText(f, locale)}
                  <span className={cn("tabular-nums", active ? "text-black/50" : "text-white/45")}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        ) : null}
        {tour.rooms.length > 1 ? (
          <ol
            aria-label={copy.rooms}
            className="pointer-events-auto flex gap-2 overflow-x-auto pb-1"
          >
            {[...listed, ...others].map((r) => {
              const active = r.id === room?.id;
              return (
                <li key={r.id} className="shrink-0">
                  {inline ? (
                    // In the page: the names only, the panorama stays in sight.
                    <button
                      type="button"
                      onClick={() => go.current(r.id)}
                      aria-current={active ? "true" : undefined}
                      className={cn(
                        "inline-flex h-7 items-center whitespace-nowrap rounded-full border px-3 text-[11px] font-medium backdrop-blur transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70",
                        active
                          ? "border-[color:var(--brand)] bg-[color:var(--brand)] text-[color:var(--brand-contrast)]"
                          : "border-white/20 bg-black/55 text-white/85 hover:border-white/50",
                      )}
                    >
                      {r.name}
                    </button>
                  ) : (
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
                          "block truncate px-2 py-1 font-medium",
                          large ? "text-sm" : "text-[11px] sm:text-xs",
                        )}
                      >
                        {r.name}
                      </span>
                    </button>
                  )}
                </li>
              );
            })}
          </ol>
        ) : null}
      </div>
    </>
  );
}

/** Full screen. */
export default function TourViewer({
  tour,
  startRoomId,
  onClose,
  onPlan,
  variant = "page",
}: {
  tour: PublicTour;
  startRoomId?: string | undefined;
  onClose: () => void;
  /** Visit request (the lot's form, or the page's); null in presentation mode. */
  onPlan: (() => void) | null;
  variant?: "page" | "embed" | "presentation";
}) {
  const large = variant === "presentation";
  const copy = useCopy(COPY);
  const box = useRef<HTMLDivElement>(null);
  const [full, setFull] = useState(false);

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
          <TourStage
            tour={tour}
            startRoomId={startRoomId}
            variant={variant}
            inline={false}
            onPlan={onPlan}
            Title={DialogPrimitive.Title}
            actions={
              <>
                <RevBadge size="sm" className="mr-1 hidden sm:inline-flex" />
                {canFull && !large ? (
                  <button
                    type="button"
                    onClick={toggleFull}
                    className={cn(control, "size-11")}
                    aria-label={full ? copy.exitFullscreen : copy.fullscreen}
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
                  aria-label={copy.closeTour}
                >
                  <X className="size-5" aria-hidden />
                  {large ? <span className="flex">{copy.close}</span> : null}
                </DialogPrimitive.Close>
              </>
            }
          />
          {/* Phones: the logo under the title, the top bar being narrow. */}
          <RevBadge size="sm" className="absolute left-4 top-[5.25rem] sm:hidden" />
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

/** Inside the page: the viewer starts once the box comes into sight; full screen opens the tour where it is. */
export function TourInline({
  tour,
  onPlan,
  onExpand,
  variant = "page",
  className,
}: {
  tour: PublicTour;
  onPlan: (() => void) | null;
  onExpand: (roomId: string) => void;
  variant?: "page" | "embed" | "presentation";
  className?: string;
}) {
  const copy = useCopy(COPY);
  const box = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  const current = useRef(tour.rooms[0]?.id ?? "");
  useEffect(() => {
    const el = box.current;
    if (!el || near) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) setNear(true);
      },
      { rootMargin: "300px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [near]);
  const first = tour.rooms[0];

  return (
    <div
      ref={box}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/10 bg-black text-white [&_.psv-container]:[background:#000]!",
        className,
      )}
    >
      {near ? (
        <TourStage
          tour={tour}
          variant={variant}
          inline
          onPlan={onPlan}
          Title="h3"
          onRoomChange={(id) => {
            current.current = id;
          }}
          actions={
            <button
              type="button"
              onClick={() => onExpand(current.current)}
              className={cn(control, "size-10")}
              aria-label={copy.expand}
            >
              <Maximize className="size-4" aria-hidden />
            </button>
          }
        />
      ) : first ? (
        <>
          <img
            src={first.image.thumb}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-70"
          />
          <span className="absolute inset-0 grid place-items-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-black/60 px-4 py-2 text-sm backdrop-blur">
              <Rotate3d className="size-4" aria-hidden />
              {copy.loading}
            </span>
          </span>
        </>
      ) : null}
    </div>
  );
}
