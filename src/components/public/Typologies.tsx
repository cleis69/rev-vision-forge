import { useState, type ReactNode } from "react";
import { Bath, BedDouble, FileDown, LayoutGrid, Maximize2, Play, Trees } from "lucide-react";

import { formatPrice } from "@/lib/app/lot-format";
import { mediaDocument, mediaImage, type MediaItem } from "@/lib/app/media";
import { rangeLabel, type Typology } from "@/lib/public/typologies";
import { formatSize } from "@/lib/video";
import { cn } from "@/lib/utils";
import { MediaViewer } from "./MediaViewer";

/* Typologies section: a card per type of lot, with its photo, its figures,
   what is still free, its plans and its brochure, and a way to its lots. */

export function Typologies({
  types,
  currency,
  showPrices,
  onShowLots,
  tourFor,
}: {
  types: Typology[];
  currency: string;
  showPrices: boolean;
  /** "Voir les lots": the list filtered on the type. */
  onShowLots: (type: string) => void;
  /** Button of the 360° tour of a type, if it has one. */
  tourFor: (type: string) => ReactNode;
}) {
  return (
    <ul
      className={cn(
        "grid gap-4",
        types.length === 2
          ? "md:grid-cols-2"
          : types.length >= 3 && "md:grid-cols-2 lg:grid-cols-3",
      )}
    >
      {types.map((t) => (
        <li key={t.name}>
          <TypeCard
            type={t}
            currency={currency}
            showPrices={showPrices}
            onShowLots={() => onShowLots(t.name)}
            tour={tourFor(t.name)}
          />
        </li>
      ))}
    </ul>
  );
}

function TypeCard({
  type,
  currency,
  showPrices,
  onShowLots,
  tour,
}: {
  type: Typology;
  currency: string;
  showPrices: boolean;
  onShowLots: () => void;
  tour: ReactNode;
}) {
  const [viewing, setViewing] = useState<{ items: MediaItem[]; index: number } | null>(null);
  const cover = type.photos[0] ? mediaImage(type.photos[0]) : null;
  const gallery = [...type.photos, ...type.videos];
  const total = type.lots.length;
  const price = !showPrices
    ? null
    : type.priceFrom !== null
      ? `À partir de ${formatPrice(type.priceFrom, currency)}`
      : type.available > 0
        ? "Prix sur demande"
        : null;

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
      <button
        type="button"
        disabled={gallery.length === 0}
        onClick={() => setViewing({ items: gallery, index: 0 })}
        className="group relative block aspect-[16/10] w-full overflow-hidden bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/70 disabled:cursor-default"
        aria-label={gallery.length ? `Photos : ${type.name}` : type.name}
      >
        {cover ? (
          <img
            src={cover.thumb}
            srcSet={`${cover.thumb} 800w, ${cover.large} 2048w`}
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03] motion-reduce:transition-none"
          />
        ) : null}
        <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-black/80 via-black/30 to-transparent px-5 pb-4 pt-16 text-left">
          <span className="font-brand text-2xl font-medium tracking-tight text-white">
            {type.name}
          </span>
          {gallery.length > 1 ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1 text-[11px] text-white/85 backdrop-blur">
              {type.videos.length ? <Play className="size-3 fill-current" aria-hidden /> : null}
              {gallery.length} médias
            </span>
          ) : null}
        </span>
      </button>

      <div className="flex flex-1 flex-col gap-4 p-4 sm:p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <p className="text-sm text-white/70">
            {total} {total > 1 ? "lots" : "lot"}
            {" · "}
            <span className={type.available ? "text-[color:var(--brand)]" : "text-white/50"}>
              {type.available === 0
                ? "complet"
                : `${type.available} disponible${type.available > 1 ? "s" : ""}`}
            </span>
          </p>
          {price ? <p className="text-sm font-medium text-white">{price}</p> : null}
        </div>

        <dl className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/75">
          {type.surface ? (
            <Fact icon={<Maximize2 className="size-3.5" aria-hidden />} label="Surface">
              {rangeLabel(type.surface, "m²")}
            </Fact>
          ) : null}
          {type.chambres ? (
            <Fact icon={<BedDouble className="size-3.5" aria-hidden />} label="Chambres">
              {rangeLabel(type.chambres)} ch.
            </Fact>
          ) : null}
          {type.sallesDeBain ? (
            <Fact icon={<Bath className="size-3.5" aria-hidden />} label="Salles de bains">
              {rangeLabel(type.sallesDeBain)} sdb
            </Fact>
          ) : null}
          {type.terrain ? (
            <Fact icon={<Trees className="size-3.5" aria-hidden />} label="Terrain">
              {rangeLabel(type.terrain, "m²")}
            </Fact>
          ) : null}
        </dl>

        {type.description ? (
          <p className="whitespace-pre-line text-sm leading-relaxed text-white/65">
            {type.description}
          </p>
        ) : null}

        {type.plans.length > 0 ? (
          <div>
            <h3 className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/50">
              Plans
            </h3>
            <ul className="mt-3 flex gap-2 overflow-x-auto [scrollbar-width:none]">
              {type.plans.map((plan, i) => {
                const image = mediaImage(plan);
                return (
                  <li key={plan.id} className="shrink-0">
                    <button
                      type="button"
                      onClick={() => setViewing({ items: type.plans, index: i })}
                      className="block overflow-hidden rounded-lg border border-white/10 bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                      aria-label={`Agrandir le plan : ${image.caption || `plan ${i + 1}, ${type.name}`}`}
                    >
                      <img
                        src={image.thumb}
                        alt=""
                        loading="lazy"
                        className="h-24 w-auto object-contain"
                      />
                    </button>
                    {image.caption ? (
                      <p className="mt-1.5 max-w-32 truncate text-[11px] text-white/55">
                        {image.caption}
                      </p>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}

        <div className="mt-auto flex flex-wrap gap-2 pt-1">
          <button
            type="button"
            onClick={onShowLots}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-white px-4 text-sm font-medium text-black transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          >
            <LayoutGrid className="size-4" aria-hidden />
            Voir les lots
          </button>
          {type.documents.map((doc) => {
            const file = mediaDocument(doc);
            return (
              <a
                key={doc.id}
                href={file.url}
                download={file.name}
                target="_blank"
                rel="noopener"
                className="inline-flex h-10 items-center gap-2 rounded-full border border-white/20 px-4 text-sm text-white transition-colors hover:border-white/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
              >
                <FileDown className="size-4" aria-hidden />
                {file.caption || "Brochure"}
                {file.size ? (
                  <span className="text-xs text-white/50">PDF · {formatSize(file.size)}</span>
                ) : null}
              </a>
            );
          })}
          {tour}
        </div>
      </div>

      <MediaViewer
        items={viewing?.items ?? []}
        index={viewing?.index ?? null}
        onIndexChange={(index) => setViewing((v) => (v && index !== null ? { ...v, index } : null))}
        title={type.name}
      />
    </article>
  );
}

function Fact({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-1.5">
      <dt className="text-[color:var(--brand)]">
        {icon}
        <span className="sr-only">{label}</span>
      </dt>
      <dd>{children}</dd>
    </div>
  );
}
