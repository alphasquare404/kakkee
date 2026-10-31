import type { ApolloClient } from '@apollo/client';
import { print } from 'graphql';
import {
  AddExtensionStoreDocument,
  ExtensionsCatalogDocument,
  FetchExtensionsDocument,
  InstallExternalExtensionDocument,
  RemoveExtensionStoreDocument,
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
  addStore(indexUrl: string): Promise<ExtensionStore>;
  removeStore(indexUrl: string): Promise<void>;
  installExternal(file: File): Promise<void>;
}

export interface ExtensionRepositoryOptions {
  readonly getClient: () => ApolloClient;
  readonly getGraphqlUrl?: () => string;
  readonly getAccessToken?: () => string | null;
  readonly fetchImpl?: typeof fetch;
}

export function createExtensionRepository(
  options: ExtensionRepositoryOptions,
): ExtensionRepository {
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
    async addStore(indexUrl) {
      const result = await options.getClient().mutate({
        mutation: AddExtensionStoreDocument,
        variables: { input: { indexUrl } },
      });

      if (!result.data?.addExtensionStore) {
        throw new Error('Extension store could not be added.');
      }

      return result.data.addExtensionStore.extensionStore;
    },
    async removeStore(indexUrl) {
      const result = await options.getClient().mutate({
        mutation: RemoveExtensionStoreDocument,
        variables: { input: { indexUrl } },
      });

      if (!result.data?.removeExtensionStore) {
        throw new Error('Extension store could not be removed.');
      }
    },
    async installExternal(file) {
      const url = options.getGraphqlUrl?.();

      if (!url) {
        throw new Error('Extension upload endpoint is unavailable.');
      }

      const form = new FormData();
      form.append(
        'operations',
        JSON.stringify({
          query: print(InstallExternalExtensionDocument),
          variables: { input: { extensionFile: null } },
        }),
      );
      form.append(
        'map',
        JSON.stringify({ 0: ['variables.input.extensionFile'] }),
      );
      form.append('0', file);
      const token = options.getAccessToken?.();
      const response = await (options.fetchImpl ?? fetch)(url, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: form,
      });

      if (!response.ok) {
        throw new Error('Extension upload failed.');
      }

      const payload = (await response.json()) as {
        data?: { installExternalExtension?: unknown };
        errors?: readonly unknown[];
      };

      if (!payload.data?.installExternalExtension) {
        throw new Error('Extension could not be installed.');
      }
    },
  };
}
