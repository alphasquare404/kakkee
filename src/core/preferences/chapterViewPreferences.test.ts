// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from 'vitest';
import {
  clearChapterViewPreferences,
  getChapterViewPreferences,
  saveChapterViewPreferences,
} from './chapterViewPreferences';

beforeEach(() => {
  window.localStorage.clear();
  clearChapterViewPreferences();
});

describe('chapter view preferences', () => {
  it('stores order, filter, and scanlator per manga', () => {
    saveChapterViewPreferences(12, {
      order: 'oldest',
      filter: 'unread',
      scanlator: 'Scan',
      hideDuplicates: true,
    });

    expect(getChapterViewPreferences(12)).toEqual({
      order: 'oldest',
      filter: 'unread',
      scanlator: 'Scan',
      hideDuplicates: true,
    });
    expect(getChapterViewPreferences(13)).toBeNull();
  });
});
