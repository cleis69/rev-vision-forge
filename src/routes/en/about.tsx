import { createFileRoute } from "@tanstack/react-router";

import { AboutPage } from "@/components/pages/AboutPage";
import { aboutHead } from "@/lib/seo";

export const Route = createFileRoute("/en/about")({
  head: () => aboutHead("en"),
  component: AboutPage,
});
