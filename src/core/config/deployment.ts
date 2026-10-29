import {
  getGraphqlHttpUrl,
  getGraphqlWsUrl,
  getServerResourceUrl,
  isSameOrigin,
  normalizeServerBaseUrl,
} from '../server/serverUrl.ts';

export { isSameOrigin };

export type FrontendBasePathErrorCode =
  | 'ABSOLUTE_URL_NOT_ALLOWED'
  | 'QUERY_OR_HASH_NOT_ALLOWED'
  | 'INVALID_PATH';

export class FrontendBasePathError extends Error {
  public readonly code: FrontendBasePathErrorCode;

  constructor(code: FrontendBasePathErrorCode, message: string) {
    super(message);
    this.name = 'FrontendBasePathError';
    this.code = code;
  }
}

function hasDotSegment(path: string): boolean {
  return path.split('/').some((segment) => segment === '.' || segment === '..');
}

/**
 * Canonical frontend base path: leading and trailing slash, no query/hash.
 * Root is `/`; a nested deployment is `/app/`.
 */
export function normalizeFrontendBasePath(input = '/'): string {
  const candidate = input.trim();

  if (candidate === '') {
    return '/';
  }

  if (/^[a-zA-Z][a-zA-Z\d+.-]*:/.test(candidate)) {
    throw new FrontendBasePathError(
      'ABSOLUTE_URL_NOT_ALLOWED',
      'Frontend base path harus berupa path, bukan URL absolut.',
    );
  }

  if (candidate.includes('?') || candidate.includes('#')) {
    throw new FrontendBasePathError(
      'QUERY_OR_HASH_NOT_ALLOWED',
      'Frontend base path tidak boleh memuat query atau hash.',
    );
  }

  if (candidate.includes('\\') || candidate.startsWith('//')) {
    throw new FrontendBasePathError('INVALID_PATH', 'Frontend base path tidak valid.');
  }

  const withLeadingSlash = candidate.startsWith('/') ? candidate : `/${candidate}`;
  let decoded: string;

  try {
    decoded = decodeURIComponent(withLeadingSlash);
  } catch {
    throw new FrontendBasePathError('INVALID_PATH', 'Frontend base path tidak dapat didekode.');
  }

  if (
    decoded.includes('\\') ||
    decoded.includes('//') ||
    hasDotSegment(decoded)
  ) {
    throw new FrontendBasePathError('INVALID_PATH', 'Frontend base path memuat segmen yang tidak aman.');
  }

  const withoutTrailingSlash = withLeadingSlash.replace(/\/+$/, '');

  return withoutTrailingSlash === '' ? '/' : `${withoutTrailingSlash}/`;
}

export interface DeploymentConfigInput {
  /** Current frontend URL, used only to compare origins. */
  frontendUrl: string;
  /** Suwayomi server base; selected at runtime for standalone deployments. */
  serverBaseUrl: string;
  /** Build/deployment path where this frontend is mounted. Defaults to `/`. */
  frontendBasePath?: string;
}

export interface DeploymentConfig {
  readonly frontendBasePath: string;
  readonly serverBaseUrl: string;
  readonly serverOrigin: string;
  readonly serverPath: string;
  readonly sameOrigin: boolean;
  readonly graphqlHttpUrl: string;
  readonly graphqlWsUrl: string;
  readonly resolveResource: (resourcePath: string) => string;
}

/**
 * Single composition point for deployment URLs. UI and services must consume
 * this config instead of building server URLs themselves.
 */
export function createDeploymentConfig(input: DeploymentConfigInput): DeploymentConfig {
  const frontendBasePath = normalizeFrontendBasePath(input.frontendBasePath);
  const server = normalizeServerBaseUrl(input.serverBaseUrl);

  return {
    frontendBasePath,
    serverBaseUrl: server.url,
    serverOrigin: server.origin,
    serverPath: server.pathname,
    sameOrigin: isSameOrigin(input.frontendUrl, server),
    graphqlHttpUrl: getGraphqlHttpUrl(server),
    graphqlWsUrl: getGraphqlWsUrl(server),
    resolveResource: (resourcePath: string) => getServerResourceUrl(server, resourcePath),
  };
}
