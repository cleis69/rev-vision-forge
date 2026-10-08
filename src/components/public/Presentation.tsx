import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { ClipboardList, Eye, Maximize, Minimize, X } from "lucide-react";
import { toast } from "sonner";

import type { LotStatus } from "@/lib/app/lot-fields";
import { useLiveLots } from "@/lib/public/live";
import { countByStatus, tourOfLot, type PublicData, type PublicLot } from "@/lib/public/programme";
import { cn } from "@/lib/utils";
import { firstView } from "@/lib/views";
import { PoweredBy, RevBadge, StatusFilters } from "./Common";
import { LotCards } from "./LotCards";
import { LotDetails } from "./LotDetails";
import { useFollowLot, useViewKey } from "@/lib/public/use-views";
import { ProgrammeViews } from "./ProgrammeViews";
import { TourButton, TourOverlay, type OpenTour } from "./Tours";
import { VisitForm } from "./VisitForm";

/* Presentation mode (/p/$slug?mode=presentation): the sales plan full screen
   on the sales office tablet. Large buttons, the lot in large beside the
   plan, contact details taken on request only. Left alone for 3 minutes, it
   comes back to the whole plan, and forgets what the last visitor typed.
   Taps here are the sales team's, not visits: no statistics are recorded. */

const IDLE_MS = 3 * 60 * 1000;

type Panel = { kind: "lot"; id: string; contact: boolean } | { kind: "contact" } | null;

