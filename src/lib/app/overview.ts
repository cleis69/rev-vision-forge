import { lotTypeNames, noteOf, parseLotTypes, sameType } from "@/lib/lot-types";
import { parseAmenities } from "@/lib/amenities";
import { LOT_STATUSES, type Lot, type LotStatus } from "./lot-fields";
import type { Project } from "./projects";

/* Aperçu tab: where the sales stand, and what the public page still lacks.
   The essential checks are also those of the Partage tab before publishing. */

const byStatus = (value: () => number) =>
  Object.fromEntries(LOT_STATUSES.map((s) => [s, value()])) as Record<LotStatus, number>;

export type SalesLine = { total: number; counts: Record<LotStatus, number> };
export type SalesSummary = SalesLine & {
  /** Sum of the prices by status, and how many lots of each status have none. */
  value: Record<LotStatus, number>;
  unpriced: Record<LotStatus, number>;
  /** By type of lot, in the order of the Typologies section; lots without a type last. */
  byType: (SalesLine & { type: string | null })[];
};

export function salesSummary(
  lots: readonly Pick<Lot, "type" | "prix" | "statut">[],
  lotTypes: unknown,
): SalesSummary {
  const counts = byStatus(() => 0);
  const value = byStatus(() => 0);
  const unpriced = byStatus(() => 0);
  for (const lot of lots) {
    counts[lot.statut]++;
    if (lot.prix == null) unpriced[lot.statut]++;
    else value[lot.statut] += lot.prix;
  }
  const types: (string | null)[] = lotTypeNames(lots, parseLotTypes(lotTypes));
  if (lots.some((l) => !l.type?.trim())) types.push(null);
  const byType = types.map((type) => {
    const line: SalesLine & { type: string | null } = { type, total: 0, counts: byStatus(() => 0) };
    for (const lot of lots) {
      if (type === null ? !lot.type?.trim() : sameType(lot.type, type)) {
        line.total++;
        line.counts[lot.statut]++;
      }
    }
    return line;
  });
  return { total: lots.length, counts, value, unpriced, byType };
}

/** Share of the lots, in whole percent (0 without lots). */
export const percentOf = (part: number, total: number) =>
  total === 0 ? 0 : Math.round((part / total) * 100);

export type CheckTab = "plan" | "lots" | "typologies" | "medias" | "visite" | "reglages";
export type PageCheck = {
  key: string;
  ok: boolean;
  label: string;
  /** The tab where it is filled in. */
  tab: CheckTab;
  /** Needed for a sales plan worth publishing (listed in the Partage tab). */
  essential: boolean;
};

const plural = (n: number, one: string, many: string) => `${n} ${n > 1 ? many : one}`;

