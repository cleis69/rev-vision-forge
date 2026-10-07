import { useEffect, useRef, useState, type RefObject } from "react";

import { prefersReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Muted looping clip that costs nothing until it is close to the screen:
 * the still and the video are only requested once the box comes within
 * `rootMargin` of the viewport (or of `root`), and it only plays while visible.
 */
export function LazyVideo({
  src,
  still,
  sizes,
  className,
  root,
  rootMargin = "300px 0px",
}: {
  src: string;
  /** Still shown until the clip plays (`stillSrc` / `stillSrcSet` of adMedia). */
  still: { src: string; srcSet: string };
  /** Displayed width, for the still's srcset. */
  sizes: string;
  className?: string | undefined;
  root?: RefObject<HTMLElement | null>;
  rootMargin?: string;
}) {
  const box = useRef<HTMLSpanElement | null>(null);
  const video = useRef<HTMLVideoElement | null>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setNear(true);
          io.disconnect();
        }
      },
      { root: root?.current ?? null, rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [root, rootMargin]);

  useEffect(() => {
    const v = video.current;
    if (!near || !v) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !prefersReducedMotion()) v.play().catch(() => {});
        else v.pause();
      },
      { root: root?.current ?? null, threshold: 0.2 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, [near, root]);

  return (
    <span ref={box} className={cn("relative block overflow-hidden", className)}>
      {near ? (
        <>
          <img
            src={still.src}
            srcSet={still.srcSet}
            sizes={sizes}
            alt=""
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover animate-in fade-in duration-500"
          />
          <video
            ref={video}
            src={src}
            muted
            loop
            playsInline
            preload="metadata"
            onPlaying={(e) => (e.currentTarget.dataset["playing"] = "")}
            className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-300 data-[playing]:opacity-100"
          />
        </>
      ) : null}
    </span>
  );
}
