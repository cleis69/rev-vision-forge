import { useState, type ReactNode } from "react";
import {
  Calculator,
  GitCompareArrows,
  Layers,
  LoaderCircle,
  Lock,
  MapPin,
  Maximize2,
  Monitor,
  MousePointerClick,
  Play,
  Presentation,
  Rotate3d,
  SlidersHorizontal,
  Smartphone,
  View,
  X,
} from "lucide-react";

import { photo } from "@/lib/images";
import { useLocale, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Cta } from "./ui";

/*
 * The live demo of the 3D sales plan (a fictional programme, open to all),
 * in a computer or phone frame. Nothing of the demo loads until the visitor
 * clicks "Launch the demo": the poster is a photo of the site, so the page
 * stays light and no visit is counted on the programme by mere passers-by.
 */

const DEMO_SLUG = "villas-de-demonstration";
const DEMO_HOST = "realestatevision360.com";

const demoPath = (locale: Locale) => `${locale === "en" ? "/en" : ""}/p/${DEMO_SLUG}`;

const villa = photo("hero-villa");

type Device = "computer" | "phone";

const TIP_ICONS = [
  Rotate3d,
  MousePointerClick,
  Layers,
  SlidersHorizontal,
  GitCompareArrows,
  View,
  Calculator,
  MapPin,
];

const COPY = {
  fr: {
    device: "Afficher la démo sur",
    computer: "Ordinateur",
    phone: "Téléphone",
    fullScreen: "Ouvrir en plein écran",
    fullScreenShort: "Plein écran",
    presentation: "Mode présentation",
    presentationHint: "Plein écran pour la tablette du bureau de vente",
    newTab: "(nouvel onglet)",
    close: "Fermer la démo",
    badge: "Programme fictif",
    name: "Villas de démonstration",
    meta: "14 villas · Marrakech",
    launch: "Lancer la démo",
    note: "Sans inscription · au doigt ou à la souris",
    loading: "Chargement de la démo…",
    frameTitle: "Démo du plan de vente 3D — Villas de démonstration",
    status: ["Disponible", "Réservé", "Vendu"],
    legend: "Légende des statuts",
    tipsTitle: "À essayer",
    phoneNote: "Sur téléphone, c'est la même page, pensée d'abord pour le doigt.",
    tips: [
      "Tournez la résidence",
      "Touchez une villa",
      "Changez de vue",
      "Cherchez par budget ou chambres",
      "Comparez trois villas",
      "Faites la visite 360°",
      "Simulez le crédit",
      "Explorez le quartier",
    ],
  },
  en: {
    device: "Show the demo on",
    computer: "Computer",
    phone: "Phone",
    fullScreen: "Open full screen",
    fullScreenShort: "Full screen",
    presentation: "Presentation mode",
    presentationHint: "Full screen for the sales office tablet",
    newTab: "(new tab)",
    close: "Close the demo",
    badge: "Fictional development",
    // The programme's own name, as on its page.
    name: "Villas de démonstration",
    meta: "14 villas · Marrakech",
    launch: "Launch the demo",
    note: "No sign-up · finger or mouse",
    loading: "Loading the demo…",
    frameTitle: "3D sales plan demo — Villas de démonstration",
    status: ["Available", "Reserved", "Sold"],
    legend: "Status legend",
    tipsTitle: "Things to try",
    phoneNote: "On a phone, it's the same page, designed for touch first.",
    tips: [
      "Turn the residence",
      "Tap a villa",
      "Switch views",
      "Search by budget or bedrooms",
      "Compare three villas",
      "Take the 360° tour",
      "Simulate the mortgage",
      "Explore the neighbourhood",
    ],
  },
} as const;

/** Swatches of the statuses, as the demo paints them on its views. */
const SWATCHES = [
  "border-primary bg-primary/45",
  "border-amber-400/90 bg-[repeating-linear-gradient(45deg,rgba(251,191,36,0.85)_0_2px,rgba(251,191,36,0.15)_2px_5px)]",
  "border-zinc-400/70 bg-zinc-600/70",
];

