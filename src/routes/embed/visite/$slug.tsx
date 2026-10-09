import { createFileRoute } from "@tanstack/react-router";

import { TourPage } from "@/components/public/pages/TourPage";
import { tourSearch } from "@/lib/public/tour-link";

// The 360° tour alone, for a link or an iframe (in English: /en/embed/tour/$slug).
export const Route = createFileRoute("/embed/visite/$slug")({
  validateSearch: tourSearch,
  component: Page,
});

function Page() {
  const { slug } = Route.useParams();
  const search = Route.useSearch();
  return <TourPage slug={slug} search={search} />;
}
