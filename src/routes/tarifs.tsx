import { createFileRoute } from "@tanstack/react-router";

import { PricingPage } from "@/components/pages/PricingPage";
import { pricingHead } from "@/lib/seo";

export const Route = createFileRoute("/tarifs")({
  head: () => pricingHead("fr"),
  component: PricingPage,
});
