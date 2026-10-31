import type { AuthError } from './authError';
import { isTokenExpired, isTokenNearExpiry } from './token';

export type AuthAttemptKind = 'login' | 'refresh';

export interface AuthAttempt {
  readonly kind: AuthAttemptKind;
  readonly generation: number;
}

export interface AuthTokens {
  readonly accessToken: string;
  readonly refreshToken: string;
}

export interface DisconnectedSession {
  readonly status: 'disconnected';
}

export interface NoneSession {
  readonly status: 'none';
  readonly mode: 'none';
}

export type UiLoginUnauthenticatedReason =
  | 'login-required'
  | 'invalid-credentials'
  | 'expired'
  | 'refresh-failed';

export interface UiLoginUnauthenticatedSession {
  readonly status: 'unauthenticated';
  readonly mode: 'ui-login';
  readonly reason: UiLoginUnauthenticatedReason;
}

export interface UiLoginAuthenticatedSession {
  readonly status: 'authenticated';
  readonly mode: 'ui-login';
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly accessTokenExpiresAt: number | null;
}

export interface UiLoginRefreshingSession {
  readonly status: 'refreshing';
  readonly mode: 'ui-login';
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly accessTokenExpiresAt: number | null;
}

export interface UiLoginFailedSession {
  readonly status: 'failed';
  readonly mode: 'ui-login';
  readonly error: AuthError;
}

export interface BasicAuthenticatedSession {
  readonly status: 'authenticated';
  readonly mode: 'basic';
  readonly username: string;
  readonly authorization: string;
}

export interface SimpleAuthenticatedSession {
  readonly status: 'authenticated';
  readonly mode: 'simple';
  readonly username: string;
}

export type AuthSession =
  | DisconnectedSession
  | NoneSession
  | UiLoginUnauthenticatedSession
  | UiLoginAuthenticatedSession
  | UiLoginRefreshingSession
  | UiLoginFailedSession
  | BasicAuthenticatedSession
  | SimpleAuthenticatedSession;

export function isUiLoginSession(
  session: AuthSession,
): session is
  | UiLoginUnauthenticatedSession
  | UiLoginAuthenticatedSession
  | UiLoginRefreshingSession
  | UiLoginFailedSession {
  return 'mode' in session && session.mode === 'ui-login';
}

function getAccessTokenExpiry(session: AuthSession): number | null {
  if (isUiLoginSession(session) && session.status === 'authenticated') {
    return session.accessTokenExpiresAt;
  }

  if (isUiLoginSession(session) && session.status === 'refreshing') {
    return session.accessTokenExpiresAt;
  }

  return null;
}

export function isAuthenticatedSession(
  session: AuthSession,
): session is
  | UiLoginAuthenticatedSession
  | BasicAuthenticatedSession
  | SimpleAuthenticatedSession {
  return session.status === 'authenticated';
}

export function isNoneSession(session: AuthSession): session is NoneSession {
  return session.status === 'none';
}

export function isSessionAccessTokenExpired(
  session: AuthSession,
  now = Date.now(),
): boolean {
  return isTokenExpired(getAccessTokenExpiry(session), now);
}

export function isSessionAccessTokenNearExpiry(
  session: AuthSession,
  now = Date.now(),
  skewMs?: number,
): boolean {
  return isTokenNearExpiry(getAccessTokenExpiry(session), now, skewMs);
}
