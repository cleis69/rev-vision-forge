import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  ArrowUpRight,
  Check,
  FileText,
  Inbox,
  Maximize2,
  Plus,
  Presentation,
  Upload,
} from "lucide-react";

import { RevLogo } from "@/components/rev/Logo";
import { SalesPlanDemo, demoPath } from "@/components/rev/SalesPlanDemo";
import { Container, Cta, fadeUp } from "@/components/rev/ui";
import { salesPlanDemoUrl } from "@/lib/contact";
import { SALES_PLAN_FAQ } from "@/lib/faq";
import { href, useLocale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/*
 * Offer page of the 3D sales plan (SaaS for property developers): the
 * product's spec sheet, set beside the product itself. The live demo is a
 * fictional programme: no client is named anywhere on this page.
 */

/** What a physical model or a PDF brochure does for the same need (null: nothing). */
type Other = string | null;

type BuyerLine = {
  title: string;
  body: string;
  model: Other;
  brochure: Other;
  isNew?: boolean;
};

const FR = {
  demoCta: "Prendre rendez-vous",
  callCta: "Planifier un appel",
  hero: {
    before: "Vendez sur plan",
    accent: "en 3D,",
    after: "avec les disponibilités en direct.",
    description:
      "Une page par programme. Vos acheteurs tournent la résidence du bout du doigt, voient chaque lot disponible, réservé ou vendu, ouvrent sa fiche et vous écrivent en le citant. Votre équipe met les statuts à jour en un clic.",
    tryDemo: "Essayer la démo",
    points: ["Téléphone, tablette, ordinateur", "Rien à installer", "Français et anglais"],
    fullScreen: "Plein écran",
    presentation: "Mode présentation",
    presentationHint: "plein écran pour la tablette du bureau de vente",
    newTab: "(nouvel onglet)",
  },
  buyers: {
    before: "Tout pour choisir son lot",
    accent: "avant le premier rendez-vous.",
    description:
      "La maquette reste au bureau de vente et la brochure est figée le jour de son envoi. Le plan de vente 3D suit l'acheteur partout, toujours à jour.",
    caption:
      "Ce que l'acheteur peut faire avec REV, avec une maquette physique et avec une brochure PDF",
    columns: { rev: "Avec REV", model: "Maquette physique", brochure: "Brochure PDF" },
    short: { model: "Maquette", brochure: "Brochure" },
    no: "non",
    colon: " : ",
    isNew: "Nouveau",
    lines: [
      {
        title: "La résidence en 3D, au doigt",
        body: "Vue aérienne, toiture, étages, vue piéton : l'acheteur tourne, zoome et touche un lot.",
        model: "Au bureau de vente",
        brochure: "Quelques images",
      },
      {
        title: "Mouvements de caméra filmés",
        body: "Quand l'acheteur change de vue, un plan filmé l'y emmène.",
        model: null,
        brochure: null,
        isNew: true,
      },
      {
        title: "Statuts en direct",
        body: "Chaque lot en couleur : disponible, réservé ou vendu, mis à jour par votre équipe.",
        model: null,
        brochure: "Figée à l'envoi",
      },
      {
        title: "Fiche, plan et crédit",
        body: "Surface, chambres, prix ou prix sur demande, plan du lot et simulateur de crédit.",
        model: null,
        brochure: "Par typologie",
      },
      {
        title: "Visite 360°",
        body: "Les pièces en panorama, sur ordinateur ou avec le gyroscope du téléphone.",
        model: null,
        brochure: null,
      },
      {
        title: "Quartier et trajets",
        body: "Écoles, golf, aéroport : ce qu'il y a autour, et à combien de minutes.",
        model: null,
        brochure: "Carte figée",
      },
      {
        title: "Recherche qui éclaire la 3D",
        body: "Budget, surface, chambres : les lots qui correspondent restent allumés, les autres s'estompent.",
        model: null,
        brochure: null,
      },
      {
        title: "Comparateur à partager",
        body: "Jusqu'à 3 lots côte à côte, envoyés par lien à un proche ou à son banquier.",
        model: null,
        brochure: null,
      },
      {
        title: "Un contact qui cite le lot",
        body: "Depuis la fiche, l'acheteur vous écrit sur WhatsApp, vous appelle ou demande une visite : votre commercial sait tout de suite de quel lot on parle.",
        model: "Sur place",
        brochure: null,
      },
      {
        title: "Français et anglais",
        body: "Chaque page existe dans les deux langues, et l'acheteur passe de l'une à l'autre en un geste.",
        model: "Selon l'équipe",
        brochure: "Un PDF par langue",
      },
    ] as BuyerLine[],
  },
  teams: {
    before: "Votre espace promoteur :",
    accent: "un clic,",
    after: "et la page est à jour.",
    description:
      "Passer un lot en vendu ne demande ni e-mail ni délai : votre équipe le fait elle-même, et tous les acheteurs le voient aussitôt.",
    lines: [
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
        title: "Intégré à votre site",
        body: "Une ligne à coller dans votre site : le plan de vente y apparaît et prend tout seul la bonne hauteur.",
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
    before: "Pas encore de 3D ?",
    accent: "Notre studio la produit.",
    description:
      "À partir de vos plans, notre studio crée les images et les films de votre programme, puis les relie à votre plan de vente.",
    cta: "Demander un devis 3D",
    lines: [
      {
        title: "Rendus photoréalistes",
        body: "Extérieurs et intérieurs, de jour comme de nuit, pour la page, les annonces et la brochure.",
      },
      {
        title: "Films",
        body: "Le film du programme, pour vos réseaux, vos salons et le bureau de vente.",
      },
      { title: "Visites 360°", body: "Les intérieurs en panorama, reliés pièce par pièce." },
      {
        title: "Vues orbitales",
        body: "La résidence qui tourne sur elle-même, chaque lot repéré pour être cliquable.",
      },
      {
        title: "Mouvements de caméra",
        body: "Des plans filmés qui emmènent l'acheteur d'une vue à l'autre.",
      },
    ],
  },
  onboarding: {
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
    ],
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
  demoCta: "Book a meeting",
  callCta: "Book a call",
  hero: {
    before: "Sell off-plan",
    accent: "in 3D,",
    after: "with live availability.",
    description:
      "One page per development. Buyers turn the residence with a finger, see every unit as available, reserved or sold, open its sheet and contact you naming it. Your team updates statuses in one click.",
    tryDemo: "Try the demo",
    points: ["Phone, tablet, computer", "Nothing to install", "French and English"],
    fullScreen: "Full screen",
    presentation: "Presentation mode",
    presentationHint: "full screen for the sales office tablet",
    newTab: "(new tab)",
  },
  buyers: {
    before: "Everything to choose a unit",
    accent: "before the first meeting.",
    description:
      "The model stays at the sales office and the brochure is frozen the day it's sent. The 3D sales plan goes wherever the buyer is, always up to date.",
    caption: "What buyers can do with REV, with a physical model and with a PDF brochure",
    columns: { rev: "With REV", model: "Physical model", brochure: "PDF brochure" },
    short: { model: "Model", brochure: "Brochure" },
    no: "no",
    colon: ": ",
    isNew: "New",
    lines: [
      {
        title: "The residence in 3D, by touch",
        body: "Aerial, roof, floors, street view: buyers turn, zoom and tap a unit.",
        model: "At the sales office",
        brochure: "A few images",
      },
      {
        title: "Filmed camera moves",
        body: "When a buyer picks a view, a filmed shot takes them there.",
        model: null,
        brochure: null,
        isNew: true,
      },
      {
        title: "Live status",
        body: "Every unit in colour: available, reserved or sold, updated by your team.",
        model: null,
        brochure: "Frozen when sent",
      },
      {
        title: "Sheet, plan and mortgage",
        body: "Area, bedrooms, price or price on request, the unit's plan and a mortgage simulator.",
        model: null,
        brochure: "By unit type",
      },
      {
        title: "360° tour",
        body: "Rooms in panorama, on a computer or with the phone's gyroscope.",
        model: null,
        brochure: null,
      },
      {
        title: "Neighbourhood and journeys",
        body: "Schools, golf, airport: what's nearby, and how many minutes away.",
        model: null,
        brochure: "Static map",
      },
      {
        title: "Search that lights up the 3D",
        body: "Budget, area, bedrooms: matching units stay lit, the others fade.",
        model: null,
        brochure: null,
      },
      {
        title: "Comparison to share",
        body: "Up to 3 units side by side, sent by link to family or the bank.",
        model: null,
        brochure: null,
      },
      {
        title: "Contact that names the unit",
        body: "From the unit sheet, buyers message you on WhatsApp, call you or request a viewing: your sales team knows straight away which unit it's about.",
        model: "On site",
        brochure: null,
      },
      {
        title: "French and English",
        body: "Every page exists in both languages, and buyers switch from one to the other in a tap.",
        model: "Depends on staff",
        brochure: "One PDF per language",
      },
    ],
  },
  teams: {
    before: "Your developer space:",
    accent: "one click,",
    after: "and the page is up to date.",
    description:
      "Marking a unit as sold takes no email and no waiting: your team does it itself, and every buyer sees it straight away.",
    lines: [
      {
        title: "Status in one click",
        body: "Available, reserved, sold. CSV import and export of the whole unit list.",
      },
      {
        title: "Real-time enquiries",
        body: "Each enquiry arrives with the unit named, and you reply on WhatsApp in one tap.",
      },
      { title: "Statistics", body: "Page visits, most viewed units, where enquiries come from." },
      {
        title: "Links and QR codes",
        body: "One link for the development and one for each unit, for your ads and brochures.",
      },
      {
        title: "Built into your website",
        body: "One line to paste into your site: the sales plan appears there and sizes itself to fit.",
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
    before: "No 3D yet?",
    accent: "Our studio makes it.",
    description:
      "From your plans, our studio creates your development's images and films, then connects them to your sales plan.",
    cta: "Request a 3D quote",
    lines: [
      {
        title: "Photoreal renders",
        body: "Exteriors and interiors, by day or by night, for the page, your ads and the brochure.",
      },
      {
        title: "Films",
        body: "The development's film, for social media, property fairs and the sales office.",
      },
      { title: "360° tours", body: "Interiors in panorama, linked room by room." },
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

/** Lower-cases the first letter, for a note read after a colon. */
const lower = (text: string) => text.charAt(0).toLowerCase() + text.slice(1);

export function SalesPlanPage() {
  const locale = useLocale();
  const copy = COPY[locale];
  const [launched, setLaunched] = useState(false);

  return (
    <>
      <Hero
        copy={copy}
        launched={launched}
        onLaunch={() => setLaunched(true)}
        onClose={() => setLaunched(false)}
      />
      <Buyers copy={copy} />
      <Teams copy={copy} />
      <Studio copy={copy} />
      <Onboarding copy={copy} />
      <SalesPlanFaq copy={copy} />
      <FinalCta copy={copy} />
    </>
  );
}

/* -------------------------------------------------------------- pieces */

/** A part of the sheet: a hairline above, a compact rhythm. */
function Part({
  id,
  children,
  className,
}: {
  id: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={cn("scroll-mt-20 border-t border-border/70 py-12 sm:py-14 lg:py-20", className)}
    >
      <Container>{children}</Container>
    </section>
  );
}

/** A title that speaks for itself: no label above it, one phrase in champagne. */
function Heading({
  as: Tag = "h2",
  before,
  accent,
  after,
  description,
  className,
}: {
  as?: "h1" | "h2";
  before: string;
  accent: string;
  after?: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn("max-w-3xl", className)}>
      <Tag
        className={cn(
          "font-display font-medium text-foreground [text-wrap:balance]",
          Tag === "h1"
            ? "text-[clamp(2.15rem,4.4vw,3.75rem)] leading-[1.04] tracking-[-0.035em]"
            : "text-[clamp(1.6rem,3vw,2.5rem)] leading-[1.1] tracking-[-0.03em]",
        )}
      >
        {before} <span className="text-primary">{accent}</span>
        {after ? ` ${after}` : ""}
      </Tag>
      {description ? (
        <p className="mt-4 max-w-[62ch] text-[15px] leading-relaxed text-muted-foreground md:text-base">
          {description}
        </p>
      ) : null}
    </div>
  );
}

/** One line of the sheet: the function's name, then what it does. */
function Line({ title, body, aside }: { title: string; body: string; aside?: ReactNode }) {
  return (
    <li className="grid gap-1 border-b border-border/70 py-4 sm:grid-cols-[13rem_minmax(0,1fr)] sm:gap-6 sm:py-5 lg:grid-cols-[15rem_minmax(0,1fr)_auto] lg:items-baseline">
      <h3 className="font-display text-[16px] font-medium leading-snug tracking-tight text-foreground sm:text-[17px]">
        {title}
      </h3>
      <p className="max-w-[60ch] text-sm leading-relaxed text-muted-foreground">{body}</p>
      {aside ? <div className="max-lg:mt-2 sm:col-start-2 lg:col-start-auto">{aside}</div> : null}
    </li>
  );
}

const TEXT_LINK =
  "inline-flex h-8 items-center gap-1.5 rounded-[6px] text-foreground/80 underline decoration-foreground/25 underline-offset-4 transition-colors duration-200 hover:text-foreground hover:decoration-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70";

/* ----------------------------------------------------------------- hero */

function Hero({
  copy,
  launched,
  onLaunch,
  onClose,
}: {
  copy: Copy;
  launched: boolean;
  onLaunch: () => void;
  onClose: () => void;
}) {
  const locale = useLocale();
  const h = copy.hero;
  const path = demoPath(locale);
  return (
    <section className="pb-12 pt-28 md:pt-32 lg:pb-16">
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-16 xl:gap-24">
          <div className="min-w-0" style={fadeUp(0)}>
            <Heading
              as="h1"
              before={h.before}
              accent={h.accent}
              after={h.after}
              description={h.description}
            />
            <div className="mt-7 grid grid-cols-1 gap-2.5 sm:flex sm:flex-wrap sm:gap-3">
              <Cta href={salesPlanDemoUrl(locale)} className="rounded-[10px]">
                {copy.demoCta}
                <ArrowUpRight size={16} aria-hidden />
              </Cta>
              {/* On a computer the demo opens in the phone beside; on a phone, the page itself. */}
              <Cta
                href="#demo"
                onClick={onLaunch}
                variant="ghost"
                className="rounded-[10px] max-lg:hidden"
              >
                {h.tryDemo}
              </Cta>
              <Cta href={path} variant="ghost" className="rounded-[10px] lg:hidden">
                {h.tryDemo}
              </Cta>
            </div>
            <ul className="mt-6 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-muted-foreground">
              {h.points.map((point) => (
                <li key={point} className="flex items-center gap-2 whitespace-nowrap">
                  <span aria-hidden className="size-1 rounded-full bg-primary/70" />
                  {point}
                </li>
              ))}
            </ul>
            <p className="mt-2 flex flex-wrap gap-x-5 text-[13px]">
              <a href={path} target="_blank" rel="noopener" className={TEXT_LINK}>
                <Maximize2 size={13} aria-hidden />
                {h.fullScreen}
                <span className="sr-only"> {h.newTab}</span>
              </a>
              <a
                href={`${path}?mode=presentation`}
                target="_blank"
                rel="noopener"
                className={TEXT_LINK}
              >
                <Presentation size={13} aria-hidden />
                {h.presentation}
                <span className="sr-only">
                  {" "}
                  : {h.presentationHint} {h.newTab}
                </span>
              </a>
            </p>
          </div>

          <div className="min-w-0" style={fadeUp(0.12)}>
            <SalesPlanDemo launched={launched} onLaunch={onLaunch} onClose={onClose} />
          </div>
        </div>
      </Container>
    </section>
  );
}

/* --------------------------------------------------------------- buyers */

function OtherCell({ value, no }: { value: Other; no: string }) {
  return value ? (
    <span className="text-[13px] leading-snug text-muted-foreground">{value}</span>
  ) : (
    <span className="text-[13px] text-foreground/30">
      <span aria-hidden>—</span>
      <span className="sr-only">{no}</span>
    </span>
  );
}

function Buyers({ copy }: { copy: Copy }) {
  const b = copy.buyers;
  return (
    <Part id="acheteurs">
      <Heading before={b.before} accent={b.accent} description={b.description} />

      <table className="mt-8 w-full border-collapse text-left sm:mt-10">
        <caption className="sr-only">{b.caption}</caption>
        <thead className="max-md:sr-only">
          <tr className="border-b border-border">
            <th scope="col" className="pb-3 text-[13px] font-medium text-primary">
              {b.columns.rev}
            </th>
            <th
              scope="col"
              className="w-44 pb-3 pl-6 text-[13px] font-normal text-muted-foreground lg:w-52"
            >
              {b.columns.model}
            </th>
            <th
              scope="col"
              className="w-44 pb-3 pl-6 text-[13px] font-normal text-muted-foreground lg:w-52"
            >
              {b.columns.brochure}
            </th>
          </tr>
        </thead>
        <tbody>
          {b.lines.map((line) => (
            <tr
              key={line.title}
              className="border-b border-border/70 align-baseline max-md:block max-md:py-4"
            >
              <th scope="row" className="py-5 pr-6 text-left font-normal max-md:block max-md:p-0">
                <span className="grid gap-1 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-6">
                  <span className="font-display text-[16px] font-medium leading-snug tracking-tight text-foreground sm:text-[17px]">
                    {line.title}
                    {line.isNew ? " " : null}
                    {line.isNew ? (
                      <span className="whitespace-nowrap font-sans text-[12px] font-medium text-primary">
                        {b.isNew}
                      </span>
                    ) : null}
                  </span>
                  <span className="block max-w-[60ch] text-sm leading-relaxed text-muted-foreground">
                    {line.body}
                  </span>
                </span>
              </th>
              <td className="py-5 pl-6 max-md:hidden">
                <OtherCell value={line.model} no={b.no} />
              </td>
              <td className="py-5 pl-6 max-md:hidden">
                <OtherCell value={line.brochure} no={b.no} />
              </td>
              {/* Phones: both answers on one line under the function. */}
              <td className="mt-2 block text-[13px] text-muted-foreground md:hidden">
                {b.short.model}
                {b.colon}
                {line.model ? lower(line.model) : b.no}
                <span aria-hidden className="mx-2 text-foreground/25">
                  ·
                </span>
                {b.short.brochure}
                {b.colon}
                {line.brochure ? lower(line.brochure) : b.no}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Part>
  );
}

/* ---------------------------------------------------------------- teams */

const MOCK_STATUS = [
  "bg-primary text-primary-foreground",
  "bg-amber-400/80 text-black",
  "bg-zinc-600 text-white",
];

/** Beats of the little scene the mock plays, 900 ms each, then again. */
const BEATS = 13;

/**
 * The promoter space at work: a villa is reserved, a request comes in,
 * another villa is sold. Plays while in sight, never with reduced motion
 * (then the mock stands still, the request shown).
 */
function useScene() {
  const ref = useRef<HTMLDivElement>(null);
  const [beat, setBeat] = useState<number | null>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let timer = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        window.clearInterval(timer);
        if (!entry?.isIntersecting) return;
        setBeat(0);
        timer = window.setInterval(() => setBeat((b) => ((b ?? 0) + 1) % BEATS), 900);
      },
      { threshold: 0.35 },
    );
    observer.observe(node);
    return () => {
      window.clearInterval(timer);
      observer.disconnect();
    };
  }, []);
  return { ref, beat };
}

function TeamsMock({ copy }: { copy: Copy }) {
  const m = copy.teams.mock;
  const { ref, beat } = useScene();
  const playing = beat !== null;
  const at = beat ?? 0;
  // Row 0 gets reserved at beat 2, row 3 sold at beat 7; all back at the last beat.
  const statusOf = (i: number, base: number) =>
    !playing
      ? base
      : i === 0
        ? at >= 2 && at < 12
          ? 1
          : 0
        : i === 3
          ? at >= 7 && at < 12
            ? 2
            : 1
          : base;
  const pressed = (i: number, s: number) =>
    playing && ((i === 0 && s === 1 && at === 1) || (i === 3 && s === 2 && at === 6));
  const toast = !playing || (at >= 4 && at < 12);
  const justSaved = playing && (at === 2 || at === 7);
  return (
    <div
      ref={ref}
      role="img"
      aria-label={m.label}
      className="overflow-hidden rounded-[10px] border border-border bg-card"
    >
      <div aria-hidden>
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-5">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">{m.title}</p>
            <p className="mt-0.5 truncate font-display text-[15px] font-medium tracking-tight">
              {m.programme}
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1.5 text-[11px] text-primary">
            <span className="relative grid size-1.5 place-items-center">
              {justSaved ? (
                <span className="absolute size-1.5 animate-ping rounded-full bg-primary" />
              ) : null}
              <span className="size-1.5 rounded-full bg-primary" />
            </span>
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
              <span className="text-[13px] font-medium tabular-nums">{row.lot}</span>
              <span className="flex rounded-[10px] border border-border bg-background/60 p-0.5">
                {m.statuses.map((label, s) => (
                  <span
                    key={label}
                    className={cn(
                      "rounded-[8px] px-2 py-1 text-[11px] transition-[background-color,color,box-shadow,transform] duration-300 ease-out sm:px-2.5",
                      s === statusOf(i, row.status) ? MOCK_STATUS[s] : "text-muted-foreground",
                      pressed(i, s) &&
                        "scale-95 text-foreground shadow-[0_0_0_1.5px_rgb(255_255_255/0.55)]",
                    )}
                  >
                    {label}
                  </span>
                ))}
              </span>
            </li>
          ))}
        </ul>

        <div className="space-y-3 border-t border-border p-4 sm:p-5">
          <div
            className={cn(
              "flex items-center gap-3 transition-[opacity,transform,filter] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
              !toast && "translate-y-1.5 opacity-0 blur-[2px]",
            )}
          >
            <span className="grid size-8 shrink-0 place-items-center rounded-[8px] bg-primary text-primary-foreground">
              <Inbox size={15} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[13px] font-medium">{m.toast}</span>
              <span className="block truncate text-xs text-muted-foreground">{m.toastNote}</span>
            </span>
            <span className="shrink-0 text-[11px] text-muted-foreground">{m.now}</span>
          </div>
          <div className="flex gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-[8px] border border-border px-3 py-1.5 text-[11px] text-muted-foreground">
              <Upload size={12} />
              {m.importCsv}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-[8px] border border-border px-3 py-1.5 text-[11px] text-muted-foreground">
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
  const last = t.lines.length - 1;
  return (
    <Part id="equipes">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:gap-16">
        <div>
          <Heading
            before={t.before}
            accent={t.accent}
            after={t.after}
            description={t.description}
          />
          <ul className="mt-8 border-t border-border sm:mt-10">
            {t.lines.map((line, i) => (
              <Line
                key={line.title}
                title={line.title}
                body={line.body}
                aside={
                  i === last ? (
                    <span className="inline-flex items-center gap-2.5 whitespace-nowrap text-xs text-muted-foreground">
                      {t.poweredBy}
                      <RevLogo variant="compact" lazy className="h-6 w-auto" />
                    </span>
                  ) : undefined
                }
              />
            ))}
          </ul>
        </div>
        <div className="lg:pt-2">
          <TeamsMock copy={copy} />
        </div>
      </div>
    </Part>
  );
}

/* --------------------------------------------------------------- studio */

function Studio({ copy }: { copy: Copy }) {
  const locale = useLocale();
  const s = copy.studio;
  return (
    <Part id="studio">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
        <Heading before={s.before} accent={s.accent} description={s.description} />
        <Cta
          href={href("contact", locale)}
          variant="ghost"
          className="shrink-0 self-start rounded-[10px] lg:self-auto"
        >
          {s.cta}
          <ArrowUpRight size={16} aria-hidden />
        </Cta>
      </div>
      <ul className="mt-8 border-t border-border sm:mt-10">
        {s.lines.map((line) => (
          <Line key={line.title} title={line.title} body={line.body} />
        ))}
      </ul>
    </Part>
  );
}

/* ----------------------------------------------------------- onboarding */

function Onboarding({ copy }: { copy: Copy }) {
  const o = copy.onboarding;
  return (
    <Part id="mise-en-route">
      <Heading before={o.before} accent={o.accent} after={o.after} />
      <div className="mt-8 grid gap-10 sm:mt-10 lg:grid-cols-2 lg:gap-16">
        <div>
          <h3 className="border-b border-border pb-3 text-[15px] font-medium text-foreground">
            {o.send}
          </h3>
          <ol>
            {o.sendItems.map((item, i) => (
              <li key={item.title} className="flex gap-4 border-b border-border/70 py-4">
                <span className="w-6 shrink-0 font-display text-[22px] font-medium leading-none tabular-nums text-primary">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-[15px] font-medium leading-snug">{item.title}</p>
                  <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                    {item.detail}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <div>
          <h3 className="border-b border-border pb-3 text-[15px] font-medium text-primary">
            {o.receive}
          </h3>
          <ul>
            {o.receiveItems.map((item) => (
              <li key={item.title} className="flex gap-4 border-b border-border/70 py-4">
                <Check
                  size={18}
                  strokeWidth={2.5}
                  className="mt-0.5 w-6 shrink-0 text-primary"
                  aria-hidden
                />
                <div className="min-w-0">
                  <p className="text-[15px] font-medium leading-snug">{item.title}</p>
                  <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                    {item.detail}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Part>
  );
}

/* ------------------------------------------------------------------ faq */

function SalesPlanFaq({ copy }: { copy: Copy }) {
  const locale = useLocale();
  const f = copy.faq;
  const [open, setOpen] = useState<number | null>(0);
  return (
    <Part id="faq">
      <div className="grid gap-6 sm:gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-14">
        <Heading before={f.before} accent={f.accent} description={f.description} />
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
                    className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-4 rounded-[6px] py-4 text-left transition-colors duration-200 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 sm:gap-6 sm:py-5"
                  >
                    <span className="font-display text-base font-medium tracking-tight md:text-lg">
                      {item.q}
                    </span>
                    <Plus
                      size={18}
                      aria-hidden
                      className={cn(
                        "shrink-0 text-muted-foreground transition-transform duration-300",
                        isOpen && "rotate-45 text-primary",
                      )}
                    />
                  </button>
                </h3>
                <div
                  id={id}
                  className="grid transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
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
      </div>
    </Part>
  );
}

/* ------------------------------------------------------------ final cta */

function FinalCta({ copy }: { copy: Copy }) {
  const locale = useLocale();
  const f = copy.final;
  return (
    <Part id="rendez-vous" className="lg:py-24">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
        <div>
          <Heading before={f.before} accent={f.accent} description={f.body} />
          <p className="mt-4 text-[13px] text-muted-foreground">
            {f.notes[0]}
            <span aria-hidden className="mx-2 text-foreground/25">
              ·
            </span>
            {f.notes[1]}
          </p>
        </div>
        <div className="grid shrink-0 grid-cols-1 gap-2.5 sm:flex sm:gap-3">
          <Cta href={salesPlanDemoUrl(locale)} className="rounded-[10px]">
            {copy.demoCta}
            <ArrowUpRight size={16} aria-hidden />
          </Cta>
          <Cta href={href("contact", locale)} variant="ghost" className="rounded-[10px]">
            {copy.callCta}
          </Cta>
        </div>
      </div>
    </Part>
  );
}
