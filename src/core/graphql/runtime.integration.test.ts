import { describe, expect, it } from 'vitest';
import { AuthError } from '../auth/authError';
import { AuthService } from '../auth/authService';
import { createDeploymentConfig } from '../config/deployment';
import { AboutServerDocument, AuthProbeDocument, DownloadStatusChangedDocument } from './generated/graphql';
import { createGraphQLTransport, type GraphQLTransport } from './createClient';

const noneUrl = import.meta.env.VITE_RUNTIME_NONE_URL;
const uiUrl = import.meta.env.VITE_RUNTIME_UI_URL;
const uiPassword = import.meta.env.VITE_RUNTIME_UI_PASSWORD;
const hasRuntime = Boolean(noneUrl && uiUrl && uiPassword);
const describeRuntime = hasRuntime ? describe : describe.skip;

function deployment(serverBaseUrl: string) {
  return createDeploymentConfig({
    frontendUrl: 'http://127.0.0.1/',
    frontendBasePath: '/',
    serverBaseUrl,
  });
}

function createToken(exp = Math.floor(Date.now() / 1000) + 3600): string {
  const encode = (value: object) =>
    btoa(JSON.stringify(value)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  return `${encode({ alg: 'none', typ: 'JWT' })}.${encode({ exp })}.invalid-signature`;
}

function waitForSubscription(
  transport: GraphQLTransport,
  timeoutMs = 15_000,
): Promise<{ data?: { downloadStatusChanged?: { state?: string } } }> {
  return new Promise((resolve, reject) => {
    let subscription: { unsubscribe: () => void } = { unsubscribe: () => undefined };

    const timer = setTimeout(() => {
      subscription.unsubscribe();
      reject(new Error('Timed out waiting for subscription event.'));
    }, timeoutMs);

    subscription = transport.client
      .subscribe<{ downloadStatusChanged?: { state?: string } }>({
        query: DownloadStatusChangedDocument,
      })
      .subscribe({
        next: (value) => {
          clearTimeout(timer);
          subscription.unsubscribe();
          resolve(value);
        },
        error: (error) => {
          clearTimeout(timer);
          reject(error);
        },
      });
  });
}

describeRuntime('stable v2.4.2366 transport', () => {
  it('NONE: queries aboutServer and receives the initial download subscription', async () => {
    const authService = new AuthService();
    authService.setNoneSession();
    const transport = createGraphQLTransport({
      config: deployment(noneUrl!),
      authService,
    });

    try {
      const query = await transport.client.query({
        query: AboutServerDocument,
        fetchPolicy: 'no-cache',
      });
      expect(query.data?.aboutServer.version).toBe('v2.4.2366');

      const authProbe = await transport.client.query({
        query: AuthProbeDocument,
        fetchPolicy: 'no-cache',
      });
      expect(authProbe.data?.settings.authMode).toBe('NONE');

      const event = await waitForSubscription(transport);
      expect(event.data?.downloadStatusChanged?.state).toBe('STOPPED');
    } finally {
      await transport.dispose();
    }
  });

  it('UI_LOGIN: login, protected query, refresh, and raw-token subscription', async () => {
    const authService = new AuthService();
    const transport = createGraphQLTransport({
      config: deployment(uiUrl!),
      authService,
    });

    try {
      await expect(
        transport.authTransport.login({ username: 'audit-admin', password: 'wrong-password' }),
      ).rejects.toMatchObject({ code: 'INVALID_CREDENTIALS' });

      const login = await transport.authTransport.login({
        username: 'audit-admin',
        password: uiPassword!,
      });
      authService.setUiLoginSession(login);

      const protectedQuery = await transport.client.query({
        query: AuthProbeDocument,
        fetchPolicy: 'no-cache',
      });
      expect(protectedQuery.data?.settings.authMode).toBe('UI_LOGIN');

      const invalidAccessToken = createToken();
      authService.setUiLoginSession({
        accessToken: invalidAccessToken,
        refreshToken: login.refreshToken,
      });

      const refreshedQuery = await transport.client.query({
        query: AuthProbeDocument,
        fetchPolicy: 'no-cache',
      });
      expect(refreshedQuery.data?.settings.authMode).toBe('UI_LOGIN');
      expect(authService.getAccessToken()).not.toBe(invalidAccessToken);
      expect(authService.getRefreshToken()).toBe(login.refreshToken);

      const event = await waitForSubscription(transport);
      expect(event.data?.downloadStatusChanged?.state).toBe('STOPPED');
    } catch (error) {
      if (error instanceof AuthError) {
        throw new Error(`Runtime auth failure: ${error.code}`, { cause: error });
      }

      throw error;
    } finally {
      await transport.dispose();
    }
  });
});
