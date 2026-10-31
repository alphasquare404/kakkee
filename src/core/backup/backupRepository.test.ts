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

  it('uploads a backup archive with auth', async () => {
    const fetchImpl = vi.fn(async () => ({
      ok: true,
      json: async () => ({ data: { restoreBackup: { id: 'restore-1' } } }),
    })) as unknown as typeof fetch;
    const client = { query: vi.fn(), mutate: vi.fn() } as unknown as ApolloClient;
    const repository = createBackupRepository({
      getClient: () => client,
      getGraphqlUrl: () => 'https://example.test/api/graphql',
      getAccessToken: () => 'token-1',
      fetchImpl,
    });
    const file = new File(['backup'], 'backup.zip');

    await expect(
      repository.restore(file, { includeManga: true }),
    ).resolves.toBe('restore-1');

    expect(fetchImpl).toHaveBeenCalledWith(
      'https://example.test/api/graphql',
      expect.objectContaining({
        method: 'POST',
        headers: { Authorization: 'Bearer token-1' },
        body: expect.any(FormData),
      }),
    );
  });

  it('validates a backup archive', async () => {
    const fetchImpl = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        data: {
          validateBackup: {
            missingSources: [{ id: '42', name: 'Source' }],
            missingTrackers: [],
          },
        },
      }),
    })) as unknown as typeof fetch;
    const repository = createBackupRepository({
      getClient: () => ({ query: vi.fn(), mutate: vi.fn() }) as unknown as ApolloClient,
      getGraphqlUrl: () => 'https://example.test/api/graphql',
      fetchImpl,
    });

    await expect(
      repository.validate(new File(['backup'], 'backup.zip')),
    ).resolves.toMatchObject({
      missingSources: [{ id: '42', name: 'Source' }],
    });
  });
});
