import { useState } from "react";
import { ArrowUpRight, LoaderCircle, Play, X } from "lucide-react";

import { photo } from "@/lib/images";
import { useLocale, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/*
 * The live demo of the 3D sales plan (a fictional programme, open to all),
 * in a phone. Until the visitor asks for it, the phone shows a capture of
 * that same page, so the offer page stays light and passers-by count no
 * visit on the programme. On a computer the real page then loads inside the
 * phone and the capture fades into it; on a phone, the capture opens the
 * page itself.
 */

const DEMO_SLUG = "villas-de-demonstration";

export const demoPath = (locale: Locale) => `${locale === "en" ? "/en" : ""}/p/${DEMO_SLUG}`;

const capture = photo("demo-phone");

const COPY = {
  fr: {
    launch: "Essayer comme un acheteur",
    open: "Ouvrir la démo",
    note: "Programme fictif · sans inscription",
    loading: "Chargement de la démo…",
    close: "Revenir à l'image",
    frameTitle: "Démo du plan de vente 3D, Villas de démonstration",
    alt: "La page d'un programme sur téléphone : la résidence en 3D, la recherche « Je cherche une villa » et la liste des villas avec leur statut et leur prix.",
  },
  en: {
    launch: "Try it as a buyer",
    open: "Open the demo",
    note: "Fictional development · no sign-up",
    loading: "Loading the demo…",
    close: "Back to the picture",
    frameTitle: "3D sales plan demo, Villas de démonstration",
    alt: "A development's page on a phone: the residence in 3D, the “I'm looking for a villa” search and the list of villas with their status and price.",
  },
} as const;

/** Capture and page share one screen of 320 × 692, the phone's own proportions. */
const SCREEN = "h-[692px] w-[320px]";

export function SalesPlanDemo({
  launched,
  onLaunch,
  onClose,
}: {
  launched: boolean;
  onLaunch: () => void;
  onClose: () => void;
}) {
  const locale = useLocale();
  const copy = COPY[locale];
  const path = demoPath(locale);
  const [loaded, setLoaded] = useState(false);

  const close = () => {
    setLoaded(false);
    onClose();
  };

  return (
    <div id="demo" className="scroll-mt-24">
      {/* Computer: the real page loads inside the phone. */}
      <div className="hidden flex-col items-center lg:flex">
        <div className="rounded-[3rem] border-[10px] border-[#161616] bg-black shadow-[0_40px_80px_-32px_rgb(0_0_0/0.9)] ring-1 ring-white/10">
          <div className={cn("relative overflow-hidden rounded-[2.35rem]", SCREEN)}>
            {launched ? (
              <iframe
                src={path}
                title={copy.frameTitle}
                allow="fullscreen; clipboard-write; web-share; gyroscope; accelerometer"
                allowFullScreen
                onLoad={() => setLoaded(true)}
                // Laid out as on a 390 phone, like the capture, then scaled to the
                // screen: the capture fades into the same picture, without a jump.
                className="absolute left-0 top-0 h-[844px] w-[390px] origin-top-left scale-[0.8205] border-0 bg-background"
              />
            ) : null}
            {/* The capture stays over the page until it has loaded, then fades into it. */}
            <div
              className={cn(
                "absolute inset-0 transition-[opacity,filter] duration-700 ease-out",
                loaded && "pointer-events-none opacity-0 blur-sm",
              )}
            >
              <img
                src={capture.src}
                srcSet={capture.srcSet}
                sizes="320px"
                alt={copy.alt}
                width={390}
                height={844}
                fetchPriority="high"
                decoding="async"
                className="h-full w-full object-cover object-top"
              />
              <div
                aria-hidden
                className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-black from-25% via-black/80 to-transparent"
              />
              <div className="absolute inset-x-0 bottom-0 flex flex-col items-center px-5 pb-6">
                {launched ? (
                  <p
                    role="status"
                    className="inline-flex h-12 items-center gap-2.5 text-sm text-white/80"
                  >
                    <LoaderCircle size={16} className="animate-spin text-primary" aria-hidden />
                    {copy.loading}
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={onLaunch}
                    className="inline-flex h-12 w-full items-center justify-center gap-2.5 rounded-[10px] border border-white/20 bg-black/60 text-sm font-medium text-white backdrop-blur-md transition-colors duration-200 hover:border-white/40 hover:bg-black/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                  >
                    <Play size={14} fill="currentColor" aria-hidden />
                    {copy.launch}
                  </button>
                )}
                <p className="mt-2.5 text-xs text-white/60">{copy.note}</p>
              </div>
            </div>
          </div>
        </div>
        <p className="mt-3 h-9">
          {launched ? (
            <button
              type="button"
              onClick={close}
              className="inline-flex h-9 items-center gap-2 rounded-[10px] px-3 text-[13px] text-muted-foreground transition-colors duration-200 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            >
              <X size={14} aria-hidden />
              {copy.close}
            </button>
          ) : null}
        </p>
      </div>

      {/* Phone: the capture is the door to the page itself. */}
      <a
        href={path}
        className="group relative mx-auto block w-full max-w-[360px] overflow-hidden rounded-[2rem] border-[8px] border-[#161616] bg-black ring-1 ring-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 lg:hidden"
      >
        <img
          src={capture.src}
          srcSet={capture.srcSet}
          sizes="(min-width: 400px) 344px, calc(100vw - 56px)"
          alt=""
          width={390}
          height={844}
          decoding="async"
          className="aspect-[390/600] w-full object-cover object-top"
        />
        <span
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black from-25% via-black/80 to-transparent"
        />
        <span className="absolute inset-x-0 bottom-0 flex flex-col items-center px-4 pb-5">
          <span className="inline-flex h-12 w-full items-center justify-center gap-2.5 rounded-[10px] border border-white/20 bg-black/60 text-sm font-medium text-white backdrop-blur-md transition-colors duration-200 group-hover:border-white/40">
            {copy.open}
            <ArrowUpRight size={15} aria-hidden />
          </span>
          <span className="mt-2 text-xs text-white/60">{copy.note}</span>
        </span>
      </a>
    </div>
  );
}
