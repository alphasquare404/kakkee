import type { ApolloClient } from '@apollo/client';
import {
  CategoryCatalogDocument,
  ChapterFeedDocument,
  SourceCatalogDocument,
  type CategoryCatalogQuery,
  type ChapterFeedQuery,
  type ChapterFeedQueryVariables,
  type ChapterFilterInput,
  type ChapterOrderInput,
  type SourceCatalogQuery,
} from '../graphql/generated/graphql';

export type FeedChapter = ChapterFeedQuery['chapters']['nodes'][number];
export type CatalogSource = SourceCatalogQuery['sources']['nodes'][number];
export type CatalogCategory = CategoryCatalogQuery['categories']['nodes'][number];

export interface FeedPage {
  readonly items: readonly FeedChapter[];
  readonly totalCount: number;
}

export interface FeedInput {
  readonly filter?: ChapterFilterInput;
  readonly order: readonly ChapterOrderInput[];
  readonly first?: number;
}

export interface SourcePage {
  readonly items: readonly CatalogSource[];
  readonly totalCount: number;
}

export interface CatalogRepository {
  getFeed(input: FeedInput): Promise<FeedPage>;
  getSources(): Promise<SourcePage>;
  getCategories(): Promise<readonly CatalogCategory[]>;
}

export interface CatalogRepositoryOptions {
  readonly getClient: () => ApolloClient;
}

const FEED_PAGE_SIZE = 40;
const SOURCE_PAGE_SIZE = 200;

export function createCatalogRepository(
  options: CatalogRepositoryOptions,
): CatalogRepository {
  function getFeed(input: FeedInput): Promise<FeedPage> {
    const variables: ChapterFeedQueryVariables = {
      first: input.first ?? FEED_PAGE_SIZE,
      filter: input.filter,
      order: [...input.order],
    };

    return options
      .getClient()
      .query({
        query: ChapterFeedDocument,
        variables,
        fetchPolicy: 'network-only',
      })
      .then((result) => {
        const chapters = result.data?.chapters;

        if (!chapters) {
          throw new Error('Server returned no chapter feed.');
        }

        return {
          items: chapters.nodes,
          totalCount: chapters.totalCount,
        };
      });
  }

  function getSources(): Promise<SourcePage> {
    return options
      .getClient()
      .query({
        query: SourceCatalogDocument,
        variables: { first: SOURCE_PAGE_SIZE },
        fetchPolicy: 'network-only',
      })
      .then((result) => {
        const sources = result.data?.sources;

        if (!sources) {
          throw new Error('Server returned no sources.');
        }

        return {
          items: sources.nodes,
          totalCount: sources.totalCount,
        };
      });
  }

  function getCategories(): Promise<readonly CatalogCategory[]> {
    return options
      .getClient()
      .query({
        query: CategoryCatalogDocument,
        fetchPolicy: 'network-only',
      })
      .then((result) => {
        const categories = result.data?.categories.nodes;

        if (!categories) {
          throw new Error('Server returned no categories.');
        }

        return categories;
      });
  }

  return { getFeed, getSources, getCategories };
}
