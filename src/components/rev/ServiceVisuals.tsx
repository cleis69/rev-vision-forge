import { useEffect, useState } from "react";
import { CalendarDays, Check, MessageCircle, Megaphone } from "lucide-react";

import { adMedia } from "@/lib/ads";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { PhoneFilm } from "./CaseMedia";
import { GlassStage } from "./Glass";
import { useInView } from "./Reveal";
import { useMotionAllowed } from "./SalesPlanDemo";

/*
 * What each pillar produces, shown as a small working interface on a champagne
 * stage: a film playing, a week of posts filling in, a campaign bringing in
 * enquiries, a lead moving down the pipeline. They play while in sight, and
 * stand still on their last state for visitors who prefer less motion.
 * Figures are left out on purpose: these are pictures of the work, not results.
 */

/** A step counter that ticks while the element is in sight. */
function useTicker(steps: number, ms: number) {
  const { ref, inView } = useInView<HTMLDivElement>(0.35);
  const motion = useMotionAllowed();
  const [step, setStep] = useState(steps - 1);
  useEffect(() => {
    if (!(inView && motion)) return;
    setStep(0);
    const id = window.setInterval(() => setStep((s) => (s + 1) % steps), ms);
    return () => window.clearInterval(id);
  }, [inView, motion, steps, ms]);
  return { ref, step };
}

const CARD =
  "rounded-[14px] border border-white/12 bg-black/55 text-white shadow-[0_30px_60px_-28px_rgb(0_0_0/0.8)] backdrop-blur-md";

export function ServiceVisual({ id, locale }: { id: string; locale: Locale }) {
  return (
    <GlassStage
      backdrop={id === "production-visuelle" ? adMedia("ad-10").stillSrc : undefined}
      className="grid min-h-[22rem] place-items-center p-5 sm:min-h-[26rem] sm:p-8"
    >
      {id === "production-visuelle" ? (
        <PhoneFilm id="ad-10" alt="" className="py-0" />
      ) : id === "marketing" ? (
        <ContentWeek locale={locale} />
      ) : id === "acquisition" ? (
        <Campaign locale={locale} />
      ) : (
        <Pipeline locale={locale} />
      )}
    </GlassStage>
  );
}

const WEEK: Record<Locale, string[]> = {
  fr: ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"],
  en: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
};
/** Days with a post, and the film shown in it. */
const POSTS = [
  { day: 0, ad: "ad-24" },
  { day: 2, ad: "ad-01" },
  { day: 4, ad: "ad-50" },
  { day: 5, ad: "ad-39" },
];

function ContentWeek({ locale }: { locale: Locale }) {
  const { ref, step } = useTicker(POSTS.length + 2, 900);
  const t =
    locale === "fr"
      ? { title: "Calendrier de la semaine", planned: "Programmé", posted: "Publié" }
      : { title: "This week's calendar", planned: "Scheduled", posted: "Posted" };
  return (
    <div ref={ref} className={cn(CARD, "w-full max-w-md p-4 sm:p-5")}>
      <div className="flex items-center justify-between text-sm">
        <span className="font-display font-medium">{t.title}</span>
        <CalendarDays size={16} strokeWidth={1.5} className="text-primary" aria-hidden />
      </div>
      <div className="mt-4 grid grid-cols-7 gap-1.5 text-center text-[11px] text-white/50">
        {WEEK[locale].map((d) => (
          <span key={d}>{d}</span>
        ))}
        {WEEK[locale].map((d, day) => {
          const i = POSTS.findIndex((p) => p.day === day);
          const post = POSTS[i];
          const shown = post !== undefined && step >= i;
          return (
            <span key={`slot-${d}`} className="relative aspect-[9/16] overflow-hidden rounded-[6px] bg-white/[0.05]">
              {post ? (
                <img
                  src={adMedia(post.ad).stillSrc}
                  alt=""
                  loading="lazy"
                  className={cn(
                    "absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-500",
                    shown ? "scale-100 opacity-100" : "scale-95 opacity-0",
                  )}
                />
              ) : null}
            </span>
          );
        })}
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-xs">
        <span className="text-white/60">
          {Math.min(step + 1, POSTS.length)} / {POSTS.length}
        </span>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-[6px] px-2 py-0.5 transition-colors duration-300",
            step >= POSTS.length ? "bg-primary text-primary-foreground" : "bg-white/10 text-white/70",
          )}
        >
          <Check size={12} aria-hidden />
          {step >= POSTS.length ? t.posted : t.planned}
        </span>
      </div>
    </div>
  );
}

