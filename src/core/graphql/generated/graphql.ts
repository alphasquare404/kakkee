/* eslint-disable */
/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type AuthMode =
  | 'BASIC_AUTH'
  | 'NONE'
  | 'SIMPLE_LOGIN'
  | 'UI_LOGIN';

export type BooleanFilterInput = {
  distinctFrom?: boolean | null | undefined;
  distinctFromAll?: Array<boolean> | null | undefined;
  distinctFromAny?: Array<boolean> | null | undefined;
  equalTo?: boolean | null | undefined;
  greaterThan?: boolean | null | undefined;
  greaterThanOrEqualTo?: boolean | null | undefined;
  in?: Array<boolean> | null | undefined;
  isNull?: boolean | null | undefined;
  lessThan?: boolean | null | undefined;
  lessThanOrEqualTo?: boolean | null | undefined;
  notDistinctFrom?: boolean | null | undefined;
  notEqualTo?: boolean | null | undefined;
  notEqualToAll?: Array<boolean> | null | undefined;
  notEqualToAny?: Array<boolean> | null | undefined;
  notIn?: Array<boolean> | null | undefined;
};

export type DownloadState =
  | 'DOWNLOADING'
  | 'ERROR'
  | 'FINISHED'
  | 'QUEUED';

export type DownloadUpdateType =
  | 'DEQUEUED'
  | 'ERROR'
  | 'FINISHED'
  | 'PAUSED'
  | 'POSITION'
  | 'PROGRESS'
  | 'QUEUED'
  | 'STOPPED';

export type DownloaderState =
  | 'STARTED'
  | 'STOPPED';

export type IntFilterInput = {
  distinctFrom?: number | null | undefined;
  distinctFromAll?: Array<number> | null | undefined;
  distinctFromAny?: Array<number> | null | undefined;
  equalTo?: number | null | undefined;
  greaterThan?: number | null | undefined;
  greaterThanOrEqualTo?: number | null | undefined;
  in?: Array<number> | null | undefined;
  isNull?: boolean | null | undefined;
  lessThan?: number | null | undefined;
  lessThanOrEqualTo?: number | null | undefined;
  notDistinctFrom?: number | null | undefined;
  notEqualTo?: number | null | undefined;
  notEqualToAll?: Array<number> | null | undefined;
  notEqualToAny?: Array<number> | null | undefined;
  notIn?: Array<number> | null | undefined;
};

export type LoginInput = {
  clientMutationId?: string | null | undefined;
  password: string;
  username: string;
};

export type LongFilterInput = {
  distinctFrom?: string | null | undefined;
  distinctFromAll?: Array<string> | null | undefined;
  distinctFromAny?: Array<string> | null | undefined;
  equalTo?: string | null | undefined;
  greaterThan?: string | null | undefined;
  greaterThanOrEqualTo?: string | null | undefined;
  in?: Array<string> | null | undefined;
  isNull?: boolean | null | undefined;
  lessThan?: string | null | undefined;
  lessThanOrEqualTo?: string | null | undefined;
  notDistinctFrom?: string | null | undefined;
  notEqualTo?: string | null | undefined;
  notEqualToAll?: Array<string> | null | undefined;
  notEqualToAny?: Array<string> | null | undefined;
  notIn?: Array<string> | null | undefined;
};

export type MangaFilterInput = {
  and?: Array<MangaFilterInput> | null | undefined;
  artist?: StringFilterInput | null | undefined;
  author?: StringFilterInput | null | undefined;
  categoryId?: IntFilterInput | null | undefined;
  chaptersLastFetchedAt?: LongFilterInput | null | undefined;
  description?: StringFilterInput | null | undefined;
  genre?: StringFilterInput | null | undefined;
  id?: IntFilterInput | null | undefined;
  inLibrary?: BooleanFilterInput | null | undefined;
  inLibraryAt?: LongFilterInput | null | undefined;
  initialized?: BooleanFilterInput | null | undefined;
  lastFetchedAt?: LongFilterInput | null | undefined;
  not?: MangaFilterInput | null | undefined;
  or?: Array<MangaFilterInput> | null | undefined;
  realUrl?: StringFilterInput | null | undefined;
  sourceId?: LongFilterInput | null | undefined;
  status?: MangaStatusFilterInput | null | undefined;
  thumbnailUrl?: StringFilterInput | null | undefined;
  title?: StringFilterInput | null | undefined;
  url?: StringFilterInput | null | undefined;
};

