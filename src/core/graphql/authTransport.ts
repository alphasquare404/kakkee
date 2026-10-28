import { print } from 'graphql';
import type { GraphQLFormattedError } from 'graphql';
import type {
  LoginMutation,
  LoginMutationVariables,
  RefreshTokenMutation,
  RefreshTokenMutationVariables,
} from './generated/graphql';
import {
  LoginDocument,
  RefreshTokenDocument,
} from './generated/graphql';
import type { AuthTransport } from '../auth/authService';
import {
  fromGraphQLErrors,
  fromHttpStatus,
  fromMalformedResponse,
  fromNetworkError,
  toAuthError,
} from './errors';

export type FetchLike = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

export interface AuthTransportOptions {
  readonly graphqlHttpUrl: string;
  readonly fetchImpl?: FetchLike;
}

interface GraphQLResponse<TData> {
  readonly data?: TData;
  readonly errors?: readonly GraphQLFormattedError[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function createAuthTransport(options: AuthTransportOptions): AuthTransport {
  const fetchImpl = options.fetchImpl ?? globalThis.fetch;

  if (!fetchImpl) {
    throw new Error('Fetch API tidak tersedia untuk AuthTransport.');
  }

  async function execute<TData, TVariables extends Record<string, unknown>>(
    document: Parameters<typeof print>[0],
    variables: TVariables,
  ): Promise<TData> {
    let response: Response;

    try {
      response = await fetchImpl(options.graphqlHttpUrl, {
        method: 'POST',
        credentials: 'omit',
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          query: print(document),
          variables,
        }),
      });
    } catch (error) {
      throw toAuthError(fromNetworkError(error));
    }

    if (!response.ok) {
      throw toAuthError(fromHttpStatus(response.status));
    }

    let payload: unknown;

    try {
      payload = await response.json();
    } catch {
      throw toAuthError(fromMalformedResponse());
    }

    if (!isRecord(payload)) {
      throw toAuthError(fromMalformedResponse());
    }

    const graphqlResponse = payload as GraphQLResponse<TData>;

    if (graphqlResponse.errors !== undefined) {
      if (!Array.isArray(graphqlResponse.errors)) {
        throw toAuthError(fromMalformedResponse());
      }

      if (graphqlResponse.errors.length > 0) {
        throw toAuthError(fromGraphQLErrors(graphqlResponse.errors));
      }
    }

    if (!('data' in graphqlResponse) || graphqlResponse.data === undefined || graphqlResponse.data === null) {
      throw toAuthError(fromMalformedResponse());
    }

    return graphqlResponse.data;
  }

  return {
    async login(input: LoginMutationVariables['input']) {
      const data = await execute<LoginMutation, LoginMutationVariables>(LoginDocument, { input });

      return data.login;
    },

    async refresh(input: RefreshTokenMutationVariables['input']) {
      const data = await execute<RefreshTokenMutation, RefreshTokenMutationVariables>(
        RefreshTokenDocument,
        { input },
      );

      return data.refreshToken;
    },
  };
}
