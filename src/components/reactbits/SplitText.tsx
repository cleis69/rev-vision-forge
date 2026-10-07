import type { CSSProperties, ElementType } from "react";

import { useReveal } from "@/components/rev/Reveal";
import { cn } from "@/lib/utils";

/**
 * React Bits — SplitText (adapted, SSR-safe, CSS only).
 * The split markup is rendered on the server too, so there is no hydration
 * mismatch and no flash of unsplit text. Words rise in one after another when
 * the heading scrolls into view, or right away with `immediate` (page titles,
 * so they show before any JavaScript runs).
 */
export function SplitText({
  text,
  as: Tag = "span",
  className,
  splitBy = "words",
  delay = 0,
  stagger = 0.045,
  immediate = false,
}: {
  text: string;
  as?: ElementType;
  className?: string;
  splitBy?: "words" | "chars";
  delay?: number;
  stagger?: number;
  immediate?: boolean;
}) {
  const { ref, revealed } = useReveal<HTMLElement>();

  const tokens =
    splitBy === "chars"
      ? Array.from(text).map((c) => (c === " " ? " " : c))
      : text.split(" ").map((w, i, arr) => (i < arr.length - 1 ? `${w} ` : w));

  const style = {
    "--split-delay": `${delay * 1000}ms`,
    "--split-stagger": `${stagger * 1000}ms`,
  } as CSSProperties;

  return (
    <Tag
      ref={immediate ? undefined : (ref as never)}
      className={cn(className, immediate ? "split-now" : revealed && "is-revealed")}
      style={style}
      aria-label={text}
    >
      <span aria-hidden className="inline">
        {tokens.map((token, i) => (
          <span
            key={`${token}-${i}`}
            className="-mb-[0.18em] -mt-[0.1em] inline-block overflow-hidden pb-[0.18em] pt-[0.1em] align-bottom"
          >
            <span data-split-part className="inline-block" style={{ "--i": i } as CSSProperties}>
              {token}
            </span>
          </span>
        ))}
      </span>
    </Tag>
  );
}
