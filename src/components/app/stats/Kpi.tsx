import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

import { trend } from "@/lib/app/stats";
import { cn } from "@/lib/utils";

/* A key figure of the statistics, with its change from the previous period. */

const count = new Intl.NumberFormat("fr-FR");

export function Kpi({
  label,
  hint,
  value,
  previous,
  compared,
  extra,
  compact = false,
}: {
  label: string;
  hint?: string;
  value: number;
  previous: number;
  compared: string;
  extra?: string | undefined;
  /** Smaller, for the Aperçu tab. */
  compact?: boolean;
}) {
  const t = trend(value, previous);
  return (
    <div
      className={cn(
        "rounded-2xl border border-border",
        compact ? "bg-background/40 p-3.5" : "bg-card p-5",
      )}
      title={hint}
    >
      <p className="text-sm text-muted-foreground">{label}</p>
      <p
        className={cn(
          "font-display font-medium tabular-nums tracking-tight",
          compact ? "mt-1 text-2xl" : "mt-2 text-3xl",
        )}
      >
        {count.format(value)}
      </p>
      <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
        {t.kind === "up" || t.kind === "down" ? (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 font-medium",
              t.kind === "up" ? "text-emerald-300" : "text-rose-300",
            )}
          >
            {t.kind === "up" ? (
              <ArrowUpRight className="size-3.5" aria-hidden />
            ) : (
              <ArrowDownRight className="size-3.5" aria-hidden />
            )}
            <span className="sr-only">{t.kind === "up" ? "En hausse de" : "En baisse de"}</span>
            {t.percent} %
          </span>
        ) : t.kind === "same" ? (
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <Minus className="size-3.5" aria-hidden />
            Stable
          </span>
        ) : t.kind === "new" ? (
          <span className="font-medium text-emerald-300">Nouveau</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
        {t.kind !== "none" ? <span className="text-muted-foreground">{compared}</span> : null}
      </p>
      {extra ? <p className="mt-1 text-xs text-muted-foreground">{extra}</p> : null}
    </div>
  );
}
