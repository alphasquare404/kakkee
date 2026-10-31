// @vitest-environment jsdom

import type { ApolloClient } from '@apollo/client';
import { cleanup, configure, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { App } from '../../app/App';
import type { ResourceService } from '../../core/resources/resourceService';
import type { MangaDetailQuery } from '../../core/graphql/generated/graphql';
import { MangaDetailDocument } from '../../core/graphql/generated/graphql';
import { clearChapterViewPreferences } from '../../core/preferences/chapterViewPreferences';
import { createSectionOrigin } from '../../app/navigationOrigin';
import {
  FakeConnectionCoordinator,
  makeConnectedState,
} from '../../test/fakeConnectionCoordinator';

vi.mock('../../app/pwaUpdate', () => ({
  usePwaUpdate: () => ({
    needRefresh: [false, vi.fn()],
    offlineReady: [false, vi.fn()],
    updateServiceWorker: vi.fn(),
  }),
}));

configure({ asyncUtilTimeout: 5000 });

afterEach(() => {
  cleanup();
  clearChapterViewPreferences();
  window.localStorage.clear();
  window.history.replaceState({}, '', '/');
});

function chapter(id: number, name = `Chapter ${id}`) {
  return {
    __typename: 'ChapterType' as const,
    id,
    name,
    chapterNumber: id,
    pageCount: 17,
    isRead: false,
    isBookmarked: false,
    isDownloaded: false,
    lastPageRead: 0,
    scanlator: 'Scan',
    uploadDate: '1700000000000',
    sourceOrder: id,
  };
}

function detailData(overrides: Partial<MangaDetailQuery['chapters']> = {}): MangaDetailQuery {
  return {
    __typename: 'Query',
    manga: {
      __typename: 'MangaType',
      id: 1114,
      title: 'One Piece',
      author: 'ODA Eiichiro',
      artist: null,
      description: 'A pirate adventure.',
      status: 'ONGOING',
      thumbnailUrl: '/api/v1/manga/1114/thumbnail',
      thumbnailUrlLastFetched: '1',
      genre: ['Action', 'Adventure'],
      inLibrary: true,
      source: { __typename: 'SourceType', id: '1', name: 'Weeb Central' },
    },
    chapters: {
      __typename: 'ChapterNodeList',
      totalCount: 2,
      nodes: [chapter(1186)],
      pageInfo: {
        __typename: 'PageInfo',
        endCursor: 'cursor-1186',
        hasNextPage: true,
      },
      ...overrides,
    },
  };
}

function fakeResources(): ResourceService {
  return {
    loadImageResource: vi.fn(async (path: string) => ({
      blob: new Blob(),
      objectUrl: `blob:${path}`,
      contentType: 'image/png',
      dispose: vi.fn(),
    })),
    loadResource: vi.fn(),
    dispose: vi.fn(),
    isDisposed: () => false,
  } as unknown as ResourceService;
}

function renderDetail(
  query: ReturnType<typeof vi.fn>,
  locationState: unknown = {},
) {
  const connected = makeConnectedState();
  const state = {
    ...connected,
    context: {
      ...connected.context,
      graphQL: { query } as unknown as ApolloClient,
      resources: fakeResources(),
    },
  };
  window.history.replaceState({ usr: locationState }, '', '/manga/1114');
  const coordinator = new FakeConnectionCoordinator(state);
  render(<App createCoordinator={() => coordinator} />);
}

describe('MangaDetailPage', () => {
  it('renders manga metadata, chapters, and a link to the reader', async () => {
    const query = vi.fn(async () => ({ data: detailData() }));
    renderDetail(query);

    expect(await screen.findByRole('heading', { name: 'One Piece' })).toBeTruthy();
    expect(screen.getByText('A pirate adventure.')).toBeTruthy();
    expect(screen.getByText(/Weeb Central/)).toBeTruthy();
    expect(screen.getByRole('link', { name: /Chapter 1186/ }).getAttribute('href')).toBe(
      '/manga/1114/chapter/1186',
    );
    expect(
      screen
        .getByRole('button', { name: 'Read Chapter 1186' })
        .getAttribute('aria-pressed'),
    ).toBe('false');
    expect(screen.getByRole('link', { name: 'Back to library' }).getAttribute('href')).toBe(
      '/library',
    );
  });

  it('returns to the originating page when opened from Updates', async () => {
    const query = vi.fn(async () => ({ data: detailData() }));
    renderDetail(query, {
      origin: createSectionOrigin('updates', {
        pathname: '/updates',
      }),
    });

    expect(await screen.findByRole('heading', { name: 'One Piece' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Back' }).getAttribute('href')).toBe(
      '/updates',
    );
  });

  it('does not fabricate a Library breadcrumb for a direct manga URL', async () => {
    const base = detailData();
    const query = vi.fn(async () => ({
      data: { ...base, manga: { ...base.manga, inLibrary: false } },
    }));
    renderDetail(query);

    await screen.findByRole('heading', { name: 'One Piece' });

    const breadcrumb = screen.getByRole('navigation', { name: 'Breadcrumb' });
    expect(within(breadcrumb).queryByRole('link', { name: 'Library' })).toBeNull();
    expect(within(breadcrumb).getByText('One Piece')).toBeTruthy();
  });

  it('shows Library provenance when actually opened from Library', async () => {
    const query = vi.fn(async () => ({ data: detailData() }));
    renderDetail(query, {
      origin: createSectionOrigin('library', {
        pathname: '/library',
        search: '?q=one',
      }),
    });

    await screen.findByRole('heading', { name: 'One Piece' });

    const breadcrumb = screen.getByRole('navigation', { name: 'Breadcrumb' });
    expect(within(breadcrumb).getByRole('link', { name: 'Library' }).getAttribute('href')).toBe(
      '/library?q=one',
    );
    expect(screen.getByRole('link', { name: 'Back to library' }).getAttribute('href')).toBe(
      '/library?q=one',
    );
  });

  it('uses Browse and source provenance instead of Library', async () => {
    const query = vi.fn(async () => ({ data: detailData() }));
    renderDetail(query, {
      origin: createSectionOrigin('browse', {
        pathname: '/browse/7',
        search: '?q=art',
        trail: [
          { pathname: '/browse', labelKey: 'Browse' },
          { pathname: '/browse/7', search: '?q=art', label: 'MangaDex' },
        ],
      }),
    });

    await screen.findByRole('heading', { name: 'One Piece' });

    const breadcrumb = screen.getByRole('navigation', { name: 'Breadcrumb' });
    expect(within(breadcrumb).getByRole('link', { name: 'Browse' }).getAttribute('href')).toBe(
      '/browse',
    );
    expect(within(breadcrumb).getByRole('link', { name: 'MangaDex' }).getAttribute('href')).toBe(
      '/browse/7?q=art',
    );
    expect(within(breadcrumb).queryByRole('link', { name: 'Library' })).toBeNull();
    expect(screen.getByRole('link', { name: 'Back' }).getAttribute('href')).toBe(
      '/browse/7?q=art',
    );
  });

  it('uses Search provenance instead of Library', async () => {
    const query = vi.fn(async () => ({ data: detailData() }));
    renderDetail(query, {
      origin: createSectionOrigin('search', {
        pathname: '/search',
        search: '?q=one+piece',
      }),
    });

    await screen.findByRole('heading', { name: 'One Piece' });

    const breadcrumb = screen.getByRole('navigation', { name: 'Breadcrumb' });
    expect(within(breadcrumb).getByRole('link', { name: 'Search' }).getAttribute('href')).toBe(
      '/search?q=one+piece',
    );
    expect(within(breadcrumb).queryByRole('link', { name: 'Library' })).toBeNull();
    expect(screen.getByRole('link', { name: 'Back' }).getAttribute('href')).toBe(
      '/search?q=one+piece',
    );
  });

  it('changes chapter order and requests the stable GraphQL order', async () => {
    const query = vi.fn(async () => ({ data: detailData() }));
    const user = userEvent.setup();
    renderDetail(query);
    await screen.findByRole('heading', { name: 'One Piece' });

    await user.selectOptions(screen.getByLabelText('Chapter order'), 'oldest');

    await waitFor(() =>
      expect(query).toHaveBeenCalledWith(
        expect.objectContaining({
          variables: expect.objectContaining({
            order: [{ by: 'SOURCE_ORDER', byType: 'ASC' }],
          }),
        }),
      ),
    );
  });

  it('shows a separator for missing chapter numbers', async () => {
    const query = vi.fn(async () => ({
      data: detailData({ nodes: [chapter(1186), chapter(1184)] }),
    }));
    renderDetail(query);

    expect(
      await screen.findByText('1 missing chapter between 1184 and 1186'),
    ).toBeTruthy();
  });

  it('filters chapters by state and scanlator', async () => {
    const query = vi.fn(async () => ({
      data: detailData({
        nodes: [
          chapter(1186),
          { ...chapter(1185), isRead: true, scanlator: 'Other' },
        ],
      }),
    }));
    const user = userEvent.setup();
    renderDetail(query);
    await screen.findByRole('link', { name: /Chapter 1186/ });

    await user.selectOptions(screen.getByLabelText('Filter chapters'), 'read');
    expect(screen.queryByRole('link', { name: /Chapter 1186/ })).toBeNull();
    expect(screen.getByRole('link', { name: /Chapter 1185/ })).toBeTruthy();

    fireEvent.click(screen.getByLabelText('More chapter actions'));
    await user.selectOptions(
      screen.getByLabelText('Filter by scanlator'),
      'Other',
    );
    expect(screen.getByRole('link', { name: /Chapter 1185/ })).toBeTruthy();
    expect(screen.queryByRole('link', { name: /Chapter 1186/ })).toBeNull();
  });

  it('switches between chapters and overview content', async () => {
    const query = vi.fn(async () => ({ data: detailData() }));
    const user = userEvent.setup();
    renderDetail(query);
    await screen.findByRole('link', { name: /Chapter 1186/ });

    expect(
      screen.getByRole('button', { name: 'Chapters' }).getAttribute('aria-current'),
    ).toBe('true');

    await user.click(screen.getByRole('button', { name: 'Overview' }));
    expect(screen.queryByRole('link', { name: /Chapter 1186/ })).toBeNull();

    await user.click(screen.getByRole('button', { name: 'Chapters' }));
    expect(await screen.findByRole('link', { name: /Chapter 1186/ })).toBeTruthy();
  });

  it('selects chapters for bulk actions', async () => {
    const query = vi.fn(async () => ({
      data: detailData({ nodes: [chapter(1186), chapter(1185)] }),
    }));
    const user = userEvent.setup();
    renderDetail(query);
    await screen.findByRole('link', { name: /Chapter 1186/ });

    await user.click(screen.getByRole('button', { name: 'Select' }));
    await user.click(screen.getByRole('button', { name: 'Select Chapter 1186' }));
    fireEvent.click(
      screen.getByRole('button', { name: 'Select Chapter 1185' }),
      { shiftKey: true },
    );

    expect(screen.getByText('2 selected')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Delete download' }));
    expect(
      screen.getByRole('button', { name: 'Confirm delete' }),
    ).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeTruthy();
  });

  it('loads more chapters without discarding the first page', async () => {    let call = 0;
    const query = vi.fn(async () => {
      call += 1;
      return {
        data:
          call === 1
            ? detailData()
            : detailData({
                nodes: [chapter(1185)],
                pageInfo: {
                  __typename: 'PageInfo',
                  endCursor: null,
                  hasNextPage: false,
                },
              }),
      };
    });
    const user = userEvent.setup();
    renderDetail(query);

    await screen.findByRole('link', { name: /Chapter 1186/ });
    await user.click(screen.getByRole('button', { name: 'Load more chapters' }));

    expect(await screen.findByRole('link', { name: /Chapter 1185/ })).toBeTruthy();
    expect(screen.getByRole('link', { name: /Chapter 1186/ })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Load more chapters' })).toBeNull();
  });

  it('shows a retryable error without raw error details', async () => {
    let detailAttempts = 0;
    const query = vi.fn(({ query: document }: { query: unknown }) => {
      if (document === MangaDetailDocument) {
        detailAttempts += 1;

        if (detailAttempts === 1) {
          return Promise.reject(new Error('internal stack details'));
        }
      }

      return Promise.resolve({ data: detailData() });
    });
    const user = userEvent.setup();
    renderDetail(query);

    expect(await screen.findByRole('heading', { name: "Couldn't load manga" })).toBeTruthy();
    expect(screen.queryByText(/internal stack/)).toBeNull();

    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(await screen.findByRole('heading', { name: 'One Piece' })).toBeTruthy();
  });
});