export function Presentation({ data, slug }: { data: PublicData; slug: string }) {
  const { programme, lots, media, preview } = data;
  const navigate = useNavigate();
  const { numero } = useParams({ strict: false }) as { numero?: string };
  const [panel, setPanel] = useState<Panel>(() => {
    const lot = numero ? lots.find((l) => l.numero === numero) : undefined;
    return lot ? { kind: "lot", id: lot.id, contact: false } : null;
  });
  const [filter, setFilter] = useState<LotStatus | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const [touring, setTouring] = useState<OpenTour | null>(null);
  // One id per visitor, for the limit of visit requests (see sendVisit).
  const [visitor, setVisitor] = useState(() => crypto.randomUUID());
  const highlight = useLiveLots(programme.id, slug);
  const fullscreen = useFullscreen();
  useWakeLock();

  const [viewKey, setViewKey] = useViewKey(data);

  useIdle(IDLE_MS, () => {
    setTouring(null);
    setPanel(null);
    setFilter(null);
    setViewKey(firstView(data.views));
    setResetKey((k) => k + 1);
    setVisitor(crypto.randomUUID());
    // Also closes the personal data notice, or a lot opened from a link.
    void navigate({
      to: "/p/$slug",
      params: { slug },
      search: { mode: "presentation" },
      replace: true,
    });
  });

  useEffect(() => {
    document.title = `${programme.name} — Présentation`;
  }, [programme.name]);

  const counts = countByStatus(lots);
  const hasViews = data.views.length > 0;
  const lot = panel?.kind === "lot" ? (lots.find((l) => l.id === panel.id) ?? null) : null;
  useFollowLot(data, lot, setViewKey);
  const shown = filter ? lots.filter((l) => l.statut === filter) : lots;
  const open = (target: PublicLot) => setPanel({ kind: "lot", id: target.id, contact: false });

  // The form opens under the details of the lot: brought into view.
  const contact = useRef<HTMLElement>(null);
  const contactOpen = panel?.kind === "lot" && panel.contact;
  useEffect(() => {
    if (!contactOpen) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    contact.current?.scrollIntoView({ block: "start", behavior: still ? "auto" : "smooth" });
  }, [contactOpen]);

  return (
    <div className="fixed inset-0 flex flex-col bg-[#080808] text-white">
      {preview ? (
        <div className="bg-amber-400 px-5 py-1.5 text-center text-sm font-medium text-black">
          <Eye className="mr-2 inline size-4 align-[-3px]" aria-hidden />
          Aperçu : programme non publié, le formulaire est désactivé.
        </div>
      ) : null}

      <header className="flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-white/10 px-5 py-3 lg:px-8">
        <div className="flex min-w-0 items-center gap-4">
          {programme.organization.logo ? (
            <img
              src={programme.organization.logo}
              alt={programme.organization.name}
              className="h-10 w-auto"
            />
          ) : programme.organization.name ? (
            <span className="truncate text-sm text-white/60">{programme.organization.name}</span>
          ) : null}
          <h1 className="truncate font-brand text-2xl font-medium tracking-tight">
            {programme.name}
          </h1>
        </div>
        {/* Under the name on a tablet, beside it on a wide screen. */}
        <div className="order-last flex w-full flex-wrap items-center gap-3 min-[1400px]:order-none min-[1400px]:w-auto">
          <StatusFilters
            value={filter}
            onChange={setFilter}
            counts={counts}
            total={lots.length}
            large
          />
        </div>
        <div className="ml-auto flex items-center gap-2">
          {programme.organization.slug !== "rev" ? <RevBadge size="lg" className="mr-2" /> : null}
          <button
            type="button"
            onClick={() => setPanel({ kind: "contact" })}
            className="inline-flex h-12 items-center gap-2 rounded-full border border-white/20 px-5 text-base text-white transition-colors hover:border-white/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          >
            <ClipboardList className="size-5" aria-hidden />
            Prendre les coordonnées
          </button>
          {fullscreen.supported ? (
            <button
              type="button"
              onClick={fullscreen.toggle}
              aria-label={fullscreen.active ? "Quitter le plein écran" : "Plein écran"}
              title={fullscreen.active ? "Quitter le plein écran" : "Plein écran"}
              className="grid size-12 place-items-center rounded-full border border-white/20 text-white/85 transition-colors hover:border-white/50 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            >
              {fullscreen.active ? (
                <Minimize className="size-5" aria-hidden />
              ) : (
                <Maximize className="size-5" aria-hidden />
              )}
            </button>
          ) : null}
          <Link
            to="/p/$slug"
            params={{ slug }}
            search={{}}
            aria-label="Quitter le mode présentation"
            title="Quitter le mode présentation"
            className="grid size-12 place-items-center rounded-full text-white/50 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          >
            <X className="size-5" aria-hidden />
          </Link>
        </div>
      </header>

      <main className="relative flex min-h-0 flex-1">
        <div className="flex min-w-0 flex-1 flex-col p-4 lg:p-6">
          {hasViews ? (
            <ProgrammeViews
              data={data}
              viewKey={viewKey}
              onViewChange={setViewKey}
              filter={filter}
              highlight={highlight}
              selected={lot?.id ?? null}
              variant="presentation"
              resetKey={resetKey}
              onOpen={open}
            />
          ) : (
            <div className="min-h-0 flex-1 overflow-y-auto">
              {shown.length > 0 ? (
                <LotCards
                  lots={shown}
                  currency={programme.currency}
                  highlight={highlight}
                  onOpen={open}
                />
              ) : (
                <p className="py-10 text-center text-lg text-white/60">
                  {lots.length === 0
                    ? "Les lots seront bientôt présentés."
                    : "Aucun lot avec ce statut."}
                </p>
              )}
            </div>
          )}
          <PoweredBy className="mt-2 self-end" />
        </div>

        {panel ? (
          <SidePanel
            // Another lot starts from an empty form.
            key={panel.kind === "lot" ? panel.id : "contact"}
            label={lot ? `Lot ${lot.numero}` : "Prendre les coordonnées"}
            onClose={() => setPanel(null)}
            footer={
              lot && panel?.kind === "lot" && !panel.contact && lot.statut !== "vendue" ? (
                <button
                  type="button"
                  onClick={() => setPanel({ ...panel, contact: true })}
                  className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[color:var(--brand)] px-6 text-lg font-medium text-[color:var(--brand-contrast)] transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                >
                  <ClipboardList className="size-5" aria-hidden />
                  Prendre les coordonnées
                </button>
              ) : null
            }
          >
            {lot ? (
              <LotDetails
                lot={lot}
                photos={media.filter((m) => m.lot_id === lot.id)}
                currency={programme.currency}
                large
                extra={(() => {
                  const tour = tourOfLot(data.tours, lot);
                  return tour ? (
                    <TourButton
                      tour={tour}
                      large
                      onOpen={() => setTouring({ tour, lotId: lot.id })}
                    />
                  ) : null;
                })()}
              />
            ) : null}
            {panel.kind === "contact" || (panel.kind === "lot" && panel.contact && lot) ? (
              <section
                ref={contact}
                className={cn("scroll-mt-2 p-8", lot && "border-t border-white/10")}
              >
                <h2 className="font-brand text-2xl font-medium tracking-tight">
                  Prendre les coordonnées
                </h2>
                <p className="mt-2 text-base text-white/60">
                  {lot
                    ? `Pour être recontacté au sujet du lot ${lot.numero}.`
                    : "Pour être recontacté au sujet du programme ou d'un lot."}
                </p>
                <div className="mt-6">
                  <VisitForm
                    projectId={programme.id}
                    slug={programme.slug}
                    owner={programme.organization.name}
                    {...(lot ? {} : { lots })}
                    lot={lot}
                    preview={preview}
                    source="presentation"
                    session={visitor}
                    submitLabel="Envoyer"
                    // The next request is another visitor's.
                    onSent={() => setVisitor(crypto.randomUUID())}
                  />
                </div>
              </section>
            ) : null}
          </SidePanel>
        ) : null}
      </main>

      <TourOverlay
        open={touring}
        onClose={() => setTouring(null)}
        onPlan={null}
        variant="presentation"
      />
    </div>
  );
}

