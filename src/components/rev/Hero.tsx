import { useEffect, useState } from "react";
import { ArrowUpRight, Play } from "lucide-react";

import heroVilla from "@/assets/hero-villa.jpg";
import { WHATSAPP_URL } from "@/lib/contact";
import { Container, Cta } from "./ui";
import { LineReveal } from "./LineReveal";
import { Reveal } from "./Reveal";
import { VantaBackground } from "./VantaBackground";

const PILLARS = [
  { n: "01", title: "Production visuelle", items: "photo · vidéo · drone · 3D" },
  { n: "02", title: "Marketing & contenu", items: "ligne éditoriale · branding" },
  { n: "03", title: "Acquisition", items: "Meta · Google · TikTok" },
  { n: "04", title: "Automation & CRM", items: "HubSpot · WhatsApp" },
] as const;

export function Hero() {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setOffset(window.scrollY));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <section
      id="home"
      className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden"
    >
      <div
        className="absolute inset-0 -z-20"
        style={{ transform: `translate3d(0, ${offset * 0.25}px, 0) scale(1.12)` }}
      >
        <img
          src={heroVilla}
          alt="Villa de luxe éclairée de nuit avec façade vitrée et piscine à débordement"
          width={1920}
          height={1088}
          fetchPriority="high"
          className="h-full w-full object-cover opacity-70"
        />
      </div>
      <VantaBackground
        className="absolute inset-0 -z-[15] opacity-45 mix-blend-screen"
        options={{
          highlightColor: 0x1a1a1a,
          midtoneColor: 0x2a2418,
          lowlightColor: 0x0d0d0d,
          baseColor: 0x090909,
          blurFactor: 0.62,
          speed: 0.7,
          zoom: 0.85,
        }}
      />
      <div
        className="absolute inset-0 -z-10"
        style={{ background: "var(--gradient-veil)" }}
        aria-hidden
      />
      <div
        className="absolute inset-x-0 top-0 -z-10 h-64 bg-gradient-to-b from-background to-transparent"
        aria-hidden
      />

      <Container className="relative flex-1 pb-20 pt-40">
        <div className="max-w-4xl">
          <Reveal>
            <div className="inline-flex items-center gap-3 rounded-full border border-border bg-card/50 px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Agence de croissance immobilière
            </div>
          </Reveal>

          <h1 className="mt-8 font-display text-[clamp(2.4rem,6.6vw,5.2rem)] font-medium leading-[0.99] tracking-[-0.04em] text-gradient">
            <LineReveal
              delay={120}
              lines={["Le marketing visuel qui", "accélère les ventes", "immobilières."]}
            />
          </h1>

          <Reveal delay={420}>
            <p className="mt-7 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
              REV accompagne les promoteurs, agences et professionnels de l'immobilier avec une
              stratégie complète de contenu, d'acquisition de prospects et d'automatisation
              commerciale.
            </p>
          </Reveal>

          <Reveal delay={500} className="mt-10 flex flex-wrap items-center gap-3">
            <Cta href="/portfolio">
              Découvrir nos réalisations
              <ArrowUpRight
                size={16}
                className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </Cta>
            <Cta href="/contact" variant="ghost">
              <Play size={14} className="text-primary" />
              Prendre rendez-vous
            </Cta>
            <Cta href={WHATSAPP_URL} variant="ghost">
              WhatsApp · 06 75 62 77 07
            </Cta>
          </Reveal>
        </div>
      </Container>

      <div className="relative border-t border-border bg-card">
        <Container className="grid grid-cols-2 lg:grid-cols-4">
          {PILLARS.map((p, i) => (
            <Reveal
              key={p.n}
              delay={600 + i * 80}
              className={
                i === 0
                  ? "px-5 py-8 md:px-8 md:py-10"
                  : "border-l border-border px-5 py-8 md:px-8 md:py-10"
              }
            >
              <span className="text-[11px] font-medium tracking-[0.22em] text-primary">{p.n}</span>
              <p className="mt-4 font-display text-sm font-medium tracking-tight md:text-base">
                {p.title}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{p.items}</p>
            </Reveal>
          ))}
        </Container>
      </div>
    </section>
  );
}
