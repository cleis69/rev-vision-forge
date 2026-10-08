// Unit tests of the Situation section: places, durations, itinerary links. Run with `bun test`.
import { describe, expect, test } from "bun:test";

import {
  checkPlace,
  directions,
  duration,
  isPosition,
  parsePlaces,
  placeTime,
  roundCoord,
} from "../src/lib/location";

describe("lieux proches", () => {
  test("lecture de la base", () => {
    expect(
      parsePlaces([
        { name: " Aéroport Marrakech-Ménara ", minutes: 15, mode: "voiture" },
        { name: "Golf", minutes: 5, mode: "pied" },
        { name: "", minutes: 5, mode: "pied" },
        { name: "Plage", minutes: 2.5, mode: "voiture" },
        { name: "Gare", minutes: 10, mode: "avion" },
        "texte",
      ]),
    ).toEqual([
      { name: "Aéroport Marrakech-Ménara", minutes: 15, mode: "voiture" },
      { name: "Golf", minutes: 5, mode: "pied" },
    ]);
    expect(parsePlaces(null)).toEqual([]);
    expect(parsePlaces({ name: "x" })).toEqual([]);
  });

  test("durées", () => {
    expect(duration(15)).toBe("15 min");
    expect(duration(60)).toBe("1 h");
    expect(duration(80)).toBe("1 h 20");
    expect(duration(125)).toBe("2 h 05");
    expect(placeTime({ name: "Golf", minutes: 5, mode: "pied" })).toBe("5 min à pied");
    expect(placeTime({ name: "Aéroport", minutes: 15, mode: "voiture" })).toBe("15 min en voiture");
  });

  test("saisie", () => {
    expect(checkPlace("Aéroport", "15")).toBeNull();
    expect(checkPlace(" ", "15")).not.toBeNull();
    expect(checkPlace("x".repeat(81), "15")).not.toBeNull();
    expect(checkPlace("Golf", "")).not.toBeNull();
    expect(checkPlace("Golf", "0")).not.toBeNull();
    expect(checkPlace("Golf", "2,5")).not.toBeNull();
    expect(checkPlace("Golf", "601")).not.toBeNull();
  });
});

describe("position et itinéraire", () => {
  test("position valide", () => {
    expect(isPosition(31.62, -7.99)).toBe(true);
    expect(isPosition(null, -7.99)).toBe(false);
    expect(isPosition(95, 0)).toBe(false);
    expect(isPosition(Number.NaN, 0)).toBe(false);
    expect(roundCoord(31.6295123456)).toBe(31.629512);
  });

  test("liens Google Maps et Waze", () => {
    expect(directions({ position: { lat: 31.58, lng: -7.95 }, address: "ignorée" })).toEqual({
      google: "https://www.google.com/maps/dir/?api=1&destination=31.58,-7.95",
      waze: "https://waze.com/ul?ll=31.58,-7.95&navigate=yes",
    });
    expect(directions({ position: null, address: "Route de l'Ourika, Marrakech" })).toEqual({
      google:
        "https://www.google.com/maps/dir/?api=1&destination=Route%20de%20l'Ourika%2C%20Marrakech",
      waze: "https://waze.com/ul?q=Route%20de%20l'Ourika%2C%20Marrakech&navigate=yes",
    });
    expect(directions({ position: null, address: " " })).toBeNull();
  });
});
