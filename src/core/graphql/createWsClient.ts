import { createClient, type Client, type ClientOptions } from 'graphql-ws';
import type { AuthService } from '../auth/authService';

const KEEP_ALIVE_MS = 20_000;
const MAX_RETRY_ATTEMPTS = 5;

export interface WsClientOptions {
  readonly url: string;
  readonly authService: AuthService;
  readonly webSocketImpl?: unknown;
}

export interface WebSocketTransport {
  readonly client: Client;
  dispose(): void;
  isDisposed(): boolean;
}

/**
 * Reads the current token at connection time. The WebSocket protocol expects
 * the raw JWT in `connectionParams.Authorization`, without a Bearer prefix.
 */
export function createWsConnectionParams(authService: AuthService): { Authorization?: string } {
  const accessToken = authService.getAccessToken();

  return accessToken ? { Authorization: accessToken } : {};
}

export function createWsClient(options: WsClientOptions): WebSocketTransport {
  let disposed = false;

  const clientOptions: ClientOptions = {
    url: options.url,
    lazy: true,
    keepAlive: KEEP_ALIVE_MS,
    retryAttempts: MAX_RETRY_ATTEMPTS,
    shouldRetry: () => true,
    retryWait: async (retries: number) => {
      const delay = Math.min(1_000 * 2 ** retries, 15_000);

      await new Promise<void>((resolve) => {
        setTimeout(resolve, delay);
      });
    },
    connectionParams: () => createWsConnectionParams(options.authService),
  };

  if (options.webSocketImpl !== undefined) {
    clientOptions.webSocketImpl = options.webSocketImpl;
  }

  const client = createClient(clientOptions);

  return {
    client,
    dispose: () => {
      if (disposed) {
        return;
      }

      disposed = true;
      client.dispose();
    },
    isDisposed: () => disposed,
  };
}
