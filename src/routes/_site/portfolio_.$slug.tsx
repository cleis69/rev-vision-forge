import { createFileRoute, notFound } from "@tanstack/react-router";

import { CaseStudyPage } from "@/components/pages/CaseStudyPage";
import { caseBySlug } from "@/lib/cases";
import { caseHead } from "@/lib/case-head";

export const Route = createFileRoute("/_site/portfolio_/$slug")({
  loader: ({ params }) => {
    const study = caseBySlug(params.slug);
    if (!study) throw notFound();
    return study.slug;
  },
  head: ({ loaderData }) => (loaderData ? caseHead(loaderData, "fr") : {}),
  component: Page,
});

function Page() {
  const study = caseBySlug(Route.useLoaderData());
  return study ? <CaseStudyPage study={study} /> : null;
}
