/* Situation of a programme: address, position on the map, places nearby
   with the time to reach them (typed by the promoter), and the links that
   open the itinerary in Google Maps or Waze. Same limits as the database
   (public.is_valid_places). */

export const MAX_PLACES = 12;
export const PLACE_NAME_MAX = 80;
export const ADDRESS_MAX = 300;

export type PlaceMode = "voiture" | "pied";
export type Place = { name: string; minutes: number; mode: PlaceMode };
export type Position = { lat: number; lng: number };

export const MODE_LABELS: Record<PlaceMode, string> = {
  voiture: "en voiture",
  pied: "à pied",
};

/** Places saved in the database; anything malformed is left out. */
export function parsePlaces(value: unknown): Place[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((p) => {
    if (!p || typeof p !== "object") return [];
    const { name, minutes, mode } = p as Record<string, unknown>;
    if (typeof name !== "string" || !name.trim()) return [];
    if (typeof minutes !== "number" || !Number.isInteger(minutes) || minutes < 1) return [];
    if (mode !== "voiture" && mode !== "pied") return [];
    return [{ name: name.trim(), minutes, mode }];
  });
}

/** "15 min", "1 h", "1 h 20". */
export function duration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} h` : `${h} h ${String(m).padStart(2, "0")}`;
}

/** "15 min en voiture". */
export const placeTime = (place: Place) => `${duration(place.minutes)} ${MODE_LABELS[place.mode]}`;

/** Problem with a place being typed, or null when it can be saved. */
export function checkPlace(name: string, minutes: string): string | null {
  if (!name.trim()) return "Indiquez le nom du lieu.";
  if (name.trim().length > PLACE_NAME_MAX) return `${PLACE_NAME_MAX} caractères au maximum.`;
  const n = Number(minutes.replace(",", "."));
  if (!minutes.trim() || !Number.isInteger(n) || n < 1 || n > 600)
    return "Durée en minutes, de 1 à 600.";
  return null;
}

export const isPosition = (lat: unknown, lng: unknown): boolean =>
  typeof lat === "number" &&
  typeof lng === "number" &&
  Number.isFinite(lat) &&
  Number.isFinite(lng) &&
  Math.abs(lat) <= 90 &&
  Math.abs(lng) <= 180;

/** Six decimals: about 10 cm, more than enough for a building. */
export const roundCoord = (value: number) => Math.round(value * 1e6) / 1e6;

/** Itinerary to the programme: its position when known, otherwise its address. */
export function directions(target: { position: Position | null; address: string | null }) {
  if (target.position) {
    const { lat, lng } = target.position;
    return {
      google: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
      waze: `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`,
    };
  }
  if (target.address?.trim()) {
    const q = encodeURIComponent(target.address.trim());
    return {
      google: `https://www.google.com/maps/dir/?api=1&destination=${q}`,
      waze: `https://waze.com/ul?q=${q}&navigate=yes`,
    };
  }
  return null;
}
