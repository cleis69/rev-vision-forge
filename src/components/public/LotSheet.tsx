import { useEffect, useRef, useState, type ReactNode } from "react";
import { CalendarCheck, GitCompareArrows, Share2 } from "lucide-react";

import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import type { MediaItem } from "@/lib/app/media";
import { useCopy } from "@/lib/i18n";
import type { PublicLot } from "@/lib/public/programme";
import { cn } from "@/lib/utils";
import { WhatsAppIcon } from "./app/parts";
import { LotDetails, type LotSelling } from "./LotDetails";

const COPY = {
  fr: {
    visit: "Planifier une visite",
    compare: "Comparer",
    compared: "Dans le comparateur",
    share: "Partager",
    whatsapp: (numero: string) => `Partager le lot ${numero} sur WhatsApp`,
  },
  en: {
    visit: "Book a visit",
    compare: "Compare",
    compared: "In comparison",
    share: "Share",
    whatsapp: (numero: string) => `Share lot ${numero} on WhatsApp`,
  },
};

/** Details of a lot: side panel on a computer, full screen on a phone. */
export type LotActions = {
  compared: boolean;
  onToggleCompare: () => void;
  onShare: () => void;
  whatsappUrl: string;
  onWhatsApp: () => void;
  /** Visit request form of this lot; null when the lot is sold. */
  visit: ReactNode | null;
  /** Button of the 360° tour of the lot, if it has one. */
  tour: ReactNode | null;
};

export function LotSheet({
  lot,
  photos,
  currency,
  open,
  onOpenChange,
  actions,
  askVisit = null,
  modal = true,
  className,
  selling,
}: {
  lot: PublicLot | null;
  photos: MediaItem[];
  currency: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actions: LotActions | null;
  /** Shows the form of this lot (a new object each time it is asked, from the 360° tour). */
  askVisit?: { lotId: string } | null;
  /** false: beside the 3D view of a computer, which stays usable (another lot replaces this one). */
  modal?: boolean;
  className?: string | undefined;
  /** How to pay, the yield, followers, alternatives (see LotSelling). */
  selling?: LotSelling | undefined;
}) {
  const copy = useCopy(COPY);
  // The form shows under the details of the lot it was opened for.
  const [visitFor, setVisitFor] = useState<string | null>(null);
  useEffect(() => {
    if (askVisit) setVisitFor(askVisit.lotId);
  }, [askVisit]);
  const showVisit = Boolean(lot && visitFor === lot.id && actions?.visit);
  // No visit button in the row (form shown, or lot sold): the other actions get their names.
  const wideActions = !actions?.visit || showVisit;
  const visitRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!showVisit) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    visitRef.current?.scrollIntoView({ block: "start", behavior: still ? "auto" : "smooth" });
  }, [showVisit]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange} modal={modal}>
      <SheetContent
        className={cn(
          "w-full overflow-y-auto border-white/10 bg-[#0d0d0d] p-0 sm:max-w-md",
          className,
        )}
        // Beside the view, a click on it picks another lot rather than closing the sheet.
        {...(modal ? {} : { onInteractOutside: (e: Event) => e.preventDefault() })}
      >
        {lot ? (
          <>
            <LotDetails
              lot={lot}
              photos={photos}
              currency={currency}
              Title={SheetTitle}
              Description={SheetDescription}
              extra={actions?.tour}
              selling={selling}
            />

            {showVisit && actions?.visit ? (
              <div ref={visitRef} className="scroll-mt-4 border-t border-white/10 p-6">
                <h3 className="font-brand text-lg font-medium tracking-tight">{copy.visit}</h3>
                <div className="mt-4">{actions.visit}</div>
              </div>
            ) : null}

            {actions ? (
              <div className="sticky bottom-0 flex items-center gap-1.5 border-t border-white/10 bg-[#0d0d0d]/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur">
                {actions.visit && !showVisit ? (
                  <button
                    type="button"
                    onClick={() => setVisitFor(lot.id)}
                    className="inline-flex h-12 min-w-0 flex-1 items-center justify-center gap-2 rounded-[10px] bg-[color:var(--brand)] px-4 text-[15px] font-medium text-[color:var(--brand-contrast)] transition-opacity duration-200 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                  >
                    <CalendarCheck
                      className="hidden size-[18px] shrink-0 min-[420px]:block"
                      aria-hidden
                    />
                    <span className="truncate">{copy.visit}</span>
                  </button>
                ) : null}
                {/* With the visit button: three squares; without it, the three share the row, named. */}
                <button
                  type="button"
                  onClick={actions.onToggleCompare}
                  aria-pressed={actions.compared}
                  aria-label={actions.compared ? copy.compared : copy.compare}
                  title={actions.compared ? copy.compared : copy.compare}
                  className={cn(
                    "inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-[10px] border text-sm transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70",
                    wideActions ? "flex-1 px-3" : "w-11",
                    actions.compared
                      ? "border-[color:var(--brand)] bg-[color:var(--brand)]/15 text-[color:var(--brand)]"
                      : "border-white/15 text-white/85 hover:border-white/40",
                  )}
                >
                  <GitCompareArrows className="size-[18px]" aria-hidden />
                  {wideActions ? (actions.compared ? copy.compared : copy.compare) : null}
                </button>
                <button
                  type="button"
                  onClick={actions.onShare}
                  aria-label={copy.share}
                  title={copy.share}
                  className={cn(
                    "inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-[10px] border border-white/15 text-sm text-white/85 transition-colors duration-200 hover:border-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70",
                    wideActions ? "flex-1 px-3" : "w-11",
                  )}
                >
                  <Share2 className="size-[18px]" aria-hidden />
                  {wideActions ? copy.share : null}
                </button>
                <a
                  href={actions.whatsappUrl}
                  target="_blank"
                  rel="noopener"
                  onClick={actions.onWhatsApp}
                  aria-label={copy.whatsapp(lot.numero)}
                  title={copy.whatsapp(lot.numero)}
                  className={cn(
                    "inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-[10px] bg-[#25D366] text-sm font-medium text-black transition-opacity duration-200 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70",
                    wideActions ? "flex-1 px-3" : "w-11",
                  )}
                >
                  <WhatsAppIcon className="size-[22px]" />
                  {wideActions ? "WhatsApp" : null}
                </a>
              </div>
            ) : null}
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
