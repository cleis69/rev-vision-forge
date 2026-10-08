import { createFileRoute } from "@tanstack/react-router";

import { HomePage } from "@/components/pages/HomePage";
import { homeHead } from "@/lib/seo";

export const Route = createFileRoute("/_site/")({
  head: () => homeHead("fr"),
  component: HomePage,
});
