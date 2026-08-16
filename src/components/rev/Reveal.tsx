import { useEffect, useRef, useState, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";

import { cn } from "@/lib/utils";
import { DURATION, EASE, ensureGsap, prefersReducedMotion } from "@/lib/gsap";

/** Kept for components that need a plain in-view boolean. */
export function useInView<T extends HTMLElement>(threshold = 0.15) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            observer.disconnect();
          }
        }
      },
      { threshold, rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, inView };
}

/**
 * Shared scroll reveal: fade-up + blur-in, driven by GSAP ScrollTrigger.
 * Plays once, never replays on scroll back, and is disabled for reduced motion.
 */
export function Reveal({
  children,
  delay = 0,
  className,
  as: Tag = "div",
  y = 28,
  blur = 10,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "li" | "span" | "p" | "article";
  y?: number;
  blur?: number;
}) {
  const ref = useRef<HTMLElement | null>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const { gsap } = ensureGsap();

      if (prefersReducedMotion()) {
        gsap.set(el, { opacity: 1, y: 0, filter: "none" });
        return;
      }

      gsap.fromTo(
        el,
        { opacity: 0, y, filter: `blur(${blur}px)` },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: DURATION,
          delay: delay / 1000,
          ease: EASE,
          clearProps: "filter,transform",
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        },
      );
    },
    { scope: ref, dependencies: [delay, y, blur] },
  );

  return (
    <Tag ref={ref as never} className={cn("reveal-init", className)}>
      {children}
    </Tag>
  );
}
