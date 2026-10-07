import { cn } from "@/lib/utils";
import { Eyebrow, fadeUp } from "./ui";
import { Reveal } from "./Reveal";

/** Section title with one word set in champagne. */
export function AccentHeading({
  eyebrow,
  before,
  accent,
  after,
  description,
  as: Tag = "h2",
  align = "left",
  className,
}: {
  eyebrow: string;
  before: string;
  accent: string;
  after?: string;
  description?: string;
  as?: "h1" | "h2";
  align?: "left" | "center";
  className?: string;
}) {
  const box = cn("max-w-3xl", align === "center" && "mx-auto text-center", className);
  const content = (
    <>
      <Eyebrow>{eyebrow}</Eyebrow>
      <Tag
        className={cn(
          "mt-4 font-display font-medium tracking-[-0.03em] text-gradient [text-wrap:balance]",
          Tag === "h1"
            ? "text-[clamp(2.1rem,4.6vw,3.9rem)] leading-[1.03]"
            : "text-[clamp(1.75rem,3.6vw,3rem)] leading-[1.08]",
        )}
      >
        {before} <span className="text-primary">{accent}</span>
        {after ? ` ${after}` : ""}
      </Tag>
      {description ? (
        <p
          className={cn(
            "mt-4 text-[15px] leading-relaxed text-muted-foreground md:text-base lg:text-lg",
            align === "center" && "mx-auto max-w-2xl",
          )}
        >
          {description}
        </p>
      ) : null}
    </>
  );
  // A page title plays on load, before any JavaScript runs.
  return Tag === "h1" ? (
    <div className={box} style={fadeUp(0)}>
      {content}
    </div>
  ) : (
    <Reveal className={box}>{content}</Reveal>
  );
}
