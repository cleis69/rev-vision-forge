import { ArrowUpRight, Mail, MessageCircle, Phone } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { Container, Cta } from "./ui";
import { WHATSAPP_DISPLAY, whatsappUrl } from "@/lib/contact";
import { href, isPublic, useLocale, type Locale, type PageKey } from "@/lib/i18n";
import { RevLogo } from "./Logo";
import { AgencyCredit } from "./AgencyCredit";

const ALL_NAV: { page: PageKey; label: Record<Locale, string> }[] = [
  { page: "home", label: { fr: "Accueil", en: "Home" } },
  { page: "services", label: { fr: "Expertises", en: "Services" } },
  { page: "salesPlan", label: { fr: "Plan de vente 3D", en: "3D sales plan" } },
  { page: "agent", label: { fr: "Agent IA", en: "AI agent" } },
  { page: "pricing", label: { fr: "Tarifs", en: "Pricing" } },
  { page: "portfolio", label: { fr: "Portfolio", en: "Portfolio" } },
  { page: "about", label: { fr: "À propos", en: "About" } },
  { page: "insights", label: { fr: "Insights", en: "Insights" } },
  { page: "contact", label: { fr: "Contact", en: "Contact" } },
];
const NAV = ALL_NAV.filter((item) => isPublic(item.page));

const COPY = {
  fr: {
    title: "Prêt à accélérer vos ventes immobilières ?",
    body: "Un appel de 30 minutes suffit pour cartographier votre stratégie de contenu, d'acquisition et d'automatisation.",
    primary: "Planifier un appel stratégique",
    secondary: "Découvrir nos réalisations",
    about:
      "Agence de croissance immobilière. Production visuelle premium, marketing stratégique, génération de leads et automatisation.",
    navTitle: "Navigation",
    navLabel: "Navigation du pied de page",
    contact: "Contact",
    rights: "Tous droits réservés.",
  },
  en: {
    title: "Ready to sell your properties faster?",
    body: "A 30-minute call is all it takes to map out your content, acquisition and automation strategy.",
    primary: "Book a strategy call",
    secondary: "See our work",
    about:
      "Real estate growth agency. Premium visual production, strategic marketing, lead generation and automation.",
    navTitle: "Navigation",
    navLabel: "Footer navigation",
    contact: "Contact",
    rights: "All rights reserved.",
  },
} as const;

export function FinalCta() {
  const locale = useLocale();
  const copy = COPY[locale];
  return (
    <section id="contact" className="scroll-mt-20 bg-primary text-primary-foreground">
      <Container className="py-14 sm:py-16 lg:py-20">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
          <div className="max-w-3xl">
            <h2 className="font-display text-[clamp(1.9rem,3.6vw,3rem)] font-medium leading-[1.06] tracking-[-0.03em] [text-wrap:balance]">
              {copy.title}
            </h2>
            <p className="mt-4 max-w-[58ch] text-[15px] leading-relaxed text-black/75 md:text-base">
              {copy.body}
            </p>
          </div>
          <div className="grid shrink-0 grid-cols-1 gap-2.5 sm:flex sm:gap-3">
            <Cta href={href("contact", locale)} variant="ink">
              {copy.primary}
              <ArrowUpRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </Cta>
            <Cta href={href("portfolio", locale)} variant="inkGhost">
              {copy.secondary}
            </Cta>
          </div>
        </div>
      </Container>
    </section>
  );
}

export function Footer() {
  const locale = useLocale();
  const copy = COPY[locale];
  return (
    <footer className="pb-10 pt-12 lg:pt-16">
      <Container>
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)] lg:gap-14">
          <div className="col-span-2 lg:col-span-1">
            <RevLogo variant="full" lazy className="h-14 w-auto sm:h-16" />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground">
              {copy.about}
            </p>
          </div>

          <nav aria-label={copy.navLabel} className="col-span-2 sm:col-span-1">
            <p className="text-xs text-muted-foreground">{copy.navTitle}</p>
            <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2.5 sm:grid-cols-1">
              {NAV.map((item) => (
                <li key={item.page}>
                  <Link
                    to={href(item.page, locale) as never}
                    className="text-sm text-muted-foreground transition-colors duration-300 hover:text-foreground"
                  >
                    {item.label[locale]}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="col-span-2 sm:col-span-1">
            <p className="text-xs text-muted-foreground">{copy.contact}</p>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <a
                  href="mailto:contact@realestatevision360.com"
                  className="flex items-center gap-3 text-muted-foreground transition-colors duration-300 hover:text-foreground"
                >
                  <Mail size={15} className="shrink-0" />
                  contact@realestatevision360.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+33675627707"
                  className="flex items-center gap-3 text-muted-foreground transition-colors duration-300 hover:text-foreground"
                >
                  <Phone size={15} className="shrink-0" />
                  +33 6 75 62 77 07
                </a>
              </li>
              <li>
                <a
                  href={whatsappUrl(locale)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 text-muted-foreground transition-colors duration-300 hover:text-foreground"
                >
                  <MessageCircle size={15} className="shrink-0" />
                  WhatsApp · {WHATSAPP_DISPLAY[locale]}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6 text-xs text-muted-foreground lg:mt-14">
          <p>
            © {new Date().getFullYear()} REV — Real Estate Vision. {copy.rights}
          </p>
        </div>

        <AgencyCredit className="mt-6 border-t border-border/60 pt-6" />
      </Container>
    </footer>
  );
}
