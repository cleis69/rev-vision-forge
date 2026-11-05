import { createFileRoute } from "@tanstack/react-router";

import { SalesPlanPage } from "@/components/pages/SalesPlanPage";
import { salesPlanHead } from "@/lib/seo";

export const Route = createFileRoute("/_site/plan-de-vente-3d")({
  head: () => salesPlanHead("fr"),
  component: SalesPlanPage,
});
