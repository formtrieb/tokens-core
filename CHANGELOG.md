# Changelog

All notable changes to `@formtrieb/tokens-core` are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
