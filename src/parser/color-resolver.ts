import { parse, formatHex, displayable } from "culori";

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
      const lchColor = parse(`lch(${parsed.l ?? 0} ${parsed.c ?? 0} ${parsed.h ?? 0})`);
      if (!lchColor) return null;
      (lchColor as any).l = Math.min(100, ((lchColor as any).l ?? 0) + amount * 100);
      return formatHex(lchColor);
    }
    case "darken": {
      const amount = parseFloat(modifier.value);
      if (isNaN(amount) || amount === 0) return formatHex(parsed);
      const lchColor = parse(`lch(${parsed.l ?? 0} ${parsed.c ?? 0} ${parsed.h ?? 0})`);
      if (!lchColor) return null;
      (lchColor as any).l = Math.max(0, ((lchColor as any).l ?? 0) - amount * 100);
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
