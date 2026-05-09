import type { RawToken, ResolutionChain } from "../types.js";
import { evaluateMath, containsMath } from "./math-evaluator.js";
import {
  resolveLchToHex,
  resolveLchToHexWithGamut,
  applyColorModifier,
  isLchFormula,
  isPlainColor,
} from "./color-resolver.js";

const MAX_DEPTH = 50;
const REF_PATTERN = /\{([^}]+)\}/g;

export class ReferenceResolver {
  private tokenMap: Map<string, RawToken>;
  private cache: Map<string, ResolutionChain> = new Map();

  constructor(tokenMap: Map<string, RawToken>) {
    this.tokenMap = tokenMap;
  }

  resolve(dotPath: string): ResolutionChain {
    const cached = this.cache.get(dotPath);
    if (cached) return cached;

    const chain: ResolutionChain = { steps: [], finalValue: null, errors: [] };
    const visited = new Set<string>();

    this.resolveRecursive(dotPath, chain, visited, 0);

    this.cache.set(dotPath, chain);
    return chain;
  }

  private resolveRecursive(
    dotPath: string,
    chain: ResolutionChain,
    visited: Set<string>,
    depth: number
  ): unknown {
    if (depth > MAX_DEPTH) {
      chain.errors.push(`Max resolution depth exceeded at "${dotPath}"`);
      return null;
    }

    if (visited.has(dotPath)) {
      chain.errors.push(`Circular reference detected at "${dotPath}"`);
      return null;
    }

    const token = this.tokenMap.get(dotPath);
    if (!token) {
      chain.errors.push(`Token not found: "${dotPath}"`);
      return null;
    }

    visited.add(dotPath);

    chain.steps.push({
      tokenPath: dotPath,
      rawValue: token.$value,
      sourceSet: token.sourceSet,
    });

    const resolved = this.resolveValue(token, chain, visited, depth);
    chain.finalValue = resolved;

    visited.delete(dotPath);
    return resolved;
  }

  private resolveValue(
    token: RawToken,
    chain: ResolutionChain,
    visited: Set<string>,
    depth: number
  ): unknown {
    const value = token.$value;

    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      const resolved: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
        if (typeof v === "string" && hasReferences(v)) {
          resolved[k] = this.resolveStringValue(v, chain, visited, depth);
        } else {
          resolved[k] = v;
        }
      }
      return resolved;
    }

    if (typeof value === "string") {
      let resolved = this.resolveStringValue(value, chain, visited, depth);

      if (typeof resolved === "string" && isLchFormula(resolved)) {
        chain.lchValue = resolved;
        const result = resolveLchToHexWithGamut(resolved);
        if (result) {
          resolved = result.hex;
          if (result.clipped) chain.gamutClipped = true;
        }
      }

      if (
        token.$extensions?.["studio.tokens"]?.modify &&
        typeof resolved === "string" &&
        isPlainColor(resolved)
      ) {
        const modified = applyColorModifier(
          resolved,
          token.$extensions["studio.tokens"].modify
        );
        if (modified) resolved = modified;
      }

      return resolved;
    }

    return value;
  }

  private resolveStringValue(
    value: string,
    chain: ResolutionChain,
    visited: Set<string>,
    depth: number
  ): string | number {
    if (isPureReference(value)) {
      const refPath = value.slice(1, -1);
      const resolved = this.resolveRecursive(refPath, chain, visited, depth + 1);
      if (resolved !== null) return resolved as string | number;
      return value;
    }

    if (hasReferences(value)) {
      let substituted = value.replace(REF_PATTERN, (_match, refPath: string) => {
        const resolved = this.resolveRecursive(
          refPath,
          chain,
          visited,
          depth + 1
        );
        if (resolved !== null) return String(resolved);
        return `{${refPath}}`;
      });

      if (containsMath(substituted)) {
        const mathResult = evaluateMath(substituted);
        if (mathResult !== substituted) {
          substituted = String(mathResult);
        }
      }

      if (isLchFormula(substituted)) {
        chain.lchValue = substituted;
        const result = resolveLchToHexWithGamut(substituted);
        if (result) {
          if (result.clipped) chain.gamutClipped = true;
          return result.hex;
        }
      }

      return substituted;
    }

    if (containsMath(value)) {
      const result = evaluateMath(value);
      return result as string | number;
    }

    return value;
  }
}

function isPureReference(value: string): boolean {
  return /^\{[^}]+\}$/.test(value);
}

function hasReferences(value: string): boolean {
  return typeof value === "string" && REF_PATTERN.test(value);
}
