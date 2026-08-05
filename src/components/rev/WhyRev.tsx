import { useEffect, useRef, useState } from "react";
import { Gem, Compass, Target, Cpu } from "lucide-react";

import { Container, Section, SectionHeading } from "./ui";
import { Reveal, useInView } from "./Reveal";

const PILLARS = [
  {
    icon: Gem,
    title: "Luxury Visuals",
    body: "Production standards borrowed from fashion and automotive, applied to property.",
  },
  {
    icon: Compass,
    title: "Marketing Strategy",
    body: "Positioning, offer and narrative defined before a single frame is captured.",
  },
  {
    icon: Target,
    title: "Qualified Leads",
    body: "Paid acquisition built around buyer intent, not vanity impressions.",
  },
  {
    icon: Cpu,
    title: "Automation",
    body: "CRM, routing and follow-up that keep every opportunity warm around the clock.",
  },
];

const STATS = [
  { value: 250, suffix: "+", label: "Projects" },
  { value: 98, suffix: "%", label: "Satisfied Clients" },
  { value: 24, suffix: "h", label: "Delivery" },
  { value: 7, suffix: "+", label: "Years Experience" },
];

function Counter({ value, suffix }: { value: number; suffix: string }) {
  const { ref, inView } = useInView<HTMLParagraphElement>(0.4);
  const [display, setDisplay] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (!inView || started.current) return;
    started.current = true;
    const duration = 1600;
    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(value * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, value]);

  return (
    <p
      ref={ref}
      className="font-display text-[clamp(2.4rem,5vw,3.6rem)] font-medium leading-none tracking-[-0.04em]"
    >
      {display}
      <span className="text-primary">{suffix}</span>
    </p>
  );
}

export function WhyRev() {
  return (
    <Section className="border-t border-border/70">
      <Container>
        <SectionHeading
          eyebrow="Why REV"
          title="A partner, not a supplier."
          description="Four capabilities that compound when they run inside one team."
        />

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map(({ icon: Icon, title, body }, i) => (
            <Reveal key={title} delay={i * 80}>
              <article className="surface h-full p-8 transition-all duration-500 hover:-translate-y-1 hover:border-primary/25">
                <span className="grid h-11 w-11 place-items-center rounded-xl border border-border bg-background/60">
                  <Icon size={18} className="text-primary" />
                </span>
                <h3 className="mt-6 font-display text-lg font-medium tracking-tight">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </article>
            </Reveal>
          ))}
        </div>

        <div className="mt-24 grid gap-10 border-t border-border pt-16 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 80}>
              <Counter value={stat.value} suffix={stat.suffix} />
              <p className="mt-3 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                {stat.label}
              </p>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
