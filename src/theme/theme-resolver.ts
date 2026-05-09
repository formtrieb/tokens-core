import type { ThemeDefinition, ThemeAxes } from "../types.js";

interface RawTheme {
  id: string;
  name: string;
  group: string;
  selectedTokenSets: Record<string, string>;
  $figmaStyleReferences?: Record<string, string>;
  $figmaVariableReferences?: Record<string, string>;
  $figmaCollectionId?: string;
  $figmaModeId?: string;
}

export function parseThemes(raw: RawTheme[]): ThemeDefinition[] {
  return raw.map((t) => ({
    id: t.id,
    name: t.name,
    group: t.group,
    selectedTokenSets: Object.fromEntries(
      Object.entries(t.selectedTokenSets).map(([k, v]) => [
        k,
        v as "enabled" | "source",
      ])
    ),
  }));
}

export function buildAxisMap(
  themes: ThemeDefinition[]
): Map<string, ThemeDefinition[]> {
  const axisMap = new Map<string, ThemeDefinition[]>();
  for (const theme of themes) {
    const group = theme.group;
    if (!axisMap.has(group)) {
      axisMap.set(group, []);
    }
    axisMap.get(group)!.push(theme);
  }
  return axisMap;
}

export function getThemeByName(
  themes: ThemeDefinition[],
  group: string,
  name: string
): ThemeDefinition | undefined {
  return themes.find((t) => t.group === group && t.name === name);
}

export function getActiveSets(
  themes: ThemeDefinition[],
  axes: ThemeAxes
): { enabled: string[]; source: string[] } {
  const enabled = new Set<string>();
  const source = new Set<string>();

  for (const [group, themeName] of Object.entries(axes)) {
    const theme = getThemeByName(themes, group, themeName);
    if (!theme) continue;

    for (const [setName, status] of Object.entries(theme.selectedTokenSets)) {
      if (status === "enabled") {
        enabled.add(setName);
      } else if (status === "source") {
        source.add(setName);
      }
    }
  }

  return {
    enabled: [...enabled],
    source: [...source],
  };
}

export function getDefaultAxes(
  axisMap: Map<string, ThemeDefinition[]>
): ThemeAxes {
  const axes: ThemeAxes = {};
  for (const [group, themes] of axisMap) {
    if (themes.length > 0) {
      axes[group] = themes[0].name;
    }
  }
  return axes;
}

export function getAxisGroups(
  axisMap: Map<string, ThemeDefinition[]>
): string[] {
  return [...axisMap.keys()];
}

export function getThemesForGroup(
  axisMap: Map<string, ThemeDefinition[]>,
  group: string
): ThemeDefinition[] {
  return axisMap.get(group) ?? [];
}
