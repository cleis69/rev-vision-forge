import bm from "@/assets/clients/bm.svg?url";
import citystar from "@/assets/clients/citystar.svg?url";
import emara from "@/assets/clients/emara.svg?url";
import marsCabin from "@/assets/clients/mars-cabin.svg?url";
import peninsula from "@/assets/clients/peninsula.svg?url";
import shah from "@/assets/clients/shah.svg?url";
import shams from "@/assets/clients/shams.svg?url";

/*
 * The developers REV has worked for, named on the site at the owner's request
 * (2026-11-17). No other client is named. Logos are one-colour vector tracings
 * of the files the clients supplied (Villa Peninsula: the logo on its own site;
 * BM Immobilier: the last frame of its logo film), drawn in the text colour so they sit together as one line.
 */

export type ClientId = "citystar" | "emara" | "shams" | "peninsula" | "shah" | "bm" | "mars-cabin";

export type Client = {
  id: ClientId;
  name: string;
  logo: string;
  /** Width / height of the logo's artwork. */
  ratio: number;
  /** Drawn height in px at full size, chosen so every logo carries the same weight. */
  height: number;
};

export const CLIENTS: Client[] = [
  { id: "citystar", name: "CITYSTAR Properties", logo: citystar, ratio: 543.19 / 96, height: 27 },
  { id: "emara", name: "Emara Estates", logo: emara, ratio: 1601.28 / 901.08, height: 40 },
  { id: "shams", name: "Shams Immo", logo: shams, ratio: 1744.25 / 439.57, height: 30 },
  { id: "peninsula", name: "Villa Peninsula", logo: peninsula, ratio: 1, height: 46 },
  { id: "shah", name: "Shah Immobilier", logo: shah, ratio: 1738.18 / 593.36, height: 33 },
  { id: "bm", name: "BM Immobilier", logo: bm, ratio: 1464.6 / 1316.23, height: 50 },
  { id: "mars-cabin", name: "Mars Cabin Morocco", logo: marsCabin, ratio: 2182.42 / 330.74, height: 22 },
];

export const clientName = (id: ClientId) => CLIENTS.find((c) => c.id === id)?.name ?? id;
