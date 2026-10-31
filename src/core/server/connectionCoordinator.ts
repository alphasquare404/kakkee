import type { ApolloClient } from '@apollo/client';
import { AuthError } from '../auth/authError';
import { AuthService } from '../auth/authService';
import {
  createDeploymentConfig,
  type DeploymentConfig,
} from '../config/deployment';
import {
  createGraphQLTransport,
  type GraphQLTransport,
} from '../graphql/createClient';
import {
  getHttpStatus,
  hasBasicAuthChallenge,
  normalizeApolloError,
} from '../graphql/errors';
import type { FetchLike } from '../graphql/authTransport';
import {
  AboutServerDocument,
  AuthProbeDocument,
  type AboutServerQuery,
} from '../graphql/generated/graphql';
import {
  createResourceService,
  type ResourceService,
} from '../resources/resourceService';
import { ConnectionError } from './connectionError';
import {
  evaluateCompatibility,
  type CompatibilityInfo,
} from './versionCompatibility';

export type SupportedAuthMode = 'NONE' | 'UI_LOGIN';
export type DetectedAuthMode = SupportedAuthMode | 'BASIC_AUTH' | 'SIMPLE_LOGIN' | 'UNKNOWN';

export type ServerInfo = AboutServerQuery['aboutServer'];

export interface ConnectedContext {
  readonly config: DeploymentConfig;
  readonly serverInfo: ServerInfo;
  readonly authMode: SupportedAuthMode;
  readonly compatibility: CompatibilityInfo;
  readonly graphQL: ApolloClient;
  readonly resources: ResourceService;
  readonly authService?: {
    getAccessToken(): string | null;
  };
}

export interface DisconnectedState {
  readonly status: 'disconnected';
}

export interface ConnectingState {
  readonly status: 'connecting';
  readonly serverBaseUrl: string;
  readonly config: DeploymentConfig;
}

export interface LoginRequiredState {
  readonly status: 'login-required';
  readonly serverBaseUrl: string;
  readonly config: DeploymentConfig;
  readonly serverInfo: ServerInfo;
  readonly compatibility: CompatibilityInfo;
  /** Protected probe requires auth; the concrete server auth mode is not yet proven. */
  readonly authMode: 'UNKNOWN';
  readonly error?: ConnectionError;
}

export interface AuthenticatingState {
  readonly status: 'authenticating';
  readonly serverBaseUrl: string;
  readonly config: DeploymentConfig;
  readonly serverInfo: ServerInfo;
  readonly compatibility: CompatibilityInfo;
}

export interface ConnectedState {
  readonly status: 'connected';
  readonly context: ConnectedContext;
}

export interface UnsupportedAuthState {
  readonly status: 'unsupported-auth';
  readonly serverBaseUrl?: string;
  readonly config?: DeploymentConfig;
  readonly serverInfo?: ServerInfo;
  readonly authMode: DetectedAuthMode;
  readonly error: ConnectionError;
}

export interface FailedState {
  readonly status: 'failed';
  readonly serverBaseUrl?: string;
  readonly config?: DeploymentConfig;
  readonly serverInfo?: ServerInfo;
  readonly error: ConnectionError;
}

export type ConnectionState =
  | DisconnectedState
  | ConnectingState
  | LoginRequiredState
  | AuthenticatingState
  | ConnectedState
  | UnsupportedAuthState
  | FailedState;

type ConnectionListener = (state: ConnectionState) => void;

export interface ConnectionCoordinatorOptions {
  readonly frontendUrl: string;
  readonly frontendBasePath?: string;
  readonly fetchImpl?: FetchLike;
  readonly webSocketImpl?: unknown;
}

interface ActiveServices {
  readonly authService: AuthService;
  readonly graphQL: GraphQLTransport;
  readonly resources: ResourceService;
}

type ProbeResult =
  | { readonly kind: 'ok' }
  | { readonly kind: 'authentication-required' }
  | { readonly kind: 'basic' }
  | { readonly kind: 'failure'; readonly error: ConnectionError };

