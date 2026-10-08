// Unit tests of the image sizes computed before upload. Run with `bun test`.
import { describe, expect, test } from "bun:test";

import { fitWithin } from "../src/lib/geometry";

describe("images", () => {
  test("dimensions de redimensionnement", () => {
    expect(fitWithin(8000, 4000, 4096)).toEqual({ width: 4096, height: 2048 });
    expect(fitWithin(3000, 6000, 1600)).toEqual({ width: 800, height: 1600 });
    expect(fitWithin(1200, 800, 4096)).toEqual({ width: 1200, height: 800 });
    const capped = fitWithin(6000, 6000, 6000, 16_000_000);
    expect(capped.width * capped.height).toBeLessThanOrEqual(16_000_000);
  });
});
