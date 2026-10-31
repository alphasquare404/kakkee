// @vitest-environment jsdom

import type { ApolloClient } from '@apollo/client';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { App } from '../../app/App';
import type { ResourceService } from '../../core/resources/resourceService';
import {
  LibraryCategoriesDocument,
  LibraryMangasDocument,
  type LibraryCategoriesQuery,
  type LibraryMangasQuery,
  type LibraryMangasQueryVariables,
} from '../../core/graphql/generated/graphql';
import type { LibraryManga, LibraryPage } from '../../core/library/libraryRepository';
import { clearSearchHistory } from '../../core/preferences/searchHistory';
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

afterEach(() => {
  cleanup();
  window.history.replaceState({}, '', '/');
  clearSearchHistory();
});

function manga(
  id: number,
  title: string,
  unreadCount = 0,
  downloadCount = 0,
  bookmarkCount = 0,
  tracked = false,
): LibraryManga {
  return {
    __typename: 'MangaType',
    id,
    title,
    thumbnailUrl: `/api/v1/manga/${id}/thumbnail`,
    thumbnailUrlLastFetched: null,
    unreadCount,
    downloadCount,
    bookmarkCount,
    trackRecords: {
      __typename: 'TrackRecordNodeList',
      totalCount: tracked ? 1 : 0,
    },
    lastReadChapter: null,
  };
}

function page(
  items: LibraryManga[],
  options: Partial<Pick<LibraryPage, 'totalCount'> & LibraryPage['pageInfo']> = {},
): LibraryMangasQuery['mangas'] {
  return {
    __typename: 'MangaNodeList',
    nodes: items,
    totalCount: options.totalCount ?? items.length,
    pageInfo: {
      __typename: 'PageInfo',
      endCursor: options.endCursor ?? (items.length > 0 ? `cursor-${items.at(-1)?.id}` : null),
      hasNextPage: options.hasNextPage ?? false,
    },
  };
}

function categoryData(): LibraryCategoriesQuery['categories'] {
  return {
    __typename: 'CategoryNodeList',
    nodes: [
      { __typename: 'CategoryType', id: 0, name: 'Default', order: 0, mangas: { __typename: 'MangaNodeList', totalCount: 0 } },
      { __typename: 'CategoryType', id: 3, name: 'Action', order: 3, mangas: { __typename: 'MangaNodeList', totalCount: 5 } },
    ],
  };
}

function data<T>(value: T): { data: T } {
  return { data: value };
}

function libraryQuery(
  mangas: LibraryMangasQuery['mangas'],
): { data: LibraryMangasQuery } {
  return data({ __typename: 'Query', mangas });
}

interface QueryOptions {
  query: unknown;
  variables?: LibraryMangasQueryVariables;
}

function queryClient(
  implementation: (options: QueryOptions) => Promise<{ data: unknown }>,
) {
  return vi.fn(implementation);
}

function renderLibrary(
  query: ReturnType<typeof queryClient>,
  path = '/library',
) {
  const connected = makeConnectedState();
  const resources = {
    loadImageResource: vi.fn(async () => ({
      blob: new Blob(),
      objectUrl: 'blob:library-thumbnail',
      contentType: 'image/png',
      dispose: vi.fn(),
    })),
    loadResource: vi.fn(),
    dispose: vi.fn(),
    isDisposed: () => false,
  } as unknown as ResourceService;
  const state = {
    ...connected,
    context: {
      ...connected.context,
      graphQL: { query } as unknown as ApolloClient,
      resources,
    },
  };
  window.history.replaceState({}, '', path);

  const coordinator = new FakeConnectionCoordinator(state);
  render(<App createCoordinator={() => coordinator} />);

  return { coordinator, state, resources };
}

function libraryRegion() {
  return screen.getByRole('region', { name: 'Manga library' });
}

async function openMenu(user: ReturnType<typeof userEvent.setup>, name: string) {
  await user.click(screen.getByRole('button', { name }));
}

async function openLibraryMore(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByLabelText('More library actions'));
}

