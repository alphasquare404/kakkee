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
      statuses: ['COMPLETED', 'ON_HIATUS'],
      categoryId: 7,
      hiddenCategoryIds: [3, 4],
      showAllCategory: false,
      sort: { field: 'title', direction: 'asc' },
    });

    expect(getLibraryPreferences()).toEqual({
      status: 'ONGOING',
      statuses: ['COMPLETED', 'ON_HIATUS'],
      categoryId: 7,
      hiddenCategoryIds: [3, 4],
      showAllCategory: false,
      sort: { field: 'title', direction: 'asc' },
    });
    expect(
      window.localStorage.getItem('suwayomi.library-preferences.v1'),
    ).toContain('"categoryId":7');
    expect(
      window.localStorage.getItem('suwayomi.library-preferences.v1'),
    ).toContain('"showAllCategory":false');
  });
});
