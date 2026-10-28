export type ServerProtocol = 'http:' | 'https:';

export interface ServerBase {
  /** Canonical server base without a trailing slash. */
  readonly url: string;
  readonly origin: string;
  readonly protocol: ServerProtocol;
  readonly hostname: string;
  readonly port: string;
  /** Server subpath without a trailing slash; empty string for a root deployment. */
  readonly pathname: string;
}

export type ServerUrlErrorCode =
  | 'EMPTY'
  | 'RELATIVE_URL'
  | 'INVALID_URL'
  | 'UNSUPPORTED_PROTOCOL'
  | 'CREDENTIALS_NOT_ALLOWED'
  | 'QUERY_NOT_ALLOWED'
  | 'HASH_NOT_ALLOWED'
  | 'INVALID_PATH';

export class ServerUrlError extends Error {
  public readonly code: ServerUrlErrorCode;

  constructor(code: ServerUrlErrorCode, message: string) {
    super(message);
    this.name = 'ServerUrlError';
    this.code = code;
  }
}

export type ResourceUrlErrorCode =
  | 'EMPTY_RESOURCE'
  | 'INVALID_RESOURCE_URL'
  | 'PROTOCOL_RELATIVE_NOT_ALLOWED'
  | 'RESOURCE_PROTOCOL_NOT_ALLOWED'
  | 'RESOURCE_CREDENTIALS_NOT_ALLOWED'
  | 'CROSS_ORIGIN_RESOURCE'
  | 'RESOURCE_OUTSIDE_SERVER'
  | 'UNSAFE_RESOURCE_PATH';

export class ResourceUrlError extends Error {
  public readonly code: ResourceUrlErrorCode;

  constructor(code: ResourceUrlErrorCode, message: string) {
    super(message);
    this.name = 'ResourceUrlError';
    this.code = code;
  }
}

function hasDotSegment(path: string): boolean {
  return path.split('/').some((segment) => segment === '.' || segment === '..');
}

function decodePath(path: string, createError: () => Error): string {
  try {
    return decodeURIComponent(path);
  } catch {
    throw createError();
  }
}

