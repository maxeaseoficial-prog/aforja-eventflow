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

  test("brl returns fallback for undefined", () => {
    // @ts-ignore
    expect(brl(undefined).replace(/\s/g, ' ')).toBe("R$ 0");
  });

  test("brl returns fallback for null", () => {
    // @ts-ignore
    expect(brl(null).replace(/\s/g, ' ')).toBe("R$ 0");
  });

  test("formatDate formats valid ISO strings", () => {
    expect(formatDate("2026-12-25")).toContain("25");
    expect(formatDate("2026-12-25")).toContain("dez");
  });

  test("formatDate handles undefined gracefully", () => {
    // @ts-ignore
    expect(formatDate(undefined)).toBe("—");
  });
});
