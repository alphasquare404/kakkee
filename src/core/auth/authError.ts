export type AuthErrorCode =
  | 'INVALID_CREDENTIALS'
  | 'SESSION_EXPIRED'
  | 'MALFORMED_TOKEN'
  | 'REFRESH_FAILED'
  | 'NETWORK_ERROR'
  | 'HTTP_ERROR'
  | 'GRAPHQL_ERROR'
  | 'MALFORMED_RESPONSE'
  | 'FORBIDDEN'
  | 'STALE_AUTH_RESPONSE'
  | 'UNSUPPORTED_AUTH_MODE';

const DEFAULT_MESSAGES: Record<AuthErrorCode, string> = {
  INVALID_CREDENTIALS: 'Kredensial tidak valid.',
  SESSION_EXPIRED: 'Sesi telah berakhir.',
  MALFORMED_TOKEN: 'Token autentikasi tidak valid.',
  REFRESH_FAILED: 'Refresh sesi gagal.',
  NETWORK_ERROR: 'Kesalahan jaringan.',
  HTTP_ERROR: 'Server mengembalikan status HTTP yang tidak berhasil.',
  GRAPHQL_ERROR: 'Permintaan GraphQL gagal.',
  MALFORMED_RESPONSE: 'Respons GraphQL tidak valid.',
  FORBIDDEN: 'Akses ditolak.',
  STALE_AUTH_RESPONSE: 'Respons autentikasi sudah tidak berlaku.',
  UNSUPPORTED_AUTH_MODE: 'Mode autentikasi tidak didukung.',
};

export class AuthError extends Error {
  public readonly code: AuthErrorCode;

  constructor(code: AuthErrorCode, message = DEFAULT_MESSAGES[code]) {
    super(message);
    this.name = 'AuthError';
    this.code = code;
  }
}

export function isAuthError(value: unknown): value is AuthError {
  return value instanceof AuthError;
}
