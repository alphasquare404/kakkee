import { CombinedGraphQLErrors, ServerError, type ErrorLike } from '@apollo/client';
import type { GraphQLFormattedError } from 'graphql';
import { AuthError } from '../auth/authError';

export type GraphQLFailureKind =
  | 'unauthorized'
  | 'forbidden'
  | 'invalid-credentials'
  | 'network'
  | 'http'
  | 'malformed-response'
  | 'graphql';

const DEFAULT_MESSAGES: Record<GraphQLFailureKind, string> = {
  unauthorized: 'Sesi tidak diizinkan.',
  forbidden: 'Akses ditolak.',
  'invalid-credentials': 'Kredensial tidak valid.',
  network: 'Kesalahan jaringan.',
  http: 'Server mengembalikan status HTTP yang tidak berhasil.',
  'malformed-response': 'Respons GraphQL tidak valid.',
  graphql: 'Permintaan GraphQL gagal.',
};

export class GraphQLTransportError extends Error {
  public readonly kind: GraphQLFailureKind;
  /** Safe, non-user-facing first line useful for development diagnostics. */
  public readonly diagnostic?: string;

  constructor(kind: GraphQLFailureKind, diagnostic?: string) {
    super(DEFAULT_MESSAGES[kind]);
    this.name = 'GraphQLTransportError';
    this.kind = kind;
    this.diagnostic = diagnostic;
  }
}

export function classifyGraphQLErrorMessage(message: string): GraphQLFailureKind {
  const normalized = message.toLowerCase();

  if (normalized.includes('unauthorizedexception') || normalized.includes('unauthorized')) {
    return 'unauthorized';
  }

  if (normalized.includes('forbiddenexception') || normalized.includes('forbidden')) {
    return 'forbidden';
  }

  if (normalized.includes('incorrect username or password')) {
    return 'invalid-credentials';
  }

  return 'graphql';
}

function safeDiagnostic(error: GraphQLFormattedError): string {
  return error.message.split(/\r?\n/, 1)[0] ?? '';
}

export function fromGraphQLErrors(
  errors: readonly GraphQLFormattedError[],
): GraphQLTransportError {
  const candidates = errors.map((error) => {
    const diagnostic = safeDiagnostic(error);
    const kind = classifyGraphQLErrorMessage(diagnostic);

    return { kind, diagnostic };
  });
  const selected = candidates.find((candidate) => candidate.kind !== 'graphql') ?? candidates[0];

  return new GraphQLTransportError(selected?.kind ?? 'graphql', selected?.diagnostic);
}

export function fromHttpStatus(status: number): GraphQLTransportError {
  return new GraphQLTransportError('http', `status=${status}`);
}

export function fromMalformedResponse(): GraphQLTransportError {
  return new GraphQLTransportError('malformed-response');
}

export function fromNetworkError(error: unknown): GraphQLTransportError {
  const diagnostic = error instanceof Error ? error.name : 'UnknownError';

  return new GraphQLTransportError('network', diagnostic);
}

export function normalizeApolloError(error: ErrorLike): GraphQLTransportError {
  if (CombinedGraphQLErrors.is(error)) {
    return fromGraphQLErrors(error.errors);
  }

  if (ServerError.is(error)) {
    return fromHttpStatus(error.statusCode);
  }

  return fromNetworkError(error);
}

export function getHttpStatus(error: ErrorLike): number | null {
  return ServerError.is(error) ? error.statusCode : null;
}

export function hasBasicAuthChallenge(error: ErrorLike): boolean {
  if (!ServerError.is(error)) {
    return false;
  }

  const challenge = error.response.headers.get('www-authenticate') ?? '';

  return /(^|,)\s*basic\b/i.test(challenge);
}

export function isUnauthorizedFailure(failure: GraphQLTransportError): boolean {
  return failure.kind === 'unauthorized';
}

export function toAuthError(error: unknown): AuthError {
  if (error instanceof AuthError) {
    return error;
  }

  const failure =
    error instanceof GraphQLTransportError ? error : fromNetworkError(error);

  switch (failure.kind) {
    case 'unauthorized':
      return new AuthError('SESSION_EXPIRED');
    case 'forbidden':
      return new AuthError('FORBIDDEN');
    case 'invalid-credentials':
      return new AuthError('INVALID_CREDENTIALS');
    case 'network':
      return new AuthError('NETWORK_ERROR');
    case 'http':
      return new AuthError('HTTP_ERROR');
    case 'malformed-response':
      return new AuthError('MALFORMED_RESPONSE');
    case 'graphql':
      return new AuthError('GRAPHQL_ERROR');
  }
}
