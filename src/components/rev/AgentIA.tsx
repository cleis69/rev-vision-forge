import { useState, type ReactNode } from "react";
import {
  ArrowUpRight,
  CalendarCheck,
  Check,
  Clock,
  Database,
  FileText,
  MessageCircle,
  Plus,
  Sparkles,
  Timer,
  Users,
  Zap,
} from "lucide-react";

import { agentDemoUrl } from "@/lib/contact";
import { AGENT_FAQ } from "@/lib/faq";
import { href, useLocale, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Container, Cta, Section, fadeUp } from "./ui";
import { AccentHeading } from "./AccentHeading";
import { AGENT_FEATURES } from "./AgentTeaser";
import { Reveal } from "./Reveal";
import { WhatsAppChat } from "./WhatsAppChat";

/* ------------------------------------------------------------ shared bits */

function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background/60 px-2.5 py-1 text-[12px] text-muted-foreground">
      <Check size={12} className="shrink-0 text-primary" />
      {children}
    </span>
  );
}

/* --------------------------------------------------------------- copy */

type Offer = {
  name: string;
  featured?: boolean;
  intro?: string;
  groups?: { title: string; items: string[] }[];
};

const LEADS_IN: Record<Locale, string[]> = {
  fr: ["Meta Ads (Facebook, Instagram)", "Formulaire de votre site", "Votre boîte e-mail", "Google Sheets ou Excel"],
  en: ["Meta Ads (Facebook, Instagram)", "Your website form", "Your email inbox", "Google Sheets or Excel"],
};

