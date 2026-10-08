import { Suspense, lazy } from "react";
import { Rotate3d } from "lucide-react";

import type { PublicLot, PublicTour } from "@/lib/public/programme";
import { normalizeType } from "@/lib/tours";
import { cn } from "@/lib/utils";

/* 360° tours on the public pages: a card per tour in the section of the
   programme page, a button in the sheet of a lot, and the full screen viewer,
   downloaded only when a tour is opened. */

const TourViewer = lazy(() => import("./TourViewer"));

export type OpenTour = { tour: PublicTour; lotId: string | null };

export function TourOverlay({
  open,
  onClose,
  onPlan,
  variant = "page",
}: {
  open: OpenTour | null;
  onClose: () => void;
  onPlan: ((open: OpenTour) => void) | null;
  variant?: "page" | "embed" | "presentation";
}) {
  if (!open) return null;
  return (
    <Suspense
      fallback={
        <div
          className="fixed inset-0 z-[70] grid place-items-center bg-black text-sm text-white/70"
          role="status"
        >
          Ouverture de la visite…
        </div>
      }
    >
      <TourViewer
        // Another tour starts from its entrance.
        key={open.tour.key}
        tour={open.tour}
        onClose={onClose}
        onPlan={onPlan ? () => onPlan(open) : null}
        variant={variant}
      />
    </Suspense>
  );
}

const rooms = (n: number) => `${n} pièce${n > 1 ? "s" : ""}`;

/** Button of the lot sheet. */
export function TourButton({
  tour,
  onOpen,
  large = false,
}: {
  tour: PublicTour;
  onOpen: () => void;
  large?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        "flex w-full items-center gap-3 overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] text-left transition-colors hover:border-[color:var(--brand)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70",
        large ? "p-3" : "p-2",
      )}
    >
      <span className="relative shrink-0 overflow-hidden rounded-lg">
        <img
          src={tour.rooms[0]?.image.thumb}
          alt=""
          className={cn("aspect-[2/1] object-cover", large ? "w-32" : "w-24")}
          loading="lazy"
        />
        <span className="absolute inset-0 grid place-items-center bg-black/35">
          <Rotate3d className={cn("text-white", large ? "size-7" : "size-5")} aria-hidden />
        </span>
      </span>
      <span className="min-w-0">
        <span className={cn("block font-medium text-white", large ? "text-xl" : "text-sm")}>
          Visite 360°
        </span>
        <span className={cn("block text-white/55", large ? "text-base" : "text-xs")}>
          {rooms(tour.rooms.length)} à parcourir
        </span>
      </span>
    </button>
  );
}

/** Section of the programme page: one card per tour, types first. */
export function ToursSection({
  tours,
  lots,
  onOpen,
}: {
  tours: PublicTour[];
  lots: PublicLot[];
  onOpen: (tour: PublicTour) => void;
}) {
  const typeCount = (type: string) =>
    lots.filter((l) => l.type && normalizeType(l.type) === normalizeType(type)).length;
  return (
    <ul className={tours.length === 1 ? "grid" : "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"}>
      {tours.map((tour) => {
        const lot = tour.lotId ? lots.find((l) => l.id === tour.lotId) : undefined;
        const count = tour.lotType ? typeCount(tour.lotType) : 0;
        return (
          <li key={tour.key}>
            <button
              type="button"
              onClick={() => onOpen(tour)}
              className="group block w-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] text-left transition-colors hover:border-[color:var(--brand)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            >
              <span className="relative block">
                <img
                  src={tour.rooms[0]?.image.thumb}
                  alt=""
                  className="aspect-[2/1] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  loading="lazy"
                />
                <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/65 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                  <Rotate3d className="size-3.5" aria-hidden />
                  360°
                </span>
              </span>
              <span className="block p-4">
                <span className="block font-brand text-lg font-medium tracking-tight text-white">
                  {tour.label}
                </span>
                <span className="mt-1 block text-sm text-white/55">
                  {rooms(tour.rooms.length)}
                  {tour.lotType && count > 0
                    ? ` · pour ${count === 1 ? "le lot" : `les ${count} lots`} de ce type`
                    : lot?.type
                      ? ` · ${lot.type}`
                      : ""}
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
