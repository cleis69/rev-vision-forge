import type { Position } from "@/lib/location";

/* Address search of the Situation settings, with Nominatim (OpenStreetMap).
   Its rules: light use only, never more than one search per second, which a
   button pressed by the promoter respects. */

export type Found = { label: string; position: Position };

export class GeocodeError extends Error {}

export async function searchAddress(query: string, signal?: AbortSignal): Promise<Found[]> {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "5");
  url.searchParams.set("accept-language", "fr");
  url.searchParams.set("q", query);
  let res: Response;
  try {
    res = await fetch(url, { signal: signal ?? null, headers: { Accept: "application/json" } });
  } catch (error) {
    if ((error as Error).name === "AbortError") throw error;
    throw new GeocodeError("Recherche impossible : vérifiez votre connexion internet.");
  }
  if (!res.ok) {
    throw new GeocodeError(
      res.status === 429
        ? "Trop de recherches d'un coup : réessayez dans quelques secondes."
        : "La recherche d'adresse ne répond pas. Placez l'épingle à la main sur la carte.",
    );
  }
  const rows = (await res.json()) as { lat?: string; lon?: string; display_name?: string }[];
  return rows.flatMap((r) => {
    const lat = Number(r.lat);
    const lng = Number(r.lon);
    return Number.isFinite(lat) && Number.isFinite(lng) && r.display_name
      ? [{ label: r.display_name, position: { lat, lng } }]
      : [];
  });
}
