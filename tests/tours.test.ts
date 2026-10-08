// Unit tests of the 360° tours. Run with `bun test`.
import { describe, expect, test } from "bun:test";

import {
  TAU,
  clampPitch,
  groupTours,
  isEquirectangular,
  normalizeType,
  normalizeYaw,
  roomKey,
  roomNameFromFile,
  smallPanoramaPath,
  targetKey,
  thumbPanoramaPath,
  tourKeyForLot,
  unreachableRooms,
} from "../src/lib/tours";

const room = (id: string, order: number, target: { lot_id?: string; lot_type?: string }) => ({
  id,
  name: id,
  sort_order: order,
  lot_id: target.lot_id ?? null,
  lot_type: target.lot_type ?? null,
});

describe("panoramas", () => {
  test("format 2:1", () => {
    expect(isEquirectangular(8192, 4096)).toBe(true);
    expect(isEquirectangular(6000, 3000)).toBe(true);
    expect(isEquirectangular(5376, 2688)).toBe(true);
    expect(isEquirectangular(4000, 3000)).toBe(false);
    expect(isEquirectangular(12000, 3000)).toBe(false);
    expect(isEquirectangular(100, 0)).toBe(false);
  });

  test("fichiers des trois tailles", () => {
    const path = "org/prog/panoramas/abc.webp";
    expect(smallPanoramaPath(path)).toBe("org/prog/panoramas/abc-4096.webp");
    expect(thumbPanoramaPath(path)).toBe("org/prog/panoramas/abc-640.webp");
  });

  test("nom de la pièce d'après le fichier", () => {
    expect(roomNameFromFile("02_salon-sejour.jpg", "Pièce 1")).toBe("Salon sejour");
    expect(roomNameFromFile("Chambre parentale.png", "Pièce 1")).toBe("Chambre parentale");
    expect(roomNameFromFile("terrasse.JPG", "Pièce 1")).toBe("Terrasse");
    expect(roomNameFromFile("IMG_2041.jpg", "Pièce 3")).toBe("Pièce 3");
    expect(roomNameFromFile("panorama.jpg", "Pièce 2")).toBe("Pièce 2");
    expect(roomNameFromFile("0001.webp", "Pièce 4")).toBe("Pièce 4");
    expect(roomNameFromFile(`${"a".repeat(80)}.jpg`, "x")).toHaveLength(60);
  });

  test("positions acceptées par la base", () => {
    expect(normalizeYaw(-Math.PI / 2)).toBeCloseTo((3 * Math.PI) / 2, 4);
    expect(normalizeYaw(TAU + 1)).toBeCloseTo(1, 4);
    expect(normalizeYaw(TAU - 1e-7)).toBe(0);
    expect(normalizeYaw(0)).toBe(0);
    expect(clampPitch(2)).toBe(1.5707);
    expect(clampPitch(-2)).toBe(-1.5707);
    expect(clampPitch(0.123456789)).toBe(0.12346);
  });
});

describe("visites", () => {
  test("une visite par lot ou par type, sans tenir compte de la casse", () => {
    expect(normalizeType("  Villa   Type A ")).toBe("villa type a");
    expect(targetKey({ lotType: "Villa" })).toBe("type:villa");
    expect(targetKey({ lotId: "l1" })).toBe("lot:l1");
    expect(roomKey({ lot_id: null, lot_type: "VILLA" })).toBe("type:villa");

    const tours = groupTours([
      room("cuisine", 1, { lot_type: "Villa" }),
      room("salon", 0, { lot_type: "villa " }),
      room("suite", 0, { lot_id: "l7" }),
    ]);
    expect([...tours.keys()]).toEqual(["type:villa", "lot:l7"]);
    expect(tours.get("type:villa")?.map((r) => r.id)).toEqual(["salon", "cuisine"]);
  });

  test("visite montrée dans la fiche d'un lot", () => {
    const keys = new Set(["type:villa", "lot:l7"]);
    expect(tourKeyForLot({ id: "l7", type: "Villa" }, keys)).toBe("lot:l7");
    expect(tourKeyForLot({ id: "l1", type: " villa" }, keys)).toBe("type:villa");
    expect(tourKeyForLot({ id: "l2", type: "Appartement" }, keys)).toBeNull();
    expect(tourKeyForLot({ id: "l3", type: null }, keys)).toBeNull();
  });

  test("pièces qu'aucune flèche n'atteint depuis l'entrée", () => {
    const rooms = ["entree", "salon", "cuisine", "terrasse"].map((id, i) =>
      room(id, i, { lot_type: "Villa" }),
    );
    const links = [
      { from_id: "entree", to_id: "salon" },
      { from_id: "salon", to_id: "cuisine" },
      { from_id: "terrasse", to_id: "salon" },
      // An arrow to a room of another tour is ignored.
      { from_id: "cuisine", to_id: "ailleurs" },
    ];
    expect([...unreachableRooms(rooms, links)]).toEqual(["terrasse"]);
    expect(unreachableRooms(rooms.slice(0, 1), []).size).toBe(0);
    expect(unreachableRooms([], []).size).toBe(0);
  });
});
