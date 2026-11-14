// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  getNsfwPreferences,
  isHiddenByNsfw,
  resetNsfwPreferences,
  toggleMangaNsfw,
  updateNsfwPreferences,
} from './nsfwPreferences';

beforeEach(() => {
  window.localStorage.clear();
  resetNsfwPreferences();
});

afterEach(() => {
  window.localStorage.clear();
  resetNsfwPreferences();
});

describe('nsfw preferences', () => {
  it('labels manga and hides them only when enabled', () => {
    toggleMangaNsfw(42);
    expect(getNsfwPreferences().mangaIds).toEqual([42]);
    expect(isHiddenByNsfw(42, getNsfwPreferences())).toBe(false);

    updateNsfwPreferences({ hideNsfw: true });
    expect(isHiddenByNsfw(42, getNsfwPreferences())).toBe(true);
    expect(isHiddenByNsfw(7, getNsfwPreferences())).toBe(false);

    expect(
      window.localStorage.getItem('suwayomi.nsfw-preferences.v1'),
    ).toContain('"mangaIds":[42]');
  });

  it('removes the label when toggled twice', () => {
    toggleMangaNsfw(42);
    toggleMangaNsfw(42);
    expect(getNsfwPreferences().mangaIds).toEqual([]);
  });
});
