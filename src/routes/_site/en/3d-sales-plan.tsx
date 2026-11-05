import { createFileRoute } from "@tanstack/react-router";

import { SalesPlanPage } from "@/components/pages/SalesPlanPage";
import { salesPlanHead } from "@/lib/seo";

export const Route = createFileRoute("/_site/en/3d-sales-plan")({
  head: () => salesPlanHead("en"),
  component: SalesPlanPage,
});