export type MangaOrderBy =
  | 'ID'
  | 'IN_LIBRARY_AT'
  | 'LAST_FETCHED_AT'
  | 'TITLE';

export type MangaOrderInput = {
  by: MangaOrderBy;
  byType?: SortOrder | null | undefined;
};

export type MangaStatus =
  | 'CANCELLED'
  | 'COMPLETED'
  | 'LICENSED'
  | 'ONGOING'
  | 'ON_HIATUS'
  | 'PUBLISHING_FINISHED'
  | 'UNKNOWN';

export type MangaStatusFilterInput = {
  distinctFrom?: MangaStatus | null | undefined;
  distinctFromAll?: Array<MangaStatus> | null | undefined;
  distinctFromAny?: Array<MangaStatus> | null | undefined;
  equalTo?: MangaStatus | null | undefined;
  greaterThan?: MangaStatus | null | undefined;
  greaterThanOrEqualTo?: MangaStatus | null | undefined;
  in?: Array<MangaStatus> | null | undefined;
  isNull?: boolean | null | undefined;
  lessThan?: MangaStatus | null | undefined;
  lessThanOrEqualTo?: MangaStatus | null | undefined;
  notDistinctFrom?: MangaStatus | null | undefined;
  notEqualTo?: MangaStatus | null | undefined;
  notEqualToAll?: Array<MangaStatus> | null | undefined;
  notEqualToAny?: Array<MangaStatus> | null | undefined;
  notIn?: Array<MangaStatus> | null | undefined;
};

export type RefreshTokenInput = {
  clientMutationId?: string | null | undefined;
  refreshToken: string;
};

export type SortOrder =
  | 'ASC'
  | 'ASC_NULLS_FIRST'
  | 'ASC_NULLS_LAST'
  | 'DESC'
  | 'DESC_NULLS_FIRST'
  | 'DESC_NULLS_LAST';

