// @vitest-environment jsdom

import type { ApolloClient } from '@apollo/client';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
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
});

function manga(id: number, title: string): LibraryManga {
  return {
    __typename: 'MangaType',
    id,
    title,
    thumbnailUrl: `/api/v1/manga/${id}/thumbnail`,
    thumbnailUrlLastFetched: null,
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
      { __typename: 'CategoryType', id: 0, name: 'Default', order: 0 },
      { __typename: 'CategoryType', id: 3, name: 'Action', order: 3 },
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

function renderLibrary(query: ReturnType<typeof queryClient>) {
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
  window.history.replaceState({}, '', '/library');

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
    expect(screen.getByText('Loading…')).toBeTruthy();

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
    expect(screen.getByText('Loading categories…')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'All' })).toBeTruthy();

    resolveCategories(
      data({ __typename: 'Query', categories: categoryData() }),
    );

    expect(await screen.findByRole('button', { name: 'Action' })).toBeTruthy();
  });
});

describe('LibraryPage search, filter, and sort', () => {
  it('submits server-side search with trimmed text', async () => {
    const query = queryClient(async ({ query: document }) => {
      if (document === LibraryCategoriesDocument) {
        return data({ __typename: 'Query', categories: categoryData() });
      }

      return libraryQuery(page([manga(1, 'Alpha')]));
    });
    const user = userEvent.setup();
    renderLibrary(query);

    const search = screen.getByLabelText('Search library');
    await user.type(search, '  alpha  {Enter}');

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

  it('changes the supported status filter without exposing source filter', async () => {
    const query = queryClient(async ({ query: document }) => {
      if (document === LibraryCategoriesDocument) {
        return data({ __typename: 'Query', categories: categoryData() });
      }

      return libraryQuery(page([manga(1, 'Alpha')]));
    });
    const user = userEvent.setup();
    renderLibrary(query);

    expect(screen.queryByLabelText(/source/i)).toBeNull();

    await openMenu(user, 'Filter');
    expect(screen.getAllByRole('menuitemradio')).toHaveLength(8);
    await user.click(screen.getByRole('menuitemradio', { name: 'Ongoing' }));

    expect(screen.getByRole('button', { name: 'Filter, active' })).toBeTruthy();
    expect(screen.queryAllByRole('menuitemradio')).toHaveLength(0);

    await waitFor(() =>
      expect(query).toHaveBeenCalledWith(
        expect.objectContaining({
          query: LibraryMangasDocument,
          variables: expect.objectContaining({
            filter: { status: { equalTo: 'ONGOING' } },
          }),
        }),
      ),
    );
  });

  it('closes the filter menu on Escape and restores focus to its trigger', async () => {
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
    expect(screen.getAllByRole('menuitemradio')).toHaveLength(8);
    expect(document.activeElement).toBe(
      screen.getByRole('menuitemradio', { name: 'All statuses' }),
    );

    await user.keyboard('{Escape}');

    expect(screen.queryAllByRole('menuitemradio')).toHaveLength(0);
    expect(document.activeElement).toBe(filter);
  });

  it('moves menu focus with arrows and tabs into the next control', async () => {
    const query = queryClient(async ({ query: document }) => {
      if (document === LibraryCategoriesDocument) {
        return data({ __typename: 'Query', categories: categoryData() });
      }

      return libraryQuery(page([manga(1, 'Alpha')]));
    });
    const user = userEvent.setup();
    renderLibrary(query);
    await screen.findByRole('heading', { name: 'Alpha' });

    await openMenu(user, 'Filter');
    expect(document.activeElement).toBe(
      screen.getByRole('menuitemradio', { name: 'All statuses' }),
    );

    await user.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(
      screen.getByRole('menuitemradio', { name: 'Ongoing' }),
    );

    await user.tab();

    expect(screen.queryAllByRole('menuitemradio')).toHaveLength(0);
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Sort' }));
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

    const loading = screen.getByRole('button', { name: 'Loading…' });
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
