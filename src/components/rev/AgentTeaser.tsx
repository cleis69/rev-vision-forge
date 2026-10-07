import { ArrowUpRight, Check } from "lucide-react";

import { agentDemoUrl } from "@/lib/contact";
import { href, useLocale, type Locale } from "@/lib/i18n";
import { Container, Cta, Section } from "./ui";
import { Reveal } from "./Reveal";
import { AccentHeading } from "./AccentHeading";
import { WhatsAppChat } from "./WhatsAppChat";

/** What the agent does, shared by the home teaser and the AI agent page. */
export const AGENT_FEATURES: Record<Locale, { title: string; body: string }[]> = {
  fr: [
    {
      title: "Disponible 24h/24",
      body: "Il répond en quelques secondes, même le dimanche soir, avant que le prospect n'appelle un concurrent.",
    },
    {
      title: "Qualification sur vos critères",
      body: "Budget, financement, délai, type de bien, secteur : tout est clair avant votre premier appel.",
    },
    {
      title: "Conversation naturelle sur WhatsApp",
      body: "Le canal où vos prospects lisent et répondent vraiment, sans appel d'un numéro inconnu.",
    },
    {
      title: "Rendez-vous pris tout seul",
      body: "Directement dans votre agenda, avec la synthèse complète de l'échange.",
    },
    {
      title: "À l'image de votre agence",
      body: "Il reprend votre ton, votre vocabulaire et vos règles, et passe la main quand il le faut.",
    },
    {
      title: "Suivi CRM intégré",
      body: "Chaque conversation et chaque prospect qualifié remontent dans votre outil de suivi.",
    },
  ],
  en: [
    {
      title: "Available 24/7",
      body: "It replies within seconds, even on a Sunday evening, before the prospect calls a competitor.",
    },
    {
      title: "Qualified on your criteria",
      body: "Budget, financing, timeline, property type, area: everything is clear before your first call.",
    },
    {
      title: "Natural conversation on WhatsApp",
      body: "The channel where your prospects actually read and reply, with no call from an unknown number.",
    },
    {
      title: "Appointments booked for you",
      body: "Straight into your calendar, with a full summary of the conversation.",
    },
    {
      title: "In your agency's voice",
      body: "It uses your tone, your vocabulary and your rules, and hands over when it should.",
    },
    {
      title: "Built-in CRM tracking",
      body: "Every conversation and every qualified prospect lands in your tracking tool.",
    },
  ],
};

const COPY = {
  fr: {
    eyebrow: "Nouveau · Agent IA",
    before: "Un agent IA qui qualifie vos leads",
    accent: "sur WhatsApp.",
    description:
      "Il écrit à chaque prospect en quelques secondes, pose vos questions de qualification et réserve le rendez-vous. Vous ne rappelez que les bons.",
    cta: "Découvrir l'agent IA",
    demoCta: "Réserver une démo",
  },
  en: {
    eyebrow: "New · AI agent",
    before: "An AI agent that qualifies your leads",
    accent: "on WhatsApp.",
    description:
      "It messages every prospect within seconds, asks your qualifying questions and books the appointment. You only call back the right ones.",
    cta: "Discover the AI agent",
    demoCta: "Book a demo",
  },
} as const;

/** Home page section introducing the AI agent (kept apart from the agent page code). */
export function AgentTeaser() {
  const locale = useLocale();
  const t = COPY[locale];
  const features = AGENT_FEATURES[locale];
  return (
    <Section id="agent-ia" className="border-t border-border/70">
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.1fr)_auto] lg:gap-16">
          <div>
            <AccentHeading
              eyebrow={t.eyebrow}
              before={t.before}
              accent={t.accent}
              description={t.description}
            />
            <Reveal delay={100}>
              <ul className="mt-6 grid gap-x-6 gap-y-3 sm:grid-cols-2">
                {features.map((f) => (
                  <li
                    key={f.title}
                    className="flex items-center gap-2.5 text-sm text-foreground/90"
                  >
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
                      <Check size={12} strokeWidth={3} />
                    </span>
                    {f.title}
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal
              delay={160}
              className="mt-7 grid grid-cols-2 gap-2.5 sm:flex sm:flex-wrap sm:gap-3"
            >
              <Cta href={href("agent", locale)} className="col-span-2 sm:col-span-1">
                {t.cta}
                <ArrowUpRight size={16} />
              </Cta>
              <Cta href={agentDemoUrl(locale)} variant="ghost" className="col-span-2 sm:col-span-1">
                {t.demoCta}
              </Cta>
            </Reveal>
          </div>
          <div className="mx-auto">
            <WhatsAppChat className="w-[min(70vw,290px)] lg:w-[300px]" />
          </div>
        </div>
      </Container>
    </Section>
  );
}
