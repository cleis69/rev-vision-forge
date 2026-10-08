import { useEffect, useRef } from "react";
import { Map as MapLibreMap, Marker, NavigationControl, setWorkerUrl } from "maplibre-gl";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?url";
import "maplibre-gl/dist/maplibre-gl.css";

import { roundCoord, type Position } from "@/lib/location";

/* Map of a programme: OpenFreeMap tiles (OpenStreetMap data, free for
   commercial use, no key, no cookie), dark style, a pin in the promoter's
   colour. Loaded on demand (React.lazy): MapLibre is heavy. Read only on the
   public page, where the page keeps scrolling under one finger (two fingers,
   or Ctrl + wheel, move the map); editable in the Réglages tab. */

// Bundled with the app: MapLibre would look for it next to its own module.
setWorkerUrl(workerUrl);

const STYLE = "https://tiles.openfreemap.org/styles/dark";
const MOROCCO: [number, number] = [-7.09, 31.79];

const LOCALE = {
  "AttributionControl.ToggleAttribution": "Afficher les crédits",
  "Map.Title": "Carte",
  "Marker.Title": "Emplacement du programme",
  "NavigationControl.ResetBearing": "Remettre le nord en haut",
  "NavigationControl.ZoomIn": "Zoomer",
  "NavigationControl.ZoomOut": "Dézoomer",
  "CooperativeGesturesHandler.WindowsHelpText": "Ctrl + molette pour zoomer sur la carte",
  "CooperativeGesturesHandler.MacHelpText": "⌘ + molette pour zoomer sur la carte",
  "CooperativeGesturesHandler.MobileHelpText": "Deux doigts pour déplacer la carte",
};

function pin(color: string) {
  const el = document.createElement("div");
  el.innerHTML = `<svg width="34" height="44" viewBox="0 0 34 44" aria-hidden="true"><path d="M17 43C17 43 33 27.6 33 17A16 16 0 0 0 1 17C1 27.6 17 43 17 43Z" fill="${color}" stroke="#0a0a0a" stroke-width="2"/><circle cx="17" cy="17" r="6" fill="#0a0a0a"/></svg>`;
  el.style.cursor = "pointer";
  return el;
}

export default function ProgrammeMap({
  position,
  color,
  editable = false,
  focus = 0,
  onChange,
  className,
}: {
  position: Position | null;
  color: string;
  editable?: boolean;
  /** Changed by the caller to fly to `position` (after an address search). */
  focus?: number;
  onChange?: (position: Position) => void;
  className?: string;
}) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<MapLibreMap | null>(null);
  const marker = useRef<Marker | null>(null);
  const changed = useRef(onChange);
  changed.current = onChange;
  const start = useRef(position);

  useEffect(() => {
    const el = container.current;
    if (!el) return;
    const initial = start.current;
    const m = new MapLibreMap({
      container: el,
      style: STYLE,
      center: initial ? [initial.lng, initial.lat] : MOROCCO,
      zoom: initial ? 12 : 5,
      cooperativeGestures: !editable,
      attributionControl: { compact: true },
      locale: LOCALE,
      dragRotate: false,
      pitchWithRotate: false,
      touchPitch: false,
    });
    m.touchZoomRotate.disableRotation();
    m.addControl(new NavigationControl({ showCompass: false }), "top-right");
    if (editable) {
      m.on("click", (e) =>
        changed.current?.({ lat: roundCoord(e.lngLat.lat), lng: roundCoord(e.lngLat.lng) }),
      );
    }
    map.current = m;
    return () => {
      m.remove();
      map.current = null;
      marker.current = null;
    };
  }, [editable]);

  // The pin follows the position (and the colour of the brand).
  useEffect(() => {
    const m = map.current;
    if (!m) return;
    marker.current?.remove();
    marker.current = null;
    if (!position) return;
    const next = new Marker({ element: pin(color), anchor: "bottom", draggable: editable })
      .setLngLat([position.lng, position.lat])
      .addTo(m);
    if (editable) {
      next.on("dragend", () => {
        const p = next.getLngLat();
        changed.current?.({ lat: roundCoord(p.lat), lng: roundCoord(p.lng) });
      });
    }
    marker.current = next;
  }, [position, color, editable]);

  useEffect(() => {
    if (!focus || !position) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    map.current?.flyTo({ center: [position.lng, position.lat], zoom: 15, animate: !still });
    // Only a new search moves the map, not the pin being dragged.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focus]);

  // MapLibre's own CSS (loaded after ours) gives its container position: relative,
  // so the caller's layout classes go on a wrapper.
  return (
    <div className={className}>
      <div ref={container} className="h-full w-full" />
    </div>
  );
}
