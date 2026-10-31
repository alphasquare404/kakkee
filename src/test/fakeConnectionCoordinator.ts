import type { ApolloClient } from '@apollo/client';
import type { ResourceService } from '../core/resources/resourceService';
import type {
  ConnectionCoordinator,
  ConnectionState,
  ConnectedState,
  LoginRequiredState,
} from '../core/server/connectionCoordinator';
import { ConnectionError } from '../core/server/connectionError';

export class FakeConnectionCoordinator implements ConnectionCoordinator {
  public readonly connectCalls: string[] = [];
  public readonly loginCalls: Array<{ username: string; password: string }> = [];
  public readonly restoreCalls: string[] = [];
  public readonly disconnectCalls: string[] = [];
  public disposed = false;
  public listenerCount = 0;

  private state: ConnectionState;
  private readonly listeners = new Set<(state: ConnectionState) => void>();

  constructor(initial: ConnectionState = { status: 'disconnected' }) {
    this.state = initial;
  }

  getState(): ConnectionState {
    return this.state;
  }

  subscribe(listener: (state: ConnectionState) => void): () => void {
    this.listeners.add(listener);
    this.listenerCount = this.listeners.size;

    return () => {
      this.listeners.delete(listener);
      this.listenerCount = this.listeners.size;
    };
  }

  async connect(serverUrl: string): Promise<void> {
    this.connectCalls.push(serverUrl);
  }

  async login(username: string, password: string): Promise<void> {
    this.loginCalls.push({ username, password });
  }

  async restoreSession(refreshToken: string): Promise<void> {
    this.restoreCalls.push(refreshToken);
  }

  async disconnect(): Promise<void> {
    this.disconnectCalls.push('disconnect');
  }

  async dispose(): Promise<void> {
    this.disposed = true;
    this.listeners.clear();
    this.listenerCount = 0;
  }

  emit(state: ConnectionState): void {
    this.state = state;

    for (const listener of [...this.listeners]) {
      listener(state);
    }
  }
}

export function makeLoginRequiredState(
  error?: ConnectionError,
): LoginRequiredState {
  return {
    status: 'login-required',
    serverBaseUrl: 'https://server.example/suwayomi',
    config: createTestConfig(),
    serverInfo: testServerInfo(),
    compatibility: {
      status: 'compatible',
      baseline: 'v2.4.2366',
      version: 'v2.4.2366',
      buildType: 'Stable',
    },
    authMode: 'UNKNOWN',
    error,
  };
}

export function makeConnectedState(
  compatibility: ConnectedState['context']['compatibility'] = {
    status: 'compatible',
    baseline: 'v2.4.2366',
    version: 'v2.4.2366',
    buildType: 'Stable',
  },
): ConnectedState {
  return {
    status: 'connected',
    context: {
      config: createTestConfig(),
      serverInfo: testServerInfo(),
      authMode: 'NONE',
      compatibility,
      graphQL: {} as ApolloClient,
      resources: {} as ResourceService,
    },
  };
}

function createTestConfig(): ConnectedState['context']['config'] {
  return {
    frontendBasePath: '/',
    serverBaseUrl: 'https://server.example/suwayomi',
    serverOrigin: 'https://server.example',
    serverPath: '/suwayomi',
    sameOrigin: false,
    graphqlHttpUrl: 'https://server.example/suwayomi/api/graphql',
    graphqlWsUrl: 'wss://server.example/suwayomi/api/graphql',
    resolveResource: (path: string) => `https://server.example/suwayomi${path}`,
  };
}

function testServerInfo(): ConnectedState['context']['serverInfo'] {
  return {
    __typename: 'AboutServerPayload',
    name: 'Suwayomi-Server',
    version: 'v2.4.2366',
    buildType: 'Stable',
    buildTime: '1',
    platformInfo: {
      __typename: 'PlatformInfo',
      arch: 'amd64',
      headless: true,
      os: { __typename: 'OSInfo', name: 'Linux', version: '6.0', build: '1' },
      jvm: {
        __typename: 'JvmInfo',
        javaVersion: '21',
        vmName: 'OpenJDK',
        vmVersion: '21',
        vmVendor: 'Temurin',
      },
    },
  };
}
