import { useMemo, useState } from "react";

import photography from "@/assets/work-photography.jpg";
import video from "@/assets/work-video.jpg";
import drone from "@/assets/work-drone.jpg";
import matterport from "@/assets/work-matterport.jpg";
import architecture from "@/assets/work-architecture.jpg";
import branding from "@/assets/work-branding.jpg";
import interior from "@/assets/work-interior.jpg";
import { cn } from "@/lib/utils";
import { Container, Section, SectionHeading } from "./ui";
import { Reveal } from "./Reveal";

const FILTERS = [
  "All",
  "Photography",
  "Video",
  "Drone",
  "Matterport",
  "Architecture",
  "Branding",
] as const;

type Filter = (typeof FILTERS)[number];

const WORK: {
  src: string;
  alt: string;
  tag: Exclude<Filter, "All">;
  title: string;
  w: number;
  h: number;
}[] = [
  {
    src: drone,
    alt: "Aerial dusk view of a cliffside villa",
    tag: "Drone",
    title: "Cliff House — Aerial Film",
    w: 1024,
    h: 1280,
  },
  {
    src: interior,
    alt: "Dark minimalist luxury living room",
    tag: "Photography",
    title: "Noir Residence — Interiors",
    w: 1024,
    h: 768,
  },
  {
    src: video,
    alt: "Penthouse terrace overlooking a night skyline",
    tag: "Video",
    title: "Skyline Penthouse — Lifestyle Film",
    w: 1024,
    h: 1280,
  },
  {
    src: matterport,
    alt: "3D digital twin dollhouse view of an apartment",
    tag: "Matterport",
    title: "Tower 04 — Digital Twin",
    w: 1024,
    h: 768,
  },
  {
    src: architecture,
    alt: "Geometric concrete facade in shadow",
    tag: "Architecture",
    title: "Grid Facade — Architectural Study",
    w: 1024,
    h: 1024,
  },
  {
    src: branding,
    alt: "Dark matte business cards with embossed monogram",
    tag: "Branding",
    title: "Meridian — Identity System",
    w: 1024,
    h: 1024,
  },
  {
    src: photography,
    alt: "Glass residential tower at twilight",
    tag: "Photography",
    title: "Vertical Living — Exteriors",
    w: 1024,
    h: 768,
  },
];

export function Portfolio() {
  const [active, setActive] = useState<Filter>("All");
  const items = useMemo(
    () => (active === "All" ? WORK : WORK.filter((w) => w.tag === active)),
    [active],
  );

  return (
    <Section id="portfolio" className="border-t border-border/70">
      <Container>
        <SectionHeading
          eyebrow="Portfolio"
          title="Work that moves inventory."
          description="A selection of recent productions across residential, commercial and development projects."
        />

        <Reveal className="mt-10 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setActive(f)}
              className={cn(
                "h-9 rounded-full border px-4 text-xs uppercase tracking-[0.14em] transition-all duration-300",
                active === f
                  ? "border-primary/50 bg-primary/10 text-foreground"
                  : "border-border text-muted-foreground hover:border-foreground/25 hover:text-foreground",
              )}
            >
              {f}
            </button>
          ))}
        </Reveal>

        <div className="mt-10 columns-1 gap-5 sm:columns-2 lg:columns-3">
          {items.map((item, i) => (
            <Reveal key={item.title} delay={i * 60} className="mb-5 break-inside-avoid">
              <figure className="group relative overflow-hidden rounded-2xl border border-border bg-card">
                <img
                  src={item.src}
                  alt={item.alt}
                  loading="lazy"
                  width={item.w}
                  height={item.h}
                  className="w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                />
                <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-gradient-to-t from-background via-background/70 to-transparent p-5 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                  <span className="min-w-0 truncate font-display text-sm">{item.title}</span>
                  <span className="shrink-0 text-[10px] uppercase tracking-[0.18em] text-primary">
                    {item.tag}
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
