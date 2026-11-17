import { useEffect, useRef, useState } from "react";

import { adMedia } from "@/lib/ads";
import { CLIENTS } from "@/lib/clients";
import { ClientMark } from "./ClientLogos";
import type { CaseStudy } from "@/lib/cases";
import { cn } from "@/lib/utils";
import { useMotionAllowed } from "./SalesPlanDemo";

/*
 * The picture of a case study on its champagne stage: a muted film that plays
 * while in sight (for visitors who accept motion), or a capture of the site
 * in a browser window.
 */

export function CaseHeroMedia({
  study,
  alt,
  priority = false,
  className,
}: {
  study: CaseStudy;
  alt: string;
  priority?: boolean;
  className?: string;
}) {
  const hero = study.hero;
  if ("phone" in hero) {
    return <PhoneFilm id={hero.phone} alt={alt} priority={priority} className={className} />;
  }
  if ("logo" in hero) {
    const client = CLIENTS.find((c) => c.id === study.client);
    return (
      <div className={cn("grid aspect-[16/10] place-items-center text-white/90", className)}>
        {client ? <ClientMark client={client} className="[--k:2.6] max-w-[80%]" /> : null}
      </div>
    );
  }
  return (
    <div className={cn("overflow-hidden rounded-[10px] bg-black shadow-[0_30px_60px_-28px_rgb(0_0_0/0.7)]", className)}>
      {"film" in hero ? (
        <LoopFilm
          src={hero.film}
          poster={hero.poster}
          end={hero.once?.end}
          alt={alt}
          priority={priority}
        />
      ) : (
        <BrowserShot src={hero.shot} small={hero.shotSmall} label={study.website?.label ?? study.name} alt={alt} priority={priority} />
      )}
    </div>
  );
}

/** One of the portfolio's vertical films, muted, in a black phone. */
export function PhoneFilm({
  id,
  alt,
  priority = false,
  className,
}: {
  id: string;
  alt: string;
  priority?: boolean;
  className?: string | undefined;
}) {
  const motion = useMotionAllowed();
  const box = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [seen, setSeen] = useState(false);
  const media = adMedia(id);

  useEffect(() => {
    const node = box.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => setSeen(!!entry?.isIntersecting), {
      threshold: 0.2,
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const el = video.current;
    if (!el) return;
    if (seen) el.play().catch(() => {});
    else el.pause();
  }, [seen, motion]);

  return (
    <div className={cn("grid place-items-center py-2 sm:py-4", className)}>
      <div
        ref={box}
        className="relative aspect-[9/16] w-[min(58vw,15.5rem)] overflow-hidden rounded-[1.9rem] bg-black shadow-[0_34px_70px_-28px_rgb(0_0_0/0.75)] ring-[7px] ring-[#0d0d0d]"
      >
        <img
          src={media.stillSrc}
          srcSet={media.stillSrcSet}
          sizes="250px"
          alt={alt}
          width={360}
          height={640}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
        {motion ? (
          <video
            ref={video}
            src={media.sd}
            poster={media.poster}
            muted
            loop
            playsInline
            preload={priority ? "auto" : "metadata"}
            aria-hidden
            tabIndex={-1}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : null}
      </div>
    </div>
  );
}

/**
 * A muted landscape film that plays while in sight. With `end`, it plays once
 * and holds its last image (the image shown without motion).
 */
export function LoopFilm({
  src,
  poster,
  end,
  alt,
  priority = false,
}: {
  src: string;
  poster: string;
  end?: string | undefined;
  alt: string;
  priority?: boolean;
}) {
  const motion = useMotionAllowed();
  const box = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const node = box.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => setSeen(!!entry?.isIntersecting), {
      threshold: 0.2,
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const el = video.current;
    if (!el) return;
    if (seen) el.play().catch(() => {});
    else el.pause();
  }, [seen, motion]);

  return (
    <div ref={box} className="relative aspect-video">
      <img
        src={end ?? poster}
        alt={alt}
        width={1280}
        height={720}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover"
      />
      {motion ? (
        <video
          ref={video}
          src={src}
          poster={poster}
          muted
          loop={!end}
          playsInline
          preload={priority ? "auto" : "metadata"}
          aria-hidden
          tabIndex={-1}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : null}
    </div>
  );
}

export function BrowserShot({
  src,
  small,
  label,
  alt,
  priority = false,
}: {
  src: string;
  small: string;
  label: string;
  alt: string;
  priority?: boolean;
}) {
  return (
    <div className="bg-[#1a1a1a]">
      <div className="flex h-7 items-center gap-1.5 px-3">
        <span className="size-2 rounded-full bg-white/20" />
        <span className="size-2 rounded-full bg-white/20" />
        <span className="size-2 rounded-full bg-white/20" />
        <span className="ml-3 truncate rounded-[4px] bg-white/[0.07] px-2.5 py-0.5 text-[11px] text-white/60">
          {label}
        </span>
      </div>
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={src}
          srcSet={`${small} 960w, ${src} 1440w`}
          sizes="(min-width: 1024px) 640px, 100vw"
          alt={alt}
          width={1440}
          height={900}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover object-top"
        />
      </div>
    </div>
  );
}
