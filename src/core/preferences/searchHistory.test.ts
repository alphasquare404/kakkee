// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from 'vitest';
import {
  addSearchHistory,
  clearSearchHistory,
  getSearchHistory,
} from './searchHistory';

beforeEach(() => {
  window.localStorage.clear();
  clearSearchHistory();
});

describe('search history', () => {
  it('deduplicates, trims, and caps history', () => {
    addSearchHistory('  alpha  ');
    addSearchHistory('beta');
    addSearchHistory('alpha');

    expect(getSearchHistory()).toEqual(['alpha', 'beta']);
    expect(
      window.localStorage.getItem('suwayomi.library-search-history.v1'),
    ).toContain('alpha');
  });
});
