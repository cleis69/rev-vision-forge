import type { ReactNode } from "react";
import { Minus, Plus } from "lucide-react";

import { useCopy } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/* Zoom buttons of the 360° viewers of the public pages, in the same pill as
   the orbital views (the viewer's own bar is not shown: on a narrow screen
   it folded the zoom into a menu, which showed it twice). */

const COPY = {
  fr: { zoomOut: "Dézoomer", zoomIn: "Zoomer" },
  en: { zoomOut: "Zoom out", zoomIn: "Zoom in" },
};

export function ViewerControls({
  onZoomIn,
  onZoomOut,
  large = false,
  className,
  children,
}: {
  onZoomIn: () => void;
  onZoomOut: () => void;
  large?: boolean;
  className?: string | undefined;
  /** More buttons after the zoom (full screen…). */
  children?: ReactNode;
}) {
  const copy = useCopy(COPY);
  const button = cn(
    "grid place-items-center rounded-full transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70",
    large ? "size-11" : "size-9",
  );
  return (
    <div
      role="group"
      aria-label="Zoom"
      className={cn(
        "flex items-center gap-0.5 rounded-full border border-white/15 bg-black/65 p-1 text-white shadow-lg backdrop-blur",
        className,
      )}
    >
      <button type="button" aria-label={copy.zoomOut} onClick={onZoomOut} className={button}>
        <Minus aria-hidden className={large ? "size-5" : "size-4"} />
      </button>
      <button type="button" aria-label={copy.zoomIn} onClick={onZoomIn} className={button}>
        <Plus aria-hidden className={large ? "size-5" : "size-4"} />
      </button>
      {children}
    </div>
  );
}
