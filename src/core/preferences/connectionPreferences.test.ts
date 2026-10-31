// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from 'vitest';
import {
  clearLastServerUrl,
  getAutoConnect,
  getLastServerUrl,
  saveLastServerUrl,
  setAutoConnect,
} from './connectionPreferences';

beforeEach(() => {
  window.localStorage.clear();
});

describe('connection preferences', () => {
  it('remembers and clears the last server URL', () => {
    expect(getLastServerUrl()).toBe('');
    saveLastServerUrl(' https://manga.example.com ');
    expect(getLastServerUrl()).toBe('https://manga.example.com');
    clearLastServerUrl();
    expect(getLastServerUrl()).toBe('');
  });

  it('stores the auto-connect preference', () => {
    expect(getAutoConnect()).toBe(false);
    setAutoConnect(true);
    expect(getAutoConnect()).toBe(true);
  });
});
