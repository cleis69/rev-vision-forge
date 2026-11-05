import { useState, type ComponentType } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarCheck,
  ChartColumn,
  Check,
  CircleDot,
  Clapperboard,
  CodeXml,
  FileText,
  Film,
  GitCompareArrows,
  Image,
  Inbox,
  MapPin,
  MessageCircle,
  Minus,
  MonitorSmartphone,
  MousePointerClick,
  Palette,
  Phone,
  Plus,
  Presentation,
  QrCode,
  Rotate3d,
  SlidersHorizontal,
  Upload,
  View,
  type LucideProps,
} from "lucide-react";

import { AccentHeading } from "@/components/rev/AccentHeading";
import { RevLogo } from "@/components/rev/Logo";
import { Reveal } from "@/components/rev/Reveal";
import { SalesPlanDemo } from "@/components/rev/SalesPlanDemo";
import { Container, Cta, Section, fadeUp } from "@/components/rev/ui";
import { salesPlanDemoUrl } from "@/lib/contact";
import { SALES_PLAN_FAQ } from "@/lib/faq";
import { href, useLocale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/*
 * Offer page of the 3D sales plan (SaaS for property developers). The live
 * demo is a fictional programme: no client is named anywhere on this page.
 */

type Icon = ComponentType<LucideProps>;
type Mark = "yes" | "part" | "no";
type Cell = Mark | [Mark, string];

const FR = {
  demoCta: "Réserver une démo",
  callCta: "Planifier un appel",
  hero: {
    eyebrow: "Plan de vente 3D · Promoteurs",
    before: "Vendez sur plan",
    accent: "en 3D,",
    after: "avec les disponibilités en direct.",
    description:
      "Une page par programme. Vos acheteurs tournent la résidence du bout du doigt, voient chaque lot disponible, réservé ou vendu, ouvrent sa fiche et vous écrivent en le citant. Votre équipe met les statuts à jour en un clic.",
    live: "Voir la démo en direct",
    points: ["Téléphone, tablette, ordinateur", "Rien à installer", "Français et anglais"],
    cards: [
      { title: "Villa 6 · Réservée", note: "Mise à jour par votre équipe · à l'instant" },
      { title: "Nouvelle demande", note: "Villa 7 · demande de visite" },
      { title: "Comparaison envoyée", note: "Villas 2, 4 et 8 · par lien" },
      { title: "Recherche : 5 chambres", note: "Résultats allumés sur la 3D" },
    ],
  },
  demo: {
    eyebrow: "Démo en direct",
    before: "Essayez-la",
    accent: "comme un acheteur.",
    description:
      "Un programme fictif de 14 villas à Marrakech, ouvert à tous : vues 3D, fiches des lots, visite 360°, quartier, comparateur et simulateur de crédit.",
  },
  compare: {
    eyebrow: "Ce que l'acheteur peut faire",
    before: "Plus qu'une maquette,",
    accent: "plus qu'une brochure.",
    description:
      "La maquette reste au bureau de vente et la brochure est figée le jour de son envoi. Le plan de vente 3D suit l'acheteur partout, toujours à jour.",
    caption: "Ce que l'acheteur peut faire avec une maquette physique, une brochure PDF et REV",
    feature: "Fonction",
    columns: ["Maquette physique", "Brochure PDF", "REV"],
    marks: { yes: "Oui", part: "En partie", no: "Non" } as Record<Mark, string>,
    rows: [
      {
        label: "Voir le programme sous tous les angles",
        cells: [["part", "Au bureau de vente"], ["part", "Quelques images"], "yes"],
      },
      { label: "Ouvrir un étage, une villa", cells: ["no", ["part", "Plans par niveau"], "yes"] },
      { label: "Disponibilités en direct", cells: ["no", ["no", "Figée à l'envoi"], "yes"] },
      {
        label: "Fiche et plan de chaque lot",
        cells: ["no", ["part", "Par typologie"], "yes"],
      },
      { label: "Visite 360°", cells: ["no", "no", "yes"] },
      { label: "Quartier et temps de trajet", cells: ["no", ["part", "Carte figée"], "yes"] },
      { label: "Comparer des lots et envoyer la comparaison", cells: ["no", "no", "yes"] },
      { label: "Recherche par budget, surface, chambres", cells: ["no", "no", "yes"] },
      { label: "Simulateur de crédit", cells: ["no", "no", "yes"] },
      { label: "Contact qui cite le lot", cells: [["part", "Sur place"], "no", "yes"] },
      {
        label: "Français et anglais",
        cells: [["part", "Selon l'équipe"], ["part", "Un PDF par langue"], "yes"],
      },
    ] as { label: string; cells: Cell[] }[],
  },
  buyers: {
    eyebrow: "Pour vos acheteurs",
    before: "Tout pour choisir son lot",
    accent: "avant le premier rendez-vous.",
    isNew: "Nouveau",
    items: [
      {
        title: "La résidence en 3D, au doigt",
        body: "Vue aérienne, toiture, étages, vue piéton : l'acheteur tourne, zoome et touche un lot.",
      },
      {
        title: "Mouvements de caméra filmés",
        body: "Quand l'acheteur change de vue, un plan filmé l'y emmène.",
        isNew: true,
      },
      {
        title: "Statuts en direct",
        body: "Chaque lot en couleur : disponible, réservé ou vendu, mis à jour par votre équipe.",
      },
      {
        title: "Fiche, plan et crédit",
        body: "Surface, chambres, prix ou prix sur demande, plan du lot et simulateur de crédit.",
      },
      {
        title: "Visite 360°",
        body: "Les pièces en panorama, sur ordinateur ou avec le gyroscope du téléphone.",
      },
      {
        title: "Quartier et trajets",
        body: "Écoles, golf, aéroport : ce qu'il y a autour, et à combien de minutes.",
      },
      {
        title: "Recherche qui éclaire la 3D",
        body: "Budget, surface, chambres : les lots qui correspondent restent allumés, les autres s'estompent.",
      },
      {
        title: "Comparateur à partager",
        body: "Jusqu'à 3 lots côte à côte, envoyés par lien à un proche ou à son banquier.",
      },
    ] as { title: string; body: string; isNew?: boolean }[],
    contact: {
      title: "L'acheteur vous écrit, le lot déjà nommé.",
      body: "Depuis la fiche, il vous contacte sur WhatsApp, vous appelle ou demande une visite : votre commercial sait tout de suite de quel lot on parle.",
      chips: ["WhatsApp", "Appel", "Demande de visite"],
    },
  },
  teams: {
    eyebrow: "Pour vos équipes",
    before: "Votre espace promoteur :",
    accent: "un clic,",
    after: "et la page est à jour.",
    description:
      "Passer un lot en vendu ne demande ni e-mail ni délai : votre équipe le fait elle-même, et tous les acheteurs le voient aussitôt.",
    items: [
      {
        title: "Statuts en un clic",
        body: "Disponible, réservé, vendu. Import et export CSV de toute la liste des lots.",
      },
      {
        title: "Demandes en temps réel",
        body: "Chaque demande arrive avec le lot cité, et vous répondez sur WhatsApp en un geste.",
      },
      {
        title: "Statistiques",
        body: "Visites de la page, lots les plus consultés, origine des demandes.",
      },
      {
        title: "Liens et QR codes",
        body: "Un lien pour le programme et pour chaque lot, à glisser dans vos annonces et brochures.",
      },
      {
        title: "Sur votre site",
        body: "Le plan de vente dans une iframe, qui prend toute seule la bonne hauteur.",
      },
      {
        title: "Mode présentation",
        body: "Plein écran sur la tablette du bureau de vente, qui revient à l'accueil entre deux clients.",
      },
      {
        title: "Marque blanche",
        body: "Votre logo, votre couleur, votre police. La mention « Propulsé par REV » reste en pied de page.",
      },
    ],
    poweredBy: "Propulsé par",
    mock: {
      label: "Illustration de l'espace promoteur : le statut de chaque villa se change en un clic.",
      title: "Espace promoteur",
      programme: "Villas de démonstration",
      live: "Page en ligne",
      statuses: ["Disponible", "Réservée", "Vendue"],
      rows: [
        { lot: "Villa 1", status: 0 },
        { lot: "Villa 3", status: 1 },
        { lot: "Villa 5", status: 2 },
        { lot: "Villa 6", status: 1 },
        { lot: "Villa 7", status: 0 },
        { lot: "Villa 8", status: 0 },
        { lot: "Villa 11", status: 2 },
      ],
      toast: "Nouvelle demande",
      toastNote: "Villa 7 · demande de visite",
      now: "à l'instant",
      importCsv: "Importer CSV",
      exportCsv: "Exporter",
    },
  },
  studio: {
    eyebrow: "Studio 3D",
    before: "Pas encore de 3D ?",
    accent: "Notre studio la produit.",
    description:
      "À partir de vos plans, notre studio crée les images et les films de votre programme, puis les relie à votre plan de vente.",
    cta: "Demander un devis 3D",
    items: [
      {
        title: "Rendus photoréalistes",
        body: "Extérieurs et intérieurs, de jour comme de nuit, pour la page, les annonces et la brochure.",
      },
      {
        title: "Films",
        body: "Le film du programme, pour vos réseaux, vos salons et le bureau de vente.",
      },
      {
        title: "Visites 360°",
        body: "Les intérieurs en panorama, reliés pièce par pièce.",
      },
      {
        title: "Vues orbitales",
        body: "La résidence qui tourne sur elle-même, chaque lot repéré pour être cliquable.",
      },
      {
        title: "Mouvements de caméra",
        body: "Des plans filmés qui emmènent l'acheteur d'une vue à l'autre.",
      },
    ] as { title: string; body: string }[],
  },
  onboarding: {
    eyebrow: "Mise en route",
    before: "Vous envoyez",
    accent: "trois choses.",
    after: "Nous faisons le reste.",
    send: "Vous envoyez",
    receive: "Vous recevez",
    sendItems: [
      {
        title: "Vos plans ou votre maquette 3D",
        detail: "Dans le format que votre architecte vous a remis.",
      },
      {
        title: "La liste des lots",
        detail: "Excel ou CSV : numéro, surface, chambres, prix, statut.",
      },
      { title: "Un plan par lot", detail: "En PDF." },
    ] as { title: string; detail?: string; chips?: string[] }[],
    receiveItems: [
      {
        title: "Votre lien, et son QR code",
        detail: "Pour vos annonces, vos panneaux et vos brochures.",
      },
      { title: "Chaque lot cliquable en 3D", detail: "Avec sa fiche, son plan et son statut." },
      {
        title: "Des demandes qui citent le lot",
        detail: "Sur WhatsApp, par appel ou par demande de visite.",
      },
      {
        title: "Votre espace pour tout mettre à jour vous-mêmes",
        detail: "Statuts, prix, photos, plans et textes en anglais.",
      },
    ],
  },
  faq: {
    eyebrow: "FAQ",
    before: "Les réponses",
    accent: "avant de vous lancer.",
    description: "Une autre question ? Posez-la pendant la démo.",
  },
  final: {
    before: "Montrez votre programme",
    accent: "comme s'il était déjà construit.",
    body: "30 minutes pour parcourir la démo ensemble et parler de votre programme. Sans engagement.",
    notes: ["Appel de 30 min", "Devis ferme avant de commencer"],
  },
};

const EN: typeof FR = {
  demoCta: "Book a demo",
  callCta: "Book a call",
  hero: {
    eyebrow: "3D sales plan · Developers",
    before: "Sell off-plan",
    accent: "in 3D,",
    after: "with live availability.",
    description:
      "One page per development. Buyers turn the residence with a finger, see every unit as available, reserved or sold, open its sheet and contact you naming it. Your team updates statuses in one click.",
    live: "See the live demo",
    points: ["Phone, tablet, computer", "Nothing to install", "French and English"],
    cards: [
      { title: "Villa 6 · Reserved", note: "Updated by your team · just now" },
      { title: "New enquiry", note: "Villa 7 · viewing request" },
      { title: "Comparison sent", note: "Villas 2, 4 and 8 · by link" },
      { title: "Search: 5 bedrooms", note: "Matches lit up in 3D" },
    ],
  },
  demo: {
    eyebrow: "Live demo",
    before: "Try it",
    accent: "as a buyer would.",
    description:
      "A fictional development of 14 villas in Marrakech, open to everyone: 3D views, unit sheets, 360° tour, neighbourhood, comparison and mortgage simulator.",
  },
  compare: {
    eyebrow: "What buyers can do",
    before: "More than a model,",
    accent: "more than a brochure.",
    description:
      "The model stays at the sales office and the brochure is frozen the day it's sent. The 3D sales plan goes wherever the buyer is, always up to date.",
    caption: "What buyers can do with a physical model, a PDF brochure and REV",
    feature: "Feature",
    columns: ["Physical model", "PDF brochure", "REV"],
    marks: { yes: "Yes", part: "Partly", no: "No" },
    rows: [
      {
        label: "See the development from every angle",
        cells: [["part", "At the sales office"], ["part", "A few images"], "yes"],
      },
      { label: "Open a floor or a villa", cells: ["no", ["part", "Floor plans"], "yes"] },
      { label: "Live availability", cells: ["no", ["no", "Frozen when sent"], "yes"] },
      { label: "Each unit's sheet and plan", cells: ["no", ["part", "By unit type"], "yes"] },
      { label: "360° tour", cells: ["no", "no", "yes"] },
      { label: "Neighbourhood and travel times", cells: ["no", ["part", "Static map"], "yes"] },
      { label: "Compare units and send the comparison", cells: ["no", "no", "yes"] },
      { label: "Search by budget, area, bedrooms", cells: ["no", "no", "yes"] },
      { label: "Mortgage simulator", cells: ["no", "no", "yes"] },
      { label: "Contact that names the unit", cells: [["part", "On site"], "no", "yes"] },
      {
        label: "French and English",
        cells: [["part", "Depends on staff"], ["part", "One PDF per language"], "yes"],
      },
    ],
  },
  buyers: {
    eyebrow: "For your buyers",
    before: "Everything to choose a unit",
    accent: "before the first meeting.",
    isNew: "New",
    items: [
      {
        title: "The residence in 3D, by touch",
        body: "Aerial, roof, floors, street view: buyers turn, zoom and tap a unit.",
      },
      {
        title: "Filmed camera moves",
        body: "When a buyer picks a view, a filmed shot takes them there.",
        isNew: true,
      },
      {
        title: "Live status",
        body: "Every unit in colour: available, reserved or sold, updated by your team.",
      },
      {
        title: "Sheet, plan and mortgage",
        body: "Area, bedrooms, price or price on request, the unit's plan and a mortgage simulator.",
      },
      {
        title: "360° tour",
        body: "Rooms in panorama, on a computer or with the phone's gyroscope.",
      },
      {
        title: "Neighbourhood and journeys",
        body: "Schools, golf, airport: what's nearby, and how many minutes away.",
      },
      {
        title: "Search that lights up the 3D",
        body: "Budget, area, bedrooms: matching units stay lit, the others fade.",
      },
      {
        title: "Comparison to share",
        body: "Up to 3 units side by side, sent by link to family or the bank.",
      },
    ],
    contact: {
      title: "Buyers contact you with the unit already named.",
      body: "From the unit sheet, they message you on WhatsApp, call you or request a viewing: your sales team knows straight away which unit it's about.",
      chips: ["WhatsApp", "Call", "Viewing request"],
    },
  },
  teams: {
    eyebrow: "For your teams",
    before: "Your developer space:",
    accent: "one click,",
    after: "and the page is up to date.",
    description:
      "Marking a unit as sold takes no email and no waiting: your team does it itself, and every buyer sees it straight away.",
    items: [
      {
        title: "Status in one click",
        body: "Available, reserved, sold. CSV import and export of the whole unit list.",
      },
      {
        title: "Real-time enquiries",
        body: "Each enquiry arrives with the unit named, and you reply on WhatsApp in one tap.",
      },
      {
        title: "Statistics",
        body: "Page visits, most viewed units, where enquiries come from.",
      },
      {
        title: "Links and QR codes",
        body: "One link for the development and one for each unit, for your ads and brochures.",
      },
      {
        title: "On your website",
        body: "The sales plan in an iframe that sizes itself to fit.",
      },
      {
        title: "Presentation mode",
        body: "Full screen on the sales office tablet, back to the start between visitors.",
      },
      {
        title: "White label",
        body: "Your logo, colour and font. The “Powered by REV” line stays at the foot of the page.",
      },
    ],
    poweredBy: "Powered by",
    mock: {
      label: "Illustration of the developer space: each villa's status changes in one click.",
      title: "Developer space",
      programme: "Villas de démonstration",
      live: "Page live",
      statuses: ["Available", "Reserved", "Sold"],
      rows: FR.teams.mock.rows,
      toast: "New enquiry",
      toastNote: "Villa 7 · viewing request",
      now: "just now",
      importCsv: "Import CSV",
      exportCsv: "Export",
    },
  },
  studio: {
    eyebrow: "3D studio",
    before: "No 3D yet?",
    accent: "Our studio makes it.",
    description:
      "From your plans, our studio creates your development's images and films, then connects them to your sales plan.",
    cta: "Request a 3D quote",
    items: [
      {
        title: "Photoreal renders",
        body: "Exteriors and interiors, by day or by night, for the page, your ads and the brochure.",
      },
      {
        title: "Films",
        body: "The development's film, for social media, property fairs and the sales office.",
      },
      {
        title: "360° tours",
        body: "Interiors in panorama, linked room by room.",
      },
      {
        title: "Orbital views",
        body: "The residence turning on itself, every unit mapped so it can be clicked.",
      },
      {
        title: "Camera moves",
        body: "Filmed shots that carry the buyer from one view to the next.",
      },
    ],
  },
  onboarding: {
    eyebrow: "Getting started",
    before: "You send",
    accent: "three things.",
    after: "We do the rest.",
    send: "You send",
    receive: "You receive",
    sendItems: [
      {
        title: "Your plans or your 3D model",
        detail: "In whatever format your architect gave you.",
      },
      {
        title: "The unit list",
        detail: "Excel or CSV: number, area, bedrooms, price, status.",
      },
      { title: "One plan per unit", detail: "As a PDF." },
    ],
    receiveItems: [
      { title: "Your link, and its QR code", detail: "For your ads, site boards and brochures." },
      { title: "Every unit clickable in 3D", detail: "With its sheet, its plan and its status." },
      {
        title: "Enquiries that name the unit",
        detail: "On WhatsApp, by phone or as a viewing request.",
      },
      {
        title: "Your own space to update everything yourselves",
        detail: "Statuses, prices, photos, plans and English texts.",
      },
    ],
  },
  faq: {
    eyebrow: "FAQ",
    before: "Answers",
    accent: "before you start.",
    description: "Another question? Ask it during the demo.",
  },
  final: {
    before: "Show your development",
    accent: "as if it were already built.",
    body: "30 minutes to walk through the demo together and talk about your development. No commitment.",
    notes: ["30-minute call", "Fixed quote before we start"],
  },
};

const COPY = { fr: FR, en: EN };
type Copy = typeof FR;

const HERO_POINT_ICONS: Icon[] = [MonitorSmartphone, Check, MessageCircle];
const HERO_CARD_ICONS: Icon[] = [CircleDot, Inbox, GitCompareArrows, SlidersHorizontal];
const BUYER_ICONS: Icon[] = [
  Rotate3d,
  Clapperboard,
  CircleDot,
  FileText,
  View,
  MapPin,
  SlidersHorizontal,
  GitCompareArrows,
];
const CONTACT_ICONS: Icon[] = [MessageCircle, Phone, CalendarCheck];
const TEAM_ICONS: Icon[] = [
  MousePointerClick,
  Inbox,
  ChartColumn,
  QrCode,
  CodeXml,
  Presentation,
  Palette,
];
const STUDIO_ICONS: Icon[] = [Image, Film, View, Rotate3d, Clapperboard];

/** Snap carousel on phones and tablets, a grid from `lg` (few items fill the width). */
const CAROUSEL =
  "-mx-5 flex snap-x snap-mandatory scroll-px-5 gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] sm:-mx-6 sm:scroll-px-6 sm:px-6 md:-mx-10 md:scroll-px-10 md:px-10 lg:mx-0 lg:grid lg:snap-none lg:overflow-visible lg:px-0 lg:pb-0 [&::-webkit-scrollbar]:hidden";

export function SalesPlanPage() {
  const locale = useLocale();
  const copy = COPY[locale];
  const [launched, setLaunched] = useState(false);

  return (
    <>
      <Hero copy={copy} onLive={() => setLaunched(true)} />

      <Section id="demo" className="pt-8 sm:pt-10 lg:pt-12">
        <Container>
          <SalesPlanDemo
            heading={
              <AccentHeading
                eyebrow={copy.demo.eyebrow}
                before={copy.demo.before}
                accent={copy.demo.accent}
                description={copy.demo.description}
              />
            }
            launched={launched}
            onLaunch={() => setLaunched(true)}
            onClose={() => setLaunched(false)}
          />
        </Container>
      </Section>

      <Comparison copy={copy} />
      <Buyers copy={copy} />
      <Teams copy={copy} />
      <Studio copy={copy} />
      <Onboarding copy={copy} />
      <SalesPlanFaq copy={copy} />
      <FinalCta copy={copy} />
    </>
  );
}

/* ----------------------------------------------------------------- hero */

function Hero({ copy, onLive }: { copy: Copy; onLive: () => void }) {
  const locale = useLocale();
  const h = copy.hero;
  return (
    <section className="relative overflow-hidden border-b border-border/70 pb-10 pt-28 md:pb-14 md:pt-36">
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
            <div
              className="mt-7 grid grid-cols-1 gap-2.5 sm:flex sm:flex-wrap sm:gap-3"
              style={fadeUp(0.15)}
            >
              <Cta href="#demo" onClick={onLive}>
                {h.live}
                <ArrowRight size={16} aria-hidden />
              </Cta>
              <Cta href={salesPlanDemoUrl(locale)} variant="ghost">
                {copy.demoCta}
                <ArrowUpRight size={16} aria-hidden />
              </Cta>
            </div>
            <ul
              className="mt-7 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:gap-x-6"
              style={fadeUp(0.22)}
            >
              {h.points.map((label, i) => {
                const PointIcon = HERO_POINT_ICONS[i] ?? Check;
                return (
                  <li
                    key={label}
                    className="flex items-center gap-2.5 text-sm text-muted-foreground"
                  >
                    <PointIcon size={15} className="shrink-0 text-primary" aria-hidden />
                    {label}
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Illustrative events of a live sales plan (decorative). */}
          <div aria-hidden className="relative mx-auto hidden lg:block" style={fadeUp(0.12)}>
            <div className="flex w-[310px] flex-col gap-3">
              {h.cards.map(({ title, note }, i) => {
                const CardIcon = HERO_CARD_ICONS[i] ?? Check;
                return (
                  <div
                    key={title}
                    className="flex items-center gap-3 rounded-2xl border border-border bg-card/80 px-4 py-3 shadow-[var(--shadow-soft)] backdrop-blur-xl"
                    style={{
                      marginLeft: `${(i % 2) * 28}px`,
                      animation: `rev-float ${6 + i}s ease-in-out ${-i}s infinite`,
                    }}
                  >
                    <span
                      className={cn(
                        "grid h-9 w-9 shrink-0 place-items-center rounded-xl",
                        i === 1 ? "bg-primary text-primary-foreground" : "bg-elevated text-primary",
                      )}
                    >
                      <CardIcon size={16} />
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

/* ----------------------------------------------------------- comparison */

function MarkView({
  cell,
  labels,
  rev,
}: {
  cell: Cell;
  labels: Record<Mark, string>;
  rev: boolean;
}) {
  const [mark, note] = typeof cell === "string" ? [cell, undefined] : cell;
  return (
    <span className="flex flex-col items-center">
      {mark === "yes" ? (
        <span
          aria-hidden
          className={cn(
            "grid size-6 place-items-center rounded-full",
            rev ? "bg-primary text-primary-foreground" : "bg-foreground/15 text-foreground",
          )}
        >
          <Check size={13} strokeWidth={3} />
        </span>
      ) : mark === "part" ? (
        <span
          aria-hidden
          className="block size-[18px] rounded-full border-[1.5px] border-muted-foreground/70"
          style={{
            background:
              "linear-gradient(90deg, color-mix(in oklab, var(--muted-foreground) 70%, transparent) 50%, transparent 50%)",
          }}
        />
      ) : (
        <Minus size={16} aria-hidden className="text-muted-foreground/50" />
      )}
      <span className="sr-only">{labels[mark]}</span>
      {note ? (
        <span className="mt-1 block text-[10.5px] leading-tight text-muted-foreground sm:text-xs">
          {note}
        </span>
      ) : null}
    </span>
  );
}

function Comparison({ copy }: { copy: Copy }) {
  const c = copy.compare;
  return (
    <Section id="comparatif" className="border-t border-border/70">
      <Container>
        <AccentHeading
          eyebrow={c.eyebrow}
          before={c.before}
          accent={c.accent}
          description={c.description}
        />

        <Reveal className="mt-8 sm:mt-10">
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <table className="w-full table-fixed border-collapse text-left">
              <caption className="sr-only">{c.caption}</caption>
              <colgroup>
                <col />
                <col className="w-16 sm:w-32 lg:w-44" />
                <col className="w-16 sm:w-32 lg:w-44" />
                <col className="w-16 sm:w-32 lg:w-44" />
              </colgroup>
              <thead>
                <tr className="border-b border-border">
                  <th
                    scope="col"
                    className="px-3 py-3 text-[11px] font-normal uppercase tracking-[0.16em] text-muted-foreground sm:px-6 sm:py-4"
                  >
                    {c.feature}
                  </th>
                  {c.columns.map((label, i) => (
                    <th
                      key={label}
                      scope="col"
                      className={cn(
                        "px-1 py-3 text-center align-middle sm:px-3 sm:py-4",
                        i === 2
                          ? "bg-primary/10 font-display text-sm font-medium text-primary sm:text-base"
                          : "text-[11px] font-medium leading-tight text-muted-foreground sm:text-[13px]",
                      )}
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {c.rows.map((row) => (
                  <tr key={row.label} className="border-b border-border/60 last:border-0">
                    <th
                      scope="row"
                      className="px-3 py-3 text-[13px] font-normal leading-snug text-foreground/90 sm:px-6 sm:py-3.5 sm:text-sm"
                    >
                      {row.label}
                    </th>
                    {row.cells.map((cell, i) => (
                      <td
                        key={i}
                        className={cn(
                          "px-1 py-3 text-center align-middle sm:px-3",
                          i === 2 && "bg-primary/10",
                        )}
                      >
                        <MarkView cell={cell} labels={c.marks} rev={i === 2} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul
            className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-muted-foreground"
            aria-hidden
          >
            {(["yes", "part", "no"] as const).map((mark) => (
              <li key={mark} className="flex items-center gap-2">
                <span className="inline-flex scale-[0.8]">
                  <MarkView cell={mark} labels={c.marks} rev />
                </span>
                {c.marks[mark]}
              </li>
            ))}
          </ul>
        </Reveal>
      </Container>
    </Section>
  );
}

/* --------------------------------------------------------------- buyers */

function Buyers({ copy }: { copy: Copy }) {
  const b = copy.buyers;
  return (
    <Section id="acheteurs" className="border-t border-border/70">
      <Container>
        <AccentHeading eyebrow={b.eyebrow} before={b.before} accent={b.accent} />

        {/* Compact rows on phones, cards from `sm`. */}
        <ul className="mt-8 grid gap-2.5 sm:mt-10 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          {b.items.map((item, i) => {
            const ItemIcon = BUYER_ICONS[i] ?? Check;
            return (
              <Reveal as="li" key={item.title} delay={(i % 4) * 70}>
                <article className="surface relative flex h-full gap-3.5 p-4 sm:block sm:p-6">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-border bg-background/60 text-primary sm:h-10 sm:w-10">
                    <ItemIcon size={17} aria-hidden />
                  </span>
                  <div className="min-w-0 sm:mt-4">
                    <h3 className="font-display text-[15px] font-medium leading-snug tracking-tight sm:text-lg">
                      {item.title}
                      {item.isNew ? (
                        <span className="ml-2 inline-block rounded-md bg-primary px-2 py-0.5 align-[2px] font-sans text-[10px] font-medium uppercase tracking-[0.14em] text-primary-foreground sm:absolute sm:right-4 sm:top-4 sm:ml-0">
                          {b.isNew}
                        </span>
                      ) : null}
                    </h3>
                    <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground sm:mt-1.5 sm:text-sm">
                      {item.body}
                    </p>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </ul>

        <Reveal className="mt-3 sm:mt-4">
          <div className="flex flex-col gap-4 rounded-2xl border border-primary/35 bg-primary/5 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
            <div className="flex gap-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
                <MessageCircle size={19} aria-hidden />
              </span>
              <div>
                <h3 className="font-display text-base font-medium tracking-tight sm:text-lg">
                  {b.contact.title}
                </h3>
                <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                  {b.contact.body}
                </p>
              </div>
            </div>
            <ul className="flex shrink-0 flex-wrap gap-2">
              {b.contact.chips.map((chip, i) => {
                const ChipIcon = CONTACT_ICONS[i] ?? Check;
                return (
                  <li
                    key={chip}
                    className="inline-flex items-center gap-2 rounded-lg border border-border bg-background/60 px-3 py-2 text-[13px] text-foreground/85"
                  >
                    <ChipIcon size={14} className="text-primary" aria-hidden />
                    {chip}
                  </li>
                );
              })}
            </ul>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}

/* ---------------------------------------------------------------- teams */

const MOCK_STATUS = [
  "bg-primary text-primary-foreground",
  "bg-amber-400/75 text-black",
  "bg-zinc-500 text-white",
];

function TeamsMock({ copy }: { copy: Copy }) {
  const m = copy.teams.mock;
  return (
    <div role="img" aria-label={m.label} className="surface flex h-full flex-col overflow-hidden">
      <div aria-hidden className="flex h-full flex-col">
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-5">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              {m.title}
            </p>
            <p className="mt-0.5 truncate font-display text-[15px] font-medium tracking-tight">
              {m.programme}
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-primary/40 px-2.5 py-1 text-[11px] text-primary">
            <span className="size-1.5 rounded-full bg-primary" />
            {m.live}
          </span>
        </div>

        <ul className="divide-y divide-border/70 px-4 sm:px-5">
          {m.rows.map((row, i) => (
            <li
              key={row.lot}
              className={cn(
                "flex items-center justify-between gap-3 py-2.5",
                i >= 4 && "hidden lg:flex",
              )}
            >
              <span className="text-[13px] font-medium">{row.lot}</span>
              <span className="flex rounded-lg border border-border bg-background/60 p-0.5">
                {m.statuses.map((label, s) => (
                  <span
                    key={label}
                    className={cn(
                      "rounded-md px-2 py-1 text-[11px] sm:px-2.5",
                      s === row.status ? MOCK_STATUS[s] : "text-muted-foreground",
                    )}
                  >
                    {label}
                  </span>
                ))}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-auto space-y-3 p-4 sm:p-5">
          <div className="flex items-center gap-3 rounded-xl border border-border bg-elevated/70 px-3.5 py-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
              <Inbox size={15} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[13px] font-medium">{m.toast}</span>
              <span className="block truncate text-xs text-muted-foreground">{m.toastNote}</span>
            </span>
            <span className="shrink-0 text-[11px] text-muted-foreground">{m.now}</span>
          </div>
          <div className="flex gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-[11px] text-muted-foreground">
              <Upload size={12} />
              {m.importCsv}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-[11px] text-muted-foreground">
              <FileText size={12} />
              {m.exportCsv}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Teams({ copy }: { copy: Copy }) {
  const t = copy.teams;
  return (
    <Section id="equipes" className="border-t border-border/70">
      <Container>
        <AccentHeading
          eyebrow={t.eyebrow}
          before={t.before}
          accent={t.accent}
          after={t.after}
          description={t.description}
        />

        <div className="mt-8 grid gap-3 sm:mt-10 sm:gap-4 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <Reveal className="h-full">
            <TeamsMock copy={copy} />
          </Reveal>

          <ul className="grid gap-2.5 sm:grid-cols-2 sm:gap-3">
            {t.items.map((item, i) => {
              const ItemIcon = TEAM_ICONS[i] ?? Check;
              const last = i === t.items.length - 1;
              return (
                <Reveal
                  as="li"
                  key={item.title}
                  delay={(i % 2) * 60}
                  className={cn(last && "sm:col-span-2")}
                >
                  <div
                    className={cn(
                      "flex h-full gap-3.5 rounded-2xl border border-border bg-card p-3.5 sm:p-5",
                      last && "sm:items-center sm:justify-between",
                    )}
                  >
                    <div className="flex gap-3.5">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-border bg-background/60 text-primary">
                        <ItemIcon size={16} aria-hidden />
                      </span>
                      <div className="min-w-0">
                        <h3 className="font-display text-[15px] font-medium tracking-tight">
                          {item.title}
                        </h3>
                        <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                          {item.body}
                        </p>
                      </div>
                    </div>
                    {last ? (
                      <span className="hidden shrink-0 items-center gap-2.5 rounded-xl border border-border bg-background/60 px-3.5 py-2 text-xs text-muted-foreground sm:inline-flex">
                        {t.poweredBy}
                        <RevLogo variant="compact" lazy className="h-6 w-auto" />
                      </span>
                    ) : null}
                  </div>
                </Reveal>
              );
            })}
          </ul>
        </div>
      </Container>
    </Section>
  );
}

/* --------------------------------------------------------------- studio */

function Studio({ copy }: { copy: Copy }) {
  const locale = useLocale();
  const s = copy.studio;
  return (
    <Section id="studio" className="border-t border-border/70">
      <Container>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
          <AccentHeading
            eyebrow={s.eyebrow}
            before={s.before}
            accent={s.accent}
            description={s.description}
          />
          <Reveal className="shrink-0">
            <Cta href={href("contact", locale)} variant="ghost">
              {s.cta}
              <ArrowUpRight size={16} aria-hidden />
            </Cta>
          </Reveal>
        </div>

        <ul className={cn("mt-8 sm:mt-10 lg:grid-cols-5 lg:gap-4", CAROUSEL)}>
          {s.items.map((item, i) => {
            const ItemIcon = STUDIO_ICONS[i] ?? Check;
            return (
              <Reveal
                as="li"
                key={item.title}
                delay={i * 60}
                className="w-[72%] shrink-0 snap-start sm:w-[42%] md:w-[31%] lg:w-auto"
              >
                <article className="surface flex h-full flex-col p-5">
                  <span className="grid h-10 w-10 place-items-center rounded-xl border border-border bg-background/60 text-primary">
                    <ItemIcon size={17} aria-hidden />
                  </span>
                  <h3 className="mt-4 font-display text-base font-medium tracking-tight sm:text-[17px]">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
                    {item.body}
                  </p>
                </article>
              </Reveal>
            );
          })}
        </ul>
      </Container>
    </Section>
  );
}

/* ----------------------------------------------------------- onboarding */

function Onboarding({ copy }: { copy: Copy }) {
  const o = copy.onboarding;
  return (
    <Section id="mise-en-route" className="border-t border-border/70">
      <Container>
        <AccentHeading eyebrow={o.eyebrow} before={o.before} accent={o.accent} after={o.after} />

        <div className="mt-8 grid items-stretch gap-3 sm:mt-10 sm:gap-4 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
          <Reveal className="surface p-5 sm:p-6">
            <h3 className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
              {o.send}
            </h3>
            <ol className="mt-4 space-y-4">
              {o.sendItems.map((item, i) => (
                <li key={item.title} className="flex gap-4">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-primary/50 font-display text-xs font-medium text-primary">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0 pt-1">
                    <p className="text-[15px] font-medium leading-snug">{item.title}</p>
                    {item.detail ? (
                      <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                        {item.detail}
                      </p>
                    ) : null}
                    {item.chips ? (
                      <p className="mt-2 flex flex-wrap gap-1.5">
                        {item.chips.map((chip) => (
                          <span
                            key={chip}
                            className="rounded-md border border-border bg-background/60 px-2 py-0.5 text-[11px] text-muted-foreground"
                          >
                            {chip}
                          </span>
                        ))}
                      </p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ol>
          </Reveal>

          <div aria-hidden className="hidden items-center justify-center lg:flex">
            <span className="grid h-10 w-10 place-items-center rounded-full border border-border bg-card text-primary">
              <ArrowRight size={16} />
            </span>
          </div>

          <Reveal
            delay={80}
            className="rounded-2xl border border-primary/40 bg-primary/5 p-5 sm:p-6"
          >
            <h3 className="text-[11px] font-medium uppercase tracking-[0.2em] text-primary">
              {o.receive}
            </h3>
            <ul className="mt-4 space-y-3.5">
              {o.receiveItems.map((item) => (
                <li key={item.title} className="flex gap-3.5">
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
                    <Check size={13} strokeWidth={3} aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[15px] font-medium leading-snug">{item.title}</p>
                    <p className="mt-0.5 text-[13px] leading-relaxed text-muted-foreground">
                      {item.detail}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}

/* ------------------------------------------------------------------ faq */

function SalesPlanFaq({ copy }: { copy: Copy }) {
  const locale = useLocale();
  const f = copy.faq;
  const [open, setOpen] = useState<number | null>(0);
  return (
    <Section id="faq" className="border-t border-border/70">
      <Container>
        <div className="grid gap-6 sm:gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-14">
          <AccentHeading
            eyebrow={f.eyebrow}
            before={f.before}
            accent={f.accent}
            description={f.description}
          />
          <Reveal>
            <ul className="border-t border-border">
              {SALES_PLAN_FAQ[locale].map((item, i) => {
                const isOpen = open === i;
                const id = `faq-${i}`;
                return (
                  <li key={item.q} className="border-b border-border">
                    <h3>
                      <button
                        type="button"
                        onClick={() => setOpen(isOpen ? null : i)}
                        aria-expanded={isOpen}
                        aria-controls={id}
                        className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-4 py-4 text-left transition-colors duration-300 hover:text-primary sm:gap-6 sm:py-5"
                      >
                        <span className="font-display text-base font-medium tracking-tight md:text-lg">
                          {item.q}
                        </span>
                        <Plus
                          size={18}
                          aria-hidden
                          className={cn(
                            "shrink-0 text-muted-foreground transition-transform duration-500",
                            isOpen && "rotate-45 text-primary",
                          )}
                        />
                      </button>
                    </h3>
                    <div
                      id={id}
                      className="grid transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                      style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                    >
                      <div className="overflow-hidden" inert={!isOpen}>
                        <p className="max-w-2xl pb-5 text-sm leading-relaxed text-muted-foreground">
                          {item.a}
                        </p>
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

/* ------------------------------------------------------------ final cta */

function FinalCta({ copy }: { copy: Copy }) {
  const locale = useLocale();
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
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-[15px] text-muted-foreground sm:text-base">
            {f.body}
          </p>
          <div className="relative mt-7 flex flex-wrap justify-center gap-3">
            <Cta href={salesPlanDemoUrl(locale)}>
              {copy.demoCta}
              <ArrowUpRight size={16} aria-hidden />
            </Cta>
            <Cta href={href("contact", locale)} variant="ghost">
              {copy.callCta}
            </Cta>
          </div>
          <p className="relative mt-5 flex flex-wrap justify-center gap-x-5 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <CalendarCheck size={13} className="text-primary" aria-hidden /> {f.notes[0]}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check size={13} className="text-primary" aria-hidden /> {f.notes[1]}
            </span>
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
