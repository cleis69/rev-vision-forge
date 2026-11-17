import { SITE_URL } from "./contact";
import { caseBySlug, casePath, type CaseSlug } from "./cases";
import { pageHead, type Locale } from "./i18n";

/** <head> of a case study: under the portfolio's addresses, plus its CreativeWork data. */
export function caseHead(slug: CaseSlug, locale: Locale) {
  const study = caseBySlug(slug);
  if (!study) return {};
  const text = study.copy[locale];
  const head = pageHead(
    "portfolio",
    locale,
    { title: text.seoTitle, description: text.seoDescription },
    `/${slug}`,
  );
  return {
    ...head,
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CreativeWork",
          name: text.title,
          description: text.seoDescription,
          url: `${SITE_URL}${casePath(slug, locale)}`,
          inLanguage: locale === "fr" ? "fr-FR" : "en-GB",
          dateCreated: study.year,
          creator: { "@type": "Organization", name: "REV — Real Estate Vision", url: SITE_URL },
          about: { "@type": "Organization", name: study.name, ...(study.website ? { url: study.website.href } : {}) },
        }),
      },
    ],
  };
}
