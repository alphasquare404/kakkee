import type { ApolloClient } from '@apollo/client';
import {
  ExtensionsCatalogDocument,
  FetchExtensionsDocument,
  UpdateExtensionsDocument,
  type ExtensionsCatalogQuery,
  type FetchExtensionsMutation,
  type UpdateExtensionPatchInput,
} from '../graphql/generated/graphql';

export type Extension =
  ExtensionsCatalogQuery['extensions']['nodes'][number];
export type ExtensionStore =
  NonNullable<FetchExtensionsMutation['fetchExtensions']>['extensionStores'][number];

export interface ExtensionRepository {
  getExtensions(): Promise<readonly Extension[]>;
  refresh(): Promise<{
    readonly extensions: readonly Extension[];
    readonly stores: readonly ExtensionStore[];
  }>;
  update(
    pkgName: string,
    patch: UpdateExtensionPatchInput,
  ): Promise<readonly {
    pkgName: string;
    isInstalled: boolean;
    hasUpdate: boolean;
  }[]>;
}

export function createExtensionRepository(options: {
  readonly getClient: () => ApolloClient;
}): ExtensionRepository {
  return {
    async getExtensions() {
      const result = await options.getClient().query({
        query: ExtensionsCatalogDocument,
        fetchPolicy: 'network-only',
      });

      if (!result.data?.extensions) {
        throw new Error('Extensions are unavailable.');
      }

      return result.data.extensions.nodes;
    },
    async refresh() {
      const result = await options.getClient().mutate({
        mutation: FetchExtensionsDocument,
      });

      if (!result.data?.fetchExtensions) {
        throw new Error('Extensions could not be refreshed.');
      }

      return {
        extensions: result.data.fetchExtensions.extensions,
        stores: result.data.fetchExtensions.extensionStores,
      };
    },
    async update(pkgName, patch) {
      const result = await options.getClient().mutate({
        mutation: UpdateExtensionsDocument,
        variables: { input: { ids: [pkgName], patch } },
      });

      if (!result.data?.updateExtensions) {
        throw new Error('Extension change was rejected.');
      }

      return result.data.updateExtensions.extensions;
    },
  };
}
