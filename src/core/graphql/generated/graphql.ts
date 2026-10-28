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

export type LoginInput = {
  clientMutationId?: string | null | undefined;
  password: string;
  username: string;
};

export type RefreshTokenInput = {
  clientMutationId?: string | null | undefined;
  refreshToken: string;
};

export type AboutServerQueryVariables = Exact<{ [key: string]: never; }>;


export type AboutServerQuery = { __typename: 'Query', aboutServer: { __typename: 'AboutServerPayload', name: string, version: string, buildType: string, buildTime: string, platformInfo: { __typename: 'PlatformInfo', arch: string, headless: boolean, os: { __typename: 'OSInfo', name: string, version: string, build: string | null }, jvm: { __typename: 'JvmInfo', javaVersion: string, vmName: string, vmVersion: string, vmVendor: string } } } };

export type AuthProbeQueryVariables = Exact<{ [key: string]: never; }>;


export type AuthProbeQuery = { __typename: 'Query', settings: { __typename: 'SettingsType', authMode: AuthMode } };

export type DownloadStatusChangedSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type DownloadStatusChangedSubscription = { __typename: 'Subscription', downloadStatusChanged: { __typename: 'DownloadUpdates', state: DownloaderState, initial: Array<{ __typename: 'DownloadType', state: DownloadState, progress: number, chapter: { __typename: 'ChapterType', id: number }, manga: { __typename: 'MangaType', id: number } }> | null, updates: Array<{ __typename: 'DownloadUpdate', type: DownloadUpdateType }> } };

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
export const LoginDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Login"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"LoginInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"accessToken"}},{"kind":"Field","name":{"kind":"Name","value":"refreshToken"}}]}}]}}]} as unknown as DocumentNode<LoginMutation, LoginMutationVariables>;
export const RefreshTokenDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RefreshToken"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RefreshTokenInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"refreshToken"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"accessToken"}}]}}]}}]} as unknown as DocumentNode<RefreshTokenMutation, RefreshTokenMutationVariables>;