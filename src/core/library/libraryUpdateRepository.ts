import type { ApolloClient } from '@apollo/client';
import {
  StartLibraryUpdateDocument,
  type StartLibraryUpdateMutation,
} from '../graphql/generated/graphql';

export type LibraryUpdateInfo = NonNullable<
  StartLibraryUpdateMutation['updateLibrary']
>['updateStatus']['jobsInfo'];

export function createLibraryUpdateRepository(options: {
  readonly getClient: () => ApolloClient;
}) {
  return {
    async start(): Promise<LibraryUpdateInfo> {
      const result = await options.getClient().mutate({
        mutation: StartLibraryUpdateDocument,
        variables: { input: {} },
      });

      if (!result.data?.updateLibrary?.updateStatus) {
        throw new Error('Library update could not be started.');
      }

      return result.data.updateLibrary.updateStatus.jobsInfo;
    },
  };
}