const BARS = [38, 52, 46, 64, 58, 76, 88];

function Campaign({ locale }: { locale: Locale }) {
  const { ref, step } = useTicker(6, 1000);
  const t =
    locale === "fr"
      ? { title: "Campagne · programme neuf", leads: ["Demande de brochure", "Visite à planifier", "Rappel demandé"] }
      : { title: "Campaign · new development", leads: ["Brochure request", "Visit to plan", "Call-back requested"] };
  return (
    <div ref={ref} className={cn(CARD, "w-full max-w-md p-4 sm:p-5")}>
      <div className="flex items-center justify-between text-sm">
        <span className="font-display font-medium">{t.title}</span>
        <Megaphone size={16} strokeWidth={1.5} className="text-primary" aria-hidden />
      </div>
      <div className="mt-4 flex h-28 items-end gap-2 border-b border-white/10 pb-px">
        {BARS.map((h, i) => (
          <span
            key={i}
            className="flex-1 origin-bottom rounded-t-[4px] bg-primary transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{
              height: `${h}%`,
              transform: `scaleY(${step >= 1 ? 1 : 0.08})`,
              transitionDelay: `${i * 70}ms`,
              opacity: i === BARS.length - 1 ? 1 : 0.55 + i * 0.05,
            }}
          />
        ))}
      </div>
      <ul className="mt-3 space-y-1.5">
        {t.leads.map((lead, i) => (
          <li
            key={lead}
            className={cn(
              "flex items-center justify-between rounded-[8px] bg-white/[0.05] px-3 py-2 text-xs transition-[opacity,transform] duration-500",
              step >= i + 2 ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0",
            )}
          >
            <span className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-primary" />
              {lead}
            </span>
            <span className="text-white/45">{locale === "fr" ? "à l'instant" : "just now"}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Pipeline({ locale }: { locale: Locale }) {
  const { ref, step } = useTicker(5, 1100);
  const cols =
    locale === "fr" ? ["Nouveau", "Qualifié", "Rendez-vous"] : ["New", "Qualified", "Meeting"];
  // The lead moves one column per beat, then a WhatsApp message confirms.
  const at = Math.min(step, 2);
  return (
    <div ref={ref} className={cn(CARD, "w-full max-w-md p-4 sm:p-5")}>
      <div className="grid grid-cols-3 gap-2">
        {cols.map((c, i) => (
          <div key={c} className="min-h-[9.5rem] rounded-[8px] bg-white/[0.04] p-2">
            <p className="px-1 text-[11px] text-white/55">{c}</p>
            <div className="mt-2 space-y-1.5">
              {i === at ? (
                <div className="rounded-[6px] border border-primary/60 bg-primary/15 p-2 text-[11px] transition-colors duration-300">
                  <p className="font-medium">Karim B.</p>
                  <p className="mt-0.5 text-white/60">Villa · 2 ch.</p>
                </div>
              ) : null}
              <div className="h-8 rounded-[6px] bg-white/[0.06]" />
              {i !== 2 ? <div className="h-8 rounded-[6px] bg-white/[0.06]" /> : null}
            </div>
          </div>
        ))}
      </div>
      <div
        className={cn(
          "mt-3 flex items-center gap-2.5 rounded-[8px] bg-[#1f2c1f] px-3 py-2 text-xs transition-[opacity,transform] duration-500",
          step >= 3 ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0",
        )}
      >
        <MessageCircle size={14} className="shrink-0 text-[#4ade80]" aria-hidden />
        <span>
          {locale === "fr"
            ? "Rendez-vous confirmé sur WhatsApp, rappel envoyé la veille."
            : "Meeting confirmed on WhatsApp, reminder sent the day before."}
        </span>
      </div>
    </div>
  );
}
