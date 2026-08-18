import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";

import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";
import { SplitText } from "@/components/reactbits/SplitText";

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
      <SplitText
        as="h2"
        text={title}
        className="mt-5 block font-display text-[clamp(2rem,4.4vw,3.4rem)] font-medium leading-[1.05] tracking-[-0.03em] text-gradient"
      />
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
    "group relative isolate inline-flex h-12 items-center justify-center gap-2 overflow-hidden rounded-lg px-6 text-sm font-medium",
    "transition-[background-color,border-color,transform] duration-300 active:scale-[0.98]",
    variant === "primary"
      ? "bg-primary text-primary-foreground hover:bg-primary-hover"
      : "border border-border bg-transparent text-foreground backdrop-blur-md",
    className,
  );

  const content = (
    <>
      {variant === "ghost" ? (
        <span
          aria-hidden
          className="absolute inset-0 -z-10 origin-left scale-x-0 bg-foreground/10 transition-transform duration-[350ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100"
        />
      ) : null}
      {children}
    </>
  );

  if (isInternalRoute(href)) {
    return (
      <Link to={href as never} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <a href={href} className={classes}>
      {content}
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
          <SplitText
            as="h1"
            text={title}
            className="mt-6 block font-display text-[clamp(2.4rem,6vw,4.6rem)] font-medium leading-[1.0] tracking-[-0.04em] text-gradient"
          />
          <p className="mt-7 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            {description}
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
