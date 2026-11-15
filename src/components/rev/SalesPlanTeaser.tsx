import { ArrowUpRight } from "lucide-react";

import { href, useLocale } from "@/lib/i18n";
import { DemoPhone, demoPath } from "./SalesPlanDemo";
import { Reveal } from "./Reveal";
import { Container, Cta, Section, headline } from "./ui";

/*
 * Home page section introducing the 3D sales plan: the product at work in a
 * phone (a film of the public demo, a fictional programme), on champagne.
 */

const COPY = {
  fr: {
    before: "Le plan de vente 3D :",
    accent: "vos lots en direct,",
    after: "sur le téléphone de l'acheteur.",
    description:
      "Une page par programme. L'acheteur tourne la résidence, voit chaque lot disponible, réservé ou vendu, ouvre sa fiche et demande une visite. Votre équipe met les statuts à jour en un clic.",
    points: [
      "Recherche par budget, surface, chambres",
      "Fiche, plan et crédit de chaque lot",
      "Demandes qui citent le lot",
    ],
    cta: "Découvrir le plan de vente 3D",
    demo: "Ouvrir la démo",
    stageNote: "Programme fictif · ouvrir la démo",
    newTab: "(nouvel onglet)",
  },
  en: {
    before: "The 3D sales plan:",
    accent: "your units live,",
    after: "on the buyer's phone.",
    description:
      "One page per development. Buyers turn the residence, see every unit as available, reserved or sold, open its sheet and request a viewing. Your team updates statuses in one click.",
    points: [
      "Search by budget, area, bedrooms",
      "Each unit's sheet, plan and mortgage",
      "Enquiries that name the unit",
    ],
    cta: "Discover the 3D sales plan",
    demo: "Open the demo",
    stageNote: "Fictional development · open the demo",
    newTab: "(new tab)",
  },
} as const;

export function SalesPlanTeaser() {
  const locale = useLocale();
  const t = COPY[locale];
  const path = demoPath(locale);
  return (
    <Section id="plan-de-vente-3d" className="border-t border-border/70">
      <Container>
        <div className="grid items-center gap-9 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-14 xl:gap-20">
          <Reveal className="min-w-0">
            <h2 className="max-w-3xl font-display text-[clamp(1.75rem,3.6vw,3rem)] font-medium leading-[1.08] tracking-[-0.03em] [text-wrap:balance]">
              {t.before} <span className="text-primary">{t.accent}</span> {headline(t.after)}
            </h2>
            <p className="mt-4 max-w-[62ch] text-[15px] leading-relaxed text-muted-foreground md:text-base lg:text-lg">
              {t.description}
            </p>
            <ul className="mt-6 max-w-xl border-t border-border">
              {t.points.map((point) => (
                <li
                  key={point}
                  className="border-b border-border/70 py-3 font-display text-[16px] font-medium tracking-tight sm:text-[17px]"
                >
                  {point}
                </li>
              ))}
            </ul>
            <div className="mt-7 grid grid-cols-1 gap-2.5 sm:flex sm:flex-wrap sm:gap-3">
              <Cta href={href("salesPlan", locale)}>
                {t.cta}
                <ArrowUpRight size={16} aria-hidden />
              </Cta>
              <Cta href={path} newTab variant="ghost">
                {t.demo}
                <span className="sr-only"> {t.newTab}</span>
              </Cta>
            </div>
          </Reveal>

          <a
            href={path}
            target="_blank"
            rel="noopener"
            className="group -mx-5 block bg-primary px-5 pb-6 pt-9 text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 sm:mx-0 sm:rounded-[14px] lg:px-16 lg:pb-7 lg:pt-11"
          >
            <DemoPhone alt="" className="mx-auto w-[250px] lg:w-[280px]" />
            <span className="mt-6 flex items-center justify-center gap-1.5 text-[13px] font-medium lg:mt-7">
              {t.stageNote}
              <ArrowUpRight size={14} aria-hidden />
              <span className="sr-only"> {t.newTab}</span>
            </span>
          </a>
        </div>
      </Container>
    </Section>
  );
}
