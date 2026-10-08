import { useEffect, useRef, useState } from "react";

/* The views of an orbital sequence, downloaded and decoded in advance so the
   rotation never waits for the network. A spread of views comes first (every
   8th, then every 4th…), so the visitor can turn the programme long before
   the last image arrives; until then the nearest loaded view is shown. */

/** Loading order: 0, 8, 16…, then 4, 12…, then 2, 6…, then the rest. */
export function loadingOrder(count: number): number[] {
  const order: number[] = [];
  const seen = new Set<number>();
  for (let step = 8; step >= 1; step /= 2) {
    for (let i = 0; i < count; i += step) {
      if (!seen.has(i)) {
        seen.add(i);
        order.push(i);
      }
    }
  }
  return order;
}

/** Index of the loaded view closest to `index` (going round the sequence), or -1. */
export function nearestLoaded(loaded: readonly unknown[], index: number): number {
  const n = loaded.length;
  for (let d = 0; d <= n / 2; d++) {
    for (const i of [index + d, index - d]) {
      const j = ((i % n) + n) % n;
      if (loaded[j]) return j;
    }
  }
  return -1;
}

export function useOrbitFrames(urls: readonly string[]) {
  const images = useRef<(HTMLImageElement | null)[]>([]);
  const [ready, setReady] = useState(0);

  useEffect(() => {
    let live = true;
    let count = 0;
    images.current = urls.map(() => null);
    setReady(0);
    const queue = loadingOrder(urls.length);
    // A few at a time: the first views arrive quickly, the others follow.
    const next = async () => {
      for (let i = queue.shift(); i !== undefined && live; i = queue.shift()) {
        const img = new Image();
        // The bucket allows any origin: the canvas the views are drawn on stays readable.
        img.crossOrigin = "anonymous";
        img.decoding = "async";
        const loaded = await new Promise<boolean>((resolve) => {
          img.onload = () => resolve(true);
          img.onerror = () => resolve(false);
          img.src = urls[i] as string;
        });
        if (!loaded) continue;
        if (!live) return;
        // Decoded ahead of its first display when the browser allows it.
        void img.decode().catch(() => undefined);
        images.current[i] = img;
        setReady(++count);
      }
    };
    for (let k = 0; k < 4; k++) void next();
    return () => {
      live = false;
    };
  }, [urls]);

  return { images, ready, total: urls.length };
}
