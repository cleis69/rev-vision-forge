import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";

import { alternatePath, href, isPublic, localeFromPath, type Locale, type PageKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Container } from "./ui";
import { RevLogo } from "./Logo";

const ALL_NAV: { page: PageKey; label: Record<Locale, string> }[] = [
  { page: "home", label: { fr: "Accueil", en: "Home" } },
  { page: "services", label: { fr: "Expertises", en: "Services" } },
  { page: "agent", label: { fr: "Agent IA", en: "AI agent" } },
  { page: "pricing", label: { fr: "Tarifs", en: "Pricing" } },
  { page: "portfolio", label: { fr: "Portfolio", en: "Portfolio" } },
  { page: "cases", label: { fr: "Études de cas", en: "Case studies" } },
  { page: "about", label: { fr: "À propos", en: "About" } },
];
const NAV = ALL_NAV.filter((item) => isPublic(item.page));

const COPY = {
  fr: { cta: "Prendre rendez-vous", open: "Ouvrir le menu", close: "Fermer le menu", nav: "Navigation principale", home: "Accueil" },
  en: { cta: "Book a call", open: "Open menu", close: "Close menu", nav: "Main navigation", home: "Home" },
} as const;

/** FR | EN switch that lands on the same page in the other language. */
export function LanguageSwitch({ className }: { className?: string }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const locale = localeFromPath(pathname);
  return (
    <div
      className={cn("inline-flex rounded-lg border border-border bg-card/60 p-0.5 text-[12px] font-medium", className)}
      role="group"
      aria-label={locale === "fr" ? "Langue" : "Language"}
    >
      {(["fr", "en"] as const).map((l) => (
        <Link
          key={l}
          to={alternatePath(pathname, l) as never}
          hrefLang={l}
          lang={l}
          aria-current={l === locale ? "true" : undefined}
          className={cn(
            "rounded-md px-2.5 py-1.5 uppercase tracking-[0.08em] transition-colors",
            l === locale ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {l}
        </Link>
      ))}
    </div>
  );
}

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const locale = localeFromPath(pathname);
  const copy = COPY[locale];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled ? "glass border-b border-border/70 py-2" : "border-b border-transparent py-4",
      )}
    >
      <Container className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 lg:flex lg:justify-between lg:gap-4">
        <Link
          to={href("home", locale) as never}
          className="flex min-w-0 items-center"
          aria-label={`REV — Real Estate Vision, ${copy.home}`}
        >
          <RevLogo className="h-10 w-auto md:h-11" />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label={copy.nav}>
          {NAV.map((item) => (
            <Link
              key={item.page}
              to={href(item.page, locale) as never}
              activeOptions={{ exact: item.page === "home" }}
              activeProps={{ className: "text-foreground after:scale-x-100" }}
              inactiveProps={{ className: "text-muted-foreground" }}
              className="relative whitespace-nowrap rounded-lg px-2.5 py-2 text-[13px] transition-colors duration-300 hover:text-foreground xl:px-3.5 xl:text-sm after:absolute after:inset-x-2.5 xl:after:inset-x-3.5 after:bottom-1 after:h-px after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-[250ms] after:ease-[cubic-bezier(0.16,1,0.3,1)] after:content-[''] hover:after:scale-x-100"
            >
              {item.label[locale]}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <LanguageSwitch />
          <Link
            to={href("contact", locale) as never}
            className="inline-flex h-10 items-center whitespace-nowrap rounded-lg bg-primary px-4 text-[13px] font-medium text-primary-foreground transition-colors duration-300 hover:bg-primary-hover xl:px-5 xl:text-sm"
          >
            {copy.cta}
          </Link>
        </div>

        <LanguageSwitch className="lg:hidden" />

        <button
          type="button"
          aria-label={open ? copy.close : copy.open}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-border bg-card/60 lg:hidden"
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </Container>

      {open ? (
        <Container className="lg:hidden">
          <div className="mt-3 rounded-2xl border border-border bg-card p-3">
            {NAV.map((item) => (
              <Link
                key={item.page}
                to={href(item.page, locale) as never}
                onClick={() => setOpen(false)}
                className="block rounded-xl px-4 py-3 text-sm text-muted-foreground transition-colors hover:bg-elevated hover:text-foreground"
              >
                {item.label[locale]}
              </Link>
            ))}
            <Link
              to={href("contact", locale) as never}
              onClick={() => setOpen(false)}
              className="mt-2 flex h-11 items-center justify-center rounded-xl bg-primary text-sm font-medium text-primary-foreground"
            >
              {copy.cta}
            </Link>
          </div>
        </Container>
      ) : null}
    </header>
  );
}
