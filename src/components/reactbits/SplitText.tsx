import type { CSSProperties, ElementType, ReactNode } from "react";

import { useReveal } from "@/components/rev/Reveal";
import { Mark, parseMarks, plainTitle } from "@/components/rev/ui";
import { cn } from "@/lib/utils";

/**
 * React Bits — SplitText (adapted, SSR-safe, CSS only).
 * The split markup is rendered on the server too, so there is no hydration
 * mismatch and no flash of unsplit text. Words rise in one after another when
 * the heading scrolls into view, or right away with `immediate` (page titles,
 * so they show before any JavaScript runs). Words in `[[…]]` are underlined
 * by hand once they have risen (Mark).
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
  const label = plainTitle(text);

  let index = 0;
  const unit = (token: string) => {
    const i = index++;
    return (
      <span
        key={`${token}-${i}`}
        className="-mb-[0.18em] -mt-[0.1em] inline-block overflow-hidden pb-[0.18em] pt-[0.1em] align-bottom"
      >
        <span data-split-part className="inline-block" style={{ "--i": i } as CSSProperties}>
          {token}
        </span>
      </span>
    );
  };

  /** The words of a chunk, with a plain space between them (outside the word boxes). */
  const words = (chunk: string) =>
    chunk
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .flatMap((w, i) => (i === 0 ? [unit(w)] : [" ", unit(w)]));

  let content: ReactNode[];
  if (splitBy === "chars") {
    content = Array.from(label).map((c) => unit(c === " " ? " " : c));
  } else {
    content = parseMarks(text).flatMap((part, p) => {
      const before = part.text.startsWith(" ") ? [" "] : [];
      const after = part.text.endsWith(" ") ? [" "] : [];
      if (!part.mark) return [...before, ...words(part.text), ...after];
      const inner = words(part.text);
      return [
        ...before,
        <Mark key={`mark-${p}`} delay={delay + 0.35 + index * stagger}>
          {inner}
        </Mark>,
        ...after,
      ];
    });
  }

  const style = {
    "--split-delay": `${delay * 1000}ms`,
    "--split-stagger": `${stagger * 1000}ms`,
  } as CSSProperties;

  return (
    <Tag
      ref={immediate ? undefined : (ref as never)}
      className={cn(className, immediate ? "split-now" : revealed && "is-revealed")}
      style={style}
      aria-label={label}
    >
      <span aria-hidden className="inline">
        {content}
      </span>
    </Tag>
  );
}
