import { describe, test, expect } from "vitest";
import { brl, formatDate } from "./forja-data";

describe("formatters", () => {
  test("brl formats valid numbers", () => {
    // Note: space might be a non-breaking space depending on locale
    expect(brl(1000).replace(/\s/g, ' ')).toBe("R$ 1.000");
  });

  test("brl handles 0", () => {
    expect(brl(0).replace(/\s/g, ' ')).toBe("R$ 0");
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

  test("formatDate handles undefined (reproducing bug)", () => {
    // @ts-ignore
    expect(() => formatDate(undefined)).toThrow();
  });
});
