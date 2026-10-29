import { describe, expect, it } from 'vitest';
import {
  evaluateCompatibility,
  MINIMUM_SUWAYOMI_VERSION,
  parseSuwayomiVersion,
} from './versionCompatibility';

describe('parseSuwayomiVersion', () => {
  it('parses the Suwayomi v2.4.revision format', () => {
    expect(parseSuwayomiVersion('v2.4.2366')).toEqual({
      major: 2,
      minor: 4,
      revision: 2366,
    });
    expect(parseSuwayomiVersion('2.4.2366')).toEqual({
      major: 2,
      minor: 4,
      revision: 2366,
    });
  });

  it('returns null for unknown formats', () => {
    expect(parseSuwayomiVersion('')).toBeNull();
    expect(parseSuwayomiVersion('stable')).toBeNull();
    expect(parseSuwayomiVersion('v2.4')).toBeNull();
    expect(parseSuwayomiVersion('v2.4.latest')).toBeNull();
  });
});

describe('evaluateCompatibility', () => {
  it('accepts the baseline and newer Stable builds', () => {
    expect(evaluateCompatibility(MINIMUM_SUWAYOMI_VERSION, 'Stable').status).toBe('compatible');
    expect(evaluateCompatibility('v2.5.1', 'Stable').status).toBe('compatible');
    expect(evaluateCompatibility('v3.0.0', 'Stable').status).toBe('compatible');
  });

  it('rejects versions below the baseline', () => {
    const result = evaluateCompatibility('v2.4.2365', 'Stable');

    expect(result.status).toBe('incompatible');
    expect(result.warning).toContain(MINIMUM_SUWAYOMI_VERSION);
  });

  it('marks newer non-Stable builds as preview with a warning', () => {
    const result = evaluateCompatibility('v2.4.2400', 'Preview');

    expect(result.status).toBe('preview');
    expect(result.warning).toBeTruthy();
  });

  it('marks unparsable versions as unknown without throwing', () => {
    const result = evaluateCompatibility('nightly', 'Stable');

    expect(result.status).toBe('unknown');
    expect(result.warning).toBeTruthy();
  });
});
