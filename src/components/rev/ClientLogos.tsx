import type { CSSProperties } from "react";
import { Link } from "@tanstack/react-router";

import { CASES, casePath } from "@/lib/cases";
import { CLIENTS, type Client } from "@/lib/clients";
import { useCopy, useLocale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Container } from "./ui";

/*
 * The developers who trusted REV, as one line of logos drawn in the text
 * colour (each logo is a mask over the current colour, so they read as one
 * family whatever their own colours). A client with a case study links to it.
 */

const COPY = {
  fr: { label: "Ils nous confient leurs programmes", caseOf: (n: string) => `Étude de cas ${n}` },
  en: { label: "They trust us with their developments", caseOf: (n: string) => `${n} case study` },
};

/** A client's logo drawn in the current text colour. */
export function ClientMark({ client, className }: { client: Client; className?: string }) {
  const style = {
    "--h": `${client.height}px`,
    height: "calc(var(--h) * var(--k))",
    width: `calc(var(--h) * var(--k) * ${client.ratio.toFixed(3)})`,
    WebkitMaskImage: `url("${client.logo}")`,
    maskImage: `url("${client.logo}")`,
    WebkitMaskSize: "contain",
    maskSize: "contain",
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
    WebkitMaskPosition: "center",
    maskPosition: "center",
  } as CSSProperties;
  return (
    <span
      role="img"
      aria-label={client.name}
      className={cn("block bg-current [--k:1]", className)}
      style={style}
    />
  );
}

export function ClientLogos({ className }: { className?: string }) {
  const copy = useCopy(COPY);
  const locale = useLocale();
  return (
    <section className={cn("border-y border-border/70 py-7 sm:py-8", className)}>
      <Container className="flex flex-col gap-5 lg:flex-row lg:items-center lg:gap-12">
        <h2 className="shrink-0 text-sm text-muted-foreground lg:w-44">{copy.label}</h2>
        <ul className="flex flex-1 flex-wrap items-center justify-center gap-x-7 gap-y-5 text-foreground/75 [--k:0.7] sm:justify-between sm:gap-x-8 sm:[--k:0.85] xl:[--k:1]">
          {CLIENTS.map((client) => {
            const study = CASES.find((c) => c.client === client.id);
            return (
              <li key={client.id}>
                {study ? (
                  <Link
                    to={casePath(study.slug, locale) as never}
                    aria-label={copy.caseOf(client.name)}
                    className="block rounded-[4px] transition-colors duration-200 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/70 focus-visible:ring-offset-4 focus-visible:ring-offset-background"
                  >
                    <ClientMark client={client} className="[--k:inherit]" />
                  </Link>
                ) : (
                  <ClientMark client={client} className="[--k:inherit]" />
                )}
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
