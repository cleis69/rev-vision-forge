import { useEffect, useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useNavigate, useRouterState } from "@tanstack/react-router";

import { RevLogo } from "@/components/rev/Logo";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { LOT_STATUSES, type LotStatus } from "@/lib/app/lot-fields";
import { useCopy } from "@/lib/i18n";
import { STATUS_PLURAL, publicPathIn, useLocale, type Locale } from "@/lib/public/i18n";
import { cn } from "@/lib/utils";

/* Pieces shared by the public pages: programme page, embedded plan, presentation. */

// One for every public page, French and English: switching language keeps the data.
let publicClient: QueryClient | null = null;
const getPublicClient = () =>
  (publicClient ??= new QueryClient({
    defaultOptions: { queries: { staleTime: 60_000, retry: 1, refetchOnWindowFocus: false } },
  }));

/** Data client and messages of a public page (its own: visitors are not signed in). */
export function PublicProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(getPublicClient);
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Top: the comparison bar sits at the bottom of the page. */}
      <Toaster position="top-center" />
    </QueryClientProvider>
  );
}

/** REV's signature at the foot of every public page, whatever the promoter's branding. */
export function PoweredBy({ className }: { className?: string }) {
  const locale = useLocale();
  return (
    <p className={cn("text-sm text-white/60", className)}>
      <a
        href="https://realestatevision360.com/"
        target="_blank"
        rel="noopener"
        className="inline-flex items-center gap-2.5 rounded transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
      >
        {locale === "fr" ? "Propulsé par" : "Powered by"}
        <RevLogo variant="compact" lazy className="h-8 w-auto" />
      </a>
    </p>
  );
}

/** REV's logo at the top of every public page (page, embedded plan, presentation). */
export function RevBadge({
  size = "md",
  className,
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  return (
    <a
      href="https://realestatevision360.com/"
      target="_blank"
      rel="noopener"
      title="REV — Real Estate Vision"
      className={cn(
        "inline-flex shrink-0 items-center rounded transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60",
        className,
      )}
    >
      <RevLogo
        variant="compact"
        className={cn("w-auto", size === "sm" ? "h-6" : size === "lg" ? "h-10" : "h-8")}
      />
    </a>
  );
}

export function PublicLoading({ className }: { className?: string }) {
  const locale = useLocale();
  return (
    <div
      className={cn("min-h-svh bg-[#080808] px-5 py-10 sm:px-10", className)}
      aria-busy="true"
      aria-label={locale === "fr" ? "Chargement du programme" : "Loading the programme"}
    >
      <div className="mx-auto max-w-6xl space-y-6">
        <Skeleton className="h-6 w-40 bg-white/10" />
        <Skeleton className="h-14 w-full max-w-xl bg-white/10" />
        <Skeleton className="aspect-[16/9] w-full rounded-2xl bg-white/10" />
      </div>
    </div>
  );
}

const MESSAGE_COPY = {
  fr: {
    failedTitle: "Page momentanément indisponible",
    offlineTitle: "Ce programme n'est pas en ligne",
    failedText: "Vérifiez votre connexion internet puis rechargez la page.",
    offlineText: "Il n'existe pas, ou il n'est pas encore (ou plus) publié.",
  },
  en: {
    failedTitle: "Page temporarily unavailable",
    offlineTitle: "This programme is not online",
    failedText: "Check your internet connection, then reload the page.",
    offlineText: "It does not exist, or it is not (or no longer) published.",
  },
};

/** Unknown, unpublished or unreachable programme. */
export function PublicMessage({
  failed,
  className,
}: {
  /** Network or server error, rather than a programme that is not online. */
  failed: boolean;
  className?: string;
}) {
  const copy = useCopy(MESSAGE_COPY);
  const title = failed ? copy.failedTitle : copy.offlineTitle;
  useEffect(() => {
    document.title = title;
  }, [title]);
  return (
    <main
      className={cn(
        "grid min-h-svh place-items-center bg-[#080808] px-6 text-center text-white",
        className,
      )}
    >
      <div>
        <h1 className="font-brand text-2xl font-medium tracking-tight">{title}</h1>
        <p className="mt-3 text-sm text-white/60">{failed ? copy.failedText : copy.offlineText}</p>
        <PoweredBy className="mt-10" />
      </div>
    </main>
  );
}

/** "Tous / Disponibles / Réservés / Vendus", with the number of lots of each. */
export function StatusFilters({
  value,
  onChange,
  counts,
  total,
  large = false,
}: {
  value: LotStatus | null;
  onChange: (status: LotStatus | null) => void;
  counts: Record<LotStatus, number>;
  total: number;
  /** Presentation mode: buttons for a finger on a tablet. */
  large?: boolean;
}) {
  const locale = useLocale();
  const options: { status: LotStatus | null; label: string; count: number }[] = [
    { status: null, label: locale === "fr" ? "Tous" : "All", count: total },
    ...LOT_STATUSES.map((s) => ({ status: s, label: STATUS_PLURAL[locale][s], count: counts[s] })),
  ];
  return (
    <div
      role="group"
      aria-label={locale === "fr" ? "Filtrer les lots par statut" : "Filter the lots by status"}
      // One row that scrolls on a phone rather than two lines of buttons.
      className="-mx-5 flex max-w-[100vw] gap-2 overflow-x-auto px-5 [scrollbar-width:none] sm:mx-0 sm:max-w-full sm:flex-wrap sm:px-0"
    >
      {options.map((o) => {
        const active = value === o.status;
        return (
          <button
            key={o.label}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(o.status)}
            className={cn(
              "inline-flex shrink-0 items-center gap-2 rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70",
              large ? "h-12 px-5 text-base" : "h-9 px-4 text-sm",
              active
                ? "border-white bg-white text-black"
                : "border-white/15 text-white/75 hover:border-white/35 hover:text-white",
            )}
          >
            {o.label}
            <span className={cn("tabular-nums", active ? "text-black/60" : "text-white/45")}>
              {o.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}

const LANGUAGES: { locale: Locale; label: string; name: string }[] = [
  { locale: "fr", label: "FR", name: "Français" },
  { locale: "en", label: "EN", name: "English" },
];

/** FR / EN: the same page in the other language (the open lot and the mode stay). */
export function LanguageSwitch({
  large = false,
  className,
}: {
  /** Presentation mode: buttons for a finger on a tablet. */
  large?: boolean;
  className?: string;
}) {
  const locale = useLocale();
  const navigate = useNavigate();
  const { pathname, searchStr } = useRouterState({
    select: (s) => ({ pathname: s.location.pathname, searchStr: s.location.searchStr }),
  });
  return (
    <div
      role="group"
      aria-label={locale === "fr" ? "Langue" : "Language"}
      className={cn(
        "inline-flex shrink-0 items-center rounded-full border border-white/15 p-0.5",
        className,
      )}
    >
      {LANGUAGES.map((l) => {
        const href = `${publicPathIn(pathname, l.locale)}${searchStr}`;
        const active = l.locale === locale;
        return (
          <a
            key={l.locale}
            href={href}
            hrefLang={l.locale}
            lang={l.locale}
            title={l.name}
            aria-current={active ? "true" : undefined}
            onClick={(e) => {
              if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
              e.preventDefault();
              if (!active) void navigate({ href, replace: true, resetScroll: false });
            }}
            className={cn(
              "grid place-items-center rounded-full font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70",
              large ? "h-10 min-w-12 px-3 text-sm" : "h-7 min-w-9 px-2 text-xs",
              active ? "bg-white text-black" : "text-white/65 hover:text-white",
            )}
          >
            {l.label}
          </a>
        );
      })}
    </div>
  );
}
