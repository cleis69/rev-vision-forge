import type { ElementType, ReactNode } from "react";
import { Bath, BedDouble, Eye, Layers, Maximize2, Trees } from "lucide-react";

import type { LotStatus } from "@/lib/app/lot-fields";
import { mediaImage, type MediaItem } from "@/lib/app/media";
import { useCopy } from "@/lib/i18n";
import type { PaymentStep, Rental } from "@/lib/payment-plan";
import { FOLLOWERS_SHOWN_FROM } from "@/lib/public/followers";
import { NUMBER_LOCALE, usePublicText, type Locale } from "@/lib/public/i18n";
import type { PublicLot } from "@/lib/public/programme";
import { cn } from "@/lib/utils";
import { LoanSimulator } from "./LoanSimulator";
import { PaymentPlan } from "./PaymentPlan";
import { RentalSimulator } from "./RentalSimulator";
import { priceLabel } from "./status";

const AREA: Record<Locale, Intl.NumberFormat> = {
  fr: new Intl.NumberFormat(NUMBER_LOCALE.fr, { maximumFractionDigits: 2 }),
  en: new Intl.NumberFormat(NUMBER_LOCALE.en, { maximumFractionDigits: 2 }),
};

const COPY = {
  fr: {
    photos: (numero: string) => `Photos du lot ${numero}`,
    livingArea: "Surface habitable",
    plot: "Terrain",
    bedrooms: "Chambres",
    bathrooms: "Salles de bains",
    floor: "Niveau",
    features: "Caractéristiques",
    followers: (n: number) => `${n} personnes suivent ce lot`,
  },
  en: {
    photos: (numero: string) => `Photos of lot ${numero}`,
    livingArea: "Living area",
    plot: "Plot",
    bedrooms: "Bedrooms",
    bathrooms: "Bathrooms",
    floor: "Floor",
    features: "Features",
    followers: (n: number) => `${n} people are following this lot`,
  },
};

/** What helps sell a lot on its sheet: how to pay, the yield, who follows it, and what to do when it is taken. */
export type LotSelling = {
  paymentPlan: PaymentStep[];
  paymentNote: string | null;
  rental: Rental;
  /** Visitors following the lot (said from FOLLOWERS_SHOWN_FROM on). */
  followers: number;
  /** Reserved or sold lot: the alert and the lots close to it (see LotUnavailable). */
  unavailable: ReactNode | null;
};

export function StatusChip({ status, className }: { status: LotStatus; className?: string }) {
  const text = usePublicText();
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
      {text.status[status]}
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
  extra,
  selling,
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
  /** Under the price: the 360° tour of the lot. */
  extra?: ReactNode;
  selling?: LotSelling | undefined;
}) {
  const copy = useCopy(COPY);
  const text = usePublicText();
  const area = AREA[text.locale];
  return (
    <article className={cn(split && photos.length > 0 && "md:grid md:grid-cols-2")}>
      {photos.length > 0 ? (
        <div
          className={cn(
            "flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none]",
            split && "md:self-start",
          )}
          aria-label={copy.photos(lot.numero)}
          role="region"
          tabIndex={0}
        >
          {photos.map((photo, i) => {
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
                {photos.length > 1 ? (
                  <span className="absolute left-3 top-3 rounded-md bg-black/65 px-2 py-1 text-[11px] font-medium tabular-nums text-white backdrop-blur">
                    {i + 1} / {photos.length}
                  </span>
                ) : null}
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
            {priceLabel(lot, currency, text.locale)}
          </Description>
          {selling && selling.followers >= FOLLOWERS_SHOWN_FROM ? (
            <p
              className={cn(
                "flex items-center gap-1.5 text-white/60",
                large ? "text-base" : "text-xs",
              )}
            >
              <Eye className="size-3.5 text-[color:var(--brand)]" aria-hidden />
              {copy.followers(selling.followers)}
            </p>
          ) : null}
        </div>

        <dl className="divide-y divide-white/[0.07] border-y border-white/[0.07]">
          {lot.surface_habitable !== null ? (
            <Fact
              large={large}
              icon={<Maximize2 className="size-4" aria-hidden />}
              label={copy.livingArea}
            >
              {area.format(lot.surface_habitable)} m²
            </Fact>
          ) : null}
          {lot.surface_terrain !== null ? (
            <Fact large={large} icon={<Trees className="size-4" aria-hidden />} label={copy.plot}>
              {area.format(lot.surface_terrain)} m²
            </Fact>
          ) : null}
          {lot.chambres !== null ? (
            <Fact
              large={large}
              icon={<BedDouble className="size-4" aria-hidden />}
              label={copy.bedrooms}
            >
              {lot.chambres}
            </Fact>
          ) : null}
          {lot.salles_de_bain !== null ? (
            <Fact
              large={large}
              icon={<Bath className="size-4" aria-hidden />}
              label={copy.bathrooms}
            >
              {lot.salles_de_bain}
            </Fact>
          ) : null}
          {lot.niveau !== null ? (
            <Fact large={large} icon={<Layers className="size-4" aria-hidden />} label={copy.floor}>
              {text.level(lot.niveau)}
            </Fact>
          ) : null}
        </dl>

        {extra}

        {lot.statut !== "disponible" && selling?.unavailable ? selling.unavailable : null}

        {lot.prix !== null && lot.statut !== "vendue" ? (
          <LoanSimulator price={lot.prix} currency={currency} large={large} />
        ) : null}

        {selling && lot.statut !== "vendue" ? (
          <PaymentPlan
            plan={selling.paymentPlan}
            note={selling.paymentNote}
            price={lot.prix}
            currency={currency}
            large={large}
          />
        ) : null}

        {selling &&
        selling.rental.nightly !== null &&
        lot.prix !== null &&
        lot.statut !== "vendue" ? (
          <RentalSimulator
            price={lot.prix}
            currency={currency}
            rental={{ ...selling.rental, nightly: selling.rental.nightly }}
            large={large}
          />
        ) : null}

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
            <h3 className="text-xs font-medium text-white/50">{copy.features}</h3>
            <ul className="mt-3 flex flex-wrap gap-2">
              {lot.features.map((f) => (
                <li
                  key={f}
                  className={cn(
                    "rounded-[8px] border border-white/10 bg-white/5 text-white/85",
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
    <div className={cn("flex items-center justify-between gap-4", large ? "py-3.5" : "py-2.5")}>
      <dt className={cn("flex items-center gap-2 text-white/60", large ? "text-base" : "text-sm")}>
        <span className="text-white/40">{icon}</span>
        {label}
      </dt>
      <dd className={cn("font-medium tabular-nums text-white", large ? "text-xl" : "text-sm")}>
        {children}
      </dd>
    </div>
  );
}
