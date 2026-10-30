// @vitest-environment jsdom

import type { ApolloClient } from '@apollo/client';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { App } from '../../app/App';
import type { ResourceService } from '../../core/resources/resourceService';
import {
  CategoryCatalogDocument,
  ChapterFeedDocument,
  DownloadQueueDocument,
  SourceCatalogDocument,
  type CategoryCatalogQuery,
  type ChapterFeedQuery,
  type SourceCatalogQuery,
} from '../../core/graphql/generated/graphql';
import { FakeConnectionCoordinator, makeConnectedState } from '../../test/fakeConnectionCoordinator';

vi.mock('../../app/pwaUpdate', () => ({
  usePwaUpdate: () => ({
    needRefresh: [false, vi.fn()],
    offlineReady: [false, vi.fn()],
    updateServiceWorker: vi.fn(),
  }),
}));

afterEach(() => {
  cleanup();
  window.history.replaceState({}, '', '/');
});

function resources(): ResourceService {
  return {
    loadImageResource: vi.fn(async () => ({
      blob: new Blob(),
      objectUrl: 'blob:feed-cover',
      contentType: 'image/png',
      dispose: vi.fn(),
    })),
    loadResource: vi.fn(),
    dispose: vi.fn(),
    isDisposed: () => false,
  } as unknown as ResourceService;
}

function chapterFeed(): ChapterFeedQuery {
  return {
    __typename: 'Query',
    chapters: {
      __typename: 'ChapterNodeList',
      totalCount: 12,
      nodes: [
        {
          __typename: 'ChapterType',
          id: 9,
          name: 'Chapter 9',
          chapterNumber: 9,
          pageCount: 18,
          isRead: false,
          isDownloaded: true,
          lastPageRead: 0,
          lastReadAt: '0',
          uploadDate: String(Date.now() - 3_600_000),
          manga: {
            __typename: 'MangaType',
            id: 1,
            title: 'Actual Manga',
            thumbnailUrl: '/api/v1/manga/1/thumbnail',
          },
        },
      ],
    },
  };
}

function renderPage(path: string, query: ReturnType<typeof vi.fn>) {
  const connected = makeConnectedState();
  const state = {
    ...connected,
    context: {
      ...connected.context,
      graphQL: { query } as unknown as ApolloClient,
      resources: resources(),
    },
  };
  window.history.replaceState({}, '', path);
  const coordinator = new FakeConnectionCoordinator(state);
  render(<App createCoordinator={() => coordinator} />);
  return { coordinator, state };
}

describe('parity pages', () => {
  it('renders the real chapter feed on Updates', async () => {
    const query = vi.fn(async ({ query: document }: { query: unknown }) => {
      if (document === ChapterFeedDocument) {
        return { data: chapterFeed() };
      }
      throw new Error('unexpected query');
    });
    renderPage('/updates', query);

    expect(await screen.findByRole('heading', { name: 'Updates' })).toBeTruthy();
    expect(await screen.findByText('Actual Manga')).toBeTruthy();
    expect(screen.getByText('Chapter 9')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Actual Manga, Chapter 9' }).getAttribute('href')).toBe(
      '/manga/1/chapter/9',
    );
  });

  it('renders sources returned by the server on Browse', async () => {
    const data: SourceCatalogQuery = {
      __typename: 'Query',
      sources: {
        __typename: 'SourceNodeList',
        totalCount: 1,
        nodes: [
          {
            __typename: 'SourceType',
            id: 'source-1',
            name: 'Source',
            displayName: 'Actual Source',
            lang: 'EN',
            isNsfw: false,
            contentWarning: 'SAFE',
            supportsLatest: true,
            iconUrl: '',
          },
        ],
      },
    };
    const query = vi.fn(async ({ query: document }: { query: unknown }) => {
      if (document === SourceCatalogDocument) {
        return { data };
      }
      throw new Error('unexpected query');
    });
    renderPage('/browse', query);

    expect(await screen.findByRole('heading', { name: 'Browse' })).toBeTruthy();
    expect(await screen.findByText('Actual Source')).toBeTruthy();
    expect(screen.getByText('1 sources')).toBeTruthy();
  });

  it('renders categories and their real manga counts', async () => {
    const data: CategoryCatalogQuery = {
      __typename: 'Query',
      categories: {
        __typename: 'CategoryNodeList',
        nodes: [
          {
            __typename: 'CategoryType',
            id: 1,
            name: 'Actual Category',
            default: false,
            isDefaultCategory: false,
            order: 1,
            mangas: { __typename: 'MangaNodeList', totalCount: 7 },
          },
        ],
      },
    };
    const query = vi.fn(async ({ query: document }: { query: unknown }) => {
      if (document === CategoryCatalogDocument) {
        return { data };
      }
      throw new Error('unexpected query');
    });
    renderPage('/categories', query);

    expect(await screen.findByRole('heading', { name: 'Categories' })).toBeTruthy();
    expect(await screen.findByText('Actual Category')).toBeTruthy();
    expect(screen.getByText('7 manga')).toBeTruthy();
  });

  it('renders real server information on Settings', async () => {
    const query = vi.fn(async () => ({ data: {} }));
    renderPage('/settings', query);

    expect(await screen.findByRole('heading', { name: 'Settings' })).toBeTruthy();
    expect(screen.getByText('v2.4.2366 · Stable')).toBeTruthy();
    expect(screen.getByText('https://server.example/suwayomi')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Disconnect server' })).toBeTruthy();
  });

  it('renders the real download queue and downloaded feed states', async () => {
    const query = vi.fn(async ({ query: document }: { query: unknown }) => {
      if (document === DownloadQueueDocument) {
        return {
          data: {
            downloadStatus: {
              state: 'STOPPED',
              queue: [],
            },
          },
        };
      }

      if (document === ChapterFeedDocument) {
        return {
          data: {
            chapters: {
              nodes: [],
              totalCount: 0,
            },
          },
        };
      }

      throw new Error('unexpected query');
    });
    renderPage('/downloads', query);

    expect(await screen.findByRole('heading', { name: 'Downloads' })).toBeTruthy();
    expect(await screen.findByText('The download queue is empty.')).toBeTruthy();
    expect(screen.getByText('No downloaded chapters on this server.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Resume downloads' })).toBeTruthy();
  });
});
