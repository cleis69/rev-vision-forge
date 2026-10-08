import { createFileRoute } from "@tanstack/react-router";

import { ContactPage } from "@/components/pages/ContactPage";
import { contactHead } from "@/lib/seo";

export const Route = createFileRoute("/_site/en/contact")({
  head: () => contactHead("en"),
  component: ContactPage,
});
