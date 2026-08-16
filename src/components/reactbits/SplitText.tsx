import { useRef, type ElementType } from "react";
import { useGSAP } from "@gsap/react";

import { cn } from "@/lib/utils";
import { EASE, ensureGsap, prefersReducedMotion } from "@/lib/gsap";

/**
 * React Bits — SplitText (adapted, SSR-safe).
 * The split markup is rendered on the server too, so there is no hydration
 * mismatch and no flash of unsplit text.
 */
export function SplitText({
  text,
  as: Tag = "span",
  className,
  splitBy = "words",
  delay = 0,
  stagger = 0.045,
  start = "top 88%",
}: {
  text: string;
  as?: ElementType;
  className?: string;
  splitBy?: "words" | "chars";
  delay?: number;
  stagger?: number;
  start?: string;
}) {
  const ref = useRef<HTMLElement | null>(null);

  const tokens =
    splitBy === "chars"
      ? Array.from(text).map((c) => (c === " " ? "\u00A0" : c))
      : text.split(" ").map((w, i, arr) => (i < arr.length - 1 ? `${w}\u00A0` : w));

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const { gsap } = ensureGsap();
      const parts = el.querySelectorAll<HTMLElement>("[data-split-part]");

      if (prefersReducedMotion()) {
        gsap.set(parts, { opacity: 1, y: 0, filter: "none" });
        return;
      }

      gsap.fromTo(
        parts,
        { yPercent: 115, opacity: 0, filter: "blur(8px)" },
        {
          yPercent: 0,
          opacity: 1,
          filter: "blur(0px)",
          duration: 1.1,
          ease: EASE,
          delay,
          stagger,
          clearProps: "filter",
          scrollTrigger: { trigger: el, start, once: true },
        },
      );
    },
    { scope: ref, dependencies: [text, splitBy] },
  );

  return (
    <Tag ref={ref as never} className={className} aria-label={text}>
      <span className="sr-only">{text}</span>
      <span aria-hidden className="inline">
        {tokens.map((token, i) => (
          <span key={`${token}-${i}`} className="inline-block overflow-hidden align-bottom">
            <span data-split-part className={cn("inline-block will-change-transform opacity-0")}>
              {token}
            </span>
          </span>
        ))}
      </span>
    </Tag>
  );
}
