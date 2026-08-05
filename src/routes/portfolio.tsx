import { createFileRoute } from "@tanstack/react-router";

import { PageHero } from "@/components/rev/ui";
import { Portfolio } from "@/components/rev/Portfolio";
import { FinalCta } from "@/components/rev/FinalCta";
import drone from "@/assets/work-drone.jpg";

const TITLE = "Portfolio REV — Photo, vidéo, drone, Matterport & 3D immobilier";
const DESCRIPTION =
  "Découvrez les productions REV : photographie premium, films cinématographiques, captation drone, visites Matterport, architecture 3D et identités de marque immobilières.";

export const Route = createFileRoute("/portfolio")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PortfolioPage,
});

function PortfolioPage() {
  return (
    <>
      <PageHero
        eyebrow="Portfolio"
        title="Des images conçues pour déclencher la visite."
        description="Résidentiel, programmes neufs, hôtellerie de luxe et architecture. Chaque projet est produit avec une direction artistique dédiée et une déclinaison complète des formats."
        image={drone}
        imageAlt="Vue aérienne au crépuscule d'une villa contemporaine en bord de falaise"
      />
      <Portfolio />
      <FinalCta />
    </>
  );
}
