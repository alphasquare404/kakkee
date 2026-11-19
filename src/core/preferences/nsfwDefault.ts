import type { ApolloClient } from '@apollo/client';
import {
  GlobalNsfwDefaultDocument,
  SetGlobalNsfwDefaultDocument,
} from '../graphql/generated/graphql';

export const NSFW_DEFAULT_META_KEY = 'kakkee.nsfw-default';
export const HIDDEN_CATEGORIES_META_KEY = 'kakkee.hidden-category-ids';
export const HIDDEN_HISTORY_META_KEY = 'kakkee.hidden-history-manga-ids';

export interface VisibilityDefaults {
  readonly hideNsfw: boolean | null;
  readonly hiddenCategoryIds: readonly number[] | null;
  readonly hiddenHistoryMangaIds: readonly number[] | null;
}

export interface NsfwDefaultRepository {
  getVisibilityDefaults(): Promise<VisibilityDefaults>;
  setDefault(hideNsfw: boolean): Promise<void>;
  setHiddenCategories(categoryIds: readonly number[]): Promise<void>;
  setHiddenHistory(mangaIds: readonly number[]): Promise<void>;
}

export function createNsfwDefaultRepository(options: {
  readonly getClient: () => ApolloClient;
}): NsfwDefaultRepository {
  return {
    async getVisibilityDefaults() {
      const result = await options.getClient().query({
        query: GlobalNsfwDefaultDocument,
        fetchPolicy: 'network-only',
      });
      const values = new Map(
        (result.data?.metas?.nodes ?? []).map((node) => [node.key, node.value]),
      );
      const mode = values.get(NSFW_DEFAULT_META_KEY);

      return {
        hideNsfw: mode === 'sfw' ? true : mode === 'nsfw' ? false : null,
        hiddenCategoryIds: parseIdList(values.get(HIDDEN_CATEGORIES_META_KEY)),
        hiddenHistoryMangaIds: parseIdList(
          values.get(HIDDEN_HISTORY_META_KEY),
        ),
      };
    },
    async setDefault(hideNsfw) {
      await setMeta(
        options.getClient,
        NSFW_DEFAULT_META_KEY,
        hideNsfw ? 'sfw' : 'nsfw',
      );
    },
    async setHiddenCategories(categoryIds) {
      await setMeta(
        options.getClient,
        HIDDEN_CATEGORIES_META_KEY,
        JSON.stringify([...new Set(categoryIds)].sort((a, b) => a - b)),
      );
    },
    async setHiddenHistory(mangaIds) {
      await setMeta(
        options.getClient,
        HIDDEN_HISTORY_META_KEY,
        JSON.stringify([...new Set(mangaIds)].sort((a, b) => a - b)),
      );
    },
  };
}

function parseIdList(value: string | undefined): number[] | null {
  if (typeof value !== 'string') {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as unknown;

    if (!Array.isArray(parsed)) {
      return null;
    }

    return parsed.filter(
      (item): item is number => Number.isSafeInteger(item) && item >= 0,
    );
  } catch {
    return null;
  }
}

async function setMeta(
  getClient: () => ApolloClient,
  key: string,
  value: string,
): Promise<void> {
  const result = await getClient().mutate({
    mutation: SetGlobalNsfwDefaultDocument,
    variables: {
      input: {
        meta: { key, value },
      },
    },
  });

  if (!result.data?.setGlobalMeta) {
    throw new Error('Default visibility could not be saved.');
  }
}
