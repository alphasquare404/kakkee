import type { ApolloClient } from '@apollo/client';
import {
  GlobalNsfwDefaultDocument,
  SetGlobalNsfwDefaultDocument,
} from '../graphql/generated/graphql';

export const NSFW_DEFAULT_META_KEY = 'kakkee.nsfw-default';
export const HIDDEN_CATEGORIES_META_KEY = 'kakkee.hidden-category-ids';

export interface VisibilityDefaults {
  readonly hideNsfw: boolean | null;
  readonly hiddenCategoryIds: readonly number[] | null;
}

export interface NsfwDefaultRepository {
  getVisibilityDefaults(): Promise<VisibilityDefaults>;
  setDefault(hideNsfw: boolean): Promise<void>;
  setHiddenCategories(categoryIds: readonly number[]): Promise<void>;
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
      const categories = values.get(HIDDEN_CATEGORIES_META_KEY);
      let hiddenCategoryIds: number[] | null = null;

      if (typeof categories === 'string') {
        try {
          const parsed = JSON.parse(categories) as unknown;

          if (Array.isArray(parsed)) {
            hiddenCategoryIds = parsed.filter(
              (value): value is number =>
                Number.isSafeInteger(value) && value >= 0,
            );
          }
        } catch {
          hiddenCategoryIds = null;
        }
      }

      return {
        hideNsfw: mode === 'sfw' ? true : mode === 'nsfw' ? false : null,
        hiddenCategoryIds,
      };
    },
    async setDefault(hideNsfw) {
      await setMeta(options.getClient, NSFW_DEFAULT_META_KEY, hideNsfw ? 'sfw' : 'nsfw');
    },
    async setHiddenCategories(categoryIds) {
      await setMeta(
        options.getClient,
        HIDDEN_CATEGORIES_META_KEY,
        JSON.stringify([...new Set(categoryIds)].sort((a, b) => a - b)),
      );
    },
  };
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
