/* Rental yield of a lot, for a buyer who invests: rent per night, how many
   nights a year it is let, and what charges take (management, upkeep,
   taxes…), against the price. An estimate, said as such on the page. */

export const DEFAULT_OCCUPANCY = 55;
export const DEFAULT_CHARGES = 30;

export type RentalInput = {
  price: number;
  /** Rent per night, in the programme's currency. */
  nightly: number;
  /** Share of the year let, in %. */
  occupancy: number;
  /** Share of the rents taken by charges, in %. */
  charges: number;
};

export type RentalResult = {
  nights: number;
  /** Rents of a year, before charges. */
  gross: number;
  /** After charges. */
  net: number;
  /** In %, of the price. */
  grossYield: number;
  netYield: number;
};

export function rentalYield({ price, nightly, occupancy, charges }: RentalInput): RentalResult {
  const nights = Math.round((365 * Math.min(100, Math.max(0, occupancy))) / 100);
  const gross = Math.max(0, nightly) * nights;
  const net = gross * (1 - Math.min(100, Math.max(0, charges)) / 100);
  const ratio = (amount: number) => (price > 0 ? Math.round((amount / price) * 1000) / 10 : 0);
  return { nights, gross, net, grossYield: ratio(gross), netYield: ratio(net) };
}
