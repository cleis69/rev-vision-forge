import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { CalendarDays, MessageCircle } from "lucide-react";

import { whatsappUrl } from "@/lib/contact";
import { href, useCopy, useLocale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/*
 * The two ways to reach REV, always at hand: a small bar at the bottom of the
 * screen, shown once the visitor has left the top of the page and hidden again
 * at the end (where the champagne band already offers them).
 */

const COPY = {
  fr: { label: "Nous contacter", meet: "Prendre rendez-vous", whatsapp: "WhatsApp" },
  en: { label: "Contact us", meet: "Book a call", whatsapp: "WhatsApp" },
};

export function ActionBar() {
  const copy = useCopy(COPY);
  const locale = useLocale();
  const [past, setPast] = useState(false);
  const [atEnd, setAtEnd] = useState(false);
  // Each page has its own closing band: watch the one of the current page.
  const pathname = useRouterState({ select: (st) => st.location.pathname });

  useEffect(() => {
    const onScroll = () => setPast(window.scrollY > window.innerHeight * 0.7);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Hidden over the champagne band and the footer, which offer the same ways.
  useEffect(() => {
    const ends = [document.getElementById("contact"), document.querySelector("footer")].filter(
      (el): el is HTMLElement => el !== null,
    );
    if (ends.length === 0) return;
    const visible = new Set<Element>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target);
          else visible.delete(entry.target);
        }
        setAtEnd(visible.size > 0);
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    for (const el of ends) observer.observe(el);
    return () => {
      observer.disconnect();
      setAtEnd(false);
    };
  }, [pathname]);

  // The contact page is itself the way to reach REV.
  const onContact = pathname === href("contact", "fr") || pathname === href("contact", "en");
  const shown = past && !atEnd && !onContact;

  return (
    <nav
      aria-label={copy.label}
      className={cn(
        "fixed inset-x-3 bottom-3 z-40 mx-auto flex max-w-[22rem] gap-1.5 rounded-[14px] border border-white/10 bg-[#141414]/90 p-1.5 shadow-[0_20px_50px_-20px_rgb(0_0_0/0.9)] backdrop-blur-md sm:bottom-5",
        "transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none",
        shown ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-[140%] opacity-0",
      )}
      {...(shown ? {} : { "aria-hidden": true })}
    >
      <Link
        to={href("contact", locale) as never}
        tabIndex={shown ? 0 : -1}
        className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-[10px] text-sm font-medium text-foreground transition-colors duration-200 hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/70"
      >
        <CalendarDays size={16} aria-hidden />
        {copy.meet}
      </Link>
      <a
        href={whatsappUrl(locale)}
        target="_blank"
        rel="noopener"
        tabIndex={shown ? 0 : -1}
        className="rev-sheen relative isolate inline-flex h-11 flex-1 items-center justify-center gap-2 overflow-hidden rounded-[10px] bg-primary text-sm font-medium text-primary-foreground transition-colors duration-200 hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#141414]"
      >
        <MessageCircle size={16} aria-hidden />
        {copy.whatsapp}
      </a>
    </nav>
  );
}
