// @vitest-environment jsdom

import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type {
  LoadedResource,
  ResourceService,
} from '../core/resources/resourceService';
import { useImageResource } from './useImageResource';

function resource(url: string): LoadedResource {
  return {
    blob: new Blob(),
    objectUrl: url,
    contentType: 'image/png',
    dispose: vi.fn(),
  };
}

function fakeResources(loadImageResource: ResourceService['loadImageResource']) {
  return {
    loadImageResource,
    loadResource: vi.fn(),
    dispose: vi.fn(),
    isDisposed: () => false,
  } as unknown as ResourceService;
}

describe('useImageResource', () => {
  it('loads a path and disposes its object URL on unmount', async () => {
    const loaded = resource('blob:thumb');
    const loadImageResource = vi.fn(async () => loaded);
    const resources = fakeResources(loadImageResource);
    const { result, unmount } = renderHook(() =>
      useImageResource(resources, '/api/v1/manga/1/thumbnail'),
    );

    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.objectUrl).toBe('blob:thumb');
    expect(loadImageResource).toHaveBeenCalledWith(
      '/api/v1/manga/1/thumbnail',
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );

    unmount();
    expect(loaded.dispose).toHaveBeenCalledTimes(1);
  });

  it('disposes the previous URL when the path changes', async () => {
    const first = resource('blob:first');
    const second = resource('blob:second');
    const loadImageResource = vi
      .fn()
      .mockResolvedValueOnce(first)
      .mockResolvedValueOnce(second);
    const resources = fakeResources(loadImageResource);
    const { result, rerender } = renderHook(
      ({ path }) => useImageResource(resources, path),
      { initialProps: { path: '/first' } },
    );

    await waitFor(() => expect(result.current.objectUrl).toBe('blob:first'));
    rerender({ path: '/second' });

    await waitFor(() => expect(result.current.objectUrl).toBe('blob:second'));
    expect(first.dispose).toHaveBeenCalledTimes(1);
  });

  it('supports retry after a failed load', async () => {
    const loaded = resource('blob:retry');
    const loadImageResource = vi
      .fn()
      .mockRejectedValueOnce(new Error('failed'))
      .mockResolvedValueOnce(loaded);
    const resources = fakeResources(loadImageResource);
    const { result } = renderHook(() => useImageResource(resources, '/thumb'));

    await waitFor(() => expect(result.current.status).toBe('error'));

    act(() => result.current.retry());

    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.objectUrl).toBe('blob:retry');
  });
});
