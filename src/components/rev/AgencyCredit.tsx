import { useLocale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const AGENCY_NAME = "UltraVision Agency";
export const AGENCY_URL = "https://ultravisionagency.com/";

const LABEL = { fr: "Site réalisé par", en: "Website by" } as const;

/**
 * Credit at the very bottom of the footer: UltraVision Agency's logo, linking
 * to the agency's site (a followed link, on every page). The logo's alt text
 * is the link's anchor text.
 */
export function AgencyCredit({ className }: { className?: string }) {
  const locale = useLocale();
  return (
    <p
      className={cn(
        "flex items-center justify-center gap-3 text-[11px] uppercase tracking-[0.2em] text-muted-foreground",
        className,
      )}
    >
      <span>{LABEL[locale]}</span>
      <a
        href={AGENCY_URL}
        target="_blank"
        rel="noopener"
        className="rounded-md opacity-80 transition-opacity duration-300 hover:opacity-100"
      >
        <img
          src="/brand/ultravision-logo.svg"
          alt={AGENCY_NAME}
          width={110}
          height={28}
          loading="lazy"
          className="h-7 w-auto"
        />
      </a>
    </p>
  );
}
