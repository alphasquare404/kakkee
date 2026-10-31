import type { ApolloClient } from '@apollo/client';
import { describe, expect, it, vi } from 'vitest';
import {
  ServerSettingsDocument,
  UpdateServerSettingsDocument,
  type ServerSettingsQuery,
} from '../graphql/generated/graphql';
import { createServerSettingsRepository } from './serverSettingsRepository';

const settings: ServerSettingsQuery['settings'] = {
  __typename: 'SettingsType',
  authMode: 'NONE',
  databaseType: 'H2',
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
  koreaderSyncStrategyForward: 'PROMPT',};

describe('createServerSettingsRepository', () => {
  it('reads settings from the server', async () => {
    const query = vi.fn(async () => ({ data: { settings } }));
    const client = { query, mutate: vi.fn() } as unknown as ApolloClient;
    const repository = createServerSettingsRepository({ getClient: () => client });

    await expect(repository.getSettings()).resolves.toMatchObject({
      downloadsPath: '/downloads',
    });
    expect(query).toHaveBeenCalledWith(
      expect.objectContaining({
        query: ServerSettingsDocument,
        fetchPolicy: 'network-only',
      }),
    );
  });

  it('updates a partial settings patch', async () => {
    const mutate = vi.fn(async () => ({
      data: {
        setSettings: {
          settings: {
            updateMangas: false,
          },
        },
      },
    }));
    const client = { query: vi.fn(), mutate } as unknown as ApolloClient;
    const repository = createServerSettingsRepository({ getClient: () => client });

    await expect(
      repository.updateSettings({ updateMangas: false }),
    ).resolves.toMatchObject({ updateMangas: false });
    expect(mutate).toHaveBeenCalledWith({
      mutation: UpdateServerSettingsDocument,
      variables: { settings: { updateMangas: false } },
    });
  });
});
