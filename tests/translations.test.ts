// Unit tests of the English version of the public pages: the promoter's texts and the addresses. Run with `bun test`.
import { describe, expect, test } from "bun:test";

import type { MediaItem } from "../src/lib/app/media";
import { publicPathIn } from "../src/lib/public/i18n";
import { localizeData } from "../src/lib/public/localize";
import type { PublicData } from "../src/lib/public/programme";
import {
  parseTranslations,
  sourceTexts,
  translate,
  withTranslation,
} from "../src/lib/translations";

describe("traductions", () => {
  test("lecture : anglais seulement, textes vides ignorés", () => {
    expect(parseTranslations({ en: { Salon: "Living room", Cuisine: " " } })).toEqual({
      Salon: "Living room",
    });
    expect(parseTranslations(null)).toEqual({});
    expect(parseTranslations({ en: [] })).toEqual({});
  });

  test("traduction d'un texte, sinon le texte français", () => {
    const map = { Salon: "Living room" };
    expect(translate(map, "Salon")).toBe("Living room");
    expect(translate(map, " Salon ")).toBe("Living room");
    expect(translate(map, "Cuisine")).toBe("Cuisine");
    expect(translate(map, null)).toBeNull();
  });

  test("ajout, remplacement et suppression", () => {
    const map = { Salon: "Living room" };
    expect(withTranslation(map, "Cuisine", " Kitchen ")).toEqual({
      en: { Salon: "Living room", Cuisine: "Kitchen" },
    });
    expect(withTranslation(map, "Salon", "Lounge")).toEqual({ en: { Salon: "Lounge" } });
    expect(withTranslation(map, "Salon", "  ")).toEqual({ en: {} });
  });

  test("textes du promoteur à traduire, une fois chacun, dans l'ordre de la page", () => {
    const texts = sourceTexts({
      project: {
        description: "Résidence de 14 villas.",
        city: "Marrakech",
        amenities: [{ icon: "pool", label: "Piscine" }],
        lot_types: [{ name: "Villa A", description: "Plain-pied." }],
        places: [{ name: "Aéroport", minutes: 25, mode: "voiture" }],
      },
      lots: [{ description: "Vue dégagée", features: ["Piscine", "Jardin"] }],
      media: [
        { kind: "image", meta: { caption: "Façade" } },
        { kind: "orbit_frame", meta: { caption: "Image 1" } },
      ],
      views: [{ name: "Vue aérienne" }],
      rooms: [{ name: "Salon" }, { name: "Salon" }],
    });
    expect(texts.map((t) => `${t.group}:${t.text}`)).toEqual([
      "presentation:Résidence de 14 villas.",
      "presentation:Marrakech",
      "prestations:Piscine",
      "typologies:Plain-pied.",
      "situation:Aéroport",
      "vues:Vue aérienne",
      "visite:Salon",
      "lots:Vue dégagée",
      "lots:Jardin",
      "medias:Façade",
    ]);
  });
});

describe("page en anglais", () => {
  const photo = (caption: string) => ({ id: caption, meta: { caption } }) as unknown as MediaItem;
  const data = {
    programme: {
      name: "City Star",
      description: "Résidence",
      city: "Marrakech",
      amenities: [{ icon: "pool", label: "Piscine" }],
      lotTypes: [{ name: "Villa A", description: "Plain-pied." }],
      places: [{ name: "Aéroport", minutes: 25, mode: "voiture" }],
      translations: {
        Résidence: "Residence",
        Piscine: "Swimming pool",
        "Plain-pied.": "Single storey.",
        Aéroport: "Airport",
        Salon: "Living room",
        Façade: "Front",
        "Vue aérienne": "Aerial view",
      },
    },
    lots: [{ type: "Villa A", description: null, features: ["Piscine"] }],
    views: [{ name: "Vue aérienne" }],
    media: [photo("Façade"), photo("Cuisine")],
    plans: [],
    videos: [],
    documents: [],
    tours: [{ rooms: [{ name: "Salon" }] }],
  } as unknown as PublicData;

  test("les textes traduits passent en anglais, les noms et les autres restent", () => {
    const en = localizeData(data);
    expect(en.programme.name).toBe("City Star");
    expect(en.programme.description).toBe("Residence");
    expect(en.programme.city).toBe("Marrakech");
    expect(en.programme.amenities[0]?.label).toBe("Swimming pool");
    expect(en.programme.lotTypes[0]).toEqual({ name: "Villa A", description: "Single storey." });
    expect(en.programme.places[0]?.name).toBe("Airport");
    expect(en.lots[0]?.type).toBe("Villa A");
    expect(en.lots[0]?.features).toEqual(["Swimming pool"]);
    expect(en.views[0]?.name).toBe("Aerial view");
    expect(en.media.map((m) => m.meta.caption)).toEqual(["Front", "Cuisine"]);
    expect(en.tours[0]?.rooms[0]?.name).toBe("Living room");
  });

  test("sans traduction : les données telles quelles", () => {
    const fr = { ...data, programme: { ...data.programme, translations: {} } } as PublicData;
    expect(localizeData(fr)).toBe(fr);
  });

  test("adresses dans l'autre langue", () => {
    expect(publicPathIn("/p/city-star", "en")).toBe("/en/p/city-star");
    expect(publicPathIn("/en/p/city-star/lot/A1", "fr")).toBe("/p/city-star/lot/A1");
    expect(publicPathIn("/p/city-star/donnees-personnelles", "en")).toBe("/en/p/city-star/privacy");
    expect(publicPathIn("/en/p/city-star/privacy", "fr")).toBe("/p/city-star/donnees-personnelles");
    expect(publicPathIn("/en/p/city-star", "en")).toBe("/en/p/city-star");
  });
});
