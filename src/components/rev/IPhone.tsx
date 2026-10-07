import type { ReactNode } from "react";
import { Clapperboard, House, Search, SquarePlus, UserRound } from "lucide-react";

import { cn } from "@/lib/utils";

/*
 * iPhone 16 Pro, Desert Titanium. Proportions follow the real device
 * (71.5 × 149.6 mm body, 1.15 mm bezels, 19.5:9 screen); every measurement is
 * in cqw so the phone stays exact at any size.
 *
 * The screen is laid out like a short-video app: status bar on top, the 9:16
 * video in full (nothing cropped), the tab bar and home indicator below.
 */

const TITANIUM =
  "linear-gradient(135deg,#4b443d 0%,#b9a690 14%,#857565 28%,#e2d3c1 46%,#8d7d6d 62%,#c4b19b 80%,#4f4740 100%)";
const BUTTON = "linear-gradient(90deg,#5e554b,#cdbaa5 45%,#8b7b6b 70%,#5e554b)";

export function IPhone({
  children,
  className,
}: {
  children: ReactNode;
  className?: string | undefined;
}) {
  return (
    <div
      className={cn(
        "relative aspect-[71.5/149.6] [container-type:inline-size] drop-shadow-[0_45px_60px_rgba(0,0,0,0.75)]",
        className,
      )}
    >
      {/* Action button, volume up / down (left) — side button, camera control (right) */}
      <Btn side="left" top="18.6%" height="3.9%" />
      <Btn side="left" top="25.2%" height="6.9%" />
      <Btn side="left" top="33.6%" height="6.9%" />
      <Btn side="right" top="27%" height="10.6%" />
      <Btn side="right" top="47.5%" height="5.6%" flush />

      <div
        className="absolute inset-0 rounded-[16.6cqw] p-[1.15cqw] shadow-[inset_0_0_0_0.25cqw_rgba(255,255,255,0.22),inset_0_0_0_0.6cqw_rgba(0,0,0,0.25)]"
        style={{ background: TITANIUM }}
      >
        <div className="h-full w-full rounded-[15.45cqw] bg-black p-[2.9cqw] shadow-[inset_0_0_0_0.3cqw_#1b1b1b]">
          <div className="relative h-full w-full overflow-hidden rounded-[12.6cqw] bg-black">
            {children}
            {/* Dynamic Island */}
            <div className="absolute left-1/2 top-[2.6cqw] z-30 h-[8.4cqw] w-[28.6cqw] -translate-x-1/2 rounded-full bg-black">
              <span className="absolute right-[3.2cqw] top-1/2 h-[2.6cqw] w-[2.6cqw] -translate-y-1/2 rounded-full bg-[#0b1220] shadow-[inset_0_0_0_0.5cqw_#111827]" />
            </div>
            {/* Glass reflection */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 z-40 bg-[linear-gradient(118deg,rgba(255,255,255,0.10)_0%,rgba(255,255,255,0.03)_22%,transparent_38%)]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Btn({
  side,
  top,
  height,
  flush = false,
}: {
  side: "left" | "right";
  top: string;
  height: string;
  flush?: boolean;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "absolute w-[1.3cqw]",
        side === "left" ? "left-[-0.95cqw] rounded-l-[0.8cqw]" : "right-[-0.95cqw] rounded-r-[0.8cqw]",
        flush && (side === "left" ? "left-[-0.5cqw]" : "right-[-0.5cqw]"),
      )}
      style={{ top, height, background: BUTTON }}
    />
  );
}

/** Status bar (9:41, signal, Wi-Fi, battery), sized for the iPhone screen. */
export function StatusBar() {
  return (
    <div className="absolute inset-x-0 top-0 z-20 flex h-[13.4cqw] items-center justify-between px-[8.4cqw] pt-[0.6cqw] text-white">
      <span className="w-[16cqw] text-center text-[3.9cqw] font-semibold tracking-[-0.01em]">
        9:41
      </span>
      <span className="flex items-center gap-[1.3cqw]">
        <svg viewBox="0 0 18 12" className="h-[2.8cqw] w-auto" fill="currentColor" aria-hidden>
          <rect x="0" y="8" width="3" height="4" rx="0.8" />
          <rect x="5" y="5.5" width="3" height="6.5" rx="0.8" />
          <rect x="10" y="3" width="3" height="9" rx="0.8" />
          <rect x="15" y="0" width="3" height="12" rx="0.8" />
        </svg>
        <svg viewBox="0 0 16 12" className="h-[2.8cqw] w-auto" fill="currentColor" aria-hidden>
          <path d="M8 2.4c2.3 0 4.4.9 6 2.4l1.3-1.4A10.2 10.2 0 0 0 8 .5 10.2 10.2 0 0 0 .7 3.4L2 4.8a8.3 8.3 0 0 1 6-2.4Z" />
          <path d="M8 6.1c1.3 0 2.5.5 3.4 1.3l1.3-1.4A6.7 6.7 0 0 0 8 4.2 6.7 6.7 0 0 0 3.3 6l1.3 1.4C5.5 6.6 6.7 6.1 8 6.1Z" />
          <path d="M8 9.6 10.1 7.4A3 3 0 0 0 8 6.6a3 3 0 0 0-2.1.8L8 9.6Z" transform="translate(0 1.6)" />
        </svg>
        <svg viewBox="0 0 27 13" className="h-[2.9cqw] w-auto" aria-hidden>
          <rect x="0.5" y="0.5" width="23" height="12" rx="3.6" fill="none" stroke="currentColor" strokeOpacity="0.4" />
          <rect x="2" y="2" width="20" height="9" rx="2.2" fill="currentColor" />
          <path d="M25 4.3v4.4c.9-.3 1.5-1.2 1.5-2.2s-.6-1.9-1.5-2.2Z" fill="currentColor" fillOpacity="0.45" />
        </svg>
      </span>
    </div>
  );
}

/** Generic short-video app tab bar with the home indicator. */
export function TabBar() {
  const icons = [House, Search, SquarePlus, Clapperboard, UserRound];
  return (
    <div className="absolute inset-x-0 bottom-0 z-20 h-[24.6cqw] bg-black">
      <div className="flex items-center justify-around px-[4cqw] pt-[3.2cqw] text-white">
        {icons.map((Icon, i) => (
          <Icon
            key={i}
            aria-hidden
            strokeWidth={i === 3 ? 2.4 : 1.8}
            className={cn("h-[6.4cqw] w-[6.4cqw]", i === 3 ? "opacity-100" : "opacity-70")}
          />
        ))}
      </div>
      <span className="absolute bottom-[2.2cqw] left-1/2 h-[1.3cqw] w-[30.5cqw] -translate-x-1/2 rounded-full bg-white" />
    </div>
  );
}

/** Area between the status bar and the tab bar: exactly 9:16 for full-frame video. */
export const SCREEN_VIDEO_AREA = "absolute inset-x-0 top-[13.4cqw] bottom-[24.6cqw]";
