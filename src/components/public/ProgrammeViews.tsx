import { Suspense, lazy, useMemo } from "react";

import type { LotStatus } from "@/lib/app/lot-fields";
import { smallFramePath } from "@/lib/app/orbit";
import { publicUrl } from "@/lib/app/storage";
import { useCopy } from "@/lib/i18n";
import type { PublicData, PublicLot, PublicView } from "@/lib/public/programme";
import { cn } from "@/lib/utils";
import type { ViewKey } from "@/lib/public/use-views";
import { floorsDown, sideViews } from "@/lib/views";
import { OrbitViewer } from "./OrbitViewer";

const AerialViewer = lazy(() => import("./AerialViewer"));

/* The views of a programme on the public pages, each an orbital sequence or
   a 360° panorama: the aerial view, the roof, the pedestrian view… as
   buttons, the floors as a column from the top floor down, as on a building,
   each with its number of available lots; the chosen one is shown.
   variant "app" (programme page): the view fills the screen, the floors float
   on its left and the other views are thumbnails at its foot. */

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

/** Small image of a view, for its thumbnail. */
const thumbOf = (view: PublicView): string | null => {
  if (view.panorama) return view.panorama.image.thumb;
  const first = view.orbit?.frames[0];
  return first ? publicUrl(smallFramePath(first.path)) : null;
};

export function ProgrammeViews({
  data,
  viewKey,
  onViewChange,
  filter,
  focus = null,
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
  /** Lots matching the visitor's search: the others are dimmed. */
  focus?: ReadonlySet<string> | null;
  highlight?: ReadonlySet<string>;
  selected?: string | null;
  variant?: "page" | "embed" | "presentation" | "app";
  resetKey?: number;
  onOpen: (lot: PublicLot, from: "plan" | "keyboard") => void;
}) {
  const { programme, lots, views } = data;
  const large = variant === "presentation";
  const app = variant === "app";
  const copy = useCopy(COPY);
  const side = useMemo(() => sideViews(views), [views]);
  const floors = useMemo(() => floorsDown(views), [views]);
  const current = views.find((v) => v.id === viewKey) ?? null;

  const available = useMemo(() => {
    const free = new Set(lots.filter((l) => l.statut === "disponible").map((l) => l.id));
    return new Map(views.map((v) => [v.id, [...v.lots].filter((id) => free.has(id)).length]));
  }, [lots, views]);

  const choices = side.length;
  const showSide = choices >= 2 || (choices >= 1 && floors.length > 0);
  // In the app the zoom buttons leave the foot of the view to the floors (phones) and the views.
  const controls = app
    ? cn(
        "bottom-3 right-3",
        floors.length > 0 && "max-md:bottom-[4.25rem]",
        "md:bottom-4 md:right-4",
      )
    : undefined;
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
            "grid w-full place-items-center bg-black text-xs text-white/60",
            app ? "h-full" : "rounded-2xl border border-white/10",
            large ? "min-h-0 flex-1" : !app && "aspect-[16/10] sm:aspect-[16/9]",
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
        focus={focus}
        {...(highlight ? { highlight } : {})}
        selected={selected}
        variant={variant}
        resetKey={resetKey}
        {...(controls ? { controlsClassName: controls } : {})}
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
      focus={focus}
      {...(highlight ? { highlight } : {})}
      selected={selected}
      variant={variant}
      resetKey={resetKey}
      {...(controls ? { controlsClassName: controls } : {})}
      onOpen={onOpen}
    />
  ) : null;

  if (app) {
    return (
      <div className="relative h-full w-full overflow-hidden bg-black">
        <div className="absolute inset-0 flex flex-col">{stage}</div>

        {showSide ? (
          <div
            role="group"
            aria-label={copy.views}
            className={cn(
              "absolute z-10 flex gap-2 overflow-x-auto [scrollbar-width:none]",
              // Phones: a row of names at the top; computers: thumbnails at the foot.
              "inset-x-0 top-0 p-3",
              "md:inset-x-auto md:bottom-4 md:left-1/2 md:top-auto md:max-w-[calc(100%-20rem)] md:-translate-x-1/2 md:rounded-2xl md:border md:border-white/10 md:bg-black/55 md:p-2 md:shadow-2xl md:backdrop-blur-md",
            )}
          >
            {side.map((v) => {
              const active = viewKey === v.id;
              const thumb = thumbOf(v);
              return (
                <button
                  key={v.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onViewChange(v.id)}
                  className={cn(
                    "group shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70",
                    "inline-flex h-9 items-center rounded-full border px-4 text-sm backdrop-blur-md",
                    active
                      ? "border-[color:var(--brand)] bg-[color:var(--brand)] text-[color:var(--brand-contrast)]"
                      : "border-white/15 bg-black/55 text-white/85",
                    "md:h-auto md:flex-col md:items-stretch md:gap-1.5 md:rounded-xl md:border-0 md:bg-transparent md:p-1 md:text-[11px] md:backdrop-blur-none",
                    active
                      ? "md:bg-white/10 md:text-white"
                      : "md:text-white/65 md:hover:text-white",
                  )}
                >
                  {thumb ? (
                    <img
                      src={thumb}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className={cn(
                        "hidden h-14 w-24 rounded-lg object-cover md:block",
                        active
                          ? "ring-2 ring-[color:var(--brand)]"
                          : "opacity-80 ring-1 ring-white/10 group-hover:opacity-100",
                      )}
                    />
                  ) : null}
                  <span className="md:max-w-24 md:truncate md:text-center">{v.name}</span>
                </button>
              );
            })}
          </div>
        ) : null}

        {floors.length > 0 ? (
          <nav
            aria-label={copy.floors}
            className={cn(
              "absolute z-10 flex gap-2 overflow-x-auto [scrollbar-width:none]",
              // Phones: a row at the foot; computers: a column on the left, top floor first.
              "inset-x-0 bottom-0 p-3",
              "md:inset-x-auto md:bottom-auto md:left-4 md:top-1/2 md:max-h-[calc(100%-9rem)] md:w-36 md:-translate-y-1/2 md:flex-col md:overflow-y-auto md:rounded-2xl md:border md:border-white/10 md:bg-black/55 md:p-2 md:shadow-2xl md:backdrop-blur-md",
            )}
          >
            <p className="hidden px-2 pb-1 pt-1 text-[10px] font-medium uppercase tracking-[0.22em] text-white/45 md:block">
              {copy.floors}
            </p>
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
                    "flex shrink-0 flex-col items-start rounded-xl border px-3 py-1.5 text-left backdrop-blur-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 md:backdrop-blur-none",
                    active
                      ? "border-[color:var(--brand)] bg-[color:var(--brand)] text-[color:var(--brand-contrast)]"
                      : "border-white/10 bg-black/55 text-white hover:border-white/30 md:border-transparent md:bg-transparent md:hover:bg-white/5",
                  )}
                >
                  <span className="font-brand text-sm font-medium tracking-tight">{v.name}</span>
                  <span
                    className={cn(
                      "text-[10px]",
                      active ? "text-[color:var(--brand-contrast)]/75" : "text-white/55",
                    )}
                  >
                    {v.lots.size === 0 ? " " : free === 0 ? copy.full : copy.available(free)}
                  </span>
                </button>
              );
            })}
          </nav>
        ) : null}
      </div>
    );
  }

  return (
    <div className={cn(large ? "flex h-full min-h-0 flex-col gap-3" : "space-y-3")}>
      {showSide ? (
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
                    {v.lots.size === 0 ? " " : free === 0 ? copy.full : copy.available(free)}
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
