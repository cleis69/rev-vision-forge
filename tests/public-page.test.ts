// Unit tests of the public page: live messages, comparison, link previews. Run with `bun test`.
import { describe, expect, test } from "bun:test";

import { escapeHtml, metaTags, previewMeta } from "../deploy/og.js";
import {
  bestPricePerSqm,
  featureRows,
  pricePerSqm,
  toggleCompared,
} from "../src/lib/public/compare";
import { liveMessages, type LotSignal } from "../src/lib/public/live";
import type { PublicLot } from "../src/lib/public/programme";

const lot = (numero: string, extra: Partial<PublicLot> = {}): PublicLot => ({
  id: `id-${numero}`,
  numero,
  type: "Villa",
  surface_habitable: 250,
  surface_terrain: 600,
  chambres: 4,
  prix: 1000000,
  statut: "disponible",
  description: null,
  features: [],
  ...extra,
});

const signal = (
  numero: string,
  avant: LotSignal["avant"],
  statut: LotSignal["statut"],
): LotSignal => ({
  lot_id: `id-${numero}`,
  numero,
  op: "UPDATE",
  avant,
  statut,
});

describe("messages en direct", () => {
  test("un message par changement de statut", () => {
    expect(liveMessages([signal("5", "disponible", "reservee")])).toEqual([
      "Le lot 5 vient d'être réservé.",
    ]);
    expect(liveMessages([signal("7", "reservee", "vendue")])).toEqual([
      "Le lot 7 vient d'être vendu.",
    ]);
    expect(liveMessages([signal("2", "reservee", "disponible")])).toEqual([
      "Le lot 2 est de nouveau disponible.",
    ]);
  });

  test("changement annulé, prix modifié, ajout : pas de message", () => {
    expect(
      liveMessages([signal("2", "disponible", "reservee"), signal("2", "reservee", "disponible")]),
    ).toEqual([]);
    expect(liveMessages([signal("3", "disponible", "disponible")])).toEqual([]);
    expect(liveMessages([{ ...signal("4", null, "disponible"), op: "INSERT" }])).toEqual([]);
  });

  test("résumé quand beaucoup de lots changent", () => {
    const many = ["1", "2", "3", "4", "5"].map((n) => signal(n, "disponible", "vendue"));
    expect(liveMessages(many)).toEqual(["Les statuts de 5 lots viennent d'être mis à jour."]);
  });
});

describe("comparateur", () => {
  test("prix au m² et meilleur prix", () => {
    const a = lot("1", { prix: 1000000, surface_habitable: 250 });
    const b = lot("2", { prix: 1200000, surface_habitable: 320 });
    expect(pricePerSqm(a)).toBe(4000);
    expect(pricePerSqm(b)).toBe(3750);
    expect(pricePerSqm(lot("3", { statut: "vendue" }))).toBeNull();
    expect(pricePerSqm(lot("4", { prix: null }))).toBeNull();
    expect(bestPricePerSqm([a, b])).toBe("id-2");
    expect(bestPricePerSqm([a])).toBeNull();
    expect(bestPricePerSqm([a, lot("5")])).toBeNull(); // tie
  });

  test("caractéristiques réunies", () => {
    const rows = featureRows([
      lot("1", { features: ["Piscine privée", "Ascenseur"] }),
      lot("2", { features: ["ascenseur", "Rooftop"] }),
    ]);
    expect(rows).toEqual([
      { feature: "Piscine privée", has: [true, false] },
      { feature: "Ascenseur", has: [true, true] },
      { feature: "Rooftop", has: [false, true] },
    ]);
  });

  test("trois lots au maximum", () => {
    expect(toggleCompared([], "a")).toEqual(["a"]);
    expect(toggleCompared(["a", "b"], "a")).toEqual(["b"]);
    expect(toggleCompared(["a", "b", "c"], "d")).toBeNull();
  });
});

describe("aperçus de lien", () => {
  const programme = {
    name: "Villas de démonstration",
    city: "Marrakech",
    description:
      "Quatorze villas contemporaines R+1 avec ascenseur, piscine privée et jardin paysager.",
    currency: "EUR",
    organization_name: "REV",
  };

  test("lot avec prix", () => {
    const meta = previewMeta({
      programme,
      lot: {
        numero: "7",
        type: "Villa",
        statut: "disponible",
        prix: 1380000,
        surface_habitable: 312,
        chambres: 5,
      },
      image: "https://x/img.webp",
      url: "https://site/p/demo/lot/7",
    });
    expect(meta.title).toBe("Lot 7 · Villa — Villas de démonstration");
    expect(meta.description.replace(/\s/g, " ")).toBe(
      "Disponible · 1 380 000 € · 312 m² · 5 chambres · Marrakech",
    );
  });

  test("lot vendu, prix masqué", () => {
    const sold = previewMeta({
      programme,
      lot: { numero: "5", statut: "vendue", prix: 1, surface_habitable: null, chambres: null },
      image: null,
      url: "u",
    });
    expect(sold.description).toBe("Vendu · Marrakech");
    const hidden = previewMeta({
      programme,
      lot: { numero: "2", statut: "reservee", prix: null, surface_habitable: null, chambres: 1 },
      image: null,
      url: "u",
    });
    expect(hidden.description).toBe("Réservé · Prix sur demande · 1 chambre · Marrakech");
  });

  test("programme et balises échappées", () => {
    const meta = previewMeta({ programme, lot: null, image: null, url: "https://site/p/demo" });
    expect(meta.title).toBe("Villas de démonstration — REV");
    expect(meta.description).toContain("Quatorze villas");
    const tags = metaTags({ ...meta, title: 'Villa "Rose" <b>' });
    expect(tags).toContain('content="Villa &quot;Rose&quot; &lt;b&gt;"');
    expect(tags).not.toContain("og:image");
    expect(escapeHtml("a & b")).toBe("a &amp; b");
  });
});
