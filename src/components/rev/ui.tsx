import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";

import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";

export function Container({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-[1240px] px-6 md:px-10", className)}>{children}</div>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
      <span className="h-1 w-1 rounded-full bg-primary" />
      {children}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
}: {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}) {
  return (
    <Reveal className={cn("max-w-2xl", align === "center" && "mx-auto text-center")}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="mt-5 font-display text-[clamp(2rem,4.4vw,3.4rem)] font-medium leading-[1.05] tracking-[-0.03em] text-gradient">
        {title}
      </h2>
      {description ? (
        <p className="mt-5 text-base leading-relaxed text-muted-foreground md:text-lg">
          {description}
        </p>
      ) : null}
    </Reveal>
  );
}

export function Section({
  id,
  children,
  className,
}: {
  id?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={cn("scroll-mt-24 py-24 md:py-36", className)}>
      {children}
    </section>
  );
}

export function isInternalRoute(href: string) {
  return href.startsWith("/") && !href.startsWith("//");
}

type CtaProps = {
  children: ReactNode;
  href: string;
  variant?: "primary" | "ghost";
  className?: string;
};

export function Cta({ children, href, variant = "primary", className }: CtaProps) {
  const classes = cn(
    "group inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-medium transition-all duration-300",
    variant === "primary"
      ? "bg-primary text-primary-foreground shadow-[0_10px_40px_-12px_var(--primary)] hover:-translate-y-0.5 hover:bg-primary-hover"
      : "border border-border bg-card/40 text-foreground backdrop-blur-md hover:-translate-y-0.5 hover:border-foreground/25 hover:bg-elevated",
    className,
  );

  if (isInternalRoute(href)) {
    return (
      <Link to={href as never} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <a href={href} className={classes}>
      {children}
    </a>
  );
}

export function PageHero({
  eyebrow,
  title,
  description,
  image,
  imageAlt,
}: {
  eyebrow: string;
  title: string;
  description: string;
  image?: string;
  imageAlt?: string;
}) {
  return (
    <section className="relative overflow-hidden border-b border-border/70 pb-20 pt-40 md:pb-28 md:pt-52">
      {image ? (
        <div className="absolute inset-0 -z-10">
          <img
            src={image}
            alt={imageAlt ?? ""}
            width={1920}
            height={1088}
            fetchPriority="high"
            className="h-full w-full object-cover opacity-25"
          />
          <div className="absolute inset-0" style={{ background: "var(--gradient-veil)" }} />
        </div>
      ) : null}
      <Container>
        <Reveal className="max-w-4xl">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className="mt-6 font-display text-[clamp(2.4rem,6vw,4.6rem)] font-medium leading-[1.0] tracking-[-0.04em] text-gradient">
            {title}
          </h1>
          <p className="mt-7 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            {description}
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
