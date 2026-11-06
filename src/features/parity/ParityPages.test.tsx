// @vitest-environment jsdom

import type { ApolloClient } from '@apollo/client';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
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
  GlobalSearchDocument,
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
    },
  });

  return {
    __typename: 'Query',
    chapters: {
      __typename: 'ChapterNodeList',
      totalCount: 3,
      nodes: [
        chapter(10, 1, 'History Manga', 2),
        chapter(9, 1, 'History Manga', 1),
        chapter(8, 2, 'Other Manga', 0),
      ],
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
  it('searches manga and sources globally', async () => {
    const query = vi.fn(async ({ query: document }: { query: unknown }) => {
      if (document === GlobalSearchDocument) {
        return {
          data: {
            mangas: {
              __typename: 'MangaNodeList',
              totalCount: 1,
              nodes: [
                {
                  __typename: 'MangaType',
                  id: 1,
                  title: 'Alpha',
                  thumbnailUrl: null,
                  inLibrary: true,
                  unreadCount: 2,
                },
              ],
            },
            sources: {
              __typename: 'SourceNodeList',
              totalCount: 1,
              nodes: [
                {
                  __typename: 'SourceType',
                  id: '42',
                  name: 'Example',
                  displayName: 'Example Source',
                  lang: 'en',
                },
              ],
            },
          },
        };
      }

      return { data: {} };
    });
    renderPage('/search', query);
    const user = userEvent.setup();
    const input = await screen.findByLabelText('Search all manga');
    expect(screen.queryByRole('button', { name: 'Search installed sources' })).toBeNull();

    await user.type(input, 'alpha{Enter}');

    expect(screen.getByRole('button', { name: 'Search installed sources' })).toBeTruthy();
    expect(await screen.findByText('Alpha')).toBeTruthy();
    expect(screen.getByText('Example Source')).toBeTruthy();
    await user.click(input);
    expect(await screen.findByRole('option', { name: 'alpha' })).toBeTruthy();
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
    expect(screen.getByText('installed sources')).toBeTruthy();
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