export type StringFilterInput = {
  distinctFrom?: string | null | undefined;
  distinctFromAll?: Array<string> | null | undefined;
  distinctFromAny?: Array<string> | null | undefined;
  distinctFromInsensitive?: string | null | undefined;
  distinctFromInsensitiveAll?: Array<string> | null | undefined;
  distinctFromInsensitiveAny?: Array<string> | null | undefined;
  endsWith?: string | null | undefined;
  endsWithAll?: Array<string> | null | undefined;
  endsWithAny?: Array<string> | null | undefined;
  endsWithInsensitive?: string | null | undefined;
  endsWithInsensitiveAll?: Array<string> | null | undefined;
  endsWithInsensitiveAny?: Array<string> | null | undefined;
  equalTo?: string | null | undefined;
  greaterThan?: string | null | undefined;
  greaterThanInsensitive?: string | null | undefined;
  greaterThanOrEqualTo?: string | null | undefined;
  greaterThanOrEqualToInsensitive?: string | null | undefined;
  in?: Array<string> | null | undefined;
  inInsensitive?: Array<string> | null | undefined;
  includes?: string | null | undefined;
  includesAll?: Array<string> | null | undefined;
  includesAny?: Array<string> | null | undefined;
  includesInsensitive?: string | null | undefined;
  includesInsensitiveAll?: Array<string> | null | undefined;
  includesInsensitiveAny?: Array<string> | null | undefined;
  isNull?: boolean | null | undefined;
  lessThan?: string | null | undefined;
  lessThanInsensitive?: string | null | undefined;
  lessThanOrEqualTo?: string | null | undefined;
  lessThanOrEqualToInsensitive?: string | null | undefined;
  like?: string | null | undefined;
  likeAll?: Array<string> | null | undefined;
  likeAny?: Array<string> | null | undefined;
  likeInsensitive?: string | null | undefined;
  likeInsensitiveAll?: Array<string> | null | undefined;
  likeInsensitiveAny?: Array<string> | null | undefined;
  notDistinctFrom?: string | null | undefined;
  notDistinctFromInsensitive?: string | null | undefined;
  notEndsWith?: string | null | undefined;
  notEndsWithAll?: Array<string> | null | undefined;
  notEndsWithAny?: Array<string> | null | undefined;
  notEndsWithInsensitive?: string | null | undefined;
  notEndsWithInsensitiveAll?: Array<string> | null | undefined;
  notEndsWithInsensitiveAny?: Array<string> | null | undefined;
  notEqualTo?: string | null | undefined;
  notEqualToAll?: Array<string> | null | undefined;
  notEqualToAny?: Array<string> | null | undefined;
  notIn?: Array<string> | null | undefined;
  notInInsensitive?: Array<string> | null | undefined;
  notIncludes?: string | null | undefined;
  notIncludesAll?: Array<string> | null | undefined;
  notIncludesAny?: Array<string> | null | undefined;
  notIncludesInsensitive?: string | null | undefined;
  notIncludesInsensitiveAll?: Array<string> | null | undefined;
  notIncludesInsensitiveAny?: Array<string> | null | undefined;
  notLike?: string | null | undefined;
  notLikeAll?: Array<string> | null | undefined;
  notLikeAny?: Array<string> | null | undefined;
  notLikeInsensitive?: string | null | undefined;
  notLikeInsensitiveAll?: Array<string> | null | undefined;
  notLikeInsensitiveAny?: Array<string> | null | undefined;
  notStartsWith?: string | null | undefined;
  notStartsWithAll?: Array<string> | null | undefined;
  notStartsWithAny?: Array<string> | null | undefined;
  notStartsWithInsensitive?: string | null | undefined;
  notStartsWithInsensitiveAll?: Array<string> | null | undefined;
  notStartsWithInsensitiveAny?: Array<string> | null | undefined;
  startsWith?: string | null | undefined;
  startsWithAll?: Array<string> | null | undefined;
  startsWithAny?: Array<string> | null | undefined;
  startsWithInsensitive?: string | null | undefined;
  startsWithInsensitiveAll?: Array<string> | null | undefined;
  startsWithInsensitiveAny?: Array<string> | null | undefined;
};

export type AboutServerQueryVariables = Exact<{ [key: string]: never; }>;


export type AboutServerQuery = { __typename: 'Query', aboutServer: { __typename: 'AboutServerPayload', name: string, version: string, buildType: string, buildTime: string, platformInfo: { __typename: 'PlatformInfo', arch: string, headless: boolean, os: { __typename: 'OSInfo', name: string, version: string, build: string | null }, jvm: { __typename: 'JvmInfo', javaVersion: string, vmName: string, vmVersion: string, vmVendor: string } } } };

export type AuthProbeQueryVariables = Exact<{ [key: string]: never; }>;


export type AuthProbeQuery = { __typename: 'Query', settings: { __typename: 'SettingsType', authMode: AuthMode } };

export type DownloadStatusChangedSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type DownloadStatusChangedSubscription = { __typename: 'Subscription', downloadStatusChanged: { __typename: 'DownloadUpdates', state: DownloaderState, initial: Array<{ __typename: 'DownloadType', state: DownloadState, progress: number, chapter: { __typename: 'ChapterType', id: number }, manga: { __typename: 'MangaType', id: number } }> | null, updates: Array<{ __typename: 'DownloadUpdate', type: DownloadUpdateType }> } };

export type LibraryCategoriesQueryVariables = Exact<{ [key: string]: never; }>;


export type LibraryCategoriesQuery = { __typename: 'Query', categories: { __typename: 'CategoryNodeList', nodes: Array<{ __typename: 'CategoryType', id: number, name: string, order: number }> } };

