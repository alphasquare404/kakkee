import type { ApolloClient } from '@apollo/client';
import {
  GlobalSearchDocument,
  type GlobalSearchQuery,
} from '../graphql/generated/graphql';

export type SearchManga = GlobalSearchQuery['mangas']['nodes'][number];
export type SearchSource = GlobalSearchQuery['sources']['nodes'][number];
export type SearchResult = GlobalSearchQuery;

export interface SearchRepository {
  search(query: string): Promise<SearchResult>;
}

export function createSearchRepository(options: {
  readonly getClient: () => ApolloClient;
}): SearchRepository {
  return {
    async search(query) {
      const result = await options.getClient().query({
        query: GlobalSearchDocument,
        variables: { search: query },
        fetchPolicy: 'network-only',
      });

      if (!result.data) {
        throw new Error('Search failed.');
      }

      return result.data;
    },
  };
}
