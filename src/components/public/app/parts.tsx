import { useEffect, useState, type ReactNode } from "react";
import { Phone } from "lucide-react";

import { mediaImage, mediaVideo, type MediaItem } from "@/lib/app/media";
import { useCopy } from "@/lib/i18n";
import { phoneLabel, telHref, whatsappHref } from "@/lib/public/contact";
import { cn } from "@/lib/utils";

/* Small pieces of the programme page (ProgrammeApp). */

const COPY = {
  fr: { writeWhatsapp: "Écrire sur WhatsApp" },
  en: { writeWhatsapp: "Message on WhatsApp" },
};

/** Background of the programme tab: the shortest video on a computer, else the photo chosen. */
export function HeroBackdrop({
  photo,
  video,
}: {
  photo: MediaItem | null;
  video: MediaItem | null;
}) {
  const [motion, setMotion] = useState(false);
  useEffect(() => {
    if (!video) return;
    const wide = window.matchMedia("(min-width: 768px)").matches;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saving = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
      ?.saveData;
    setMotion(wide && !still && !saving);
  }, [video]);
  const clip = video ? mediaVideo(video) : null;
  const image = photo ? mediaImage(photo) : null;
  if (!clip && !image) return null;
  return (
    <>
      {image ? (
        <img
          src={image.large}
          srcSet={`${image.thumb} 800w, ${image.large} 2048w`}
          sizes="100vw"
          alt=""
          fetchPriority="high"
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        />
      ) : clip?.poster ? (
        <img
          src={clip.poster}
          alt=""
          fetchPriority="high"
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        />
      ) : null}
      {clip && motion ? (
        <video
          src={clip.src}
          poster={clip.poster ?? image?.large}
          autoPlay
          muted
          loop
          playsInline
          aria-hidden
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        />
      ) : null}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/45 via-transparent to-[#080808]" />
      {/* The text stays readable over a busy image. */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/65 via-black/20 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-2/3 bg-gradient-to-t from-[#080808] via-[#080808]/70 to-transparent" />
    </>
  );
}

/** The sales team's phone: a call, or a WhatsApp conversation already started. */
export function ContactLinks({ phone, text }: { phone: string; text: string }) {
  const copy = useCopy(COPY);
  return (
    <>
      <a
        href={telHref(phone)}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-white/20 px-5 text-sm text-white transition-colors hover:border-white/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
      >
        <Phone className="size-4" aria-hidden />
        {phoneLabel(phone)}
      </a>
      <a
        href={whatsappHref(phone, text)}
        target="_blank"
        rel="noopener"
        className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#25D366]/50 px-5 text-sm text-[#5fe08f] transition-colors hover:border-[#25D366] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
      >
        <WhatsAppIcon className="size-4" />
        {copy.writeWhatsapp}
      </a>
    </>
  );
}

export function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.2h.01c5.46 0 9.9-4.45 9.9-9.91A9.85 9.85 0 0 0 12.04 2Zm0 18.15h-.01a8.23 8.23 0 0 1-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.25-8.23a8.2 8.2 0 0 1 8.23 8.24c0 4.54-3.7 8.23-8.22 8.23Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.4-.12-.56.13-.17.25-.64.8-.78.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.23.25-.86.85-.86 2.07s.89 2.4 1.01 2.56c.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.29Z" />
    </svg>
  );
}

export function Stat({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-[0.2em] text-white/50">{label}</dt>
      <dd className="mt-1 font-brand text-xl font-medium tracking-tight sm:text-2xl">{children}</dd>
    </div>
  );
}

export function SectionTitle({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <h2 className="font-brand text-2xl font-medium tracking-tight sm:text-3xl">{title}</h2>
      {children}
    </div>
  );
}

export function Chips<T extends string | number>({
  label,
  options,
  value,
  onChange,
  className,
}: {
  label: string;
  options: { value: T | null; label: string }[];
  value: T | null;
  onChange: (value: T | null) => void;
  className?: string;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        "-mx-5 flex max-w-[100vw] gap-2 overflow-x-auto px-5 [scrollbar-width:none] sm:mx-0 sm:max-w-full sm:flex-wrap sm:px-0",
        className,
      )}
    >
      {options.map((o) => {
        const active = value === o.value;
        return (
          <button
            key={o.value ?? "tous"}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(o.value)}
            className={cn(
              "inline-flex h-8 shrink-0 items-center rounded-full border px-3.5 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70",
              active
                ? "border-[color:var(--brand)] text-[color:var(--brand)]"
                : "border-white/15 text-white/65 hover:text-white",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
