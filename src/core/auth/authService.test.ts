import { describe, expect, it } from 'vitest';
import { AuthError } from './authError';
import { AuthService, type LoginResult } from './authService';
import {
  isAuthenticatedSession,
  isNoneSession,
  isSessionAccessTokenExpired,
  isSessionAccessTokenNearExpiry,
  type AuthSession,
} from './session';

function base64Url(value: string): string {
  return btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function createAccessToken(exp: number): string {
  const header = base64Url(JSON.stringify({ alg: 'none', typ: 'JWT' }));
  const payload = base64Url(JSON.stringify({ exp }));

  return `${header}.${payload}.signature`;
}

function loginResult(accessToken: string, refreshToken = 'refresh-token'): LoginResult {
  return { accessToken, refreshToken };
}

function expectRefreshAttempt(service: AuthService) {
  const attempt = service.beginRefresh();

  if (!attempt) {
    throw new Error('Expected an authenticated refresh attempt.');
  }

  return attempt;
}

describe('AuthService NONE session', () => {
  it('creates a real NONE session without tokens', () => {
    const service = new AuthService();

    service.setNoneSession();

    expect(isNoneSession(service.getSnapshot())).toBe(true);
    expect(service.getSnapshot()).toEqual({ status: 'none', mode: 'none' });
    expect(service.getAccessToken()).toBeNull();
    expect(service.getRefreshToken()).toBeNull();
  });

  it('clears NONE back to disconnected', () => {
    const service = new AuthService();

    service.setNoneSession();
    service.clearSession();

    expect(service.getSnapshot()).toEqual({ status: 'disconnected' });
    expect(service.getAccessToken()).toBeNull();
    expect(service.getRefreshToken()).toBeNull();
  });
});

describe('AuthService UI_LOGIN session', () => {
  const futureExpiry = Math.floor(Date.now() / 1000) + 3600;

  it('creates an authenticated session with access, refresh, and expiry metadata', () => {
    const service = new AuthService();
    const accessToken = createAccessToken(futureExpiry);

    service.setUiLoginSession({ accessToken, refreshToken: 'refresh-1' });

    expect(isAuthenticatedSession(service.getSnapshot())).toBe(true);
    expect(service.getAccessToken()).toBe(accessToken);
    expect(service.getRefreshToken()).toBe('refresh-1');
    expect(service.getSnapshot()).toMatchObject({
      status: 'authenticated',
      accessTokenExpiresAt: futureExpiry * 1000,
    });
  });

  it('replaces only the access token on refresh and preserves the refresh token', () => {
    const service = new AuthService();
    const firstAccess = createAccessToken(futureExpiry);
    const nextAccess = createAccessToken(futureExpiry + 60);

    service.setUiLoginSession({ accessToken: firstAccess, refreshToken: 'refresh-1' });
    const attempt = expectRefreshAttempt(service);

    expect(service.getSnapshot().status).toBe('refreshing');
    expect(service.getRefreshToken()).toBe('refresh-1');

    expect(service.completeRefresh(attempt, { accessToken: nextAccess })).toBe(true);
    expect(service.getAccessToken()).toBe(nextAccess);
    expect(service.getRefreshToken()).toBe('refresh-1');
    expect(service.getSnapshot().status).toBe('authenticated');
  });

  it('clears the authenticated session locally', () => {
    const service = new AuthService();
    service.setUiLoginSession({
      accessToken: createAccessToken(futureExpiry),
      refreshToken: 'refresh-1',
    });

    service.clearSession();

    expect(service.getSnapshot()).toEqual({ status: 'disconnected' });
    expect(service.getAccessToken()).toBeNull();
    expect(service.getRefreshToken()).toBeNull();
  });

  it('rejects malformed access tokens without replacing an existing session', () => {
    const service = new AuthService();

    expect(() => {
      service.setUiLoginSession({ accessToken: 'malformed', refreshToken: 'refresh-1' });
    }).toThrowError(AuthError);

    expect(service.getSnapshot()).toEqual({ status: 'disconnected' });
  });

  it('does not return tokens for unauthenticated or NONE states', () => {
    const service = new AuthService();

    service.setUiLoginRequired();
    expect(service.getSnapshot()).toMatchObject({
      status: 'unauthenticated',
      mode: 'ui-login',
      reason: 'login-required',
    });
    expect(service.getAccessToken()).toBeNull();
    expect(service.getRefreshToken()).toBeNull();

    service.setNoneSession();
    expect(service.getAccessToken()).toBeNull();
    expect(service.getRefreshToken()).toBeNull();
  });
});

describe('AuthService stale response protection', () => {
  const futureExpiry = Math.floor(Date.now() / 1000) + 3600;

  it('rejects an old login result after logout', () => {
    const service = new AuthService();
    const attempt = service.beginLogin();

    service.clearSession();

    expect(service.completeLogin(attempt, loginResult(createAccessToken(futureExpiry)))).toBe(
      false,
    );
    expect(service.getSnapshot()).toEqual({ status: 'disconnected' });
  });

  it('rejects an old refresh result after switching to a NONE session', () => {
    const service = new AuthService();
    service.setUiLoginSession({
      accessToken: createAccessToken(futureExpiry),
      refreshToken: 'refresh-1',
    });
    const attempt = expectRefreshAttempt(service);

    service.setNoneSession();

    expect(
      service.completeRefresh(attempt, {
        accessToken: createAccessToken(futureExpiry + 60),
      }),
    ).toBe(false);
    expect(service.getSnapshot()).toEqual({ status: 'none', mode: 'none' });
  });

  it('rejects an older login attempt after a newer login starts', () => {
    const service = new AuthService();
    const firstAttempt = service.beginLogin();
    const secondAttempt = service.beginLogin();

    expect(
      service.completeLogin(firstAttempt, loginResult(createAccessToken(futureExpiry))),
    ).toBe(false);
    expect(
      service.completeLogin(secondAttempt, loginResult(createAccessToken(futureExpiry))),
    ).toBe(true);
  });

  it('rejects stale failure callbacks', () => {
    const service = new AuthService();
    const attempt = service.beginLogin();

    service.clearSession();

    expect(service.failLogin(attempt, new AuthError('INVALID_CREDENTIALS'))).toBe(false);
    expect(service.getSnapshot()).toEqual({ status: 'disconnected' });
  });
});

describe('AuthService errors and observers', () => {
  it('maps invalid credentials and network failures to distinct states', () => {
    const service = new AuthService();

    const invalidAttempt = service.beginLogin();
    service.failLogin(invalidAttempt, new AuthError('INVALID_CREDENTIALS'));
    expect(service.getSnapshot()).toEqual({
      status: 'unauthenticated',
      mode: 'ui-login',
      reason: 'invalid-credentials',
    });

    const networkAttempt = service.beginLogin();
    service.failLogin(networkAttempt, new AuthError('NETWORK_ERROR'));
    expect(service.getSnapshot().status).toBe('failed');
  });

  it('maps refresh failure to needs-login and network failure to failed', () => {
    const service = new AuthService();
    const accessToken = createAccessToken(Math.floor(Date.now() / 1000) + 3600);

    service.setUiLoginSession({ accessToken, refreshToken: 'refresh-1' });
    const refreshFailure = expectRefreshAttempt(service);
    service.failRefresh(refreshFailure, new AuthError('REFRESH_FAILED'));
    expect(service.getSnapshot()).toEqual({
      status: 'unauthenticated',
      mode: 'ui-login',
      reason: 'refresh-failed',
    });

    service.setUiLoginSession({ accessToken, refreshToken: 'refresh-1' });
    const networkFailure = expectRefreshAttempt(service);
    service.failRefresh(networkFailure, new AuthError('NETWORK_ERROR'));
    expect(service.getSnapshot().status).toBe('failed');
  });

  it('marks an authenticated session as expired', () => {
    const service = new AuthService();
    service.setUiLoginSession({
      accessToken: createAccessToken(Math.floor(Date.now() / 1000) + 3600),
      refreshToken: 'refresh-1',
    });

    service.markExpired();

    expect(service.getSnapshot()).toEqual({
      status: 'unauthenticated',
      mode: 'ui-login',
      reason: 'expired',
    });
    expect(service.getAccessToken()).toBeNull();
  });

  it('notifies subscribers until unsubscribed', () => {
    const service = new AuthService();
    const sessions: AuthSession[] = [];
    const unsubscribe = service.subscribe((session) => sessions.push(session));

    service.setUiLoginRequired();
    unsubscribe();
    service.clearSession();

    expect(sessions).toHaveLength(1);
    expect(sessions[0]).toMatchObject({ status: 'unauthenticated', reason: 'login-required' });
  });

  it('does not leak tokens through error string representations', () => {
    const service = new AuthService();
    const accessToken = createAccessToken(Math.floor(Date.now() / 1000) + 3600);
    const error = new AuthError('REFRESH_FAILED');

    service.setUiLoginSession({ accessToken, refreshToken: 'refresh-secret' });

    expect(String(error)).not.toContain(accessToken);
    expect(String(error)).not.toContain('refresh-secret');
  });
});

describe('basic and simple sessions', () => {
  it('exposes an HTTP Basic authorization header without a JWT', () => {
    const service = new AuthService();
    service.setBasicSession('reader', 'pässword');

    expect(service.getAuthorizationHeader()).toBe(
      `Basic ${btoa(
        String.fromCharCode(...new TextEncoder().encode('reader:pässword')),
      )}`,
    );
    expect(service.getAccessToken()).toBeNull();
    expect(service.getCredentialsMode()).toBe('omit');
    expect(service.getUsername()).toBe('reader');
  });

  it('uses cookies for a simple-login session', () => {
    const service = new AuthService();
    service.setSimpleSession('reader');

    expect(service.getAuthorizationHeader()).toBeNull();
    expect(service.getCredentialsMode()).toBe('include');
    expect(service.getUsername()).toBe('reader');
  });
});

describe('session expiry helpers', () => {
  const now = 1_700_000_000_000;
  const expiry = 1_700_000_000;

  function createSession(exp: number): AuthSession {
    const service = new AuthService();
    service.setUiLoginSession({
      accessToken: createAccessToken(exp),
      refreshToken: 'refresh-1',
    });

    return service.getSnapshot();
  }

  it('detects expired and near-expiry sessions', () => {
    const session = createSession(expiry);

    expect(isSessionAccessTokenExpired(session, now)).toBe(true);
    expect(isSessionAccessTokenExpired(createSession(expiry + 100), now)).toBe(false);
    expect(isSessionAccessTokenNearExpiry(createSession(expiry + 10), now, 30_000)).toBe(true);
    expect(isSessionAccessTokenNearExpiry(createSession(expiry + 60), now, 30_000)).toBe(false);
  });

  it('returns false for sessions without a token expiry', () => {
    const service = new AuthService();
    service.setUiLoginRequired();

    expect(isSessionAccessTokenExpired(service.getSnapshot(), now)).toBe(false);
    expect(isSessionAccessTokenNearExpiry(service.getSnapshot(), now)).toBe(false);
  });
});
