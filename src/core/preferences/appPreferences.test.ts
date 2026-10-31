// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  DEFAULT_APP_PREFERENCES,
  getAppPreferences,
  resetAppPreferences,
  updateAppPreferences,
} from './appPreferences';
import { getReaderSettings, resetReaderSettings } from './readerSettings';

beforeEach(() => {
  window.localStorage.clear();
  resetAppPreferences();
  resetReaderSettings();
});

afterEach(() => {
  window.localStorage.clear();
  resetAppPreferences();
  resetReaderSettings();
});

describe('app preferences', () => {
  it('updates one preference without resetting the other', () => {
    updateAppPreferences({ libraryDensity: 'comfortable' });

    expect(getAppPreferences()).toEqual({
      theme: 'dark',
      libraryDensity: 'comfortable',
      libraryView: 'grid',
      libraryBadges: true,
      libraryContinue: true,
      accent: '#5b7cff',
      locale: 'en',
    });
    expect(getReaderSettings()).toBeDefined();
  });

  it('persists theme selection and resets to defaults', () => {
    updateAppPreferences({ theme: 'pure-black' });

    expect(
      JSON.parse(window.localStorage.getItem('suwayomi.app-preferences.v1') ?? '{}'),
    ).toMatchObject({ theme: 'pure-black' });

    resetAppPreferences();
    expect(getAppPreferences()).toEqual(DEFAULT_APP_PREFERENCES);
  });
});
