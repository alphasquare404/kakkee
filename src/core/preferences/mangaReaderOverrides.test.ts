// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from 'vitest';
import {
  getMangaReaderMode,
  getMangaReaderOverride,
  setMangaReaderMode,
  setMangaReaderOverride,
  updateMangaReaderOverride,
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

  it('stores full per-manga layout overrides', () => {
    updateMangaReaderOverride(2, {
      mode: 'double',
      widthRem: 75,
      background: '#101010',
      filter: 'sepia',
      scale: 'screen',
      direction: 'rtl',
    });

    expect(getMangaReaderOverride(2)).toMatchObject({
      mode: 'double',
      widthRem: 75,
      background: '#101010',
      filter: 'sepia',
      scale: 'screen',
      direction: 'rtl',
    });

    setMangaReaderOverride(2, null);
    expect(getMangaReaderOverride(2)).toBeNull();
  });
});
