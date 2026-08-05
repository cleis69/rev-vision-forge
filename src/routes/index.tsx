import { createFileRoute } from "@tanstack/react-router";

import { Header } from "@/components/rev/Header";
import { Hero } from "@/components/rev/Hero";
import { TrustedBy } from "@/components/rev/TrustedBy";
import { Ecosystem } from "@/components/rev/Ecosystem";
import { Services } from "@/components/rev/Services";
import { Portfolio } from "@/components/rev/Portfolio";
import { CaseStudies } from "@/components/rev/CaseStudies";
import { WhyRev } from "@/components/rev/WhyRev";
import { Testimonials } from "@/components/rev/Testimonials";
import { Faq, FAQ_ITEMS } from "@/components/rev/Faq";
import { FinalCta, Footer } from "@/components/rev/FinalCta";

const TITLE = "REV — Marketing visuel & croissance immobilière";
const DESCRIPTION =
  "REV accompagne promoteurs, agences et agents immobiliers : production visuelle premium, contenu stratégique, génération de leads et automatisation CRM pour vendre plus vite.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ProfessionalService",
          name: "REV — Real Estate Vision",
          description: DESCRIPTION,
          areaServed: "FR",
          email: "contact@rev-agency.com",
          telephone: "+33100000000",
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQ_ITEMS.map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: { "@type": "Answer", text: item.a },
          })),
        }),
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <TrustedBy />
        <Ecosystem />
        <Services />
        <Portfolio />
        <CaseStudies />
        <WhyRev />
        <Testimonials />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
