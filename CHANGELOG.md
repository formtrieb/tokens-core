# Changelog

All notable changes to `@formtrieb/tokens-core` are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.2] — 2026-05-31

### Added

- **`formatColor(value, format)`** — renders a resolved colour as `"rgba"`
  (`rgb()`/`rgba()`), `"hex8"` (`#rrggbbaa`), or `"hex"` (`#rrggbb`). Lets callers
  normalize a mix of `#hex` (plain + lighten/darken) and `rgba(...)` (alpha)
  results into one representation. Non-colour values pass through untouched.
- **`findColorMatches(query, candidates, opts)`** — reverse-lookup from a colour
  value to the token paths that produce it. Exact match is format/casing-insensitive
  (both sides normalized to `#rrggbbaa`); `opts.nearest` adds the perceptually
  closest non-exact candidate by CIEDE2000 ΔE. Non-colour candidates are skipped.

### Fixed

- **`lighten`/`darken` colour modifiers now compute from the base colour, not
  black.** `applyColorModifier` read the `.l/.c/.h` LCH channels off an sRGB-parsed
  culori object, where they are `undefined` (→ `0`), so every lighten/darken
  rebuilt from `lch(0 0 0)`. The base is now converted to LCH first. Fixes 30
  reference DS tokens (icon tints, hover states) that previously resolved to
  near-black garbage.

## [1.1.1] — 2026-05-31

### Fixed

- **Reference-valued colour modifiers are now composed into `finalValue`.**
  When a `studio.tokens.modify` block's `value` was itself a token reference
  (e.g. an `alpha` modifier whose multiplier is
  `{color.text.lightness.multiplier.secondary}`), the reference was passed
  verbatim to `parseFloat`, yielding `NaN`, so the modifier was silently
  dropped and `finalValue` fell back to the unmodified base colour. The
  modifier `value` is now reference-resolved against the token map before the
  modifier is applied. Literal-valued modifiers (the common case) are
  unchanged. Alpha-driven colours (semantic text tiers, etc.) now resolve to
  their true `rgba(…)` value instead of the opaque base. 3 new tests in
  `test/reference-resolver.test.ts`.

## [1.1.0] — 2026-05-10

### Added

- **`ResolutionStep.modifier?: ColorModifier`.** When a token carries a
  `$extensions.studio.tokens.modify` block, the corresponding
  resolution step now exposes the modifier verbatim. Previously the
  modifier was applied to `finalValue` invisibly — callers could see
  the post-modification colour but not the operation that produced it.
  This is the missing signal for tools that need to round-trip or
  reason about derived tokens (e.g. brand-iteration loops where an LLM
  edits source tokens and inspects what was applied where). Field is
  optional and only present on steps whose token defines a `modify`.

No breaking changes: the addition is strictly additive on an existing
optional shape. Consumers that destructure only `tokenPath`,
`rawValue`, `sourceSet` are unaffected.

## [1.0.0] — 2026-05-09

### Initial public release

Extracted from `formtrieb-tokens-core@1.0.0` (private; identical surface).
The library has shipped under `workspace:*` inside the Formtrieb monorepo
since 2026-03; this version strips the monorepo-internal coupling and
re-publishes as a standalone npm package under the `@formtrieb/` scope.

**Surface (no breaking changes vs. private 1.0.0).**

- `TokenTree` — DTCG-aware walker over Tokens-Studio set files
- `ReferenceResolver` — resolves `{token.references}` chains with full step path
- Theme composition — `parseThemes`, `buildAxisMap`, `getActiveSets`,
  `getDefaultAxes`, `getAxisGroups`, `getThemesForGroup`, `getThemeByName`
- Color resolution — `resolveLchToHex`, `applyColorModifier`,
  `isLchFormula`, `isPlainColor`, `isInSrgbGamut`, `resolveLchToHexWithGamut`
- Math evaluation — `evaluateMath`, `containsMath`
- Validation — `findPlaceholders`, `findBrokenReferences`, `compareStructure`
- Design rules — `checkControlsInteractionMapping`,
  `checkComponentReferences`, `checkNamingConventions`
- Types — `RawToken`, `TokenExtensions`, `ColorModifier`, `ResolutionStep`,
  `ResolutionChain`, `ThemeDefinition`, `ThemeAxes`, `TokenSetInfo`,
  `DesignRuleViolation`, `PlaceholderToken`, `StructuralDiff`

License: Apache-2.0. Requires Node ≥ 20.
