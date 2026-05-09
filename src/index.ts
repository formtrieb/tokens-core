// Types
export type {
  RawToken,
  TokenExtensions,
  ColorModifier,
  ResolutionStep,
  ResolutionChain,
  ThemeDefinition,
  ThemeAxes,
  TokenSetInfo,
  DesignRuleViolation,
  PlaceholderToken,
  StructuralDiff,
} from "./types.js";

// Parser
export { TokenTree } from "./parser/token-tree.js";
export { ReferenceResolver } from "./parser/reference-resolver.js";
export { evaluateMath, containsMath } from "./parser/math-evaluator.js";
export {
  resolveLchToHex,
  applyColorModifier,
  isLchFormula,
  isPlainColor,
  isInSrgbGamut,
  resolveLchToHexWithGamut,
} from "./parser/color-resolver.js";

// Theme
export {
  parseThemes,
  buildAxisMap,
  getThemeByName,
  getActiveSets,
  getDefaultAxes,
  getAxisGroups,
  getThemesForGroup,
} from "./theme/theme-resolver.js";

// Analyzer
export {
  findPlaceholders,
  findBrokenReferences,
  compareStructure,
} from "./analyzer/validation.js";
export {
  checkControlsInteractionMapping,
  checkComponentReferences,
  checkNamingConventions,
} from "./analyzer/design-rules.js";
