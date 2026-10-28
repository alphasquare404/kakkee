import { describe, expect, it } from 'vitest';
import {
  getGraphqlHttpUrl,
  getGraphqlWsUrl,
  getServerResourceUrl,
  isSameOrigin,
  normalizeServerBaseUrl,
  ResourceUrlError,
  ServerUrlError,
} from './serverUrl';

function getServerError(input: string): ServerUrlError {
  try {
    normalizeServerBaseUrl(input);
  } catch (error) {
    expect(error).toBeInstanceOf(ServerUrlError);
    return error as ServerUrlError;
  }

  throw new Error(`Expected normalizeServerBaseUrl(${JSON.stringify(input)}) to throw.`);
}

function getResourceError(
  serverBaseUrl: string,
  resourcePath: string,
): ResourceUrlError {
  try {
    getServerResourceUrl(normalizeServerBaseUrl(serverBaseUrl), resourcePath);
  } catch (error) {
    expect(error).toBeInstanceOf(ResourceUrlError);
    return error as ResourceUrlError;
  }

  throw new Error(`Expected getServerResourceUrl(${JSON.stringify(resourcePath)}) to throw.`);
}

describe('normalizeServerBaseUrl', () => {
  it('canonicalizes HTTP and HTTPS root URLs', () => {
    expect(normalizeServerBaseUrl('http://example.com')).toMatchObject({
      url: 'http://example.com',
      origin: 'http://example.com',
      protocol: 'http:',
      pathname: '',
    });

    expect(normalizeServerBaseUrl('https://example.com/')).toMatchObject({
      url: 'https://example.com',
      origin: 'https://example.com',
      protocol: 'https:',
      pathname: '',
    });
  });

  it('preserves hostname, explicit port, and subpath', () => {
    const server = normalizeServerBaseUrl('https://manga.example.com:8443/suwayomi/');

    expect(server.url).toBe('https://manga.example.com:8443/suwayomi');
    expect(server.hostname).toBe('manga.example.com');
    expect(server.port).toBe('8443');
    expect(server.pathname).toBe('/suwayomi');
  });

  it('normalizes nested subpaths and repeated trailing slashes', () => {
    const server = normalizeServerBaseUrl('https://example.com/a/b///');

    expect(server.url).toBe('https://example.com/a/b');
    expect(server.pathname).toBe('/a/b');
  });

  it('supports localhost, IPv4, and IPv6 hosts', () => {
    expect(normalizeServerBaseUrl('http://localhost:4567/').url).toBe(
      'http://localhost:4567',
    );
    expect(normalizeServerBaseUrl('http://127.0.0.1:4567/suwayomi').url).toBe(
      'http://127.0.0.1:4567/suwayomi',
    );
    expect(normalizeServerBaseUrl('http://[::1]:4567/suwayomi/').url).toBe(
      'http://[::1]:4567/suwayomi',
    );
  });

  it('rejects empty and relative inputs', () => {
    expect(getServerError('').code).toBe('EMPTY');
    expect(getServerError('   ').code).toBe('EMPTY');
    expect(getServerError('example.com').code).toBe('RELATIVE_URL');
    expect(getServerError('//example.com').code).toBe('RELATIVE_URL');
    expect(getServerError('/suwayomi').code).toBe('RELATIVE_URL');
  });

  it('rejects non-HTTP schemes', () => {
    expect(getServerError('ftp://example.com').code).toBe('UNSUPPORTED_PROTOCOL');
    expect(getServerError('file:///tmp/server').code).toBe('UNSUPPORTED_PROTOCOL');
    expect(getServerError('javascript:alert(1)').code).toBe('UNSUPPORTED_PROTOCOL');
  });

  it('rejects credentials, query strings, and hashes', () => {
    expect(getServerError('https://user:pass@example.com').code).toBe(
      'CREDENTIALS_NOT_ALLOWED',
    );
    expect(getServerError('https://example.com/?token=abc').code).toBe('QUERY_NOT_ALLOWED');
    expect(getServerError('https://example.com/#section').code).toBe('HASH_NOT_ALLOWED');
  });

  it('rejects malformed URLs and ambiguous paths', () => {
    expect(getServerError('http://').code).toBe('INVALID_URL');
    expect(getServerError('https:example.com').code).toBe('INVALID_URL');
    expect(getServerError('https://example.com:99999').code).toBe('INVALID_URL');
    expect(getServerError('https://example.com/suwayomi/../evil').code).toBe('INVALID_PATH');
    expect(getServerError('https://example.com/suwayomi/%2e%2e/evil').code).toBe(
      'INVALID_PATH',
    );
    expect(getServerError('https://example.com/suwayomi//api').code).toBe('INVALID_PATH');
    expect(getServerError('https://example.com/suwayomi%2Fapi').code).toBe('INVALID_PATH');
  });
});

describe('GraphQL endpoint helpers', () => {
  it('builds HTTP GraphQL URLs for root and subpath deployments', () => {
    expect(getGraphqlHttpUrl(normalizeServerBaseUrl('https://example.com'))).toBe(
      'https://example.com/api/graphql',
    );
    expect(
      getGraphqlHttpUrl(normalizeServerBaseUrl('https://example.com/suwayomi/')),
    ).toBe('https://example.com/suwayomi/api/graphql');
  });

  it('maps HTTP to WS and HTTPS to WSS while preserving host, port, and prefix', () => {
    expect(getGraphqlWsUrl(normalizeServerBaseUrl('http://example.com'))).toBe(
      'ws://example.com/api/graphql',
    );
    expect(
      getGraphqlWsUrl(normalizeServerBaseUrl('http://example.com:8080/suwayomi')),
    ).toBe('ws://example.com:8080/suwayomi/api/graphql');
    expect(
      getGraphqlWsUrl(normalizeServerBaseUrl('https://example.com:8443/suwayomi')),
    ).toBe('wss://example.com:8443/suwayomi/api/graphql');
  });
});

