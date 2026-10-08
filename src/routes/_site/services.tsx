import { createFileRoute } from "@tanstack/react-router";

import { ServicesPage } from "@/components/pages/ServicesPage";
import { servicesHead } from "@/lib/seo";

export const Route = createFileRoute("/_site/services")({
  head: () => servicesHead("fr"),
  component: ServicesPage,
});
