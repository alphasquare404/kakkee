// @vitest-environment jsdom

import type { ApolloClient } from '@apollo/client';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { App } from '../../app/App';
import type { ResourceService } from '../../core/resources/resourceService';
import {
  CategoryCatalogDocument,
  ChapterFeedDocument,
  RecentlyReadDocument,
  ReadingFeedDocument,
  DownloadQueueDocument,
  BackupSettingsDocument,
  CreateBackupDocument,
  ExtensionsCatalogDocument,
  FetchSourceMangaDocument,
  ServerSettingsDocument,
  SourceCatalogDocument,
  SourceInfoDocument,
  SyncSettingsDocument,
  TrackingServicesDocument,
  type CategoryCatalogQuery,
  type ChapterFeedQuery,
  type ReadingFeedQuery,
  type ServerSettingsQuery,
  type SourceCatalogQuery,
} from '../../core/graphql/generated/graphql';
import { FakeConnectionCoordinator, makeConnectedState } from '../../test/fakeConnectionCoordinator';
import { resetReaderSettings } from '../../core/preferences/readerSettings';
import { resetAppPreferences } from '../../core/preferences/appPreferences';
import {
  resetSearchPreferences,
  updateSearchPreferences,
} from '../../core/preferences/searchPreferences';
import { updateSourcePreferences } from '../../core/preferences/sourcePreferences';
import {
  getLibraryPreferences,
  resetLibraryPreferences,
  updateLibraryPreferences,
} from '../../core/preferences/libraryPreferences';
import { resetHistoryPreferences } from '../../core/preferences/historyPreferences';

vi.mock('../../app/pwaUpdate', () => ({
  usePwaUpdate: () => ({
    needRefresh: [false, vi.fn()],
    offlineReady: [false, vi.fn()],
    updateServiceWorker: vi.fn(),
  }),
}));

