// Unit tests of the visit requests: form checks, WhatsApp link, CSV export. Run with `bun test`.
import { describe, expect, test } from "bun:test";

import { leadsToCsv, whatsappDigits, whatsappReply, type Lead } from "../src/lib/app/leads";
import type { Lot } from "../src/lib/app/lot-fields";
import { checkVisit } from "../src/lib/public/visit";

const values = { nom: "Sara Benali", telephone: "+212 6 12 34 56 78", email: "", message: "" };

describe("formulaire de visite", () => {
  test("demande complète acceptée", () => {
    expect(checkVisit(values)).toEqual({});
    expect(checkVisit({ ...values, email: "sara@example.com", message: "Samedi matin" })).toEqual(
      {},
    );
    expect(checkVisit({ ...values, telephone: "06 12 34 56 78" })).toEqual({});
  });

  test("champs refusés", () => {
    expect(checkVisit({ ...values, nom: " " }).nom).toBeDefined();
    expect(checkVisit({ ...values, telephone: "" }).telephone).toBeDefined();
    expect(checkVisit({ ...values, telephone: "12 34" }).telephone).toBeDefined();
    expect(checkVisit({ ...values, telephone: "06 12 AB 56 78" }).telephone).toBeDefined();
    expect(checkVisit({ ...values, email: "sara@" }).email).toBeDefined();
    expect(checkVisit({ ...values, message: "x".repeat(2001) }).message).toBeDefined();
  });
});

const lead: Lead = {
  id: "l1",
  created_at: "2026-10-08T10:30:00Z",
  project_id: "p",
  lot_id: "lot7",
  nom: "Sara Benali",
  telephone: "+212 6 12 34 56 78",
  email: "sara@example.com",
  message: "Samedi; matin",
  source: "page",
  status: "nouveau",
  notified_at: null,
};
const lot = { id: "lot7", numero: "7", type: "Villa" } as Lot;

describe("réponse et export", () => {
  test("numéro WhatsApp international", () => {
    expect(whatsappDigits("+212 6 12 34 56 78")).toBe("212612345678");
    expect(whatsappDigits("0033 6 75 62 77 07")).toBe("33675627707");
  });

  test("message WhatsApp prérempli", () => {
    const url = whatsappReply(lead, lot, "Villas de démonstration");
    expect(url.startsWith("https://wa.me/212612345678?text=")).toBe(true);
    expect(decodeURIComponent(url.split("text=")[1] ?? "")).toBe(
      "Bonjour Sara Benali, suite à votre demande de visite du lot 7 (Villa) pour le programme Villas de démonstration, je vous propose d'en parler.",
    );
  });

  test("export CSV", () => {
    const rows = leadsToCsv(
      [lead, { ...lead, id: "l2", lot_id: null, email: null, status: "traite" }],
      [lot],
    );
    expect(rows[0]).toEqual([
      "date",
      "nom",
      "telephone",
      "email",
      "lot",
      "message",
      "source",
      "statut",
    ]);
    expect(rows[1]?.slice(1)).toEqual([
      "Sara Benali",
      "+212 6 12 34 56 78",
      "sara@example.com",
      "7",
      "Samedi; matin",
      "Page du programme",
      "Nouvelle",
    ]);
    expect(rows[2]?.slice(3, 5)).toEqual(["", ""]);
    expect(rows[2]?.[7]).toBe("Traitée");
  });
});
