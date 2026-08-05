import { useEffect, useState } from "react";
import { ArrowUpRight, Play } from "lucide-react";

import heroVilla from "@/assets/hero-villa.jpg";
import { Container, Cta } from "./ui";

const TAGS = ["Luxury Villas", "Drone", "Interior", "Matterport", "Lifestyle", "Architecture"];

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
        className="absolute inset-0 -z-20 scale-110"
        style={{ transform: `translate3d(0, ${offset * 0.25}px, 0) scale(1.12)` }}
      >
        <img
          src={heroVilla}
          alt="Cinematic night view of a luxury villa with glass facade and infinity pool"
          width={1920}
          height={1088}
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

      <Container className="relative pt-32 pb-28">
        <div className="max-w-4xl">
          <div className="reveal is-visible inline-flex items-center gap-3 rounded-full border border-border bg-card/50 px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Real Estate Growth Agency
          </div>

          <h1 className="mt-8 font-display text-[clamp(2.6rem,7.4vw,5.6rem)] font-medium leading-[0.98] tracking-[-0.04em] text-gradient">
            Visual Marketing That
            <br className="hidden sm:block" /> Sells Real Estate.
          </h1>

          <p className="mt-7 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
            Premium visual production, strategic marketing, lead generation and automation for real
            estate professionals.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Cta href="#contact">
              Book a Strategy Call
              <ArrowUpRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </Cta>
            <Cta href="#portfolio" variant="ghost">
              <Play size={14} className="text-primary" />
              Explore Our Work
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