const COPY = {
  fr: {
    demoCta: "Réserver une démo",
    callCta: "Réserver un appel",
    features: AGENT_FEATURES.fr,
    problem: {
      eyebrow: "Ce que fait l'agent",
      before: "Il qualifie vos leads,",
      accent: "vous signez",
      after: "les bons.",
      audience: "Agences, promoteurs et agents indépendants",
      title: "La plupart de vos leads ne sont pas prêts. Les bons, eux, refroidissent.",
      body: "Curieux, projets trop lointains, budgets hors cible : trier les demandes prend des heures chaque semaine. Pendant ce temps, l'acheteur sérieux attend une réponse… et finit par écrire à une autre agence.",
      callout: "L'agent IA de REV écrit à chaque lead en quelques secondes, le qualifie sur vos critères et ne vous transmet que les prospects prêts à avancer.",
    },
    demo: {
      title: "Voyez l'agent travailler sur un vrai scénario",
      body: "Démo de 15 minutes en visio ou sur WhatsApp, avec des leads comme les vôtres. Sans engagement.",
    },
    specs: {
      eyebrow: "En pratique",
      before: "Ce que l'agent change",
      accent: "dès le premier lead.",
      description: "Les engagements de l'agent, quel que soit le volume de demandes.",
      items: [
        { value: "< 10 s", label: "Premier message", body: "Le lead reçoit une réponse avant même d'avoir quitté l'annonce." },
        { value: "24/7", label: "Disponibilité", body: "Soirs, week-ends et jours fériés compris." },
        { value: "100 %", label: "Leads contactés", body: "Chaque demande reçoit une réponse, sans exception." },
        { value: "1 synthèse", label: "Par prospect qualifié", body: "Budget, délai, financement : tout est prêt avant votre appel." },
      ],
    },
    offers: {
      eyebrow: "Nos offres",
      before: "Un agent IA adapté à",
      accent: "chaque activité.",
      description:
        "Acquéreurs, locataires, vendeurs ou programmes neufs : l'agent filtre vos leads, vous ne traitez que ceux qui valent la peine. Tarifs sur devis, selon votre volume de leads.",
      tabsLabel: "Type d'activité",
      tabs: { solo: "Indépendants", team: "Agences et promoteurs" },
      featured: "Le plus demandé",
      price: "Sur devis",
      priceNote: "Mise en place + abonnement selon le volume de leads",
      customNote: "Adapté à vos besoins",
      customCta: "Discutons-en",
      list: {
        solo: [
          {
            name: "Qualification des acquéreurs et locataires",
            groups: [
              { title: "Récupération des leads", items: LEADS_IN.fr },
              { title: "Qualification", items: ["Conversation WhatsApp naturelle", "Vos questions : budget, délai, financement…", "Le ton et le style de votre marque"] },
              { title: "Actions", items: ["Créneaux tirés de votre Google Agenda", "Rendez-vous pris automatiquement", "Synthèse par e-mail", "Relances automatiques", "Suivi dans un Google Sheet"] },
            ],
          },
          {
            name: "Qualification des demandes d'estimation",
            featured: true,
            groups: [
              { title: "Récupération des leads", items: LEADS_IN.fr },
              { title: "Qualification", items: ["Conversation WhatsApp naturelle", "Adresse, type de bien, état, délai de vente", "Le ton et le style de votre marque"] },
              { title: "Actions", items: ["Rendez-vous d'estimation dans votre agenda", "Synthèse du bien par e-mail", "Relances automatiques", "Suivi dans un Google Sheet"] },
            ],
          },
          {
            name: "Projet sur mesure",
            intro: "Un agent IA ou une automatisation construits autour de vos outils et de vos process. On définit ensemble la solution qui colle exactement à votre activité.",
          },
        ],
        team: [
          {
            name: "Qualification multi-conseillers",
            groups: [
              { title: "Récupération des leads", items: [...LEADS_IN.fr.slice(0, 3), "HubSpot ou votre CRM"] },
              { title: "Qualification", items: ["Conversation WhatsApp naturelle", "Critères définis par l'agence", "Score de chaque prospect"] },
              { title: "Actions", items: ["Routage vers le bon conseiller ou secteur", "Rendez-vous dans l'agenda du conseiller", "Synthèse au conseiller", "Tableau de bord de l'équipe"] },
            ],
          },
          {
            name: "Lancement de programme neuf",
            featured: true,
            groups: [
              { title: "Récupération des leads", items: ["Campagnes Meta et Google du programme", "Landing page du programme", "Salons et portails"] },
              { title: "Qualification", items: ["Envoi de la brochure et des plans", "Typologie, budget, financement, horizon", "Vivre ou investir"] },
              { title: "Actions", items: ["Visites et rendez-vous au bureau de vente", "Relances jusqu'à la réservation", "HubSpot CRM mis à jour", "Reporting hebdomadaire"] },
            ],
          },
          {
            name: "Projet sur mesure",
            intro: "Plusieurs agences, plusieurs numéros, des process propres à votre réseau : on construit l'architecture avec vos équipes.",
          },
        ],
      } satisfies Record<"solo" | "team", Offer[]>,
    },
    process: {
      eyebrow: "Comment ça marche",
      before: "Du lead reçu au rendez-vous",
      accent: "qualifié,",
      after: "en 4 étapes.",
      description: "Chaque étape est configurée avec vous, sur vos outils et vos critères.",
      step: "Étape",
      steps: [
        {
          title: "Récupération du lead",
          body: "L'agent capte chaque nouvelle demande, d'où qu'elle vienne. Aucun prospect ne passe entre les mailles.",
          chips: ["Meta Ads", "Formulaire du site", "E-mail entrant", "CRM ou Google Sheets"],
        },
        {
          title: "Premier message sur WhatsApp",
          body: "En quelques secondes, l'agent écrit au prospect avec le ton de votre agence, brochure ou photos à l'appui.",
          chips: ["Réponse 24h/24", "Ton de votre marque", "Brochure, photos, liens"],
        },
        {
          title: "Qualification sur vos critères",
          body: "Les questions que vous auriez posées, dans le bon ordre. Les leads hors cible sont remerciés poliment.",
          chips: ["Budget et financement", "Délai et projet", "Score du prospect"],
        },
        {
          title: "Rendez-vous et CRM à jour",
          body: "Le prospect qualifié choisit un créneau. Vous recevez la synthèse et votre CRM se met à jour tout seul.",
          chips: ["Agenda synchronisé", "Synthèse au conseiller", "CRM en temps réel"],
        },
      ],
    },
    faq: {
      eyebrow: "FAQ",
      before: "Les réponses",
      accent: "à vos questions.",
      description: "Tout ce qu'il faut savoir avant de lancer votre agent.",
      items: AGENT_FAQ.fr,
    },
    final: {
      before: "Et si chaque lead recevait une réponse en",
      accent: "dix secondes",
      after: " ?",
      body: "30 minutes pour voir comment l'agent s'intègre à votre activité, sans engagement.",
      notes: ["Appel de 30 min", "Sans engagement"],
    },
    hero: {
      eyebrow: "Agent IA · Automatisation",
      before: "Un agent IA qui",
      accent: "qualifie vos leads",
      after: "à votre place.",
      description:
        "L'agent de REV écrit à chaque prospect sur WhatsApp en quelques secondes, le qualifie sur vos critères et réserve le rendez-vous dans votre agenda. Vous ne rappelez que les prospects sérieux.",
      how: "Voir comment ça marche",
      points: ["Premier message en moins de 10 s", "Sur WhatsApp, 24h/24", "Rendez-vous et CRM automatiques"],
      cards: [
        { title: "Nouveau lead", note: "Instagram · brochure résidence" },
        { title: "Message envoyé", note: "WhatsApp · en 6 secondes" },
        { title: "Prospect qualifié", note: "250 000 € · financement OK · 3 mois" },
        { title: "Rendez-vous réservé", note: "Jeudi 11h · avec votre conseiller" },
      ],
    },

  },
  en: {
    demoCta: "Book a demo",
    callCta: "Book a call",
    features: AGENT_FEATURES.en,
    problem: {
      eyebrow: "What the agent does",
      before: "It qualifies your leads,",
      accent: "you sign",
      after: "the right ones.",
      audience: "Agencies, developers and independent agents",
      title: "Most of your leads aren't ready. The good ones go cold.",
      body: "Window shoppers, far-off projects, budgets that don't fit: sorting enquiries takes hours every week. Meanwhile, the serious buyer is waiting for a reply… and ends up writing to another agency.",
      callout: "REV's AI agent messages every lead within seconds, qualifies them against your criteria and only hands you the prospects who are ready to move.",
    },
    demo: {
      title: "Watch the agent handle a real scenario",
      body: "A 15-minute demo by video call or on WhatsApp, with leads like yours. No commitment.",
    },
    specs: {
      eyebrow: "In practice",
      before: "What the agent changes",
      accent: "from the very first lead.",
      description: "The agent's commitments, whatever your volume of enquiries.",
      items: [
        { value: "< 10 s", label: "First message", body: "The lead gets a reply before they've even left the listing." },
        { value: "24/7", label: "Availability", body: "Evenings, weekends and bank holidays included." },
        { value: "100%", label: "Leads contacted", body: "Every enquiry gets a reply, no exceptions." },
        { value: "1 summary", label: "Per qualified prospect", body: "Budget, timeline, financing: everything is ready before your call." },
      ],
    },
    offers: {
      eyebrow: "Our offers",
      before: "An AI agent tailored to",
      accent: "every business.",
      description:
        "Buyers, tenants, sellers or new developments: the agent filters your leads so you only handle the ones worth your time. Pricing on quote, based on your lead volume.",
      tabsLabel: "Business type",
      tabs: { solo: "Independents", team: "Agencies & developers" },
      featured: "Most popular",
      price: "On quote",
      priceNote: "Setup + subscription based on lead volume",
      customNote: "Tailored to your needs",
      customCta: "Let's talk",
      list: {
        solo: [
          {
            name: "Buyer and tenant qualification",
            groups: [
              { title: "Lead capture", items: LEADS_IN.en },
              { title: "Qualification", items: ["Natural WhatsApp conversation", "Your questions: budget, timeline, financing…", "Your brand's tone and style"] },
              { title: "Actions", items: ["Slots pulled from your Google Calendar", "Appointments booked automatically", "Summary by email", "Automatic follow-ups", "Tracking in a Google Sheet"] },
            ],
          },
          {
            name: "Valuation request qualification",
            featured: true,
            groups: [
              { title: "Lead capture", items: LEADS_IN.en },
              { title: "Qualification", items: ["Natural WhatsApp conversation", "Address, property type, condition, sale timeline", "Your brand's tone and style"] },
              { title: "Actions", items: ["Valuation appointments in your calendar", "Property summary by email", "Automatic follow-ups", "Tracking in a Google Sheet"] },
            ],
          },
          {
            name: "Custom project",
            intro: "An AI agent or automation built around your tools and processes. Together we define the solution that fits your business exactly.",
          },
        ],
        team: [
          {
            name: "Multi-adviser qualification",
            groups: [
              { title: "Lead capture", items: [...LEADS_IN.en.slice(0, 3), "HubSpot or your CRM"] },
              { title: "Qualification", items: ["Natural WhatsApp conversation", "Criteria set by the agency", "A score for every prospect"] },
              { title: "Actions", items: ["Routing to the right adviser or area", "Appointment in the adviser's calendar", "Summary sent to the adviser", "Team dashboard"] },
            ],
          },
          {
            name: "New development launch",
            featured: true,
            groups: [
              { title: "Lead capture", items: ["The development's Meta and Google campaigns", "The development's landing page", "Property fairs and portals"] },
              { title: "Qualification", items: ["Brochure and floor plans sent", "Unit type, budget, financing, timeline", "Live in or invest"] },
              { title: "Actions", items: ["Viewings and sales-office appointments", "Follow-ups until reservation", "HubSpot CRM kept up to date", "Weekly reporting"] },
            ],
          },
          {
            name: "Custom project",
            intro: "Several agencies, several numbers, processes specific to your network: we build the architecture with your teams.",
          },
        ],
      } satisfies Record<"solo" | "team", Offer[]>,
    },
    process: {
      eyebrow: "How it works",
      before: "From incoming lead to",
      accent: "qualified appointment,",
      after: "in 4 steps.",
      description: "Every step is set up with you, on your tools and your criteria.",
      step: "Step",
      steps: [
        {
          title: "Lead capture",
          body: "The agent picks up every new enquiry, wherever it comes from. No prospect slips through the net.",
          chips: ["Meta Ads", "Website form", "Incoming email", "CRM or Google Sheets"],
        },
        {
          title: "First message on WhatsApp",
          body: "Within seconds, the agent messages the prospect in your agency's tone, with the brochure or photos attached.",
          chips: ["Replies 24/7", "Your brand's tone", "Brochure, photos, links"],
        },
        {
          title: "Qualified on your criteria",
          body: "The questions you would have asked, in the right order. Off-target leads are politely thanked.",
          chips: ["Budget and financing", "Timeline and project", "Prospect score"],
        },
        {
          title: "Appointment booked, CRM updated",
          body: "The qualified prospect picks a slot. You get the summary and your CRM updates itself.",
          chips: ["Synced calendar", "Summary to the adviser", "Real-time CRM"],
        },
      ],
    },
    faq: {
      eyebrow: "FAQ",
      before: "Answers",
      accent: "to your questions.",
      description: "Everything you need to know before launching your agent.",
      items: AGENT_FAQ.en,
    },
    final: {
      before: "What if every lead got a reply in",
      accent: "ten seconds",
      after: "?",
      body: "30 minutes to see how the agent fits into your business, no commitment.",
      notes: ["30-minute call", "No commitment"],
    },
    hero: {
      eyebrow: "AI agent · Automation",
      before: "An AI agent that",
      accent: "qualifies your leads",
      after: "for you.",
      description:
        "REV's agent messages every prospect on WhatsApp within seconds, qualifies them against your criteria and books the appointment in your calendar. You only call back the serious ones.",
      how: "See how it works",
      points: ["First message in under 10 s", "On WhatsApp, 24/7", "Automatic appointments and CRM"],
      cards: [
        { title: "New lead", note: "Instagram · development brochure" },
        { title: "Message sent", note: "WhatsApp · in 6 seconds" },
        { title: "Qualified prospect", note: "€250,000 · financing OK · 3 months" },
        { title: "Appointment booked", note: "Thursday 11am · with your adviser" },
      ],
    },

  },
};

