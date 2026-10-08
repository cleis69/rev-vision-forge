import { createFileRoute } from "@tanstack/react-router";

import { AgentPage } from "@/components/pages/AgentPage";
import { agentHead } from "@/lib/seo";

export const Route = createFileRoute("/_site/en/ai-agent")({
  head: () => agentHead("en"),
  component: AgentPage,
});
