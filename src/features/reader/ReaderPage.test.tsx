// @vitest-environment jsdom

import type { ApolloClient } from '@apollo/client';
import { cleanup, configure, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from '../../app/App';
import {
  FetchChapterPagesDocument,
  ReaderChapterDocument,
  ReaderChapterListDocument,
  ReaderNeighborsDocument,
  UpdateChapterProgressDocument,
} from '../../core/graphql/generated/graphql';
import type { ResourceService } from '../../core/resources/resourceService';
import {
  resetReaderSettings,
  updateReaderSettings,
} from '../../core/preferences/readerSettings';
import {
  FakeConnectionCoordinator,
  makeConnectedState,
} from '../../test/fakeConnectionCoordinator';
import { createSectionOrigin } from '../../app/navigationOrigin';

vi.mock('../../app/pwaUpdate', () => ({
  usePwaUpdate: () => ({
    needRefresh: [false, vi.fn()],
    offlineReady: [false, vi.fn()],
    updateServiceWorker: vi.fn(),
  }),
}));

configure({ asyncUtilTimeout: 5000 });

beforeEach(() => {
  window.scrollTo = vi.fn();
  Element.prototype.scrollIntoView = vi.fn();
  window.localStorage.clear();
  resetReaderSettings();
});

afterEach(() => {
  cleanup();
  window.history.replaceState({}, '', '/');
  resetReaderSettings();
});

function chapter(id: number, lastPageRead = 0) {
  return {
    __typename: 'ChapterType' as const,
    id,
    name: `Chapter ${id}`,
    pageCount: 2,
    chapterNumber: id,
    sourceOrder: id,
    isRead: false,
    lastPageRead,
    manga: {
      __typename: 'MangaType' as const,
      id: 1,
      title: 'One Piece',
      thumbnailUrl: '/api/v1/manga/1/thumbnail',
    },
  };
}

function fakeResources(failFirst = false) {
  const handles = [
    {
      blob: new Blob(),
      objectUrl: 'blob:page-0',
      contentType: 'image/jpeg',
      dispose: vi.fn(),
    },
    {
      blob: new Blob(),
      objectUrl: 'blob:page-1',
      contentType: 'image/jpeg',
      dispose: vi.fn(),
    },
  ];
  const loadImageResource = vi.fn(async (_path: string) => {
    void _path;
    const index = loadImageResource.mock.calls.length - 1;
    if (failFirst && index === 0) {
      throw new Error('page failed');
    }
    return handles[index] ?? handles[0];
  });
  const resources = {
    loadImageResource,
    loadResource: vi.fn(),
    dispose: vi.fn(),
    isDisposed: () => false,
  } as unknown as ResourceService;

  return { resources, handles, loadImageResource };
}

function renderReader(
  failFirstImage = false,
  page?: number,
  progress = 0,
  historyState?: unknown,
) {
  const { resources, handles, loadImageResource } = fakeResources(failFirstImage);
  const query = vi.fn(async ({ query: document }: { query: unknown }) => {
    if (document === ReaderChapterDocument) {
      return { data: { chapter: chapter(10, progress) } };
    }

    if (document === ReaderNeighborsDocument) {
      return {
        data: {
          previous: {
            nodes: [{ __typename: 'ChapterType', id: 9, name: 'Chapter 9', chapterNumber: 9 }],
          },
          next: {
            nodes: [{ __typename: 'ChapterType', id: 11, name: 'Chapter 11', chapterNumber: 11 }],
          },
        },
      };
    }

    if (document === ReaderChapterListDocument) {
      return {
        data: {
          chapters: {
            nodes: [
              { __typename: 'ChapterType', id: 11, name: 'Chapter 11', chapterNumber: 11, isRead: false },
              { __typename: 'ChapterType', id: 10, name: 'Chapter 10', chapterNumber: 10, isRead: false },
              { __typename: 'ChapterType', id: 9, name: 'Chapter 9', chapterNumber: 9, isRead: true },
              { __typename: 'ChapterType', id: 12, name: 'Chapter 9', chapterNumber: 9, isRead: false },
            ],
          },
        },
      };
    }

    throw new Error('unexpected query');
  });
  const mutate = vi.fn(async ({ mutation }: { mutation: unknown }) => {
    if (mutation === UpdateChapterProgressDocument) {
      return {
        data: {
          updateChapter: {
            __typename: 'UpdateChapterPayload',
            chapter: {
              __typename: 'ChapterType',
              id: 10,
              isRead: false,
              lastPageRead: 0,
            },
          },
        },
      };
    }

    if (mutation !== FetchChapterPagesDocument) {
      throw new Error('unexpected mutation');
    }

    return {
      data: {
        fetchChapterPages: {
          __typename: 'FetchChapterPagesPayload',
          chapter: { __typename: 'ChapterType', id: 10, pageCount: 2 },
          pages: ['/page/0', '/page/1'],
        },
      },
    };
  });
  const connected = makeConnectedState();
  const state = {
    ...connected,
    context: {
      ...connected.context,
      graphQL: { query, mutate } as unknown as ApolloClient,
      resources,
    },
  };
  window.history.replaceState(
    historyState === undefined ? {} : { usr: historyState },
    '',
    `/manga/1/chapter/10${page ? `?page=${page}` : ''}`,
  );
  const coordinator = new FakeConnectionCoordinator(state);
  render(<App createCoordinator={() => coordinator} />);

  return { handles, loadImageResource };
}

describe('ReaderPage', () => {
  it('keeps reader settings in the overflow instead of the header', async () => {
    renderReader();
    expect(await screen.findByRole('heading', { name: 'Chapter 10' })).toBeTruthy();

    const menu = screen.getByLabelText('Reader actions').closest('details');
    expect(menu?.open).toBe(false);
    fireEvent.click(screen.getByLabelText('Reader actions'));

    expect(
      screen.getByRole('link', { name: 'Reader settings' }).getAttribute('href'),
    ).toBe('/settings/reader');
  });

  it('shows the origin context in the back control', async () => {
    renderReader(false, undefined, 0, {
      origin: createSectionOrigin('history', {
        pathname: '/history',
      }),
    });

    expect(await screen.findByRole('heading', { name: 'Chapter 10' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'History' }).getAttribute('href')).toBe(
      '/history',
    );
  });

  it('returns to manga when entered from Manga Detail', async () => {
    renderReader(false, undefined, 0, {
      origin: createSectionOrigin('search', {
        pathname: '/search',
        search: '?q=one',
      }),
      fromManga: true,
    });

    expect(await screen.findByRole('heading', { name: 'Chapter 10' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Manga' }).getAttribute('href')).toBe(
      '/manga/1',
    );
  });
  it('renders chapter pages and chapter navigation', async () => {
    const { loadImageResource } = renderReader();

    expect(await screen.findByRole('heading', { name: 'Chapter 10' })).toBeTruthy();
    expect(await screen.findByRole('img', { name: 'Page 1' })).toBeTruthy();
    expect(screen.getByRole('img', { name: 'Page 2' })).toBeTruthy();
    expect(screen.getByRole('link', { name: /Next: Chapter 11/ }).getAttribute('href')).toBe(
      '/manga/1/chapter/11',
    );
    expect(screen.getByRole('link', { name: /Previous: Chapter 9/ }).getAttribute('href')).toBe(
      '/manga/1/chapter/9',
    );
    expect(loadImageResource).toHaveBeenCalledWith(
      '/page/0',
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });

  it('shows a page-level retry action without losing the chapter', async () => {
    renderReader(true);

    expect(await screen.findByText("Page 1 couldn't be loaded.")).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Chapter 10' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Retry page' })).toBeTruthy();
  });

  it('keeps the chapter available when page loading fails', async () => {
    const { resources } = fakeResources();
    resources.loadImageResource = vi
      .fn()
      .mockRejectedValue(new Error('all pages failed'));
    const query = vi.fn(async ({ query: document }: { query: unknown }) => {
      if (document === ReaderChapterDocument) {
        return { data: { chapter: chapter(10) } };
      }
      return {
        data: {
          previous: { nodes: [] },
          next: { nodes: [] },
        },
      };
    });
    const mutate = vi.fn(async () => {
      throw new Error('pages failed');
    });
    const connected = makeConnectedState();
    const state = {
      ...connected,
      context: {
        ...connected.context,
        graphQL: { query, mutate } as unknown as ApolloClient,
        resources,
      },
    };
    window.history.replaceState({}, '', '/manga/1/chapter/10');
    render(<App createCoordinator={() => new FakeConnectionCoordinator(state)} />);

    expect(await screen.findByRole('heading', { name: 'Chapter 10' })).toBeTruthy();
    expect(await screen.findByRole('heading', { name: "Couldn't load pages" })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Retry pages' })).toBeTruthy();
  });

  it('opens the chapter list overlay', async () => {
    renderReader();
    await screen.findByRole('heading', { name: 'Chapter 10' });

    fireEvent.click(screen.getByRole('button', { name: 'Chapters' }));

    const dialog = screen.getByRole('dialog', { name: 'Chapter list' });
    expect(dialog).toBeTruthy();
    expect(
      within(dialog).getAllByRole('link', { name: /Chapter 9/ }),
    ).toHaveLength(2);
    expect(within(dialog).getByRole('link', { name: /Chapter 11/ })).toBeTruthy();
  });

  it('skips duplicate chapter numbers in the chapter list when enabled', async () => {
    updateReaderSettings({ skipDuplicates: true });
    renderReader();
    await screen.findByRole('heading', { name: 'Chapter 10' });

    fireEvent.click(screen.getByRole('button', { name: 'Chapters' }));

    const dialog = screen.getByRole('dialog', { name: 'Chapter list' });
    expect(within(dialog).getAllByRole('link')).toHaveLength(3);
    expect(
      within(dialog).getAllByRole('link', { name: /Chapter 9/ }),
    ).toHaveLength(1);
  });

  it('resumes at the requested page', async () => {
    renderReader(false, 2);

    expect(await screen.findByText('2 / 2')).toBeTruthy();
    await waitFor(() =>
      expect(Element.prototype.scrollIntoView).toHaveBeenCalled(),
    );
  });

  it('resumes from stored progress when no page query is present', async () => {
    renderReader(false, undefined, 1);

    expect(await screen.findByText('2 / 2')).toBeTruthy();
    await waitFor(() =>
      expect(Element.prototype.scrollIntoView).toHaveBeenCalled(),
    );
  });

  it('renders a single-page mode with page controls', async () => {
    updateReaderSettings({ mode: 'single' });
    renderReader();

    expect(await screen.findByText('Page 1 of 2')).toBeTruthy();
    expect(screen.getAllByRole('img', { name: /Page/ })).toHaveLength(1);
    expect(
      screen.getByRole('button', { name: 'Next page' }),
    ).toBeTruthy();
    fireEvent.click(screen.getByLabelText('Reader actions'));
    expect(
      screen.getByRole('button', { name: 'Auto-scroll' }),
    ).toBeTruthy();

    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(await screen.findByText('Page 2 of 2')).toBeTruthy();
  });
});
