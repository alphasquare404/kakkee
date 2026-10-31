// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from 'vitest';
import {
  clearRememberedSession,
  getRememberedSession,
  saveRememberedSession,
} from './sessionPreferences';

beforeEach(() => {
  window.localStorage.clear();
});

describe('session preferences', () => {
  it('stores and clears the refresh token', () => {
    expect(getRememberedSession()).toBeNull();
    saveRememberedSession('https://manga.example.com', 'refresh-secret');
    expect(getRememberedSession()).toEqual({
      serverUrl: 'https://manga.example.com',
      refreshToken: 'refresh-secret',
    });
    clearRememberedSession();
    expect(getRememberedSession()).toBeNull();
  });
});
