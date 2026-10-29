import { describe, expect, it } from 'vitest';
import { ServerError } from '@apollo/client';
import { AuthError } from '../auth/authError';
import {
  classifyGraphQLErrorMessage,
  fromGraphQLErrors,
  fromHttpStatus,
  fromNetworkError,
  getHttpStatus,
  hasBasicAuthChallenge,
  toAuthError,
} from './errors';

describe('classifyGraphQLErrorMessage', () => {
  it('classifies stable auth and generic errors', () => {
    expect(
      classifyGraphQLErrorMessage(
        'Exception while fetching data (/settings) : Unauthorized\r\n\r\nsuwayomi.tachidesk.server.user.UnauthorizedException',
      ),
    ).toBe('unauthorized');
    expect(classifyGraphQLErrorMessage('ForbiddenException: Forbidden')).toBe('forbidden');
    expect(classifyGraphQLErrorMessage('Incorrect username or password.')).toBe(
      'invalid-credentials',
    );
    expect(classifyGraphQLErrorMessage('Some GraphQL failure')).toBe('graphql');
  });
});

describe('GraphQL failure normalization', () => {
  it('keeps only a safe diagnostic and a generic message', () => {
    const failure = fromGraphQLErrors([
      {
        message:
          'Exception while fetching data (/settings) : Unauthorized\r\n\r\nsuwayomi.tachidesk.server.user.UnauthorizedException: Unauthorized\r\n\tat server.Stack',
      },
    ]);

    expect(failure.kind).toBe('unauthorized');
    expect(failure.diagnostic).toContain('Exception while fetching data');
    expect(failure.message).not.toContain('UnauthorizedException');
    expect(failure.message).not.toContain('server.Stack');
  });

  it('prefers an auth error over a later generic error', () => {
    const failure = fromGraphQLErrors([
      { message: 'generic failure' },
      { message: 'ForbiddenException: Forbidden' },
    ]);

    expect(failure.kind).toBe('forbidden');
  });

  it('normalizes HTTP and network failures without leaking the raw error', () => {
    expect(fromHttpStatus(503).kind).toBe('http');
    expect(fromHttpStatus(503).diagnostic).toBe('status=503');

    const network = fromNetworkError(new Error('fetch failed with token secret'));
    expect(network.kind).toBe('network');
    expect(network.diagnostic).toBe('Error');
    expect(String(network)).not.toContain('token secret');
  });

  it('detects HTTP status and Basic auth challenges', () => {
    const basic = new ServerError('Unauthorized', {
      response: new Response(null, {
        status: 401,
        headers: { 'www-authenticate': 'Basic realm="suwayomi"' },
      }),
      bodyText: '',
    });
    const other = new ServerError('Unauthorized', {
      response: new Response(null, { status: 401 }),
      bodyText: '',
    });

    expect(getHttpStatus(basic)).toBe(401);
    expect(hasBasicAuthChallenge(basic)).toBe(true);
    expect(hasBasicAuthChallenge(other)).toBe(false);
  });
});

describe('toAuthError', () => {
  it('maps normalized failures to auth codes', () => {
    expect(toAuthError(fromGraphQLErrors([{ message: 'UnauthorizedException' }])).code).toBe(
      'SESSION_EXPIRED',
    );
    expect(toAuthError(fromGraphQLErrors([{ message: 'ForbiddenException' }])).code).toBe(
      'FORBIDDEN',
    );
    expect(
      toAuthError(fromGraphQLErrors([{ message: 'Incorrect username or password.' }])).code,
    ).toBe('INVALID_CREDENTIALS');
    expect(toAuthError(fromHttpStatus(500)).code).toBe('HTTP_ERROR');
    expect(toAuthError(fromNetworkError(new Error('down'))).code).toBe('NETWORK_ERROR');
    expect(toAuthError(new AuthError('REFRESH_FAILED')).code).toBe('REFRESH_FAILED');
  });
});
