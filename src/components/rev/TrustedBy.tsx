import { useCopy } from "@/lib/i18n";
import { Container } from "./ui";

// What the studio produces — no client names on the site.
const COPY = {
  fr: {
    label: "Ce que nous produisons",
    items: ["ADS VERTICALES", "ROOM TOURS", "PERSONAL BRANDING", "DRONE", "MATTERPORT", "FILMS DE LANCEMENT", "META ADS", "HUBSPOT CRM"],
  },
  en: {
    label: "What we produce",
    items: ["VERTICAL ADS", "ROOM TOURS", "PERSONAL BRANDING", "DRONE", "MATTERPORT", "LAUNCH FILMS", "META ADS", "HUBSPOT CRM"],
  },
};

export function TrustedBy() {
  const copy = useCopy(COPY);
  const LOGOS = copy.items;
  return (
    <section className="border-y border-border/70 py-7 sm:py-9">
      <Container>
        <p className="text-center text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
          {copy.label}
        </p>
      </Container>
      <div className="relative mt-5 overflow-hidden sm:mt-7 [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]">
        <div
          className="flex w-max gap-14 pr-14"
          style={{ animation: "rev-marquee 38s linear infinite" }}
        >
          {[...LOGOS, ...LOGOS].map((logo, i) => (
            <span
              key={`${logo}-${i}`}
              className="font-display text-sm font-medium tracking-[0.24em] text-muted-foreground/60 sm:text-lg"
            >
              {logo}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
