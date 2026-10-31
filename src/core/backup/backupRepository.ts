import type { ApolloClient } from '@apollo/client';
import { print } from 'graphql';
import {
  BackupSettingsDocument,
  CreateBackupDocument,
  RestoreBackupDocument,
  ValidateBackupDocument,
  type BackupSettingsQuery,
  type PartialBackupFlagsInput,
  type ValidateBackupQuery,
} from '../graphql/generated/graphql';

export type BackupSettings = BackupSettingsQuery['settings'];

export type BackupValidation = ValidateBackupQuery['validateBackup'];

export interface BackupRepository {
  getSettings(): Promise<BackupSettings>;
  create(flags: PartialBackupFlagsInput): Promise<string>;
  restore(file: File, flags: PartialBackupFlagsInput): Promise<string>;
  validate(file: File): Promise<BackupValidation>;
}

export interface BackupRepositoryOptions {
  readonly getClient: () => ApolloClient;
  readonly getGraphqlUrl?: () => string;
  readonly getAccessToken?: () => string | null;
  readonly fetchImpl?: typeof fetch;
}

export function createBackupRepository(
  options: BackupRepositoryOptions,
): BackupRepository {
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
    async restore(file, flags) {
      const url = options.getGraphqlUrl?.();

      if (!url) {
        throw new Error('Backup restore endpoint is unavailable.');
      }

      const form = new FormData();
      form.append(
        'operations',
        JSON.stringify({
          query: print(RestoreBackupDocument),
          variables: { input: { backup: null, flags } },
        }),
      );
      form.append('map', JSON.stringify({ 0: ['variables.input.backup'] }));
      form.append('0', file);
      const token = options.getAccessToken?.();
      const response = await (options.fetchImpl ?? fetch)(url, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: form,
      });

      if (!response.ok) {
        throw new Error('Backup restore request failed.');
      }

      const payload = (await response.json()) as {
        data?: { restoreBackup?: { id: string } | null };
        errors?: readonly unknown[];
      };

      if (!payload.data?.restoreBackup) {
        throw new Error('Backup could not be restored.');
      }

      return payload.data.restoreBackup.id;
    },
    async validate(file) {
      const url = options.getGraphqlUrl?.();

      if (!url) {
        throw new Error('Backup validation endpoint is unavailable.');
      }

      const form = new FormData();
      form.append(
        'operations',
        JSON.stringify({
          query: print(ValidateBackupDocument),
          variables: { input: { backup: null } },
        }),
      );
      form.append('map', JSON.stringify({ 0: ['variables.input.backup'] }));
      form.append('0', file);
      const token = options.getAccessToken?.();
      const response = await (options.fetchImpl ?? fetch)(url, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: form,
      });

      if (!response.ok) {
        throw new Error('Backup validation request failed.');
      }

      const payload = (await response.json()) as {
        data?: { validateBackup?: BackupValidation | null };
        errors?: readonly unknown[];
      };

      if (!payload.data?.validateBackup) {
        throw new Error('Backup could not be validated.');
      }

      return payload.data.validateBackup;
    },
  };
}
