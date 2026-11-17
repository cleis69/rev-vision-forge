import { ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { CASES, casePath } from "@/lib/cases";
import { CLIENTS } from "@/lib/clients";
import { useCopy, useLocale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { CaseHeroMedia } from "./CaseMedia";
import { Container, Section, SectionHeading } from "./ui";
import { Reveal } from "./Reveal";
import { ClientMark } from "./ClientLogos";

/*
 * The case studies as register rows: the programme on its champagne stage on
 * one side, what was done on the other, alternating from one row to the next.
 */

const COPY = {
  fr: {
    title: "Deux programmes, de bout en bout",
    description:
      "Le site, les films, les réseaux, la brochure, le logo, et pour CITYSTAR le plan de vente 3D : tout ce qu'un programme montre à ses acheteurs.",
    read: "Lire l'étude de cas",
    stageAlt: (n: string) => `${n}, le projet`,
  },
  en: {
    title: "Two developments, end to end",
    description:
      "The website, the films, social media, the brochure, the logo and, for CITYSTAR, the 3D sales plan: everything a development shows its buyers.",
    read: "Read the case study",
    stageAlt: (n: string) => `${n}, the project`,
  },
};

export function CaseStudies({ className }: { className?: string }) {
  const copy = useCopy(COPY);
  const locale = useLocale();
  return (
    <Section id="etudes-de-cas" className={cn("border-t border-border/70", className)}>
      <Container>
        <SectionHeading title={copy.title} description={copy.description} />
        <ul className="mt-10 border-b border-border/70 sm:mt-12">
          {CASES.map((study, i) => {
            const text = study.copy[locale];
            const client = CLIENTS.find((c) => c.id === study.client);
            const href = casePath(study.slug, locale);
            return (
              <li key={study.slug} className="border-t border-border/70 py-8 sm:py-10">
                <Reveal className="grid items-center gap-7 lg:grid-cols-2 lg:gap-14">
                  <Link
                    to={href as never}
                    tabIndex={-1}
                    aria-hidden
                    className={cn("block rounded-[14px] bg-primary p-4 sm:p-6", i % 2 === 1 && "lg:order-2")}
                  >
                    <CaseHeroMedia study={study} alt={copy.stageAlt(study.name)} />
                  </Link>
                  <div className={cn(i % 2 === 1 && "lg:order-1")}>
                    {client ? <ClientMark client={client} className="text-foreground/80" /> : null}
                    <h3 className="mt-5 font-display text-[clamp(1.35rem,2.2vw,1.85rem)] font-medium leading-[1.15] tracking-[-0.02em] [text-wrap:balance]">
                      <Link
                        to={href as never}
                        className="rounded-[4px] transition-colors duration-200 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/70 focus-visible:ring-offset-4 focus-visible:ring-offset-background"
                      >
                        {study.name}
                      </Link>
                    </h3>
                    <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
                      {text.card}
                    </p>
                    <dl className="mt-6 grid max-w-xl grid-cols-2 gap-x-6 border-t border-border/70 sm:grid-cols-4">
                      {text.facts.map((f) => (
                        <div key={f.label} className="border-b border-border/70 py-3 sm:border-b-0">
                          <dt className="text-xs text-muted-foreground">{f.label}</dt>
                          <dd className="mt-1 text-sm">{f.value}</dd>
                        </div>
                      ))}
                    </dl>
                    <Link
                      to={href as never}
                      className="mt-6 inline-flex h-11 items-center gap-2 rounded-[6px] text-sm font-medium text-foreground underline decoration-foreground/30 underline-offset-[6px] transition-colors duration-200 hover:decoration-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/70"
                    >
                      {copy.read}
                      <ArrowRight size={16} aria-hidden />
                    </Link>
                  </div>
                </Reveal>
              </li>
            );
          })}
        </ul>
      </Container>
    </Section>
  );
}
