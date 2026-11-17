import { PageHero } from "@/components/rev/ui";
import { CaseStudies } from "@/components/rev/CaseStudies";
import { ClientLogos } from "@/components/rev/ClientLogos";
import { Portfolio } from "@/components/rev/Portfolio";
import { FinalCta } from "@/components/rev/FinalCta";
import { FILMS } from "@/lib/ads";
import { useLocale } from "@/lib/i18n";
import { photo } from "@/lib/images";

const drone = photo("work-drone");

const COPY = {
  fr: {
    title: "Des sites, des films et des plans de vente [[pour l'immobilier]]",
    description: `Huit études de cas, ${FILMS.length} films, et les promoteurs de Marrakech qui nous ont confié leurs programmes.`,
    imageAlt: "Vue aérienne au crépuscule d'une villa contemporaine en bord de falaise",
  },
  en: {
    title: "Websites, films and sales plans [[for real estate]]",
    description: `Eight case studies, ${FILMS.length} films, and the Marrakech developers who trusted us with their developments.`,
    imageAlt: "Aerial view at dusk of a contemporary clifftop villa",
  },
} as const;

export function PortfolioPage() {
  const copy = COPY[useLocale()];
  return (
    <>
      <PageHero
        eyebrow="Portfolio"
        title={copy.title}
        description={copy.description}
        image={drone}
        imageAlt={copy.imageAlt}
      />
      <ClientLogos className="border-t-0" />
      <CaseStudies className="border-t-0" />
      <Portfolio id="films" />
      <FinalCta />
    </>
  );
}
