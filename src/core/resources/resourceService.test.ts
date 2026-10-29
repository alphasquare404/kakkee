import { afterEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from '../auth/authService';
import { createDeploymentConfig } from '../config/deployment';
import { createResourceService, type ResourceFetch } from './resourceService';
import { ResourceError } from './resourceError';

const config = createDeploymentConfig({
  frontendUrl: 'https://frontend.example/app/',
  frontendBasePath: '/app/',
  serverBaseUrl: 'https://server.example/suwayomi',
});

interface CapturedRequest {
  url: string;
  init: RequestInit;
}

function createToken(exp = Math.floor(Date.now() / 1000) + 3600): string {
  const encode = (value: string) =>
    btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const header = encode(JSON.stringify({ alg: 'none', typ: 'JWT' }));
  const payload = encode(JSON.stringify({ exp }));

  return `${header}.${payload}.signature`;
}

function imageResponse(contentType = 'image/png'): Response {
  return new Response(new Blob(['image-bytes'], { type: contentType }), {
    status: 200,
    headers: { 'content-type': contentType },
  });
}

function capture(
  response: Response | (() => Promise<Response>),
  captured: CapturedRequest[] = [],
): ResourceFetch {
  return async (input, init) => {
    captured.push({ url: String(input), init: init ?? {} });

    return typeof response === 'function' ? response() : response;
  };
}

function header(init: RequestInit, name: string): string | null {
  return new Headers(init.headers).get(name);
}

async function errorFrom(promise: Promise<unknown>): Promise<ResourceError> {
  try {
    await promise;
  } catch (error) {
    expect(error).toBeInstanceOf(ResourceError);
    return error as ResourceError;
  }

  throw new Error('Expected resource operation to fail.');
}

function noneService(): AuthService {
  const authService = new AuthService();
  authService.setNoneSession();

  return authService;
}

function uiService(accessToken = createToken()): AuthService {
  const authService = new AuthService();
  authService.setUiLoginSession({ accessToken, refreshToken: 'refresh-token' });

  return authService;
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
        reject(new Error('Timed out waiting for resource state.'));
        return;
      }

      setTimeout(poll, 5);
    };

    poll();
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('ResourceService NONE', () => {
  it('preserves the server subpath, sends no Authorization, and revokes the object URL', async () => {
    const createObjectUrl = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:resource-1');
    const revokeObjectUrl = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
    const captured: CapturedRequest[] = [];
    const service = createResourceService({
      config,
      authService: noneService(),
      fetchImpl: capture(imageResponse(), captured),
    });

    const resource = await service.loadImageResource('/api/v1/manga/123/thumbnail');

    expect(captured[0].url).toBe('https://server.example/suwayomi/api/v1/manga/123/thumbnail');
    expect(captured[0].init.method).toBe('GET');
    expect(captured[0].init.credentials).toBe('omit');
    expect(captured[0].init.redirect).toBe('manual');
    expect(header(captured[0].init, 'authorization')).toBeNull();
    expect(resource.contentType).toBe('image/png');
    expect(resource.objectUrl).toBe('blob:resource-1');
    expect(resource.blob.type).toBe('image/png');
    expect(createObjectUrl).toHaveBeenCalledTimes(1);

    resource.dispose();
    expect(revokeObjectUrl).toHaveBeenCalledWith('blob:resource-1');
    service.dispose();
  });
});

describe('ResourceService UI_LOGIN', () => {
  it('sends Bearer and reads the latest access token for each request', async () => {
    const firstToken = createToken();
    const secondToken = createToken(Math.floor(Date.now() / 1000) + 7200);
    const authService = uiService(firstToken);
    const captured: CapturedRequest[] = [];
    const service = createResourceService({
      config,
      authService,
      fetchImpl: capture(() => Promise.resolve(imageResponse()), captured),
    });

    const first = await service.loadResource('/api/v1/chapter/1/page/1');
    expect(header(captured[0].init, 'authorization')).toBe(`Bearer ${firstToken}`);
    first.dispose();

    authService.setUiLoginSession({ accessToken: secondToken, refreshToken: 'refresh-token' });
    const second = await service.loadResource('/api/v1/chapter/1/page/1');
    expect(header(captured[1].init, 'authorization')).toBe(`Bearer ${secondToken}`);

    second.dispose();
    service.dispose();
  });

  it('does not fetch silently when UI_LOGIN is unauthenticated or disconnected', async () => {
    const captured: CapturedRequest[] = [];
    const unauthenticated = new AuthService();
    unauthenticated.setUiLoginRequired();
    const service = createResourceService({
      config,
      authService: unauthenticated,
      fetchImpl: capture(imageResponse(), captured),
    });

    expect((await errorFrom(service.loadResource('/api/v1/manga/1/thumbnail'))).code).toBe(
      'unauthorized',
    );
    expect(captured).toHaveLength(0);
    service.dispose();

    const disconnected = new AuthService();
    const disconnectedService = createResourceService({
      config,
      authService: disconnected,
      fetchImpl: capture(imageResponse(), captured),
    });
    expect(
      (await errorFrom(disconnectedService.loadResource('/api/v1/manga/1/thumbnail'))).code,
    ).toBe('unauthorized');
    expect(captured).toHaveLength(0);
    disconnectedService.dispose();
  });
});

