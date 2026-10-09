import { Suspense, lazy, useMemo } from "react";

import type { LotStatus } from "@/lib/app/lot-fields";
import { useCopy } from "@/lib/i18n";
import type { PublicData, PublicLot } from "@/lib/public/programme";
import { cn } from "@/lib/utils";
import type { ViewKey } from "@/lib/public/use-views";
import { floorsDown, sideViews } from "@/lib/views";
import { OrbitViewer } from "./OrbitViewer";

const AerialViewer = lazy(() => import("./AerialViewer"));

/* The views of a programme on the public pages, each an orbital sequence or
   a 360° panorama: the aerial view, the roof, the pedestrian view… as
   buttons, the floors as a column from the top floor down, as on a building,
   each with its number of available lots; the chosen one is shown. */

const COPY = {
  fr: {
    loading: "Chargement de la vue…",
    views: "Vues du programme",
    floors: "Niveaux",
    full: "Complet",
    available: (n: number) => `${n} dispo.`,
  },
  en: {
    loading: "Loading the view…",
    views: "Views of the programme",
    floors: "Floors",
    full: "None available",
    available: (n: number) => `${n} available`,
  },
};

export function ProgrammeViews({
  data,
  viewKey,
  onViewChange,
  filter,
  highlight,
  selected = null,
  variant = "page",
  resetKey = 0,
  onOpen,
}: {
  data: PublicData;
  viewKey: ViewKey | null;
  onViewChange: (key: ViewKey) => void;
  filter: LotStatus | null;
  highlight?: ReadonlySet<string>;
  selected?: string | null;
  variant?: "page" | "embed" | "presentation";
  resetKey?: number;
  onOpen: (lot: PublicLot, from: "plan" | "keyboard") => void;
}) {
  const { programme, lots, views } = data;
  const large = variant === "presentation";
  const copy = useCopy(COPY);
  const side = useMemo(() => sideViews(views), [views]);
  const floors = useMemo(() => floorsDown(views), [views]);
  const current = views.find((v) => v.id === viewKey) ?? null;

  const available = useMemo(() => {
    const free = new Set(lots.filter((l) => l.statut === "disponible").map((l) => l.id));
    return new Map(views.map((v) => [v.id, [...v.lots].filter((id) => free.has(id)).length]));
  }, [lots, views]);

  const choices = side.length;
  const button = (active: boolean) =>
    cn(
      "inline-flex shrink-0 items-center gap-2 rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70",
      large ? "h-12 px-5 text-base" : "h-9 px-4 text-sm",
      active
        ? "border-[color:var(--brand)] bg-[color:var(--brand)] text-[color:var(--brand-contrast)]"
        : "border-white/15 text-white/75 hover:border-white/35 hover:text-white",
    );

  const stage = current?.panorama ? (
    <Suspense
      fallback={
        <div
          className={cn(
            "grid w-full place-items-center rounded-2xl border border-white/10 bg-black text-xs text-white/60",
            large ? "min-h-0 flex-1" : "aspect-[16/10] sm:aspect-[16/9]",
          )}
        >
          {copy.loading}
        </div>
      }
    >
      <AerialViewer
        key={current.id}
        panorama={current.panorama}
        viewName={current.name}
        lots={lots}
        currency={programme.currency}
        filter={filter}
        {...(highlight ? { highlight } : {})}
        selected={selected}
        variant={variant}
        resetKey={resetKey}
        onOpen={onOpen}
      />
    </Suspense>
  ) : current?.orbit ? (
    <OrbitViewer
      // Another view starts from its first image.
      key={current.id}
      orbit={current.orbit}
      viewName={current.name}
      lots={lots}
      currency={programme.currency}
      brandColor={programme.organization.brandColor}
      filter={filter}
      {...(highlight ? { highlight } : {})}
      selected={selected}
      variant={variant}
      resetKey={resetKey}
      onOpen={onOpen}
    />
  ) : null;

  return (
    <div className={cn(large ? "flex h-full min-h-0 flex-col gap-3" : "space-y-3")}>
      {choices >= 2 || (choices >= 1 && floors.length > 0) ? (
        <div role="group" aria-label={copy.views} className="flex flex-wrap gap-2">
          {side.map((v) => (
            <button
              key={v.id}
              type="button"
              aria-pressed={viewKey === v.id}
              onClick={() => onViewChange(v.id)}
              className={button(viewKey === v.id)}
            >
              {v.name}
            </button>
          ))}
        </div>
      ) : null}

      <div
        className={cn(
          "flex gap-3",
          large ? "min-h-0 flex-1" : "flex-col sm:flex-row",
          // Without floors the stage takes the whole width; in presentation it
          // must stay a flex item, or a 360° view gets no height at all.
          floors.length === 0 && !large && "block",
        )}
      >
        <div className={cn("min-w-0 flex-1", large && "flex min-h-0 flex-col")}>{stage}</div>
        {floors.length > 0 ? (
          <nav
            aria-label={copy.floors}
            className={cn(
              "order-first flex gap-2 sm:order-none sm:flex-col",
              // Phones: a row of floors above the plan; elsewhere a column, top floor first.
              "overflow-x-auto pb-1 sm:overflow-visible sm:pb-0",
              large ? "w-40 flex-col overflow-y-auto" : "sm:w-28",
            )}
          >
            {floors.map((v) => {
              const active = viewKey === v.id;
              const free = available.get(v.id) ?? 0;
              return (
                <button
                  key={v.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onViewChange(v.id)}
                  className={cn(
                    "flex shrink-0 flex-col items-start rounded-xl border text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70",
                    large ? "px-4 py-3" : "px-3 py-2",
                    active
                      ? "border-[color:var(--brand)] bg-[color:var(--brand)]/15"
                      : "border-white/10 bg-white/[0.03] hover:border-white/30",
                  )}
                >
                  <span
                    className={cn(
                      "font-brand font-medium tracking-tight",
                      large ? "text-xl" : "text-base",
                      active ? "text-[color:var(--brand)]" : "text-white",
                    )}
                  >
                    {v.name}
                  </span>
                  <span className={cn("text-white/55", large ? "text-sm" : "text-[11px]")}>
                    {v.lots.size === 0 ? "\u00a0" : free === 0 ? copy.full : copy.available(free)}
                  </span>
                </button>
              );
            })}
          </nav>
        ) : null}
      </div>
    </div>
  );
}
