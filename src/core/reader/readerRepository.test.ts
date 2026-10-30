import type { ApolloClient } from '@apollo/client';
import { describe, expect, it, vi } from 'vitest';
import { createReaderRepository } from './readerRepository';

describe('createReaderRepository', () => {
  it('loads chapter, neighbors, and pages through generated documents', async () => {
    const chapter = {
      __typename: 'ChapterType',
      id: 10,
      name: 'Chapter 10',
      pageCount: 2,
      chapterNumber: 10,
      sourceOrder: 10,
      isRead: false,
      lastPageRead: 0,
      manga: {
        __typename: 'MangaType',
        id: 1,
        title: 'Manga',
        thumbnailUrl: null,
      },
    };
    const query = vi
      .fn()
      .mockResolvedValueOnce({ data: { chapter } })
      .mockResolvedValueOnce({
        data: {
          previous: {
            nodes: [{ id: 9, name: 'Chapter 9', chapterNumber: 9 }],
          },
          next: {
            nodes: [{ id: 11, name: 'Chapter 11', chapterNumber: 11 }],
          },
        },
      });
    const mutate = vi.fn(async () => ({
      data: {
        fetchChapterPages: {
          chapter: { id: 10, pageCount: 2 },
          pages: ['/page/0', '/page/1'],
        },
      },
    }));    const client = { query, mutate } as unknown as ApolloClient;
    const repository = createReaderRepository({ getClient: () => client });

    await expect(repository.getChapter(10)).resolves.toMatchObject({ id: 10 });
    await expect(repository.getNeighbors(1, 10)).resolves.toMatchObject({
      previous: { nodes: [{ id: 9 }] },
      next: { nodes: [{ id: 11 }] },
    });
    await expect(repository.getPages(10)).resolves.toEqual(['/page/0', '/page/1']);

    expect(mutate).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: { input: { chapterId: 10 } },
      }),
    );
  });

  it('fails on missing page payload instead of returning an empty chapter', async () => {
    const client = {
      mutate: vi.fn(async () => ({ data: { fetchChapterPages: null } })),
      query: vi.fn(),
    } as unknown as ApolloClient;
    const repository = createReaderRepository({ getClient: () => client });

    await expect(repository.getPages(10)).rejects.toThrow(
      'Halaman chapter tidak tersedia.',
    );
  });

  it('writes last page and read state through UpdateChapter', async () => {
    const mutate = vi.fn(async () => ({
      data: {
        updateChapter: {
          chapter: { id: 10, isRead: true, lastPageRead: 1 },
        },
      },
    }));
    const client = {
      mutate,
      query: vi.fn(),
    } as unknown as ApolloClient;
    const repository = createReaderRepository({ getClient: () => client });

    await repository.updateProgress(10, 1, true);

    expect(mutate).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: {
          input: {
            id: 10,
            patch: { lastPageRead: 1, isRead: true },
          },
        },
      }),
    );
  });
});
