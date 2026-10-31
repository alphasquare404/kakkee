import type { ApolloClient } from '@apollo/client';
import {
  ClearCachedImagesDocument,
  ServerSettingsDocument,
  UpdateServerSettingsDocument,
  type PartialSettingsTypeInput,
  type ServerSettingsQuery,
} from '../graphql/generated/graphql';

export type ServerSettings = ServerSettingsQuery['settings'];

export type EditableServerSettings = Pick<
  ServerSettings,
  | 'updateMangas'
  | 'autoDownloadNewChapters'
  | 'autoDownloadNewChaptersLimit'
  | 'downloadAsCbz'
  | 'maxSourcesInParallel'
  | 'globalUpdateInterval'
  | 'excludeCompleted'
  | 'excludeNotStarted'
  | 'excludeUnreadChapters'
  | 'excludeEntryWithUnreadChapters'
  | 'debugLogsEnabled'
  | 'opdsCbzMimetype'
  | 'opdsChapterSortOrder'
  | 'opdsEnablePageReadProgress'
  | 'opdsItemsPerPage'
  | 'opdsMarkAsReadOnDownload'
  | 'opdsShowOnlyDownloadedChapters'
  | 'opdsShowOnlyUnreadChapters'
  | 'opdsSkipChapterMetadataFeed'
  | 'opdsUseBinaryFileSizes'
  | 'koreaderSyncChecksumMethod'
  | 'koreaderSyncPercentageTolerance'
  | 'koreaderSyncStrategyBackward'
  | 'koreaderSyncStrategyForward'
  | 'downloadConversions'
  | 'serveConversions'
>;

export interface ServerSettingsRepository {
  getSettings(): Promise<ServerSettings>;
  updateSettings(
    patch: Partial<EditableServerSettings>,
  ): Promise<Partial<EditableServerSettings>>;
  clearCachedImages(input: {
    cachedPages?: boolean;
    cachedThumbnails?: boolean;
    downloadedThumbnails?: boolean;
  }): Promise<void>;
}

export interface ServerSettingsRepositoryOptions {
  readonly getClient: () => ApolloClient;
}

export function createServerSettingsRepository(
  options: ServerSettingsRepositoryOptions,
): ServerSettingsRepository {
  return {
    async getSettings() {
      const result = await options.getClient().query({
        query: ServerSettingsDocument,
        fetchPolicy: 'network-only',
      });

      if (!result.data?.settings) {
        throw new Error('Server settings are unavailable.');
      }

      return result.data.settings;
    },
    async updateSettings(patch) {
      const result = await options.getClient().mutate({
        mutation: UpdateServerSettingsDocument,
        variables: { settings: patch as PartialSettingsTypeInput },
      });

      if (!result.data?.setSettings) {
        throw new Error('Server settings could not be saved.');
      }

      return result.data.setSettings.settings;
    },
    async clearCachedImages(input) {
      await options.getClient().mutate({
        mutation: ClearCachedImagesDocument,
        variables: { input },
      });
    },
  };
}
