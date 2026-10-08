import { createFileRoute } from "@tanstack/react-router";

import { PortfolioPage } from "@/components/pages/PortfolioPage";
import { portfolioHead } from "@/lib/seo";

export const Route = createFileRoute("/_site/en/portfolio")({
  head: () => portfolioHead("en"),
  component: PortfolioPage,
});
