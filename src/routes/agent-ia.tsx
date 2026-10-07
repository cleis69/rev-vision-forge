import { createFileRoute } from "@tanstack/react-router";

import { AgentPage } from "@/components/pages/AgentPage";
import { agentHead } from "@/lib/seo";

export const Route = createFileRoute("/agent-ia")({
  head: () => agentHead("fr"),
  component: AgentPage,
});