afterEach(() => {
  cleanup();
  resetLibraryPreferences();
  window.history.replaceState({}, '', '/');
  resetReaderSettings();
  resetAppPreferences();
  resetHistoryPreferences();
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

function readingFeed(): ReadingFeedQuery {
  return {
    __typename: 'Query',
    mangas: {
      __typename: 'MangaNodeList',
      totalCount: 1,
      pageInfo: {
        __typename: 'PageInfo',
        endCursor: null,
        hasNextPage: false,
      },
      nodes: [
        {
          __typename: 'MangaType',
          id: 1,
          title: 'Actual Manga',
          thumbnailUrl: '/api/v1/manga/1/thumbnail',
          categories: { __typename: 'CategoryNodeList', nodes: [] },
          latestUploadedChapter: {
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
            scanlator: null,
            sourceOrder: 9,
          },
        },
      ],
    },
  };
}

function historyFeed(): ChapterFeedQuery {
  const now = String(Date.now());
  const chapter = (id: number, mangaId: number, title: string, page: number) => ({
    __typename: 'ChapterType' as const,
    id,
    name: `Chapter ${id}`,
    chapterNumber: id,
    pageCount: 18,
    isRead: false,
    isDownloaded: false,
    lastPageRead: page,
    lastReadAt: now,
    uploadDate: now,
    scanlator: null,
    manga: {
      __typename: 'MangaType' as const,
      id: mangaId,
      title,
      thumbnailUrl: `/api/v1/manga/${mangaId}/thumbnail`,
      categories: {
        __typename: 'CategoryNodeList' as const,
        nodes: [] as Array<{ __typename: 'CategoryType'; id: number }>,
      },
    },
  });

  const nodes: ChapterFeedQuery['chapters']['nodes'] = [
    chapter(10, 1, 'History Manga', 2),
    chapter(9, 1, 'History Manga', 1),
    chapter(8, 2, 'Other Manga', 0),
  ];
  nodes[2].manga.categories.nodes = [
    { __typename: 'CategoryType', id: 2 },
  ];

  return {
    __typename: 'Query',
    chapters: {
      __typename: 'ChapterNodeList',
      totalCount: 3,
      nodes,
    },
  };
}

function serverSettings(): ServerSettingsQuery {
  return {
    __typename: 'Query',
    settings: {
      __typename: 'SettingsType',
      authMode: 'NONE',
      authUsername: '',
      authPassword: '',
      databaseType: 'H2',
      databaseUrl: '',
      databaseUsername: '',
      databasePassword: '',
      updateMangas: true,
      autoDownloadNewChapters: false,
      autoDownloadNewChaptersLimit: 5,
      downloadAsCbz: true,
      downloadsPath: '/downloads',
      maxSourcesInParallel: 3,
      globalUpdateInterval: 24,
      excludeCompleted: false,
      excludeNotStarted: true,
      excludeUnreadChapters: false,
      excludeEntryWithUnreadChapters: false,
      debugLogsEnabled: false,
      backupPath: '/backups',
      backupInterval: 24,
      webUIChannel: 'STABLE',
      webUIFlavor: 'WEBUI',
      webUIInterface: 'BROWSER',
  opdsCbzMimetype: 'COMPATIBLE',
  opdsChapterSortOrder: 'ASC',
  opdsEnablePageReadProgress: true,
  opdsItemsPerPage: 20,
  opdsMarkAsReadOnDownload: false,
  opdsShowOnlyDownloadedChapters: false,
  opdsShowOnlyUnreadChapters: false,
  opdsSkipChapterMetadataFeed: false,
  opdsUseBinaryFileSizes: false,
  koreaderSyncChecksumMethod: 'BINARY',
  koreaderSyncPercentageTolerance: 0.1,
  koreaderSyncStrategyBackward: 'PROMPT',
  koreaderSyncStrategyForward: 'PROMPT',
  downloadConversions: [],
  serveConversions: [],    },
  };
}

function renderPage(
  path: string,
  query: ReturnType<typeof vi.fn>,
  mutate: ReturnType<typeof vi.fn> = vi.fn(async () => ({ data: {} })),
) {
  const connected = makeConnectedState();
  const state = {
    ...connected,
    context: {
      ...connected.context,
      graphQL: { query, mutate } as unknown as ApolloClient,
      resources: resources(),
    },
  };
  window.history.replaceState({}, '', path);
  const coordinator = new FakeConnectionCoordinator(state);
  render(<App createCoordinator={() => coordinator} />);
  return { coordinator, state };
}

describe('parity pages', () => {
  const searchSources: SourceCatalogQuery = {
    __typename: 'Query',
    sources: {
      __typename: 'SourceNodeList',
      totalCount: 2,
      nodes: [
        {
          __typename: 'SourceType',
          id: 'mangadex',
          name: 'MangaDex',
          displayName: 'MangaDex (EN)',
          lang: 'en',
          isNsfw: false,
          contentWarning: 'SAFE',
          supportsLatest: true,
          iconUrl: '',
        },
        {
          __typename: 'SourceType',
          id: 'comick',
          name: 'Comick',
          displayName: 'Comick',
          lang: 'all',
          isNsfw: false,
          contentWarning: 'SAFE',
          supportsLatest: true,
          iconUrl: '',
        },
      ],
    },
  };

  function searchMutation() {
    return vi.fn(async ({ mutation, variables }: {
      mutation: unknown;
      variables?: { input?: { source?: string } };
    }) => {
      if (mutation !== FetchSourceMangaDocument) {
        throw new Error('unexpected mutation');
      }

      const sourceId = variables?.input?.source;

      return {
        data: {
          fetchSourceManga: {
            __typename: 'FetchSourceMangaPayload',
            hasNextPage: false,
            mangas:
              sourceId === 'mangadex'
                ? [
                    {
                      __typename: 'MangaType',
                      id: 1,
                      title: 'Alpha',
                      thumbnailUrl: null,
                      inLibrary: false,
                      sourceId: 'mangadex',
                    },
                    {
                      __typename: 'MangaType',
                      id: 2,
                      title: 'Beta',
                      thumbnailUrl: null,
                      inLibrary: true,
                      sourceId: 'mangadex',
                    },
                  ]
                : [
                    {
                      __typename: 'MangaType',
                      id: 3,
                      title: 'Alpha',
                      thumbnailUrl: null,
                      inLibrary: false,
                      sourceId: 'comick',
                    },
                  ],
          },
        },
      };
    });
  }

  it('searches across sources, groups results by tabs, and keeps source identity', async () => {
    resetSearchPreferences();
    updateSourcePreferences({ showNsfw: false, pinned: [] });
    const query = vi.fn(async ({ query: document }: { query: unknown }) => {
      if (document === SourceCatalogDocument) {
        return { data: searchSources };
      }
      throw new Error('unexpected query');
    });
    const mutate = searchMutation();
    renderPage('/search?q=alpha', query, mutate);

    expect(await screen.findByRole('heading', { name: 'Search' })).toBeTruthy();
    expect(await screen.findByRole('tab', { name: /MangaDex \(EN\) 2/ })).toBeTruthy();
    expect(screen.getByRole('tab', { name: /Comick 1/ })).toBeTruthy();
    expect(screen.getAllByText('Alpha')).toHaveLength(2);
    expect(screen.getAllByText('MangaDex · English').length).toBeGreaterThan(0);
    expect(screen.getByText('Comick · Multi-language')).toBeTruthy();
    expect(mutate).toHaveBeenCalledTimes(2);

    await userEvent.setup().click(screen.getByRole('tab', { name: /Comick 1/ }));

    expect(await screen.findByText('Comick · Multi-language')).toBeTruthy();
    expect(screen.queryByText('MangaDex · English')).toBeNull();
    expect(mutate).toHaveBeenCalledTimes(2);
  });

  it('loads more results only for the active source', async () => {
    resetSearchPreferences();
    updateSearchPreferences({
      languages: [],
      allSources: false,
      sourceIds: ['mangadex'],
    });
    updateSourcePreferences({ showNsfw: false, pinned: [] });
    const query = vi.fn(async ({ query: document }: { query: unknown }) => {
      if (document === SourceCatalogDocument) {
        return { data: searchSources };
      }
      throw new Error('unexpected query');
    });
    const mutate = vi.fn(async ({ mutation, variables }: {
      mutation: unknown;
      variables?: { input?: { source?: string; page?: number } };
    }) => {
      if (mutation !== FetchSourceMangaDocument) {
        throw new Error('unexpected mutation');
      }

      const page = variables?.input?.page ?? 1;

      return {
        data: {
          fetchSourceManga: {
            __typename: 'FetchSourceMangaPayload',
            hasNextPage: page === 1,
            mangas: [
              {
                __typename: 'MangaType',
                id: page,
                title: page === 1 ? 'Alpha' : 'Beta',
                thumbnailUrl: null,
                inLibrary: false,
                sourceId: 'mangadex',
              },
            ],
          },
        },
      };
    });
    renderPage('/search?q=alpha', query, mutate);
    const user = userEvent.setup();

    expect(await screen.findByRole('tab', { name: /MangaDex \(EN\) 1\+/ })).toBeTruthy();
    await user.click(screen.getByRole('tab', { name: /MangaDex \(EN\) 1\+/ }));
    await user.click(screen.getByRole('button', { name: 'Load more from MangaDex (EN)' }));

    expect(await screen.findByText('Beta')).toBeTruthy();
    expect(mutate).toHaveBeenCalledTimes(2);
  });

  it('persists a source selection and reruns only the selected sources', async () => {
    resetSearchPreferences();
    updateSourcePreferences({ showNsfw: false, pinned: [] });
    const query = vi.fn(async ({ query: document }: { query: unknown }) => {
      if (document === SourceCatalogDocument) {
        return { data: searchSources };
      }
      throw new Error('unexpected query');
    });
    const mutate = searchMutation();
    renderPage('/search?q=alpha', query, mutate);
    const user = userEvent.setup();

    expect(await screen.findByRole('tab', { name: /MangaDex \(EN\) 2/ })).toBeTruthy();
    await user.click(screen.getByRole('button', { name: /Filter search/ }));
    const dialog = screen.getByRole('dialog', { name: 'Filter search' });
    await user.click(
      within(dialog).getByRole('checkbox', { name: /MangaDex \(EN\)/ }),
    );
    await user.click(within(dialog).getByRole('button', { name: 'Apply' }));

    await waitFor(() => expect(mutate).toHaveBeenCalledTimes(3));
    expect(screen.queryByRole('tab', { name: /MangaDex \(EN\)/ })).toBeNull();
    expect(screen.getByRole('tab', { name: /Comick 1/ })).toBeTruthy();
    expect(
      JSON.parse(
        window.localStorage.getItem('suwayomi.search-preferences.v1') ?? '{}',
      ).sourceIds,
    ).toEqual(['comick']);
  });

  it('keeps successful source results when another source fails', async () => {
    resetSearchPreferences();
    updateSourcePreferences({ showNsfw: false, pinned: [] });
    const query = vi.fn(async ({ query: document }: { query: unknown }) => {
      if (document === SourceCatalogDocument) {
        return { data: searchSources };
      }
      throw new Error('unexpected query');
    });
    const mutate = vi.fn(async ({ mutation, variables }: {
      mutation: unknown;
      variables?: { input?: { source?: string } };
    }) => {
      if (mutation !== FetchSourceMangaDocument) {
        throw new Error('unexpected mutation');
      }

      if (variables?.input?.source === 'comick') {
        throw new Error('source failed');
      }

      return {
        data: {
          fetchSourceManga: {
            __typename: 'FetchSourceMangaPayload',
            hasNextPage: false,
            mangas: [
              {
                __typename: 'MangaType',
                id: 1,
                title: 'Alpha',
                thumbnailUrl: null,
                inLibrary: false,
                sourceId: 'mangadex',
              },
            ],
          },
        },
      };
    });
    renderPage('/search?q=alpha', query, mutate);

    expect(await screen.findByText('Some sources could not be searched')).toBeTruthy();
    expect(screen.getByText('MangaDex · English')).toBeTruthy();
    const comickTab = await screen.findByRole('tab', { name: /Comick !/ });
    expect(comickTab).toBeTruthy();
    await userEvent.setup().click(comickTab);
    expect(await screen.findByRole('button', { name: 'Retry' })).toBeTruthy();
  });

  it('submits a manga search with Enter without a separate Search tab', async () => {
    resetSearchPreferences();
    updateSourcePreferences({ showNsfw: false, pinned: [] });
    const query = vi.fn(async ({ query: document }: { query: unknown }) => {
      if (document === SourceCatalogDocument) {
        return { data: searchSources };
      }
      throw new Error('unexpected query');
    });
    const mutate = searchMutation();
    renderPage('/search', query, mutate);
    const user = userEvent.setup();

    expect(await screen.findByRole('heading', { name: 'Search' })).toBeTruthy();
    expect(screen.queryByRole('link', { name: 'Search' })).toBeNull();
    const input = await screen.findByRole('searchbox', { name: 'Search manga' });
    await user.type(input, 'alpha{Enter}');

    expect(await screen.findByRole('tab', { name: /MangaDex \(EN\) 2/ })).toBeTruthy();
    expect(mutate).toHaveBeenCalledTimes(2);
  });

  it('toggles hide-read history preference', async () => {
    const query = vi.fn(async () => ({ data: {} }));
    renderPage('/settings/history', query);

    expect(
      await screen.findByRole('heading', { name: 'History settings' }),
    ).toBeTruthy();
    fireEvent.click(screen.getByLabelText('Hide read entries'));

    expect(
      window.localStorage.getItem('suwayomi.history-preferences.v1'),
    ).toContain('"hideRead":true');
  });

  it('renders device capability information', async () => {
    const query = vi.fn(async () => ({ data: {} }));
    renderPage('/settings/device', query);

    expect(await screen.findByRole('heading', { name: 'Device' })).toBeTruthy();
    expect(screen.getByText('Service worker')).toBeTruthy();
    expect(screen.getByText('Web Share')).toBeTruthy();
  });

  it('starts sync from sync settings', async () => {
    const query = vi.fn(async ({ query: document }: { query: unknown }) => {
      if (document === SyncSettingsDocument) {
        return {
          data: {
            settings: {
              __typename: 'SettingsType',
              syncInterval: 'P1D',
              syncDataCategories: true,
              syncDataChapters: true,
              syncDataHistory: true,
              syncDataManga: true,
              syncDataTracking: false,
              syncYomiEnabled: true,
              syncYomiHost: 'https://yomi.example',
            },
          },
        };
      }

      return { data: {} };
    });
    const mutate = vi.fn(async () => ({
      data: { startSync: { result: 'SUCCESS' } },
    }));
    renderPage('/settings/sync', query, mutate);
    const user = userEvent.setup();

    expect(await screen.findByRole('heading', { name: 'Sync' })).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Start sync' }));

    expect(await screen.findByText('Sync started')).toBeTruthy();
  });

  it('renders tracking services and logs out', async () => {
    const query = vi.fn(async ({ query: document }: { query: unknown }) => {
      if (document === TrackingServicesDocument) {
        return {
          data: {
            trackers: {
              __typename: 'TrackerNodeList',
              nodes: [
                {
                  __typename: 'TrackerType',
                  id: 1,
                  name: 'MAL',
                  icon: 'mal',
                  isLoggedIn: true,
                  isTokenExpired: false,
                  authUrl: 'https://example.test/auth',
                  supportsPrivateTracking: true,
                  supportsReadingDates: true,
                  supportsTrackDeletion: true,
                },
              ],
            },
          },
        };
      }

      return { data: {} };
    });
    const mutate = vi.fn(async () => ({
      data: { logoutTracker: { tracker: { id: 1, isLoggedIn: false } } },
    }));
    renderPage('/settings/tracking', query, mutate);
    const user = userEvent.setup();

    expect(await screen.findByRole('heading', { name: 'Tracking' })).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Logout' }));

    await waitFor(() =>
      expect(screen.getByText('Not connected')).toBeTruthy(),
    );
  });

  it('creates a backup with selected data', async () => {
    const query = vi.fn(async ({ query: document }: { query: unknown }) => {
      if (document === BackupSettingsDocument) {
        return {
          data: {
            settings: {
              __typename: 'SettingsType',
              autoBackupIncludeCategories: true,
              autoBackupIncludeChapters: true,
              autoBackupIncludeClientData: false,
              autoBackupIncludeHistory: true,
              autoBackupIncludeManga: true,
              autoBackupIncludeServerSettings: false,
              autoBackupIncludeTracking: false,
              backupPath: '/backups',
              backupInterval: 24,
              backupTime: '02:00',
              backupTTL: 5,
            },
          },
        };
      }

      return { data: {} };
    });
    const mutate = vi.fn(async ({ mutation }: { mutation: unknown }) => {
      if (mutation === CreateBackupDocument) {
        return {
          data: { createBackup: { url: 'https://example.test/backup.zip' } },
        };
      }

      return { data: {} };
    });
    renderPage('/settings/backup', query, mutate);

    expect(await screen.findByRole('heading', { name: 'Backup' })).toBeTruthy();
    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: 'Create backup' }));

    expect(await screen.findByRole('link', { name: 'open backup file' })).toBeTruthy();
  });

  it('renders an extension detail page', async () => {
    const query = vi.fn(async ({ query: document }: { query: unknown }) => {
      if (document === ExtensionsCatalogDocument) {
        return {
          data: {
            extensions: {
              __typename: 'ExtensionNodeList',
              totalCount: 1,
              nodes: [
                {
                  __typename: 'ExtensionType',
                  pkgName: 'example',
                  name: 'Example Extension',
                  versionName: '1.0.0',
                  lang: 'en',
                  isInstalled: true,
                  hasUpdate: false,
                  isObsolete: false,
                  iconUrl: '/icon.png',
                  contentWarning: 'SAFE',
                  extensionStore: {
                    __typename: 'ExtensionStoreType',
                    name: 'Store',
                  },
                },
              ],
            },
          },
        };
      }

      return { data: {} };
    });
    renderPage('/extensions/example', query);

    expect(await screen.findByRole('heading', { name: 'Example Extension' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Uninstall' })).toBeTruthy();
  });

  it('installs an extension from the catalog', async () => {
    const query = vi.fn(async ({ query: document }: { query: unknown }) => {
      if (document === ExtensionsCatalogDocument) {
        return {
          data: {
            extensions: {
              __typename: 'ExtensionNodeList',
              totalCount: 1,
              nodes: [
                {
                  __typename: 'ExtensionType',
                  pkgName: 'example',
                  name: 'Example Extension',
                  versionName: '1.0.0',
                  lang: 'en',
                  isInstalled: false,
                  hasUpdate: false,
                  isObsolete: false,
                  iconUrl: '/icon.png',
                  contentWarning: 'SAFE',
                  extensionStore: {
                    __typename: 'ExtensionStoreType',
                    name: 'Store',
                  },
                },
              ],
            },
          },
        };
      }

      return { data: {} };
    });
    const mutate = vi.fn(async () => ({
      data: {
        updateExtensions: {
          extensions: [
            {
              __typename: 'ExtensionType',
              pkgName: 'example',
              isInstalled: true,
              hasUpdate: false,
            },
          ],
        },
      },
    }));
    renderPage('/extensions', query, mutate);

    expect(
      await screen.findByRole('heading', { name: 'Extensions' }),
    ).toBeTruthy();
    await userEvent
      .setup()
      .click(await screen.findByRole('button', { name: 'Install' }));

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Uninstall' })).toBeTruthy(),
    );
  });

  it('browses a source catalog and its search results', async () => {
    const query = vi.fn(async ({ query: document }: { query: unknown }) => {
      if (document === SourceInfoDocument) {
        return {
          data: {
            source: {
              __typename: 'SourceType',
              id: '42',
              displayName: 'Example Source',
              name: 'Example',
              lang: 'en',
              contentWarning: 'SAFE',
              filters: [],
            },
          },
        };
      }

      return { data: {} };
    });
    const mutate = vi.fn(async ({ mutation }: { mutation: unknown }) => {
      if (mutation === FetchSourceMangaDocument) {
        return {
          data: {
            fetchSourceManga: {
              hasNextPage: false,
              mangas: [
                {
                  __typename: 'MangaType',
                  id: 77,
                  title: 'Source Manga',
                  thumbnailUrl: null,
                  inLibrary: false,
                  sourceId: '42',
                },
              ],
            },
          },
        };
      }

      return { data: {} };
    });
    renderPage('/browse/42', query, mutate);

    expect(
      await screen.findByRole('heading', { name: 'Example Source' }),
    ).toBeTruthy();
    expect(await screen.findByText('Source Manga')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Add to library' })).toBeTruthy();

    const user = userEvent.setup();
    expect(screen.getByRole('button', { name: 'Search source' })).toBeTruthy();
    await user.type(screen.getByRole('searchbox', { name: 'Search source' }), 'elf{Enter}');
    await waitFor(() =>
      expect(mutate).toHaveBeenCalledWith(
        expect.objectContaining({
          variables: expect.objectContaining({
            input: expect.objectContaining({ type: 'SEARCH', query: 'elf' }),
          }),
        }),
      ),
    );
  });

  it('groups history by day and resumes the latest chapter per manga', async () => {
    const query = vi.fn(async ({ query: document }: { query: unknown }) => {
      if (document === ChapterFeedDocument) {
        return { data: historyFeed() };
      }

      return { data: {} };
    });
    renderPage('/history', query);

    const link = await screen.findByRole('link', {
      name: 'History Manga, Chapter 10',
    });

    expect(link.getAttribute('href')).toBe('/manga/1/chapter/10?page=3');
    expect(screen.getByRole('heading', { name: 'Today' })).toBeTruthy();
    expect(screen.queryByRole('link', { name: 'History Manga, Chapter 9' })).toBeNull();
    expect(
      screen.getByRole('link', { name: 'Other Manga, Chapter 8' }).getAttribute('href'),
    ).toBe('/manga/2/chapter/8');
  });

  it('filters history manga assigned to hidden categories', async () => {
    updateLibraryPreferences({
      ...getLibraryPreferences(),
      hiddenCategoryIds: [2],
    });
    const query = vi.fn(async ({ query: document }: { query: unknown }) => {
      if (document === ChapterFeedDocument) {
        return { data: historyFeed() };
      }
      throw new Error('unexpected query');
    });
    renderPage('/history', query);

    expect(await screen.findByRole('link', { name: 'History Manga, Chapter 10' })).toBeTruthy();
    expect(screen.queryByText('Other Manga')).toBeNull();
  });

  it('renders the real chapter feed on Updates', async () => {
    const query = vi.fn(async ({ query: document }: { query: unknown }) => {
      if (document === ReadingFeedDocument) {
        return { data: readingFeed() };
      }
      if (document === RecentlyReadDocument) {
        return {
          data: {
            __typename: 'Query',
            chapters: {
              __typename: 'ChapterNodeList',
              nodes: [],
              pageInfo: {
                __typename: 'PageInfo',
                endCursor: null,
                hasNextPage: false,
              },
            },
          },
        };
      }
      throw new Error('unexpected query');
    });
    renderPage('/updates', query);

    expect(await screen.findByRole('heading', { name: 'Reading' })).toBeTruthy();
    expect(await screen.findByRole('heading', { name: 'Updates' })).toBeTruthy();
    expect(await screen.findByText('Actual Manga')).toBeTruthy();
    expect(screen.getByText(/Chapter 9/)).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Sync library' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Mark read' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Download' })).toBeNull();
    expect(screen.getByRole('link', { name: 'Manga details' })).toBeTruthy();
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
    expect(screen.getByRole('button', { name: 'Pin Actual Source' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Extensions' }).getAttribute('href')).toBe('/extensions');
  });

  it('groups provider variants, expands them, and keeps each source addressable', async () => {
    const data: SourceCatalogQuery = {
      __typename: 'Query',
      sources: {
        __typename: 'SourceNodeList',
        totalCount: 3,
        nodes: [
          {
            __typename: 'SourceType',
            id: 'en',
            name: 'MangaDex',
            displayName: 'MangaDex (EN)',
            lang: 'en',
            isNsfw: false,
            contentWarning: 'SAFE',
            supportsLatest: true,
            iconUrl: '',
          },
          {
            __typename: 'SourceType',
            id: 'ja',
            name: 'MangaDex',
            displayName: 'MangaDex (JA)',
            lang: 'ja',
            isNsfw: false,
            contentWarning: 'SAFE',
            supportsLatest: true,
            iconUrl: '',
          },
          {
            __typename: 'SourceType',
            id: 'comick',
            name: 'Comick',
            displayName: 'Comick',
            lang: 'all',
            isNsfw: false,
            contentWarning: 'SAFE',
            supportsLatest: true,
            iconUrl: '',
          },
          {
            __typename: 'SourceType',
            id: 'nsfw',
            name: 'Nsfw Source',
            displayName: 'Nsfw Source',
            lang: 'en',
            isNsfw: true,
            contentWarning: 'NSFW',
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
    resetSearchPreferences();
    updateSourcePreferences({ pinned: [], showNsfw: false, language: 'all' });
    const user = userEvent.setup();
    renderPage('/browse', query);

    const provider = await screen.findByRole('button', {
      name: 'MangaDex, 2 language variants',
    });
    expect(screen.getByText(/3 of 4 sources/)).toBeTruthy();
    expect(provider.getAttribute('aria-expanded')).toBe('false');
    await user.click(provider);

    expect(provider.getAttribute('aria-expanded')).toBe('true');
    expect(
      screen.getByRole('link', { name: 'MangaDex (EN), Browse' }).getAttribute('href'),
    ).toBe('/browse/en');
    expect(
      screen.getByRole('link', { name: 'MangaDex (JA), Browse' }).getAttribute('href'),
    ).toBe('/browse/ja');

    expect(screen.getByRole('searchbox', { name: 'Search manga' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Filter search' })).toBeTruthy();

    const pin = screen.getAllByRole('button', { name: 'Pin MangaDex (EN)' })[0];
    await user.click(pin);
    expect(screen.getByRole('heading', { name: 'Pinned sources' })).toBeTruthy();
    expect(
      screen.getAllByRole('button', { name: 'Unpin MangaDex (EN)' }).length,
    ).toBeGreaterThan(0);
    await user.click(screen.getAllByRole('button', { name: 'Unpin MangaDex (EN)' })[0]);
    expect(screen.queryByRole('heading', { name: 'Pinned sources' })).toBeNull();

    await user.click(screen.getByRole('button', { name: 'Filter search' }));
    let dialog = screen.getByRole('dialog', { name: 'Filter search' });
    await user.click(within(dialog).getByRole('checkbox', { name: 'JA' }));
    await user.click(within(dialog).getByRole('button', { name: 'Apply' }));
    expect(await screen.findByRole('link', { name: 'MangaDex (JA), Browse' })).toBeTruthy();
    expect(screen.queryByRole('link', { name: 'MangaDex (EN), Browse' })).toBeNull();

    await user.click(screen.getByRole('button', { name: /Filter search/ }));
    dialog = screen.getByRole('dialog', { name: 'Filter search' });
    await user.click(within(dialog).getByRole('button', { name: 'All languages' }));
    await user.click(within(dialog).getByRole('checkbox', { name: 'Show NSFW sources' }));
    await user.click(within(dialog).getByRole('button', { name: 'Apply' }));
    expect(await screen.findByText('Nsfw Source')).toBeTruthy();

    await user.click(screen.getByRole('button', { name: /Filter search/ }));
    dialog = screen.getByRole('dialog', { name: 'Filter search' });
    await user.click(within(dialog).getByRole('checkbox', { name: 'Show NSFW sources' }));
    await user.click(within(dialog).getByRole('button', { name: 'Apply' }));

    await user.click(screen.getByRole('button', { name: /Filter search/ }));
    dialog = screen.getByRole('dialog', { name: 'Filter search' });
    await user.click(within(dialog).getByRole('button', { name: 'Clear' }));
    expect(
      (within(dialog).getByRole('button', { name: 'Apply' }) as HTMLButtonElement)
        .disabled,
    ).toBe(true);
    await user.click(within(dialog).getByRole('button', { name: 'Reset' }));
    expect(
      (within(dialog).getByRole('button', { name: 'Apply' }) as HTMLButtonElement)
        .disabled,
    ).toBe(false);
    await user.click(within(dialog).getByRole('button', { name: 'Apply' }));
  });

  it('submits manga search from Browse using the shared command row', async () => {
    resetSearchPreferences();
    updateSourcePreferences({ showNsfw: false, pinned: [] });
    const query = vi.fn(async ({ query: document }: { query: unknown }) => {
      if (document === SourceCatalogDocument) {
        return { data: searchSources };
      }
      throw new Error('unexpected query');
    });
    const mutate = searchMutation();
    renderPage('/browse', query, mutate);
    const user = userEvent.setup();

    const input = await screen.findByRole('searchbox', { name: 'Search manga' });
    await user.type(input, 'alpha{Enter}');

    expect(await screen.findByRole('heading', { name: 'Search' })).toBeTruthy();
    expect(await screen.findByRole('tab', { name: /MangaDex \(EN\) 2/ })).toBeTruthy();
    expect(mutate).toHaveBeenCalledTimes(2);
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
            includeInUpdate: 'INCLUDE',
            includeInDownload: 'INCLUDE',
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

  it('opens the category creation form', async () => {
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
            includeInUpdate: 'INCLUDE',
            includeInDownload: 'INCLUDE',
            mangas: { __typename: 'MangaNodeList', totalCount: 7 },
          },
        ],
      },
    };
    const query = vi.fn(async ({ query: document }: { query: unknown }) => {
      if (document === CategoryCatalogDocument) {
        return { data };
      }
      return { data: {} };
    });
    renderPage('/categories', query);

    await userEvent
      .setup()
      .click(await screen.findByRole('button', { name: 'New category' }));

    expect(screen.getByPlaceholderText('Category name')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Create' })).toBeTruthy();
  });

  it('renders real server information on Settings', async () => {
    const query = vi.fn(async () => ({ data: {} }));
    renderPage('/settings', query);

    expect(await screen.findByRole('heading', { name: 'Settings' })).toBeTruthy();
    expect(screen.getByText('v2.4.2366 · Stable')).toBeTruthy();
    expect(screen.getByText('https://server.example/suwayomi')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Disconnect server' })).toBeTruthy();
  });

  it('renders server settings returned by the server', async () => {
    const query = vi.fn(async ({ query: document }: { query: unknown }) => {
      if (document === ServerSettingsDocument) {
        return { data: serverSettings() };
      }

      return { data: {} };
    });
    renderPage('/settings/server', query);

    expect(
      await screen.findByRole('heading', { name: 'Server settings' }),
    ).toBeTruthy();
    expect(screen.getByText('/downloads')).toBeTruthy();
    expect(
      (screen.getByRole('checkbox', {
        name: 'Update library automatically',
      }) as HTMLInputElement).checked,
    ).toBe(true);
  });

  it('updates reader layout preferences from the Settings subpage', async () => {
    const query = vi.fn(async () => ({ data: {} }));
    renderPage('/settings/reader', query);

    expect(await screen.findByRole('heading', { name: 'Reader settings' })).toBeTruthy();
    const width = screen.getByLabelText('Reader width') as HTMLInputElement;

    fireEvent.change(width, { target: { value: '70' } });

    expect(width.value).toBe('70');
    expect(screen.getByText('70 rem')).toBeTruthy();

    fireEvent.change(screen.getByLabelText('Reading mode'), {
      target: { value: 'single' },
    });
    fireEvent.change(screen.getByLabelText('Image filter'), {
      target: { value: 'grayscale' },
    });
    fireEvent.change(screen.getByLabelText('Page scale'), {
      target: { value: 'fit-height' },
    });
    fireEvent.change(screen.getByLabelText('Reading direction'), {
      target: { value: 'rtl' },
    });
    fireEvent.click(screen.getByLabelText('Use Wake Lock while reading'));
    expect(
      JSON.parse(
        window.localStorage.getItem('suwayomi.reader-settings.v1') ?? '{}',
      ),
    ).toMatchObject({
      mode: 'single',
      filter: 'grayscale',
      scale: 'fit-height',
      direction: 'rtl',
      keepScreenOn: true,
    });
  });

  it('applies the appearance theme to the document root', async () => {
    const query = vi.fn(async () => ({ data: {} }));
    renderPage('/settings/appearance', query);

    expect(await screen.findByRole('heading', { name: 'Appearance' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Pure black/ }));

    await waitFor(() =>
      expect(document.documentElement.dataset.theme).toBe('pure-black'),
    );
  });

  it('updates library density from the Settings subpage', async () => {
    const query = vi.fn(async () => ({ data: {} }));
    renderPage('/settings/library', query);

    expect(await screen.findByRole('heading', { name: 'Library settings' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Comfortable/ }));

    expect(window.localStorage.getItem('suwayomi.app-preferences.v1')).toContain(
      '"libraryDensity":"comfortable"',
    );
  });

  it('renders the real download queue and downloaded feed states', async () => {    const query = vi.fn(async ({ query: document }: { query: unknown }) => {
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
