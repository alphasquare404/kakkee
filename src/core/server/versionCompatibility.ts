export const MINIMUM_SUWAYOMI_VERSION = 'v2.4.2366';

export interface ParsedSuwayomiVersion {
  readonly major: number;
  readonly minor: number;
  readonly revision: number;
}

export type CompatibilityStatus = 'compatible' | 'preview' | 'unknown' | 'incompatible';

export interface CompatibilityInfo {
  readonly status: CompatibilityStatus;
  readonly baseline: typeof MINIMUM_SUWAYOMI_VERSION;
  readonly version: string;
  readonly buildType: string;
  readonly warning?: string;
}

export function parseSuwayomiVersion(input: string): ParsedSuwayomiVersion | null {
  const match = /^v?(\d+)\.(\d+)\.(\d+)(?:[-+].*)?$/i.exec(input.trim());

  if (!match) {
    return null;
  }

  const major = Number(match[1]);
  const minor = Number(match[2]);
  const revision = Number(match[3]);

  if (![major, minor, revision].every(Number.isSafeInteger)) {
    return null;
  }

  return { major, minor, revision };
}

function compareVersions(a: ParsedSuwayomiVersion, b: ParsedSuwayomiVersion): number {
  if (a.major !== b.major) {
    return a.major - b.major;
  }

  if (a.minor !== b.minor) {
    return a.minor - b.minor;
  }

  return a.revision - b.revision;
}

export function evaluateCompatibility(version: string, buildType: string): CompatibilityInfo {
  const parsed = parseSuwayomiVersion(version);
  const minimum = parseSuwayomiVersion(MINIMUM_SUWAYOMI_VERSION);

  if (!parsed || !minimum) {
    return {
      status: 'unknown',
      baseline: MINIMUM_SUWAYOMI_VERSION,
      version,
      buildType,
      warning: 'Versi server tidak dapat diparse; hanya operasi baseline yang terbukti dijalankan.',
    };
  }

  if (compareVersions(parsed, minimum) < 0) {
    return {
      status: 'incompatible',
      baseline: MINIMUM_SUWAYOMI_VERSION,
      version,
      buildType,
      warning: `Versi server di bawah baseline ${MINIMUM_SUWAYOMI_VERSION}.`,
    };
  }

  const isStable = buildType.trim().toLowerCase() === 'stable';

  if (!isStable) {
    return {
      status: 'preview',
      baseline: MINIMUM_SUWAYOMI_VERSION,
      version,
      buildType,
      warning: 'Build bukan Stable; hanya kontrak baseline yang berhasil yang dipakai.',
    };
  }

  return {
    status: 'compatible',
    baseline: MINIMUM_SUWAYOMI_VERSION,
    version,
    buildType,
  };
}