describe('getServerResourceUrl', () => {
  it('preserves the server subpath for relative paths with or without a leading slash', () => {
    const server = normalizeServerBaseUrl('https://example.com/suwayomi');

    expect(getServerResourceUrl(server, '/api/v1/test')).toBe(
      'https://example.com/suwayomi/api/v1/test',
    );
    expect(getServerResourceUrl(server, 'api/v1/test')).toBe(
      'https://example.com/suwayomi/api/v1/test',
    );
  });

  it('preserves query strings on relative resources', () => {
    const server = normalizeServerBaseUrl('https://example.com/suwayomi');

    expect(getServerResourceUrl(server, '/api/v1/test?format=webp')).toBe(
      'https://example.com/suwayomi/api/v1/test?format=webp',
    );
  });

  it('handles root server deployments', () => {
    const server = normalizeServerBaseUrl('https://example.com');

    expect(getServerResourceUrl(server, '/api/v1/test')).toBe(
      'https://example.com/api/v1/test',
    );
    expect(getServerResourceUrl(server, 'https://example.com/api/v1/test')).toBe(
      'https://example.com/api/v1/test',
    );
  });

  it('accepts absolute URLs only on the configured server origin and prefix', () => {
    const server = normalizeServerBaseUrl('https://example.com/suwayomi');

    expect(
      getServerResourceUrl(server, 'https://example.com/suwayomi/api/v1/test'),
    ).toBe('https://example.com/suwayomi/api/v1/test');
    expect(
      getServerResourceUrl(server, 'https://example.com/suwayomi/api/v1/test?format=webp'),
    ).toBe('https://example.com/suwayomi/api/v1/test?format=webp');

    const portServer = normalizeServerBaseUrl('https://example.com:8443/suwayomi');

    expect(
      getServerResourceUrl(portServer, 'https://example.com:8443/suwayomi/api/v1/test'),
    ).toBe('https://example.com:8443/suwayomi/api/v1/test');
  });

  it('rejects cross-origin, protocol-relative, and out-of-prefix absolute resources', () => {
    const server = 'https://example.com/suwayomi';

    expect(
      getResourceError(server, 'https://evil.example/suwayomi/api/v1/test').code,
    ).toBe('CROSS_ORIGIN_RESOURCE');
    expect(getResourceError(server, '//evil.example/suwayomi/api/v1/test').code).toBe(
      'PROTOCOL_RELATIVE_NOT_ALLOWED',
    );
    expect(
      getResourceError(server, 'https://example.com/suwayomi2/api/v1/test').code,
    ).toBe('RESOURCE_OUTSIDE_SERVER');
    expect(getResourceError(server, 'https://example.com/api/v1/test').code).toBe(
      'RESOURCE_OUTSIDE_SERVER',
    );
  });

  it('rejects credentials and unsupported schemes', () => {
    const server = 'https://example.com/suwayomi';

    expect(
      getResourceError(server, 'https://user:pass@example.com/suwayomi/api').code,
    ).toBe('RESOURCE_CREDENTIALS_NOT_ALLOWED');
    expect(getResourceError(server, 'ftp://example.com/suwayomi/api').code).toBe(
      'RESOURCE_PROTOCOL_NOT_ALLOWED',
    );
    expect(getResourceError(server, 'javascript:alert(1)').code).toBe(
      'RESOURCE_PROTOCOL_NOT_ALLOWED',
    );
  });

  it('rejects traversal and ambiguous relative paths', () => {
    const server = 'https://example.com/suwayomi';

    expect(getResourceError(server, '../api/v1/test').code).toBe('UNSAFE_RESOURCE_PATH');
    expect(getResourceError(server, 'api/../v1/test').code).toBe('UNSAFE_RESOURCE_PATH');
    expect(getResourceError(server, '%2e%2e%2fapi/v1/test').code).toBe(
      'UNSAFE_RESOURCE_PATH',
    );
    expect(getResourceError(server, 'api%2f..%2fv1').code).toBe('UNSAFE_RESOURCE_PATH');
    expect(getResourceError(server, 'api\\v1\\test').code).toBe('UNSAFE_RESOURCE_PATH');
    expect(getResourceError(server, '/%2f%2fevil.example').code).toBe(
      'UNSAFE_RESOURCE_PATH',
    );
  });

  it('rejects empty resource inputs', () => {
    const server = 'https://example.com/suwayomi';

    expect(getResourceError(server, '').code).toBe('EMPTY_RESOURCE');
    expect(getResourceError(server, '?format=webp').code).toBe('EMPTY_RESOURCE');
  });
});

describe('isSameOrigin', () => {
  it('compares origins, not paths or subpaths', () => {
    expect(isSameOrigin('https://example.com/app/', 'https://example.com/suwayomi')).toBe(
      true,
    );
    expect(isSameOrigin('https://example.com/app/', 'http://example.com/suwayomi')).toBe(
      false,
    );
    expect(
      isSameOrigin('https://reader.example.com/app/', 'https://example.com/suwayomi'),
    ).toBe(false);
  });

  it('accepts a normalized server base object or string', () => {
    const server = normalizeServerBaseUrl('https://example.com/suwayomi');

    expect(isSameOrigin('https://example.com/app/', server)).toBe(true);
    expect(isSameOrigin('https://example.com/app/', 'https://example.com/suwayomi')).toBe(
      true,
    );
  });
});