export interface ConnectionCoordinator {
  connect(serverUrl: string): Promise<void>;
  login(username: string, password: string): Promise<void>;
  disconnect(): Promise<void>;
  dispose(): Promise<void>;
  getState(): ConnectionState;
  subscribe(listener: ConnectionListener): () => void;
}

function asErrorLike(error: unknown): Parameters<typeof normalizeApolloError>[0] {
  return error as Parameters<typeof normalizeApolloError>[0];
}

export class DefaultConnectionCoordinator implements ConnectionCoordinator {
  private readonly frontendUrl: string;
  private readonly frontendBasePath?: string;
  private readonly fetchImpl?: FetchLike;
  private readonly webSocketImpl?: unknown;
  private readonly listeners = new Set<ConnectionListener>();
  private state: ConnectionState = { status: 'disconnected' };
  private services: ActiveServices | null = null;
  private generation = 0;
  private disposed = false;

  constructor(options: ConnectionCoordinatorOptions) {
    this.frontendUrl = options.frontendUrl;
    this.frontendBasePath = options.frontendBasePath;
    this.fetchImpl = options.fetchImpl;
    this.webSocketImpl = options.webSocketImpl;
  }

  public getState(): ConnectionState {
    return this.state;
  }

  public subscribe(listener: ConnectionListener): () => void {
    if (this.disposed) {
      return () => undefined;
    }

    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }

  public async connect(serverUrl: string): Promise<void> {
    this.assertNotDisposed();

    let config: DeploymentConfig;

    try {
      config = createDeploymentConfig({
        frontendUrl: this.frontendUrl,
        frontendBasePath: this.frontendBasePath,
        serverBaseUrl: serverUrl,
      });
    } catch {
      const generation = ++this.generation;

      this.publish(generation, {
        status: 'failed',
        error: new ConnectionError('invalid-server-url'),
      });
      await this.disposeServices();
      return;
    }

    const generation = ++this.generation;
    this.publish(generation, {
      status: 'connecting',
      serverBaseUrl: config.serverBaseUrl,
      config,
    });

    await this.disposeServices();

    if (!this.isCurrent(generation)) {
      return;
    }

    const authService = new AuthService();
    authService.setNoneSession();

    let services: ActiveServices;

    try {
      services = {
        authService,
        graphQL: createGraphQLTransport({
          config,
          authService,
          fetchImpl: this.fetchImpl,
          webSocketImpl: this.webSocketImpl,
        }),
        resources: createResourceService({
          config,
          authService,
          fetchImpl: this.fetchImpl,
        }),
      };
    } catch {
      this.publish(generation, {
        status: 'failed',
        config,
        error: new ConnectionError('server-error', 'transport-init'),
      });
      return;
    }

    this.services = services;

    let aboutResult;

    try {
      aboutResult = await services.graphQL.client.query({
        query: AboutServerDocument,
        fetchPolicy: 'no-cache',
      });
    } catch (error) {
      if (!this.isCurrent(generation)) {
        return;
      }

      const connectionError = this.toConnectionError(error, 'aboutServer');

      if (connectionError.code === 'unsupported-auth') {
        this.publish(generation, {
          status: 'unsupported-auth',
          serverBaseUrl: config.serverBaseUrl,
          config,
          authMode: 'BASIC_AUTH',
          error: connectionError,
        });
        await this.disposeServices();
        return;
      }

      this.publish(generation, {
        status: 'failed',
        serverBaseUrl: config.serverBaseUrl,
        config,
        error: connectionError,
      });
      await this.disposeServices();
      return;
    }

    if (!this.isCurrent(generation)) {
      return;
    }

    const serverInfo = aboutResult.data?.aboutServer;

    if (!serverInfo) {
      this.publish(generation, {
        status: 'failed',
        serverBaseUrl: config.serverBaseUrl,
        config,
        error: new ConnectionError('server-error', 'malformed-aboutServer'),
      });
      await this.disposeServices();
      return;
    }

    const compatibility = evaluateCompatibility(serverInfo.version, serverInfo.buildType);

    if (compatibility.status === 'incompatible') {
      this.publish(generation, {
        status: 'failed',
        serverBaseUrl: config.serverBaseUrl,
        config,
        serverInfo,
        error: new ConnectionError('incompatible-server', 'version-below-baseline'),
      });
      await this.disposeServices();
      return;
    }

    const probe = await this.probe();

    if (!this.isCurrent(generation)) {
      return;
    }

    if (probe.kind === 'ok') {
      services.authService.setNoneSession();
      this.publish(generation, {
        status: 'connected',
        context: {
          config,
          serverInfo,
          authMode: 'NONE',
          compatibility,
          graphQL: services.graphQL.client,
          resources: services.resources,
          authService: services.authService,
        },
      });
      return;
    }

    if (probe.kind === 'authentication-required') {
      services.authService.setUiLoginRequired();
      this.publish(generation, {
        status: 'login-required',
        serverBaseUrl: config.serverBaseUrl,
        config,
        serverInfo,
        compatibility,
        authMode: 'UNKNOWN',
      });
      return;
    }

    if (probe.kind === 'basic') {
      this.publish(generation, {
        status: 'unsupported-auth',
        serverBaseUrl: config.serverBaseUrl,
        config,
        serverInfo,
        authMode: 'BASIC_AUTH',
        error: new ConnectionError('unsupported-auth', 'basic-challenge'),
      });
      await this.disposeServices();
      return;
    }

    this.publish(generation, {
      status: 'failed',
      serverBaseUrl: config.serverBaseUrl,
      config,
      serverInfo,
      error: probe.error,
    });
    await this.disposeServices();
  }

