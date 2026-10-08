import { useEffect, useRef, useState, type ReactNode } from "react";
import { CalendarCheck, GitCompareArrows, Share2 } from "lucide-react";

import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import type { MediaItem } from "@/lib/app/media";
import type { PublicLot } from "@/lib/public/programme";
import { cn } from "@/lib/utils";
import { LotDetails } from "./LotDetails";

/** Details of a lot: side panel on a computer, full screen on a phone. */
export type LotActions = {
  compared: boolean;
  onToggleCompare: () => void;
  onShare: () => void;
  whatsappUrl: string;
  onWhatsApp: () => void;
  /** Visit request form of this lot; null when the lot is sold. */
  visit: ReactNode | null;
};

export function LotSheet({
  lot,
  photos,
  currency,
  open,
  onOpenChange,
  actions,
}: {
  lot: PublicLot | null;
  photos: MediaItem[];
  currency: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actions: LotActions | null;
}) {
  // The form shows under the details of the lot it was opened for.
  const [visitFor, setVisitFor] = useState<string | null>(null);
  const showVisit = Boolean(lot && visitFor === lot.id && actions?.visit);
  const visitRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!showVisit) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    visitRef.current?.scrollIntoView({ block: "start", behavior: still ? "auto" : "smooth" });
  }, [showVisit]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto border-white/10 bg-[#0d0d0d] p-0 sm:max-w-md">
        {lot ? (
          <>
            <LotDetails
              lot={lot}
              photos={photos}
              currency={currency}
              Title={SheetTitle}
              Description={SheetDescription}
            />

            {showVisit && actions?.visit ? (
              <div ref={visitRef} className="scroll-mt-4 border-t border-white/10 p-6">
                <h3 className="font-brand text-lg font-medium tracking-tight">
                  Planifier une visite
                </h3>
                <div className="mt-4">{actions.visit}</div>
              </div>
            ) : null}

            {actions ? (
              <div className="sticky bottom-0 flex flex-wrap gap-2 border-t border-white/10 bg-[#0d0d0d]/95 p-4 backdrop-blur">
                {actions.visit && !showVisit ? (
                  <button
                    type="button"
                    onClick={() => setVisitFor(lot.id)}
                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[color:var(--brand)] px-5 text-sm font-medium text-[color:var(--brand-contrast)] transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                  >
                    <CalendarCheck className="size-4" aria-hidden />
                    Planifier une visite
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={actions.onToggleCompare}
                  aria-pressed={actions.compared}
                  className={cn(
                    "inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full border px-4 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70",
                    actions.compared
                      ? "border-[color:var(--brand)] bg-[color:var(--brand)]/15 text-[color:var(--brand)]"
                      : "border-white/15 text-white/85 hover:border-white/35",
                  )}
                >
                  <GitCompareArrows className="size-4" aria-hidden />
                  {actions.compared ? "Dans le comparateur" : "Comparer"}
                </button>
                <button
                  type="button"
                  onClick={actions.onShare}
                  className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full border border-white/15 px-4 text-sm text-white/85 transition-colors hover:border-white/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                >
                  <Share2 className="size-4" aria-hidden />
                  Partager
                </button>
                <a
                  href={actions.whatsappUrl}
                  target="_blank"
                  rel="noopener"
                  onClick={actions.onWhatsApp}
                  aria-label={`Partager le lot ${lot.numero} sur WhatsApp`}
                  className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full border border-[#25D366]/50 px-4 text-sm text-[#5fe08f] transition-colors hover:border-[#25D366] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                >
                  WhatsApp
                </a>
              </div>
            ) : null}
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
