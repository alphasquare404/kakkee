import { describe, expect, it } from 'vitest';
import {
  createSectionOrigin,
  getLegacyReturnPath,
  getNavigationOrigin,
  isNavigationOrigin,
  originHref,
} from './navigationOrigin';

describe('navigationOrigin', () => {
  it('preserves query parameters in the origin and breadcrumb target', () => {
    const origin = createSectionOrigin('search', {
      pathname: '/search',
      search: '?q=one+piece',
    });

    expect(originHref(origin)).toBe('/search?q=one+piece');
    expect(origin.trail[0]).toMatchObject({
      pathname: '/search',
      search: '?q=one+piece',
      labelKey: 'Search',
    });
  });

  it('supports a source trail without inventing Library', () => {
    const origin = createSectionOrigin('browse', {
      pathname: '/browse/7',
      search: '?q=art',
      trail: [
        { pathname: '/browse', labelKey: 'Browse' },
        { pathname: '/browse/7', search: '?q=art', label: 'MangaDex' },
      ],
    });

    expect(origin.trail.map((crumb) => crumb.labelKey ?? crumb.label)).toEqual([
      'Browse',
      'MangaDex',
    ]);
  });

  it('rejects malformed origins and unsafe legacy returns', () => {
    expect(isNavigationOrigin({ pathname: '/library', section: 'library', trail: [] })).toBe(
      true,
    );
    expect(isNavigationOrigin({ pathname: '//evil.example', section: 'library', trail: [] })).toBe(
      false,
    );
    expect(getNavigationOrigin({ origin: { pathname: 'library' } })).toBeNull();
    expect(getLegacyReturnPath({ from: '//evil.example' })).toBeNull();
    expect(getLegacyReturnPath({ from: '/updates' })).toBe('/updates');
  });
});