  public async login(username: string, password: string): Promise<void> {
    this.assertNotDisposed();

    const state = this.state;

    if (state.status !== 'login-required') {
      throw new ConnectionError('invalid-state', 'login-requires-login-required');
    }

    const services = this.services;

    if (!services) {
      throw new ConnectionError('invalid-state', 'missing-services');
    }

    const generation = this.generation;
    const loginContext = {
      serverBaseUrl: state.serverBaseUrl,
      config: state.config,
      serverInfo: state.serverInfo,
      compatibility: state.compatibility,
    };

    this.publish(generation, {
      status: 'authenticating',
      ...loginContext,
    });

    const attempt = services.authService.beginLogin();

    let result;

    try {
      result = await services.graphQL.authTransport.login({ username, password });
    } catch (error) {
      if (!this.isCurrent(generation)) {
        return;
      }

      const authError = error instanceof AuthError ? error : new AuthError('GRAPHQL_ERROR');

      services.authService.failLogin(attempt, authError);

      if (authError.code !== 'INVALID_CREDENTIALS') {
        services.authService.setUiLoginRequired();
      }

      if (authError.code === 'UNSUPPORTED_AUTH_MODE') {
        this.publish(generation, {
          status: 'unsupported-auth',
          ...loginContext,
          authMode: 'UNKNOWN',
          error: new ConnectionError('unsupported-auth', 'login-contract'),
        });
        await this.disposeServices();
        return;
      }

      this.publish(generation, {
        status: 'login-required',
        ...loginContext,
        authMode: 'UNKNOWN',
        error: this.mapLoginError(authError),
      });
      return;
    }

    if (!this.isCurrent(generation)) {
      return;
    }

    if (!services.authService.completeLogin(attempt, result)) {
      this.publish(generation, {
        status: 'login-required',
        ...loginContext,
        authMode: 'UNKNOWN',
        error: new ConnectionError('server-error', 'login-session'),
      });
      services.authService.setUiLoginRequired();
      return;
    }

    const probe = await this.probe();

    if (!this.isCurrent(generation)) {
      return;
    }

    if (probe.kind === 'ok') {
      this.publish(generation, {
        status: 'connected',
        context: {
          ...loginContext,
          authMode: 'UI_LOGIN',
          graphQL: services.graphQL.client,
          resources: services.resources,
          authService: services.authService,
        },
      });
      return;
    }

    services.authService.setUiLoginRequired();

    if (probe.kind === 'basic') {
      this.publish(generation, {
        status: 'unsupported-auth',
        ...loginContext,
        authMode: 'BASIC_AUTH',
        error: new ConnectionError('unsupported-auth', 'basic-challenge'),
      });
      await this.disposeServices();
      return;
    }

    this.publish(generation, {
      status: 'login-required',
      ...loginContext,
      authMode: 'UNKNOWN',
      error:
        probe.kind === 'authentication-required'
          ? new ConnectionError('authentication-required', 'probe-after-login')
          : probe.error,
    });
  }

