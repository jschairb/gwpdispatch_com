import { describe, it, expect } from "vitest";
import { normalizeDate, formatDate, getDateDistance } from "../date";

describe("normalizeDate", () => {
  it("returns a Date object as an ISO string", () => {
    const d = new Date("2025-06-15T12:00:00.000Z");
    expect(normalizeDate(d)).toBe("2025-06-15T12:00:00.000Z");
  });

  it("passes a string through unchanged", () => {
    expect(normalizeDate("2025-06-15")).toBe("2025-06-15");
  });

  it("passes a full ISO string through unchanged", () => {
    const iso = "2025-06-15T12:00:00.000Z";
    expect(normalizeDate(iso)).toBe(iso);
  });
});

describe("formatDate", () => {
  const knownDate = "2025-01-20T10:30:00.000Z";

  it("returns a string for a valid ISO date", () => {
    expect(typeof formatDate(knownDate)).toBe("string");
  });

  it("includes the correct year in long format", () => {
    expect(formatDate(knownDate, "long")).toContain("2025");
  });

  it("includes the correct year in short format", () => {
    expect(formatDate(knownDate, "short")).toContain("2025");
  });

  it("long format includes the month name", () => {
    // January 20 UTC — may parse as Jan or Dec depending on local TZ offset,
    // so we just assert a month name is present.
    expect(formatDate(knownDate, "long")).toMatch(/January|December/);
  });

  it("defaults to long format when no formatType is provided", () => {
    // Long format contains a day-of-week name; short does not.
    expect(formatDate(knownDate)).toMatch(
      /Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday/
    );
  });

  it("accepts a Date object directly", () => {
    const d = new Date("2025-06-01T00:00:00.000Z");
    expect(formatDate(d)).toContain("2025");
  });

  it("throws for a completely invalid date string", () => {
    expect(() => formatDate("not-a-date")).toThrow("Invalid date value provided.");
  });
});

describe("getDateDistance", () => {
  it("returns a string containing 'ago' for a past date", () => {
    expect(getDateDistance("2020-01-01T00:00:00.000Z")).toContain("ago");
  });
});
