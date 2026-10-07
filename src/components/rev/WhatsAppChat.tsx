import { useEffect, useRef, useState } from "react";
import { CheckCheck, ChevronLeft, FileText, Mic, Phone, Plus, Video } from "lucide-react";

import { useLocale, type Locale } from "@/lib/i18n";
import { prefersReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { IPhone, StatusBar } from "./IPhone";

type Message =
  | { from: "agent" | "lead"; text: string; time: string; file?: string }
  | { from: "system"; text: string };

const COPY = {
  fr: { agency: "Votre agence", typing: "écrit…", online: "en ligne", today: "Aujourd'hui", typingLabel: "En train d'écrire" },
  en: { agency: "Your agency", typing: "typing…", online: "online", today: "Today", typingLabel: "Typing" },
} as const;

/** Demo conversation: a buyer lead from an Instagram ad, qualified on WhatsApp. */
const SCRIPTS: Record<Locale, Message[]> = {
  fr: [
    { from: "agent", time: "09:14", text: "Bonjour Karim 👋 Ici Inès, l'assistante IA de l'agence. Vous avez demandé la brochure de la résidence depuis Instagram : je vous l'envoie ici ?" },
    { from: "lead", time: "09:14", text: "Oui avec plaisir" },
    { from: "agent", time: "09:15", text: "Voilà ! Vous cherchez plutôt pour y vivre ou pour investir ?", file: "Brochure-residence.pdf" },
    { from: "lead", time: "09:15", text: "Pour investir, en location courte durée" },
    { from: "agent", time: "09:15", text: "Très bon choix sur ce secteur. Quel budget envisagez-vous ?" },
    { from: "lead", time: "09:16", text: "Autour de 250 000 €" },
    { from: "agent", time: "09:16", text: "Parfait, c'est pile la fourchette des T2. Votre financement est déjà validé ?" },
    { from: "lead", time: "09:17", text: "J'ai un accord de principe de ma banque" },
    { from: "agent", time: "09:17", text: "Super 🙌 Et vous visez un achat dans quel délai ?" },
    { from: "lead", time: "09:17", text: "D'ici 3 mois" },
    { from: "agent", time: "09:18", text: "Je vous propose un appel avec Yassine, notre conseiller : jeudi 11h ou vendredi 16h ?" },
    { from: "lead", time: "09:18", text: "Jeudi 11h" },
    { from: "agent", time: "09:18", text: "C'est réservé ✅ Vous recevez la confirmation par e-mail. À jeudi !" },
    { from: "system", text: "Lead qualifié · RDV dans l'agenda · CRM mis à jour" },
  ],
  en: [
    { from: "agent", time: "09:14", text: "Hi Karim 👋 This is Inès, the agency's AI assistant. You asked for the development brochure on Instagram — shall I send it here?" },
    { from: "lead", time: "09:14", text: "Yes please" },
    { from: "agent", time: "09:15", text: "Here you go! Are you looking to live there or to invest?", file: "Development-brochure.pdf" },
    { from: "lead", time: "09:15", text: "To invest, as a short-term rental" },
    { from: "agent", time: "09:15", text: "Great choice for this area. What budget do you have in mind?" },
    { from: "lead", time: "09:16", text: "Around €250,000" },
    { from: "agent", time: "09:16", text: "Perfect, that's right in the range of our one-bedroom flats. Is your financing already approved?" },
    { from: "lead", time: "09:17", text: "I have an agreement in principle from my bank" },
    { from: "agent", time: "09:17", text: "Brilliant 🙌 And when are you hoping to buy?" },
    { from: "lead", time: "09:17", text: "Within 3 months" },
    { from: "agent", time: "09:18", text: "Let me set up a call with Yassine, our adviser: Thursday 11am or Friday 4pm?" },
    { from: "lead", time: "09:18", text: "Thursday 11am" },
    { from: "agent", time: "09:18", text: "All booked ✅ You'll get a confirmation by email. See you Thursday!" },
    { from: "system", text: "Lead qualified · Appointment booked · CRM updated" },
  ],
};

const TYPING_MS = 1100;
const BETWEEN_MS = 650;
const RESTART_MS = 5000;

/**
 * An iPhone showing an AI agent qualifying a lead on WhatsApp. Messages are
 * typed out one by one while the phone is on screen, then the scene loops.
 */
export function WhatsAppChat({ className }: { className?: string }) {
  const locale = useLocale();
  const copy = COPY[locale];
  const SCRIPT = SCRIPTS[locale];
  const root = useRef<HTMLDivElement | null>(null);
  const [count, setCount] = useState(SCRIPT.length);
  const [typing, setTyping] = useState<"agent" | "lead" | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry?.isIntersecting ?? false), {
      threshold: 0.3,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || prefersReducedMotion()) {
      setCount(SCRIPT.length);
      setTyping(null);
      return;
    }
    let cancelled = false;
    const timers: number[] = [];
    const wait = (ms: number) =>
      new Promise<void>((resolve) => timers.push(window.setTimeout(resolve, ms)));

    const play = async () => {
      while (!cancelled) {
        setCount(0);
        for (let i = 0; i < SCRIPT.length && !cancelled; i++) {
          const m = SCRIPT[i]!;
          if (m.from !== "system") {
            setTyping(m.from);
            await wait(m.from === "agent" ? TYPING_MS : TYPING_MS * 0.7);
          }
          if (cancelled) return;
          setTyping(null);
          setCount(i + 1);
          await wait(BETWEEN_MS);
        }
        await wait(RESTART_MS);
      }
    };
    void play();
    return () => {
      cancelled = true;
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, [visible, SCRIPT]);

  const shown = SCRIPT.slice(0, count);

  return (
    <div ref={root} className={className}>
      <IPhone>
        <StatusBar />
        <div className="absolute inset-x-0 bottom-0 top-[13.4cqw] flex flex-col bg-[#0b141a]">
          {/* Chat header */}
          <div className="flex items-center gap-[2.6cqw] border-b border-white/5 bg-[#1f2c34] px-[3cqw] py-[2.4cqw] text-white">
            <ChevronLeft className="h-[5.5cqw] w-[5.5cqw] shrink-0 opacity-80" />
            <span className="grid h-[9cqw] w-[9cqw] shrink-0 place-items-center rounded-full bg-primary font-display text-[4cqw] font-semibold text-primary-foreground">
              A
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[3.8cqw] font-medium leading-tight">{copy.agency}</span>
              <span className="block text-[2.9cqw] leading-tight text-emerald-400">
                {typing === "agent" ? copy.typing : copy.online}
              </span>
            </span>
            <Video className="h-[5cqw] w-[5cqw] shrink-0 opacity-80" />
            <Phone className="h-[4.6cqw] w-[4.6cqw] shrink-0 opacity-80" />
          </div>

          {/* Messages, newest at the bottom; older ones slide out of view */}
          <div
            className="flex min-h-0 flex-1 flex-col justify-end gap-[1.6cqw] overflow-hidden px-[3cqw] pb-[2.5cqw] pt-[3cqw]"
            aria-live="polite"
          >
            <span className="mx-auto mb-[1cqw] shrink-0 rounded-full bg-[#1f2c34] px-[3cqw] py-[1cqw] text-[2.7cqw] uppercase tracking-wide text-white/60">
              {copy.today}
            </span>
            {shown.map((m, i) =>
              m.from === "system" ? (
                <div
                  key={i}
                  className="mx-auto mt-[1cqw] shrink-0 rounded-[2.5cqw] border border-primary/40 bg-primary/15 px-[3cqw] py-[1.8cqw] text-center text-[2.9cqw] font-medium leading-snug text-primary animate-in fade-in-0 zoom-in-95 duration-300"
                >
                  {m.text}
                </div>
              ) : (
                <div
                  key={i}
                  className={cn(
                    "max-w-[80%] shrink-0 rounded-[2.6cqw] px-[2.8cqw] pb-[1.4cqw] pt-[1.8cqw] text-[3.35cqw] leading-[1.35] text-white animate-in fade-in-0 slide-in-from-bottom-1 duration-300",
                    m.from === "agent" ? "self-start rounded-tl-none bg-[#1f2c34]" : "self-end rounded-tr-none bg-[#005c4b]",
                  )}
                >
                  {m.file ? (
                    <span className="mb-[1.6cqw] flex items-center gap-[2cqw] rounded-[1.8cqw] bg-black/25 px-[2.4cqw] py-[2cqw]">
                      <FileText className="h-[5cqw] w-[5cqw] shrink-0 text-primary" />
                      <span className="truncate text-[3cqw]">{m.file}</span>
                    </span>
                  ) : null}
                  {m.text}
                  <span className="ml-[2cqw] inline-flex translate-y-[0.6cqw] items-center gap-[0.6cqw] align-bottom text-[2.5cqw] text-white/50">
                    {m.time}
                    {m.from === "lead" ? <CheckCheck className="h-[3.2cqw] w-[3.2cqw] text-sky-400" /> : null}
                  </span>
                </div>
              ),
            )}
            {typing ? (
              <div
                className={cn(
                  "flex shrink-0 gap-[1.2cqw] rounded-[2.6cqw] px-[3cqw] py-[2.6cqw]",
                  typing === "agent" ? "self-start rounded-tl-none bg-[#1f2c34]" : "self-end rounded-tr-none bg-[#005c4b]",
                )}
                aria-label={copy.typingLabel}
              >
                {[0, 1, 2].map((d) => (
                  <span
                    key={d}
                    className="h-[1.6cqw] w-[1.6cqw] animate-bounce rounded-full bg-white/60"
                    style={{ animationDelay: `${d * 140}ms` }}
                  />
                ))}
              </div>
            ) : null}
          </div>

          {/* Input bar */}
          <div className="flex items-center gap-[2cqw] px-[2.5cqw] pb-[7cqw] pt-[1cqw]">
            <span className="flex flex-1 items-center gap-[2cqw] rounded-full bg-[#1f2c34] px-[3.5cqw] py-[2.4cqw] text-[3.2cqw] text-white/40">
              <Plus className="h-[4.4cqw] w-[4.4cqw] text-white/60" />
              Message
            </span>
            <span className="grid h-[9.5cqw] w-[9.5cqw] place-items-center rounded-full bg-[#00a884] text-[#0b141a]">
              <Mic className="h-[4.6cqw] w-[4.6cqw]" />
            </span>
          </div>
          <span className="absolute bottom-[2.2cqw] left-1/2 h-[1.3cqw] w-[30.5cqw] -translate-x-1/2 rounded-full bg-white" />
        </div>
      </IPhone>
    </div>
  );
}
