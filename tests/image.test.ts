// Unit tests of the images sent as they are. Run with `bun test`.
import { describe, expect, test } from "bun:test";

import { asSent } from "../src/lib/image";

const bitmap = (width: number, height: number) => ({ width, height }) as ImageBitmap;
const file = (type: string, bytes: number) => new File([new Uint8Array(bytes)], "photo", { type });

describe("asSent", () => {
  test("keeps a JPEG, WebP or PNG small enough as it is", () => {
    const jpeg = file("image/jpeg", 1000);
    expect(asSent(jpeg, bitmap(4096, 2731), 4096, 2000)).toEqual({
      blob: jpeg,
      width: 4096,
      height: 2731,
      extension: "jpg",
    });
    expect(asSent(file("image/webp", 10), bitmap(800, 600), 4096, 2000)?.extension).toBe("webp");
    expect(asSent(file("image/png", 10), bitmap(600, 800), 4096, 2000)?.extension).toBe("png");
  });

  test("re-encodes what is too large or of another kind", () => {
    expect(asSent(file("image/jpeg", 1000), bitmap(4097, 2000), 4096, 2000)).toBeNull();
    expect(asSent(file("image/jpeg", 1000), bitmap(2000, 4097), 4096, 2000)).toBeNull();
    expect(asSent(file("image/jpeg", 2001), bitmap(800, 600), 4096, 2000)).toBeNull();
    expect(asSent(file("image/heic", 10), bitmap(800, 600), 4096, 2000)).toBeNull();
    expect(asSent(file("image/avif", 10), bitmap(800, 600), 4096, 2000)).toBeNull();
  });
});
