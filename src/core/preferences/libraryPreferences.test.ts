// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from 'vitest';
import {
  getLibraryPreferences,
  resetLibraryPreferences,
  updateLibraryPreferences,
} from './libraryPreferences';

beforeEach(() => {
  window.localStorage.clear();
  resetLibraryPreferences();
});

describe('library preferences', () => {
  it('persists filter defaults and restores them', () => {
    updateLibraryPreferences({
      status: 'ONGOING',
      categoryId: 7,
      sort: { field: 'title', direction: 'asc' },
    });

    expect(getLibraryPreferences()).toEqual({
      status: 'ONGOING',
      categoryId: 7,
      sort: { field: 'title', direction: 'asc' },
    });
    expect(
      window.localStorage.getItem('suwayomi.library-preferences.v1'),
    ).toContain('"categoryId":7');
  });
});
