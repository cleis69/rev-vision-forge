import { useState, type FormEvent } from "react";
import { Mail, MessageCircle, Phone, ArrowUpRight } from "lucide-react";

import { Container, PageHero, Section } from "@/components/rev/ui";
import { Reveal } from "@/components/rev/Reveal";
import { CONTACT_EMAIL, CONTACT_PHONE, CONTACT_PHONE_HREF, whatsappLink, whatsappUrl } from "@/lib/contact";
import { useLocale } from "@/lib/i18n";
import { photo } from "@/lib/images";

const heroVilla = photo("hero-villa");

const COPY = {
  fr: {
    title: "Parlons de votre prochain lancement.",
    description:
      "Un appel de 30 minutes suffit pour cartographier votre stratégie de contenu, d'acquisition et d'automatisation. Réponse sous 24 heures ouvrées.",
    imageAlt: "Villa de luxe éclairée de nuit avec façade vitrée et piscine à débordement",
    formTitle: "Décrivez votre projet",
    name: "Nom complet",
    company: "Société",
    email: "Email",
    phone: "Téléphone",
    needLabel: "Besoin principal",
    needs: [
      "Production visuelle",
      "Marketing & contenu",
      "Acquisition & publicité",
      "Automatisation & CRM",
      "Écosystème complet",
    ],
    message: "Message",
    placeholder: "Programme, typologie, échéance de commercialisation…",
    submit: "Envoyer sur WhatsApp",
    submitNote: "Votre demande s'ouvre dans WhatsApp, prête à être envoyée.",
    intro: "Bonjour REV, voici ma demande :",
    line: (label: string, value: string) => `${label} : ${value}`,
    needLine: "Besoin",
    nameLine: "Nom",
    waBody: "Pour convenir d'un appel, poser une question ou demander un devis.",
    waCta: "Écrire sur WhatsApp",
    details: "Coordonnées",
  },
  en: {
    title: "Let's talk about your next launch.",
    description:
      "A 30-minute call is all it takes to map out your content, acquisition and automation strategy. We reply within one business day.",
    imageAlt: "Luxury villa lit up at night with a glass façade and an infinity pool",
    formTitle: "Tell us about your project",
    name: "Full name",
    company: "Company",
    email: "Email",
    phone: "Phone",
    needLabel: "Main need",
    needs: [
      "Visual production",
      "Marketing & content",
      "Acquisition & advertising",
      "Automation & CRM",
      "Complete ecosystem",
    ],
    message: "Message",
    placeholder: "Development, property type, sales timeline…",
    submit: "Send on WhatsApp",
    submitNote: "Your request opens in WhatsApp, ready to send.",
    intro: "Hello REV, here is my request:",
    line: (label: string, value: string) => `${label}: ${value}`,
    needLine: "Need",
    nameLine: "Name",
    waBody: "To arrange a call, ask a question or request a quote.",
    waCta: "Message us on WhatsApp",
    details: "Contact details",
  },
};

export function ContactPage() {
  const locale = useLocale();
  const copy = COPY[locale];
  const [need, setNeed] = useState(0);

  // The domain has no mailbox: the brief is sent as a ready-to-send WhatsApp message.
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const field = (label: string, key: string) => {
      const value = String(data.get(key) ?? "").trim();
      return value ? copy.line(label, value) : null;
    };
    const text = [
      copy.intro,
      field(copy.nameLine, "nom"),
      field(copy.company, "societe"),
      field(copy.email, "email"),
      field(copy.phone, "telephone"),
      copy.line(copy.needLine, copy.needs[need] ?? ""),
      "",
      String(data.get("message") ?? "").trim(),
    ]
      .filter((line) => line !== null)
      .join("\n");
    window.open(whatsappLink(text), "_blank", "noopener");
  };

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title={copy.title}
        description={copy.description}
        image={heroVilla}
        imageAlt={copy.imageAlt}
      />

      <Section>
        <Container>
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-6">
            <Reveal className="surface p-5 sm:p-8 md:p-10">
              <h2 className="font-display text-2xl font-medium tracking-tight">{copy.formTitle}</h2>
              <form className="mt-6 space-y-5" onSubmit={onSubmit}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label={copy.name} name="nom" type="text" autoComplete="name" required />
                  <Field label={copy.company} name="societe" type="text" autoComplete="organization" />
                  <Field label={copy.email} name="email" type="email" autoComplete="email" />
                  <Field label={copy.phone} name="telephone" type="tel" autoComplete="tel" />
                </div>

                <div>
                  <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    {copy.needLabel}
                  </span>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {copy.needs.map((n, i) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setNeed(i)}
                        aria-pressed={need === i}
                        className={
                          need === i
                            ? "h-9 rounded-lg border border-primary/50 bg-primary/10 px-4 text-xs text-foreground"
                            : "h-9 rounded-lg border border-border px-4 text-xs text-muted-foreground transition-colors hover:border-foreground/25 hover:text-foreground"
                        }
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                <label className="block">
                  <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    {copy.message}
                  </span>
                  <textarea
                    name="message"
                    rows={5}
                    required
                    className="mt-2 w-full rounded-lg border border-border bg-elevated px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/50"
                    placeholder={copy.placeholder}
                  />
                </label>

                <button
                  type="submit"
                  className="group inline-flex h-12 items-center gap-2 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground transition-all duration-300 hover:bg-primary-hover active:scale-[0.98]"
                >
                  {copy.submit}
                  <ArrowUpRight size={16} />
                </button>
                <p className="text-xs text-muted-foreground">{copy.submitNote}</p>
              </form>
            </Reveal>

            <div className="space-y-4">
              {/* No booking calendar yet: calls are arranged on WhatsApp. */}
              <Reveal className="surface p-5 sm:p-6">
                <MessageCircle size={18} className="text-primary" />
                <h2 className="mt-4 font-display text-lg font-medium tracking-tight">WhatsApp</h2>
                <p className="mt-2 text-sm text-muted-foreground">{copy.waBody}</p>
                <a
                  href={whatsappUrl(locale)}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex h-11 items-center gap-2 rounded-lg border border-border px-5 text-sm transition-colors hover:border-primary/50 hover:text-primary"
                >
                  {copy.waCta}
                  <ArrowUpRight size={15} />
                </a>
              </Reveal>

              <Reveal className="surface p-5 sm:p-6" delay={80}>
                <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{copy.details}</p>
                <ul className="mt-6 space-y-4 text-sm">
                  <li>
                    <a
                      href={`mailto:${CONTACT_EMAIL}`}
                      className="flex items-center gap-3 text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <Mail size={15} className="shrink-0" />
                      {CONTACT_EMAIL}
                    </a>
                  </li>
                  <li>
                    <a
                      href={CONTACT_PHONE_HREF}
                      className="flex items-center gap-3 text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <Phone size={15} className="shrink-0" />
                      {CONTACT_PHONE}
                    </a>
                  </li>
                </ul>
              </Reveal>
            </div>
          </div>
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
  required = false,
}: {
  label: string;
  name: string;
  type: string;
  autoComplete: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{label}</span>
      <input
        type={type}
        name={name}
        required={required}
        autoComplete={autoComplete}
        className="mt-2 h-11 w-full rounded-lg border border-border bg-elevated px-4 text-sm text-foreground outline-none transition-colors focus:border-primary/50"
      />
    </label>
  );
}
