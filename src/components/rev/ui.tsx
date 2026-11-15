import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";

import type { Photo } from "@/lib/images";
import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";
import { SplitText } from "@/components/reactbits/SplitText";

/**
 * A headline of one sentence ends without a period; two sentences keep theirs,
 * and a question keeps its mark.
 */
export function headline(text: string) {
  const t = text.trimEnd();
  return t.endsWith(".") && !/[.!?…]\s/.test(t) && !t.endsWith("...") ? t.slice(0, -1) : t;
}

/** Entrance played by CSS on load (above-the-fold content, no JavaScript needed). */
export const fadeUp = (delay: number) => ({
  animation: `rev-fade-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s both`,
});

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("mx-auto w-full max-w-[1240px] px-5 sm:px-6 md:px-10", className)}>
      {children}
    </div>
  );
}

export function SectionHeading({
  title,
  description,
  align = "left",
}: {
  /** The section's name: kept at call sites, never shown above the title. */
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}) {
  return (
    <Reveal className={cn("max-w-2xl", align === "center" && "mx-auto text-center")}>
      <SplitText
        as="h2"
        text={headline(title)}
        className="block font-display text-[clamp(1.75rem,3.6vw,3rem)] font-medium leading-[1.08] tracking-[-0.03em] text-foreground"
      />
      {description ? (
        <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground md:text-base lg:text-lg">
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
    <section id={id} className={cn("scroll-mt-20 py-14 sm:py-16 lg:py-24", className)}>
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
  /** `ink` and `inkGhost` sit on a champagne ground. */
  variant?: "primary" | "ghost" | "ink" | "inkGhost";
  className?: string;
  onClick?: () => void;
  /** Opens in a new tab (always a plain link). */
  newTab?: boolean;
};

export function Cta({
  children,
  href,
  variant = "primary",
  className,
  onClick,
  newTab = false,
}: CtaProps) {
  const classes = cn(
    "group relative isolate inline-flex h-12 items-center justify-center gap-2 overflow-hidden rounded-lg px-6 text-sm font-medium",
    "transition-[background-color,border-color,transform] duration-300 active:scale-[0.98]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    variant === "primary"
      ? "bg-primary text-primary-foreground hover:bg-primary-hover focus-visible:ring-primary"
      : variant === "ink"
        ? "bg-primary-foreground text-primary hover:bg-black focus-visible:ring-black focus-visible:ring-offset-primary"
        : variant === "inkGhost"
          ? "border border-black/35 bg-transparent text-primary-foreground hover:border-black/70 focus-visible:ring-black focus-visible:ring-offset-primary"
          : "border border-border bg-transparent text-foreground focus-visible:ring-foreground/70",
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

  if (isInternalRoute(href) && !newTab) {
    return (
      <Link to={href as never} className={classes} onClick={onClick}>
        {content}
      </Link>
    );
  }

  return (
    <a
      href={href}
      className={classes}
      onClick={onClick}
      {...(newTab ? { target: "_blank", rel: "noopener" } : {})}
    >
      {content}
    </a>
  );
}

export function PageHero({
  title,
  description,
  image,
  imageAlt,
}: {
  /** The page's name: kept at call sites, never shown above the title. */
  eyebrow?: string;
  title: string;
  description: string;
  image?: Photo;
  imageAlt?: string;
}) {
  return (
    <section className="relative overflow-hidden border-b border-border/70 pb-12 pt-28 md:pb-16 md:pt-36">
      {image ? (
        <div className="absolute inset-0 -z-10">
          <img
            src={image.src}
            srcSet={image.srcSet}
            sizes="100vw"
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
        {/* CSS-only entrance: the page title shows before any JavaScript runs. */}
        <div className="max-w-4xl">
          <SplitText
            as="h1"
            text={headline(title)}
            immediate
            delay={0.08}
            className="block font-display text-[clamp(2.1rem,5vw,4rem)] font-medium leading-[1.02] tracking-[-0.04em] text-foreground"
          />
          <p
            className="mt-5 max-w-2xl text-[15px] leading-relaxed text-muted-foreground md:text-lg"
            style={fadeUp(0.25)}
          >
            {description}
          </p>
        </div>
      </Container>
    </section>
  );
}