describe('ResourceService URL security', () => {
  it.each([
    ['cross-origin absolute', 'https://evil.example/api/v1/manga/1/thumbnail'],
    ['outside server prefix', 'https://server.example/other/api/v1/manga/1/thumbnail'],
    ['protocol-relative', '//evil.example/api/v1/manga/1/thumbnail'],
    ['traversal', '/api/v1/../secret'],
  ])('rejects %s before fetching', async (_name, path) => {
    const captured: CapturedRequest[] = [];
    const service = createResourceService({
      config,
      authService: noneService(),
      fetchImpl: capture(imageResponse(), captured),
    });

    expect((await errorFrom(service.loadResource(path))).code).toBe('unsafe-resource');
    expect(captured).toHaveLength(0);
    service.dispose();
  });

  it('rejects redirect responses instead of following them', async () => {
    const captured: CapturedRequest[] = [];
    const service = createResourceService({
      config,
      authService: noneService(),
      fetchImpl: capture(
        new Response(null, {
          status: 302,
          headers: { location: 'https://evil.example/resource' },
        }),
        captured,
      ),
    });

    expect((await errorFrom(service.loadResource('/api/v1/manga/1/thumbnail'))).code).toBe(
      'unsafe-resource',
    );
    expect(captured).toHaveLength(1);
    service.dispose();
  });

  it('rejects a final response URL outside the server boundary', async () => {
    const response = imageResponse();
    Object.defineProperty(response, 'url', {
      value: 'https://evil.example/api/v1/manga/1/thumbnail',
    });
    const service = createResourceService({
      config,
      authService: noneService(),
      fetchImpl: capture(response),
    });

    expect((await errorFrom(service.loadResource('/api/v1/manga/1/thumbnail'))).code).toBe(
      'unsafe-resource',
    );
    service.dispose();
  });
});

describe('ResourceService errors', () => {
  it.each([
    [401, 'unauthorized'],
    [403, 'forbidden'],
    [404, 'not-found'],
    [500, 'http'],
  ] as const)('normalizes HTTP %i to %s', async (status, code) => {
    const service = createResourceService({
      config,
      authService: noneService(),
      fetchImpl: capture(new Response('failure', { status })),
    });

    const error = await errorFrom(service.loadResource('/api/v1/manga/1/thumbnail'));
    expect(error.code).toBe(code);
    expect(error.status).toBe(status);
    service.dispose();
  });

  it('normalizes network failure and distinguishes abort', async () => {
    const networkService = createResourceService({
      config,
      authService: noneService(),
      fetchImpl: async () => {
        throw new TypeError('network down');
      },
    });
    expect(
      (await errorFrom(networkService.loadResource('/api/v1/manga/1/thumbnail'))).code,
    ).toBe('network');
    networkService.dispose();

    const controller = new AbortController();
    const abortService = createResourceService({
      config,
      authService: noneService(),
      fetchImpl: (_input, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener(
            'abort',
            () => reject(new DOMException('Aborted', 'AbortError')),
            { once: true },
          );
        }),
    });
    const pending = abortService.loadResource('/api/v1/manga/1/thumbnail', {
      signal: controller.signal,
    });
    await Promise.resolve();
    controller.abort();

    expect((await errorFrom(pending)).code).toBe('aborted');
    abortService.dispose();
  });

  it('rejects an already-aborted signal without fetching', async () => {
    const captured: CapturedRequest[] = [];
    const controller = new AbortController();
    controller.abort();
    const service = createResourceService({
      config,
      authService: noneService(),
      fetchImpl: capture(imageResponse(), captured),
    });

    expect(
      (await errorFrom(service.loadResource('/api/v1/manga/1/thumbnail', { signal: controller.signal })))
        .code,
    ).toBe('aborted');
    expect(captured).toHaveLength(0);
    service.dispose();
  });

  it('rejects invalid image content but allows a generic resource with the same MIME', async () => {
    const invalidImageService = createResourceService({
      config,
      authService: noneService(),
      fetchImpl: capture(
        new Response('<html>not an image</html>', {
          status: 200,
          headers: { 'content-type': 'text/html' },
        }),
      ),
    });

    expect(
      (await errorFrom(invalidImageService.loadImageResource('/api/v1/manga/1/thumbnail'))).code,
    ).toBe('invalid-content');
    invalidImageService.dispose();

    const genericService = createResourceService({
      config,
      authService: noneService(),
      fetchImpl: capture(
        new Response('plain', { status: 200, headers: { 'content-type': 'text/plain' } }),
      ),
    });
    const resource = await genericService.loadResource('/api/v1/backup/file');
    expect(resource.blob.size).toBeGreaterThan(0);
    resource.dispose();
    genericService.dispose();
  });
});

