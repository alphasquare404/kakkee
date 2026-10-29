export type ConnectionErrorCode =
  | 'invalid-server-url'
  | 'unreachable'
  | 'incompatible-server'
  | 'authentication-required'
  | 'invalid-credentials'
  | 'unsupported-auth'
  | 'server-error'
  | 'stale'
  | 'cancelled'
  | 'invalid-state'
  | 'disposed';

const MESSAGES: Record<ConnectionErrorCode, string> = {
  'invalid-server-url': 'URL server tidak valid.',
  unreachable: 'Server tidak dapat dijangkau.',
  'incompatible-server': 'Versi server tidak kompatibel dengan baseline.',
  'authentication-required': 'Server memerlukan autentikasi.',
  'invalid-credentials': 'Kredensial tidak valid.',
  'unsupported-auth': 'Mode autentikasi server belum didukung.',
  'server-error': 'Server mengembalikan error yang tidak dapat diproses.',
  stale: 'Operasi koneksi sudah tidak berlaku.',
  cancelled: 'Operasi koneksi dibatalkan.',
  'invalid-state': 'Operasi tidak valid untuk state koneksi saat ini.',
  disposed: 'Connection coordinator sudah dihentikan.',
};

export class ConnectionError extends Error {
  public readonly code: ConnectionErrorCode;
  /** Safe diagnostic detail; never contains credentials or tokens. */
  public readonly detail?: string;

  constructor(code: ConnectionErrorCode, detail?: string) {
    super(MESSAGES[code]);
    this.name = 'ConnectionError';
    this.code = code;
    this.detail = detail;
  }
}

export function isConnectionError(value: unknown): value is ConnectionError {
  return value instanceof ConnectionError;
}
