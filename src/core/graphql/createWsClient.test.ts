import { print } from 'graphql';
import { describe, expect, it } from 'vitest';
import { AuthService } from '../auth/authService';
import { DownloadStatusChangedDocument } from './generated/graphql';
import { createWsConnectionParams, createWsClient } from './createWsClient';

class FakeWebSocket {
  static readonly CONNECTING = 0;
  static readonly OPEN = 1;
  static readonly CLOSING = 2;
  static readonly CLOSED = 3;
  static instances: FakeWebSocket[] = [];

  readyState = FakeWebSocket.CONNECTING;
  onopen: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  onclose: ((event: { code: number; reason: string; wasClean: boolean }) => void) | null = null;
  onerror: ((event: unknown) => void) | null = null;
  readonly sent: string[] = [];
  readonly url: string;
  readonly protocols?: string | string[];

  constructor(url: string, protocols?: string | string[]) {
    this.url = url;
    this.protocols = protocols;
    FakeWebSocket.instances.push(this);

    queueMicrotask(() => {
      this.readyState = FakeWebSocket.OPEN;
      this.onopen?.();
    });
  }

  send(data: string): void {
    this.sent.push(data);
    const message = JSON.parse(data) as { type?: string; id?: string };

    if (message.type === 'connection_init') {
      queueMicrotask(() => {
        this.onmessage?.({ data: JSON.stringify({ type: 'connection_ack' }) });
      });
    }

    if (message.type === 'subscribe') {
      queueMicrotask(() => {
        this.onmessage?.({
          data: JSON.stringify({
            type: 'next',
            id: message.id,
            payload: {
              data: {
                downloadStatusChanged: {
                  state: 'STOPPED',
                  initial: [],
                  updates: [],
                },
              },
            },
          }),
        });
      });
    }
  }

  close(code = 1000, reason = ''): void {
    if (this.readyState === FakeWebSocket.CLOSED) {
      return;
    }

    this.readyState = FakeWebSocket.CLOSED;
    this.onclose?.({ code, reason, wasClean: true });
  }
}

function waitFor<T>(read: () => T | undefined, timeoutMs = 2_000): Promise<T> {
  return new Promise((resolve, reject) => {
    const started = Date.now();

    const poll = () => {
      const value = read();

      if (value !== undefined) {
        resolve(value);
        return;
      }

      if (Date.now() - started >= timeoutMs) {
        reject(new Error('Timed out waiting for WebSocket state.'));
        return;
      }

      setTimeout(poll, 5);
    };

    poll();
  });
}

function connectionInit(socket: FakeWebSocket): Promise<Record<string, unknown>> {
  return waitFor(() => {
    const message = socket.sent.find((entry) => entry.includes('"connection_init"'));

    return message
      ? (JSON.parse(message) as { payload?: Record<string, unknown> }).payload
      : undefined;
  });
}

function createUiService(accessToken: string): AuthService {
  const service = new AuthService();
  service.setUiLoginSession({ accessToken, refreshToken: 'refresh-token' });

  return service;
}

function createToken(exp: number): string {
  const encode = (value: object) =>
    btoa(JSON.stringify(value)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const header = encode({ alg: 'none', typ: 'JWT' });
  const payload = encode({ exp });

  return `${header}.${payload}.signature`;
}

describe('createWsConnectionParams', () => {
  it('sends no auth for NONE and a raw token for UI_LOGIN', () => {
    const none = new AuthService();
    none.setNoneSession();
    expect(createWsConnectionParams(none)).toEqual({});

    const token = createToken(Math.floor(Date.now() / 1000) + 3600);
    expect(createWsConnectionParams(createUiService(token))).toEqual({
      Authorization: token,
    });
    expect(createWsConnectionParams(createUiService(token)).Authorization).not.toContain(
      'Bearer ',
    );
  });
});

describe('createWsClient', () => {
  it('connects with graphql-transport-ws and receives an initial subscription event for NONE', async () => {
    FakeWebSocket.instances = [];
    const authService = new AuthService();
    authService.setNoneSession();

    const transport = createWsClient({
      url: 'ws://example.com/suwayomi/api/graphql',
      authService,
      webSocketImpl: FakeWebSocket,
    });

    const events: unknown[] = [];
    const unsubscribe = transport.client.subscribe(
      { query: print(DownloadStatusChangedDocument) },
      {
        next: (value) => events.push(value),
        error: (error) => events.push(error),
        complete: () => undefined,
      },
    );

    const socket = await waitFor(() => FakeWebSocket.instances[0]);
    expect(socket.url).toBe('ws://example.com/suwayomi/api/graphql');
    expect(socket.protocols).toBe('graphql-transport-ws');
    expect(await connectionInit(socket)).toEqual({});
    await waitFor(() => (events.length > 0 ? events : undefined));

    expect(events[0]).toMatchObject({
      data: { downloadStatusChanged: { state: 'STOPPED', initial: [] } },
    });

    unsubscribe();
    transport.dispose();
    expect(transport.isDisposed()).toBe(true);
  });

  it('uses the latest raw UI_LOGIN token when a new connection is created', async () => {
    FakeWebSocket.instances = [];
    const firstToken = createToken(Math.floor(Date.now() / 1000) + 3600);
    const secondToken = createToken(Math.floor(Date.now() / 1000) + 7200);
    const authService = createUiService(firstToken);

    const first = createWsClient({
      url: 'wss://example.com/suwayomi/api/graphql',
      authService,
      webSocketImpl: FakeWebSocket,
    });
    const firstUnsubscribe = first.client.subscribe(
      { query: print(DownloadStatusChangedDocument) },
      { next: () => undefined, error: () => undefined, complete: () => undefined },
    );
    const firstSocket = await waitFor(() => FakeWebSocket.instances[0]);
    expect(await connectionInit(firstSocket)).toEqual({ Authorization: firstToken });
    firstUnsubscribe();
    first.dispose();

    authService.setUiLoginSession({ accessToken: secondToken, refreshToken: 'refresh-token' });

    const second = createWsClient({
      url: 'wss://example.com/suwayomi/api/graphql',
      authService,
      webSocketImpl: FakeWebSocket,
    });
    const secondUnsubscribe = second.client.subscribe(
      { query: print(DownloadStatusChangedDocument) },
      { next: () => undefined, error: () => undefined, complete: () => undefined },
    );
    const secondSocket = await waitFor(() => FakeWebSocket.instances[1]);
    expect(await connectionInit(secondSocket)).toEqual({ Authorization: secondToken });
    expect(secondSocket.sent.join('\n')).not.toContain('Bearer ');

    secondUnsubscribe();
    second.dispose();
  });
});
