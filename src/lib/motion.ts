import { useEffect, useState } from "react";

export function prefersReducedMotion() {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Coarse heuristic for low-power devices — used to skip WebGL backgrounds. */
export function isLowPowerDevice() {
  if (typeof window === "undefined") return true;
  const nav = navigator as Navigator & { deviceMemory?: number };
  if (window.matchMedia("(max-width: 1024px)").matches) return true;
  if (window.matchMedia("(pointer: coarse)").matches) return true;
  if (typeof nav.deviceMemory === "number" && nav.deviceMemory <= 4) return true;
  if (typeof nav.hardwareConcurrency === "number" && nav.hardwareConcurrency <= 4) return true;
  return false;
}

/**
 * True once the page has finished loading on a screen matching `query`.
 * For decorative media that must never compete with the first paint, and
 * that should not be downloaded at all on phones.
 */
export function useDeferredMedia(query = "(min-width: 1024px)") {
  const [on, setOn] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(query);
    let idle = 0;
    let timer = 0;
    const run = () => setOn(mq.matches);
    const start = () => {
      if (typeof window.requestIdleCallback === "function") idle = window.requestIdleCallback(run, { timeout: 2500 });
      else timer = globalThis.setTimeout(run, 1200) as unknown as number;
    };
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });
    mq.addEventListener("change", run);
    return () => {
      window.removeEventListener("load", start);
      mq.removeEventListener("change", run);
      if (idle) window.cancelIdleCallback(idle);
      if (timer) globalThis.clearTimeout(timer);
    };
  }, [query]);

  return on;
}
