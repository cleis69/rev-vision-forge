import { toast } from "sonner";

import { track } from "./events";
import type { PublicLot, PublicProgramme } from "./programme";

/* Link of a lot (/p/$slug/lot/$numero), whose preview on WhatsApp shows the lot. */

export const lotUrl = (programme: PublicProgramme, lot: PublicLot) =>
  `${window.location.origin}/p/${programme.slug}/lot/${encodeURIComponent(lot.numero)}`;

export const lotTitle = (programme: PublicProgramme, lot: PublicLot) =>
  `Lot ${lot.numero}${lot.type ? ` · ${lot.type}` : ""} — ${programme.name}`;

export const whatsappShareUrl = (programme: PublicProgramme, lot: PublicLot) =>
  `https://wa.me/?text=${encodeURIComponent(`${lotTitle(programme, lot)} ${lotUrl(programme, lot)}`)}`;

/** Share sheet of the phone, else the link copied. */
export async function shareLot(programme: PublicProgramme, lot: PublicLot, tracked: boolean) {
  const url = lotUrl(programme, lot);
  if (tracked) track(programme.id, "partage", lot.id);
  if (typeof navigator.share === "function") {
    try {
      await navigator.share({ title: lotTitle(programme, lot), url });
    } catch {
      /* cancelled by the visitor */
    }
    return;
  }
  try {
    await navigator.clipboard.writeText(url);
    toast.success("Lien du lot copié");
  } catch {
    toast(url);
  }
}
