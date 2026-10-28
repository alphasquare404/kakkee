import { describe, expect, it } from 'vitest';
import {
  createDeploymentConfig,
  FrontendBasePathError,
  normalizeFrontendBasePath,
} from './deployment';

function getFrontendPathError(input: string): FrontendBasePathError {
  try {
    normalizeFrontendBasePath(input);
  } catch (error) {
    expect(error).toBeInstanceOf(FrontendBasePathError);
    return error as FrontendBasePathError;
  }

  throw new Error(`Expected normalizeFrontendBasePath(${JSON.stringify(input)}) to throw.`);
}

describe('normalizeFrontendBasePath', () => {
  it('canonicalizes root and nested paths with leading and trailing slashes', () => {
    expect(normalizeFrontendBasePath('/')).toBe('/');
    expect(normalizeFrontendBasePath('/app')).toBe('/app/');
    expect(normalizeFrontendBasePath('/app/')).toBe('/app/');
    expect(normalizeFrontendBasePath('app')).toBe('/app/');
    expect(normalizeFrontendBasePath('/app/sub')).toBe('/app/sub/');
    expect(normalizeFrontendBasePath('')).toBe('/');
  });

  it('rejects absolute URLs, query/hash, traversal, and ambiguous paths', () => {
    expect(getFrontendPathError('https://example.com/app').code).toBe(
      'ABSOLUTE_URL_NOT_ALLOWED',
    );
    expect(getFrontendPathError('/app?x=1').code).toBe('QUERY_OR_HASH_NOT_ALLOWED');
    expect(getFrontendPathError('/app#section').code).toBe('QUERY_OR_HASH_NOT_ALLOWED');
    expect(getFrontendPathError('/app/../other').code).toBe('INVALID_PATH');
    expect(getFrontendPathError('/app/%2e%2e/other').code).toBe('INVALID_PATH');
    expect(getFrontendPathError('//app').code).toBe('INVALID_PATH');
    expect(getFrontendPathError('/app//sub').code).toBe('INVALID_PATH');
    expect(getFrontendPathError('/app\\sub').code).toBe('INVALID_PATH');
  });
});

describe('createDeploymentConfig', () => {
  it('handles frontend root with server root on the same origin', () => {
    const config = createDeploymentConfig({
      frontendUrl: 'https://example.com/',
      frontendBasePath: '/',
      serverBaseUrl: 'https://example.com/',
    });

    expect(config.frontendBasePath).toBe('/');
    expect(config.serverBaseUrl).toBe('https://example.com');
    expect(config.sameOrigin).toBe(true);
    expect(config.graphqlHttpUrl).toBe('https://example.com/api/graphql');
    expect(config.graphqlWsUrl).toBe('wss://example.com/api/graphql');
    expect(config.resolveResource('/api/v1/test')).toBe('https://example.com/api/v1/test');
  });

  it('handles frontend subpath with server root on the same origin', () => {
    const config = createDeploymentConfig({
      frontendUrl: 'https://example.com/app/',
      frontendBasePath: '/app/',
      serverBaseUrl: 'https://example.com',
    });

    expect(config.frontendBasePath).toBe('/app/');
    expect(config.serverPath).toBe('');
    expect(config.sameOrigin).toBe(true);
    expect(config.graphqlHttpUrl).toBe('https://example.com/api/graphql');
  });

  it('handles frontend root with server subpath on the same origin', () => {
    const config = createDeploymentConfig({
      frontendUrl: 'https://example.com/',
      frontendBasePath: '/',
      serverBaseUrl: 'https://example.com/suwayomi',
    });

    expect(config.serverBaseUrl).toBe('https://example.com/suwayomi');
    expect(config.serverPath).toBe('/suwayomi');
    expect(config.sameOrigin).toBe(true);
    expect(config.graphqlHttpUrl).toBe('https://example.com/suwayomi/api/graphql');
    expect(config.resolveResource('api/v1/test')).toBe(
      'https://example.com/suwayomi/api/v1/test',
    );
  });

  it('handles different frontend and server paths on the same origin', () => {
    const config = createDeploymentConfig({
      frontendUrl: 'https://example.com/app/',
      frontendBasePath: '/app/',
      serverBaseUrl: 'https://example.com/suwayomi/',
    });

    expect(config.frontendBasePath).toBe('/app/');
    expect(config.serverPath).toBe('/suwayomi');
    expect(config.sameOrigin).toBe(true);
    expect(config.graphqlHttpUrl).toBe('https://example.com/suwayomi/api/graphql');
    expect(config.graphqlWsUrl).toBe('wss://example.com/suwayomi/api/graphql');
    expect(config.resolveResource('/api/v1/test')).toBe(
      'https://example.com/suwayomi/api/v1/test',
    );
  });

  it('distinguishes different origins', () => {
    const config = createDeploymentConfig({
      frontendUrl: 'https://reader.example.com/app/',
      frontendBasePath: '/app/',
      serverBaseUrl: 'https://manga.example.com/suwayomi',
    });

    expect(config.sameOrigin).toBe(false);
    expect(config.graphqlHttpUrl).toBe('https://manga.example.com/suwayomi/api/graphql');
    expect(config.resolveResource('/api/v1/test')).toBe(
      'https://manga.example.com/suwayomi/api/v1/test',
    );
  });

  it('keeps frontend base path independent from the current route or server path', () => {
    const config = createDeploymentConfig({
      frontendUrl: 'https://example.com/app/some/deep/link',
      frontendBasePath: '/app',
      serverBaseUrl: 'https://example.com/suwayomi',
    });

    expect(config.frontendBasePath).toBe('/app/');
    expect(config.serverPath).toBe('/suwayomi');
    expect(config.sameOrigin).toBe(true);
  });

  it('uses a runtime-selected server URL instead of deriving one from the frontend URL', () => {
    const config = createDeploymentConfig({
      frontendUrl: 'https://reader.example.com/',
      frontendBasePath: '/',
      serverBaseUrl: 'https://manga.example.com:8443/suwayomi',
    });

    expect(config.serverBaseUrl).toBe('https://manga.example.com:8443/suwayomi');
    expect(config.graphqlHttpUrl).toBe(
      'https://manga.example.com:8443/suwayomi/api/graphql',
    );
    expect(config.graphqlWsUrl).toBe(
      'wss://manga.example.com:8443/suwayomi/api/graphql',
    );
  });
});
