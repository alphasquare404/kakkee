import type { ApolloClient } from '@apollo/client';
import {
  StartSyncDocument,
  SyncSettingsDocument,
  UpdateSyncSettingsDocument,
  type PartialSettingsTypeInput,
  type StartSyncMutation,
  type SyncSettingsQuery,
} from '../graphql/generated/graphql';

export type SyncSettings = SyncSettingsQuery['settings'];
export type SyncResult = StartSyncMutation['startSync']['result'];

export type EditableSyncSettings = Pick<
  SyncSettings,
  | 'syncDataCategories'
  | 'syncDataChapters'
  | 'syncDataHistory'
  | 'syncDataManga'
  | 'syncDataTracking'
  | 'syncYomiEnabled'
  | 'syncYomiHost'
  | 'syncYomiApiKey'
>;

export interface SyncRepository {
  getSettings(): Promise<SyncSettings>;
  update(patch: Partial<EditableSyncSettings>): Promise<void>;
  start(): Promise<SyncResult>;
}

export function createSyncRepository(options: {
  readonly getClient: () => ApolloClient;
}): SyncRepository {
  return {
    async getSettings() {
      const result = await options.getClient().query({
        query: SyncSettingsDocument,
        fetchPolicy: 'network-only',
      });

      if (!result.data?.settings) {
        throw new Error('Sync settings are unavailable.');
      }

      return result.data.settings;
    },
    async update(patch) {
      const result = await options.getClient().mutate({
        mutation: UpdateSyncSettingsDocument,
        variables: { settings: patch as PartialSettingsTypeInput },
      });

      if (!result.data?.setSettings) {
        throw new Error('Sync settings could not be saved.');
      }
    },
    async start() {
      const result = await options.getClient().mutate({
        mutation: StartSyncDocument,
      });

      if (!result.data?.startSync) {
        throw new Error('Sync could not be started.');
      }

      return result.data.startSync.result;
    },
  };
}