export function SalesPlanDemo({
  heading,
  launched,
  onLaunch,
  onClose,
}: {
  heading: ReactNode;
  launched: boolean;
  onLaunch: () => void;
  onClose: () => void;
}) {
  const locale = useLocale();
  const copy = COPY[locale];
  const path = demoPath(locale);
  const [device, setDevice] = useState<Device>("computer");
  const [loaded, setLoaded] = useState(false);
  const phone = device === "phone";

  const close = () => {
    setLoaded(false);
    onClose();
  };

  return (
    <>
      {heading}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-2 sm:mt-8 sm:gap-3">
        <div className={cn("flex flex-wrap items-center gap-2", !launched && "max-lg:hidden")}>
          <div
            role="group"
            aria-label={copy.device}
            className="hidden rounded-xl border border-border bg-card p-1 lg:inline-flex"
          >
            {(["computer", "phone"] as const).map((key) => {
              const Icon = key === "computer" ? Monitor : Smartphone;
              return (
                <button
                  key={key}
                  type="button"
                  aria-pressed={device === key}
                  onClick={() => setDevice(key)}
                  className={cn(
                    "inline-flex items-center gap-2 whitespace-nowrap rounded-lg px-3.5 py-2 text-[13px] font-medium transition-colors duration-300",
                    device === key
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon size={15} aria-hidden />
                  {copy[key]}
                </button>
              );
            })}
          </div>
          {launched ? (
            <button
              type="button"
              onClick={close}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-border px-4 text-[13px] font-medium text-muted-foreground transition-colors duration-300 hover:text-foreground"
            >
              <X size={15} aria-hidden />
              {copy.close}
            </button>
          ) : null}
        </div>
        <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center">
          <Cta href={path} newTab variant="ghost" className="h-10 px-3 text-[13px] sm:px-4">
            <Maximize2 size={15} aria-hidden />
            <span className="sm:hidden">{copy.fullScreenShort}</span>
            <span className="hidden sm:inline">{copy.fullScreen}</span>
            <span className="sr-only"> {copy.newTab}</span>
          </Cta>
          <span title={copy.presentationHint} className="flex">
            <Cta
              href={`${path}?mode=presentation`}
              newTab
              variant="ghost"
              className="h-10 w-full px-3 text-[13px] sm:px-4"
            >
              <Presentation size={15} aria-hidden />
              {copy.presentation}
              <span className="sr-only">
                {" "}
                — {copy.presentationHint} {copy.newTab}
              </span>
            </Cta>
          </span>
        </div>
      </div>

      <div
        className={cn(
          "mt-3 sm:mt-4",
          phone && "lg:grid lg:grid-cols-[auto_minmax(0,1fr)] lg:items-center lg:gap-14",
        )}
      >
        {/* One frame for both devices, so switching never reloads the demo. */}
        <div
          className={cn(
            "flex flex-col overflow-hidden shadow-[var(--shadow-lift)]",
            phone
              ? "mx-auto h-[720px] w-[340px] rounded-[3rem] border-[10px] border-[#161616] bg-black ring-1 ring-white/10"
              : "h-[min(72svh,620px)] w-full rounded-2xl border border-border bg-card sm:h-auto sm:aspect-[4/3] lg:aspect-[16/10]",
          )}
        >
          {phone ? (
            <div aria-hidden className="flex h-8 shrink-0 items-center justify-center bg-black">
              <span className="h-[18px] w-[88px] rounded-full bg-[#050505] ring-1 ring-white/10" />
            </div>
          ) : (
            <div
              aria-hidden
              className="flex h-10 shrink-0 items-center gap-3 border-b border-border bg-elevated/70 px-3 sm:px-4"
            >
              <span className="flex gap-1.5">
                <span className="size-2.5 rounded-full bg-white/15" />
                <span className="size-2.5 rounded-full bg-white/15" />
                <span className="size-2.5 rounded-full bg-white/15" />
              </span>
              <span className="mx-auto flex h-6 min-w-0 max-w-md flex-1 items-center justify-center gap-1.5 rounded-md bg-background/70 px-3 text-[11px] text-muted-foreground">
                <Lock size={10} className="shrink-0" />
                <span className="truncate">
                  {DEMO_HOST}
                  {path}
                </span>
              </span>
              <span className="hidden w-[42px] sm:block" />
            </div>
          )}

          <div className="@container relative min-h-0 flex-1 overflow-hidden bg-background">
            {launched && !loaded ? (
              <p className="absolute inset-0 flex items-center justify-center gap-2.5 text-sm text-muted-foreground">
                <LoaderCircle size={16} className="animate-spin text-primary" aria-hidden />
                {copy.loading}
              </p>
            ) : null}
            {launched ? (
              <iframe
                src={path}
                title={copy.frameTitle}
                loading="lazy"
                allow="fullscreen; clipboard-write; web-share; gyroscope; accelerometer"
                allowFullScreen
                onLoad={() => setLoaded(true)}
                className={cn(
                  "absolute inset-0 h-full w-full border-0 transition-opacity duration-500",
                  loaded ? "opacity-100" : "opacity-0",
                )}
              />
            ) : (
              <Poster copy={copy} onLaunch={onLaunch} />
            )}
          </div>
        </div>

        <Tips copy={copy} phone={phone} />
      </div>
    </>
  );
}

function Poster({ copy, onLaunch }: { copy: (typeof COPY)[Locale]; onLaunch: () => void }) {
  return (
    <div className="absolute inset-0">
      <img
        src={villa.src}
        srcSet={villa.srcSet}
        sizes="(min-width: 1240px) 1160px, 100vw"
        alt=""
        loading="lazy"
        decoding="async"
        width={1600}
        height={907}
        className="absolute inset-0 h-full w-full object-cover opacity-70"
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, color-mix(in oklab, var(--background) 35%, transparent) 0%, color-mix(in oklab, var(--background) 82%, transparent) 75%)",
        }}
      />
      <div className="relative flex h-full flex-col items-center justify-center px-5 text-center">
        <span className="rounded-full border border-white/15 bg-black/45 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-white/75 backdrop-blur-md">
          {copy.badge}
        </span>
        <p className="mt-4 font-display text-[1.6rem] font-medium leading-tight tracking-[-0.02em] text-white @2xl:text-[2.4rem]">
          {copy.name}
        </p>
        <p className="mt-1.5 text-sm text-white/70">{copy.meta}</p>
        <ul
          aria-label={copy.legend}
          className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-white/75"
        >
          {copy.status.map((label, i) => (
            <li key={label} className="flex items-center gap-2">
              <span aria-hidden className={cn("size-3 rounded-sm border", SWATCHES[i])} />
              {label}
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={onLaunch}
          className="mt-6 inline-flex h-12 items-center gap-3 rounded-full bg-primary pl-2 pr-6 text-sm font-medium text-primary-foreground shadow-[0_18px_40px_-16px_color-mix(in_oklab,var(--primary)_70%,transparent)] transition-[background-color,transform] duration-300 hover:bg-primary-hover active:scale-[0.98]"
        >
          <span className="grid size-8 place-items-center rounded-full bg-primary-foreground/10">
            <Play size={15} fill="currentColor" aria-hidden />
          </span>
          {copy.launch}
        </button>
        <p className="mt-3 text-xs text-white/55">{copy.note}</p>
      </div>
    </div>
  );
}

function Tips({ copy, phone }: { copy: (typeof COPY)[Locale]; phone: boolean }) {
  return (
    <div className={cn("mt-4 sm:flex sm:items-start sm:gap-4", phone && "lg:mt-0 lg:block")}>
      <p
        id="demo-tips"
        className={cn(
          "shrink-0 text-[11px] uppercase tracking-[0.2em] text-muted-foreground sm:pt-3",
          phone && "lg:pt-0",
        )}
      >
        {copy.tipsTitle}
      </p>
      {phone ? (
        <p className="mt-3 hidden max-w-lg font-display text-xl font-medium leading-snug tracking-tight text-foreground lg:block">
          {copy.phoneNote}
        </p>
      ) : null}
      <ul
        aria-labelledby="demo-tips"
        className={cn(
          "-mx-5 mt-2.5 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] sm:mx-0 sm:mt-0 sm:flex-wrap sm:px-0 [&::-webkit-scrollbar]:hidden",
          phone && "lg:mt-6 lg:grid lg:grid-cols-2 lg:gap-2.5",
        )}
      >
        {copy.tips.map((tip, i) => {
          const Icon = TIP_ICONS[i] ?? Rotate3d;
          return (
            <li
              key={tip}
              className={cn(
                "inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg border border-border bg-card px-3 py-2 text-[13px] text-foreground/85",
                phone && "lg:px-4 lg:py-3 lg:text-sm",
              )}
            >
              <Icon size={15} className="shrink-0 text-primary" aria-hidden />
              {tip}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