export type LibraryMangasQueryVariables = Exact<{
  first: number;
  after?: string | null | undefined;
  filter?: MangaFilterInput | null | undefined;
  order?: Array<MangaOrderInput> | MangaOrderInput | null | undefined;
}>;


export type LibraryMangasQuery = { __typename: 'Query', mangas: { __typename: 'MangaNodeList', totalCount: number, nodes: Array<{ __typename: 'MangaType', id: number, title: string, thumbnailUrl: string | null, thumbnailUrlLastFetched: string | null }>, pageInfo: { __typename: 'PageInfo', endCursor: string | null, hasNextPage: boolean } } };

export type LoginMutationVariables = Exact<{
  input: LoginInput;
}>;


export type LoginMutation = { __typename: 'Mutation', login: { __typename: 'LoginPayload', accessToken: string, refreshToken: string } };

export type RefreshTokenMutationVariables = Exact<{
  input: RefreshTokenInput;
}>;


export type RefreshTokenMutation = { __typename: 'Mutation', refreshToken: { __typename: 'RefreshTokenPayload', accessToken: string } };


export const AboutServerDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AboutServer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"aboutServer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"buildType"}},{"kind":"Field","name":{"kind":"Name","value":"buildTime"}},{"kind":"Field","name":{"kind":"Name","value":"platformInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"arch"}},{"kind":"Field","name":{"kind":"Name","value":"headless"}},{"kind":"Field","name":{"kind":"Name","value":"os"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"build"}}]}},{"kind":"Field","name":{"kind":"Name","value":"jvm"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"javaVersion"}},{"kind":"Field","name":{"kind":"Name","value":"vmName"}},{"kind":"Field","name":{"kind":"Name","value":"vmVersion"}},{"kind":"Field","name":{"kind":"Name","value":"vmVendor"}}]}}]}}]}}]}}]} as unknown as DocumentNode<AboutServerQuery, AboutServerQueryVariables>;
export const AuthProbeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AuthProbe"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"settings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"authMode"}}]}}]}}]} as unknown as DocumentNode<AuthProbeQuery, AuthProbeQueryVariables>;
export const DownloadStatusChangedDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"subscription","name":{"kind":"Name","value":"DownloadStatusChanged"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"downloadStatusChanged"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"ObjectValue","fields":[]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"initial"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"chapter"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"manga"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"progress"}}]}},{"kind":"Field","name":{"kind":"Name","value":"updates"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}}]}}]}}]}}]} as unknown as DocumentNode<DownloadStatusChangedSubscription, DownloadStatusChangedSubscriptionVariables>;
export const LibraryCategoriesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"LibraryCategories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"categories"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"order"},"value":{"kind":"ListValue","values":[{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"by"},"value":{"kind":"EnumValue","value":"ORDER"}},{"kind":"ObjectField","name":{"kind":"Name","value":"byType"},"value":{"kind":"EnumValue","value":"ASC"}}]}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"order"}}]}}]}}]}}]} as unknown as DocumentNode<LibraryCategoriesQuery, LibraryCategoriesQueryVariables>;
export const LibraryMangasDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"LibraryMangas"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Cursor"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"MangaFilterInput"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"order"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"MangaOrderInput"}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"mangas"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"condition"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"inLibrary"},"value":{"kind":"BooleanValue","value":true}}]}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}},{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}},{"kind":"Argument","name":{"kind":"Name","value":"order"},"value":{"kind":"Variable","name":{"kind":"Name","value":"order"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrlLastFetched"}}]}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"endCursor"}},{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalCount"}}]}}]}}]} as unknown as DocumentNode<LibraryMangasQuery, LibraryMangasQueryVariables>;
export const LoginDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Login"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"LoginInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"accessToken"}},{"kind":"Field","name":{"kind":"Name","value":"refreshToken"}}]}}]}}]} as unknown as DocumentNode<LoginMutation, LoginMutationVariables>;
export const RefreshTokenDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RefreshToken"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RefreshTokenInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"refreshToken"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"accessToken"}}]}}]}}]} as unknown as DocumentNode<RefreshTokenMutation, RefreshTokenMutationVariables>;