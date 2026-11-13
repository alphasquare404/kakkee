import { describe, expect, it, vi, afterEach } from 'vitest';
import { formatRelativeTimeShort } from './feedTime';

afterEach(() => {
  vi.useRealTimers();
});

describe('formatRelativeTimeShort', () => {
  it('uses compact seconds, minutes, and hours', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-14T05:00:00Z'));

    expect(formatRelativeTimeShort(String(Date.now() - 40_000))).toBe(
      '40 sec ago',
    );
    expect(formatRelativeTimeShort(String(Date.now() - 5 * 60_000))).toBe(
      '5 min ago',
    );
    expect(formatRelativeTimeShort(String(Date.now() - 2 * 3_600_000))).toBe(
      '2 hr ago',
    );
  });
});
