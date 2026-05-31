import {
  parse,
  formatHex,
  formatHex8,
  formatRgb,
  displayable,
  converter,
} from "culori";

const toLch = converter("lch");

export type ColorFormat = "rgba" | "hex8" | "hex";

/**
 * Render a resolved colour value in a chosen format. Lets callers normalize a
 * mix of `#hex` (plain + lighten/darken results) and `rgba(...)` (alpha results)
 * into one consistent representation. Non-colour values (dimensions, numbers,
 * unresolved references) pass through untouched.
 */
export function formatColor<T>(value: T, format: ColorFormat): T | string {
  if (typeof value !== "string") return value;
  const parsed = parse(value);
  if (!parsed) return value;
  switch (format) {
    case "rgba":
      return formatRgb(parsed);
    case "hex8":
      return formatHex8(parsed);
    case "hex":
      return formatHex(parsed);
    default:
      return value;
  }
}

export function resolveLchToHex(value: string): string | null {
  const color = parse(value);
  if (!color) return null;
  return formatHex(color);
}

export function resolveLchToHexWithGamut(value: string): { hex: string; clipped: boolean } | null {
  const color = parse(value);
  if (!color) return null;
  const clipped = !displayable(color);
  return { hex: formatHex(color), clipped };
}

export function applyColorModifier(
  baseColor: string,
  modifier: { type: string; value: string; space: string }
): string | null {
  const parsed = parse(baseColor);
  if (!parsed) return null;

  switch (modifier.type) {
    case "alpha": {
      const alpha = parseFloat(modifier.value);
      if (isNaN(alpha)) return null;
      const r = Math.round((parsed.r ?? 0) * 255);
      const g = Math.round((parsed.g ?? 0) * 255);
      const b = Math.round((parsed.b ?? 0) * 255);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    case "lighten": {
      const amount = parseFloat(modifier.value);
      if (isNaN(amount) || amount === 0) return formatHex(parsed);
      // Convert the base colour to LCH first — reading .l off the sRGB-parsed
      // object yields undefined, which would make every result compute from
      // lch(0 0 0) (black). Tokens-Studio amounts are 0–1 fractions of L's 0–100.
      const lchColor = toLch(parsed);
      lchColor.l = Math.min(100, lchColor.l + amount * 100);
      return formatHex(lchColor);
    }
    case "darken": {
      const amount = parseFloat(modifier.value);
      if (isNaN(amount) || amount === 0) return formatHex(parsed);
      const lchColor = toLch(parsed);
      lchColor.l = Math.max(0, lchColor.l - amount * 100);
      return formatHex(lchColor);
    }
    default:
      return formatHex(parsed);
  }
}

export function isLchFormula(value: string): boolean {
  return typeof value === "string" && /^lch\s*\(/i.test(value.trim());
}

export function isInSrgbGamut(hexOrColor: string): boolean {
  const color = parse(hexOrColor);
  if (!color) return true; // Can't check → assume fine
  return displayable(color);
}

export function isPlainColor(value: string): boolean {
  if (typeof value !== "string") return false;
  return (
    /^#[0-9a-fA-F]{3,8}$/.test(value.trim()) ||
    /^rgba?\s*\(/.test(value.trim())
  );
}
