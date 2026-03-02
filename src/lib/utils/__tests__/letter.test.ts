import { describe, it, expect } from "vitest";
import { capitalizeFirstLetter } from "../letter";

describe("capitalizeFirstLetter", () => {
  it("capitalizes the first letter of a lowercase word", () => {
    expect(capitalizeFirstLetter("hello")).toBe("Hello");
  });

  it("leaves an already-capitalized word unchanged", () => {
    expect(capitalizeFirstLetter("Hello")).toBe("Hello");
  });

  it("only capitalizes the first character, leaving the rest alone", () => {
    expect(capitalizeFirstLetter("hELLO wORLD")).toBe("HELLO wORLD");
  });

  it("handles a single lowercase character", () => {
    expect(capitalizeFirstLetter("a")).toBe("A");
  });

  it("returns an empty string unchanged", () => {
    expect(capitalizeFirstLetter("")).toBe("");
  });

  it("handles a string that starts with a digit", () => {
    expect(capitalizeFirstLetter("1st place")).toBe("1st place");
  });

  it("handles a multi-word string", () => {
    expect(capitalizeFirstLetter("great western productions")).toBe(
      "Great western productions"
    );
  });
});
