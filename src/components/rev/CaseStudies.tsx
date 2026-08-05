import drone from "@/assets/work-drone.jpg";
import interior from "@/assets/work-interior.jpg";
import photography from "@/assets/work-photography.jpg";
import { Container, Section, SectionHeading } from "./ui";
import { Reveal } from "./Reveal";

const CASES = [
  {
    client: "Meridian Developments",
    title: "42 units sold before completion",
    image: drone,
    alt: "Aerial view of a cliffside development at dusk",
    challenge: "A coastal development launching into a saturated market with no visual identity.",
    solution:
      "Cinematic launch film, drone masters, Matterport twins and a conversion-first landing page fed by Meta and Google.",
    results: "Sell-out reached five months ahead of the projected absorption curve.",
    kpis: [
      { value: "42", label: "Units sold" },
      { value: "3.1x", label: "ROAS" },
      { value: "−38%", label: "Cost per lead" },
    ],
  },
  {
    client: "Alta Group",
    title: "From cold list to qualified pipeline",
    image: interior,
    alt: "Dark luxury interior living room",
    challenge: "An agency with strong inventory but a CRM full of unworked, unscored leads.",
    solution:
      "HubSpot rebuild, lead scoring, WhatsApp and email automation, plus a monthly premium content engine.",
    results: "Response time collapsed and viewings per agent nearly doubled in one quarter.",
    kpis: [
      { value: "+186%", label: "Viewings booked" },
      { value: "4 min", label: "Response time" },
      { value: "92%", label: "Leads qualified" },
    ],
  },
  {
    client: "Orion Estates",
    title: "A personal brand that outsells the portal",
    image: photography,
    alt: "Glass residential tower at twilight",
    challenge: "A top agent invisible outside of portal listings and dependent on paid inventory.",
    solution:
      "Personal branding production, weekly short-form distribution and a listing-magnet funnel.",
    results: "Inbound seller enquiries became the primary acquisition channel within 90 days.",
    kpis: [
      { value: "5.4M", label: "Organic views" },
      { value: "77", label: "Inbound sellers" },
      { value: "24h", label: "Asset delivery" },
    ],
  },
];

export function CaseStudies() {
  return (
    <Section id="case-studies" className="border-t border-border/70">
      <Container>
        <SectionHeading
          eyebrow="Case Studies"
          title="Proof, measured in signed contracts."
          description="Selected engagements where visual production and growth infrastructure worked as one."
        />

        <div className="mt-16 space-y-6">
          {CASES.map((item, i) => (
            <Reveal key={item.client} delay={i * 80}>
              <article className="surface overflow-hidden">
                <div className="grid lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
                  <div className="relative min-h-[260px] overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.alt}
                      loading="lazy"
                      width={1024}
                      height={768}
                      className="h-full w-full object-cover opacity-80 transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-105"
                    />
                  </div>
                  <div className="p-8 md:p-12">
                    <p className="text-[11px] uppercase tracking-[0.22em] text-primary">
                      {item.client}
                    </p>
                    <h3 className="mt-4 font-display text-[clamp(1.5rem,2.6vw,2.1rem)] font-medium leading-tight tracking-[-0.02em]">
                      {item.title}
                    </h3>

                    <dl className="mt-8 space-y-5">
                      {[
                        ["Challenge", item.challenge],
                        ["Solution", item.solution],
                        ["Results", item.results],
                      ].map(([label, body]) => (
                        <div key={label} className="grid gap-1 sm:grid-cols-[110px_minmax(0,1fr)]">
                          <dt className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                            {label}
                          </dt>
                          <dd className="text-sm leading-relaxed text-foreground/85">{body}</dd>
                        </div>
                      ))}
                    </dl>

                    <div className="mt-10 grid grid-cols-3 gap-4 border-t border-border pt-6">
                      {item.kpis.map((kpi) => (
                        <div key={kpi.label}>
                          <p className="font-display text-2xl font-medium tracking-tight">
                            {kpi.value}
                          </p>
                          <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                            {kpi.label}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
