import { AuthError } from './authError';

const DEFAULT_REFRESH_SKEW_MS = 30_000;

function decodeBase64Url(value: string): string {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');

  try {
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));

    return new TextDecoder().decode(bytes);
  } catch {
    throw new AuthError('MALFORMED_TOKEN');
  }
}

function readPayload(token: string): Record<string, unknown> {
  const parts = token.split('.');

  if (parts.length !== 3 || parts.some((part) => part === '')) {
    throw new AuthError('MALFORMED_TOKEN');
  }

  let payload: unknown;

  try {
    payload = JSON.parse(decodeBase64Url(parts[1]));
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }

    throw new AuthError('MALFORMED_TOKEN');
  }

  if (typeof payload !== 'object' || payload === null || Array.isArray(payload)) {
    throw new AuthError('MALFORMED_TOKEN');
  }

  return payload as Record<string, unknown>;
}

/**
 * Reads `exp` from a JWT access token without verifying its signature.
 * The returned value is epoch milliseconds, or `null` when `exp` is absent.
 */
export function readAccessTokenExpiry(token: string): number | null {
  const payload = readPayload(token);

  if (!('exp' in payload)) {
    return null;
  }

  if (typeof payload.exp !== 'number' || !Number.isFinite(payload.exp)) {
    throw new AuthError('MALFORMED_TOKEN');
  }

  return payload.exp * 1000;
}

export function isTokenExpired(expiresAt: number | null, now = Date.now()): boolean {
  return expiresAt !== null && expiresAt <= now;
}

export function isTokenNearExpiry(
  expiresAt: number | null,
  now = Date.now(),
  skewMs = DEFAULT_REFRESH_SKEW_MS,
): boolean {
  return expiresAt !== null && expiresAt - skewMs <= now;
}
