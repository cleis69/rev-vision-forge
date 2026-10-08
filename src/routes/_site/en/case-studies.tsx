import { createFileRoute } from "@tanstack/react-router";

import { CaseStudiesPage } from "@/components/pages/CaseStudiesPage";
import { caseStudiesHead } from "@/lib/seo";

export const Route = createFileRoute("/_site/en/case-studies")({
  head: () => caseStudiesHead("en"),
  component: CaseStudiesPage,
});
