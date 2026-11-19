import type { ApolloClient } from '@apollo/client';
import {
  GlobalNsfwDefaultDocument,
  SetGlobalNsfwDefaultDocument,
} from '../graphql/generated/graphql';

export const NSFW_DEFAULT_META_KEY = 'kakkee.nsfw-default';

export interface NsfwDefaultRepository {
  getDefault(): Promise<boolean | null>;
  setDefault(hideNsfw: boolean): Promise<void>;
}

export function createNsfwDefaultRepository(options: {
  readonly getClient: () => ApolloClient;
}): NsfwDefaultRepository {
  return {
    async getDefault() {
      const result = await options.getClient().query({
        query: GlobalNsfwDefaultDocument,
        fetchPolicy: 'network-only',
      });
      const value = result.data?.metas?.nodes.find(
        (node) => node.key === NSFW_DEFAULT_META_KEY,
      )?.value;

      if (value === 'sfw') {
        return true;
      }

      if (value === 'nsfw') {
        return false;
      }

      return null;
    },
    async setDefault(hideNsfw) {
      const result = await options.getClient().mutate({
        mutation: SetGlobalNsfwDefaultDocument,
        variables: {
          input: {
            meta: {
              key: NSFW_DEFAULT_META_KEY,
              value: hideNsfw ? 'sfw' : 'nsfw',
            },
          },
        },
      });

      if (!result.data?.setGlobalMeta) {
        throw new Error('Default NSFW mode could not be saved.');
      }
    },
  };
}
