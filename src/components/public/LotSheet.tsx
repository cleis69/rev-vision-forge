import type { ReactNode } from "react";
import { BedDouble, Maximize2, Trees } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { STATUS_LABELS, type LotStatus } from "@/lib/app/lot-fields";
import { mediaImage, type MediaItem } from "@/lib/app/media";
import type { PublicLot } from "@/lib/public/programme";
import { cn } from "@/lib/utils";
import { priceLabel } from "./PublicPlan";

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

/** Details of a lot: side panel on a computer, full screen on a phone. */
export function LotSheet({
  lot,
  photos,
  currency,
  open,
  onOpenChange,
}: {
  lot: PublicLot | null;
  photos: MediaItem[];
  currency: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto border-white/10 bg-[#0d0d0d] p-0 sm:max-w-md">
        {lot ? (
          <article>
            {photos.length > 0 ? (
              <div
                className="flex snap-x snap-mandatory overflow-x-auto"
                aria-label={`Photos du lot ${lot.numero}`}
                role="region"
                tabIndex={0}
              >
                {photos.map((photo) => {
                  const image = mediaImage(photo);
                  return (
                    <figure
                      key={photo.id}
                      className="relative aspect-[4/3] w-full shrink-0 snap-center bg-white/5"
                    >
                      <img
                        src={image.thumb}
                        srcSet={`${image.thumb} 800w, ${image.large} 2048w`}
                        sizes="(min-width: 640px) 448px, 100vw"
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

            <div className="space-y-6 p-6">
              <SheetHeader className="space-y-3 text-left">
                <StatusChip status={lot.statut} className="self-start" />
                <SheetTitle className="font-display text-2xl font-medium tracking-tight text-white">
                  Lot {lot.numero}
                  {lot.type ? <span className="text-white/60"> · {lot.type}</span> : null}
                </SheetTitle>
                <SheetDescription
                  className={cn(
                    "text-xl font-medium text-white",
                    lot.statut === "vendue" && "text-white/50",
                  )}
                >
                  {priceLabel(lot, currency)}
                </SheetDescription>
              </SheetHeader>

              <dl className="grid grid-cols-3 gap-3">
                {lot.surface_habitable !== null ? (
                  <Fact
                    icon={<Maximize2 className="size-4" aria-hidden />}
                    label="Surface habitable"
                  >
                    {area.format(lot.surface_habitable)} m²
                  </Fact>
                ) : null}
                {lot.surface_terrain !== null ? (
                  <Fact icon={<Trees className="size-4" aria-hidden />} label="Terrain">
                    {area.format(lot.surface_terrain)} m²
                  </Fact>
                ) : null}
                {lot.chambres !== null ? (
                  <Fact icon={<BedDouble className="size-4" aria-hidden />} label="Chambres">
                    {lot.chambres}
                  </Fact>
                ) : null}
              </dl>

              {lot.description ? (
                <p className="whitespace-pre-line text-sm leading-relaxed text-white/75">
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
                        className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-white/85"
                      >
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </article>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

function Fact({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
      <dt className="flex items-center gap-1.5 text-[11px] text-white/50">
        <span className="text-[color:var(--brand)]">{icon}</span>
        {label}
      </dt>
      <dd className="mt-1.5 text-sm font-medium text-white">{children}</dd>
    </div>
  );
}
