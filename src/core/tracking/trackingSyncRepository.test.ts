import type { ApolloClient } from '@apollo/client';
import { describe, expect, it, vi } from 'vitest';
import { TrackProgressDocument } from '../graphql/generated/graphql';
import { createTrackingSyncRepository } from './trackingSyncRepository';

describe('createTrackingSyncRepository', () => {
  it('requests progress sync for the manga', async () => {
    const mutate = vi.fn(async () => ({
      data: { trackProgress: { trackRecords: [] } },
    }));
    const client = { mutate } as unknown as ApolloClient;
    const repository = createTrackingSyncRepository({ getClient: () => client });

    await repository.sync(4);

    expect(mutate).toHaveBeenCalledWith({
      mutation: TrackProgressDocument,
      variables: { input: { mangaId: 4 } },
    });
  });
});
