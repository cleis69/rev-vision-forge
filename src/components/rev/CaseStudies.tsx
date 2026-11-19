import { ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { CASES, casePath, heroBackdrop } from "@/lib/cases";
import { CLIENTS } from "@/lib/clients";
import { useCopy, useLocale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { CaseHeroMedia } from "./CaseMedia";
import { GlassStage } from "./Glass";
import { Container, Section, SectionHeading } from "./ui";
import { Reveal } from "./Reveal";
import { ClientMark } from "./ClientLogos";

/*
 * The case studies as register rows. The two complete ones (a website, films
 * and more) get the programme on its champagne stage, alternating sides; the
 * others follow as compact lines: logo, what was done, two facts.
 */

const FEATURED = 2;

const COPY = {
  fr: {
    title: "Six études de cas, [[client par client]]",
    description:
      "Le site, les films, les réseaux, les campagnes, et pour CITYSTAR le plan de vente 3D : ce que nous avons fait pour chacun.",
    read: "Lire l'étude de cas",
    stageAlt: (n: string) => `${n}, le projet`,
  },
  en: {
    title: "Six case studies, [[client by client]]",
    description:
      "The website, the films, social media, the campaigns and, for CITYSTAR, the 3D sales plan: what we did for each of them.",
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
          {CASES.slice(0, FEATURED).map((study, i) => {
            const text = study.copy[locale];
            const client = CLIENTS.find((c) => c.id === study.client);
            const href = casePath(study.slug, locale);
            return (
              <li key={study.slug} className="border-t border-border/70 py-8 sm:py-10">
                <Reveal className="grid items-center gap-7 lg:grid-cols-2 lg:gap-14">
                  <GlassStage
                    as={Link}
                    to={href as never}
                    tabIndex={-1}
                    aria-hidden
                    backdrop={heroBackdrop(study)}
                    className={cn("block p-4 sm:p-6", i % 2 === 1 && "lg:order-2")}
                  >
                    <CaseHeroMedia study={study} alt={copy.stageAlt(study.name)} />
                  </GlassStage>
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
        <ul className="border-b border-border/70">
          {CASES.slice(FEATURED).map((study) => {
            const text = study.copy[locale];
            const client = CLIENTS.find((c) => c.id === study.client);
            return (
              <li key={study.slug} className="border-t border-border/70 first:border-t-0">
                <Link
                  to={casePath(study.slug, locale) as never}
                  className="group grid items-center gap-x-8 gap-y-3 py-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-foreground/70 sm:grid-cols-[11rem_minmax(0,1fr)_auto] lg:grid-cols-[13rem_minmax(0,1fr)_minmax(0,18rem)_auto]"
                >
                  <span className="flex h-12 items-center text-foreground/80 transition-colors duration-200 group-hover:text-foreground">
                    {client ? <ClientMark client={client} className="[--k:0.85]" /> : null}
                  </span>
                  <span>
                    <span className="block font-display text-[17px] font-medium tracking-tight transition-colors duration-200 group-hover:text-primary">
                      {study.name}
                    </span>
                    <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">{text.card}</span>
                  </span>
                  <span className="hidden text-sm text-muted-foreground lg:block">
                    {text.facts
                      .slice(1, 3)
                      .map((f) => f.value)
                      .join(" · ")}
                  </span>
                  <ArrowRight
                    size={18}
                    aria-hidden
                    className="hidden text-muted-foreground transition-colors duration-200 group-hover:text-primary sm:block"
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      </Container>
    </Section>
  );
}
