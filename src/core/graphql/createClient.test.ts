import { parse } from 'graphql';
import { describe, expect, it } from 'vitest';
import { AuthService } from '../auth/authService';
import { createDeploymentConfig } from '../config/deployment';
import { AboutServerDocument } from './generated/graphql';
import { createGraphQLTransport } from './createClient';
import type { FetchLike } from './authTransport';

const config = createDeploymentConfig({
  frontendUrl: 'https://example.com/',
  frontendBasePath: '/',
  serverBaseUrl: 'https://example.com',
});

function base64Url(value: string): string {
  return btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function createToken(exp = Math.floor(Date.now() / 1000) + 3600): string {
  const header = base64Url(JSON.stringify({ alg: 'none', typ: 'JWT' }));
  const payload = base64Url(JSON.stringify({ exp }));

  return `${header}.${payload}.signature`;
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function aboutServerData() {
  return {
    aboutServer: {
      __typename: 'AboutServerPayload',
      name: 'Suwayomi-Server',
      version: 'v2.4.2366',
      buildType: 'Stable',
      buildTime: '1',
      platformInfo: {
        __typename: 'PlatformInfo',
        arch: 'amd64',
        headless: true,
        os: { __typename: 'OSInfo', name: 'Linux', version: '1', build: '2' },
        jvm: {
          __typename: 'JvmInfo',
          javaVersion: '21',
          vmName: 'OpenJDK',
          vmVersion: '21',
          vmVendor: 'Temurin',
        },
      },
    },
  };
}

interface CapturedRequest {
  url: string;
  init: RequestInit;
  body: { query: string; variables?: Record<string, unknown> };
}

function capture(
  response: (body: CapturedRequest['body'], init: RequestInit) => Response | Promise<Response>,
): { fetchImpl: FetchLike; requests: CapturedRequest[] } {
  const requests: CapturedRequest[] = [];
  const fetchImpl: FetchLike = async (input, init) => {
    const body = JSON.parse(String(init?.body ?? '{}')) as CapturedRequest['body'];
    const requestInit = init ?? {};

    requests.push({ url: String(input), init: requestInit, body });

    return response(body, requestInit);
  };

  return { fetchImpl, requests };
}

function getHeader(init: RequestInit, name: string): string | null {
  return new Headers(init.headers).get(name);
}

async function waitFor(predicate: () => boolean, timeoutMs = 2_000): Promise<void> {
  const started = Date.now();

  while (!predicate()) {
    if (Date.now() - started >= timeoutMs) {
      throw new Error('Timed out waiting for transport state.');
    }

    await new Promise((resolve) => setTimeout(resolve, 5));
  }
}

describe('createGraphQLTransport HTTP', () => {
  it('posts AboutServer to the resolver URL without Authorization for NONE', async () => {
    const authService = new AuthService();
    authService.setNoneSession();
    const { fetchImpl, requests } = capture(() => jsonResponse({ data: aboutServerData() }));
    const transport = createGraphQLTransport({ config, authService, fetchImpl });

    const result = await transport.client.query({
      query: AboutServerDocument,
      fetchPolicy: 'no-cache',
    });

    expect(result.data?.aboutServer.version).toBe('v2.4.2366');
    expect(requests).toHaveLength(1);
    expect(requests[0].url).toBe('https://example.com/api/graphql');
    expect(requests[0].init.method).toBe('POST');
    expect(requests[0].init.credentials).toBe('omit');
    expect(getHeader(requests[0].init, 'authorization')).toBeNull();

    await transport.dispose();
  });

  it('adds a Bearer access token for an authenticated UI_LOGIN session', async () => {
    const accessToken = createToken();
    const authService = new AuthService();
    authService.setUiLoginSession({ accessToken, refreshToken: 'refresh-token' });
    const { fetchImpl, requests } = capture(() => jsonResponse({ data: aboutServerData() }));
    const transport = createGraphQLTransport({ config, authService, fetchImpl });

    await transport.client.query({ query: AboutServerDocument, fetchPolicy: 'no-cache' });

    expect(getHeader(requests[0].init, 'authorization')).toBe(`Bearer ${accessToken}`);

    await transport.dispose();
  });

  it('does not send Authorization for login or refresh auth transport calls', async () => {
    const authService = new AuthService();
    authService.setNoneSession();
    const { fetchImpl, requests } = capture((body) => {
      if (body.query.includes('mutation Login')) {
        return jsonResponse({
          data: { login: { accessToken: 'access', refreshToken: 'refresh' } },
        });
      }

      return jsonResponse({ data: { refreshToken: { accessToken: 'next-access' } } });
    });
    const transport = createGraphQLTransport({ config, authService, fetchImpl });

    await transport.authTransport.login({ username: 'reader', password: 'secret' });
    await transport.authTransport.refresh({ refreshToken: 'refresh' });

    expect(requests).toHaveLength(2);
    expect(requests.every((request) => getHeader(request.init, 'authorization') === null)).toBe(
      true,
    );

    await transport.dispose();
  });
});

describe('createGraphQLTransport refresh coordination', () => {
  it('uses one refresh for concurrent unauthorized requests and retries each once', async () => {
    const initialToken = createToken();
    const refreshedToken = createToken(Math.floor(Date.now() / 1000) + 7200);
    const authService = new AuthService();
    authService.setUiLoginSession({ accessToken: initialToken, refreshToken: 'refresh-token' });

    let queryCalls = 0;
    let refreshCalls = 0;
    const { fetchImpl, requests } = capture((body, init) => {
      if (body.query.includes('mutation RefreshToken')) {
        refreshCalls += 1;

        return jsonResponse({ data: { refreshToken: { accessToken: refreshedToken } } });
      }

      queryCalls += 1;

      if (getHeader(init, 'authorization') === `Bearer ${initialToken}`) {
        return jsonResponse({
          errors: [{ message: 'suwayomi.tachidesk.server.user.UnauthorizedException: Unauthorized' }],
        });
      }

      return jsonResponse({ data: { __typename: 'Query' } });
    });
    const transport = createGraphQLTransport({ config, authService, fetchImpl });
    const health = parse('query Health($include: Boolean!) { __typename @include(if: $include) }');

    const [first, second] = await Promise.all([
      transport.client.query({
        query: health,
        variables: { include: true },
        fetchPolicy: 'no-cache',
      }),
      transport.client.query({
        query: health,
        variables: { include: false },
        fetchPolicy: 'no-cache',
      }),
    ]);

    expect(first.data).toEqual({ __typename: 'Query' });
    expect(second.data).toEqual({ __typename: 'Query' });
    expect(refreshCalls).toBe(1);
    expect(queryCalls).toBeGreaterThanOrEqual(2);
    expect(authService.getAccessToken()).toBe(refreshedToken);
    expect(authService.getRefreshToken()).toBe('refresh-token');
    expect(requests.filter((request) => request.body.query.includes('mutation RefreshToken'))).toHaveLength(1);

    await transport.dispose();
  });

  it('does not loop when the retried request is still unauthorized', async () => {
    const authService = new AuthService();
    authService.setUiLoginSession({
      accessToken: createToken(),
      refreshToken: 'refresh-token',
    });

    let queryCalls = 0;
    let refreshCalls = 0;
    const { fetchImpl } = capture((body) => {
      if (body.query.includes('mutation RefreshToken')) {
        refreshCalls += 1;
        return jsonResponse({ data: { refreshToken: { accessToken: createToken() } } });
      }

      queryCalls += 1;

      return jsonResponse({
        errors: [{ message: 'suwayomi.tachidesk.server.user.UnauthorizedException: Unauthorized' }],
      });
    });
    const transport = createGraphQLTransport({ config, authService, fetchImpl });
    const health = parse('query Health { __typename }');

    await expect(
      transport.client.query({ query: health, fetchPolicy: 'no-cache' }),
    ).rejects.toBeTruthy();

    expect(queryCalls).toBe(2);
    expect(refreshCalls).toBe(1);

    await transport.dispose();
  });

  it('does not refresh Forbidden or NONE sessions', async () => {
    const noneService = new AuthService();
    noneService.setNoneSession();
    let noneRefreshCalls = 0;
    const none = capture((body) => {
      if (body.query.includes('mutation RefreshToken')) {
        noneRefreshCalls += 1;
      }

      return jsonResponse({
        errors: [{ message: 'suwayomi.tachidesk.server.user.UnauthorizedException: Unauthorized' }],
      });
    });
    const noneTransport = createGraphQLTransport({
      config,
      authService: noneService,
      fetchImpl: none.fetchImpl,
    });
    const health = parse('query Health { __typename }');

    await expect(
      noneTransport.client.query({ query: health, fetchPolicy: 'no-cache' }),
    ).rejects.toBeTruthy();
    expect(noneRefreshCalls).toBe(0);
    expect(noneService.getSnapshot()).toEqual({ status: 'none', mode: 'none' });
    await noneTransport.dispose();

    const authService = new AuthService();
    authService.setUiLoginSession({
      accessToken: createToken(),
      refreshToken: 'refresh-token',
    });
    let forbiddenRefreshCalls = 0;
    const forbidden = capture((body) => {
      if (body.query.includes('mutation RefreshToken')) {
        forbiddenRefreshCalls += 1;
      }

      return jsonResponse({
        errors: [{ message: 'suwayomi.tachidesk.server.user.ForbiddenException: Forbidden' }],
      });
    });
    const forbiddenTransport = createGraphQLTransport({
      config,
      authService,
      fetchImpl: forbidden.fetchImpl,
    });

    await expect(
      forbiddenTransport.client.query({ query: health, fetchPolicy: 'no-cache' }),
    ).rejects.toBeTruthy();
    expect(forbiddenRefreshCalls).toBe(0);
    await forbiddenTransport.dispose();
  });

  it('rejects a stale refresh result after the session is reset', async () => {
    const authService = new AuthService();
    authService.setUiLoginSession({
      accessToken: createToken(),
      refreshToken: 'refresh-token',
    });

    let resolveRefresh!: (response: Response) => void;
    let refreshCalls = 0;
    let queryCalls = 0;
    const { fetchImpl } = capture((body) => {
      if (body.query.includes('mutation RefreshToken')) {
        refreshCalls += 1;

        return new Promise<Response>((resolve) => {
          resolveRefresh = resolve;
        });
      }

      queryCalls += 1;

      return jsonResponse({
        errors: [{ message: 'suwayomi.tachidesk.server.user.UnauthorizedException: Unauthorized' }],
      });
    });
    const transport = createGraphQLTransport({ config, authService, fetchImpl });
    const health = parse('query Health { __typename }');
    const queryPromise = transport.client.query({ query: health, fetchPolicy: 'no-cache' });

    await waitFor(() => refreshCalls === 1);
    authService.clearSession();
    resolveRefresh(
      jsonResponse({ data: { refreshToken: { accessToken: createToken() } } }),
    );

    await expect(queryPromise).rejects.toBeTruthy();
    expect(refreshCalls).toBe(1);
    expect(queryCalls).toBe(1);
    expect(authService.getSnapshot()).toEqual({ status: 'disconnected' });

    await transport.dispose();
  });
});

describe('createGraphQLTransport lifecycle', () => {
  it('clears the Apollo cache and disposes idempotently', async () => {
    const authService = new AuthService();
    authService.setNoneSession();
    const { fetchImpl } = capture(() => jsonResponse({ data: aboutServerData() }));
    const transport = createGraphQLTransport({ config, authService, fetchImpl });

    await transport.client.query({ query: AboutServerDocument, fetchPolicy: 'no-cache' });
    await transport.clearCache();

    const extracted = transport.client.cache.extract() as Record<string, unknown>;
    expect(Object.keys(extracted)).toHaveLength(0);

    await transport.dispose();
    await transport.dispose();
    expect(transport.client).toBeDefined();
  });
});
