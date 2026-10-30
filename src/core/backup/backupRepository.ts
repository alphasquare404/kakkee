import type { ApolloClient } from '@apollo/client';
import {
  BackupSettingsDocument,
  CreateBackupDocument,
  type BackupSettingsQuery,
  type PartialBackupFlagsInput,
} from '../graphql/generated/graphql';

export type BackupSettings = BackupSettingsQuery['settings'];

export interface BackupRepository {
  getSettings(): Promise<BackupSettings>;
  create(flags: PartialBackupFlagsInput): Promise<string>;
}

export function createBackupRepository(options: {
  readonly getClient: () => ApolloClient;
}): BackupRepository {
  return {
    async getSettings() {
      const result = await options.getClient().query({
        query: BackupSettingsDocument,
        fetchPolicy: 'network-only',
      });

      if (!result.data?.settings) {
        throw new Error('Backup settings are unavailable.');
      }

      return result.data.settings;
    },
    async create(flags) {
      const result = await options.getClient().mutate({
        mutation: CreateBackupDocument,
        variables: { input: { flags } },
      });

      if (!result.data?.createBackup) {
        throw new Error('Backup could not be created.');
      }

      return result.data.createBackup.url;
    },
  };
}
