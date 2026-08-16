import { useEffect, useRef, type ReactNode } from "react";
import { ReactLenis, type LenisRef } from "lenis/react";

import { ensureGsap, prefersReducedMotion } from "@/lib/gsap";

/**
 * Lenis smooth scrolling, synchronised with the GSAP ticker + ScrollTrigger.
 * Skipped entirely when the user prefers reduced motion.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const lenisRef = useRef<LenisRef | null>(null);
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current = prefersReducedMotion();
    if (reduced.current) return;

    const { gsap, ScrollTrigger } = ensureGsap();
    const lenis = lenisRef.current?.lenis;
    if (!lenis) return;

    const onScroll = () => ScrollTrigger.update();
    lenis.on("scroll", onScroll);

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);

    return () => {
      lenis.off("scroll", onScroll);
      gsap.ticker.remove(raf);
      window.removeEventListener("load", refresh);
    };
  }, []);

  return (
    <ReactLenis
      root
      ref={lenisRef}
      options={{
        lerp: 0.1,
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 1.4,
        syncTouch: false,
        autoRaf: false,
        overscroll: false,
        anchors: { offset: -80 },
        prevent: (node) => node.hasAttribute?.("data-lenis-prevent") ?? false,
      }}
    >
      {children}
    </ReactLenis>
  );
}
