// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from 'vitest';
import {
  getSourcePreferences,
  markSourceUsed,
  togglePinnedSource,
  updateSourcePreferences,
} from './sourcePreferences';

beforeEach(() => {
  window.localStorage.clear();
  updateSourcePreferences({
    pinned: [],
    lastSourceId: null,
    language: 'all',
    showNsfw: false,
  });
});

describe('source preferences', () => {
  it('tracks pinned and last-used sources', () => {
    togglePinnedSource('42');
    markSourceUsed('42');
    updateSourcePreferences({ language: 'en', showNsfw: true });

    expect(getSourcePreferences()).toEqual({
      pinned: ['42'],
      lastSourceId: '42',
      language: 'en',
      showNsfw: true,
    });

    togglePinnedSource('42');
    expect(getSourcePreferences().pinned).toEqual([]);
  });
});
