import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CalendarClock, Mail, MapPin, MessageCircle, Phone, ArrowUpRight } from "lucide-react";

import { Container, PageHero, Section } from "@/components/rev/ui";
import { WHATSAPP_URL } from "@/lib/contact";
import { Reveal } from "@/components/rev/Reveal";
import heroVilla from "@/assets/hero-villa.jpg";

const TITLE = "Contact REV — Planifier un appel stratégique";
const DESCRIPTION =
  "Parlons de votre programme, de votre agence ou de votre portefeuille. Formulaire, WhatsApp, Calendly et coordonnées de l'agence REV.";

const NEEDS = [
  "Production visuelle",
  "Marketing & contenu",
  "Acquisition & publicité",
  "Automatisation & CRM",
  "Écosystème complet",
];

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [need, setNeed] = useState(NEEDS[0]);

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Parlons de votre prochain lancement."
        description="Un appel de 30 minutes suffit pour cartographier votre stratégie de contenu, d'acquisition et d'automatisation. Réponse sous 24 heures ouvrées."
        image={heroVilla}
        imageAlt="Villa de luxe éclairée de nuit avec façade vitrée et piscine à débordement"
      />

      <Section>
        <Container>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
            <Reveal className="surface p-8 md:p-12">
              <h2 className="font-display text-2xl font-medium tracking-tight">
                Décrivez votre projet
              </h2>
              <form
                className="mt-8 space-y-5"
                action="mailto:contact@realestatevision360.com"
                method="post"
                encType="text/plain"
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Nom complet" name="nom" type="text" autoComplete="name" />
                  <Field label="Société" name="societe" type="text" autoComplete="organization" />
                  <Field label="Email" name="email" type="email" autoComplete="email" />
                  <Field label="Téléphone" name="telephone" type="tel" autoComplete="tel" />
                </div>

                <div>
                  <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    Besoin principal
                  </span>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {NEEDS.map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setNeed(n)}
                        aria-pressed={need === n}
                        className={
                          need === n
                            ? "h-9 rounded-lg border border-primary/50 bg-primary/10 px-4 text-xs text-foreground"
                            : "h-9 rounded-lg border border-border px-4 text-xs text-muted-foreground transition-colors hover:border-foreground/25 hover:text-foreground"
                        }
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                  <input type="hidden" name="besoin" value={need} />
                </div>

                <label className="block">
                  <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    Message
                  </span>
                  <textarea
                    name="message"
                    rows={5}
                    required
                    className="mt-2 w-full rounded-lg border border-border bg-elevated px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/50"
                    placeholder="Programme, typologie, échéance de commercialisation…"
                  />
                </label>

                <button
                  type="submit"
                  className="group inline-flex h-12 items-center gap-2 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground transition-all duration-300 hover:bg-primary-hover active:scale-[0.98]"
                >
                  Envoyer la demande
                  <ArrowUpRight size={16} />
                </button>
              </form>
            </Reveal>

            <div className="space-y-6">
              <Reveal className="surface p-8">
                <CalendarClock size={18} className="text-primary" />
                <h2 className="mt-4 font-display text-lg font-medium tracking-tight">
                  Réserver un créneau
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  30 minutes, en visio, avec un stratège REV.
                </p>
                <a
                  href="https://calendly.com/rev-agency/30min"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex h-11 items-center gap-2 rounded-lg border border-border px-5 text-sm transition-colors hover:border-primary/50 hover:text-primary"
                >
                  Ouvrir Calendly
                  <ArrowUpRight size={15} />
                </a>
              </Reveal>

              <Reveal className="surface p-8" delay={80}>
                <MessageCircle size={18} className="text-primary" />
                <h2 className="mt-4 font-display text-lg font-medium tracking-tight">WhatsApp</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Pour une question rapide ou un devis urgent.
                </p>
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex h-11 items-center gap-2 rounded-lg border border-border px-5 text-sm transition-colors hover:border-primary/50 hover:text-primary"
                >
                  Écrire sur WhatsApp
                  <ArrowUpRight size={15} />
                </a>
              </Reveal>

              <Reveal className="surface p-8" delay={160}>
                <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  Coordonnées
                </p>
                <ul className="mt-6 space-y-4 text-sm">
                  <li>
                    <a
                      href="mailto:contact@realestatevision360.com"
                      className="flex items-center gap-3 text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <Mail size={15} className="shrink-0" />
                      contact@realestatevision360.com
                    </a>
                  </li>
                  <li>
                    <a
                      href="tel:+33675627707"
                      className="flex items-center gap-3 text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <Phone size={15} className="shrink-0" />
                      +33 6 75 62 77 07
                    </a>
                  </li>
                  <li className="flex items-start gap-3 text-muted-foreground">
                    <MapPin size={15} className="mt-0.5 shrink-0" />
                    12 rue de la Paix, 75002 Paris
                  </li>
                </ul>
              </Reveal>
            </div>
          </div>

          <Reveal className="mt-10 overflow-hidden rounded-2xl border border-border">
            <iframe
              title="Localisation de l'agence REV à Paris"
              src="https://www.google.com/maps?q=12+rue+de+la+Paix,+75002+Paris&output=embed"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-[380px] w-full grayscale"
            />
          </Reveal>
        </Container>
      </Section>
    </>
  );
}

function Field({
  label,
  name,
  type,
  autoComplete,
}: {
  label: string;
  name: string;
  type: string;
  autoComplete: string;
}) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{label}</span>
      <input
        type={type}
        name={name}
        required
        autoComplete={autoComplete}
        className="mt-2 h-11 w-full rounded-lg border border-border bg-elevated px-4 text-sm text-foreground outline-none transition-colors focus:border-primary/50"
      />
    </label>
  );
}
