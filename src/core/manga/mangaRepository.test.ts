import type { ApolloClient } from '@apollo/client';
import { describe, expect, it, vi } from 'vitest';
import {
  DeleteDownloadedChapterDocument,
  DeleteDownloadedChaptersDocument,
  EnqueueChapterDownloadsDocument,
  EnqueueDownloadDocument,
  RefreshMangaDocument,
  UpdateChaptersStateDocument,
  type MangaDetailQuery,
} from '../graphql/generated/graphql';
import { createMangaRepository } from './mangaRepository';

function detailData(): MangaDetailQuery {
  return {
    __typename: 'Query',
    manga: {
      __typename: 'MangaType',
      id: 1114,
      title: 'One Piece',
      author: 'ODA Eiichiro',
      artist: null,
      description: 'Description',
      status: 'ONGOING',
      thumbnailUrl: '/api/v1/manga/1114/thumbnail',
      thumbnailUrlLastFetched: '1',
      genre: ['Action'],
      inLibrary: true,
      source: { __typename: 'SourceType', id: '1', name: 'Source' },
    },
    chapters: {
      __typename: 'ChapterNodeList',
      totalCount: 2,
      nodes: [
        {
          __typename: 'ChapterType',
          id: 2,
          name: 'Chapter 2',
          chapterNumber: 2,
          pageCount: 10,
          isRead: false,
          isBookmarked: false,
          isDownloaded: false,
          lastPageRead: 0,
          scanlator: null,
          uploadDate: '1',
          sourceOrder: 2,
        },
      ],
      pageInfo: {
        __typename: 'PageInfo',
        endCursor: 'cursor-2',
        hasNextPage: true,
      },
    },
  };
}

function setup() {
  const query = vi.fn(async () => ({ data: detailData() }));
  const client = { query } as unknown as ApolloClient;
  return { client, query };
}

describe('createMangaRepository', () => {
  it('maps detail and chapter page variables', async () => {
    const { client, query } = setup();
    const repository = createMangaRepository({ getClient: () => client });

    const page = await repository.getDetail({ mangaId: 1114, order: 'oldest' });

    expect(query).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: {
          mangaId: 1114,
          first: 50,
          after: undefined,
          order: [{ by: 'SOURCE_ORDER', byType: 'ASC' }],
        },
        fetchPolicy: 'network-only',
      }),
    );
    expect(page.manga.title).toBe('One Piece');
    expect(page.chapters[0].id).toBe(2);
    expect(page.pageInfo.endCursor).toBe('cursor-2');
  });

  it('passes the cursor for pagination', async () => {
    const { client, query } = setup();
    const repository = createMangaRepository({ getClient: () => client });

    await repository.getDetail({ mangaId: 1114, after: 'cursor-2' });

    expect(query).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: expect.objectContaining({ after: 'cursor-2' }),
      }),
    );
  });

  it('fails rather than inventing missing detail data', async () => {
    const query = vi.fn(async () => ({ data: undefined }));
    const client = { query } as unknown as ApolloClient;
    const repository = createMangaRepository({ getClient: () => client });

    await expect(repository.getDetail({ mangaId: 1 })).rejects.toThrow(
      'Respons manga tidak lengkap.',
    );
  });

  it('writes read state through UpdateChapter', async () => {
    const mutate = vi.fn(async () => ({
      data: {
        updateChapter: {
          chapter: { id: 2, isRead: true, lastPageRead: 0 },
        },
      },
    }));
    const client = { mutate, query: vi.fn() } as unknown as ApolloClient;
    const repository = createMangaRepository({ getClient: () => client });

    await repository.setChapterRead(2, true);

    expect(mutate).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: { input: { id: 2, patch: { isRead: true } } },
      }),
    );
  });

  it('writes the library flag through UpdateManga', async () => {
    const mutate = vi.fn(async () => ({
      data: { updateManga: { manga: { id: 1114, inLibrary: false } } },
    }));
    const client = { mutate, query: vi.fn() } as unknown as ApolloClient;
    const repository = createMangaRepository({ getClient: () => client });

    await repository.setInLibrary(1114, false);

    expect(mutate).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: { input: { id: 1114, patch: { inLibrary: false } } },
      }),
    );
  });

  it('queues and deletes chapter downloads', async () => {
    const mutate = vi.fn(async ({ mutation }: { mutation: unknown }) => {
      if (mutation === EnqueueDownloadDocument) {
        return { data: { enqueueChapterDownload: { downloadStatus: {} } } };
      }
      if (mutation === DeleteDownloadedChapterDocument) {
        return { data: { deleteDownloadedChapter: { chapters: [] } } };
      }
      throw new Error('unexpected mutation');
    });
    const client = { mutate, query: vi.fn() } as unknown as ApolloClient;
    const repository = createMangaRepository({ getClient: () => client });

    await repository.enqueueDownload(2);
    await repository.deleteDownload(2);

    expect(mutate).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        mutation: EnqueueDownloadDocument,
        variables: { input: { id: 2 } },
      }),
    );
    expect(mutate).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        mutation: DeleteDownloadedChapterDocument,
        variables: { input: { id: 2 } },
      }),
    );
  });

  it('refreshes manga metadata and chapters', async () => {
    const mutate = vi.fn(async () => ({
      data: {
        fetchMangaAndChapters: {
          manga: { id: 1, title: 'Alpha', thumbnailUrl: null },
          chapters: [],
        },
      },
    }));
    const client = { query: vi.fn(), mutate } as unknown as ApolloClient;
    const repository = createMangaRepository({ getClient: () => client });

    await repository.refresh(1);

    expect(mutate).toHaveBeenCalledWith({
      mutation: RefreshMangaDocument,
      variables: {
        input: { id: 1, fetchManga: true, fetchChapters: true },
      },
    });
  });

  it('writes bulk chapter patches through UpdateChapters', async () => {
    const mutate = vi.fn(async () => ({
      data: { updateChapters: { chapters: [] } },
    }));
    const client = { mutate, query: vi.fn() } as unknown as ApolloClient;
    const repository = createMangaRepository({ getClient: () => client });

    await repository.setChaptersRead([2, 3], true);
    await repository.setChaptersBookmark([2], true);

    expect(mutate).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        mutation: UpdateChaptersStateDocument,
        variables: { input: { ids: [2, 3], patch: { isRead: true } } },
      }),
    );
    expect(mutate).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        mutation: UpdateChaptersStateDocument,
        variables: { input: { ids: [2], patch: { isBookmarked: true } } },
      }),
    );
  });

  it('queues and deletes chapter downloads in bulk', async () => {
    const mutate = vi.fn(async ({ mutation }: { mutation: unknown }) => {
      if (mutation === EnqueueChapterDownloadsDocument) {
        return { data: { enqueueChapterDownloads: { downloadStatus: {} } } };
      }
      if (mutation === DeleteDownloadedChaptersDocument) {
        return { data: { deleteDownloadedChapters: { chapters: [] } } };
      }
      throw new Error('unexpected mutation');
    });
    const client = { mutate, query: vi.fn() } as unknown as ApolloClient;
    const repository = createMangaRepository({ getClient: () => client });

    await repository.enqueueDownloads([2, 3]);
    await repository.deleteDownloads([2, 3]);

    expect(mutate).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        mutation: EnqueueChapterDownloadsDocument,
        variables: { input: { ids: [2, 3] } },
      }),
    );
    expect(mutate).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        mutation: DeleteDownloadedChaptersDocument,
        variables: { input: { ids: [2, 3] } },
      }),
    );
  });
});
