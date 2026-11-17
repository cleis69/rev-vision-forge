import type { ElementType, ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * A liquid-glass stage: a frosted pane with a light rim, over a blurred copy
 * of its picture (`backdrop`) or, without one, over a soft champagne light.
 * Replaces the flat champagne frames (owner's request, 2026-11-17).
 */
export function GlassStage({
  children,
  backdrop,
  plain = false,
  as: Tag = "div",
  className,
  ...rest
}: {
  children: ReactNode;
  /** A picture to blur behind the glass (usually the poster of what it holds). */
  backdrop?: string | undefined;
  /** Same element without the glass (siblings of a glass pane, e.g. other offers). */
  plain?: boolean;
  as?: ElementType;
  className?: string;
} & Record<string, unknown>) {
  if (plain) {
    return (
      <Tag className={cn("relative", className)} {...rest}>
        {children}
      </Tag>
    );
  }
  return (
    <Tag className={cn("relative isolate overflow-hidden rounded-[22px]", className)} {...rest}>
      {backdrop ? (
        <span aria-hidden className="absolute inset-0 -z-20 overflow-hidden bg-[#0e0d0b]">
          <img
            src={backdrop}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-full w-full scale-125 object-cover opacity-70 blur-2xl saturate-150"
          />
        </span>
      ) : (
        <span aria-hidden className="glass-glow absolute inset-0 -z-20" />
      )}
      <span aria-hidden className="liquid-glass absolute inset-0 -z-10 rounded-[inherit]" />
      {children}
    </Tag>
  );
}
