import { describe, expect, it } from 'vitest';
import { AuthError } from '../auth/authError';
import { createAuthTransport } from './authTransport';

interface CapturedRequest {
  url: string;
  init: RequestInit;
  body: {
    query: string;
    variables: Record<string, unknown>;
  };
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function captureFetch(response: Response, captured: CapturedRequest[]) {
  return async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const body = JSON.parse(String(init?.body ?? '{}')) as CapturedRequest['body'];

    captured.push({ url: String(input), init: init ?? {}, body });

    return response;
  };
}

async function getAuthError(promise: Promise<unknown>): Promise<AuthError> {
  try {
    await promise;
  } catch (error) {
    expect(error).toBeInstanceOf(AuthError);
    return error as AuthError;
  }

  throw new Error('Expected auth operation to fail.');
}

describe('createAuthTransport', () => {
  it('posts a generated Login operation without an Authorization header', async () => {
    const captured: CapturedRequest[] = [];
    const transport = createAuthTransport({
      graphqlHttpUrl: 'https://example.com/suwayomi/api/graphql',
      fetchImpl: captureFetch(
        jsonResponse({
          data: { login: { accessToken: 'access-token', refreshToken: 'refresh-token' } },
        }),
        captured,
      ),
    });

    const result = await transport.login({ username: 'reader', password: 'secret' });

    expect(result).toEqual({ accessToken: 'access-token', refreshToken: 'refresh-token' });
    expect(captured).toHaveLength(1);
    expect(captured[0].url).toBe('https://example.com/suwayomi/api/graphql');
    expect(captured[0].init.method).toBe('POST');
    expect(captured[0].init.credentials).toBe('omit');
    expect(new Headers(captured[0].init.headers).get('authorization')).toBeNull();
    expect(captured[0].body.query).toContain('mutation Login');
    expect(captured[0].body.variables).toEqual({
      input: { username: 'reader', password: 'secret' },
    });
  });

  it('posts a generated RefreshToken operation with the refresh token as a variable', async () => {
    const captured: CapturedRequest[] = [];
    const transport = createAuthTransport({
      graphqlHttpUrl: 'https://example.com/api/graphql',
      fetchImpl: captureFetch(
        jsonResponse({ data: { refreshToken: { accessToken: 'new-access-token' } } }),
        captured,
      ),
    });

    const result = await transport.refresh({ refreshToken: 'refresh-token' });

    expect(result).toEqual({ accessToken: 'new-access-token' });
    expect(new Headers(captured[0].init.headers).get('authorization')).toBeNull();
    expect(captured[0].body.query).toContain('mutation RefreshToken');
    expect(captured[0].body.variables).toEqual({
      input: { refreshToken: 'refresh-token' },
    });
  });

  it('normalizes HTTP 200 unauthorized GraphQL errors without exposing raw stack traces', async () => {
    const transport = createAuthTransport({
      graphqlHttpUrl: 'https://example.com/api/graphql',
      fetchImpl: captureFetch(
        jsonResponse({
          errors: [
            {
              message:
                'Exception while fetching data (/settings) : Unauthorized\r\n\r\nsuwayomi.tachidesk.server.user.UnauthorizedException: Unauthorized\r\n\tat server.Stack',
            },
          ],
        }),
        [],
      ),
    });

    const error = await getAuthError(transport.refresh({ refreshToken: 'refresh-token' }));

    expect(error.code).toBe('SESSION_EXPIRED');
    expect(error.message).not.toContain('UnauthorizedException');
    expect(error.message).not.toContain('at server.Stack');
  });

  it('classifies invalid credentials, forbidden, generic GraphQL, and malformed responses', async () => {
    const cases: Array<[Response, AuthError['code']]> = [
      [jsonResponse({ errors: [{ message: 'Incorrect username or password.' }] }), 'INVALID_CREDENTIALS'],
      [jsonResponse({ errors: [{ message: 'ForbiddenException: Forbidden' }] }), 'FORBIDDEN'],
      [jsonResponse({ errors: [{ message: 'Some GraphQL failure' }] }), 'GRAPHQL_ERROR'],
      [jsonResponse({ data: null }), 'MALFORMED_RESPONSE'],
    ];

    for (const [response, code] of cases) {
      const transport = createAuthTransport({
        graphqlHttpUrl: 'https://example.com/api/graphql',
        fetchImpl: captureFetch(response, []),
      });
      const error = await getAuthError(transport.refresh({ refreshToken: 'refresh-token' }));

      expect(error.code).toBe(code);
    }
  });

  it('normalizes HTTP status, malformed JSON, and network failures', async () => {
    const statusTransport = createAuthTransport({
      graphqlHttpUrl: 'https://example.com/api/graphql',
      fetchImpl: async () => new Response('unavailable', { status: 503 }),
    });
    expect(
      (await getAuthError(statusTransport.refresh({ refreshToken: 'refresh-token' }))).code,
    ).toBe('HTTP_ERROR');

    const malformedTransport = createAuthTransport({
      graphqlHttpUrl: 'https://example.com/api/graphql',
      fetchImpl: async () => new Response('not-json', { status: 200 }),
    });
    expect(
      (await getAuthError(malformedTransport.refresh({ refreshToken: 'refresh-token' }))).code,
    ).toBe('MALFORMED_RESPONSE');

    const networkTransport = createAuthTransport({
      graphqlHttpUrl: 'https://example.com/api/graphql',
      fetchImpl: async () => {
        throw new Error('network down');
      },
    });
    expect(
      (await getAuthError(networkTransport.refresh({ refreshToken: 'refresh-token' }))).code,
    ).toBe('NETWORK_ERROR');
  });
});
