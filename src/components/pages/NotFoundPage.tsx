import { Link } from "@tanstack/react-router";

import { href, useLocale, type Locale } from "@/lib/i18n";

const COPY = {
  fr: {
    title: "Page introuvable — REV",
    eyebrow: "Erreur 404",
    heading: "Cette page n'existe pas.",
    body: "Le lien est peut-être ancien ou mal copié. Repartez de l'accueil ou écrivez-nous.",
    home: "Retour à l'accueil",
    contact: "Nous contacter",
  },
  en: {
    title: "Page not found — REV",
    eyebrow: "Error 404",
    heading: "This page doesn't exist.",
    body: "The link may be out of date or mistyped. Head back to the home page or get in touch.",
    home: "Back to home",
    contact: "Contact us",
  },
} as const;

export const notFoundHead = (locale: Locale) => ({
  meta: [{ title: COPY[locale].title }, { name: "robots", content: "noindex" }],
});

export function NotFoundPage() {
  const locale = useLocale();
  const copy = COPY[locale];
  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 pt-24">
      <div className="max-w-md text-center">
        <p className="text-[11px] uppercase tracking-[0.22em] text-primary">{copy.eyebrow}</p>
        <h1 className="mt-5 font-display text-4xl font-medium tracking-[-0.03em] md:text-5xl">
          {copy.heading}
        </h1>
        <p className="mt-4 text-muted-foreground">{copy.body}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to={href("home", locale) as never}
            className="inline-flex h-12 items-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            {copy.home}
          </Link>
          <Link
            to={href("contact", locale) as never}
            className="inline-flex h-12 items-center rounded-lg border border-border px-6 text-sm font-medium transition-colors hover:border-foreground/30"
          >
            {copy.contact}
          </Link>
        </div>
      </div>
    </div>
  );
}
