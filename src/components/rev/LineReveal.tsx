import { cn } from "@/lib/utils";
import { useInView } from "./Reveal";

const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

/**
 * Révèle un titre ligne par ligne : chaque ligne monte depuis son propre
 * débordement. Le texte reste intact dans le DOM pour le référencement.
 */
export function LineReveal({
  lines,
  className,
  delay = 0,
  stagger = 90,
}: {
  lines: string[];
  className?: string;
  delay?: number;
  stagger?: number;
}) {
  const { ref, inView } = useInView<HTMLSpanElement>(0.1);

  return (
    <span ref={ref} className={cn("block", className)}>
      {lines.map((line, index) => (
        <span key={line} className="block overflow-hidden pb-[0.06em]">
          <span
            className="block will-change-transform"
            style={{
              transform: inView ? "translateY(0)" : "translateY(105%)",
              opacity: inView ? 1 : 0,
              transition: `transform 750ms ${EASE}, opacity 750ms ${EASE}`,
              transitionDelay: `${delay + index * stagger}ms`,
            }}
          >
            {line}
          </span>
        </span>
      ))}
    </span>
  );
}
