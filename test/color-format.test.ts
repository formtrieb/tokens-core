import { describe, it, expect } from "vitest";
import { formatColor } from "../src/parser/color-resolver.js";

describe("formatColor", () => {
  it("formats an opaque hex as rgb()", () => {
    expect(formatColor("#000000", "rgba")).toBe("rgb(0, 0, 0)");
  });

  it("formats an alpha rgba() string as rgba()", () => {
    expect(formatColor("rgba(0, 0, 0, 0.56)", "rgba")).toBe("rgba(0, 0, 0, 0.56)");
  });

  it("formats an opaque hex as 8-digit hex", () => {
    expect(formatColor("#000000", "hex8")).toBe("#000000ff");
  });

  it("formats an alpha colour as 8-digit hex with the alpha channel", () => {
    expect(formatColor("rgba(0, 0, 0, 0.56)", "hex8")).toBe("#0000008f");
  });

  it("normalizes to 6-digit hex", () => {
    expect(formatColor("#2072B6", "hex")).toBe("#2072b6");
  });

  it("passes a non-colour value through unchanged", () => {
    expect(formatColor("16px", "rgba")).toBe("16px");
    expect(formatColor("1.5", "hex8")).toBe("1.5");
  });

  it("passes a non-string value through unchanged", () => {
    expect(formatColor(42, "rgba")).toBe(42);
  });
});
