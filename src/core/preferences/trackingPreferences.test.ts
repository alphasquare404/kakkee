// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from 'vitest';
import {
  getTrackingPreferences,
  setAutoSyncTracking,
} from './trackingPreferences';

beforeEach(() => {
  window.localStorage.clear();
  setAutoSyncTracking(false);
});

describe('tracking preferences', () => {
  it('stores the auto-sync flag', () => {
    expect(getTrackingPreferences().autoSync).toBe(false);
    setAutoSyncTracking(true);
    expect(getTrackingPreferences().autoSync).toBe(true);
    expect(
      window.localStorage.getItem('suwayomi.tracking-preferences.v1'),
    ).toBe('true');
  });
});
