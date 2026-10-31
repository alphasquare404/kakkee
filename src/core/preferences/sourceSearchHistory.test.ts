// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from 'vitest';
import {
  addSourceSearch,
  clearSourceSearchHistory,
  getSourceSearchHistory,
} from './sourceSearchHistory';

beforeEach(() => {
  window.localStorage.clear();
  clearSourceSearchHistory('42');
});

describe('source search history', () => {
  it('stores and clears searches per source', () => {
    addSourceSearch('42', '  alpha  ');
    addSourceSearch('42', 'beta');
    addSourceSearch('42', 'alpha');
    addSourceSearch('43', 'gamma');

    expect(getSourceSearchHistory('42')).toEqual(['alpha', 'beta']);
    expect(getSourceSearchHistory('43')).toEqual(['gamma']);
    clearSourceSearchHistory('42');
    expect(getSourceSearchHistory('42')).toEqual([]);
  });
});
