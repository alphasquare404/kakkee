import type { ApolloClient } from '@apollo/client';
import { describe, expect, it, vi } from 'vitest';
import { StartLibraryUpdateDocument } from '../graphql/generated/graphql';
import { createLibraryUpdateRepository } from './libraryUpdateRepository';

describe('createLibraryUpdateRepository', () => {
  it('starts a library update and returns job info', async () => {
    const mutate = vi.fn(async () => ({
      data: {
        updateLibrary: {
          updateStatus: {
            jobsInfo: {
              isRunning: true,
              totalJobs: 4,
              finishedJobs: 0,
              skippedCategoriesCount: 0,
              skippedMangasCount: 1,
            },
          },
        },
      },
    }));
    const client = { mutate } as unknown as ApolloClient;
    const repository = createLibraryUpdateRepository({ getClient: () => client });

    await expect(repository.start()).resolves.toMatchObject({
      isRunning: true,
      totalJobs: 4,
    });
    expect(mutate).toHaveBeenCalledWith({
      mutation: StartLibraryUpdateDocument,
      variables: { input: {} },
    });
  });
});