function getRawPath(input: string): string {
  const authorityStart = input.indexOf('://') + 3;
  let pathStart = input.length;

  for (let index = authorityStart; index < input.length; index += 1) {
    const character = input[index];

    if (character === '/' || character === '?' || character === '#') {
      pathStart = index;
      break;
    }
  }

  const remainder = input.slice(pathStart);
  const end = remainder.search(/[?#]/);

  return end === -1 ? remainder : remainder.slice(0, end);
}

function isPathInsideServer(server: ServerBase, pathname: string): boolean {
  if (server.pathname === '') {
    return pathname.startsWith('/');
  }

  return pathname.startsWith(`${server.pathname}/`);
}

/**
 * Parses and canonicalizes a Suwayomi server base URL.
 *
 * Canonical form: `scheme://host[:port][/subpath]` without a trailing slash.
 * Root deployments therefore canonicalize to `scheme://host[:port]`.
 */
export function normalizeServerBaseUrl(input: string): ServerBase {
  const candidate = input.trim();

  if (candidate === '') {
    throw new ServerUrlError('EMPTY', 'Server URL tidak boleh kosong.');
  }

  const schemeMatch = /^([a-zA-Z][a-zA-Z\d+.-]*):/.exec(candidate);

  if (!schemeMatch) {
    throw new ServerUrlError('RELATIVE_URL', 'Server URL harus berupa URL absolut.');
  }

  const scheme = schemeMatch[1].toLowerCase();

  if (scheme !== 'http' && scheme !== 'https') {
    throw new ServerUrlError(
      'UNSUPPORTED_PROTOCOL',
      'Server URL hanya mendukung protokol http atau https.',
    );
  }

  if (!/^https?:\/\//i.test(candidate)) {
    throw new ServerUrlError('INVALID_URL', 'Server URL harus menyertakan // setelah protokol.');
  }

  let parsed: URL;

  try {
    parsed = new URL(candidate);
  } catch {
    throw new ServerUrlError('INVALID_URL', 'Server URL tidak valid.');
  }

  if (parsed.username !== '' || parsed.password !== '') {
    throw new ServerUrlError(
      'CREDENTIALS_NOT_ALLOWED',
      'Server URL tidak boleh memuat username atau password.',
    );
  }

  if (parsed.search !== '') {
    throw new ServerUrlError('QUERY_NOT_ALLOWED', 'Server URL tidak boleh memuat query string.');
  }

  if (parsed.hash !== '') {
    throw new ServerUrlError('HASH_NOT_ALLOWED', 'Server URL tidak boleh memuat hash.');
  }

  const rawPath = getRawPath(candidate).replace(/\/+$/, '');

  if (/%2f|%5c/i.test(rawPath)) {
    throw new ServerUrlError('INVALID_PATH', 'Path server memuat encoded slash atau backslash.');
  }

  const decodedPath = decodePath(rawPath, () => {
    return new ServerUrlError('INVALID_PATH', 'Path server tidak dapat didekode.');
  });

  if (
    decodedPath.includes('\\') ||
    decodedPath.includes('//') ||
    decodedPath.includes('?') ||
    decodedPath.includes('#') ||
    hasDotSegment(decodedPath)
  ) {
    throw new ServerUrlError('INVALID_PATH', 'Path server memuat segmen yang tidak aman.');
  }

  const pathname = parsed.pathname.replace(/\/+$/, '');
  const protocol = parsed.protocol as ServerProtocol;
  const url = pathname === '' ? parsed.origin : `${parsed.origin}${pathname}`;

  return {
    url,
    origin: parsed.origin,
    protocol,
    hostname: parsed.hostname,
    port: parsed.port,
    pathname,
  };
}

export function getGraphqlHttpUrl(server: ServerBase): string {
  return `${server.url}/api/graphql`;
}

export function getGraphqlWsUrl(server: ServerBase): string {
  const url = new URL(server.url);

  url.protocol = server.protocol === 'https:' ? 'wss:' : 'ws:';
  url.pathname = server.pathname === '' ? '/api/graphql' : `${server.pathname}/api/graphql`;

  return url.toString();
}

/**
 * Resolves a server resource. Relative paths are always joined to the server
 * prefix. Absolute URLs are accepted only when they belong to the configured
 * server origin and subpath; cross-origin resources are rejected by default.
 */
export function getServerResourceUrl(server: ServerBase, resourcePath: string): string {
  if (resourcePath === '') {
    throw new ResourceUrlError('EMPTY_RESOURCE', 'Resource path tidak boleh kosong.');
  }

  if (resourcePath.startsWith('//')) {
    throw new ResourceUrlError(
      'PROTOCOL_RELATIVE_NOT_ALLOWED',
      'Resource protocol-relative tidak diizinkan.',
    );
  }

  const schemeMatch = /^([a-zA-Z][a-zA-Z\d+.-]*):/.exec(resourcePath);

  if (schemeMatch) {
    const scheme = schemeMatch[1].toLowerCase();

    if (scheme !== 'http' && scheme !== 'https') {
      throw new ResourceUrlError(
        'RESOURCE_PROTOCOL_NOT_ALLOWED',
        'Resource hanya mendukung protokol http atau https.',
      );
    }

    if (!/^https?:\/\//i.test(resourcePath)) {
      throw new ResourceUrlError('INVALID_RESOURCE_URL', 'Resource URL tidak valid.');
    }

    let parsed: URL;

    try {
      parsed = new URL(resourcePath);
    } catch {
      throw new ResourceUrlError('INVALID_RESOURCE_URL', 'Resource URL tidak valid.');
    }

    if (parsed.username !== '' || parsed.password !== '') {
      throw new ResourceUrlError(
        'RESOURCE_CREDENTIALS_NOT_ALLOWED',
        'Resource URL tidak boleh memuat username atau password.',
      );
    }

    if (parsed.origin !== server.origin) {
      throw new ResourceUrlError(
        'CROSS_ORIGIN_RESOURCE',
        'Resource dari origin lain tidak diizinkan.',
      );
    }

    if (!isPathInsideServer(server, parsed.pathname)) {
      throw new ResourceUrlError(
        'RESOURCE_OUTSIDE_SERVER',
        'Resource berada di luar prefix server.',
      );
    }

    return parsed.toString();
  }

  if (resourcePath.includes('\\')) {
    throw new ResourceUrlError('UNSAFE_RESOURCE_PATH', 'Resource path memuat backslash.');
  }

  const separatorIndex = resourcePath.search(/[?#]/);
  const pathPart = separatorIndex === -1 ? resourcePath : resourcePath.slice(0, separatorIndex);
  const suffix = separatorIndex === -1 ? '' : resourcePath.slice(separatorIndex);

  if (pathPart === '') {
    throw new ResourceUrlError('EMPTY_RESOURCE', 'Resource path tidak boleh kosong.');
  }

  const decodedPath = decodePath(pathPart, () => {
    return new ResourceUrlError('UNSAFE_RESOURCE_PATH', 'Resource path tidak dapat didekode.');
  });

  if (
    decodedPath.includes('\\') ||
    decodedPath.startsWith('//') ||
    decodedPath.includes('//') ||
    decodedPath.includes('?') ||
    decodedPath.includes('#') ||
    hasDotSegment(decodedPath)
  ) {
    throw new ResourceUrlError('UNSAFE_RESOURCE_PATH', 'Resource path memuat segmen yang tidak aman.');
  }

  const cleanPath = pathPart.replace(/^\/+/, '');

  if (cleanPath === '') {
    throw new ResourceUrlError('EMPTY_RESOURCE', 'Resource path tidak boleh kosong.');
  }

  return `${server.url}/${cleanPath}${suffix}`;
}

export function isSameOrigin(frontendUrl: string | URL, server: ServerBase | string): boolean {
  const frontend = typeof frontendUrl === 'string' ? new URL(frontendUrl) : frontendUrl;
  const serverOrigin = typeof server === 'string' ? normalizeServerBaseUrl(server).origin : server.origin;

  return frontend.origin === serverOrigin;
}
