import type {
  LoginMutation,
  LoginMutationVariables,
  RefreshTokenMutation,
  RefreshTokenMutationVariables,
} from '../graphql/generated/graphql';
import { AuthError } from './authError';
import type {
  AuthAttempt,
  AuthAttemptKind,
  AuthSession,
  AuthTokens,
  UiLoginUnauthenticatedReason,
} from './session';
import { readAccessTokenExpiry } from './token';

export type LoginResult = Pick<LoginMutation['login'], 'accessToken' | 'refreshToken'>;
export type RefreshResult = Pick<RefreshTokenMutation['refreshToken'], 'accessToken'>;

/**
 * Transport contract for a later step. Step 5 intentionally does not implement
 * fetch, retries, or a generic GraphQL client.
 */
export interface AuthTransport {
  login(input: LoginMutationVariables['input']): Promise<LoginResult>;
  refresh(input: RefreshTokenMutationVariables['input']): Promise<RefreshResult>;
}

function assertTokenPresent(token: string): void {
  if (token.trim() === '') {
    throw new AuthError('MALFORMED_TOKEN');
  }
}

function assertTokensPresent(tokens: AuthTokens): void {
  assertTokenPresent(tokens.accessToken);
  assertTokenPresent(tokens.refreshToken);
}

export class AuthService {
  private session: AuthSession = { status: 'disconnected' };
  private generation = 0;
  private readonly listeners = new Set<(session: AuthSession) => void>();

  public getSnapshot(): AuthSession {
    return this.session;
  }

  public getSession(): AuthSession {
    return this.session;
  }

  public getGeneration(): number {
    return this.generation;
  }

  public subscribe(listener: (session: AuthSession) => void): () => void {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }

  public getAccessToken(): string | null {
    if (this.session.status === 'authenticated' || this.session.status === 'refreshing') {
      return this.session.accessToken;
    }

    return null;
  }

  public getRefreshToken(): string | null {
    if (this.session.status === 'authenticated' || this.session.status === 'refreshing') {
      return this.session.refreshToken;
    }

    return null;
  }

  public setNoneSession(): void {
    this.generation += 1;
    this.setSession({ status: 'none', mode: 'none' });
  }

  public setUiLoginRequired(
    reason: Extract<UiLoginUnauthenticatedReason, 'login-required' | 'expired'> = 'login-required',
  ): void {
    this.generation += 1;
    this.setSession({ status: 'unauthenticated', mode: 'ui-login', reason });
  }

  public setUiLoginSession(tokens: AuthTokens): void {
    assertTokensPresent(tokens);
    const accessTokenExpiresAt = readAccessTokenExpiry(tokens.accessToken);

    this.generation += 1;
    this.setSession({
      status: 'authenticated',
      mode: 'ui-login',
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      accessTokenExpiresAt,
    });
  }

  public beginLogin(): AuthAttempt {
    this.generation += 1;
    this.setSession({
      status: 'unauthenticated',
      mode: 'ui-login',
      reason: 'login-required',
    });

    return { kind: 'login', generation: this.generation };
  }

  public beginRefresh(): AuthAttempt | null {
    if (this.session.status !== 'authenticated') {
      return null;
    }

    const { accessToken, refreshToken, accessTokenExpiresAt } = this.session;

    this.generation += 1;
    this.setSession({
      status: 'refreshing',
      mode: 'ui-login',
      accessToken,
      refreshToken,
      accessTokenExpiresAt,
    });

    return { kind: 'refresh', generation: this.generation };
  }

  public completeLogin(attempt: AuthAttempt, result: LoginResult): boolean {
    if (!this.isCurrent(attempt, 'login')) {
      return false;
    }

    try {
      assertTokensPresent(result);
      const accessTokenExpiresAt = readAccessTokenExpiry(result.accessToken);

      this.generation += 1;
      this.setSession({
        status: 'authenticated',
        mode: 'ui-login',
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        accessTokenExpiresAt,
      });

      return true;
    } catch (error) {
      const authError = error instanceof AuthError ? error : new AuthError('MALFORMED_TOKEN');

      this.generation += 1;
      this.setSession({ status: 'failed', mode: 'ui-login', error: authError });

      return false;
    }
  }

  public completeRefresh(attempt: AuthAttempt, result: RefreshResult): boolean {
    if (!this.isCurrent(attempt, 'refresh') || this.session.status !== 'refreshing') {
      return false;
    }

    const { refreshToken } = this.session;

    try {
      assertTokenPresent(result.accessToken);
      const accessTokenExpiresAt = readAccessTokenExpiry(result.accessToken);

      this.generation += 1;
      this.setSession({
        status: 'authenticated',
        mode: 'ui-login',
        accessToken: result.accessToken,
        refreshToken,
        accessTokenExpiresAt,
      });

      return true;
    } catch (error) {
      const authError = error instanceof AuthError ? error : new AuthError('MALFORMED_TOKEN');

      this.generation += 1;
      this.setSession({ status: 'failed', mode: 'ui-login', error: authError });

      return false;
    }
  }

  public failLogin(attempt: AuthAttempt, error: AuthError): boolean {
    if (!this.isCurrent(attempt, 'login')) {
      return false;
    }

    this.generation += 1;

    if (error.code === 'INVALID_CREDENTIALS') {
      this.setSession({
        status: 'unauthenticated',
        mode: 'ui-login',
        reason: 'invalid-credentials',
      });
    } else if (error.code === 'SESSION_EXPIRED') {
      this.setSession({ status: 'unauthenticated', mode: 'ui-login', reason: 'expired' });
    } else {
      this.setSession({ status: 'failed', mode: 'ui-login', error });
    }

    return true;
  }

  public failRefresh(attempt: AuthAttempt, error: AuthError): boolean {
    if (!this.isCurrent(attempt, 'refresh')) {
      return false;
    }

    this.generation += 1;

    if (error.code === 'NETWORK_ERROR') {
      this.setSession({ status: 'failed', mode: 'ui-login', error });
    } else {
      this.setSession({
        status: 'unauthenticated',
        mode: 'ui-login',
        reason: 'refresh-failed',
      });
    }

    return true;
  }

  public markExpired(): void {
    this.generation += 1;
    this.setSession({ status: 'unauthenticated', mode: 'ui-login', reason: 'expired' });
  }

  public clearSession(): void {
    this.generation += 1;
    this.setSession({ status: 'disconnected' });
  }

  private isCurrent(attempt: AuthAttempt, kind: AuthAttemptKind): boolean {
    return attempt.kind === kind && attempt.generation === this.generation;
  }

  private setSession(session: AuthSession): void {
    this.session = session;

    for (const listener of [...this.listeners]) {
      listener(session);
    }
  }
}

export function createAuthService(): AuthService {
  return new AuthService();
}
