import type { CatalogSource } from '../../core/catalog/catalogRepository';
import type { SearchPreferences } from '../../core/preferences/searchPreferences';

export function sourceMatchesLanguages(
  source: CatalogSource,
  languages: readonly string[],
): boolean {
  if (languages.length === 0) {
    return true;
  }

  return languages.includes(source.lang.toLowerCase());
}

export function sourceMatchesNsfw(
  source: CatalogSource,
  showNsfw: boolean,
): boolean {
  return showNsfw || source.contentWarning !== 'NSFW';
}

export function eligibleSearchSources(
  sources: readonly CatalogSource[],
  languages: readonly string[],
  showNsfw: boolean,
): readonly CatalogSource[] {
  return sources.filter(
    (source) =>
      sourceMatchesLanguages(source, languages) &&
      sourceMatchesNsfw(source, showNsfw),
  );
}

export function selectedSearchSources(
  sources: readonly CatalogSource[],
  preferences: SearchPreferences,
  showNsfw: boolean,
): readonly CatalogSource[] {
  const eligible = eligibleSearchSources(
    sources,
    preferences.languages,
    showNsfw,
  );

  if (preferences.allSources) {
    return eligible;
  }

  const selected = new Set(preferences.sourceIds);
  return eligible.filter((source) => selected.has(source.id));
}

export function activeSearchFilterCount(
  preferences: SearchPreferences,
  showNsfw: boolean,
): number {
  return (
    (preferences.languages.length > 0 ? 1 : 0) +
    (preferences.allSources ? 0 : 1) +
    (showNsfw ? 1 : 0)
  );
}
