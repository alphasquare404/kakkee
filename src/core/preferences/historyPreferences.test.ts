// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  getHistoryPreferences,
  resetHistoryPreferences,
  updateHistoryPreferences,
} from './historyPreferences';

beforeEach(() => {
  window.localStorage.clear();
  resetHistoryPreferences();
});

afterEach(() => {
  window.localStorage.clear();
  resetHistoryPreferences();
});

describe('history preferences', () => {
  it('persists the hide-read preference', () => {
    updateHistoryPreferences({ hideRead: true });

    expect(getHistoryPreferences()).toEqual({ hideRead: true, showHiddenHistory: false });
    expect(
      window.localStorage.getItem('suwayomi.history-preferences.v1'),
    ).toContain('"hideRead":true');
  });

  it('resets to defaults', () => {
    updateHistoryPreferences({ hideRead: true });
    resetHistoryPreferences();

    expect(getHistoryPreferences()).toEqual({ hideRead: false, showHiddenHistory: false });
  });
});
