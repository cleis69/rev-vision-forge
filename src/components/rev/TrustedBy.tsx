import { Container } from "./ui";

const LOGOS = [
  "MERIDIAN",
  "ALTA GROUP",
  "NOVUM",
  "CASA VERDE",
  "ORION ESTATES",
  "LUMEN",
  "ATELIER 9",
];

export function TrustedBy() {
  return (
    <section className="border-y border-border/70 py-10">
      <Container>
        <p className="text-center text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
          Ils nous font confiance
        </p>
      </Container>
      <div className="relative mt-8 overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]">
        <div
          className="flex w-max gap-14 pr-14"
          style={{ animation: "rev-marquee 38s linear infinite" }}
        >
          {[...LOGOS, ...LOGOS].map((logo, i) => (
            <span
              key={`${logo}-${i}`}
              className="font-display text-lg font-medium tracking-[0.24em] text-muted-foreground/60"
            >
              {logo}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
