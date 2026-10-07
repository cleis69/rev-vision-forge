import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

import { cn } from "@/lib/utils";

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

/* One observer for every reveal on the page: an element is revealed once its
   top passes 88 % of the viewport height, and never hidden again. */
const onReveal = new WeakMap<Element, () => void>();
let observer: IntersectionObserver | undefined;

function observeReveal(el: Element, reveal: () => void) {
  observer ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer?.unobserve(entry.target);
        onReveal.get(entry.target)?.();
        onReveal.delete(entry.target);
      }
    },
    { rootMargin: "0px 0px -12% 0px" },
  );
  onReveal.set(el, reveal);
  observer.observe(el);
  return () => {
    observer?.unobserve(el);
    onReveal.delete(el);
  };
}

/** Becomes true when the element scrolls into view (see `.reveal-init` in styles.css). */
export function useReveal<T extends Element>() {
  const ref = useRef<T | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return observeReveal(el, () => setRevealed(true));
  }, []);

  return { ref, revealed };
}

/**
 * Shared scroll reveal: fade-up + blur-in, in CSS. Plays once, never replays on
 * scroll back, and is disabled for reduced motion. Without JavaScript the
 * content stays visible (see the <noscript> rule in __root.tsx).
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
  const { ref, revealed } = useReveal<HTMLElement>();
  const style = {
    "--reveal-delay": `${delay}ms`,
    "--reveal-y": `${y}px`,
    "--reveal-blur": `${blur}px`,
  } as CSSProperties;

  return (
    <Tag ref={ref as never} className={cn("reveal-init", revealed && "is-revealed", className)} style={style}>
      {children}
    </Tag>
  );
}
