import { createFileRoute } from "@tanstack/react-router";

import { EmbedPage } from "@/components/public/pages/EmbedPage";

// Sales plan alone, for an iframe on the promoter's site (in English).
export const Route = createFileRoute("/en/embed/$slug")({
  component: Page,
});

function Page() {
  const { slug } = Route.useParams();
  return <EmbedPage slug={slug} />;
}
