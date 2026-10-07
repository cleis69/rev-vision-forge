import { createFileRoute } from "@tanstack/react-router";

import { NotFoundPage, notFoundHead } from "@/components/pages/NotFoundPage";

// Prerendered to /en/404.html, the host's not-found page for this language.
export const Route = createFileRoute("/en/404")({
  head: () => notFoundHead("en"),
  component: NotFoundPage,
});
