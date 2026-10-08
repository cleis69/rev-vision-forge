import { amenityIcon, type Amenity } from "@/lib/amenities";
import { cn } from "@/lib/utils";

/** Amenities of the residence, as pictograms (public page and presentation). */
export function Amenities({ items, large = false }: { items: Amenity[]; large?: boolean }) {
  return (
    <ul
      className={cn(
        "grid gap-3",
        large ? "grid-cols-3 lg:grid-cols-4" : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
      )}
    >
      {items.map((a, i) => {
        const Icon = amenityIcon(a.icon);
        return (
          <li
            key={`${a.icon}-${i}`}
            className={cn(
              "flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03]",
              large ? "p-5" : "p-4",
            )}
          >
            <span
              className={cn(
                "grid shrink-0 place-items-center rounded-xl bg-[color:var(--brand)]/12 text-[color:var(--brand)]",
                large ? "size-12" : "size-10",
              )}
              aria-hidden
            >
              <Icon className={large ? "size-6" : "size-5"} />
            </span>
            <span className={cn("leading-snug text-white/85", large ? "text-base" : "text-sm")}>
              {a.label}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
