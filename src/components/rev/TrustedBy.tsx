import { useCopy } from "@/lib/i18n";
import { Container } from "./ui";

// What the studio produces — no client names on the site.
const COPY = {
  fr: {
    label: "Ce que nous produisons",
    items: [
      "Ads verticales",
      "Room tours",
      "Personal branding",
      "Drone",
      "Visite virtuelle 3D",
      "Films de lancement",
      "Meta Ads",
      "HubSpot CRM",
    ],
  },
  en: {
    label: "What we produce",
    items: [
      "Vertical ads",
      "Room tours",
      "Personal branding",
      "Drone",
      "3D virtual tours",
      "Launch films",
      "Meta Ads",
      "HubSpot CRM",
    ],
  },
};

export function TrustedBy() {
  const copy = useCopy(COPY);
  return (
    <section className="border-y border-border/70 py-6 sm:py-7">
      <Container>
        <div className="flex flex-col gap-x-8 gap-y-3 lg:flex-row lg:items-baseline">
          <p className="shrink-0 text-sm text-muted-foreground">{copy.label}</p>
          <ul className="flex flex-wrap gap-x-5 gap-y-1.5 font-display text-[15px] font-medium tracking-tight text-foreground/90 sm:text-base">
            {copy.items.map((item, i) => (
              <li key={item} className="flex items-center gap-5 whitespace-nowrap">
                {i > 0 ? <span aria-hidden className="size-1 rounded-full bg-primary/70" /> : null}
                {item}
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
