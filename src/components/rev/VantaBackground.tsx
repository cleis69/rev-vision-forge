import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";
import { isLowPowerDevice, prefersReducedMotion } from "@/lib/motion";

type VantaEffect = { destroy: () => void; resize?: () => void };

/**
 * Lazy, SSR-safe Vanta wrapper.
 * three + the effect bundle are dynamically imported after mount only, and the
 * effect is skipped for reduced-motion, mobile and low-power devices.
 */
export function VantaBackground({
  className,
  options,
}: {
  className?: string;
  options?: Record<string, unknown>;
}) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    if (prefersReducedMotion() || isLowPowerDevice()) return;

    let effect: VantaEffect | null = null;
    let cancelled = false;

    const start = async () => {
      const [THREE, mod] = await Promise.all([
        import("three"),
        import("vanta/dist/vanta.fog.min.js"),
      ]);
      if (cancelled || !hostRef.current) return;
      const factory = ((mod as { default?: unknown }).default ?? mod) as (
        opts: Record<string, unknown>,
      ) => VantaEffect;

      effect = factory({
        el: hostRef.current,
        THREE,
        mouseControls: false,
        touchControls: false,
        gyroControls: false,
        minHeight: 200,
        minWidth: 200,
        ...optionsRef.current,
      });
    };

    const idle = window.requestIdleCallback
      ? window.requestIdleCallback(() => void start(), { timeout: 1200 })
      : window.setTimeout(() => void start(), 300);

    return () => {
      cancelled = true;
      if (window.cancelIdleCallback && typeof idle === "number") window.cancelIdleCallback(idle);
      else window.clearTimeout(idle as number);
      effect?.destroy();
      effect = null;
    };
  }, []);

  return <div ref={hostRef} aria-hidden className={cn("pointer-events-none", className)} />;
}
