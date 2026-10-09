import { Hero } from "@/components/rev/Hero";
import { TrustedBy } from "@/components/rev/TrustedBy";
import { Ecosystem } from "@/components/rev/Ecosystem";
import { Services } from "@/components/rev/Services";
import { Portfolio } from "@/components/rev/Portfolio";
import { WhyRev } from "@/components/rev/WhyRev";
import { Faq } from "@/components/rev/Faq";
import { ProcessSteps } from "@/components/rev/ProcessSteps";
import { BrandingProgram } from "@/components/rev/BrandingProgram";
import { AgentTeaser } from "@/components/rev/AgentTeaser";
import { FinalCta } from "@/components/rev/FinalCta";
import { isPublic } from "@/lib/i18n";

export function HomePage() {
  return (
    <>
      <Hero />
      <TrustedBy />
      <ProcessSteps />
      <Portfolio limit={8} />
      <BrandingProgram />
      {isPublic("agent") ? <AgentTeaser /> : null}
      <Ecosystem />
      <Services />
      <WhyRev />
      <Faq />
      <FinalCta />
    </>
  );
}
