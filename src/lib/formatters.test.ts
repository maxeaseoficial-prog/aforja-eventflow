import { brl, formatDate } from "./forja-data";

describe("formatters", () => {
  test("brl formats valid numbers", () => {
    expect(brl(1000)).toBe("R$ 1.000");
  });

  test("brl handles 0", () => {
    expect(brl(0)).toBe("R$ 0");
  });

  test("brl crashes on undefined (reproducing bug)", () => {
    // @ts-ignore
    expect(() => brl(undefined)).toThrow();
  });

  test("brl crashes on null (reproducing bug)", () => {
    // @ts-ignore
    expect(() => brl(null)).toThrow();
  });

  test("formatDate formats valid ISO strings", () => {
    expect(formatDate("2026-12-25")).toContain("25");
    expect(formatDate("2026-12-25")).toContain("dez");
  });

  test("formatDate handles invalid strings gracefully or crashes?", () => {
    // Depending on browser/environment behavior of new Date("")
    // Usually it returns an Invalid Date object, and toLocaleDateString might return "Invalid Date"
    // But if iso is undefined, new Date(undefined) is also Invalid Date.
    // However, iso.length will crash if iso is undefined.
    // @ts-ignore
    expect(() => formatDate(undefined)).toThrow();
  });
});
