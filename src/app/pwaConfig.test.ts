import { describe, expect, it } from 'vitest';
import { createPwaManifest, createPwaWorkbox } from './pwaConfig';

describe('PWA manifest', () => {
  it('uses root start_url, scope, and root icon paths', () => {
    const manifest = createPwaManifest('/');

    expect(manifest.name).toContain('Unofficial');
    expect(manifest.start_url).toBe('/');
    expect(manifest.scope).toBe('/');
    expect(manifest.display).toBe('standalone');
    expect(manifest.theme_color).toBe('#0b1020');
    expect(manifest.background_color).toBe('#080b12');
    expect(manifest.icons?.map((icon) => icon.src)).toEqual([
      '/icons/icon-192.png',
      '/icons/icon-512.png',
      '/icons/icon-512-maskable.png',
    ]);
  });

  it('uses /app/ start_url, scope, and /app/ icon paths', () => {
    const manifest = createPwaManifest('/app/');

    expect(manifest.start_url).toBe('/app/');
    expect(manifest.scope).toBe('/app/');
    expect(manifest.id).toBe('/app/');
    expect(manifest.icons?.map((icon) => icon.src)).toEqual([
      '/app/icons/icon-192.png',
      '/app/icons/icon-512.png',
      '/app/icons/icon-512-maskable.png',
    ]);
    expect(
      manifest.icons?.every((icon) => icon.src?.startsWith('/app/icons/')),
    ).toBe(true);
  });
});

describe('PWA service worker policy', () => {
  it('precaches only shell asset patterns and has no runtime caching', () => {
    const workbox = createPwaWorkbox('/');

    expect(workbox.globPatterns).toEqual([
      '**/*.{js,css,html,png,svg,ico,webmanifest}',
    ]);
    expect(workbox.runtimeCaching).toEqual([]);
    expect(workbox.globIgnores).toEqual([
      '**/manifest.webmanifest',
      '**/icons/*.png',
    ]);
    expect(workbox.navigateFallback).toBe('/index.html');
    expect(workbox.navigateFallbackDenylist).toEqual([/^\/api(?:\/|$)/]);
    expect(workbox.skipWaiting).toBe(false);
    expect(workbox.clientsClaim).toBe(false);
  });

  it('keeps the navigation fallback and API denylist under /app/', () => {
    const workbox = createPwaWorkbox('/app/');

    expect(workbox.navigateFallback).toBe('/app/index.html');
    expect(workbox.navigateFallbackDenylist).toEqual([
      /^\/api(?:\/|$)/,
      /^\/app\/api(?:\/|$)/,
    ]);
    expect(workbox.runtimeCaching).toEqual([]);
  });

  it('does not list API or private resource paths in precache patterns', () => {
    const workbox = createPwaWorkbox('/');
    const patterns = workbox.globPatterns?.join(' ') ?? '';

    expect(patterns).not.toContain('/api');
    expect(patterns).not.toContain('graphql');
    expect(patterns).not.toContain('thumbnail');
  });
});
