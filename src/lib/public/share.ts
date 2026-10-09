import { toast } from "sonner";

import { track } from "./events";
import type { Locale } from "./i18n";
import type { PublicLot, PublicProgramme } from "./programme";

/* Link of a lot (/p/$slug/lot/$numero, /en/p/… in English), whose preview on
   WhatsApp shows the lot. */

export const lotUrl = (programme: PublicProgramme, lot: PublicLot, locale: Locale = "fr") =>
  `${window.location.origin}${locale === "en" ? "/en" : ""}/p/${programme.slug}/lot/${encodeURIComponent(lot.numero)}`;

export const lotTitle = (programme: PublicProgramme, lot: PublicLot) =>
  `Lot ${lot.numero}${lot.type ? ` · ${lot.type}` : ""} — ${programme.name}`;

export const whatsappShareUrl = (
  programme: PublicProgramme,
  lot: PublicLot,
  locale: Locale = "fr",
) =>
  `https://wa.me/?text=${encodeURIComponent(`${lotTitle(programme, lot)} ${lotUrl(programme, lot, locale)}`)}`;

/** Share sheet of the phone, else the link copied. */
export async function shareLot(
  programme: PublicProgramme,
  lot: PublicLot,
  tracked: boolean,
  locale: Locale = "fr",
) {
  const url = lotUrl(programme, lot, locale);
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
    toast.success(locale === "fr" ? "Lien du lot copié" : "Link to the lot copied");
  } catch {
    toast(url);
  }
}
