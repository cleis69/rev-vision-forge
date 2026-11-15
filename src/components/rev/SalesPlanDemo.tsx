import { useEffect, useState } from "react";

import film from "@/assets/demo-phone-film.mp4?url";
import { photo } from "@/lib/images";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/*
 * The 3D sales plan at work, in a phone: a film of the public demo page (a
 * fictional programme, open to all) being used, over a capture of that same
 * page. The offer page stays light, and passers-by count no visit on the
 * programme; the demo itself opens at full size from the links around it.
 */

const DEMO_SLUG = "villas-de-demonstration";

export const demoPath = (locale: Locale) => `${locale === "en" ? "/en" : ""}/p/${DEMO_SLUG}`;

const capture = photo("demo-phone");

/** Films play for visitors who accept motion and are not saving data. */
export function useMotionAllowed() {
  const [allowed, setAllowed] = useState(false);
  useEffect(() => {
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saving = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
      ?.saveData;
    setAllowed(!still && !saving);
  }, []);
  return allowed;
}

/** A black phone playing the demo. `alt` describes the page it shows. */
export function DemoPhone({ alt, className }: { alt: string; className?: string }) {
  const playing = useMotionAllowed();
  return (
    <div
      className={cn(
        "relative aspect-[390/844] overflow-hidden rounded-[2.1rem] bg-black shadow-[0_34px_70px_-28px_rgb(0_0_0/0.75)] ring-[9px] ring-[#0d0d0d]",
        className,
      )}
    >
      <img
        src={capture.src}
        srcSet={capture.srcSet}
        sizes="300px"
        alt={alt}
        width={390}
        height={844}
        fetchPriority="high"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover object-top"
      />
      {playing ? (
        <video
          src={film}
          poster={capture.src}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden
          tabIndex={-1}
          className="absolute inset-0 h-full w-full object-cover object-top"
        />
      ) : null}
    </div>
  );
}
