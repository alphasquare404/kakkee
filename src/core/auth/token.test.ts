import { describe, expect, it } from 'vitest';
import { AuthError } from './authError';
import {
  isTokenExpired,
  isTokenNearExpiry,
  readAccessTokenExpiry,
} from './token';

function base64Url(value: string): string {
  return btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function createToken(payload: Record<string, unknown>, signature = 'signature'): string {
  const header = base64Url(JSON.stringify({ alg: 'none', typ: 'JWT' }));
  const body = base64Url(JSON.stringify(payload));

  return `${header}.${body}.${signature}`;
}

function getTokenError(token: string): AuthError {
  try {
    readAccessTokenExpiry(token);
  } catch (error) {
    expect(error).toBeInstanceOf(AuthError);
    return error as AuthError;
  }

  throw new Error('Expected token parsing to fail.');
}

describe('readAccessTokenExpiry', () => {
  it('reads a valid exp claim as epoch milliseconds', () => {
    const token = createToken({ exp: 1_700_000_000 });

    expect(readAccessTokenExpiry(token)).toBe(1_700_000_000_000);
  });

  it('returns null when exp is absent', () => {
    const token = createToken({ sub: 'user' });

    expect(readAccessTokenExpiry(token)).toBeNull();
  });

  it('rejects malformed tokens and non-numeric exp values', () => {
    expect(getTokenError('not-a-token').code).toBe('MALFORMED_TOKEN');
    expect(getTokenError('header.payload').code).toBe('MALFORMED_TOKEN');
    expect(getTokenError('header.%%%.signature').code).toBe('MALFORMED_TOKEN');
    expect(getTokenError(createToken({ exp: 'tomorrow' })).code).toBe('MALFORMED_TOKEN');
    expect(getTokenError(createToken({ exp: null })).code).toBe('MALFORMED_TOKEN');
    expect(getTokenError(createToken({ exp: 1 }, '')).code).toBe('MALFORMED_TOKEN');
  });

  it('does not include the token in an error message', () => {
    const token = 'super-secret-token-value';
    const error = getTokenError(token);

    expect(String(error)).not.toContain(token);
    expect(error.message).not.toContain(token);
  });
});

describe('token expiry helpers', () => {
  const now = 1_700_000_000_000;

  it('detects expired and future expiry', () => {
    expect(isTokenExpired(now - 1, now)).toBe(true);
    expect(isTokenExpired(now, now)).toBe(true);
    expect(isTokenExpired(now + 1, now)).toBe(false);
    expect(isTokenExpired(null, now)).toBe(false);
  });

  it('detects near expiry with a configurable skew', () => {
    expect(isTokenNearExpiry(now + 10_000, now, 30_000)).toBe(true);
    expect(isTokenNearExpiry(now + 60_000, now, 30_000)).toBe(false);
    expect(isTokenNearExpiry(now + 10_000, now, 0)).toBe(false);
    expect(isTokenNearExpiry(null, now, 30_000)).toBe(false);
  });
});
