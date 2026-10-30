import { describe, expect, it, vi } from 'vitest';
import { createSourceController } from './sourceController';
import type { SourceRepository } from './sourceRepository';

function setup() {
  const getInfo = vi.fn(async () => ({
    __typename: 'SourceType' as const,
    id: '42',
    displayName: 'Example',
    name: 'ExampleSource',
    lang: 'en',
    contentWarning: 'SAFE' as const,
  }));
  const fetchManga = vi.fn(async () => ({
    mangas: [
      {
        __typename: 'MangaType' as const,
        id: 1,
        title: 'Alpha',
        thumbnailUrl: null,
        inLibrary: false,
        sourceId: '42',
      },
    ],
    hasNextPage: true,
  }));
  const setLibrary = vi.fn(async () => undefined);
  const repository = {
    getInfo,
    fetchManga,
    setLibrary,
  } as unknown as SourceRepository;
  return {
    controller: createSourceController(repository),
    getInfo,
    fetchManga,
    setLibrary,
  };
}

describe('createSourceController', () => {
  it('loads popular manga, searches, loads more, and toggles library', async () => {
    const { controller, fetchManga, setLibrary } = setup();
    await controller.load('42');

    expect(controller.getState().source?.displayName).toBe('Example');
    expect(controller.getState().mangas).toHaveLength(1);
    await controller.search('one piece');
    await controller.loadMore();
    await controller.toggleLibrary(controller.getState().mangas[0]!);

    expect(fetchManga).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'SEARCH', query: 'one piece', page: 1 }),
    );
    expect(fetchManga).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'SEARCH', page: 2 }),
    );
    expect(setLibrary).toHaveBeenCalledWith([1], true);
    expect(controller.getState().mangas[0]?.inLibrary).toBe(true);
  });
});
