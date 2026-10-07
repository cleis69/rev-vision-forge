import {
  AgentFaq,
  AgentFinalCta,
  AgentHero,
  AgentOffers,
  AgentProblem,
  AgentProcess,
  AgentSpecs,
} from "@/components/rev/AgentIA";

export function AgentPage() {
  return (
    <>
      <AgentHero />
      <AgentProblem />
      <AgentSpecs />
      <AgentProcess />
      <AgentOffers />
      <AgentFaq />
      <AgentFinalCta />
    </>
  );
}
