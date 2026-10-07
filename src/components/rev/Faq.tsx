import { useState } from "react";
import { Plus } from "lucide-react";

import { FAQ_ITEMS } from "@/lib/faq";
import { useLocale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Container, Section, SectionHeading } from "./ui";
import { Reveal } from "./Reveal";

const COPY = {
  fr: { title: "Questions fréquentes." },
  en: { title: "Frequently asked questions." },
} as const;

export function Faq() {
  const locale = useLocale();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <Section id="faq" className="border-t border-border/70">
      <Container>
        <div className="grid gap-6 sm:gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-14">
          <SectionHeading eyebrow="FAQ" title={COPY[locale].title} />

          <Reveal>
            <ul className="border-t border-border">
              {FAQ_ITEMS[locale].map((item, i) => {
                const isOpen = open === i;
                return (
                  <li key={item.q} className="border-b border-border">
                    <button
                      type="button"
                      onClick={() => setOpen(isOpen ? null : i)}
                      aria-expanded={isOpen}
                      className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-4 py-4 text-left transition-colors duration-300 hover:text-primary sm:gap-6 sm:py-5"
                    >
                      <span className="font-display text-base font-medium tracking-tight md:text-lg">
                        {item.q}
                      </span>
                      <Plus
                        size={18}
                        className={cn(
                          "shrink-0 text-muted-foreground transition-transform duration-500",
                          isOpen && "rotate-45 text-primary",
                        )}
                      />
                    </button>
                    <div
                      className="grid transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                      style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                    >
                      <div className="overflow-hidden">
                        <p className="max-w-2xl pb-5 text-sm leading-relaxed text-muted-foreground">
                          {item.a}
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
