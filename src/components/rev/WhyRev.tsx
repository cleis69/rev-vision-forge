import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { Gem, Compass, Target, Cpu } from "lucide-react";

import { ensureGsap, prefersReducedMotion } from "@/lib/gsap";
import { Container, Section, SectionHeading } from "./ui";
import { Reveal } from "./Reveal";

const PILLARS = [
  {
    icon: Gem,
    title: "Production Premium",
    body: "Des standards empruntés à la mode et à l'automobile de luxe, appliqués à l'immobilier.",
  },
  {
    icon: Compass,
    title: "Marketing Stratégique",
    body: "Positionnement, offre et récit définis avant la première image capturée.",
  },
  {
    icon: Target,
    title: "Lead Generation",
    body: "Acquisition construite autour de l'intention d'achat, pas des impressions.",
  },
  {
    icon: Cpu,
    title: "Automatisation CRM",
    body: "HubSpot, routage et relances qui gardent chaque opportunité vivante.",
  },
];

const STATS = [
  { value: 250, suffix: "+", label: "Projets réalisés" },
  { value: 98, suffix: "%", label: "Clients satisfaits" },
  { value: 24, suffix: "h", label: "Délai de livraison" },
  { value: 7, suffix: "+", label: "Années d'expérience" },
];

function Counter({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLParagraphElement | null>(null);

  useGSAP(
    () => {
      const el = ref.current;
      const target = el?.querySelector<HTMLElement>("[data-count]");
      if (!el || !target) return;
      const { gsap } = ensureGsap();

      if (prefersReducedMotion()) {
        target.textContent = String(value);
        return;
      }

      const counter = { v: 0 };
      gsap.to(counter, {
        v: value,
        duration: 1.8,
        ease: "power2.out",
        onUpdate: () => {
          target.textContent = String(Math.round(counter.v));
        },
        scrollTrigger: { trigger: el, start: "top 85%", once: true },
      });
    },
    { scope: ref, dependencies: [value] },
  );

  return (
    <p
      ref={ref}
      className="font-display text-[clamp(2.4rem,5vw,3.6rem)] font-medium leading-none tracking-[-0.04em]"
    >
      <span data-count>0</span>
      <span className="text-primary">{suffix}</span>
    </p>
  );
}

export function WhyRev() {
  return (
    <Section className="border-t border-border/70">
      <Container>
        <SectionHeading
          eyebrow="Pourquoi REV"
          title="Un partenaire, pas un prestataire."
          description="Quatre expertises dont la valeur se démultiplie lorsqu'elles vivent dans une seule équipe."
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
