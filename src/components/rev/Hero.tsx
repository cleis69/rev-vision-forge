import { useEffect, useState } from "react";
import { ArrowUpRight, Play } from "lucide-react";

import heroVilla from "@/assets/hero-villa.jpg";
import { Container, Cta } from "./ui";

const TAGS = ["Villa de luxe", "Drone", "Architecture", "Intérieur", "Matterport", "Lifestyle"];

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
    <section id="home" className="relative flex min-h-[100svh] items-center overflow-hidden">
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
      <div
        className="absolute inset-0 -z-10"
        style={{ background: "var(--gradient-veil)" }}
        aria-hidden
      />
      <div
        className="absolute inset-x-0 top-0 -z-10 h-64 bg-gradient-to-b from-background to-transparent"
        aria-hidden
      />

      <Container className="relative pb-28 pt-32">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-3 rounded-full border border-border bg-card/50 px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Agence de croissance immobilière
          </div>

          <h1 className="mt-8 font-display text-[clamp(2.4rem,6.6vw,5.2rem)] font-medium leading-[0.99] tracking-[-0.04em] text-gradient">
            Le marketing visuel qui accélère les ventes immobilières.
          </h1>

          <p className="mt-7 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
            REV accompagne les promoteurs, agences et professionnels de l'immobilier avec une
            stratégie complète de contenu, d'acquisition de prospects et d'automatisation
            commerciale.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Cta href="#portfolio">
              Découvrir nos réalisations
              <ArrowUpRight
                size={16}
                className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </Cta>
            <Cta href="#contact" variant="ghost">
              <Play size={14} className="text-primary" />
              Prendre rendez-vous
            </Cta>
          </div>

          <ul className="mt-14 flex flex-wrap gap-x-6 gap-y-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
            {TAGS.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
        </div>
      </Container>

      <div className="absolute inset-x-0 bottom-8 flex justify-center">
        <div className="flex h-10 w-6 items-start justify-center rounded-full border border-border/80 p-1.5">
          <span
            className="h-1.5 w-1.5 rounded-full bg-primary"
            style={{ animation: "rev-scroll-dot 2s cubic-bezier(0.16,1,0.3,1) infinite" }}
          />
        </div>
      </div>
    </section>
  );
}