export function pageChecks({
  project,
  lots,
  orbits,
  views,
  markers,
  media,
  rooms,
}: {
  project: Pick<
    Project,
    "description" | "contact_phone" | "latitude" | "amenities" | "lot_types" | "show_prices"
  >;
  lots: readonly Pick<Lot, "id" | "type" | "prix">[];
  /** Orbital sequences, one per view. */
  orbits: readonly { frames: readonly unknown[]; colors: readonly { lot_id: string | null }[] }[];
  views: readonly { panorama_path: string | null }[];
  markers: readonly { lot_id: string }[];
  media: readonly { kind: string; lot_type: string | null }[];
  /** Rooms of the 360° tours. */
  rooms: number;
}): PageCheck[] {
  const sequences = orbits.filter((o) => o.frames.length > 0);
  const ready = sequences.length + views.filter((v) => v.panorama_path).length;
  const placed = new Set([
    ...sequences.flatMap((o) => o.colors.flatMap((c) => c.lot_id ?? [])),
    ...markers.map((m) => m.lot_id),
  ]);
  const count = lots.length;
  const traced = lots.filter((l) => placed.has(l.id)).length;
  const priced = lots.filter((l) => l.prix != null).length;
  const photos = media.filter((m) => m.kind === "image").length;
  const notes = parseLotTypes(project.lot_types);
  const types = lotTypeNames(lots, notes);
  const shown = types.filter(
    (t) => noteOf(notes, t).trim() || media.some((m) => sameType(m.lot_type, t)),
  ).length;
  const amenities = parseAmenities(project.amenities).length;

  const checks: PageCheck[] = [
    {
      key: "views",
      ok: ready > 0,
      label:
        ready > 0
          ? ready > 1
            ? `${ready} vues prêtes`
            : "Une vue prête"
          : "Une vue avec sa séquence orbitale ou son panorama 360°",
      tab: "plan",
      essential: true,
    },
    {
      key: "lots",
      ok: count > 0,
      label: count > 0 ? plural(count, "lot créé", "lots créés") : "Lots créés",
      tab: "lots",
      essential: true,
    },
    {
      key: "traced",
      ok: count > 0 && traced === count,
      label:
        count > 0
          ? `${traced} / ${count} lots repérés sur au moins une vue`
          : "Lots repérés sur une vue",
      tab: "plan",
      essential: true,
    },
    // A lot without a price reads « Prix sur demande »: a choice when no lot
    // has one, more likely an oversight when only some do.
    !project.show_prices
      ? {
          key: "prices",
          ok: true,
          label: "Prix masqués sur la page",
          tab: "reglages",
          essential: false,
        }
      : priced === 0 && count > 0
        ? { key: "prices", ok: true, label: "Prix sur demande", tab: "lots", essential: false }
        : {
            key: "prices",
            ok: count > 0 && priced === count,
            label:
              count === 0
                ? "Prix des lots"
                : priced === count
                  ? plural(count, "lot avec son prix", "lots avec leur prix")
                  : `${priced} / ${count} lots avec leur prix`,
            tab: "lots",
            essential: false,
          },
    {
      key: "photos",
      ok: photos > 0,
      label: photos > 0 ? plural(photos, "photo", "photos") : "Photos",
      tab: "medias",
      essential: false,
    },
    ...(types.length > 0
      ? [
          {
            key: "types",
            ok: shown === types.length,
            label: `${shown} / ${types.length} typologies présentées`,
            tab: "typologies" as const,
            essential: false,
          },
        ]
      : []),
    {
      key: "tour",
      ok: rooms > 0,
      label: rooms > 0 ? `Visite 360° (${plural(rooms, "pièce", "pièces")})` : "Visite 360°",
      tab: "visite",
      essential: false,
    },
    {
      key: "description",
      ok: Boolean(project.description?.trim()),
      label: "Présentation du programme",
      tab: "reglages",
      essential: false,
    },
    {
      key: "amenities",
      ok: amenities > 0,
      label: amenities > 0 ? plural(amenities, "prestation", "prestations") : "Prestations",
      tab: "reglages",
      essential: false,
    },
    {
      key: "phone",
      ok: Boolean(project.contact_phone?.trim()),
      label: "Téléphone du promoteur",
      tab: "reglages",
      essential: false,
    },
    {
      key: "location",
      ok: project.latitude != null,
      label: "Situation sur la carte",
      tab: "reglages",
      essential: false,
    },
  ];
  return checks;
}

const relative = new Intl.RelativeTimeFormat("fr-FR", { numeric: "auto" });
const shortDate = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" });

/** "il y a 5 minutes", "hier", then the date after a week. */
export function timeAgo(iso: string, now = Date.now()): string {
  const minutes = Math.round((new Date(iso).getTime() - now) / 60_000);
  if (minutes > -1) return "à l'instant";
  if (minutes > -60) return relative.format(minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (hours > -24) return relative.format(hours, "hour");
  const days = Math.round(hours / 24);
  if (days > -7) return relative.format(days, "day");
  return shortDate.format(new Date(iso));
}
