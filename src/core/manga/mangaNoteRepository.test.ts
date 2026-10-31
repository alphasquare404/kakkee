import type { ApolloClient } from '@apollo/client';
import { describe, expect, it, vi } from 'vitest';
import {
  DeleteMangaNoteDocument,
  MangaNotesDocument,
  SetMangaNoteDocument,
} from '../graphql/generated/graphql';
import { createMangaNoteRepository } from './mangaNoteRepository';

describe('createMangaNoteRepository', () => {
  it('loads, saves, and deletes the manga note', async () => {
    const query = vi.fn(async () => ({
      data: {
        manga: {
          __typename: 'MangaType',
          id: 1,
          meta: [
            { __typename: 'MangaMetaType', key: 'notes', value: 'Hello' },
          ],
        },
      },
    }));
    const mutate = vi.fn(async ({ mutation }: { mutation: unknown }) => {
      if (mutation === SetMangaNoteDocument) {
        return {
          data: {
            setMangaMeta: {
              meta: { __typename: 'MangaMetaType', key: 'notes', value: 'Saved' },
            },
          },
        };
      }
      if (mutation === DeleteMangaNoteDocument) {
        return { data: { deleteMangaMeta: { meta: null } } };
      }
      throw new Error('unexpected mutation');
    });
    const client = { query, mutate } as unknown as ApolloClient;
    const repository = createMangaNoteRepository({ getClient: () => client });

    await expect(repository.getNote(1)).resolves.toBe('Hello');
    await expect(repository.save(1, 'Saved')).resolves.toBe('Saved');
    await repository.remove(1);

    expect(query).toHaveBeenCalledWith(
      expect.objectContaining({
        query: MangaNotesDocument,
        variables: { mangaId: 1 },
      }),
    );
    expect(mutate).toHaveBeenNthCalledWith(1, {
      mutation: SetMangaNoteDocument,
      variables: {
        input: { meta: { mangaId: 1, key: 'notes', value: 'Saved' } },
      },
    });
    expect(mutate).toHaveBeenNthCalledWith(2, {
      mutation: DeleteMangaNoteDocument,
      variables: { input: { mangaId: 1, key: 'notes' } },
    });
  });
});
