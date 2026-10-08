import { createFileRoute } from "@tanstack/react-router";

import { PortfolioPage } from "@/components/pages/PortfolioPage";
import { portfolioHead } from "@/lib/seo";

export const Route = createFileRoute("/_site/portfolio")({
  head: () => portfolioHead("fr"),
  component: PortfolioPage,
});
