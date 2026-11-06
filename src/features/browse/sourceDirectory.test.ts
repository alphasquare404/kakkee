import { describe, expect, it } from 'vitest';
import type { CatalogSource } from '../../core/catalog/catalogRepository';
import {
  groupSources,
  languageLabel,
  languageName,
  languageSummary,
  sourceSearchText,
} from './sourceDirectory';

function source(
  id: string,
  name: string,
  displayName: string,
  lang: string,
): CatalogSource {
  return {
    __typename: 'SourceType',
    id,
    name,
    displayName,
    lang,
    isNsfw: false,
    contentWarning: 'SAFE',
    supportsLatest: true,
    iconUrl: '',
  };
}

describe('source directory', () => {
  it('groups language variants by provider source name without changing IDs', () => {
    const groups = groupSources([
      source('en', 'MangaDex', 'MangaDex (EN)', 'en'),
      source('ja', 'MangaDex', 'MangaDex (JA)', 'ja'),
      source('comick', 'Comick', 'Comick (ALL)', 'all'),
    ]);

    expect(groups).toHaveLength(2);
    expect(groups.find((group) => group.name === 'MangaDex')?.sources.map((item) => item.id)).toEqual([
      'en',
      'ja',
    ]);
    expect(groups.find((group) => group.name === 'Comick')?.sources[0]?.id).toBe('comick');
  });

  it('uses readable labels for multi and local languages', () => {
    expect(languageLabel('all')).toBe('Multi');
    expect(languageLabel('localsourcelang')).toBe('Local');
    expect(languageLabel('en')).toBe('EN');
    expect(languageName('en')).toBe('English');
    expect(languageName('all')).toBe('Multi-language');
    expect(languageSummary([source('en', 'P', 'P (EN)', 'en')])).toBe('EN');
  });

  it('searches names, providers, and language metadata', () => {
    const english = source('en', 'MangaDex', 'MangaDex (EN)', 'en');
    expect(sourceSearchText(english)).toContain('mangadex');
    expect(sourceSearchText(english)).toContain('english');
    expect(sourceSearchText(english)).toContain('en');
  });
});
