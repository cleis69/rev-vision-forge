import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";

import { RevLogo } from "@/components/rev/Logo";

/** Centered card for the sign-in, link and password pages. */
export function AuthCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-5 py-12">
      <Link to="/" aria-label="REV — Real Estate Vision, retour au site" className="mb-8">
        <RevLogo className="h-11 w-auto" />
      </Link>
      <main className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)] sm:p-8">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-primary">
          Espace promoteur
        </p>
        <h1 className="mt-3 font-display text-2xl font-medium tracking-tight">{title}</h1>
        {description ? (
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
        ) : null}
        <div className="mt-6">{children}</div>
      </main>
    </div>
  );
}

/** Status line under a form, read out by screen readers. */
export function FormMessage({ tone, children }: { tone: "error" | "info"; children: ReactNode }) {
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={
        tone === "error"
          ? "rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-red-300"
          : "rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-foreground/90"
      }
    >
      {children}
    </p>
  );
}
