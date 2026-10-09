import type { LotStatus } from "@/lib/app/lot-fields";
import { formatPrice } from "@/lib/app/lot-format";
import { useLocale, type Locale } from "@/lib/i18n";
import { floorName, levelLabel } from "@/lib/views";

/* The public pages of the programmes in two languages, like the rest of REV:
   French under /p and /embed, English under /en/p and /en/embed. Components
   read the language from the address (useLocale) and keep their copy as
   { fr, en }; the promoter's own texts come from projects.translations
   (localizeData). */

export const PUBLIC_ROUTES = {
  fr: {
    programme: "/p/$slug",
    lot: "/p/$slug/lot/$numero",
    privacy: "/p/$slug/donnees-personnelles",
  },
  en: {
    programme: "/en/p/$slug",
    lot: "/en/p/$slug/lot/$numero",
    privacy: "/en/p/$slug/privacy",
  },
} as const;

export type PublicRoutes = (typeof PUBLIC_ROUTES)[Locale];

export const usePublicRoutes = (): PublicRoutes => PUBLIC_ROUTES[useLocale()];

/** Numbers, prices and dates of the pages: French or British English. */
export const NUMBER_LOCALE: Record<Locale, string> = { fr: "fr-FR", en: "en-GB" };

/** The same public page in the other language (/p/x/lot/A1 ↔ /en/p/x/lot/A1). */
export function publicPathIn(pathname: string, target: Locale): string {
  const path = pathname.replace(/^\/en(?=\/)/, "");
  const swapped =
    target === "en"
      ? path
          .replace(/\/donnees-personnelles\/?$/, "/privacy")
          .replace(/^\/embed\/visite\//, "/embed/tour/")
      : path
          .replace(/\/privacy\/?$/, "/donnees-personnelles")
          .replace(/^\/embed\/tour\//, "/embed/visite/");
  return target === "en" ? `/en${swapped}` : swapped;
}

export const STATUS_TEXT: Record<Locale, Record<LotStatus, string>> = {
  fr: { disponible: "Disponible", reservee: "Réservé", vendue: "Vendu" },
  en: { disponible: "Available", reservee: "Reserved", vendue: "Sold" },
};

/** For the filters: "Disponibles", "Réservés"… */
export const STATUS_PLURAL: Record<Locale, Record<LotStatus, string>> = {
  fr: { disponible: "Disponibles", reservee: "Réservés", vendue: "Vendus" },
  en: { disponible: "Available", reservee: "Reserved", vendue: "Sold" },
};

/** Floor of a lot, short: "RDC", "R+2", "R-1" / "Ground floor", "Floor 2", "Basement 1". */
export function levelText(level: number, locale: Locale): string {
  if (locale === "fr") return levelLabel(level);
  if (level === 0) return "Ground floor";
  return level < 0 ? `Basement ${-level}` : `Floor ${level}`;
}

/** Floor in words (floors of a 360° tour): "Rez-de-chaussée", "R+1" / "Ground floor", "Floor 1". */
export const floorText = (level: number, locale: Locale) =>
  locale === "fr" ? floorName(level) : levelText(level, locale);

/** Labels and formats of the public pages in the active language. */
export function usePublicText() {
  const locale = useLocale();
  return {
    locale,
    status: STATUS_TEXT[locale],
    statusPlural: STATUS_PLURAL[locale],
    onRequest: locale === "fr" ? "Prix sur demande" : "Price on request",
    price: (value: number, currency: string) => formatPrice(value, currency, locale),
    number: (value: number) => value.toLocaleString(NUMBER_LOCALE[locale]),
    level: (level: number) => levelText(level, locale),
    floor: (level: number) => floorText(level, locale),
  };
}

export { useLocale, type Locale };
