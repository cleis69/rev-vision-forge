import { useId, type ReactNode } from "react";
import { Building2 } from "lucide-react";

import { STATUS_LABELS, type Project } from "@/lib/app/projects";
import { cn } from "@/lib/utils";

/* Small building blocks shared by the pages of the promoter space. */

export function StatusBadge({ status }: { status: Project["status"] }) {
  return (
    <span
      className={cn(
        "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium",
        status === "published" ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground",
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

export function EmptyState({
  title,
  text,
  children,
}: {
  title: string;
  text: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-border px-6 py-10 text-center">
      <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
        <Building2 className="size-5" aria-hidden />
      </span>
      <h2 className="mt-4 font-display text-lg font-medium tracking-tight">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">{text}</p>
      {children ? <div className="mt-6 w-full max-w-sm text-left">{children}</div> : null}
    </div>
  );
}

/** Card of a settings page; `danger` for irreversible actions. */
export function SettingsSection({
  title,
  description,
  danger = false,
  children,
}: {
  title: string;
  description?: string | undefined;
  danger?: boolean;
  children: ReactNode;
}) {
  const id = useId();
  return (
    <section
      aria-labelledby={id}
      className={cn(
        "rounded-2xl border bg-card p-4 sm:p-5",
        danger ? "border-destructive/40" : "border-border",
      )}
    >
      <h2 id={id} className="font-display text-lg font-medium tracking-tight">
        {title}
      </h2>
      {description ? (
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
      ) : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function PageHeading({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-primary">
          {eyebrow}
        </p>
        <h1 className="mt-1.5 font-display text-2xl font-medium tracking-tight sm:text-3xl">
          {title}
        </h1>
      </div>
      {children}
    </div>
  );
}
