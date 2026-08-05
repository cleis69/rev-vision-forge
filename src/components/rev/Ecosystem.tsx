import { Container, Section, SectionHeading } from "./ui";
import { Reveal } from "./Reveal";

const STEPS = [
  { label: "Property", note: "Asset intake & positioning" },
  { label: "Visual Production", note: "Photo, film, drone, Matterport" },
  { label: "Creative Strategy", note: "Narrative & offer design" },
  { label: "Content Distribution", note: "Owned & social channels" },
  { label: "Paid Advertising", note: "Meta, Google, TikTok" },
  { label: "Landing Pages", note: "High-intent conversion" },
  { label: "HubSpot CRM", note: "Single source of truth" },
  { label: "Lead Qualification", note: "Scoring & routing" },
  { label: "Automation", note: "Email & WhatsApp follow-up" },
  { label: "More Sales", note: "Faster absorption rate" },
];

export function Ecosystem() {
  return (
    <Section id="about">
      <Container>
        <SectionHeading
          eyebrow="Our Ecosystem"
          title="One connected system from property to signature."
          description="Every stage feeds the next. Visuals create attention, strategy converts it, automation compounds it."
        />

        <div className="relative mt-20">
          <div
            className="absolute left-[15px] top-0 h-full w-px bg-gradient-to-b from-transparent via-border to-transparent md:left-1/2"
            aria-hidden
          />
          <ol className="space-y-4 md:space-y-0">
            {STEPS.map((step, i) => (
              <Reveal
                as="li"
                key={step.label}
                delay={i * 60}
                className="relative pl-12 md:grid md:grid-cols-2 md:gap-16 md:pl-0"
              >
                <span
                  className="absolute left-0 top-6 grid h-8 w-8 place-items-center rounded-full border border-border bg-card text-[11px] text-muted-foreground md:left-1/2 md:-translate-x-1/2"
                  aria-hidden
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div
                  className={
                    i % 2 === 0
                      ? "md:col-start-1 md:pr-16 md:text-right"
                      : "md:col-start-2 md:pl-16"
                  }
                >
                  <div className="surface p-6 transition-all duration-500 hover:-translate-y-1 hover:border-primary/30 md:my-2">
                    <h3 className="font-display text-lg font-medium tracking-tight">
                      {step.label}
                    </h3>
                    <p className="mt-1.5 text-sm text-muted-foreground">{step.note}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </Container>
    </Section>
  );
}
