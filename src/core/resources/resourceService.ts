import type { AuthService } from '../auth/authService';
import type { DeploymentConfig } from '../config/deployment';
import { ResourceUrlError } from '../server/serverUrl';
import { ResourceError } from './resourceError';

export type ResourceFetch = (
  input: RequestInfo | URL,
  init?: RequestInit,
) => Promise<Response>;

export interface ResourceLoadOptions {
  readonly signal?: AbortSignal;
}

export interface LoadedResource {
  readonly blob: Blob;
  readonly objectUrl: string;
  readonly contentType: string;
  dispose(): void;
}

export interface ResourceServiceOptions {
  readonly config: DeploymentConfig;
  readonly authService: AuthService;
  readonly fetchImpl?: ResourceFetch;
}

export interface ResourceService {
  loadResource(path: string, options?: ResourceLoadOptions): Promise<LoadedResource>;
  loadImageResource(path: string, options?: ResourceLoadOptions): Promise<LoadedResource>;
  dispose(): void;
  isDisposed(): boolean;
}

function isAbortError(error: unknown): boolean {
  return (
    (error instanceof Error && error.name === 'AbortError') ||
    (typeof error === 'object' &&
      error !== null &&
      'name' in error &&
      (error as { name?: unknown }).name === 'AbortError')
  );
}

function mapUrlError(error: unknown): ResourceError {
  if (!(error instanceof ResourceUrlError)) {
    return new ResourceError('invalid-resource');
  }

  switch (error.code) {
    case 'CROSS_ORIGIN_RESOURCE':
    case 'RESOURCE_OUTSIDE_SERVER':
    case 'PROTOCOL_RELATIVE_NOT_ALLOWED':
    case 'UNSAFE_RESOURCE_PATH':
      return new ResourceError('unsafe-resource');
    default:
      return new ResourceError('invalid-resource');
  }
}

function isInsideServerPath(pathname: string, serverPath: string): boolean {
  if (serverPath === '') {
    return pathname.startsWith('/');
  }

  return pathname.startsWith(`${serverPath}/`);
}

function validateContentType(contentType: string, expectImage: boolean): void {
  if (!expectImage || contentType === '') {
    return;
  }

  const normalized = contentType.toLowerCase();

  if (normalized.startsWith('image/') || normalized.startsWith('application/octet-stream')) {
    return;
  }

  throw new ResourceError('invalid-content');
}

export function createResourceService(options: ResourceServiceOptions): ResourceService {
  const fetchImpl = options.fetchImpl ?? globalThis.fetch;

  if (!fetchImpl) {
    throw new Error('Fetch API tidak tersedia untuk ResourceService.');
  }

  let disposed = false;
  const controllers = new Set<AbortController>();
  const handles = new Set<LoadedResource>();

  function dependencyError(): ResourceError {
    return disposed
      ? new ResourceError('disposed')
      : new ResourceError('unauthorized');
  }

  async function load(
    path: string,
    loadOptions: ResourceLoadOptions | undefined,
    expectImage: boolean,
  ): Promise<LoadedResource> {
    if (disposed) {
      throw new ResourceError('disposed');
    }

    if (loadOptions?.signal?.aborted) {
      throw new ResourceError('aborted');
    }

    let url: string;

    try {
      url = options.config.resolveResource(path);
    } catch (error) {
      throw mapUrlError(error);
    }

    const session = options.authService.getSnapshot();
    let authorization: string | undefined;

    if (session.status === 'disconnected') {
      throw dependencyError();
    }

    if (session.status === 'authenticated' || session.status === 'refreshing') {
      const accessToken = options.authService.getAccessToken();

      if (!accessToken) {
        throw new ResourceError('unauthorized');
      }

      authorization = `Bearer ${accessToken}`;
    } else if (session.status !== 'none') {
      throw new ResourceError('unauthorized');
    }

    const generation = options.authService.getGeneration();
    const controller = new AbortController();
    const abortFromCaller = () => controller.abort();

    loadOptions?.signal?.addEventListener('abort', abortFromCaller, { once: true });
    controllers.add(controller);

    try {
      let response: Response;

      try {
        response = await fetchImpl(url, {
          method: 'GET',
          credentials: 'omit',
          redirect: 'manual',
          signal: controller.signal,
          headers: authorization ? { Authorization: authorization } : undefined,
        });
      } catch (error) {
        if (controller.signal.aborted || isAbortError(error)) {
          throw new ResourceError(disposed ? 'disposed' : 'aborted');
        }

        throw new ResourceError('network');
      }

      if (
        response.type === 'opaqueredirect' ||
        response.type === 'opaque' ||
        response.redirected ||
        (response.status >= 300 && response.status < 400)
      ) {
        throw new ResourceError('unsafe-resource');
      }

      if (response.url !== '') {
        let finalUrl: URL;

        try {
          finalUrl = new URL(response.url);
        } catch {
          throw new ResourceError('invalid-resource');
        }

        if (
          finalUrl.origin !== options.config.serverOrigin ||
          !isInsideServerPath(finalUrl.pathname, options.config.serverPath)
        ) {
          throw new ResourceError('unsafe-resource');
        }
      }

      if (!response.ok) {
        if (response.status === 401) {
          throw new ResourceError('unauthorized', response.status);
        }

        if (response.status === 403) {
          throw new ResourceError('forbidden', response.status);
        }

        if (response.status === 404) {
          throw new ResourceError('not-found', response.status);
        }

        throw new ResourceError('http', response.status);
      }

      const contentType = response.headers.get('content-type') ?? '';
      validateContentType(contentType, expectImage);

      let blob: Blob;

      try {
        blob = await response.blob();
      } catch (error) {
        if (controller.signal.aborted || isAbortError(error)) {
          throw new ResourceError('aborted');
        }

        throw new ResourceError('network');
      }

      if (disposed) {
        throw new ResourceError('disposed');
      }

      if (controller.signal.aborted || loadOptions?.signal?.aborted) {
        throw new ResourceError('aborted');
      }

      if (options.authService.getGeneration() !== generation) {
        throw new ResourceError('stale-session');
      }

      let objectUrl: string;

      try {
        objectUrl = URL.createObjectURL(blob);
      } catch {
        throw new ResourceError('invalid-resource');
      }

      let revoked = false;
      const handle: LoadedResource = {
        blob,
        objectUrl,
        contentType,
        dispose: () => {
          if (revoked) {
            return;
          }

          revoked = true;
          URL.revokeObjectURL(objectUrl);
          handles.delete(handle);
        },
      };

      handles.add(handle);

      return handle;
    } finally {
      loadOptions?.signal?.removeEventListener('abort', abortFromCaller);
      controllers.delete(controller);
    }
  }

  return {
    loadResource: (path, loadOptions) => load(path, loadOptions, false),
    loadImageResource: (path, loadOptions) => load(path, loadOptions, true),
    dispose: () => {
      if (disposed) {
        return;
      }

      disposed = true;

      for (const controller of [...controllers]) {
        controller.abort();
      }

      controllers.clear();

      for (const handle of [...handles]) {
        handle.dispose();
      }
    },
    isDisposed: () => disposed,
  };
}
