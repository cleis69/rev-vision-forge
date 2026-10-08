import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CalendarCheck, ExternalLink, Eye, Share2, X } from "lucide-react";

import { PoweredBy, PublicMessage, RevBadge, StatusFilters } from "@/components/public/Common";
import { LotCards } from "@/components/public/LotCards";
import { LotDetails } from "@/components/public/LotDetails";
import { ProgrammeViews } from "@/components/public/ProgrammeViews";
import { useFollowLot, useViewKey } from "@/lib/public/use-views";
import { VisitForm } from "@/components/public/VisitForm";
import type { LotStatus } from "@/lib/app/lot-fields";
import { HEIGHT_MESSAGE, type HeightMessage } from "@/lib/public/embed";
import { track } from "@/lib/public/events";
import { useLiveLots } from "@/lib/public/live";
import {
  countByStatus,
  usePublicProgramme,
  type PublicData,
  type PublicLot,
} from "@/lib/public/programme";
import { lotUrl, shareLot } from "@/lib/public/share";
import { useBrandTheme } from "@/lib/public/theme";

// Sales plan alone, for an iframe on the promoter's site: no header, no
// footer, the lot opens under the plan, and the height is sent to the parent
// page (see embedCode) so the iframe never shows a scroll bar.
export const Route = createFileRoute("/embed/$slug")({
  component: EmbedPage,
});

function EmbedPage() {
  const { slug } = Route.useParams();
  const query = usePublicProgramme(slug);
  const organization = query.data?.programme.organization;
  useBrandTheme(organization?.brandColor ?? null, organization?.brandFont ?? null);
  const root = useParentHeight(slug);

  return (
    <div ref={root} className="bg-[#080808] text-white">
      {query.isPending ? (
        <div className="p-3 sm:p-4" aria-busy="true" aria-label="Chargement du plan de vente">
          <div className="aspect-[16/10] w-full animate-pulse rounded-2xl bg-white/[0.06] motion-reduce:animate-none" />
        </div>
      ) : query.isError || !query.data ? (
        <PublicMessage failed={query.isError} className="min-h-0 py-16" />
      ) : (
        <EmbeddedPlan data={query.data} slug={slug} />
      )}
    </div>
  );
}

/** Tells the parent page the height of the content, every time it changes. */
function useParentHeight(slug: string) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.parent === window) return;
    let last = 0;
    const send = () => {
      const height = Math.ceil(el.getBoundingClientRect().height);
      if (height === last) return;
      last = height;
      const message: HeightMessage = { type: HEIGHT_MESSAGE, slug, height };
      // Not a secret: any page may embed the plan and read its height.
      window.parent.postMessage(message, "*");
    };
    const observer = new ResizeObserver(send);
    observer.observe(el);
    send();
    return () => observer.disconnect();
  }, [slug]);
  return ref;
}

