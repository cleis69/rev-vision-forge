import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Central GSAP setup.
 * ScrollTrigger touches `document`, so registration only happens in the browser.
 * Importing this module during SSR is safe: nothing runs at module scope there.
 */
let registered = false;

export function ensureGsap() {
  if (typeof window === "undefined") return { gsap, ScrollTrigger };
  if (!registered) {
    gsap.registerPlugin(ScrollTrigger);
    gsap.defaults({ ease: EASE, duration: 1 });
    registered = true;
  }
  return { gsap, ScrollTrigger };
}

/** Shared premium easing + timing so every section feels identical. */
export const EASE = "power3.out";
export const DURATION = 1.05;
export const STAGGER = 0.09;

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

export { gsap, ScrollTrigger };