describe('LibraryPage initial states', () => {
  it('shows a stable skeleton while the first page is loading', async () => {
    let resolveLibrary!: (value: { data: LibraryMangasQuery }) => void;
    const library = new Promise<{ data: LibraryMangasQuery }>((resolve) => {
      resolveLibrary = resolve;
    });
    const query = queryClient(async ({ query: document }) => {
      if (document === LibraryCategoriesDocument) {
        return data({ __typename: 'Query', categories: categoryData() });
      }

      return library;
    });

    renderLibrary(query);

    expect(libraryRegion().getAttribute('aria-busy')).toBe('true');
    expect(screen.getByText('Loadingâ€¦')).toBeTruthy();

    resolveLibrary(libraryQuery(page([manga(1, 'Alpha')])));

    expect(await screen.findByRole('heading', { name: 'Alpha' })).toBeTruthy();
    expect(screen.getByText('1 manga')).toBeTruthy();
  });

  it('renders a populated library and total count', async () => {
    const query = queryClient(async ({ query: document }) => {
      if (document === LibraryCategoriesDocument) {
        return data({ __typename: 'Query', categories: categoryData() });
      }

      return libraryQuery(page([manga(1, 'Alpha'), manga(2, 'Beta')], { totalCount: 2 }));
    });

    renderLibrary(query);

    expect(await screen.findByRole('heading', { name: 'Alpha' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Beta' })).toBeTruthy();
    expect(screen.getByText('2 manga')).toBeTruthy();
    expect(screen.queryByRole('link', { name: 'Connection' })).toBeNull();
    expect(
      screen.getByRole('link', { name: 'Alpha, manga details' }).getAttribute('href'),
    ).toBe('/manga/1');
    await waitFor(() => {
      expect(document.querySelectorAll('img.manga-card-image')).toHaveLength(2);
    });
  });

  it('keeps maintenance actions behind More while filters stay visible', async () => {
    const query = queryClient(async ({ query: document }) => {
      if (document === LibraryCategoriesDocument) {
        return data({ __typename: 'Query', categories: categoryData() });
      }

      return libraryQuery(page([manga(1, 'Alpha')]));
    });
    const user = userEvent.setup();
    renderLibrary(query);
    await screen.findByRole('heading', { name: 'Alpha' });

    expect(screen.getByRole('button', { name: 'Filter' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Sort' })).toBeTruthy();
    const more = screen.getByLabelText('More library actions');
    const menu = more.closest('details');
    expect(menu?.open).toBe(false);

    await user.click(more);
    expect(menu?.open).toBe(true);
    expect(screen.getByRole('button', { name: 'Select' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Save defaults' })).toBeTruthy();
  });

  it('enters selection mode and selects a manga card', async () => {
    const query = queryClient(async ({ query: document }) => {
      if (document === LibraryCategoriesDocument) {
        return data({ __typename: 'Query', categories: categoryData() });
      }

      return libraryQuery(page([manga(1, 'Alpha'), manga(2, 'Beta')]));
    });
    const user = userEvent.setup();
    renderLibrary(query);
    await screen.findByRole('heading', { name: 'Alpha' });

    await openLibraryMore(user);
    await user.click(screen.getByRole('button', { name: 'Select' }));
    await user.click(
      screen.getByRole('button', { name: 'Alpha, not selected' }),
    );

    expect(screen.getByText('1 selected')).toBeTruthy();
    expect(
      screen.getByRole('button', { name: 'Alpha, selected' }),
    ).toBeTruthy();
  });

  it('enters selection mode by long-pressing a poster', async () => {
    const query = queryClient(async ({ query: document }) => {
      if (document === LibraryCategoriesDocument) {
        return data({ __typename: 'Query', categories: categoryData() });
      }

      return libraryQuery(page([manga(1, 'Alpha')]));
    });
    renderLibrary(query);

    const card = await screen.findByRole('link', {
      name: 'Alpha, manga details',
    });

    await act(async () => {
      fireEvent.pointerDown(card, { pointerType: 'touch' });
      await new Promise((resolve) => window.setTimeout(resolve, 550));
      fireEvent.pointerUp(card, { pointerType: 'touch' });
    });

    expect(await screen.findByText('1 selected')).toBeTruthy();
    expect(
      screen.getByRole('button', { name: 'Alpha, selected' }),
    ).toBeTruthy();
  });

  it('shows continue-reading progress on a poster', async () => {
    const query = queryClient(async ({ query: document }) => {
      if (document === LibraryCategoriesDocument) {
        return data({ __typename: 'Query', categories: categoryData() });
      }

      return libraryQuery(
        page([
          {
            ...manga(1, 'Alpha'),
            lastReadChapter: {
              __typename: 'ChapterType',
              id: 10,
              name: 'Chapter 10',
              chapterNumber: 10,
              lastPageRead: 4,
              pageCount: 20,
            },
          },
        ]),
      );
    });
    renderLibrary(query);

    expect(
      await screen.findByText('Continue Ch. 10 · p5'),
    ).toBeTruthy();
    expect(
      screen.getByRole('link', { name: 'Alpha, manga details' }).getAttribute('title'),
    ).toBe('Continue reading Chapter 10 — page 5');
    expect(
      screen
        .getByRole('link', { name: 'Continue reading Chapter 10 — page 5' })
        .getAttribute('href'),
    ).toBe('/manga/1/chapter/10?page=5');
  });

  it('shows unread/download badges and category counts', async () => {
    const query = queryClient(async ({ query: document }) => {
      if (document === LibraryCategoriesDocument) {
        return data({ __typename: 'Query', categories: categoryData() });
      }

      return libraryQuery(page([manga(1, 'Alpha', 3, 2)]));
    });
    renderLibrary(query);

    expect(await screen.findByTitle('3 unread chapters')).toBeTruthy();
    expect(screen.getByTitle('2 downloaded chapters')).toBeTruthy();
    expect(
      screen.getByRole('button', { name: /Action/ }).textContent,
    ).toContain('5');
  });

  it('keeps refine controls collapsed so the grid leads the page', async () => {
    const query = queryClient(async ({ query: document }) => {
      if (document === LibraryCategoriesDocument) {
        return data({ __typename: 'Query', categories: categoryData() });
      }

      return libraryQuery(page([manga(1, 'Alpha')]));
    });

    renderLibrary(query);
    await screen.findByRole('heading', { name: 'Alpha' });

    expect(screen.queryAllByRole('menuitemradio')).toHaveLength(0);
    expect(screen.queryByRole('combobox')).toBeNull();
    expect(screen.getByRole('button', { name: 'Filter' }).getAttribute('aria-expanded')).toBe(
      'false',
    );
    expect(screen.getByRole('button', { name: 'Sort' }).getAttribute('aria-expanded')).toBe(
      'false',
    );
  });

  it('shows the completely empty library state', async () => {
    const query = queryClient(async ({ query: document }) => {
      if (document === LibraryCategoriesDocument) {
        return data({ __typename: 'Query', categories: categoryData() });
      }

      return libraryQuery(page([]));
    });

    renderLibrary(query);

    expect(await screen.findByRole('heading', { name: 'Your library is empty' })).toBeTruthy();
  });

  it('shows a no-result state for an active search', async () => {
    const query = queryClient(async ({ query: document, variables }) => {
      if (document === LibraryCategoriesDocument) {
        return data({ __typename: 'Query', categories: categoryData() });
      }

      if (variables?.filter?.title?.includesInsensitive) {
        return libraryQuery(page([]));
      }

      return libraryQuery(page([manga(1, 'Alpha')]));
    });
    const user = userEvent.setup();
    renderLibrary(query);

    expect(await screen.findByRole('heading', { name: 'Alpha' })).toBeTruthy();
    await user.type(screen.getByLabelText('Search library'), 'missing{Enter}');

    expect(await screen.findByRole('heading', { name: 'No manga found' })).toBeTruthy();
  });

  it('shows an initial error and retries without exposing the raw error', async () => {
    let attempts = 0;
    const query = queryClient(async ({ query: document }) => {
      if (document === LibraryCategoriesDocument) {
        return data({ __typename: 'Query', categories: categoryData() });
      }

      attempts += 1;

      if (attempts === 1) {
        throw new Error('internal stack and server details');
      }

      return libraryQuery(page([manga(1, 'Alpha')]));
    });
    const user = userEvent.setup();
    renderLibrary(query);

    expect(await screen.findByRole('heading', { name: "Couldn't load library" })).toBeTruthy();
    expect(screen.queryByText(/internal stack/)).toBeNull();

    await user.click(screen.getByRole('button', { name: 'Retry' }));

    expect(await screen.findByRole('heading', { name: 'Alpha' })).toBeTruthy();
  });
});

describe('LibraryPage categories', () => {
  it('renders All first and distinguishes backend Default ID 0 from All', async () => {
    const query = queryClient(async ({ query: document, variables }) => {
      if (document === LibraryCategoriesDocument) {
        return data({ __typename: 'Query', categories: categoryData() });
      }

      if (variables?.filter?.categoryId?.equalTo === 0) {
        return libraryQuery(page([manga(2, 'Default manga')]));
      }

      return libraryQuery(page([manga(1, 'Alpha'), manga(3, 'Gamma')]));
    });
    const user = userEvent.setup();
    renderLibrary(query);

    const all = await screen.findByRole('button', { name: 'All' });
    const def = await screen.findByRole('button', { name: 'Default' });
    const action = await screen.findByRole('button', { name: 'Action' });

    expect(all.getAttribute('aria-pressed')).toBe('true');
    expect(def.getAttribute('aria-pressed')).toBe('false');
    expect(action.getAttribute('aria-pressed')).toBe('false');

    await user.click(def);

    await waitFor(() =>
      expect(query).toHaveBeenCalledWith(
        expect.objectContaining({
          query: LibraryMangasDocument,
          variables: expect.objectContaining({
            filter: { categoryId: { equalTo: 0 } },
          }),
        }),
      ),
    );
    expect(await screen.findByRole('heading', { name: 'Default manga' })).toBeTruthy();
    expect(def.getAttribute('aria-pressed')).toBe('true');
    expect(all.getAttribute('aria-pressed')).toBe('false');
  });

  it('keeps the All navigation available when categories fail', async () => {
    const query = queryClient(async ({ query: document }) => {
      if (document === LibraryCategoriesDocument) {
        throw new Error('category failure');
      }

      return libraryQuery(page([manga(1, 'Alpha')]));
    });

    renderLibrary(query);

    expect(await screen.findByRole('heading', { name: 'Alpha' })).toBeTruthy();
    expect(screen.getByText(/Categories unavailable/)).toBeTruthy();
    expect(screen.getByRole('button', { name: 'All' })).toBeTruthy();
  });

  it('shows category loading independently from loaded manga', async () => {
    let resolveCategories!: (value: {
      data: { __typename: 'Query'; categories: LibraryCategoriesQuery['categories'] };
    }) => void;
    const categoryPromise = new Promise<{
      data: { __typename: 'Query'; categories: LibraryCategoriesQuery['categories'] };
    }>((resolve) => {
      resolveCategories = resolve;
    });
    const query = queryClient(async ({ query: document }) => {
      if (document === LibraryCategoriesDocument) {
        return categoryPromise;
      }

      return libraryQuery(page([manga(1, 'Alpha')]));
    });

    renderLibrary(query);

    expect(await screen.findByRole('heading', { name: 'Alpha' })).toBeTruthy();
    expect(screen.getByText('Loading categoriesâ€¦')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'All' })).toBeTruthy();

    resolveCategories(
      data({ __typename: 'Query', categories: categoryData() }),
    );

    expect(await screen.findByRole('button', { name: 'Action' })).toBeTruthy();
  });
});

describe('LibraryPage search, filter, and sort', () => {
  it('loads a server-side search from the URL', async () => {
    const query = queryClient(async ({ query: document }) => {
      if (document === LibraryCategoriesDocument) {
        return data({ __typename: 'Query', categories: categoryData() });
      }

      return libraryQuery(page([manga(1, 'Alpha')]));
    });
    renderLibrary(query, '/library?q=alpha');

    await waitFor(() =>
      expect(query).toHaveBeenCalledWith(
        expect.objectContaining({
          query: LibraryMangasDocument,
          variables: expect.objectContaining({
            filter: { title: { includesInsensitive: 'alpha' } },
          }),
        }),
      ),
    );
  });

  it('clears an active search back to the unfiltered library', async () => {
    const query = queryClient(async ({ query: document, variables }) => {
      if (document === LibraryCategoriesDocument) {
        return data({ __typename: 'Query', categories: categoryData() });
      }

      if (variables?.filter?.title?.includesInsensitive) {
        return libraryQuery(page([manga(1, 'Alpha')]));
      }

      return libraryQuery(page([manga(1, 'Alpha'), manga(2, 'Beta')]));
    });
    const user = userEvent.setup();
    renderLibrary(query);

    expect(await screen.findByRole('heading', { name: 'Alpha' })).toBeTruthy();
    await user.type(screen.getByLabelText('Search library'), 'alpha{Enter}');

    await user.click(await screen.findByRole('button', { name: 'Clear search' }));

    expect(await screen.findByRole('heading', { name: 'Beta' })).toBeTruthy();
    expect((screen.getByLabelText('Search library') as HTMLInputElement).value).toBe('');
  });

  it('opens and closes the compact search on request', async () => {
    const query = queryClient(async ({ query: document }) => {
      if (document === LibraryCategoriesDocument) {
        return data({ __typename: 'Query', categories: categoryData() });
      }

      return libraryQuery(page([manga(1, 'Alpha')]));
    });
    const user = userEvent.setup();
    renderLibrary(query);
    await screen.findByRole('heading', { name: 'Alpha' });

    const toggle = screen.getByRole('button', { name: 'Search' });
    expect(toggle.getAttribute('aria-expanded')).toBe('false');

    await user.click(toggle);
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(document.activeElement).toBe(screen.getByLabelText('Search library'));

    await user.keyboard('{Escape}');
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(toggle);
  });

  it('closes an active search field while keeping its query available to reopen', async () => {
    const query = queryClient(async ({ query: document }) => {
      if (document === LibraryCategoriesDocument) {
        return data({ __typename: 'Query', categories: categoryData() });
      }

      return libraryQuery(page([manga(1, 'Alpha')]));
    });
    const user = userEvent.setup();
    renderLibrary(query);
    await screen.findByRole('heading', { name: 'Alpha' });

    await user.click(screen.getByRole('button', { name: 'Search' }));
    await user.type(screen.getByLabelText('Search library'), 'alpha{Enter}');
    await waitFor(() =>
      expect(query).toHaveBeenCalledWith(
        expect.objectContaining({
          variables: expect.objectContaining({
            filter: { title: { includesInsensitive: 'alpha' } },
          }),
        }),
      ),
    );
    await user.click(screen.getByRole('button', { name: 'Close search' }));

    const closed = screen.getByRole('button', { name: 'Search, active' });
    expect(closed.getAttribute('aria-expanded')).toBe('false');
    expect((screen.getByLabelText('Search library') as HTMLInputElement).value).toBe(
      'alpha',
    );

    await user.click(closed);
    expect(screen.getByRole('button', { name: 'Close search' })).toBeTruthy();
  });

  it('resets search, category, and sort state', async () => {
    const query = queryClient(async ({ query: document }) => {
      if (document === LibraryCategoriesDocument) {
        return data({ __typename: 'Query', categories: categoryData() });
      }

      return libraryQuery(page([manga(1, 'Alpha')]));
    });
    const user = userEvent.setup();
    renderLibrary(query);
    await screen.findByRole('heading', { name: 'Alpha' });

    await user.type(screen.getByLabelText('Search library'), 'alpha{Enter}');
    await openLibraryMore(user);
    expect(await screen.findByRole('button', { name: 'Reset' })).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Reset' }));

    expect((screen.getByLabelText('Search library') as HTMLInputElement).value).toBe(
      '',
    );
    expect(screen.queryByRole('button', { name: 'Reset' })).toBeNull();
  });

  it('shuffles loaded cards with the random sort option', async () => {
    const query = queryClient(async ({ query: document }) => {
      if (document === LibraryCategoriesDocument) {
        return data({ __typename: 'Query', categories: categoryData() });
      }

      return libraryQuery(page([manga(1, 'Alpha'), manga(2, 'Beta')]));
    });
    const user = userEvent.setup();
    renderLibrary(query);
    await screen.findByRole('heading', { name: 'Alpha' });

    await openMenu(user, 'Sort');
    await user.click(screen.getByRole('menuitemradio', { name: 'Random' }));

    expect(screen.getByRole('button', { name: 'Sort, active' })).toBeTruthy();
    await openLibraryMore(user);
    expect(screen.getByRole('button', { name: 'Reset' })).toBeTruthy();
  });

  it('filters loaded titles with fuzzy search', async () => {
    const query = queryClient(async ({ query: document }) => {
      if (document === LibraryCategoriesDocument) {
        return data({ __typename: 'Query', categories: categoryData() });
      }

      return libraryQuery(page([manga(1, 'Alpha'), manga(2, 'Beta')]));
    });
    const user = userEvent.setup();
    renderLibrary(query);
    await screen.findByRole('heading', { name: 'Alpha' });

    await openLibraryMore(user);
    await user.click(screen.getByRole('button', { name: 'Fuzzy' }));
    await user.type(screen.getByLabelText('Search library'), 'alpa{Enter}');

    expect(screen.getByRole('heading', { name: 'Alpha' })).toBeTruthy();
    expect(screen.queryByRole('heading', { name: 'Beta' })).toBeNull();
    expect(window.location.search).toBe('?q=alpa&fuzzy=1');
  });

  it('restores the search query from the URL', async () => {
    const query = queryClient(async ({ query: document }) => {
      if (document === LibraryCategoriesDocument) {
        return data({ __typename: 'Query', categories: categoryData() });
      }

      return libraryQuery(page([manga(1, 'Alpha')]));
    });
    renderLibrary(query, '/library?q=Alpha');

    expect(await screen.findByRole('heading', { name: 'Alpha' })).toBeTruthy();
    expect(
      (screen.getByLabelText('Search library') as HTMLInputElement).value,
    ).toBe('Alpha');
  });

  it('shows recent searches as autocomplete suggestions', async () => {
    const query = queryClient(async ({ query: document }) => {
      if (document === LibraryCategoriesDocument) {
        return data({ __typename: 'Query', categories: categoryData() });
      }

      return libraryQuery(page([manga(1, 'Alpha')]));
    });
    const user = userEvent.setup();
    renderLibrary(query);
    await screen.findByRole('heading', { name: 'Alpha' });

    const input = screen.getByLabelText('Search library');
    await user.type(input, 'alpha{Enter}');
    await user.click(input);

    expect(await screen.findByRole('option', { name: 'alpha' })).toBeTruthy();
  });

  it('shows duplicate titles in the loaded library', async () => {
    const query = queryClient(async ({ query: document }) => {
      if (document === LibraryCategoriesDocument) {
        return data({ __typename: 'Query', categories: categoryData() });
      }

      return libraryQuery(
        page([manga(1, 'Alpha'), manga(2, 'Alpha'), manga(3, 'Beta')]),
      );
    });
    const user = userEvent.setup();
    renderLibrary(query);
    await screen.findAllByRole('heading', { name: 'Alpha' });

    await openLibraryMore(user);
    await user.click(screen.getByRole('button', { name: 'Duplicates (1)' }));

    expect(screen.getByRole('heading', { name: 'Possible duplicates' })).toBeTruthy();
    expect(screen.getByText('#1')).toBeTruthy();
    expect(screen.getByText('#2')).toBeTruthy();
  });

  it('combines loaded-title predicates as filters', async () => {
    const query = queryClient(async ({ query: document }) => {
      if (document === LibraryCategoriesDocument) {
        return data({ __typename: 'Query', categories: categoryData() });
      }

      return libraryQuery(
        page([manga(1, 'Alpha', 2, 0, 0, true), manga(2, 'Beta', 0, 1, 2)]),
      );
    });
    const user = userEvent.setup();
    renderLibrary(query);
    await screen.findByRole('heading', { name: 'Alpha' });
    await screen.findByRole('heading', { name: 'Beta' });

    await user.click(screen.getByRole('button', { name: 'Filter' }));
    await user.click(screen.getByRole('checkbox', { name: 'Unread' }));
    expect(screen.getByRole('heading', { name: 'Alpha' })).toBeTruthy();
    expect(screen.queryByRole('heading', { name: 'Beta' })).toBeNull();

    await user.click(screen.getByRole('checkbox', { name: 'Downloaded' }));
    expect(screen.queryByRole('heading', { name: 'Alpha' })).toBeNull();
    expect(screen.queryByRole('heading', { name: 'Beta' })).toBeNull();

    await user.click(screen.getByRole('checkbox', { name: 'Unread' }));
    expect(screen.getByRole('heading', { name: 'Beta' })).toBeTruthy();
    expect(screen.queryByRole('heading', { name: 'Alpha' })).toBeNull();

    await user.click(screen.getByRole('checkbox', { name: 'Tracked' }));
    expect(screen.queryByRole('heading', { name: 'Alpha' })).toBeNull();
    expect(screen.queryByRole('heading', { name: 'Beta' })).toBeNull();
  });

  it('changes the supported status filter and exposes the source filter', async () => {
    const query = queryClient(async ({ query: document }) => {
      if (document === LibraryCategoriesDocument) {
        return data({ __typename: 'Query', categories: categoryData() });
      }

      return libraryQuery(page([manga(1, 'Alpha')]));
    });
    const user = userEvent.setup();
    renderLibrary(query);

    await openMenu(user, 'Filter');
    expect(screen.getByRole('dialog', { name: 'Library filters' })).toBeTruthy();
    expect(screen.getByRole('group', { name: 'Source' })).toBeTruthy();
    await user.click(screen.getByRole('checkbox', { name: 'Ongoing' }));

    expect(screen.getByRole('button', { name: 'Filter, 1 active' })).toBeTruthy();
    expect(
      (screen.getByRole('checkbox', { name: 'Ongoing' }) as HTMLInputElement).checked,
    ).toBe(true);

    await waitFor(() =>
      expect(query).toHaveBeenCalledWith(
        expect.objectContaining({
          query: LibraryMangasDocument,
          variables: expect.objectContaining({
            filter: { status: { in: ['ONGOING'] } },
          }),
        }),
      ),
    );
  });

  it('combines multiple statuses with an OR filter', async () => {
    const query = queryClient(async ({ query: document }) => {
      if (document === LibraryCategoriesDocument) {
        return data({ __typename: 'Query', categories: categoryData() });
      }

      return libraryQuery(page([manga(1, 'Alpha')]));
    });
    const user = userEvent.setup();
    renderLibrary(query);

    await openMenu(user, 'Filter');
    await user.click(screen.getByRole('checkbox', { name: 'Ongoing' }));
    await user.click(screen.getByRole('checkbox', { name: 'Completed' }));

    await waitFor(() =>
      expect(query).toHaveBeenCalledWith(
        expect.objectContaining({
          query: LibraryMangasDocument,
          variables: expect.objectContaining({
            filter: { status: { in: ['ONGOING', 'COMPLETED'] } },
          }),
        }),
      ),
    );
  });

  it('closes the filter drawer on Escape and restores focus to its trigger', async () => {
    const query = queryClient(async ({ query: document }) => {
      if (document === LibraryCategoriesDocument) {
        return data({ __typename: 'Query', categories: categoryData() });
      }

      return libraryQuery(page([manga(1, 'Alpha')]));
    });
    const user = userEvent.setup();
    renderLibrary(query);
    await screen.findByRole('heading', { name: 'Alpha' });

    const filter = screen.getByRole('button', { name: 'Filter' });
    await user.click(filter);
    expect(screen.getByRole('dialog', { name: 'Library filters' })).toBeTruthy();
    expect(screen.getByRole('searchbox', { name: 'Source' })).toBeTruthy();

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(filter);
  });

  it('closes the filter drawer from Done', async () => {
    const query = queryClient(async ({ query: document }) => {
      if (document === LibraryCategoriesDocument) {
        return data({ __typename: 'Query', categories: categoryData() });
      }

      return libraryQuery(page([manga(1, 'Alpha')]));
    });
    const user = userEvent.setup();
    renderLibrary(query);
    await screen.findByRole('heading', { name: 'Alpha' });

    const filter = screen.getByRole('button', { name: 'Filter' });
    await user.click(filter);
    await user.click(screen.getByRole('button', { name: 'Done' }));

    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(filter);
  });

  it('maps sort fields and direction to stable GraphQL order', async () => {
    const query = queryClient(async ({ query: document }) => {
      if (document === LibraryCategoriesDocument) {
        return data({ __typename: 'Query', categories: categoryData() });
      }

      return libraryQuery(page([manga(1, 'Alpha')]));
    });
    const user = userEvent.setup();
    renderLibrary(query);

    await openMenu(user, 'Sort');
    await user.click(screen.getByRole('menuitemradio', { name: 'Title' }));

    await openMenu(user, 'Sort, active');
    await user.click(screen.getByRole('menuitemradio', { name: 'Ascending' }));

    expect(screen.getByRole('button', { name: 'Sort, active' })).toBeTruthy();
    await waitFor(() =>
      expect(query).toHaveBeenCalledWith(
        expect.objectContaining({
          query: LibraryMangasDocument,
          variables: expect.objectContaining({
            order: [{ by: 'TITLE', byType: 'ASC' }],
          }),
        }),
      ),
    );
  });
});

describe('LibraryPage pagination', () => {
  it('loads the next page and hides Load more at the end', async () => {
    let pageIndex = 0;
    const query = queryClient(async ({ query: document }) => {
      if (document === LibraryCategoriesDocument) {
        return data({ __typename: 'Query', categories: categoryData() });
      }

      pageIndex += 1;

      return libraryQuery(
        pageIndex === 1
          ? page([manga(1, 'Alpha')], {
              totalCount: 2,
              endCursor: 'next',
              hasNextPage: true,
            })
          : page([manga(2, 'Beta')], { totalCount: 2, hasNextPage: false }),
      );
    });
    const user = userEvent.setup();
    renderLibrary(query);

    expect(await screen.findByRole('heading', { name: 'Alpha' })).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Load more' }));

    expect(await screen.findByRole('heading', { name: 'Beta' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Load more' })).toBeNull();
  });

  it('disables duplicate load-more while loading and keeps existing cards', async () => {
    let pageIndex = 0;
    let resolveMore!: (value: { data: LibraryMangasQuery }) => void;
    const more = new Promise<{ data: LibraryMangasQuery }>((resolve) => {
      resolveMore = resolve;
    });
    const query = queryClient(async ({ query: document }) => {
      if (document === LibraryCategoriesDocument) {
        return data({ __typename: 'Query', categories: categoryData() });
      }

      pageIndex += 1;
      if (pageIndex === 1) {
        return libraryQuery(page([manga(1, 'Alpha')], { hasNextPage: true }));
      }

      return more;
    });
    const user = userEvent.setup();
    renderLibrary(query);

    await screen.findByRole('heading', { name: 'Alpha' });
    await user.click(screen.getByRole('button', { name: 'Load more' }));

    const loading = screen.getByRole('button', { name: 'Loadingâ€¦' });
    expect((loading as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByRole('heading', { name: 'Alpha' })).toBeTruthy();

    resolveMore(libraryQuery(page([manga(2, 'Beta')])));
    expect(await screen.findByRole('heading', { name: 'Beta' })).toBeTruthy();
  });

  it('keeps cards and shows a load-more error', async () => {
    let pageIndex = 0;
    const query = queryClient(async ({ query: document }) => {
      if (document === LibraryCategoriesDocument) {
        return data({ __typename: 'Query', categories: categoryData() });
      }

      pageIndex += 1;
      if (pageIndex === 1) {
        return libraryQuery(page([manga(1, 'Alpha')], { hasNextPage: true }));
      }

      throw new Error('load more failed');
    });
    const user = userEvent.setup();
    renderLibrary(query);

    await screen.findByRole('heading', { name: 'Alpha' });
    await user.click(screen.getByRole('button', { name: 'Load more' }));

    expect(await screen.findByText("Couldn't load more manga.")).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Alpha' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Load more' })).toBeTruthy();
  });

  it('does not show Load more when the initial page is the end', async () => {
    const query = queryClient(async ({ query: document }) => {
      if (document === LibraryCategoriesDocument) {
        return data({ __typename: 'Query', categories: categoryData() });
      }

      return libraryQuery(page([manga(1, 'Alpha')], { hasNextPage: false }));
    });

    renderLibrary(query);
    await screen.findByRole('heading', { name: 'Alpha' });

    expect(screen.queryByRole('button', { name: 'Load more' })).toBeNull();
  });
});
