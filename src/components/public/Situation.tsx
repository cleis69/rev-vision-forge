import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { Car, Footprints, MapPin, Navigation } from "lucide-react";

import { directions, placeTime } from "@/lib/location";
import type { PublicProgramme } from "@/lib/public/programme";

// MapLibre is loaded only when the section comes near the screen.
const ProgrammeMap = lazy(() => import("@/components/map/ProgrammeMap"));

export function Situation({ programme }: { programme: PublicProgramme }) {
  const { address, city, position, places } = programme;
  const box = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = box.current;
    if (!el || near) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true);
          observer.disconnect();
        }
      },
      { rootMargin: "600px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [near]);

  const where = address ?? city;
  const route = directions({ position, address: where });
  const button =
    "inline-flex h-12 items-center gap-2 rounded-full px-6 text-sm font-medium transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70";

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_1.35fr]">
      <div>
        <h2 className="font-brand text-3xl font-medium tracking-tight sm:text-4xl">Situation</h2>
        {where ? (
          <p className="mt-5 flex gap-2.5 text-base leading-relaxed text-white/75">
            <MapPin className="mt-1 size-4 shrink-0 text-[color:var(--brand)]" aria-hidden />
            <span>
              {where}
              {address && city && !address.toLowerCase().includes(city.toLowerCase())
                ? `, ${city}`
                : ""}
            </span>
          </p>
        ) : null}

        {places.length > 0 ? (
          <ul
            className="mt-8 divide-y divide-white/10 border-y border-white/10"
            aria-label="À proximité"
          >
            {places.map((place, i) => (
              <li key={i} className="flex items-center justify-between gap-4 py-4">
                <span className="flex min-w-0 items-center gap-3">
                  {place.mode === "pied" ? (
                    <Footprints className="size-4 shrink-0 text-[color:var(--brand)]" aria-hidden />
                  ) : (
                    <Car className="size-4 shrink-0 text-[color:var(--brand)]" aria-hidden />
                  )}
                  <span className="text-white/90">{place.name}</span>
                </span>
                <span className="shrink-0 tabular-nums text-white/60">{placeTime(place)}</span>
              </li>
            ))}
          </ul>
        ) : null}

        {route ? (
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={route.google}
              target="_blank"
              rel="noopener"
              className={`${button} bg-[color:var(--brand)] text-[color:var(--brand-contrast)] hover:opacity-90`}
            >
              <Navigation className="size-4" aria-hidden />
              Itinéraire Google Maps
            </a>
            <a
              href={route.waze}
              target="_blank"
              rel="noopener"
              className={`${button} border border-white/25 text-white hover:border-white/60`}
            >
              Ouvrir dans Waze
            </a>
          </div>
        ) : null}
      </div>

      {position ? (
        <div
          ref={box}
          className="rev-map relative h-[360px] overflow-hidden rounded-2xl border border-white/10 bg-[#111] sm:h-[440px]"
        >
          {near ? (
            <Suspense fallback={null}>
              <ProgrammeMap
                position={position}
                color={programme.organization.brandColor}
                className="absolute inset-0"
              />
            </Suspense>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
