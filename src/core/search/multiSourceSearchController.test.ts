import { describe, expect, it, vi } from 'vitest';
import type { SourceManga } from '../source/sourceRepository';
import { createMultiSourceSearchController } from './multiSourceSearchController';

function manga(id: number, sourceId: string, title = `Manga ${id}`): SourceManga {
  return {
    __typename: 'MangaType',
    id,
    title,
    thumbnailUrl: null,
    inLibrary: false,
    sourceId,
  };
}

describe('multi-source search controller', () => {
  it('aggregates results from multiple sources', async () => {
    const fetchPage = vi.fn(async (sourceId: string) => ({
      mangas: [manga(sourceId === 'a' ? 1 : 2, sourceId)],
      hasNextPage: false,
    }));
    const controller = createMultiSourceSearchController({ fetchPage });

    await controller.start('alpha', ['a', 'b']);

    expect(controller.getState().status).toBe('ready');
    expect(controller.getState().sources.a.mangas).toHaveLength(1);
    expect(controller.getState().sources.b.mangas).toHaveLength(1);
    expect(controller.getState().total).toBe(2);
  });

  it('keeps successful sources when another source fails', async () => {
    const fetchPage = vi.fn(async (sourceId: string) => {
      if (sourceId === 'bad') {
        throw new Error('failed');
      }

      return { mangas: [manga(1, sourceId)], hasNextPage: false };
    });
    const controller = createMultiSourceSearchController({ fetchPage });

    await controller.start('alpha', ['good', 'bad']);

    expect(controller.getState().sources.good.status).toBe('ready');
    expect(controller.getState().sources.bad.status).toBe('error');
    expect(controller.getState().status).toBe('ready');
  });

  it('ignores stale results from an older query', async () => {
    let resolveFirst: (value: { mangas: SourceManga[]; hasNextPage: boolean }) => void = () => {};
    const fetchPage = vi.fn((sourceId: string, _page: number, query: string) => {
      if (query === 'first') {
        return new Promise<{ mangas: SourceManga[]; hasNextPage: boolean }>((resolve) => {
          resolveFirst = resolve;
        });
      }

      return Promise.resolve({
        mangas: [manga(2, sourceId, 'Second')],
        hasNextPage: false,
      });
    });
    const controller = createMultiSourceSearchController({ fetchPage });

    const first = controller.start('first', ['a']);
    await controller.start('second', ['a']);
    resolveFirst({ mangas: [manga(1, 'a', 'First')], hasNextPage: false });
    await first;

    expect(controller.getState().query).toBe('second');
    expect(controller.getState().sources.a.mangas[0]?.title).toBe('Second');
  });

  it('loads additional pages without restarting the search', async () => {
    const fetchPage = vi.fn(async (sourceId: string, page: number) => ({
      mangas: [manga(page, sourceId, `Page ${page}`)],
      hasNextPage: page < 2,
    }));
    const controller = createMultiSourceSearchController({ fetchPage });

    await controller.start('alpha', ['a']);
    await controller.loadMore('a');

    expect(fetchPage).toHaveBeenCalledTimes(2);
    expect(controller.getState().sources.a.page).toBe(2);
    expect(controller.getState().sources.a.mangas.map((item) => item.title)).toEqual([
      'Page 1',
      'Page 2',
    ]);
  });
});
