import { createFileRoute } from "@tanstack/react-router";

import { ProgrammePage, programmeSearch } from "@/components/public/pages/ProgrammePage";

// Page of a programme in English (the French one is /p/$slug).
export const Route = createFileRoute("/en/p/$slug")({
  validateSearch: programmeSearch,
  component: Page,
});

function Page() {
  const { slug } = Route.useParams();
  const { mode } = Route.useSearch();
  return <ProgrammePage slug={slug} mode={mode} />;
}
