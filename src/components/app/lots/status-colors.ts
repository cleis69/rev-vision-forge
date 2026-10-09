import type { LotStatus } from "@/lib/app/lot-fields";

/** Colour of each status, as on the plan. */
export const STATUS_BG: Record<LotStatus, string> = {
  disponible: "bg-emerald-400",
  reservee: "bg-amber-400",
  vendue: "bg-zinc-500",
};
