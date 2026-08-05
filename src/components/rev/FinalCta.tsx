import { ArrowUpRight, Instagram, Linkedin, Youtube, Mail, Phone } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { Container, Cta } from "./ui";
import { Reveal } from "./Reveal";

const NAV = [
  { label: "Accueil", to: "/" },
  { label: "Expertises", to: "/services" },
  { label: "Portfolio", to: "/portfolio" },
  { label: "Études de cas", to: "/case-studies" },
  { label: "À propos", to: "/about" },
  { label: "Insights", to: "/insights" },
  { label: "Contact", to: "/contact" },
] as const;

const SOCIALS = [
  { label: "Instagram", icon: Instagram, href: "https://instagram.com" },
  { label: "LinkedIn", icon: Linkedin, href: "https://linkedin.com" },
  { label: "YouTube", icon: Youtube, href: "https://youtube.com" },
];

export function FinalCta() {
  return (
    <section id="contact" className="scroll-mt-24 border-t border-border/70 py-28 md:py-40">
      <Container>
        <Reveal className="relative overflow-hidden rounded-3xl border border-border bg-card px-8 py-20 text-center md:px-16">
          <div
            className="pointer-events-none absolute inset-x-0 -top-40 h-80 opacity-40 blur-3xl"
            style={{
              background:
                "radial-gradient(closest-side, color-mix(in oklab, var(--primary) 45%, transparent), transparent)",
            }}
            aria-hidden
          />
          <h2 className="relative mx-auto max-w-3xl font-display text-[clamp(2rem,5vw,3.6rem)] font-medium leading-[1.03] tracking-[-0.03em] text-gradient">
            Prêt à accélérer vos ventes immobilières ?
          </h2>
          <p className="relative mx-auto mt-6 max-w-xl text-base text-muted-foreground">
            Un appel de 30 minutes suffit pour cartographier votre stratégie de contenu,
            d'acquisition et d'automatisation.
          </p>
          <div className="relative mt-10 flex flex-wrap justify-center gap-3">
            <Cta href="/contact">
              Planifier un appel stratégique
              <ArrowUpRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </Cta>
            <Cta href="/portfolio" variant="ghost">
              Découvrir nos réalisations
            </Cta>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border/70 pb-12 pt-20">
      <Container>
        <div className="grid gap-14 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)]">
          <div>
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-xl border border-border bg-card font-display text-[13px] font-semibold">
                R
              </span>
              <span className="font-display text-sm font-semibold tracking-[0.18em]">REV</span>
            </div>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Agence de croissance immobilière. Production visuelle premium, marketing stratégique,
              génération de leads et automatisation.
            </p>
            <div className="mt-8 flex gap-2">
              {SOCIALS.map(({ label, icon: Icon, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noreferrer"
                  className="grid h-10 w-10 place-items-center rounded-full border border-border text-muted-foreground transition-colors duration-300 hover:border-primary/50 hover:text-primary"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          <nav aria-label="Navigation du pied de page">
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              Navigation
            </p>
            <ul className="mt-6 space-y-3">
              {NAV.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.to}
                    className="text-sm text-muted-foreground transition-colors duration-300 hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Contact</p>
            <ul className="mt-6 space-y-3 text-sm">
              <li>
                <a
                  href="mailto:contact@rev-agency.com"
                  className="flex items-center gap-3 text-muted-foreground transition-colors duration-300 hover:text-foreground"
                >
                  <Mail size={15} className="shrink-0" />
                  contact@rev-agency.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+33100000000"
                  className="flex items-center gap-3 text-muted-foreground transition-colors duration-300 hover:text-foreground"
                >
                  <Phone size={15} className="shrink-0" />
                  +33 1 00 00 00 00
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-3 border-t border-border pt-8 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} REV — Real Estate Vision. Tous droits réservés.</p>
          <p>Mentions légales · Politique de confidentialité</p>
        </div>
      </Container>
    </footer>
  );
}
