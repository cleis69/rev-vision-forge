import { createFileRoute } from "@tanstack/react-router";

import { NotFoundPage, notFoundHead } from "@/components/pages/NotFoundPage";

// Prerendered to /404.html, the host's not-found page for this language.
export const Route = createFileRoute("/_site/404")({
  head: () => notFoundHead("fr"),
  component: NotFoundPage,
});
