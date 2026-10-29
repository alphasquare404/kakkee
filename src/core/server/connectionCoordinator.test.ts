import { describe, expect, it, vi } from 'vitest';
import { AuthService } from '../auth/authService';
import { DownloadStatusChangedDocument } from '../graphql/generated/graphql';
import {
  createConnectionCoordinator,
  type ConnectionState,
} from './connectionCoordinator';
import type { FetchLike } from '../graphql/authTransport';

const frontendUrl = 'https://frontend.example/app/';

function token(exp = Math.floor(Date.now() / 1000) + 3600): string {
  const encode = (value: string) =>
    btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  return `${encode(JSON.stringify({ alg: 'none', typ: 'JWT' }))}.${encode(
    JSON.stringify({ exp }),
  )}.signature`;
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function aboutData(version = 'v2.4.2366', buildType = 'Stable') {
  return {
    aboutServer: {
      __typename: 'AboutServerPayload',
      name: 'Suwayomi-Server',
      version,
      buildType,
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

function authProbeData(authMode = 'NONE') {
  return { settings: { __typename: 'SettingsType', authMode } };
}

function unauthorizedResponse(): Response {
  return jsonResponse({
    errors: [
      {
        message:
          'Exception while fetching data (/settings) : Unauthorized\r\n\r\nsuwayomi.tachidesk.server.user.UnauthorizedException: Unauthorized',
      },
    ],
  });
}

interface Captured {
  url: string;
  init: RequestInit;
  body: { query: string; variables?: Record<string, unknown> };
}

type Handler = (request: Captured) => Response | Promise<Response>;

function makeFetch(handler: Handler): { fetchImpl: FetchLike; requests: Captured[] } {
  const requests: Captured[] = [];
  const fetchImpl: FetchLike = async (input, init) => {
    const body = JSON.parse(String(init?.body ?? '{}')) as Captured['body'];
    const request = { url: String(input), init: init ?? {}, body };

    requests.push(request);

    return handler(request);
  };

  return { fetchImpl, requests };
}

function header(init: RequestInit, name: string): string | null {
  return new Headers(init.headers).get(name);
}

function isAbout(request: Captured): boolean {
  return request.body.query.includes('AboutServer');
}

function isProbe(request: Captured): boolean {
  return request.body.query.includes('AuthProbe');
}

function isLogin(request: Captured): boolean {
  return request.body.query.includes('mutation Login');
}

function waitFor(predicate: () => boolean, timeoutMs = 2_000): Promise<void> {
  const started = Date.now();

  return new Promise((resolve, reject) => {
    const poll = () => {
      if (predicate()) {
        resolve();
        return;
      }

      if (Date.now() - started >= timeoutMs) {
        reject(new Error('Timed out waiting for coordinator state.'));
        return;
      }

      setTimeout(poll, 5);
    };

    poll();
  });
}

function connectedState(state: ConnectionState) {
  if (state.status !== 'connected') {
    throw new Error(`Expected connected state, received ${state.status}.`);
  }

  return state;
}

describe('ConnectionCoordinator NONE', () => {
  it('connects after aboutServer and a successful protected probe without Authorization', async () => {
    const { fetchImpl, requests } = makeFetch((request) => {
      if (isAbout(request)) {
        return jsonResponse({ data: aboutData() });
      }

      if (isProbe(request)) {
        return jsonResponse({ data: authProbeData('NONE') });
      }

      throw new Error('Unexpected request.');
    });
    const coordinator = createConnectionCoordinator({
      frontendUrl,
      frontendBasePath: '/app/',
      fetchImpl,
    });

    await coordinator.connect('https://server.example/suwayomi/');

    const state = connectedState(coordinator.getState());
    expect(state.context.config.serverBaseUrl).toBe('https://server.example/suwayomi');
    expect(state.context.serverInfo.version).toBe('v2.4.2366');
    expect(state.context.authMode).toBe('NONE');
    expect(state.context.compatibility.status).toBe('compatible');
    expect(requests).toHaveLength(2);
    expect(requests.every((request) => header(request.init, 'authorization') === null)).toBe(true);

    await coordinator.dispose();
  });
});

describe('ConnectionCoordinator UI_LOGIN', () => {
  it('enters login-required, keeps context on invalid credentials, and connects after a valid login', async () => {
    const accessToken = token();
    const refreshToken = token(Math.floor(Date.now() / 1000) + 7200);
    const { fetchImpl, requests } = makeFetch((request) => {
      if (isAbout(request)) {
        return jsonResponse({ data: aboutData() });
      }

      if (isProbe(request)) {
        if (header(request.init, 'authorization') === `Bearer ${accessToken}`) {
          return jsonResponse({ data: authProbeData('UI_LOGIN') });
        }

        return unauthorizedResponse();
      }

      if (isLogin(request)) {
        const variables = request.body.variables as {
          input?: { username?: string; password?: string };
        };

        if (variables.input?.password !== 'correct-password') {
          return jsonResponse({
            errors: [{ message: 'Incorrect username or password.' }],
          });
        }

        return jsonResponse({
          data: { login: { accessToken, refreshToken } },
        });
      }

      throw new Error('Unexpected request.');
    });
    const coordinator = createConnectionCoordinator({
      frontendUrl,
      frontendBasePath: '/app/',
      fetchImpl,
    });

    await coordinator.connect('https://server.example/suwayomi');
    expect(coordinator.getState().status).toBe('login-required');

    await coordinator.login('reader', 'wrong-password');
    const invalid = coordinator.getState();

    expect(invalid.status).toBe('login-required');
    if (invalid.status === 'login-required') {
      expect(invalid.error?.code).toBe('invalid-credentials');
      expect(invalid.serverInfo.version).toBe('v2.4.2366');
      expect(invalid.serverBaseUrl).toBe('https://server.example/suwayomi');
      expect(invalid.error?.message).not.toContain('wrong-password');
    }

    await coordinator.login('reader', 'correct-password');

    const state = connectedState(coordinator.getState());
    expect(state.context.authMode).toBe('UI_LOGIN');
    expect(state.context.serverInfo.version).toBe('v2.4.2366');
    expect(requests.some((request) => isProbe(request) && header(request.init, 'authorization') === `Bearer ${accessToken}`)).toBe(true);

    const stateText = JSON.stringify({
      status: state.status,
      authMode: state.context.authMode,
      serverBaseUrl: state.context.config.serverBaseUrl,
      serverInfo: state.context.serverInfo,
    });
    expect(stateText).not.toContain('correct-password');
    expect(stateText).not.toContain(accessToken);

    await coordinator.dispose();
  });

  it('rejects login outside login-required', async () => {
    const { fetchImpl } = makeFetch((request) => {
      if (isAbout(request)) {
        return jsonResponse({ data: aboutData() });
      }

      return jsonResponse({ data: authProbeData('NONE') });
    });
    const coordinator = createConnectionCoordinator({ frontendUrl, fetchImpl });

    await coordinator.connect('https://server.example');
    await expect(coordinator.login('reader', 'password')).rejects.toMatchObject({
      code: 'invalid-state',
    });

    await coordinator.dispose();
  });
});

describe('ConnectionCoordinator failures', () => {
  it('fails invalid URLs, unreachable servers, and malformed aboutServer data', async () => {
    const invalid = createConnectionCoordinator({
      frontendUrl,
      fetchImpl: async () => {
        throw new Error('unused');
      },
    });
    await invalid.connect('not-a-url');
    const invalidState = invalid.getState();
    expect(invalidState.status).toBe('failed');
    if (invalidState.status === 'failed') {
      expect(invalidState.error.code).toBe('invalid-server-url');
    }
    await invalid.dispose();

    const unreachable = createConnectionCoordinator({
      frontendUrl,
      fetchImpl: async () => {
        throw new TypeError('network down');
      },
    });
    await unreachable.connect('https://server.example');
    const unreachableState = unreachable.getState();
    expect(unreachableState.status).toBe('failed');
    if (unreachableState.status === 'failed') {
      expect(unreachableState.error.code).toBe('unreachable');
    }
    await unreachable.dispose();

    const malformed = createConnectionCoordinator({
      frontendUrl,
      fetchImpl: async () => jsonResponse({ data: {} }),
    });
    await malformed.connect('https://server.example');
    const malformedState = malformed.getState();
    expect(malformedState.status).toBe('failed');
    if (malformedState.status === 'failed') {
      expect(malformedState.error.code).toBe('server-error');
    }
    await malformed.dispose();
  });

  it('rejects a server below the baseline and marks unknown versions conservatively', async () => {
    const below = createConnectionCoordinator({
      frontendUrl,
      fetchImpl: async () => jsonResponse({ data: aboutData('v2.4.2365') }),
    });
    await below.connect('https://server.example');
    expect(below.getState().status).toBe('failed');
    const belowState = below.getState();
    if (belowState.status === 'failed') {
      expect(belowState.error.code).toBe('incompatible-server');
    }
    await below.dispose();

    const preview = createConnectionCoordinator({
      frontendUrl,
      fetchImpl: makeFetch((request) => {
        if (isAbout(request)) {
          return jsonResponse({ data: aboutData('v2.4.2400', 'Preview') });
        }

        return jsonResponse({ data: authProbeData('NONE') });
      }).fetchImpl,
    });
    await preview.connect('https://server.example');
    const previewState = connectedState(preview.getState());
    expect(previewState.context.compatibility.status).toBe('preview');
    expect(previewState.context.compatibility.warning).toBeTruthy();
    await preview.dispose();

    const unknown = createConnectionCoordinator({
      frontendUrl,
      fetchImpl: makeFetch((request) => {
        if (isAbout(request)) {
          return jsonResponse({ data: aboutData('nightly', 'Stable') });
        }

        return jsonResponse({ data: authProbeData('NONE') });
      }).fetchImpl,
    });
    await unknown.connect('https://server.example');
    const unknownState = connectedState(unknown.getState());
    expect(unknownState.context.compatibility.status).toBe('unknown');
    expect(unknownState.context.compatibility.warning).toBeTruthy();
    await unknown.dispose();
  });

  it('detects an HTTP Basic challenge as unsupported-auth', async () => {
    const coordinator = createConnectionCoordinator({
      frontendUrl,
      fetchImpl: async () =>
        new Response('Unauthorized', {
          status: 401,
          headers: {
            'content-type': 'text/plain',
            'www-authenticate': 'Basic realm="suwayomi"',
          },
        }),
    });

    await coordinator.connect('https://server.example');
    const state = coordinator.getState();
    expect(state.status).toBe('unsupported-auth');
    if (state.status === 'unsupported-auth') {
      expect(state.authMode).toBe('BASIC_AUTH');
      expect(state.error.code).toBe('unsupported-auth');
    }

    await coordinator.dispose();
  });
});

describe('ConnectionCoordinator lifecycle and stale protection', () => {
  it('ignores a late connect from server A after server B is connected', async () => {
    let resolveA!: (response: Response) => void;
    const { fetchImpl } = makeFetch((request) => {
      if (request.url.includes('a.example')) {
        return new Promise<Response>((resolve) => {
          resolveA = resolve;
        });
      }

      if (isAbout(request)) {
        return jsonResponse({ data: aboutData() });
      }

      return jsonResponse({ data: authProbeData('NONE') });
    });
    const coordinator = createConnectionCoordinator({ frontendUrl, fetchImpl });
    const first = coordinator.connect('https://a.example');
    await waitFor(() => resolveA !== undefined);
    const second = coordinator.connect('https://b.example');

    await second;
    resolveA(jsonResponse({ data: aboutData() }));
    await first;

    const state = connectedState(coordinator.getState());
    expect(state.context.config.serverBaseUrl).toBe('https://b.example');

    await coordinator.dispose();
  });

  it('ignores a connect result after disconnect', async () => {
    let resolveFetch!: (response: Response) => void;
    const coordinator = createConnectionCoordinator({
      frontendUrl,
      fetchImpl: () =>
        new Promise<Response>((resolve) => {
          resolveFetch = resolve;
        }),
    });

    const pending = coordinator.connect('https://server.example');
    await waitFor(() => resolveFetch !== undefined);
    await coordinator.disconnect();
    resolveFetch(jsonResponse({ data: aboutData() }));
    await pending;

    expect(coordinator.getState().status).toBe('disconnected');
    await coordinator.dispose();
  });

  it('ignores a stale login result after switching servers', async () => {
    let resolveLogin!: (response: Response) => void;
    const { fetchImpl } = makeFetch((request) => {
      if (request.url.includes('b.example')) {
        if (isAbout(request)) {
          return jsonResponse({ data: aboutData() });
        }

        return jsonResponse({ data: authProbeData('NONE') });
      }

      if (isAbout(request)) {
        return jsonResponse({ data: aboutData() });
      }

      if (isProbe(request)) {
        return unauthorizedResponse();
      }

      if (isLogin(request)) {
        return new Promise<Response>((resolve) => {
          resolveLogin = resolve;
        });
      }

      throw new Error('Unexpected request.');
    });
    const coordinator = createConnectionCoordinator({ frontendUrl, fetchImpl });

    await coordinator.connect('https://a.example');
    expect(coordinator.getState().status).toBe('login-required');

    const login = coordinator.login('reader', 'password');
    await waitFor(() => resolveLogin !== undefined);
    await coordinator.connect('https://b.example');
    resolveLogin(
      jsonResponse({
        data: {
          login: {
            accessToken: token(),
            refreshToken: token(Math.floor(Date.now() / 1000) + 7200),
          },
        },
      }),
    );
    await login;

    const state = connectedState(coordinator.getState());
    expect(state.context.config.serverBaseUrl).toBe('https://b.example');
    expect(state.context.authMode).toBe('NONE');

    await coordinator.dispose();
  });

  it('disposes GraphQL, resources, WebSocket, and auth state', async () => {
    const sockets: FakeWebSocket[] = [];
    class FakeWebSocket {
      static readonly CONNECTING = 0;
      static readonly OPEN = 1;
      static readonly CLOSING = 2;
      static readonly CLOSED = 3;
      static instances = sockets;

      readyState = FakeWebSocket.CONNECTING;
      onopen: (() => void) | null = null;
      onmessage: ((event: { data: string }) => void) | null = null;
      onclose: ((event: { code: number }) => void) | null = null;
      onerror: ((event: unknown) => void) | null = null;
      readonly url: string;
      readonly protocols?: string | string[];

      constructor(url: string, protocols?: string | string[]) {
        this.url = url;
        this.protocols = protocols;
        sockets.push(this);
        queueMicrotask(() => {
          this.readyState = FakeWebSocket.OPEN;
          this.onopen?.();
        });
      }

      send(data: string): void {
        const message = JSON.parse(data) as { type?: string };

        if (message.type === 'connection_init') {
          queueMicrotask(() => {
            this.onmessage?.({ data: JSON.stringify({ type: 'connection_ack' }) });
          });
        }
      }

      close(code = 1000): void {
        if (this.readyState === FakeWebSocket.CLOSED) {
          return;
        }

        this.readyState = FakeWebSocket.CLOSED;
        this.onclose?.({ code });
      }
    }

    const { fetchImpl } = makeFetch((request) => {
      if (isAbout(request)) {
        return jsonResponse({ data: aboutData() });
      }

      return jsonResponse({ data: authProbeData('NONE') });
    });
    const coordinator = createConnectionCoordinator({
      frontendUrl,
      fetchImpl,
      webSocketImpl: FakeWebSocket,
    });
    await coordinator.connect('https://server.example');

    const state = connectedState(coordinator.getState());
    const disposeResources = vi.spyOn(state.context.resources, 'dispose');
    const stopApollo = vi.spyOn(state.context.graphQL, 'stop');
    const clearApollo = vi.spyOn(state.context.graphQL, 'clearStore');
    const clearAuth = vi.spyOn(AuthService.prototype, 'clearSession');

    const unsubscribe = state.context.graphQL
      .subscribe({ query: DownloadStatusChangedDocument })
      .subscribe({ next: () => undefined, error: () => undefined });
    await waitFor(() => sockets.length > 0);
    expect(sockets[0].readyState).toBe(FakeWebSocket.OPEN);

    await coordinator.disconnect();

    expect(disposeResources).toHaveBeenCalled();
    expect(stopApollo).toHaveBeenCalled();
    expect(clearApollo).toHaveBeenCalled();
    expect(clearAuth).toHaveBeenCalled();
    expect(sockets[0].readyState).toBe(FakeWebSocket.CLOSED);
    unsubscribe.unsubscribe();
    await coordinator.dispose();
    vi.restoreAllMocks();
  });
});

describe('ConnectionCoordinator subscription', () => {
  it('publishes ordered transitions and supports unsubscribe', async () => {
    const { fetchImpl } = makeFetch((request) => {
      if (isAbout(request)) {
        return jsonResponse({ data: aboutData() });
      }

      return jsonResponse({ data: authProbeData('NONE') });
    });
    const coordinator = createConnectionCoordinator({ frontendUrl, fetchImpl });
    const statuses: string[] = [];
    const unsubscribe = coordinator.subscribe((state) => statuses.push(state.status));

    await coordinator.connect('https://server.example');
    await coordinator.disconnect();
    unsubscribe();
    await coordinator.connect('https://server.example');
    await coordinator.dispose();

    expect(statuses).toEqual([
      'connecting',
      'connected',
      'disconnected',
    ]);
  });

  it('isolates listener failures from coordinator transitions', async () => {
    const { fetchImpl } = makeFetch((request) => {
      if (isAbout(request)) {
        return jsonResponse({ data: aboutData() });
      }

      return jsonResponse({ data: authProbeData('NONE') });
    });
    const coordinator = createConnectionCoordinator({ frontendUrl, fetchImpl });
    coordinator.subscribe(() => {
      throw new Error('listener failure');
    });

    await coordinator.connect('https://server.example');
    expect(coordinator.getState().status).toBe('connected');
    await coordinator.dispose();
  });
});
