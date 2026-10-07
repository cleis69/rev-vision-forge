import { useRouterState } from "@tanstack/react-router";

import { SITE_URL } from "./contact";

/**
 * Two languages: French at the root, English under /en with translated slugs.
 * Every component keeps its own copy as `{ fr, en }` and reads the active
 * locale from the URL, so prerendered pages are correct without any state.
 */
export type Locale = "fr" | "en";

export const PAGES = {
  home: { fr: "/", en: "/en" },
  services: { fr: "/services", en: "/en/services" },
  agent: { fr: "/agent-ia", en: "/en/ai-agent" },
  pricing: { fr: "/tarifs", en: "/en/pricing" },
  portfolio: { fr: "/portfolio", en: "/en/portfolio" },
  cases: { fr: "/case-studies", en: "/en/case-studies" },
  about: { fr: "/about", en: "/en/about" },
  insights: { fr: "/insights", en: "/en/insights" },
  contact: { fr: "/contact", en: "/en/contact" },
  notFound: { fr: "/404", en: "/en/404" },
} as const satisfies Record<string, Record<Locale, string>>;

export type PageKey = keyof typeof PAGES;

/**
 * Pages built but not public yet: no link to them anywhere, out of the sitemap,
 * noindex, and behind a password on the live site (deploy/worker.js).
 * To publish one, remove it here, in vite.config.ts and in the Worker.
 */
export const PRIVATE_PAGES: readonly PageKey[] = ["agent"];
export const isPublic = (page: PageKey) => !PRIVATE_PAGES.includes(page);

const trim = (p: string) => (p.length > 1 ? p.replace(/\/+$/, "") : p);

export function localeFromPath(pathname: string): Locale {
  const p = trim(pathname);
  return p === "/en" || p.startsWith("/en/") ? "en" : "fr";
}

export function useLocale(): Locale {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return localeFromPath(pathname);
}

/** Pick the copy for the active locale. */
export function useCopy<T>(copy: Record<Locale, T>): T {
  return copy[useLocale()];
}

/** Path of a page in a locale, e.g. href("pricing", "en") → "/en/pricing". */
export function href(page: PageKey, locale: Locale): string {
  return PAGES[page][locale];
}

/** Same page in the other language (falls back to that language's home). */
export function alternatePath(pathname: string, target: Locale): string {
  const p = trim(pathname);
  for (const paths of Object.values(PAGES)) {
    if (paths.fr === p || paths.en === p) return paths[target];
  }
  return PAGES.home[target];
}

const OG_LOCALE: Record<Locale, string> = { fr: "fr_FR", en: "en_GB" };

/** <head> entries shared by every page: title, description, canonical, hreflang. */
export function pageHead(
  page: PageKey,
  locale: Locale,
  { title, description }: { title: string; description: string },
) {
  const url = (l: Locale) => `${SITE_URL}${PAGES[page][l] === "/" ? "/" : PAGES[page][l]}`;
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: url(locale) },
      { property: "og:locale", content: OG_LOCALE[locale] },
      { property: "og:locale:alternate", content: OG_LOCALE[locale === "fr" ? "en" : "fr"] },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "canonical", href: url(locale) },
      { rel: "alternate", hrefLang: "fr", href: url("fr") },
      { rel: "alternate", hrefLang: "en", href: url("en") },
      { rel: "alternate", hrefLang: "x-default", href: url("fr") },
    ],
  };
}

/** FAQPage structured data, as a <head> script entry. */
export function faqJsonLd(items: { q: string; a: string }[]) {
  return {
    type: "application/ld+json",
    children: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: items.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    }),
  };
}

/**
 * Translator for components whose copy is written in French: English strings
 * are looked up by their French source. Missing entries fall back to French
 * and are reported in development.
 */
export function useTr(en: Record<string, string>) {
  const locale = useLocale();
  return (fr: string): string => {
    if (locale === "fr") return fr;
    const out = en[fr];
    if (out === undefined && import.meta.env.DEV) console.warn("[i18n] missing EN:", fr);
    return out ?? fr;
  };
}
