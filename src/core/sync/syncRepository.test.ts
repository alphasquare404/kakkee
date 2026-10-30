import type { ApolloClient } from '@apollo/client';
import { describe, expect, it, vi } from 'vitest';
import {
  StartSyncDocument,
  SyncSettingsDocument,
  UpdateSyncSettingsDocument,
} from '../graphql/generated/graphql';
import { createSyncRepository } from './syncRepository';

const settings = {
  __typename: 'SettingsType' as const,
  syncInterval: 'P1D',
  syncDataCategories: true,
  syncDataChapters: false,
  syncDataHistory: true,
  syncDataManga: true,
  syncDataTracking: false,
  syncYomiEnabled: true,
  syncYomiHost: 'https://yomi.example',
};

describe('createSyncRepository', () => {
  it('loads settings, updates data flags, and starts sync', async () => {
    const query = vi.fn(async () => ({ data: { settings } }));
    const mutate = vi.fn(async ({ mutation }: { mutation: unknown }) => {
      if (mutation === UpdateSyncSettingsDocument) {
        return { data: { setSettings: { settings } } };
      }

      if (mutation === StartSyncDocument) {
        return { data: { startSync: { result: 'SUCCESS' } } };
      }

      throw new Error('unexpected mutation');
    });
    const client = { query, mutate } as unknown as ApolloClient;
    const repository = createSyncRepository({ getClient: () => client });

    await expect(repository.getSettings()).resolves.toMatchObject({
      syncYomiHost: 'https://yomi.example',
    });
    await repository.update({ syncDataChapters: true });
    await expect(repository.start()).resolves.toBe('SUCCESS');

    expect(query).toHaveBeenCalledWith(
      expect.objectContaining({ query: SyncSettingsDocument }),
    );
    expect(mutate).toHaveBeenNthCalledWith(1, {
      mutation: UpdateSyncSettingsDocument,
      variables: { settings: { syncDataChapters: true } },
    });
    expect(mutate).toHaveBeenNthCalledWith(2, { mutation: StartSyncDocument });
  });
});
