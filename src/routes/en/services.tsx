import { createFileRoute } from "@tanstack/react-router";

import { ServicesPage } from "@/components/pages/ServicesPage";
import { servicesHead } from "@/lib/seo";

export const Route = createFileRoute("/en/services")({
  head: () => servicesHead("en"),
  component: ServicesPage,
});
