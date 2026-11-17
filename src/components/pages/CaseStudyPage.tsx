import type { CSSProperties } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { BrowserShot, CaseHeroMedia } from "@/components/rev/CaseMedia";
import { CaseScenes } from "@/components/rev/CaseScenes";
import { ClientMark } from "@/components/rev/ClientLogos";
import { GlassStage } from "@/components/rev/Glass";
import { FinalCta } from "@/components/rev/FinalCta";
import { FilmGrid } from "@/components/rev/Portfolio";
import { Reveal } from "@/components/rev/Reveal";
import { Container, Cta, Section, fadeUp, headline } from "@/components/rev/ui";
import { FILMS, filmsOf } from "@/lib/ads";
import { CASES, casePath, heroBackdrop, type CaseStudy, type Gallery } from "@/lib/cases";
import { CLIENTS } from "@/lib/clients";
import { href, useLocale, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/*
 * One case study: the programme on a champagne stage, what was delivered as a
 * register, then the work itself — the website in use, the films, the posts,
 * the brochure and the logo — and the next case study.
 */

const COPY = {
  fr: {
    back: "Réalisations",
    salesPlan: "Ouvrir le plan de vente 3D",
    visit: (site: string) => `Voir ${site}`,
    contact: "Parler de votre programme",
    delivered: "Ce que nous avons livré",
    site: "Le site, en usage",
    siteCaption: (site: string) => `${site}, enregistré sur ordinateur et sur téléphone`,
    films: "Les films",
    filmsText: (n: number, note?: string) => (note ? `${n} films, ${note}` : `${n} films.`),
    seeFilms: "Voir les films",
    results: "Les résultats",
    plan: "Le plan de vente 3D",
    planText:
      "Le programme publié sur notre plan de vente : la résidence en 3D qui tourne du doigt, chaque villa colorée selon son statut mis à jour en direct, et la visite 360° de la villa A.",
    openOriginal: "Ouvrir l'original",
    allFilms: (n: number) => `Voir nos ${n} films`,
    next: "Étude de cas suivante",
    heroAlt: (n: string) => `${n}, le projet`,
  },
  en: {
    back: "Our work",
    salesPlan: "Open the 3D sales plan",
    visit: (site: string) => `Visit ${site}`,
    contact: "Talk about your development",
    delivered: "What we delivered",
    site: "The website, in use",
    siteCaption: (site: string) => `${site}, recorded on a computer and on a phone`,
    films: "The films",
    filmsText: (n: number, note?: string) => (note ? `${n} films, ${note}` : `${n} films.`),
    seeFilms: "See the films",
    results: "The results",
    plan: "The 3D sales plan",
    planText:
      "The development published on our sales plan: the residence in 3D, turned with a finger, every villa coloured by its live status, and the 360° tour of villa A.",
    openOriginal: "Open the original",
    allFilms: (n: number) => `See all ${n} films`,
    next: "Next case study",
    heroAlt: (n: string) => `${n}, the project`,
  },
};

/**
 * One row of films up to seven (the last tile links to all films), else two
 * rows; a short row keeps tiles at the size of a seven-film row.
 */
const filmColumns = (n: number) =>
  ({
    "--l": n <= 7 ? n : Math.ceil(n / 2),
    "--s": n <= 4 ? n : Math.min(5, Math.ceil(n / 2)),
    ...(n < 5 ? { maxWidth: `${n * 11}rem` } : {}),
  }) as CSSProperties;

const H2 = "font-display text-[clamp(1.5rem,2.6vw,2.1rem)] font-medium leading-[1.1] tracking-[-0.03em]";

export function CaseStudyPage({ study }: { study: CaseStudy }) {
  const locale = useLocale();
  const copy = COPY[locale];
  const text = study.copy[locale];
  const client = CLIENTS.find((c) => c.id === study.client);
  const films = filmsOf(study.client);
  const next = CASES[(CASES.indexOf(study) + 1) % CASES.length];

  return (
    <>
      <section className="pb-12 pt-28 md:pb-16 md:pt-32">
        <Container>
          <Link
            to={href("portfolio", locale) as never}
            className="inline-flex h-9 items-center gap-1.5 rounded-[6px] text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/70"
            style={fadeUp(0)}
          >
            <ArrowRight size={14} className="rotate-180" aria-hidden />
            {copy.back}
          </Link>
          <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.08fr)] lg:items-center lg:gap-14">
            <div>
              {client ? (
                <div style={fadeUp(0.05)}>
                  <ClientMark client={client} className="text-foreground/85" />
                </div>
              ) : null}
              <h1
                className="mt-6 font-display text-[clamp(1.9rem,3.6vw,3.1rem)] font-medium leading-[1.05] tracking-[-0.035em] [text-wrap:balance]"
                style={fadeUp(0.1)}
              >
                {headline(text.title)}
              </h1>
              <p
                className="mt-5 max-w-xl text-[15px] leading-relaxed text-muted-foreground md:text-base"
                style={fadeUp(0.2)}
              >
                {text.summary}
              </p>
              <div className="mt-7 flex flex-wrap gap-3" style={fadeUp(0.28)}>
                {study.salesPlan ? (
                  <Cta href={study.salesPlan[locale]} newTab>
                    {copy.salesPlan}
                    <ArrowUpRight size={16} aria-hidden />
                  </Cta>
                ) : study.website ? (
                  <Cta href={study.website.href} newTab>
                    {copy.visit(study.website.label)}
                    <ArrowUpRight size={16} aria-hidden />
                  </Cta>
                ) : (
                  <Cta href={href("contact", locale)}>{copy.contact}</Cta>
                )}
                {study.salesPlan && study.website ? (
                  <Cta href={study.website.href} newTab variant="ghost">
                    {copy.visit(study.website.label)}
                  </Cta>
                ) : study.website ? (
                  <Cta href={href("contact", locale)} variant="ghost">
                    {copy.contact}
                  </Cta>
                ) : films.length > 0 ? (
                  <Cta href="#films" variant="ghost">
                    {copy.seeFilms}
                  </Cta>
                ) : null}
              </div>
            </div>
            <GlassStage backdrop={heroBackdrop(study)} className="p-4 sm:p-6" style={fadeUp(0.15)}>
              <CaseHeroMedia study={study} alt={copy.heroAlt(study.name)} priority />
            </GlassStage>
          </div>
          <dl className="mt-10 grid grid-cols-2 border-t border-border/70 sm:grid-cols-4 lg:mt-14">
            {text.facts.map((f) => (
              <div key={f.label} className="border-b border-border/70 py-4 pr-4 sm:border-b-0">
                <dt className="text-xs text-muted-foreground">{f.label}</dt>
                <dd className="mt-1 font-display text-base font-medium tracking-tight sm:text-lg">{f.value}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      <Section className="border-t border-border/70">
        <Container>
          <Reveal>
            <h2 className={H2}>{copy.delivered}</h2>
          </Reveal>
          <ol className="mt-8 grid border-b border-border/70 sm:mt-10 lg:grid-cols-2 lg:gap-x-14">
            {text.delivered.map((d, i) => (
              <li key={d.title} className="grid grid-cols-[2.5rem_minmax(0,1fr)] border-t border-border/70 py-5">
                <span className="pt-1 text-xs tabular-nums text-primary">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className="font-display text-[17px] font-medium leading-snug tracking-tight">{d.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{d.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      {text.results ? (
        <Section className="border-t border-border/70">
          <Container>
            <Reveal>
              <h2 className={H2}>{copy.results}</h2>
            </Reveal>
            <dl className="mt-8 grid border-t border-border/70 sm:mt-10 sm:grid-cols-3">
              {text.results.map((r) => (
                <div key={r.label} className="border-b border-border/70 py-5 sm:border-b-0 sm:pr-8">
                  <dd className="font-display text-[clamp(2.2rem,4vw,3.4rem)] font-medium leading-none tracking-[-0.04em] text-primary tabular-nums">
                    {r.value}
                  </dd>
                  <dt className="mt-2 max-w-[16rem] text-sm leading-snug text-muted-foreground">{r.label}</dt>
                </div>
              ))}
            </dl>
            {text.resultsNote ? (
              <p className="mt-6 max-w-2xl text-xs leading-relaxed text-muted-foreground">{text.resultsNote}</p>
            ) : null}
          </Container>
        </Section>
      ) : null}

      {study.scenes ? (
        <Section className="border-t border-border/70">
          <Container>
            <Reveal className="mb-8 sm:mb-10">
              <h2 className={H2}>{copy.site}</h2>
            </Reveal>
            <CaseScenes slug={study.slug} scenes={study.scenes} caption={copy.siteCaption(study.website?.label ?? study.name)} />
          </Container>
        </Section>
      ) : null}

      {films.length > 0 ? (
        <Section id="films" className="border-t border-border/70">
          <Container>
            <Reveal className="max-w-2xl">
              <h2 className={H2}>{copy.films}</h2>
              <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
                {copy.filmsText(films.length, text.filmsNote)}
              </p>
            </Reveal>
            <FilmGrid
              ads={films}
              row
              more={{ href: `${href("portfolio", locale)}#films`, label: copy.allFilms(FILMS.length) }}
              className="mt-8 sm:mt-10 sm:grid-cols-[repeat(var(--s),minmax(0,1fr))] lg:grid-cols-[repeat(var(--l),minmax(0,1fr))]"
              style={filmColumns(films.length + 1)}
            />
          </Container>
        </Section>
      ) : null}

      {study.galleries.map((g) => (
        <GallerySection key={g.id} gallery={g} locale={locale} openOriginal={copy.openOriginal} />
      ))}

      {study.salesPlan ? (
        <Section className="border-t border-border/70">
          <Container className="grid gap-8 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:items-center lg:gap-14">
            <Reveal>
              <h2 className={H2}>{copy.plan}</h2>
              <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{copy.planText}</p>
              <div className="mt-6">
                <Cta href={study.salesPlan[locale]} newTab>
                  {copy.salesPlan}
                  <ArrowUpRight size={16} aria-hidden />
                </Cta>
              </div>
            </Reveal>
            {study.planShot ? (
              <Reveal>
                <GlassStage
                  as="a"
                  backdrop={study.planShot.small}
                  href={study.salesPlan[locale]}
                  target="_blank"
                  rel="noopener"
                  tabIndex={-1}
                  aria-hidden
                  className="block p-4 sm:p-6"
                >
                  <div className="overflow-hidden rounded-[10px] shadow-[0_30px_60px_-28px_rgb(0_0_0/0.7)]">
                    <BrowserShot
                      src={study.planShot.src}
                      small={study.planShot.small}
                      label={`realestatevision360.com${study.salesPlan[locale]}`}
                      alt=""
                    />
                  </div>
                </GlassStage>
              </Reveal>
            ) : null}
          </Container>
        </Section>
      ) : null}

      {next && next !== study ? (
        <section className="border-t border-border/70">
          <Container>
            <Link
              to={casePath(next.slug, locale) as never}
              className="group flex items-center justify-between gap-6 py-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-foreground/70 sm:py-10"
            >
              <span>
                <span className="block text-sm text-muted-foreground">{copy.next}</span>
                <span className="mt-1.5 block font-display text-[clamp(1.4rem,2.4vw,2rem)] font-medium tracking-[-0.02em] transition-colors duration-200 group-hover:text-primary">
                  {next.name}
                </span>
              </span>
              <ArrowRight size={22} aria-hidden className="shrink-0 text-muted-foreground transition-colors duration-200 group-hover:text-primary" />
            </Link>
          </Container>
        </section>
      ) : null}

      <FinalCta />
    </>
  );
}

function GallerySection({
  gallery,
  locale,
  openOriginal,
}: {
  gallery: Gallery;
  locale: Locale;
  openOriginal: string;
}) {
  return (
    <Section className="border-t border-border/70">
      <Container className="grid gap-8 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:items-start lg:gap-14">
        <Reveal className="max-w-2xl">
          <h2 className={H2}>{gallery.title[locale]}</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{gallery.text[locale]}</p>
        </Reveal>
        <Reveal
          as="ul"
          className={cn(
            gallery.layout !== "single" &&
              "-mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 [scrollbar-width:none] sm:mx-0 sm:grid sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden",
            gallery.layout === "posts" && "sm:grid-cols-4",
            gallery.layout === "pages" && "sm:grid-cols-2",
          )}
        >
          {gallery.images.map((img) => {
            const picture = (
              <img
                src={img.src}
                alt={img.alt[locale]}
                width={img.width}
                height={img.height}
                loading="lazy"
                decoding="async"
                className={cn(
                  "h-full w-full bg-card object-cover",
                  gallery.layout === "posts" ? "aspect-[4/5] rounded-[8px] sm:rounded-[10px]" : "rounded-[10px]",
                )}
              />
            );
            return (
              <li
                key={img.src}
                className={cn(
                  gallery.layout === "pages" && "w-[82%] shrink-0 snap-start sm:w-auto",
                  gallery.layout === "posts" && "w-[44%] shrink-0 snap-start sm:w-auto",
                )}
              >
                {img.full ? (
                  <a
                    href={img.full}
                    target="_blank"
                    rel="noopener"
                    aria-label={`${img.alt[locale]} — ${openOriginal}`}
                    className="block rounded-[10px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/70 focus-visible:ring-offset-4 focus-visible:ring-offset-background"
                  >
                    {picture}
                  </a>
                ) : (
                  picture
                )}
              </li>
            );
          })}
        </Reveal>
      </Container>
    </Section>
  );
}
