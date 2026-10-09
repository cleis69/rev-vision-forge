import type { PublicLot } from "@/lib/public/programme";
import { statusAndPrice } from "./status";

/* Marker of a lot on a 360° view of the programme: its number in the colour
   of its status, on a short stem pointing at the lot, and on hover its type,
   status and price. A plain DOM element, as the viewer's markers expect; the
   texts are user text, set as text only. */

export function lotTagElement(
  lot: PublicLot,
  {
    currency,
    dim = false,
    active = false,
    large = false,
  }: { currency: string; dim?: boolean; active?: boolean; large?: boolean },
): HTMLElement {
  const root = document.createElement("div");
  root.className = [
    "group relative flex cursor-pointer flex-col items-center transition-opacity",
    dim ? "opacity-30" : "",
  ].join(" ");

  const tag = document.createElement("div");
  tag.className = [
    "whitespace-nowrap rounded-md font-semibold tabular-nums leading-none shadow-[0_4px_14px_rgba(0,0,0,0.5)] ring-2 transition-transform duration-150 group-hover:scale-110",
    large ? "px-3 py-1.5 text-base" : "px-2 py-1 text-xs",
    lot.statut === "disponible"
      ? "bg-[color:var(--brand)] text-[color:var(--brand-contrast)]"
      : lot.statut === "reservee"
        ? "bg-amber-400 text-black"
        : "bg-zinc-700 text-white/80",
    active ? "ring-white" : "ring-black/30",
  ].join(" ");
  tag.textContent = lot.numero;

  const stem = document.createElement("div");
  stem.className = ["w-0.5 bg-white/80 shadow", large ? "h-5" : "h-4"].join(" ");
  const dot = document.createElement("div");
  dot.className = "size-2 rounded-full border-2 border-white bg-black/60";

  const card = document.createElement("div");
  card.className = [
    "pointer-events-none absolute bottom-full left-1/2 mb-2 hidden w-max max-w-56 -translate-x-1/2 rounded-xl border border-white/10 bg-black/85 px-3 py-2 text-left text-xs text-white shadow-xl backdrop-blur group-hover:block",
    active ? "block" : "",
  ].join(" ");
  const title = document.createElement("p");
  title.className = "font-semibold";
  title.textContent = `Lot ${lot.numero}${lot.type ? ` · ${lot.type}` : ""}`;
  const detail = document.createElement("p");
  detail.className = "mt-0.5 text-white/70";
  detail.textContent = statusAndPrice(lot, currency);
  card.append(title, detail);

  root.append(card, tag, stem, dot);
  return root;
}
