import { useRef, type ReactNode, type MouseEvent } from "react";

import { cn } from "@/lib/utils";

/**
 * React Bits — SpotlightCard (adapted).
 * Pointer-follow highlight, CSS-variable driven so it costs no re-render.
 */
export function SpotlightCard({
  children,
  className,
  spotlightColor = "color-mix(in oklab, var(--primary) 22%, transparent)",
}: {
  children: ReactNode;
  className?: string;
  spotlightColor?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  const onMove = (event: MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--spot-x", `${event.clientX - rect.left}px`);
    el.style.setProperty("--spot-y", `${event.clientY - rect.top}px`);
    el.style.setProperty("--spot-opacity", "1");
  };

  const onLeave = () => ref.current?.style.setProperty("--spot-opacity", "0");

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={cn("group/spot relative isolate overflow-hidden", className)}
      style={{ ["--spot-color" as string]: spotlightColor }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 opacity-[var(--spot-opacity,0)] transition-opacity duration-500"
        style={{
          background:
            "radial-gradient(320px circle at var(--spot-x, 50%) var(--spot-y, 50%), var(--spot-color), transparent 70%)",
        }}
      />
      {children}
    </div>
  );
}
