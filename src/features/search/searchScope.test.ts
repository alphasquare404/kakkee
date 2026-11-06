import { describe, expect, it } from 'vitest';
import type { CatalogSource } from '../../core/catalog/catalogRepository';
import type { SearchPreferences } from '../../core/preferences/searchPreferences';
import {
  activeSearchFilterCount,
  eligibleSearchSources,
  selectedSearchSources,
} from './searchScope';

function source(
  id: string,
  lang: string,
  warning: 'SAFE' | 'NSFW' = 'SAFE',
): CatalogSource {
  return {
    __typename: 'SourceType',
    id,
    name: `Provider ${id}`,
    displayName: `Provider ${id} (${lang})`,
    lang,
    isNsfw: warning === 'NSFW',
    contentWarning: warning,
    supportsLatest: true,
    iconUrl: '',
  };
}

const sources = [source('en', 'en'), source('ja', 'ja'), source('nsfw', 'en', 'NSFW')];

function preferences(patch: Partial<SearchPreferences> = {}): SearchPreferences {
  return {
    languages: [],
    allSources: true,
    sourceIds: [],
    ...patch,
  };
}

describe('search scope', () => {
  it('filters by multiple languages and NSFW visibility', () => {
    expect(eligibleSearchSources(sources, ['en', 'ja'], false).map((item) => item.id)).toEqual([
      'en',
      'ja',
    ]);
    expect(eligibleSearchSources(sources, ['en'], true).map((item) => item.id)).toEqual([
      'en',
      'nsfw',
    ]);
  });

  it('returns all eligible sources by default and respects a custom selection', () => {
    expect(selectedSearchSources(sources, preferences(), false).map((item) => item.id)).toEqual([
      'en',
      'ja',
    ]);
    expect(
      selectedSearchSources(
        sources,
        preferences({ allSources: false, sourceIds: ['ja'] }),
        false,
      ).map((item) => item.id),
    ).toEqual(['ja']);
  });

  it('counts active filter groups', () => {
    expect(activeSearchFilterCount(preferences(), false)).toBe(0);
    expect(
      activeSearchFilterCount(
        preferences({ languages: ['en'], allSources: false }),
        true,
      ),
    ).toBe(3);
  });
});
