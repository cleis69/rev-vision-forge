/*
 * REV — Real Estate Vision. The globe, the house, the north star and the
 * orbit, drawn as vectors (source and every export live in the logo kit,
 * rev-vision-forge-media/logo-REV). The files in /public/brand are the dark
 * background colour versions.
 */

const VARIANTS = {
  /** Icon + REV, no tagline: headers and small sizes. */
  compact: { src: "/brand/rev-logo-compact.svg", ratio: 563.62 / 230 },
  /** Icon + REV + REAL ESTATE VISION. */
  full: { src: "/brand/rev-logo.svg", ratio: 563.62 / 230 },
  /** Icon only. */
  icon: { src: "/brand/rev-icone.svg", ratio: 216 / 214 },
} as const;

export function RevLogo({
  className,
  variant = "compact",
  lazy = false,
}: {
  className?: string | undefined;
  variant?: keyof typeof VARIANTS;
  /** Below the fold (footer): not preloaded with the page. */
  lazy?: boolean;
}) {
  const v = VARIANTS[variant];
  return (
    <img
      src={v.src}
      alt="REV — Real Estate Vision"
      width={Math.round(64 * v.ratio)}
      height={64}
      decoding="async"
      loading={lazy ? "lazy" : undefined}
      className={className}
    />
  );
}

export function RevMark({ className }: { className?: string }) {
  return <RevLogo variant="icon" className={className} />;
}
