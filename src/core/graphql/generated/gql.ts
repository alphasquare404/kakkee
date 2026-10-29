/* eslint-disable */
import * as types from './graphql';
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "query AboutServer {\n  aboutServer {\n    name\n    version\n    buildType\n    buildTime\n    platformInfo {\n      arch\n      headless\n      os {\n        name\n        version\n        build\n      }\n      jvm {\n        javaVersion\n        vmName\n        vmVersion\n        vmVendor\n      }\n    }\n  }\n}": typeof types.AboutServerDocument,
    "query AuthProbe {\n  settings {\n    authMode\n  }\n}": typeof types.AuthProbeDocument,
    "subscription DownloadStatusChanged {\n  downloadStatusChanged(input: {}) {\n    state\n    initial {\n      chapter {\n        id\n      }\n      manga {\n        id\n      }\n      state\n      progress\n    }\n    updates {\n      type\n    }\n  }\n}": typeof types.DownloadStatusChangedDocument,
    "query LibraryCategories {\n  categories(order: [{by: ORDER, byType: ASC}]) {\n    nodes {\n      id\n      name\n      order\n    }\n  }\n}": typeof types.LibraryCategoriesDocument,
    "query LibraryMangas($first: Int!, $after: Cursor, $filter: MangaFilterInput, $order: [MangaOrderInput!]) {\n  mangas(\n    condition: {inLibrary: true}\n    first: $first\n    after: $after\n    filter: $filter\n    order: $order\n  ) {\n    nodes {\n      id\n      title\n      thumbnailUrl\n      thumbnailUrlLastFetched\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n    totalCount\n  }\n}": typeof types.LibraryMangasDocument,
    "mutation Login($input: LoginInput!) {\n  login(input: $input) {\n    accessToken\n    refreshToken\n  }\n}": typeof types.LoginDocument,
    "mutation RefreshToken($input: RefreshTokenInput!) {\n  refreshToken(input: $input) {\n    accessToken\n  }\n}": typeof types.RefreshTokenDocument,
};
const documents: Documents = {
    "query AboutServer {\n  aboutServer {\n    name\n    version\n    buildType\n    buildTime\n    platformInfo {\n      arch\n      headless\n      os {\n        name\n        version\n        build\n      }\n      jvm {\n        javaVersion\n        vmName\n        vmVersion\n        vmVendor\n      }\n    }\n  }\n}": types.AboutServerDocument,
    "query AuthProbe {\n  settings {\n    authMode\n  }\n}": types.AuthProbeDocument,
    "subscription DownloadStatusChanged {\n  downloadStatusChanged(input: {}) {\n    state\n    initial {\n      chapter {\n        id\n      }\n      manga {\n        id\n      }\n      state\n      progress\n    }\n    updates {\n      type\n    }\n  }\n}": types.DownloadStatusChangedDocument,
    "query LibraryCategories {\n  categories(order: [{by: ORDER, byType: ASC}]) {\n    nodes {\n      id\n      name\n      order\n    }\n  }\n}": types.LibraryCategoriesDocument,
    "query LibraryMangas($first: Int!, $after: Cursor, $filter: MangaFilterInput, $order: [MangaOrderInput!]) {\n  mangas(\n    condition: {inLibrary: true}\n    first: $first\n    after: $after\n    filter: $filter\n    order: $order\n  ) {\n    nodes {\n      id\n      title\n      thumbnailUrl\n      thumbnailUrlLastFetched\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n    totalCount\n  }\n}": types.LibraryMangasDocument,
    "mutation Login($input: LoginInput!) {\n  login(input: $input) {\n    accessToken\n    refreshToken\n  }\n}": types.LoginDocument,
    "mutation RefreshToken($input: RefreshTokenInput!) {\n  refreshToken(input: $input) {\n    accessToken\n  }\n}": types.RefreshTokenDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query AboutServer {\n  aboutServer {\n    name\n    version\n    buildType\n    buildTime\n    platformInfo {\n      arch\n      headless\n      os {\n        name\n        version\n        build\n      }\n      jvm {\n        javaVersion\n        vmName\n        vmVersion\n        vmVendor\n      }\n    }\n  }\n}"): (typeof documents)["query AboutServer {\n  aboutServer {\n    name\n    version\n    buildType\n    buildTime\n    platformInfo {\n      arch\n      headless\n      os {\n        name\n        version\n        build\n      }\n      jvm {\n        javaVersion\n        vmName\n        vmVersion\n        vmVendor\n      }\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query AuthProbe {\n  settings {\n    authMode\n  }\n}"): (typeof documents)["query AuthProbe {\n  settings {\n    authMode\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "subscription DownloadStatusChanged {\n  downloadStatusChanged(input: {}) {\n    state\n    initial {\n      chapter {\n        id\n      }\n      manga {\n        id\n      }\n      state\n      progress\n    }\n    updates {\n      type\n    }\n  }\n}"): (typeof documents)["subscription DownloadStatusChanged {\n  downloadStatusChanged(input: {}) {\n    state\n    initial {\n      chapter {\n        id\n      }\n      manga {\n        id\n      }\n      state\n      progress\n    }\n    updates {\n      type\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query LibraryCategories {\n  categories(order: [{by: ORDER, byType: ASC}]) {\n    nodes {\n      id\n      name\n      order\n    }\n  }\n}"): (typeof documents)["query LibraryCategories {\n  categories(order: [{by: ORDER, byType: ASC}]) {\n    nodes {\n      id\n      name\n      order\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query LibraryMangas($first: Int!, $after: Cursor, $filter: MangaFilterInput, $order: [MangaOrderInput!]) {\n  mangas(\n    condition: {inLibrary: true}\n    first: $first\n    after: $after\n    filter: $filter\n    order: $order\n  ) {\n    nodes {\n      id\n      title\n      thumbnailUrl\n      thumbnailUrlLastFetched\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n    totalCount\n  }\n}"): (typeof documents)["query LibraryMangas($first: Int!, $after: Cursor, $filter: MangaFilterInput, $order: [MangaOrderInput!]) {\n  mangas(\n    condition: {inLibrary: true}\n    first: $first\n    after: $after\n    filter: $filter\n    order: $order\n  ) {\n    nodes {\n      id\n      title\n      thumbnailUrl\n      thumbnailUrlLastFetched\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n    totalCount\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation Login($input: LoginInput!) {\n  login(input: $input) {\n    accessToken\n    refreshToken\n  }\n}"): (typeof documents)["mutation Login($input: LoginInput!) {\n  login(input: $input) {\n    accessToken\n    refreshToken\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation RefreshToken($input: RefreshTokenInput!) {\n  refreshToken(input: $input) {\n    accessToken\n  }\n}"): (typeof documents)["mutation RefreshToken($input: RefreshTokenInput!) {\n  refreshToken(input: $input) {\n    accessToken\n  }\n}"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;