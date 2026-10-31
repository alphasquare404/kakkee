// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  DEFAULT_READER_SETTINGS,
  getReaderSettings,
  resetReaderSettings,
  saveReaderModeProfile,
  updateReaderSettings,
} from './readerSettings';

beforeEach(() => {
  window.localStorage.clear();
  resetReaderSettings();
});

afterEach(() => {
  window.localStorage.clear();
  resetReaderSettings();
});

describe('reader settings', () => {
  it('updates and persists the selected layout', () => {
    updateReaderSettings({
      widthRem: 72,
      gapPx: 8,
      background: '#000000',
      mode: 'single',
      filter: 'grayscale',
      brightnessPct: 100,
      contrastPct: 100,
      saturationPct: 100,
      scale: 'fit-height',
      direction: 'rtl',
      keepScreenOn: true,
      firstPageOffset: 24,
      skipDuplicates: true,
    });

    expect(getReaderSettings()).toEqual({
      widthRem: 72,
      gapPx: 8,
      background: '#000000',
      mode: 'single',
      filter: 'grayscale',
      brightnessPct: 100,
      contrastPct: 100,
      saturationPct: 100,
      scale: 'fit-height',
      direction: 'rtl',
      keepScreenOn: true,
      firstPageOffset: 24,
      skipDuplicates: true,
      autoAdvance: false,
      autoDetectWebtoon: false,
      autoScrollSpeed: 1,
      pagePrevKey: 'ArrowLeft',
      pageNextKey: 'ArrowRight',
      backKey: 'Escape',
      deleteAfterReading: false,
      autoBackground: false,
      profiles: {},
    });
    expect(window.localStorage.getItem('suwayomi.reader-settings.v1')).toContain(
      '"widthRem":72',
    );
  });

  it('restores a saved layout when switching back to a mode', () => {
    updateReaderSettings({
      mode: 'single',
      widthRem: 55,
      filter: 'sepia',
      scale: 'fit-height',
    });
    saveReaderModeProfile();
    updateReaderSettings({ mode: 'vertical' });
    updateReaderSettings({ mode: 'single' });

    expect(getReaderSettings()).toMatchObject({
      mode: 'single',
      widthRem: 55,
      filter: 'sepia',
      scale: 'fit-height',
    });
  });

  it('clamps values and rejects malformed colors', () => {
    updateReaderSettings({ widthRem: 500, gapPx: -10, background: 'red' });

    expect(getReaderSettings()).toEqual({
      ...DEFAULT_READER_SETTINGS,
      widthRem: 100,
      gapPx: 0,
    });
  });
});
