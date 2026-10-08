import {
  ArrowUpDown,
  Baby,
  Bike,
  Cctv,
  ConciergeBell,
  Dumbbell,
  Flag,
  Flower2,
  MapPinned,
  ShieldCheck,
  Snowflake,
  Sparkles,
  SquareParking,
  Sun,
  TreePalm,
  Trees,
  Utensils,
  Volleyball,
  Waves,
  Wifi,
  type LucideIcon,
} from "lucide-react";

/* Amenities of a residence (projects.amenities): a pictogram from this list
   and a label written by the promoter, shown as a row on the public page.
   The keys are stored: never rename one, add new ones instead. */

export type Amenity = { icon: string; label: string };

export const MAX_AMENITIES = 16;
export const MAX_AMENITY_LABEL = 60;

export const AMENITY_ICONS: readonly { key: string; label: string; Icon: LucideIcon }[] = [
  { key: "securite", label: "Résidence sécurisée", Icon: ShieldCheck },
  { key: "services", label: "Services et commodités", Icon: ConciergeBell },
  { key: "emplacement", label: "Emplacement stratégique", Icon: MapPinned },
  { key: "fitness", label: "Aire de fitness", Icon: Dumbbell },
  { key: "espaces-verts", label: "Espaces verts", Icon: Trees },
  { key: "jeux", label: "Aire de jeux", Icon: Baby },
  { key: "parking", label: "Parking invités", Icon: SquareParking },
  { key: "piscine", label: "Piscine", Icon: Waves },
  { key: "spa", label: "Spa", Icon: Flower2 },
  { key: "videosurveillance", label: "Vidéosurveillance", Icon: Cctv },
  { key: "ascenseur", label: "Ascenseur", Icon: ArrowUpDown },
  { key: "climatisation", label: "Climatisation", Icon: Snowflake },
  { key: "fibre", label: "Fibre optique", Icon: Wifi },
  { key: "restaurant", label: "Restaurant", Icon: Utensils },
  { key: "golf", label: "Golf", Icon: Flag },
  { key: "plage", label: "Plage", Icon: TreePalm },
  { key: "sport", label: "Terrain de sport", Icon: Volleyball },
  { key: "velo", label: "Pistes cyclables", Icon: Bike },
  { key: "terrasse", label: "Terrasse", Icon: Sun },
  { key: "autre", label: "Autre", Icon: Sparkles },
];

/** The pictogram of a key; a key this version does not know gets the generic one. */
export const amenityIcon = (key: string): LucideIcon =>
  AMENITY_ICONS.find((a) => a.key === key)?.Icon ?? Sparkles;

/** The amenities as stored, the invalid entries left out. */
export function parseAmenities(value: unknown): Amenity[] {
  if (!Array.isArray(value)) return [];
  return value
    .flatMap((a): Amenity[] => {
      if (!a || typeof a !== "object") return [];
      const { icon, label } = a as Record<string, unknown>;
      if (typeof icon !== "string" || typeof label !== "string" || !label.trim()) return [];
      return [{ icon, label: label.trim().slice(0, MAX_AMENITY_LABEL) }];
    })
    .slice(0, MAX_AMENITIES);
}
