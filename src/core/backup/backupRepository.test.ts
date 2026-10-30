import type { ApolloClient } from '@apollo/client';
import { describe, expect, it, vi } from 'vitest';
import {
  BackupSettingsDocument,
  CreateBackupDocument,
} from '../graphql/generated/graphql';
import { createBackupRepository } from './backupRepository';

const settings = {
  __typename: 'SettingsType' as const,
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
};

describe('createBackupRepository', () => {
  it('loads backup settings and creates a backup', async () => {
    const query = vi.fn(async () => ({ data: { settings } }));
    const mutate = vi.fn(async () => ({
      data: { createBackup: { url: 'https://example.test/backup.zip' } },
    }));
    const client = { query, mutate } as unknown as ApolloClient;
    const repository = createBackupRepository({ getClient: () => client });

    await expect(repository.getSettings()).resolves.toMatchObject({
      backupPath: '/backups',
    });
    await expect(
      repository.create({ includeManga: true }),
    ).resolves.toBe('https://example.test/backup.zip');

    expect(query).toHaveBeenCalledWith(
      expect.objectContaining({ query: BackupSettingsDocument }),
    );
    expect(mutate).toHaveBeenCalledWith({
      mutation: CreateBackupDocument,
      variables: { input: { flags: { includeManga: true } } },
    });
  });
});
