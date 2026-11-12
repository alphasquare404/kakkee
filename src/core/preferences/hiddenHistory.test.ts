// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import {
  clearHiddenHistory,
  getHiddenHistoryMangaIds,
  hideHistoryManga,
} from './hiddenHistory';

describe('hidden history', () => {
  beforeEach(() => {
    window.localStorage.clear();
    clearHiddenHistory();
  });

  it('hides manga ids and persists them', () => {
    hideHistoryManga(42);

    expect([...getHiddenHistoryMangaIds()]).toEqual([42]);
    expect(window.localStorage.getItem('suwayomi.hidden-history.v1')).toBe(
      '[42]',
    );
  });

  it('does not duplicate an already hidden manga', () => {
    hideHistoryManga(42);
    hideHistoryManga(42);

    expect([...getHiddenHistoryMangaIds()]).toEqual([42]);
  });

  it('clears hidden history', () => {
    hideHistoryManga(42);
    clearHiddenHistory();

    expect([...getHiddenHistoryMangaIds()]).toEqual([]);
  });
});
