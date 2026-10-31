import type { ApolloClient } from '@apollo/client';
import {
  SourcePreferencesDocument,
  UpdateSourcePreferenceDocument,
  type SourcePreferencesQuery,
} from '../graphql/generated/graphql';

export type SourcePreference =
  SourcePreferencesQuery['source']['preferences'][number];

export function createSourcePreferenceRepository(options: {
  readonly getClient: () => ApolloClient;
}) {
  return {
    async get(sourceId: string): Promise<readonly SourcePreference[]> {
      const result = await options.getClient().query({
        query: SourcePreferencesDocument,
        variables: { sourceId },
        fetchPolicy: 'network-only',
      });

      if (!result.data?.source) {
        throw new Error('Source preferences are unavailable.');
      }

      return result.data.source.preferences;
    },
    async update(
      sourceId: string,
      position: number,
      change: {
        checkBoxState?: boolean;
        switchState?: boolean;
        editTextState?: string;
        listState?: string;
        multiSelectState?: string[];
      },
    ): Promise<void> {
      const result = await options.getClient().mutate({
        mutation: UpdateSourcePreferenceDocument,
        variables: {
          input: {
            source: sourceId,
            change: { position, ...change },
          },
        },
      });

      if (!result.data?.updateSourcePreference) {
        throw new Error('Source preference could not be saved.');
      }
    },
  };
}
