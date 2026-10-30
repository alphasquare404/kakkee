import { describe, expect, it, vi } from 'vitest';
import type { ApolloClient } from '@apollo/client';
import {
  CategoryCatalogDocument,
  ChapterFeedDocument,
  SourceCatalogDocument,
} from '../graphql/generated/graphql';
import { createCatalogRepository } from './catalogRepository';

function client(query: ReturnType<typeof vi.fn>): ApolloClient {
  return { query } as unknown as ApolloClient;
}

describe('CatalogRepository', () => {
  it('requests the chapter feed with server-supported filters and ordering', async () => {
    const query = vi.fn(async () => ({
      data: {
        chapters: {
          nodes: [
            {
              id: 1,
              name: 'Chapter 1',
              chapterNumber: 1,
              pageCount: 10,
              isRead: false,
              isDownloaded: false,
              lastPageRead: 0,
              lastReadAt: '0',
              uploadDate: '1000',
              manga: { id: 2, title: 'Manga', thumbnailUrl: null },
            },
          ],
          totalCount: 1,
        },
      },
    }));
    const repository = createCatalogRepository({ getClient: () => client(query) });

    const page = await repository.getFeed({
      filter: { inLibrary: { equalTo: true } },
      order: [{ by: 'UPLOAD_DATE', byType: 'DESC' }],
    });

    expect(page.totalCount).toBe(1);
    expect(page.items[0]?.manga.title).toBe('Manga');
    expect(query).toHaveBeenCalledWith({
      query: ChapterFeedDocument,
      variables: {
        first: 40,
        filter: { inLibrary: { equalTo: true } },
        order: [{ by: 'UPLOAD_DATE', byType: 'DESC' }],
      },
      fetchPolicy: 'network-only',
    });
  });

  it('loads sources and categories through generated operations', async () => {
    const query = vi.fn(async ({ query: document }: { query: unknown }) => {
      if (document === SourceCatalogDocument) {
        return {
          data: {
            sources: {
              nodes: [
                {
                  id: '1',
                  name: 'source',
                  displayName: 'Source',
                  lang: 'EN',
                  isNsfw: false,
                  contentWarning: 'SAFE',
                  supportsLatest: true,
                  iconUrl: '',
                },
              ],
              totalCount: 1,
            },
          },
        };
      }

      if (document === CategoryCatalogDocument) {
        return {
          data: {
            categories: {
              nodes: [
                {
                  id: 2,
                  name: 'Category',
                  default: false,
                  isDefaultCategory: false,
                  order: 0,
                  mangas: { totalCount: 3 },
                },
              ],
            },
          },
        };
      }

      throw new Error('unexpected operation');
    });
    const repository = createCatalogRepository({ getClient: () => client(query) });

    await expect(repository.getSources()).resolves.toMatchObject({ totalCount: 1 });
    await expect(repository.getCategories()).resolves.toHaveLength(1);
  });

  it('rejects malformed responses instead of rendering empty data', async () => {
    const query = vi.fn(async () => ({ data: {} }));
    const repository = createCatalogRepository({ getClient: () => client(query) });

    await expect(
      repository.getFeed({ order: [{ by: 'UPLOAD_DATE', byType: 'DESC' }] }),
    ).rejects.toThrow('Server returned no chapter feed.');
  });
});
