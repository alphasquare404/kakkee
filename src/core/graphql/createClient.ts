import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
} from '@apollo/client';
import { SetContextLink } from '@apollo/client/link/context';
import { ErrorLink } from '@apollo/client/link/error';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { from, mergeMap, throwError } from 'rxjs';
import type { DeploymentConfig } from '../config/deployment';
import type { AuthService, AuthTransport } from '../auth/authService';
import { toAuthError } from './errors';
import { normalizeApolloError } from './errors';
import { createAuthTransport, type FetchLike } from './authTransport';
import { createWsClient, type WebSocketTransport } from './createWsClient';

export interface GraphQLTransportOptions {
  readonly config: DeploymentConfig;
  readonly authService: AuthService;
  readonly fetchImpl?: FetchLike;
  readonly webSocketImpl?: unknown;
}

export interface GraphQLTransport {
  readonly client: ApolloClient;
  readonly authTransport: AuthTransport;
  restartWebSocket(): void;
  clearCache(): Promise<void>;
  dispose(): Promise<void>;
}

export function createGraphQLTransport(options: GraphQLTransportOptions): GraphQLTransport {
  const { authService } = options;
  const authTransport = createAuthTransport({
    graphqlHttpUrl: options.config.graphqlHttpUrl,
    fetchImpl: options.fetchImpl,
  });
  const cache = new InMemoryCache();
  let disposed = false;
  let refreshPromise: Promise<boolean> | null = null;
  let ws: WebSocketTransport = createWsClient({
    url: options.config.graphqlWsUrl,
    authService,
    webSocketImpl: options.webSocketImpl,
  });
  let client: ApolloClient | null = null;

  const httpLink = new HttpLink({
    uri: options.config.graphqlHttpUrl,
    fetch: (input, init) => {
      const fetchImpl = options.fetchImpl ?? globalThis.fetch;

      if (!fetchImpl) {
        return Promise.reject(new Error('Fetch API tidak tersedia.'));
      }

      return fetchImpl(input, {
        ...init,
        credentials: authService.getCredentialsMode(),
      });
    },
  });

  const authLink = new SetContextLink((prevContext) => {
    const authorization = authService.getAuthorizationHeader();

    if (!authorization) {
      return prevContext;
    }

    return {
      ...prevContext,
      headers: {
        ...(prevContext.headers as Record<string, string> | undefined),
        Authorization: authorization,
      },
    };
  });

  function restartWebSocket(): void {
    if (disposed) {
      return;
    }

    ws.dispose();
    ws = createWsClient({
      url: options.config.graphqlWsUrl,
      authService,
      webSocketImpl: options.webSocketImpl,
    });
    client?.setLink(buildLink());
  }

  function ensureRefresh(): Promise<boolean> {
    if (refreshPromise) {
      return refreshPromise;
    }

    refreshPromise = (async () => {
      try {
        if (authService.getSnapshot().status === 'none') {
          return false;
        }

        const refreshToken = authService.getRefreshToken();

        if (!refreshToken) {
          authService.markExpired();
          return false;
        }

        const attempt = authService.beginRefresh();

        if (!attempt) {
          return false;
        }

        try {
          const result = await authTransport.refresh({ refreshToken });
          const applied = authService.completeRefresh(attempt, result);

          if (applied) {
            restartWebSocket();
          }

          return applied;
        } catch (error) {
          authService.failRefresh(attempt, toAuthError(error));
          return false;
        }
      } finally {
        refreshPromise = null;
      }
    })();

    return refreshPromise;
  }

  const errorLink = new ErrorLink(({ error, operation, forward }) => {
    const failure = normalizeApolloError(error);

    if (failure.kind !== 'unauthorized') {
      return;
    }

    const context = operation.getContext();

    if (context.authRefreshRetried === true) {
      return;
    }

    if (authService.getSnapshot().status === 'none') {
      return;
    }

    if (!authService.getRefreshToken()) {
      authService.markExpired();
      return;
    }

    return from(ensureRefresh()).pipe(
      mergeMap((refreshed) => {
        if (!refreshed) {
          return throwError(() => error);
        }

        operation.setContext({ ...context, authRefreshRetried: true });

        return forward(operation);
      }),
    );
  });

  function isSubscriptionOperation(operation: ApolloLink.Operation): boolean {
    const definition = getMainDefinition(operation.query);

    return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
  }

  function buildLink(): ApolloLink {
    const httpChain = ApolloLink.from([errorLink, authLink, httpLink]);

    return ApolloLink.split(
      (operation) => isSubscriptionOperation(operation),
      new GraphQLWsLink(ws.client),
      httpChain,
    );
  }

  const apolloClient = new ApolloClient({ cache, link: buildLink() });
  client = apolloClient;

  return {
    client: apolloClient,
    authTransport,
    restartWebSocket,
    clearCache: async () => {
      if (!disposed) {
        await apolloClient.clearStore();
      }
    },
    dispose: async () => {
      if (disposed) {
        return;
      }

      disposed = true;
      ws.dispose();
      apolloClient.stop();
      await apolloClient.clearStore();
    },
  };
}