/* ------------------------------------------------------------- features */

export function AgentProblem() {
  const locale = useLocale();
  const copy = COPY[locale];
  const p = copy.problem;
  return (
    <Section id="fonctionnalites" className="border-t border-border/70">
      <Container>
        <AccentHeading eyebrow={p.eyebrow} before={p.before} accent={p.accent} after={p.after} />

        <Reveal className="mt-8 sm:mt-10">
          <div className="surface overflow-hidden">
            <div className="grid gap-8 p-5 sm:p-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-12 lg:p-10">
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-primary">{p.audience}</p>
                <h3 className="mt-3 font-display text-xl font-medium leading-snug tracking-tight sm:text-2xl">
                  {p.title}
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-[15px]">{p.body}</p>
                <p className="mt-5 flex gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4 text-sm leading-relaxed text-foreground/90">
                  <Sparkles size={16} className="mt-0.5 shrink-0 text-primary" />
                  {p.callout}
                </p>
              </div>

              <ul className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
                {copy.features.map((f) => (
                  <li key={f.title} className="flex gap-3">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
                      <Check size={12} strokeWidth={3} />
                    </span>
                    <span className="text-sm leading-relaxed">
                      <span className="font-medium text-foreground">{f.title}.</span>{" "}
                      <span className="text-muted-foreground">{f.body}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>

        <AgentDemoBand className="mt-4 sm:mt-5" />
      </Container>
    </Section>
  );
}

export function AgentDemoBand({ className }: { className?: string }) {
  const locale = useLocale();
  const copy = COPY[locale];
  return (
    <Reveal className={cn(className)}>
      <div className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex gap-4">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
            <MessageCircle size={19} />
          </span>
          <div>
            <p className="font-display text-base font-medium tracking-tight sm:text-lg">{copy.demo.title}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{copy.demo.body}</p>
          </div>
        </div>
        <Cta href={agentDemoUrl(locale)} className="shrink-0">
          {copy.demoCta}
          <ArrowUpRight size={16} />
        </Cta>
      </div>
    </Reveal>
  );
}

/* ---------------------------------------------------------------- specs */

const SPEC_ICONS = [Timer, Clock, Zap, FileText];

export function AgentSpecs() {
  const s = COPY[useLocale()].specs;
  return (
    <Section className="border-t border-border/70">
      <Container>
        <AccentHeading
          eyebrow={s.eyebrow}
          before={s.before}
          accent={s.accent}
          align="center"
          description={s.description}
        />
        <div className="mt-8 grid grid-cols-2 gap-2.5 sm:mt-10 sm:gap-4 lg:mt-12 lg:grid-cols-4">
          {s.items.map(({ value, label, body }, i) => {
            const Icon = SPEC_ICONS[i] ?? Check;
            return (
              <Reveal key={label} delay={i * 70} className="surface h-full p-4 sm:p-6">
                <span className="grid h-9 w-9 place-items-center rounded-xl border border-border bg-background/60 text-primary">
                  <Icon size={17} />
                </span>
                <p className="mt-4 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
                <p className="mt-1 font-display text-[clamp(1.7rem,3vw,2.4rem)] font-medium leading-none tracking-[-0.03em] text-primary">
                  {value}
                </p>
                <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">{body}</p>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}

/* --------------------------------------------------------------- offers */

export function AgentOffers() {
  const locale = useLocale();
  const copy = COPY[locale];
  const o = copy.offers;
  const [tab, setTab] = useState<"solo" | "team">("solo");
  const offers: Offer[] = o.list[tab];
  return (
    <Section id="offres" className="border-t border-border/70">
      <Container>
        <AccentHeading
          eyebrow={o.eyebrow}
          before={o.before}
          accent={o.accent}
          align="center"
          description={o.description}
        />

        <Reveal className="mt-7 flex justify-center">
          <div className="inline-flex rounded-xl border border-border bg-card p-1" role="tablist" aria-label={o.tabsLabel}>
            {(["solo", "team"] as const).map((key) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={tab === key}
                onClick={() => setTab(key)}
                className={cn(
                  "whitespace-nowrap rounded-lg px-3.5 py-2 text-[13px] font-medium transition-colors duration-300 sm:px-4",
                  tab === key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {o.tabs[key]}
              </button>
            ))}
          </div>
        </Reveal>

        <div
          key={tab}
          className="-mx-5 mt-8 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 pt-3 [scrollbar-width:none] md:mx-0 md:grid md:snap-none md:grid-cols-2 md:gap-4 md:overflow-visible md:px-0 md:pb-0 lg:grid-cols-3 [&::-webkit-scrollbar]:hidden"
        >
          {offers.map((offer, i) => (
            <Reveal key={offer.name} delay={i * 80} className="h-full w-[86%] shrink-0 snap-start md:w-auto">
              <article
                className={cn(
                  "relative flex h-full flex-col rounded-2xl border bg-card p-5 sm:p-6",
                  offer.featured ? "border-primary" : "border-border",
                )}
              >
                {offer.featured ? (
                  <span className="absolute -top-3 right-6 rounded-lg bg-primary px-3 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-primary-foreground">
                    {o.featured}
                  </span>
                ) : null}
                <h3 className="font-display text-lg font-medium leading-snug tracking-tight">{offer.name}</h3>
                <p className="mt-3 font-display text-[1.7rem] font-medium leading-none tracking-[-0.03em] text-primary">
                  {o.price}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">{offer.groups ? o.priceNote : o.customNote}</p>

                <div className="mt-5">
                  <Cta
                    href={href("contact", locale)}
                    variant={offer.featured ? "primary" : "ghost"}
                    className="h-11 w-full text-[13px]"
                  >
                    {offer.groups ? copy.callCta : o.customCta}
                    <ArrowUpRight size={15} />
                  </Cta>
                </div>

                {offer.intro ? (
                  <p className="mt-5 text-sm leading-relaxed text-muted-foreground">{offer.intro}</p>
                ) : null}

                {offer.groups?.map((g) => (
                  <div key={g.title} className="mt-5 border-t border-border pt-4">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{g.title}</p>
                    <ul className="mt-3 space-y-2">
                      {g.items.map((item) => (
                        <li key={item} className="flex gap-2.5 text-[13px] leading-snug text-foreground/85">
                          <Check size={14} className="mt-0.5 shrink-0 text-primary" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </article>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}

/* -------------------------------------------------------------- process */

export function AgentProcess() {
  const p = COPY[useLocale()].process;
  return (
    <Section id="fonctionnement" className="border-t border-border/70">
      <Container>
        <AccentHeading
          eyebrow={p.eyebrow}
          before={p.before}
          accent={p.accent}
          after={p.after}
          description={p.description}
        />

        <div className="mt-8 grid items-start gap-10 sm:mt-10 lg:mt-12 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-16">
          <ol className="relative space-y-3 sm:space-y-4">
            <span aria-hidden className="absolute bottom-6 left-[19px] top-6 w-px bg-gradient-to-b from-primary/60 via-primary/25 to-transparent sm:left-[23px]" />
            {p.steps.map((step, i) => (
              <Reveal as="li" key={step.title} delay={i * 80} className="relative flex gap-4 sm:gap-6">
                <span className="relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full border border-primary/50 bg-background font-display text-sm font-medium text-primary sm:h-12 sm:w-12">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="surface min-w-0 flex-1 p-5 sm:p-6">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-primary">
                    {p.step} {i + 1}
                  </p>
                  <h3 className="mt-2 font-display text-lg font-medium tracking-tight">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {step.chips.map((c) => (
                      <Chip key={c}>{c}</Chip>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </ol>

          <div className="order-first mx-auto lg:sticky lg:top-24 lg:order-none">
            <WhatsAppChat className="w-[min(64vw,280px)] lg:w-[320px]" />
          </div>
        </div>
      </Container>
    </Section>
  );
}

/* ------------------------------------------------------------------ faq */

export function AgentFaq() {
  const f = COPY[useLocale()].faq;
  const [open, setOpen] = useState<number | null>(0);
  return (
    <Section id="faq" className="border-t border-border/70">
      <Container>
        <div className="grid gap-6 sm:gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-14">
          <AccentHeading eyebrow={f.eyebrow} before={f.before} accent={f.accent} description={f.description} />
          <Reveal>
            <ul className="border-t border-border">
              {f.items.map((item, i) => {
                const isOpen = open === i;
                return (
                  <li key={item.q} className="border-b border-border">
                    <button
                      type="button"
                      onClick={() => setOpen(isOpen ? null : i)}
                      aria-expanded={isOpen}
                      className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-4 py-4 text-left transition-colors duration-300 hover:text-primary sm:gap-6 sm:py-5"
                    >
                      <span className="font-display text-base font-medium tracking-tight md:text-lg">{item.q}</span>
                      <Plus
                        size={18}
                        className={cn(
                          "shrink-0 text-muted-foreground transition-transform duration-500",
                          isOpen && "rotate-45 text-primary",
                        )}
                      />
                    </button>
                    <div
                      className="grid transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                      style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                    >
                      <div className="overflow-hidden">
                        <p className="max-w-2xl pb-5 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}

/* ---------------------------------------------------------- final + hero */

export function AgentFinalCta() {
  const locale = useLocale();
  const copy = COPY[locale];
  const f = copy.final;
  return (
    <section className="scroll-mt-20 border-t border-border/70 py-14 sm:py-16 lg:py-24">
      <Container>
        <Reveal className="relative overflow-hidden rounded-3xl border border-border bg-card px-5 py-10 text-center sm:px-10 sm:py-14">
          <div
            className="pointer-events-none absolute inset-x-0 -top-40 h-80 opacity-40 blur-3xl"
            style={{
              background:
                "radial-gradient(closest-side, color-mix(in oklab, var(--primary) 45%, transparent), transparent)",
            }}
            aria-hidden
          />
          <h2 className="relative mx-auto max-w-3xl font-display text-[clamp(1.75rem,4vw,3rem)] font-medium leading-[1.06] tracking-[-0.03em] text-gradient [text-wrap:balance]">
            {f.before} <span className="text-primary">{f.accent}</span>
            {f.after}
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-[15px] text-muted-foreground sm:text-base">{f.body}</p>
          <div className="relative mt-7 flex flex-wrap justify-center gap-3">
            <Cta href={agentDemoUrl(locale)}>
              {copy.demoCta}
              <ArrowUpRight size={16} />
            </Cta>
            <Cta href={href("contact", locale)} variant="ghost">
              {copy.callCta}
            </Cta>
          </div>
          <p className="relative mt-5 flex flex-wrap justify-center gap-x-5 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <CalendarCheck size={13} className="text-primary" /> {f.notes[0]}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check size={13} className="text-primary" /> {f.notes[1]}
            </span>
          </p>
        </Reveal>
      </Container>
    </section>
  );
}

const HERO_POINT_ICONS = [Timer, MessageCircle, Database];
const HERO_CARD_ICONS = [Users, MessageCircle, Check, CalendarCheck];

export function AgentHero() {
  const locale = useLocale();
  const copy = COPY[locale];
  const h = copy.hero;
  return (
    <section className="relative overflow-hidden border-b border-border/70 pb-12 pt-28 md:pb-16 md:pt-36">
      <div
        aria-hidden
        className="pointer-events-none absolute right-[-10%] top-0 -z-10 h-[620px] w-[620px] rounded-full opacity-25 blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, color-mix(in oklab, var(--primary) 45%, transparent), transparent)",
        }}
      />
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.1fr)_auto] lg:gap-16">
          <div>
            <AccentHeading
              as="h1"
              eyebrow={h.eyebrow}
              before={h.before}
              accent={h.accent}
              after={h.after}
              description={h.description}
            />
            <div className="mt-7 grid grid-cols-2 gap-2.5 sm:flex sm:flex-wrap sm:gap-3" style={fadeUp(0.15)}>
              <Cta href={agentDemoUrl(locale)} className="col-span-2 sm:col-span-1">
                {copy.demoCta}
                <ArrowUpRight size={16} />
              </Cta>
              <Cta href="#fonctionnement" variant="ghost" className="col-span-2 sm:col-span-1">
                {h.how}
              </Cta>
            </div>
            <div className="mt-7" style={fadeUp(0.22)}>
              <ul className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:gap-x-6">
                {h.points.map((label, i) => {
                  const Icon = HERO_POINT_ICONS[i] ?? Check;
                  return (
                    <li key={label} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                      <Icon size={15} className="shrink-0 text-primary" />
                      {label}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          <div className="relative mx-auto hidden lg:block" style={fadeUp(0.12)}>
            <div className="flex w-[300px] flex-col gap-3">
              {h.cards.map(({ title, note }, i) => {
                const Icon = HERO_CARD_ICONS[i] ?? Check;
                return (
                  <div
                    key={title}
                    className="flex items-center gap-3 rounded-2xl border border-border bg-card/80 px-4 py-3 shadow-[var(--shadow-soft)] backdrop-blur-xl"
                    style={{ marginLeft: `${(i % 2) * 28}px`, animation: `rev-float ${6 + i}s ease-in-out ${-i}s infinite` }}
                  >
                    <span
                      className={cn(
                        "grid h-9 w-9 shrink-0 place-items-center rounded-xl",
                        i === 3 ? "bg-primary text-primary-foreground" : "bg-elevated text-primary",
                      )}
                    >
                      <Icon size={16} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-medium">{title}</span>
                      <span className="block truncate text-xs text-muted-foreground">{note}</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
