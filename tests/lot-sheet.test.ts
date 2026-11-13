// Unit tests of the lot sheet that sells: how to pay, the rental yield, the lots offered instead of a taken one. Run with `bun test`.
import { describe, expect, test } from "bun:test";

import {
  PAYMENT_TEMPLATE,
  parsePaymentPlan,
  parseRental,
  planTotal,
  stepAmounts,
} from "../src/lib/payment-plan";
import { similarLots } from "../src/lib/public/lot-list";
import type { PublicLot } from "../src/lib/public/programme";
import { rentalYield } from "../src/lib/public/rental";
import { sourceTexts } from "../src/lib/translations";

const lot = (numero: string, more: Partial<PublicLot> = {}): PublicLot => ({
  id: `id-${numero}`,
  numero,
  type: "Villa A",
  surface_habitable: null,
  surface_terrain: null,
  chambres: null,
  salles_de_bain: null,
  prix: null,
  statut: "disponible",
  description: null,
  features: [],
  niveau: null,
  ...more,
});

describe("payment plan", () => {
  test("keeps the valid steps only", () => {
    expect(
      parsePaymentPlan([
        { label: " À la réservation ", percent: 30 },
        { label: "", percent: 10 },
        { label: "Rien", percent: 0 },
        { label: "Trop", percent: 120 },
        { label: "Texte", percent: "20" },
        "étape",
        { label: "Remise des clés", percent: 70 },
      ]),
    ).toEqual([
      { label: "À la réservation", percent: 30 },
      { label: "Remise des clés", percent: 70 },
    ]);
    expect(parsePaymentPlan(null)).toEqual([]);
    expect(parsePaymentPlan({})).toEqual([]);
  });

  test("the template makes 100 %", () => {
    expect(planTotal(PAYMENT_TEMPLATE)).toBe(100);
  });

  test("amounts add up to the price when the plan makes 100 %", () => {
    const plan = [
      { label: "a", percent: 33.33 },
      { label: "b", percent: 33.33 },
      { label: "c", percent: 33.34 },
    ];
    const amounts = stepAmounts(1_000_001, plan);
    expect(amounts.reduce((s, a) => s + a, 0)).toBe(1_000_001);
    expect(stepAmounts(8_000_000, PAYMENT_TEMPLATE)).toEqual([
      2_400_000, 1_600_000, 1_600_000, 1_600_000, 800_000,
    ]);
  });

  test("an incomplete plan is not stretched to the price", () => {
    expect(stepAmounts(1_000_000, [{ label: "a", percent: 30 }])).toEqual([300_000]);
  });
});

describe("rental", () => {
  test("parses the promoter's starting values", () => {
    expect(parseRental({ nightly: 3500, occupancy: 60, charges: 25 })).toEqual({
      nightly: 3500,
      occupancy: 60,
      charges: 25,
    });
    expect(parseRental({ nightly: -1, occupancy: 140, charges: 95 })).toEqual({
      nightly: null,
      occupancy: null,
      charges: null,
    });
    expect(parseRental(null)).toEqual({ nightly: null, occupancy: null, charges: null });
  });

  test("yield of a lot let half the year", () => {
    const r = rentalYield({ price: 1_000_000, nightly: 1000, occupancy: 50, charges: 30 });
    expect(r.nights).toBe(183);
    expect(r.gross).toBe(183_000);
    expect(r.net).toBeCloseTo(128_100);
    expect(r.grossYield).toBe(18.3);
    expect(r.netYield).toBe(12.8);
  });

  test("no price, no yield; values kept within bounds", () => {
    expect(rentalYield({ price: 0, nightly: 1000, occupancy: 50, charges: 0 }).netYield).toBe(0);
    const r = rentalYield({ price: 100_000, nightly: 100, occupancy: 150, charges: -5 });
    expect(r.nights).toBe(365);
    expect(r.net).toBe(r.gross);
  });
});

describe("similar lots", () => {
  const taken = lot("A1", { statut: "reservee", prix: 1_000_000, surface_habitable: 100 });
  const lots = [
    taken,
    lot("A2", { prix: 1_400_000, surface_habitable: 120 }),
    lot("A3", { prix: 1_050_000, surface_habitable: 90 }),
    lot("A4", { statut: "vendue", prix: 1_000_000 }),
    lot("B1", { type: "Villa B", prix: 1_000_000, surface_habitable: 100 }),
    lot("A5", { prix: 1_050_000, surface_habitable: 101 }),
  ];

  test("available lots of the same type first, nearest price then area", () => {
    expect(similarLots(lots, taken).map((l) => l.numero)).toEqual(["A5", "A3", "A2"]);
  });

  test("another type when the same type runs out; never the lot itself or a taken one", () => {
    expect(similarLots(lots, taken, 5).map((l) => l.numero)).toEqual(["A5", "A3", "A2", "B1"]);
  });
});

test("the payment texts are offered for translation", () => {
  const texts = sourceTexts({
    project: {
      description: null,
      city: null,
      amenities: [],
      lot_types: [],
      places: [],
      payment_plan: [{ label: "À la réservation", percent: 30 }],
      payment_note: "Selon l'avancement des travaux.",
    },
    lots: [],
    media: [],
    views: [],
    rooms: [],
  });
  expect(texts).toEqual([
    { text: "À la réservation", group: "paiement" },
    { text: "Selon l'avancement des travaux.", group: "paiement" },
  ]);
});
