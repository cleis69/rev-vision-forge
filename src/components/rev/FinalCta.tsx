import {
  ArrowUpRight,
  Instagram,
  Linkedin,
  Youtube,
  Mail,
  MessageCircle,
  Phone,
} from "lucide-react";
import { Link } from "@tanstack/react-router";

import { Container, Cta } from "./ui";
import { WHATSAPP_DISPLAY, whatsappUrl } from "@/lib/contact";
import { href, isPublic, useLocale, type Locale, type PageKey } from "@/lib/i18n";
import { Reveal } from "./Reveal";
import { RevLogo } from "./Logo";
import { AgencyCredit } from "./AgencyCredit";

const ALL_NAV: { page: PageKey; label: Record<Locale, string> }[] = [
  { page: "home", label: { fr: "Accueil", en: "Home" } },
  { page: "services", label: { fr: "Expertises", en: "Services" } },
  { page: "agent", label: { fr: "Agent IA", en: "AI agent" } },
  { page: "pricing", label: { fr: "Tarifs", en: "Pricing" } },
  { page: "portfolio", label: { fr: "Portfolio", en: "Portfolio" } },
  { page: "cases", label: { fr: "Études de cas", en: "Case studies" } },
  { page: "about", label: { fr: "À propos", en: "About" } },
  { page: "insights", label: { fr: "Insights", en: "Insights" } },
  { page: "contact", label: { fr: "Contact", en: "Contact" } },
];
const NAV = ALL_NAV.filter((item) => isPublic(item.page));

const SOCIALS = [
  { label: "Instagram", icon: Instagram, href: "https://instagram.com" },
  { label: "LinkedIn", icon: Linkedin, href: "https://linkedin.com" },
  { label: "YouTube", icon: Youtube, href: "https://youtube.com" },
];

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
    legal: "Mentions légales · Politique de confidentialité",
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
    legal: "Legal notice · Privacy policy",
  },
} as const;

export function FinalCta() {
  const locale = useLocale();
  const copy = COPY[locale];
  return (
    <section id="contact" className="scroll-mt-20 border-t border-border/70 py-14 sm:py-16 lg:py-24">
      <Container>
        <Reveal className="relative overflow-hidden rounded-3xl border border-border bg-card px-5 py-10 text-center sm:px-10 sm:py-14 md:px-16">
          <div
            className="pointer-events-none absolute inset-x-0 -top-40 h-80 opacity-40 blur-3xl"
            style={{
              background:
                "radial-gradient(closest-side, color-mix(in oklab, var(--primary) 45%, transparent), transparent)",
            }}
            aria-hidden
          />
          <h2 className="relative mx-auto max-w-3xl font-display text-[clamp(1.75rem,4vw,3rem)] font-medium leading-[1.06] tracking-[-0.03em] text-gradient [text-wrap:balance]">
            {copy.title}
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-[15px] text-muted-foreground sm:text-base">
            {copy.body}
          </p>
          <div className="relative mt-7 flex flex-wrap justify-center gap-3">
            <Cta href={href("contact", locale)}>
              {copy.primary}
              <ArrowUpRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </Cta>
            <Cta href={href("portfolio", locale)} variant="ghost">
              {copy.secondary}
            </Cta>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

export function Footer() {
  const locale = useLocale();
  const copy = COPY[locale];
  return (
    <footer className="border-t border-border/70 pb-10 pt-12 lg:pt-16">
      <Container>
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)] lg:gap-14">
          <div className="col-span-2 lg:col-span-1">
            <RevLogo variant="full" lazy className="h-14 w-auto sm:h-16" />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground">{copy.about}</p>
            <div className="mt-6 flex gap-2">
              {SOCIALS.map(({ label, icon: Icon, href: url }) => (
                <a
                  key={label}
                  href={url}
                  aria-label={label}
                  target="_blank"
                  rel="noreferrer"
                  className="grid h-10 w-10 place-items-center rounded-lg border border-border text-muted-foreground transition-colors duration-300 hover:border-primary/50 hover:text-primary"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          <nav aria-label={copy.navLabel} className="col-span-2 sm:col-span-1">
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{copy.navTitle}</p>
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
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{copy.contact}</p>
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

        <div className="mt-10 flex flex-col gap-2 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between lg:mt-14">
          <p>
            © {new Date().getFullYear()} REV — Real Estate Vision. {copy.rights}
          </p>
          <p>{copy.legal}</p>
        </div>

        <AgencyCredit className="mt-6 border-t border-border/60 pt-6" />
      </Container>
    </footer>
  );
}
