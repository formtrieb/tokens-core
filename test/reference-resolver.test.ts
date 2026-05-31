import { describe, it, expect } from "vitest";
import { ReferenceResolver } from "../src/parser/reference-resolver.js";
import type { RawToken } from "../src/types.js";

/**
 * Helper: build a minimal tokenMap from a flat record of dotPath → token spec.
 */
function buildTokenMap(
  entries: Record<
    string,
    Pick<RawToken, "$type" | "$value"> & Partial<RawToken>
  >
): Map<string, RawToken> {
  const map = new Map<string, RawToken>();
  for (const [dotPath, spec] of Object.entries(entries)) {
    map.set(dotPath, {
      path: dotPath.split("."),
      dotPath,
      $type: spec.$type,
      $value: spec.$value,
      sourceSet: spec.sourceSet ?? "test",
      isSource: spec.isSource ?? false,
      ...(spec.$extensions ? { $extensions: spec.$extensions } : {}),
    });
  }
  return map;
}

describe("ReferenceResolver — color modifiers", () => {
  it("composes an alpha modifier whose multiplier is itself a token reference", () => {
    // Mirrors the real Formtrieb shape: color.text.secondary is a plain black
    // whose alpha is driven by a referenced multiplier token (0.56).
    const map = buildTokenMap({
      "color.text.lightness.multiplier.secondary": {
        $type: "number",
        $value: "0.56",
      },
      "color.text.secondary": {
        $type: "color",
        $value: "#000000",
        $extensions: {
          "studio.tokens": {
            modify: {
              type: "alpha",
              value: "{color.text.lightness.multiplier.secondary}",
              space: "lch",
            },
          },
        },
      },
    });

    const chain = new ReferenceResolver(map).resolve("color.text.secondary");

    expect(chain.errors).toEqual([]);
    expect(chain.finalValue).toBe("rgba(0, 0, 0, 0.56)");
  });

  it("still composes an alpha modifier whose value is a plain literal", () => {
    // Guard: the literal path (the common case, ~186 tokens) must be unchanged
    // by the reference-resolution fix.
    const map = buildTokenMap({
      "color.text.muted": {
        $type: "color",
        $value: "#000000",
        $extensions: {
          "studio.tokens": {
            modify: { type: "alpha", value: "0.5", space: "lch" },
          },
        },
      },
    });

    const chain = new ReferenceResolver(map).resolve("color.text.muted");

    expect(chain.errors).toEqual([]);
    expect(chain.finalValue).toBe("rgba(0, 0, 0, 0.5)");
  });

  it("leaves a colour without a modifier untouched", () => {
    const map = buildTokenMap({
      "color.text.primary": { $type: "color", $value: "#1a1a1a" },
    });

    const chain = new ReferenceResolver(map).resolve("color.text.primary");

    expect(chain.errors).toEqual([]);
    expect(chain.finalValue).toBe("#1a1a1a");
  });
});
