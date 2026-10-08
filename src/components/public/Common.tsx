import { useEffect, useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { LOT_STATUSES, STATUS_LABELS, type LotStatus } from "@/lib/app/lot-fields";
import { cn } from "@/lib/utils";

/* Pieces shared by the public pages: programme page, embedded plan, presentation. */

/** Data client and messages of a public page (its own: visitors are not signed in). */
export function PublicProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 60_000, retry: 1, refetchOnWindowFocus: false } },
      }),
  );
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Top: the comparison bar sits at the bottom of the page. */}
      <Toaster position="top-center" />
    </QueryClientProvider>
  );
}

export function PoweredBy({ className }: { className?: string }) {
  return (
    <p className={cn("text-xs text-white/40", className)}>
      Propulsé par{" "}
      <a
        href="https://realestatevision360.com/"
        target="_blank"
        rel="noopener"
        className="text-white/60 underline-offset-4 hover:text-white hover:underline"
      >
        REV
      </a>
    </p>
  );
}

export function PublicLoading({ className }: { className?: string }) {
  return (
    <div
      className={cn("min-h-svh bg-[#080808] px-5 py-10 sm:px-10", className)}
      aria-busy="true"
      aria-label="Chargement du programme"
    >
      <div className="mx-auto max-w-6xl space-y-6">
        <Skeleton className="h-6 w-40 bg-white/10" />
        <Skeleton className="h-14 w-full max-w-xl bg-white/10" />
        <Skeleton className="aspect-[16/9] w-full rounded-2xl bg-white/10" />
      </div>
    </div>
  );
}

/** Unknown, unpublished or unreachable programme. */
export function PublicMessage({
  failed,
  className,
}: {
  /** Network or server error, rather than a programme that is not online. */
  failed: boolean;
  className?: string;
}) {
  const title = failed ? "Page momentanément indisponible" : "Ce programme n'est pas en ligne";
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
        <p className="mt-3 text-sm text-white/60">
          {failed
            ? "Vérifiez votre connexion internet puis rechargez la page."
            : "Il n'existe pas, ou il n'est pas encore (ou plus) publié."}
        </p>
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
  const options: { status: LotStatus | null; label: string; count: number }[] = [
    { status: null, label: "Tous", count: total },
    ...LOT_STATUSES.map((s) => ({ status: s, label: `${STATUS_LABELS[s]}s`, count: counts[s] })),
  ];
  return (
    <div role="group" aria-label="Filtrer les lots par statut" className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = value === o.status;
        return (
          <button
            key={o.label}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(o.status)}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70",
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
