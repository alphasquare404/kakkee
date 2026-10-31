// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  DEFAULT_READER_SETTINGS,
  getReaderSettings,
  resetReaderSettings,
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
      scale: 'fit-height',
      direction: 'rtl',
      keepScreenOn: true,
      firstPageOffset: 24,
      skipDuplicates: true,
    });
    expect(window.localStorage.getItem('suwayomi.reader-settings.v1')).toContain(
      '"widthRem":72',
    );
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