describe('ResourceService lifecycle', () => {
  it('does not create an object URL for a response from a reset session', async () => {
    const createObjectUrl = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:stale');
    const authService = uiService();
    let resolveResponse!: (response: Response) => void;
    const service = createResourceService({
      config,
      authService,
      fetchImpl: () =>
        new Promise<Response>((resolve) => {
          resolveResponse = resolve;
        }),
    });

    const pending = service.loadResource('/api/v1/manga/1/thumbnail');
    await waitFor(() => resolveResponse !== undefined);
    authService.clearSession();
    resolveResponse(imageResponse());

    expect((await errorFrom(pending)).code).toBe('stale-session');
    expect(createObjectUrl).not.toHaveBeenCalled();
    service.dispose();
  });

  it('does not create an object URL for a response after a switch to NONE', async () => {
    const createObjectUrl = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:stale');
    const authService = uiService();
    let resolveResponse!: (response: Response) => void;
    const service = createResourceService({
      config,
      authService,
      fetchImpl: () =>
        new Promise<Response>((resolve) => {
          resolveResponse = resolve;
        }),
    });

    const pending = service.loadResource('/api/v1/manga/1/thumbnail');
    await waitFor(() => resolveResponse !== undefined);
    authService.setNoneSession();
    resolveResponse(imageResponse());

    expect((await errorFrom(pending)).code).toBe('stale-session');
    expect(createObjectUrl).not.toHaveBeenCalled();
    service.dispose();
  });

  it('aborts an in-flight request and revokes all handles when disposed', async () => {
    const revokeObjectUrl = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
    const createObjectUrl = vi
      .spyOn(URL, 'createObjectURL')
      .mockImplementation(() => `blob:${Math.random()}`);
    const authService = noneService();
    const service = createResourceService({
      config,
      authService,
      fetchImpl: capture(imageResponse()),
    });

    const first = await service.loadResource('/api/v1/manga/1/thumbnail');
    const firstUrl = first.objectUrl;
    expect(createObjectUrl).toHaveBeenCalledTimes(1);

    let resolvePending!: (response: Response) => void;
    const pendingService = createResourceService({
      config,
      authService: noneService(),
      fetchImpl: (_input, init) =>
        new Promise<Response>((resolve, reject) => {
          resolvePending = resolve;
          init?.signal?.addEventListener(
            'abort',
            () => reject(new DOMException('Aborted', 'AbortError')),
            { once: true },
          );
        }),
    });
    const pending = pendingService.loadResource('/api/v1/manga/2/thumbnail');
    await waitFor(() => resolvePending !== undefined);
    pendingService.dispose();

    expect(['aborted', 'disposed']).toContain((await errorFrom(pending)).code);
    expect(resolvePending).toBeTypeOf('function');

    service.dispose();
    expect(revokeObjectUrl).toHaveBeenCalledWith(firstUrl);
    expect(service.isDisposed()).toBe(true);
  });

  it('rejects new loads after disposal', async () => {
    const service = createResourceService({
      config,
      authService: noneService(),
      fetchImpl: capture(imageResponse()),
    });

    service.dispose();
    expect((await errorFrom(service.loadResource('/api/v1/manga/1/thumbnail'))).code).toBe(
      'disposed',
    );
  });
});