/** Beside the plan on a landscape tablet, over it in portrait. */
function SidePanel({
  label,
  onClose,
  footer,
  children,
}: {
  label: string;
  onClose: () => void;
  footer: ReactNode;
  children: ReactNode;
}) {
  const close = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    close.current?.focus({ preventScroll: true });
  }, []);
  return (
    <aside
      aria-label={label}
      className="absolute inset-0 z-20 flex flex-col bg-[#0d0d0d] lg:static lg:w-[min(560px,42vw)] lg:border-l lg:border-white/10"
    >
      <div className="flex justify-end border-b border-white/10 p-3">
        <button
          ref={close}
          type="button"
          onClick={onClose}
          className="inline-flex h-12 items-center gap-2 rounded-full border border-white/15 px-5 text-base text-white/85 transition-colors hover:border-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
        >
          <X className="size-5" aria-hidden />
          Fermer
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>
      {footer ? <div className="border-t border-white/10 p-4">{footer}</div> : null}
    </aside>
  );
}

/** Runs `onIdle` once nobody has touched the screen for `ms`. */
function useIdle(ms: number, onIdle: () => void) {
  const handler = useRef(onIdle);
  handler.current = onIdle;
  useEffect(() => {
    let timer = window.setTimeout(() => handler.current(), ms);
    const reset = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => handler.current(), ms);
    };
    const events = ["pointerdown", "keydown", "wheel", "input"] as const;
    for (const e of events) window.addEventListener(e, reset, { capture: true, passive: true });
    return () => {
      window.clearTimeout(timer);
      for (const e of events) window.removeEventListener(e, reset, { capture: true });
    };
  }, [ms]);
}

function useFullscreen() {
  const [active, setActive] = useState(() => Boolean(document.fullscreenElement));
  useEffect(() => {
    const onChange = () => setActive(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => {
      document.removeEventListener("fullscreenchange", onChange);
      // Leaving the presentation leaves full screen too.
      if (document.fullscreenElement) void document.exitFullscreen().catch(() => undefined);
    };
  }, []);
  return {
    // iPhone Safari has no full screen for pages: the button is hidden there.
    supported: document.fullscreenEnabled === true,
    active,
    toggle: () => {
      if (document.fullscreenElement) void document.exitFullscreen().catch(() => undefined);
      else
        void document.documentElement
          .requestFullscreen()
          .catch(() => toast.error("Le plein écran n'est pas disponible sur cet appareil."));
    },
  };
}

/** Keeps the screen on while the presentation is open (when the browser allows it). */
function useWakeLock() {
  useEffect(() => {
    if (!("wakeLock" in navigator)) return;
    let lock: WakeLockSentinel | null = null;
    let closed = false;
    const request = async () => {
      if (document.visibilityState !== "visible") return;
      try {
        const next = await navigator.wakeLock.request("screen");
        if (closed) void next.release();
        else lock = next;
      } catch {
        /* refused (battery saver…): the screen sleeps as usual */
      }
    };
    // The lock is lost when the tab is hidden; it is asked again on return.
    const onVisible = () => void request();
    void request();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      closed = true;
      document.removeEventListener("visibilitychange", onVisible);
      void lock?.release().catch(() => undefined);
    };
  }, []);
}
