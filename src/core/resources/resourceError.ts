export type ResourceErrorCode =
  | 'unauthorized'
  | 'forbidden'
  | 'not-found'
  | 'network'
  | 'invalid-resource'
  | 'unsafe-resource'
  | 'aborted'
  | 'http'
  | 'invalid-content'
  | 'stale-session'
  | 'disposed';

const MESSAGES: Record<ResourceErrorCode, string> = {
  unauthorized: 'Resource memerlukan sesi yang valid.',
  forbidden: 'Akses ke resource ditolak.',
  'not-found': 'Resource tidak ditemukan.',
  network: 'Kesalahan jaringan saat memuat resource.',
  'invalid-resource': 'Resource tidak valid.',
  'unsafe-resource': 'Resource tidak diizinkan oleh batas keamanan.',
  aborted: 'Permintaan resource dibatalkan.',
  http: 'Server mengembalikan status HTTP yang tidak berhasil.',
  'invalid-content': 'Tipe konten resource tidak sesuai.',
  'stale-session': 'Resource berasal dari sesi yang sudah tidak berlaku.',
  disposed: 'Resource service sudah dihentikan.',
};

export class ResourceError extends Error {
  public readonly code: ResourceErrorCode;
  public readonly status?: number;

  constructor(code: ResourceErrorCode, status?: number) {
    super(MESSAGES[code]);
    this.name = 'ResourceError';
    this.code = code;
    this.status = status;
  }
}

export function isResourceError(value: unknown): value is ResourceError {
  return value instanceof ResourceError;
}
