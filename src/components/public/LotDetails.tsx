import type { ElementType, ReactNode } from "react";
import { BedDouble, Layers, Maximize2, Trees } from "lucide-react";

import { STATUS_LABELS, type LotStatus } from "@/lib/app/lot-fields";
import { mediaImage, type MediaItem } from "@/lib/app/media";
import type { PublicLot } from "@/lib/public/programme";
import { cn } from "@/lib/utils";
import { levelLabel } from "@/lib/views";
import { priceLabel } from "./status";

const area = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 });

export function StatusChip({ status, className }: { status: LotStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium",
        status === "disponible" && "bg-[color:var(--brand)]/15 text-[color:var(--brand)]",
        status === "reservee" && "bg-amber-400/15 text-amber-300",
        status === "vendue" && "bg-white/10 text-white/60",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "size-1.5 rounded-full",
          status === "disponible" && "bg-[color:var(--brand)]",
          status === "reservee" && "bg-amber-400",
          status === "vendue" && "bg-white/50",
        )}
      />
      {STATUS_LABELS[status]}
    </span>
  );
}

/**
 * Photos, status, price, surfaces and features of a lot: in the side panel of
 * the programme page, under the embedded plan, and in large for the sales
 * office. `Title` and `Description` let a dialog name itself after the lot.
 */
export function LotDetails({
  lot,
  photos,
  currency,
  large = false,
  split = false,
  Title = "h2",
  Description = "p",
}: {
  lot: PublicLot;
  photos: MediaItem[];
  currency: string;
  /** Presentation mode: bigger type for a tablet seen from a step away. */
  large?: boolean;
  /** Photos beside the details on a wide screen (embedded plan). */
  split?: boolean;
  Title?: ElementType;
  Description?: ElementType;
}) {
  return (
    <article className={cn(split && photos.length > 0 && "md:grid md:grid-cols-2")}>
      {photos.length > 0 ? (
        <div
          className={cn("flex snap-x snap-mandatory overflow-x-auto", split && "md:self-start")}
          aria-label={`Photos du lot ${lot.numero}`}
          role="region"
          tabIndex={0}
        >
          {photos.map((photo) => {
            const image = mediaImage(photo);
            return (
              <figure
                key={photo.id}
                className={cn(
                  "relative w-full shrink-0 snap-center bg-white/5",
                  large ? "aspect-[16/10]" : "aspect-[4/3]",
                )}
              >
                <img
                  src={image.thumb}
                  srcSet={`${image.thumb} 800w, ${image.large} 2048w`}
                  sizes={
                    large ? "(min-width: 1024px) 560px, 100vw" : "(min-width: 640px) 448px, 100vw"
                  }
                  alt={image.caption || `Lot ${lot.numero}`}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                {image.caption ? (
                  <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-4 pb-3 pt-8 text-xs text-white/85">
                    {image.caption}
                  </figcaption>
                ) : null}
              </figure>
            );
          })}
        </div>
      ) : null}

      <div className={cn("space-y-6", large ? "p-8" : "p-6")}>
        <div className="flex flex-col gap-3 text-left">
          <StatusChip
            status={lot.statut}
            className={cn("self-start", large && "px-3.5 py-1.5 text-sm")}
          />
          <Title
            className={cn(
              "font-brand font-medium tracking-tight text-white",
              large ? "text-4xl" : "text-2xl",
            )}
          >
            Lot {lot.numero}
            {lot.type ? <span className="text-white/60"> · {lot.type}</span> : null}
          </Title>
          <Description
            className={cn(
              "font-medium text-white",
              large ? "text-3xl" : "text-xl",
              lot.statut === "vendue" && "text-white/50",
            )}
          >
            {priceLabel(lot, currency)}
          </Description>
        </div>

        <dl className="grid grid-cols-3 gap-3">
          {lot.surface_habitable !== null ? (
            <Fact
              large={large}
              icon={<Maximize2 className="size-4" aria-hidden />}
              label="Surface habitable"
            >
              {area.format(lot.surface_habitable)} m²
            </Fact>
          ) : null}
          {lot.surface_terrain !== null ? (
            <Fact large={large} icon={<Trees className="size-4" aria-hidden />} label="Terrain">
              {area.format(lot.surface_terrain)} m²
            </Fact>
          ) : null}
          {lot.chambres !== null ? (
            <Fact
              large={large}
              icon={<BedDouble className="size-4" aria-hidden />}
              label="Chambres"
            >
              {lot.chambres}
            </Fact>
          ) : null}
          {lot.niveau !== null ? (
            <Fact large={large} icon={<Layers className="size-4" aria-hidden />} label="Niveau">
              {levelLabel(lot.niveau)}
            </Fact>
          ) : null}
        </dl>

        {lot.description ? (
          <p
            className={cn(
              "whitespace-pre-line leading-relaxed text-white/75",
              large ? "text-lg" : "text-sm",
            )}
          >
            {lot.description}
          </p>
        ) : null}

        {lot.features.length > 0 ? (
          <div>
            <h3 className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/50">
              Caractéristiques
            </h3>
            <ul className="mt-3 flex flex-wrap gap-2">
              {lot.features.map((f) => (
                <li
                  key={f}
                  className={cn(
                    "rounded-full border border-white/10 bg-white/5 text-white/85",
                    large ? "px-4 py-1.5 text-base" : "px-3 py-1 text-sm",
                  )}
                >
                  {f}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </article>
  );
}

function Fact({
  icon,
  label,
  large,
  children,
}: {
  icon: ReactNode;
  label: string;
  large: boolean;
  children: ReactNode;
}) {
  return (
    <div className={cn("rounded-xl border border-white/10 bg-white/[0.03]", large ? "p-4" : "p-3")}>
      <dt
        className={cn("flex items-center gap-1.5 text-white/50", large ? "text-sm" : "text-[11px]")}
      >
        <span className="text-[color:var(--brand)]">{icon}</span>
        {label}
      </dt>
      <dd className={cn("mt-1.5 font-medium text-white", large ? "text-xl" : "text-sm")}>
        {children}
      </dd>
    </div>
  );
}
