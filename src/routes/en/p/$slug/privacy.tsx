import { createFileRoute } from "@tanstack/react-router";

import { PrivacyNotice } from "@/components/public/pages/PrivacyPage";

// Personal data notice, over the page of the programme.
export const Route = createFileRoute("/en/p/$slug/privacy")({
  component: Page,
});

function Page() {
  const { slug } = Route.useParams();
  return <PrivacyNotice slug={slug} />;
}
