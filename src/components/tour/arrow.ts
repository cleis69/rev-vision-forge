/* Arrow of a 360° tour, drawn in the panorama where the door to another room
   is: a round button and the name of that room. A plain DOM element, as the
   viewer's markers expect; the name is user text, set as text only. */

const ARROW_SVG =
  '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5"/><path d="m5 12 7-7 7 7"/></svg>';

export function arrowElement(name: string, { selected = false } = {}): HTMLElement {
  const root = document.createElement("div");
  root.className = "group relative grid size-12 cursor-pointer place-items-center";

  const button = document.createElement("div");
  button.className = [
    "grid size-12 place-items-center rounded-full border-2 text-white shadow-[0_6px_24px_rgba(0,0,0,0.45)] backdrop-blur-sm transition-transform duration-200 group-hover:scale-110",
    selected
      ? "border-[color:var(--brand,#c8a24a)] bg-[color:var(--brand,#c8a24a)]/80"
      : "border-white/90 bg-black/45",
  ].join(" ");
  button.innerHTML = ARROW_SVG;

  const label = document.createElement("div");
  label.className =
    "pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/65 px-3 py-1 text-xs font-medium text-white shadow-lg backdrop-blur-sm";
  label.textContent = name;

  root.append(button, label);
  return root;
}

/** Texts of the viewer, in French. */
export const VIEWER_LANG = {
  zoom: "Zoom",
  zoomOut: "Zoom arrière",
  zoomIn: "Zoom avant",
  moveUp: "Haut",
  moveDown: "Bas",
  moveLeft: "Gauche",
  moveRight: "Droite",
  description: "Description",
  download: "Télécharger",
  fullscreen: "Plein écran",
  loading: "Chargement du panorama…",
  menu: "Menu",
  close: "Fermer",
  twoFingers: "Utilisez deux doigts pour tourner",
  ctrlZoom: "Ctrl + molette pour zoomer",
  loadError: "Le panorama ne peut pas être chargé",
  webglError: "Votre navigateur ne prend pas en charge WebGL",
};
