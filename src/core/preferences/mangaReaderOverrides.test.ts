// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from 'vitest';
import {
  getMangaReaderMode,
  setMangaReaderMode,
} from './mangaReaderOverrides';

beforeEach(() => {
  window.localStorage.clear();
  setMangaReaderMode(1, null);
});

describe('manga reader overrides', () => {
  it('stores and clears a per-manga mode', () => {
    expect(getMangaReaderMode(1)).toBeNull();
    setMangaReaderMode(1, 'single');
    expect(getMangaReaderMode(1)).toBe('single');
    expect(
      window.localStorage.getItem('suwayomi.manga-reader-overrides.v1'),
    ).toContain('single');
    setMangaReaderMode(1, null);
    expect(getMangaReaderMode(1)).toBeNull();
  });
});
