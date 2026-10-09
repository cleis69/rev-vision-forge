import type { MediaItem } from "@/lib/app/media";
import { translate } from "@/lib/translations";
import type { PublicData } from "./programme";

/**
 * The page in English: each text of the promoter that has an English version
 * (names of the programme and of the types stay as they are).
 */
export function localizeData(data: PublicData): PublicData {
  const map = data.programme.translations;
  if (Object.keys(map).length === 0) return data;
  const t = <T extends string | null | undefined>(text: T) => translate(map, text);
  const caption = (m: MediaItem): MediaItem =>
    m.meta.caption ? { ...m, meta: { ...m.meta, caption: t(m.meta.caption) } } : m;
  const { programme } = data;
  return {
    ...data,
    programme: {
      ...programme,
      description: t(programme.description),
      city: t(programme.city),
      amenities: programme.amenities.map((a) => ({ ...a, label: t(a.label) })),
      lotTypes: programme.lotTypes.map((n) => ({ ...n, description: t(n.description) })),
      places: programme.places.map((p) => ({ ...p, name: t(p.name) })),
    },
    lots: data.lots.map((l) => ({
      ...l,
      description: t(l.description),
      features: l.features.map((f) => t(f)),
    })),
    views: data.views.map((v) => ({ ...v, name: t(v.name) })),
    media: data.media.map(caption),
    plans: data.plans.map(caption),
    videos: data.videos.map(caption),
    documents: data.documents.map(caption),
    tours: data.tours.map((tour) => ({
      ...tour,
      rooms: tour.rooms.map((r) => ({ ...r, name: t(r.name) })),
    })),
  };
}
