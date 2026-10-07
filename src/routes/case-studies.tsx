import { createFileRoute } from "@tanstack/react-router";

import { CaseStudiesPage } from "@/components/pages/CaseStudiesPage";
import { caseStudiesHead } from "@/lib/seo";

export const Route = createFileRoute("/case-studies")({
  head: () => caseStudiesHead("fr"),
  component: CaseStudiesPage,
});