function EmbeddedPlan({ data, slug }: { data: PublicData; slug: string }) {
  const { programme, lots, media, preview } = data;
  const [filter, setFilter] = useState<LotStatus | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [visitFor, setVisitFor] = useState<string | null>(null);
  const highlight = useLiveLots(programme.id, slug);
  const panel = useRef<HTMLElement>(null);
  const focusPanel = useRef(false);
  const tracked = useRef(false);

  const lot = selectedId ? (lots.find((l) => l.id === selectedId) ?? null) : null;
  const counts = countByStatus(lots);
  const hasViews = data.views.length > 0 || Boolean(data.orbit);
  const [viewKey, setViewKey] = useViewKey(data);
  useFollowLot(data, lot, setViewKey);

  useEffect(() => {
    document.title = `Plan de vente — ${programme.name}`;
  }, [programme.name]);

  useEffect(() => {
    if (!preview && !tracked.current) {
      tracked.current = true;
      track(programme.id, "vue_page");
    }
  }, [programme.id, preview]);

  useEffect(() => {
    if (!selectedId) return;
    if (!preview) track(programme.id, "vue_lot", selectedId);
    if (focusPanel.current) panel.current?.focus({ preventScroll: true });
    focusPanel.current = false;
    // The details are under the plan: brought into view on the promoter's page,
    // once it has made the iframe taller (or after a moment if it does not).
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const reveal = () =>
      panel.current?.scrollIntoView({ block: "nearest", behavior: still ? "auto" : "smooth" });
    if (window.parent === window) {
      reveal();
      return;
    }
    const timer = window.setTimeout(reveal, 600);
    const onResize = () => {
      window.clearTimeout(timer);
      reveal();
    };
    window.addEventListener("resize", onResize, { once: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("resize", onResize);
    };
  }, [selectedId, preview, programme.id]);

  const open = (target: PublicLot, from: "plan" | "keyboard" | "list") => {
    if (!preview && from === "plan") track(programme.id, "clic_lot", target.id);
    focusPanel.current = from === "keyboard";
    setSelectedId(target.id);
  };

  const shown = filter ? lots.filter((l) => l.statut === filter) : lots;
  const button =
    "inline-flex h-11 items-center justify-center gap-2 rounded-full border border-white/15 px-4 text-sm text-white/85 transition-colors hover:border-white/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70";

  return (
    <div className="space-y-4 p-3 sm:p-4">
      {preview ? (
        <p className="rounded-xl bg-amber-400 px-4 py-2 text-sm font-medium text-black">
          <Eye className="mr-2 inline size-4 align-[-3px]" aria-hidden />
          Aperçu : ce programme n'est pas publié, le plan n'apparaîtra sur votre site qu'après sa
          publication.
        </p>
      ) : null}

      <div className="flex items-center justify-between gap-3">
        <h1 className="font-brand text-xl font-medium tracking-tight">{programme.name}</h1>
        <RevBadge size="sm" />
      </div>
      <StatusFilters value={filter} onChange={setFilter} counts={counts} total={lots.length} />

      {hasViews ? (
        <ProgrammeViews
          data={data}
          viewKey={viewKey}
          onViewChange={setViewKey}
          filter={filter}
          highlight={highlight}
          selected={selectedId}
          variant="embed"
          onOpen={open}
        />
      ) : shown.length > 0 ? (
        <LotCards
          lots={shown}
          currency={programme.currency}
          highlight={highlight}
          onOpen={(l) => open(l, "list")}
        />
      ) : (
        <p className="py-8 text-sm text-white/60">
          {lots.length === 0 ? "Les lots seront bientôt présentés." : "Aucun lot avec ce statut."}
        </p>
      )}

      {lot ? (
        <section
          ref={panel}
          key={lot.id}
          tabIndex={-1}
          aria-label={`Lot ${lot.numero}`}
          className="relative scroll-mt-3 overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d0d] outline-none focus-visible:ring-2 focus-visible:ring-white/60"
        >
          <button
            type="button"
            onClick={() => setSelectedId(null)}
            aria-label={`Fermer la fiche du lot ${lot.numero}`}
            className="absolute right-3 top-3 z-10 grid size-10 place-items-center rounded-full bg-black/60 text-white/85 backdrop-blur transition-colors hover:bg-black/80 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          >
            <X className="size-5" aria-hidden />
          </button>
          <LotDetails
            lot={lot}
            photos={media.filter((m) => m.lot_id === lot.id)}
            currency={programme.currency}
            split
            Title="h2"
          />
          {visitFor === lot.id && lot.statut !== "vendue" ? (
            <div className="border-t border-white/10 p-6">
              <h3 className="font-brand text-lg font-medium tracking-tight">
                Planifier une visite
              </h3>
              <div className="mt-4 max-w-xl">
                <VisitForm
                  projectId={programme.id}
                  slug={programme.slug}
                  owner={programme.organization.name}
                  lot={lot}
                  preview={preview}
                  source="embed"
                  privacyInNewTab
                />
              </div>
            </div>
          ) : null}
          <div className="flex flex-wrap gap-2 border-t border-white/10 p-4">
            {lot.statut !== "vendue" && visitFor !== lot.id ? (
              <button
                type="button"
                onClick={() => setVisitFor(lot.id)}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[color:var(--brand)] px-5 text-sm font-medium text-[color:var(--brand-contrast)] transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
              >
                <CalendarCheck className="size-4" aria-hidden />
                Planifier une visite
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => void shareLot(programme, lot, !preview)}
              className={button}
            >
              <Share2 className="size-4" aria-hidden />
              Partager
            </button>
            <a href={lotUrl(programme, lot)} target="_blank" rel="noopener" className={button}>
              <ExternalLink className="size-4" aria-hidden />
              Fiche complète
            </a>
          </div>
        </section>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-white/45">
        <a
          href={`/p/${encodeURIComponent(programme.slug)}`}
          target="_blank"
          rel="noopener"
          className="inline-flex items-center gap-1.5 underline-offset-4 hover:text-white hover:underline"
        >
          Voir la page du programme
          <ExternalLink className="size-3" aria-hidden />
        </a>
        <PoweredBy />
      </div>
    </div>
  );
}