  public async disconnect(): Promise<void> {
    if (this.disposed) {
      return;
    }

    const generation = ++this.generation;
    this.publish(generation, { status: 'disconnected' });
    await this.disposeServices();
  }

  public async dispose(): Promise<void> {
    if (this.disposed) {
      return;
    }

    this.disposed = true;
    this.generation += 1;
    this.state = { status: 'disconnected' };
    this.notify();
    await this.disposeServices();
    this.listeners.clear();
  }

  private async probe(): Promise<ProbeResult> {
    const services = this.services;

    if (!services) {
      return {
        kind: 'failure',
        error: new ConnectionError('invalid-state', 'missing-services'),
      };
    }

    try {
      await services.graphQL.client.query({
        query: AuthProbeDocument,
        fetchPolicy: 'no-cache',
      });

      return { kind: 'ok' };
    } catch (error) {
      if (hasBasicAuthChallenge(asErrorLike(error))) {
        return { kind: 'basic' };
      }

      const status = getHttpStatus(asErrorLike(error));

      if (status === 401) {
        return { kind: 'authentication-required' };
      }

      const failure = normalizeApolloError(asErrorLike(error));

      if (failure.kind === 'unauthorized') {
        return { kind: 'authentication-required' };
      }

      return {
        kind: 'failure',
        error: this.toConnectionError(error, 'authProbe'),
      };
    }
  }

  private toConnectionError(error: unknown, phase: string): ConnectionError {
    const errorLike = asErrorLike(error);

    if (hasBasicAuthChallenge(errorLike)) {
      return new ConnectionError('unsupported-auth', 'basic-challenge');
    }

    const status = getHttpStatus(errorLike);

    if (status === 401) {
      return new ConnectionError('authentication-required', 'http-401');
    }

    const failure = normalizeApolloError(errorLike);

    switch (failure.kind) {
      case 'network':
        return new ConnectionError('unreachable', 'network');
      case 'unauthorized':
        return new ConnectionError('authentication-required', 'unauthorized');
      case 'forbidden':
        return new ConnectionError('server-error', 'forbidden');
      case 'invalid-credentials':
        return new ConnectionError('invalid-credentials');
      case 'malformed-response':
        return new ConnectionError('server-error', 'malformed-response');
      case 'http':
        return new ConnectionError('server-error', `http-${status ?? 'unknown'}`);
      case 'graphql':
        return new ConnectionError('server-error', phase);
    }
  }

  private mapLoginError(error: AuthError): ConnectionError {
    switch (error.code) {
      case 'INVALID_CREDENTIALS':
        return new ConnectionError('invalid-credentials');
      case 'UNSUPPORTED_AUTH_MODE':
        return new ConnectionError('unsupported-auth', 'login-contract');
      case 'NETWORK_ERROR':
      case 'HTTP_ERROR':
        return new ConnectionError('unreachable', 'login-network');
      default:
        return new ConnectionError('server-error', 'login');
    }
  }

  private async disposeServices(): Promise<void> {
    const services = this.services;

    this.services = null;

    if (!services) {
      return;
    }

    try {
      await services.graphQL.dispose();
    } finally {
      services.resources.dispose();
      services.authService.clearSession();
    }
  }

  private assertNotDisposed(): void {
    if (this.disposed) {
      throw new ConnectionError('disposed');
    }
  }

  private isCurrent(generation: number): boolean {
    return !this.disposed && generation === this.generation;
  }

  private publish(generation: number, state: ConnectionState): void {
    if (!this.isCurrent(generation)) {
      return;
    }

    this.state = state;
    this.notify();
  }

  private notify(): void {
    for (const listener of [...this.listeners]) {
      try {
        listener(this.state);
      } catch {
        // Listener failures must not break coordinator transitions.
      }
    }
  }
}

export function createConnectionCoordinator(
  options: ConnectionCoordinatorOptions,
): ConnectionCoordinator {
  return new DefaultConnectionCoordinator(options);
}
