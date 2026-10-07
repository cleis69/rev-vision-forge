import { createFileRoute } from "@tanstack/react-router";

import { InsightsPage } from "@/components/pages/InsightsPage";
import { insightsHead } from "@/lib/seo";

export const Route = createFileRoute("/en/insights")({
  head: () => insightsHead("en"),
  component: InsightsPage,
});
