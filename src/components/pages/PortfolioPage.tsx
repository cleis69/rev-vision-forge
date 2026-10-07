import { PageHero } from "@/components/rev/ui";
import { Portfolio } from "@/components/rev/Portfolio";
import { FinalCta } from "@/components/rev/FinalCta";
import { useLocale } from "@/lib/i18n";
import { photo } from "@/lib/images";

const drone = photo("work-drone");

const COPY = {
  fr: {
    title: "Des ads qui font vendre.",
    description:
      "21 vidéos verticales produites pour des promoteurs, des agences, des agents et des conciergeries, en français et en néerlandais. Touchez une vidéo pour la regarder avec le son.",
    imageAlt: "Vue aérienne au crépuscule d'une villa contemporaine en bord de falaise",
  },
  en: {
    title: "Ads that sell.",
    description:
      "21 vertical videos produced for developers, agencies, agents and short-let managers, in French and Dutch. Tap a video to watch it with sound.",
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
      <Portfolio showHeading={false} />
      <FinalCta />
    </>
  );
}
