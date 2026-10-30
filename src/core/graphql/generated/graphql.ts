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

export type CbzMediaType =
  | 'COMPATIBLE'
  | 'LEGACY'
  | 'MODERN';

export type ChapterFilterInput = {
  and?: Array<ChapterFilterInput> | null | undefined;
  chapterNumber?: DoubleFilterInput | null | undefined;
  fetchedAt?: LongFilterInput | null | undefined;
  id?: IntFilterInput | null | undefined;
  inLibrary?: BooleanFilterInput | null | undefined;
  isBookmarked?: BooleanFilterInput | null | undefined;
  isDownloaded?: BooleanFilterInput | null | undefined;
  isRead?: BooleanFilterInput | null | undefined;
  lastPageRead?: IntFilterInput | null | undefined;
  lastReadAt?: LongFilterInput | null | undefined;
  mangaId?: IntFilterInput | null | undefined;
  name?: StringFilterInput | null | undefined;
  not?: ChapterFilterInput | null | undefined;
  or?: Array<ChapterFilterInput> | null | undefined;
  pageCount?: IntFilterInput | null | undefined;
  realUrl?: StringFilterInput | null | undefined;
  scanlator?: StringFilterInput | null | undefined;
  sourceOrder?: IntFilterInput | null | undefined;
  uploadDate?: LongFilterInput | null | undefined;
  url?: StringFilterInput | null | undefined;
};

export type ChapterOrderBy =
  | 'CHAPTER_NUMBER'
  | 'FETCHED_AT'
  | 'ID'
  | 'LAST_READ_AT'
  | 'NAME'
  | 'SOURCE_ORDER'
  | 'UPLOAD_DATE';

export type ChapterOrderInput = {
  by: ChapterOrderBy;
  byType?: SortOrder | null | undefined;
};

export type ContentWarning =
  | 'MIXED'
  | 'NSFW'
  | 'SAFE';

export type CreateCategoryInput = {
  clientMutationId?: string | null | undefined;
  default?: boolean | null | undefined;
  includeInDownload?: IncludeOrExclude | null | undefined;
  includeInUpdate?: IncludeOrExclude | null | undefined;
  name: string;
  order?: number | null | undefined;
};

export type DatabaseType =
  | 'H2'
  | 'POSTGRESQL';

export type DeleteCategoryInput = {
  categoryId: number;
  clientMutationId?: string | null | undefined;
};

export type DeleteDownloadedChapterInput = {
  clientMutationId?: string | null | undefined;
  id: number;
};

export type DeleteDownloadedChaptersInput = {
  clientMutationId?: string | null | undefined;
  ids: Array<number>;
};

export type DequeueChapterDownloadInput = {
  clientMutationId?: string | null | undefined;
  id: number;
};

export type DoubleFilterInput = {
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

export type EnqueueChapterDownloadInput = {
  clientMutationId?: string | null | undefined;
  id: number;
};

export type EnqueueChapterDownloadsInput = {
  clientMutationId?: string | null | undefined;
  ids: Array<number>;
};

export type FetchChapterPagesInput = {
  chapterId: number;
  clientMutationId?: string | null | undefined;
  format?: string | null | undefined;
};

export type IncludeOrExclude =
  | 'EXCLUDE'
  | 'INCLUDE'
  | 'UNSET';

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

export type KoreaderSyncChecksumMethod =
  | 'BINARY'
  | 'FILENAME';

export type KoreaderSyncConflictStrategy =
  | 'DISABLED'
  | 'KEEP_LOCAL'
  | 'KEEP_REMOTE'
  | 'PROMPT';

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

export type PartialSettingsTypeInput = {
  authMode?: AuthMode | null | undefined;
  authPassword?: string | null | undefined;
  authUsername?: string | null | undefined;
  autoBackupIncludeCategories?: boolean | null | undefined;
  autoBackupIncludeChapters?: boolean | null | undefined;
  autoBackupIncludeClientData?: boolean | null | undefined;
  autoBackupIncludeHistory?: boolean | null | undefined;
  autoBackupIncludeManga?: boolean | null | undefined;
  autoBackupIncludeServerSettings?: boolean | null | undefined;
  autoBackupIncludeTracking?: boolean | null | undefined;
  autoDownloadIgnoreReUploads?: boolean | null | undefined;
  autoDownloadNewChapters?: boolean | null | undefined;
  autoDownloadNewChaptersLimit?: number | null | undefined;
  backupInterval?: number | null | undefined;
  backupPath?: string | null | undefined;
  backupTTL?: number | null | undefined;
  backupTime?: string | null | undefined;
  databasePassword?: string | null | undefined;
  databaseType?: DatabaseType | null | undefined;
  databaseUrl?: string | null | undefined;
  databaseUsername?: string | null | undefined;
  debugLogsEnabled?: boolean | null | undefined;
  downloadAsCbz?: boolean | null | undefined;
  downloadConversions?: Array<SettingsDownloadConversionTypeInput> | null | undefined;
  downloadsPath?: string | null | undefined;
  electronPath?: string | null | undefined;
  excludeCompleted?: boolean | null | undefined;
  excludeEntryWithUnreadChapters?: boolean | null | undefined;
  excludeNotStarted?: boolean | null | undefined;
  excludeUnreadChapters?: boolean | null | undefined;
  flareSolverrAsResponseFallback?: boolean | null | undefined;
  flareSolverrEnabled?: boolean | null | undefined;
  flareSolverrSessionName?: string | null | undefined;
  flareSolverrSessionTtl?: number | null | undefined;
  flareSolverrTimeout?: number | null | undefined;
  flareSolverrUrl?: string | null | undefined;
  globalUpdateInterval?: number | null | undefined;
  initialOpenInBrowserEnabled?: boolean | null | undefined;
  ip?: string | null | undefined;
  jwtAudience?: string | null | undefined;
  jwtRefreshExpiry?: string | null | undefined;
  jwtTokenExpiry?: string | null | undefined;
  kcefEnabled?: boolean | null | undefined;
  koreaderSyncChecksumMethod?: KoreaderSyncChecksumMethod | null | undefined;
  koreaderSyncPercentageTolerance?: number | null | undefined;
  koreaderSyncStrategyBackward?: KoreaderSyncConflictStrategy | null | undefined;
  koreaderSyncStrategyForward?: KoreaderSyncConflictStrategy | null | undefined;
  localSourcePath?: string | null | undefined;
  maxLogFileSize?: string | null | undefined;
  maxLogFiles?: number | null | undefined;
  maxLogFolderSize?: string | null | undefined;
  maxSourcesInParallel?: number | null | undefined;
  opdsCbzMimetype?: CbzMediaType | null | undefined;
  opdsChapterSortOrder?: SortOrder | null | undefined;
  opdsEnablePageReadProgress?: boolean | null | undefined;
  opdsItemsPerPage?: number | null | undefined;
  opdsMarkAsReadOnDownload?: boolean | null | undefined;
  opdsShowOnlyDownloadedChapters?: boolean | null | undefined;
  opdsShowOnlyUnreadChapters?: boolean | null | undefined;
  opdsSkipChapterMetadataFeed?: boolean | null | undefined;
  opdsUseBinaryFileSizes?: boolean | null | undefined;
  port?: number | null | undefined;
  serveConversions?: Array<SettingsDownloadConversionTypeInput> | null | undefined;
  socksProxyEnabled?: boolean | null | undefined;
  socksProxyHost?: string | null | undefined;
  socksProxyPassword?: string | null | undefined;
  socksProxyPort?: string | null | undefined;
  socksProxyUsername?: string | null | undefined;
  socksProxyVersion?: number | null | undefined;
  syncDataCategories?: boolean | null | undefined;
  syncDataChapters?: boolean | null | undefined;
  syncDataHistory?: boolean | null | undefined;
  syncDataManga?: boolean | null | undefined;
  syncDataTracking?: boolean | null | undefined;
  syncInterval?: string | null | undefined;
  syncYomiApiKey?: string | null | undefined;
  syncYomiEnabled?: boolean | null | undefined;
  syncYomiHost?: string | null | undefined;
  systemTrayEnabled?: boolean | null | undefined;
  updateMangas?: boolean | null | undefined;
  useHikariConnectionPool?: boolean | null | undefined;
  webUIChannel?: WebUiChannel | null | undefined;
  webUIFlavor?: WebUiFlavor | null | undefined;
  webUIInterface?: WebUiInterface | null | undefined;
  webUIUpdateCheckInterval?: number | null | undefined;
};

export type RefreshTokenInput = {
  clientMutationId?: string | null | undefined;
  refreshToken: string;
};

export type SettingsDownloadConversionHeaderTypeInput = {
  name: string;
  value: string;
};

export type SettingsDownloadConversionTypeInput = {
  callTimeout?: string | null | undefined;
  compressionLevel?: number | null | undefined;
  connectTimeout?: string | null | undefined;
  headers?: Array<SettingsDownloadConversionHeaderTypeInput> | null | undefined;
  mimeType: string;
  target: string;
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

export type UpdateCategoryInput = {
  clientMutationId?: string | null | undefined;
  id: number;
  patch: UpdateCategoryPatchInput;
};

export type UpdateCategoryOrderInput = {
  clientMutationId?: string | null | undefined;
  id: number;
  position: number;
};

export type UpdateCategoryPatchInput = {
  default?: boolean | null | undefined;
  includeInDownload?: IncludeOrExclude | null | undefined;
  includeInUpdate?: IncludeOrExclude | null | undefined;
  name?: string | null | undefined;
};

export type UpdateChapterInput = {
  clientMutationId?: string | null | undefined;
  id: number;
  patch: UpdateChapterPatchInput;
};

export type UpdateChapterPatchInput = {
  isBookmarked?: boolean | null | undefined;
  isRead?: boolean | null | undefined;
  lastPageRead?: number | null | undefined;
};

export type UpdateChaptersInput = {
  clientMutationId?: string | null | undefined;
  ids: Array<number>;
  patch: UpdateChapterPatchInput;
};

export type UpdateMangaCategoriesPatchInput = {
  addToCategories?: Array<number> | null | undefined;
  clearCategories?: boolean | null | undefined;
  removeFromCategories?: Array<number> | null | undefined;
};

export type UpdateMangaInput = {
  clientMutationId?: string | null | undefined;
  id: number;
  patch: UpdateMangaPatchInput;
};

export type UpdateMangaPatchInput = {
  inLibrary?: boolean | null | undefined;
};

export type UpdateMangasCategoriesInput = {
  clientMutationId?: string | null | undefined;
  ids: Array<number>;
  patch: UpdateMangaCategoriesPatchInput;
};

export type UpdateMangasInput = {
  clientMutationId?: string | null | undefined;
  ids: Array<number>;
  patch: UpdateMangaPatchInput;
};

export type WebUiChannel =
  | 'BUNDLED'
  | 'PREVIEW'
  | 'STABLE';

export type WebUiFlavor =
  | 'CUSTOM'
  | 'VUI'
  | 'WEBUI';

export type WebUiInterface =
  | 'BROWSER'
  | 'ELECTRON';

export type AboutServerQueryVariables = Exact<{ [key: string]: never; }>;


export type AboutServerQuery = { __typename: 'Query', aboutServer: { __typename: 'AboutServerPayload', name: string, version: string, buildType: string, buildTime: string, platformInfo: { __typename: 'PlatformInfo', arch: string, headless: boolean, os: { __typename: 'OSInfo', name: string, version: string, build: string | null }, jvm: { __typename: 'JvmInfo', javaVersion: string, vmName: string, vmVersion: string, vmVendor: string } } } };

export type AuthProbeQueryVariables = Exact<{ [key: string]: never; }>;


export type AuthProbeQuery = { __typename: 'Query', settings: { __typename: 'SettingsType', authMode: AuthMode } };

export type CategoryCatalogQueryVariables = Exact<{ [key: string]: never; }>;


export type CategoryCatalogQuery = { __typename: 'Query', categories: { __typename: 'CategoryNodeList', nodes: Array<{ __typename: 'CategoryType', id: number, name: string, default: boolean, isDefaultCategory: boolean, order: number, mangas: { __typename: 'MangaNodeList', totalCount: number } }> } };

export type ChapterFeedQueryVariables = Exact<{
  first: number;
  filter?: ChapterFilterInput | null | undefined;
  order: Array<ChapterOrderInput> | ChapterOrderInput;
}>;


export type ChapterFeedQuery = { __typename: 'Query', chapters: { __typename: 'ChapterNodeList', totalCount: number, nodes: Array<{ __typename: 'ChapterType', id: number, name: string, chapterNumber: number, pageCount: number, isRead: boolean, isDownloaded: boolean, lastPageRead: number, lastReadAt: string, uploadDate: string, manga: { __typename: 'MangaType', id: number, title: string, thumbnailUrl: string | null } }> } };

export type CreateCategoryMutationVariables = Exact<{
  input: CreateCategoryInput;
}>;


export type CreateCategoryMutation = { __typename: 'Mutation', createCategory: { __typename: 'CreateCategoryPayload', category: { __typename: 'CategoryType', id: number, name: string, default: boolean, isDefaultCategory: boolean, order: number, mangas: { __typename: 'MangaNodeList', totalCount: number } } } | null };

export type DeleteCategoryMutationVariables = Exact<{
  input: DeleteCategoryInput;
}>;


export type DeleteCategoryMutation = { __typename: 'Mutation', deleteCategory: { __typename: 'DeleteCategoryPayload', category: { __typename: 'CategoryType', id: number } | null } | null };

export type DeleteDownloadedChapterMutationVariables = Exact<{
  input: DeleteDownloadedChapterInput;
}>;


export type DeleteDownloadedChapterMutation = { __typename: 'Mutation', deleteDownloadedChapter: { __typename: 'DeleteDownloadedChapterPayload', chapters: { __typename: 'ChapterType', id: number, isDownloaded: boolean } } | null };

export type DeleteDownloadedChaptersMutationVariables = Exact<{
  input: DeleteDownloadedChaptersInput;
}>;


export type DeleteDownloadedChaptersMutation = { __typename: 'Mutation', deleteDownloadedChapters: { __typename: 'DeleteDownloadedChaptersPayload', chapters: Array<{ __typename: 'ChapterType', id: number, isDownloaded: boolean }> } | null };

export type DequeueDownloadMutationVariables = Exact<{
  input: DequeueChapterDownloadInput;
}>;


export type DequeueDownloadMutation = { __typename: 'Mutation', dequeueChapterDownload: { __typename: 'DequeueChapterDownloadPayload', downloadStatus: { __typename: 'DownloadStatus', state: DownloaderState } } | null };

export type DownloadQueueQueryVariables = Exact<{ [key: string]: never; }>;


export type DownloadQueueQuery = { __typename: 'Query', downloadStatus: { __typename: 'DownloadStatus', state: DownloaderState, queue: Array<{ __typename: 'DownloadType', position: number, progress: number, state: DownloadState, tries: number, chapter: { __typename: 'ChapterType', id: number, name: string, pageCount: number }, manga: { __typename: 'MangaType', id: number, title: string, thumbnailUrl: string | null } }> } };

export type DownloadStatusChangedSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type DownloadStatusChangedSubscription = { __typename: 'Subscription', downloadStatusChanged: { __typename: 'DownloadUpdates', state: DownloaderState, initial: Array<{ __typename: 'DownloadType', state: DownloadState, progress: number, chapter: { __typename: 'ChapterType', id: number }, manga: { __typename: 'MangaType', id: number } }> | null, updates: Array<{ __typename: 'DownloadUpdate', type: DownloadUpdateType }> } };

export type EnqueueChapterDownloadsMutationVariables = Exact<{
  input: EnqueueChapterDownloadsInput;
}>;


export type EnqueueChapterDownloadsMutation = { __typename: 'Mutation', enqueueChapterDownloads: { __typename: 'EnqueueChapterDownloadsPayload', downloadStatus: { __typename: 'DownloadStatus', state: DownloaderState } } | null };

export type EnqueueDownloadMutationVariables = Exact<{
  input: EnqueueChapterDownloadInput;
}>;


export type EnqueueDownloadMutation = { __typename: 'Mutation', enqueueChapterDownload: { __typename: 'EnqueueChapterDownloadPayload', downloadStatus: { __typename: 'DownloadStatus', state: DownloaderState } } | null };

export type FetchChapterPagesMutationVariables = Exact<{
  input: FetchChapterPagesInput;
}>;


export type FetchChapterPagesMutation = { __typename: 'Mutation', fetchChapterPages: { __typename: 'FetchChapterPagesPayload', pages: Array<string>, chapter: { __typename: 'ChapterType', id: number, pageCount: number } } | null };

export type LibraryCategoriesQueryVariables = Exact<{ [key: string]: never; }>;


export type LibraryCategoriesQuery = { __typename: 'Query', categories: { __typename: 'CategoryNodeList', nodes: Array<{ __typename: 'CategoryType', id: number, name: string, order: number, mangas: { __typename: 'MangaNodeList', totalCount: number } }> } };

export type LibraryMangasQueryVariables = Exact<{
  first: number;
  after?: string | null | undefined;
  filter?: MangaFilterInput | null | undefined;
  order?: Array<MangaOrderInput> | MangaOrderInput | null | undefined;
}>;


export type LibraryMangasQuery = { __typename: 'Query', mangas: { __typename: 'MangaNodeList', totalCount: number, nodes: Array<{ __typename: 'MangaType', id: number, title: string, thumbnailUrl: string | null, thumbnailUrlLastFetched: string | null, unreadCount: number, downloadCount: number }>, pageInfo: { __typename: 'PageInfo', endCursor: string | null, hasNextPage: boolean } } };

export type LoginMutationVariables = Exact<{
  input: LoginInput;
}>;


export type LoginMutation = { __typename: 'Mutation', login: { __typename: 'LoginPayload', accessToken: string, refreshToken: string } };

export type MangaChapterIdsQueryVariables = Exact<{
  mangaId: number;
}>;


export type MangaChapterIdsQuery = { __typename: 'Query', chapters: { __typename: 'ChapterNodeList', nodes: Array<{ __typename: 'ChapterType', id: number }> } };

export type MangaDetailQueryVariables = Exact<{
  mangaId: number;
  first: number;
  after?: string | null | undefined;
  order?: Array<ChapterOrderInput> | ChapterOrderInput | null | undefined;
}>;


export type MangaDetailQuery = { __typename: 'Query', manga: { __typename: 'MangaType', id: number, title: string, author: string | null, artist: string | null, description: string | null, status: MangaStatus, thumbnailUrl: string | null, thumbnailUrlLastFetched: string | null, genre: Array<string>, inLibrary: boolean, source: { __typename: 'SourceType', id: string, name: string } | null }, chapters: { __typename: 'ChapterNodeList', totalCount: number, nodes: Array<{ __typename: 'ChapterType', id: number, name: string, chapterNumber: number, pageCount: number, isRead: boolean, isBookmarked: boolean, isDownloaded: boolean, lastPageRead: number, scanlator: string | null, uploadDate: string, sourceOrder: number }>, pageInfo: { __typename: 'PageInfo', endCursor: string | null, hasNextPage: boolean } } };

export type ReaderChapterQueryVariables = Exact<{
  chapterId: number;
}>;


export type ReaderChapterQuery = { __typename: 'Query', chapter: { __typename: 'ChapterType', id: number, name: string, pageCount: number, chapterNumber: number, sourceOrder: number, isRead: boolean, lastPageRead: number, manga: { __typename: 'MangaType', id: number, title: string, thumbnailUrl: string | null } } };

export type ReaderChapterListQueryVariables = Exact<{
  mangaId: number;
}>;


export type ReaderChapterListQuery = { __typename: 'Query', chapters: { __typename: 'ChapterNodeList', nodes: Array<{ __typename: 'ChapterType', id: number, name: string, chapterNumber: number, isRead: boolean }> } };

export type ReaderNeighborsQueryVariables = Exact<{
  mangaId: number;
  chapterNumber: number;
}>;


export type ReaderNeighborsQuery = { __typename: 'Query', previous: { __typename: 'ChapterNodeList', nodes: Array<{ __typename: 'ChapterType', id: number, name: string, chapterNumber: number }> }, next: { __typename: 'ChapterNodeList', nodes: Array<{ __typename: 'ChapterType', id: number, name: string, chapterNumber: number }> } };

export type RefreshTokenMutationVariables = Exact<{
  input: RefreshTokenInput;
}>;


export type RefreshTokenMutation = { __typename: 'Mutation', refreshToken: { __typename: 'RefreshTokenPayload', accessToken: string } };

export type ServerSettingsQueryVariables = Exact<{ [key: string]: never; }>;


export type ServerSettingsQuery = { __typename: 'Query', settings: { __typename: 'SettingsType', authMode: AuthMode, databaseType: DatabaseType, updateMangas: boolean, autoDownloadNewChapters: boolean, autoDownloadNewChaptersLimit: number, downloadAsCbz: boolean, downloadsPath: string, maxSourcesInParallel: number, globalUpdateInterval: number, excludeCompleted: boolean, excludeNotStarted: boolean, excludeUnreadChapters: boolean, excludeEntryWithUnreadChapters: boolean, debugLogsEnabled: boolean, backupPath: string, backupInterval: number, webUIChannel: WebUiChannel, webUIFlavor: WebUiFlavor, webUIInterface: WebUiInterface } };

export type SourceCatalogQueryVariables = Exact<{
  first: number;
}>;


export type SourceCatalogQuery = { __typename: 'Query', sources: { __typename: 'SourceNodeList', totalCount: number, nodes: Array<{ __typename: 'SourceType', id: string, name: string, displayName: string, lang: string, isNsfw: boolean, contentWarning: ContentWarning, supportsLatest: boolean, iconUrl: string }> } };

export type StartDownloaderMutationVariables = Exact<{ [key: string]: never; }>;


export type StartDownloaderMutation = { __typename: 'Mutation', startDownloader: { __typename: 'StartDownloaderPayload', downloadStatus: { __typename: 'DownloadStatus', state: DownloaderState } } | null };

export type StopDownloaderMutationVariables = Exact<{ [key: string]: never; }>;


export type StopDownloaderMutation = { __typename: 'Mutation', stopDownloader: { __typename: 'StopDownloaderPayload', downloadStatus: { __typename: 'DownloadStatus', state: DownloaderState } } | null };

export type UpdateCategoryMutationVariables = Exact<{
  input: UpdateCategoryInput;
}>;


export type UpdateCategoryMutation = { __typename: 'Mutation', updateCategory: { __typename: 'UpdateCategoryPayload', category: { __typename: 'CategoryType', id: number, name: string, default: boolean, isDefaultCategory: boolean, order: number, mangas: { __typename: 'MangaNodeList', totalCount: number } } } | null };

export type UpdateCategoryOrderMutationVariables = Exact<{
  input: UpdateCategoryOrderInput;
}>;


export type UpdateCategoryOrderMutation = { __typename: 'Mutation', updateCategoryOrder: { __typename: 'UpdateCategoryOrderPayload', categories: Array<{ __typename: 'CategoryType', id: number, order: number }> } | null };

export type UpdateChapterProgressMutationVariables = Exact<{
  input: UpdateChapterInput;
}>;


export type UpdateChapterProgressMutation = { __typename: 'Mutation', updateChapter: { __typename: 'UpdateChapterPayload', chapter: { __typename: 'ChapterType', id: number, isRead: boolean, isBookmarked: boolean, lastPageRead: number } } | null };

export type UpdateChaptersStateMutationVariables = Exact<{
  input: UpdateChaptersInput;
}>;


export type UpdateChaptersStateMutation = { __typename: 'Mutation', updateChapters: { __typename: 'UpdateChaptersPayload', chapters: Array<{ __typename: 'ChapterType', id: number, isRead: boolean, isBookmarked: boolean, isDownloaded: boolean }> } | null };

export type UpdateMangaLibraryMutationVariables = Exact<{
  input: UpdateMangaInput;
}>;


export type UpdateMangaLibraryMutation = { __typename: 'Mutation', updateManga: { __typename: 'UpdateMangaPayload', manga: { __typename: 'MangaType', id: number, inLibrary: boolean } } | null };

export type UpdateMangasCategoriesMutationVariables = Exact<{
  input: UpdateMangasCategoriesInput;
}>;


export type UpdateMangasCategoriesMutation = { __typename: 'Mutation', updateMangasCategories: { __typename: 'UpdateMangasCategoriesPayload', mangas: Array<{ __typename: 'MangaType', id: number }> } | null };

export type UpdateMangasLibraryMutationVariables = Exact<{
  input: UpdateMangasInput;
}>;


export type UpdateMangasLibraryMutation = { __typename: 'Mutation', updateMangas: { __typename: 'UpdateMangasPayload', mangas: Array<{ __typename: 'MangaType', id: number, inLibrary: boolean }> } | null };

export type UpdateServerSettingsMutationVariables = Exact<{
  settings: PartialSettingsTypeInput;
}>;


export type UpdateServerSettingsMutation = { __typename: 'Mutation', setSettings: { __typename: 'SetSettingsPayload', settings: { __typename: 'SettingsType', updateMangas: boolean, autoDownloadNewChapters: boolean, autoDownloadNewChaptersLimit: number, downloadAsCbz: boolean, maxSourcesInParallel: number, globalUpdateInterval: number, excludeCompleted: boolean, excludeNotStarted: boolean, excludeUnreadChapters: boolean, excludeEntryWithUnreadChapters: boolean, debugLogsEnabled: boolean } } };


export const AboutServerDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AboutServer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"aboutServer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"buildType"}},{"kind":"Field","name":{"kind":"Name","value":"buildTime"}},{"kind":"Field","name":{"kind":"Name","value":"platformInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"arch"}},{"kind":"Field","name":{"kind":"Name","value":"headless"}},{"kind":"Field","name":{"kind":"Name","value":"os"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"build"}}]}},{"kind":"Field","name":{"kind":"Name","value":"jvm"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"javaVersion"}},{"kind":"Field","name":{"kind":"Name","value":"vmName"}},{"kind":"Field","name":{"kind":"Name","value":"vmVersion"}},{"kind":"Field","name":{"kind":"Name","value":"vmVendor"}}]}}]}}]}}]}}]} as unknown as DocumentNode<AboutServerQuery, AboutServerQueryVariables>;
export const AuthProbeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AuthProbe"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"settings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"authMode"}}]}}]}}]} as unknown as DocumentNode<AuthProbeQuery, AuthProbeQueryVariables>;
export const CategoryCatalogDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CategoryCatalog"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"categories"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"order"},"value":{"kind":"ListValue","values":[{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"by"},"value":{"kind":"EnumValue","value":"ORDER"}},{"kind":"ObjectField","name":{"kind":"Name","value":"byType"},"value":{"kind":"EnumValue","value":"ASC"}}]}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"default"}},{"kind":"Field","name":{"kind":"Name","value":"isDefaultCategory"}},{"kind":"Field","name":{"kind":"Name","value":"order"}},{"kind":"Field","name":{"kind":"Name","value":"mangas"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}}]}}]}}]}}]}}]} as unknown as DocumentNode<CategoryCatalogQuery, CategoryCatalogQueryVariables>;
export const ChapterFeedDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ChapterFeed"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ChapterFilterInput"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"order"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ChapterOrderInput"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"chapters"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}},{"kind":"Argument","name":{"kind":"Name","value":"order"},"value":{"kind":"Variable","name":{"kind":"Name","value":"order"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"chapterNumber"}},{"kind":"Field","name":{"kind":"Name","value":"pageCount"}},{"kind":"Field","name":{"kind":"Name","value":"isRead"}},{"kind":"Field","name":{"kind":"Name","value":"isDownloaded"}},{"kind":"Field","name":{"kind":"Name","value":"lastPageRead"}},{"kind":"Field","name":{"kind":"Name","value":"lastReadAt"}},{"kind":"Field","name":{"kind":"Name","value":"uploadDate"}},{"kind":"Field","name":{"kind":"Name","value":"manga"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalCount"}}]}}]}}]} as unknown as DocumentNode<ChapterFeedQuery, ChapterFeedQueryVariables>;
export const CreateCategoryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateCategory"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateCategoryInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createCategory"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"default"}},{"kind":"Field","name":{"kind":"Name","value":"isDefaultCategory"}},{"kind":"Field","name":{"kind":"Name","value":"order"}},{"kind":"Field","name":{"kind":"Name","value":"mangas"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}}]}}]}}]}}]}}]} as unknown as DocumentNode<CreateCategoryMutation, CreateCategoryMutationVariables>;
export const DeleteCategoryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteCategory"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DeleteCategoryInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteCategory"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]} as unknown as DocumentNode<DeleteCategoryMutation, DeleteCategoryMutationVariables>;
export const DeleteDownloadedChapterDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteDownloadedChapter"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DeleteDownloadedChapterInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteDownloadedChapter"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"chapters"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isDownloaded"}}]}}]}}]}}]} as unknown as DocumentNode<DeleteDownloadedChapterMutation, DeleteDownloadedChapterMutationVariables>;
export const DeleteDownloadedChaptersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteDownloadedChapters"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DeleteDownloadedChaptersInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteDownloadedChapters"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"chapters"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isDownloaded"}}]}}]}}]}}]} as unknown as DocumentNode<DeleteDownloadedChaptersMutation, DeleteDownloadedChaptersMutationVariables>;
export const DequeueDownloadDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DequeueDownload"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DequeueChapterDownloadInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"dequeueChapterDownload"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"downloadStatus"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"state"}}]}}]}}]}}]} as unknown as DocumentNode<DequeueDownloadMutation, DequeueDownloadMutationVariables>;
export const DownloadQueueDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"DownloadQueue"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"downloadStatus"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"queue"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"position"}},{"kind":"Field","name":{"kind":"Name","value":"progress"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"tries"}},{"kind":"Field","name":{"kind":"Name","value":"chapter"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"pageCount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"manga"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}}]}}]}}]}}]}}]} as unknown as DocumentNode<DownloadQueueQuery, DownloadQueueQueryVariables>;
export const DownloadStatusChangedDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"subscription","name":{"kind":"Name","value":"DownloadStatusChanged"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"downloadStatusChanged"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"ObjectValue","fields":[]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"initial"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"chapter"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"manga"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"progress"}}]}},{"kind":"Field","name":{"kind":"Name","value":"updates"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}}]}}]}}]}}]} as unknown as DocumentNode<DownloadStatusChangedSubscription, DownloadStatusChangedSubscriptionVariables>;
export const EnqueueChapterDownloadsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"EnqueueChapterDownloads"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"EnqueueChapterDownloadsInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"enqueueChapterDownloads"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"downloadStatus"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"state"}}]}}]}}]}}]} as unknown as DocumentNode<EnqueueChapterDownloadsMutation, EnqueueChapterDownloadsMutationVariables>;
export const EnqueueDownloadDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"EnqueueDownload"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"EnqueueChapterDownloadInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"enqueueChapterDownload"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"downloadStatus"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"state"}}]}}]}}]}}]} as unknown as DocumentNode<EnqueueDownloadMutation, EnqueueDownloadMutationVariables>;
export const FetchChapterPagesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"FetchChapterPages"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"FetchChapterPagesInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fetchChapterPages"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"chapter"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"pageCount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"pages"}}]}}]}}]} as unknown as DocumentNode<FetchChapterPagesMutation, FetchChapterPagesMutationVariables>;
export const LibraryCategoriesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"LibraryCategories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"categories"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"order"},"value":{"kind":"ListValue","values":[{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"by"},"value":{"kind":"EnumValue","value":"ORDER"}},{"kind":"ObjectField","name":{"kind":"Name","value":"byType"},"value":{"kind":"EnumValue","value":"ASC"}}]}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"order"}},{"kind":"Field","name":{"kind":"Name","value":"mangas"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}}]}}]}}]}}]}}]} as unknown as DocumentNode<LibraryCategoriesQuery, LibraryCategoriesQueryVariables>;
export const LibraryMangasDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"LibraryMangas"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Cursor"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"MangaFilterInput"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"order"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"MangaOrderInput"}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"mangas"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"condition"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"inLibrary"},"value":{"kind":"BooleanValue","value":true}}]}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}},{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}},{"kind":"Argument","name":{"kind":"Name","value":"order"},"value":{"kind":"Variable","name":{"kind":"Name","value":"order"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrlLastFetched"}},{"kind":"Field","name":{"kind":"Name","value":"unreadCount"}},{"kind":"Field","name":{"kind":"Name","value":"downloadCount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"endCursor"}},{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalCount"}}]}}]}}]} as unknown as DocumentNode<LibraryMangasQuery, LibraryMangasQueryVariables>;
export const LoginDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Login"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"LoginInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"accessToken"}},{"kind":"Field","name":{"kind":"Name","value":"refreshToken"}}]}}]}}]} as unknown as DocumentNode<LoginMutation, LoginMutationVariables>;
export const MangaChapterIdsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MangaChapterIds"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"mangaId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"chapters"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"mangaId"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"equalTo"},"value":{"kind":"Variable","name":{"kind":"Name","value":"mangaId"}}}]}}]}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"5000"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]} as unknown as DocumentNode<MangaChapterIdsQuery, MangaChapterIdsQueryVariables>;
export const MangaDetailDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MangaDetail"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"mangaId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Cursor"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"order"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ChapterOrderInput"}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"manga"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"mangaId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"author"}},{"kind":"Field","name":{"kind":"Name","value":"artist"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrlLastFetched"}},{"kind":"Field","name":{"kind":"Name","value":"genre"}},{"kind":"Field","name":{"kind":"Name","value":"inLibrary"}},{"kind":"Field","name":{"kind":"Name","value":"source"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"chapters"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"condition"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"mangaId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"mangaId"}}}]}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}},{"kind":"Argument","name":{"kind":"Name","value":"order"},"value":{"kind":"Variable","name":{"kind":"Name","value":"order"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"chapterNumber"}},{"kind":"Field","name":{"kind":"Name","value":"pageCount"}},{"kind":"Field","name":{"kind":"Name","value":"isRead"}},{"kind":"Field","name":{"kind":"Name","value":"isBookmarked"}},{"kind":"Field","name":{"kind":"Name","value":"isDownloaded"}},{"kind":"Field","name":{"kind":"Name","value":"lastPageRead"}},{"kind":"Field","name":{"kind":"Name","value":"scanlator"}},{"kind":"Field","name":{"kind":"Name","value":"uploadDate"}},{"kind":"Field","name":{"kind":"Name","value":"sourceOrder"}}]}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"endCursor"}},{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalCount"}}]}}]}}]} as unknown as DocumentNode<MangaDetailQuery, MangaDetailQueryVariables>;
export const ReaderChapterDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ReaderChapter"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"chapterId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"chapter"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"chapterId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"pageCount"}},{"kind":"Field","name":{"kind":"Name","value":"chapterNumber"}},{"kind":"Field","name":{"kind":"Name","value":"sourceOrder"}},{"kind":"Field","name":{"kind":"Name","value":"isRead"}},{"kind":"Field","name":{"kind":"Name","value":"lastPageRead"}},{"kind":"Field","name":{"kind":"Name","value":"manga"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}}]}}]}}]}}]} as unknown as DocumentNode<ReaderChapterQuery, ReaderChapterQueryVariables>;
export const ReaderChapterListDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ReaderChapterList"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"mangaId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"chapters"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"mangaId"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"equalTo"},"value":{"kind":"Variable","name":{"kind":"Name","value":"mangaId"}}}]}}]}},{"kind":"Argument","name":{"kind":"Name","value":"order"},"value":{"kind":"ListValue","values":[{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"by"},"value":{"kind":"EnumValue","value":"SOURCE_ORDER"}},{"kind":"ObjectField","name":{"kind":"Name","value":"byType"},"value":{"kind":"EnumValue","value":"DESC"}}]}]}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"1000"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"chapterNumber"}},{"kind":"Field","name":{"kind":"Name","value":"isRead"}}]}}]}}]}}]} as unknown as DocumentNode<ReaderChapterListQuery, ReaderChapterListQueryVariables>;
export const ReaderNeighborsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ReaderNeighbors"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"mangaId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"chapterNumber"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Float"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"previous"},"name":{"kind":"Name","value":"chapters"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"condition"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"mangaId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"mangaId"}}}]}},{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"chapterNumber"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"lessThan"},"value":{"kind":"Variable","name":{"kind":"Name","value":"chapterNumber"}}}]}}]}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"1"}},{"kind":"Argument","name":{"kind":"Name","value":"order"},"value":{"kind":"ListValue","values":[{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"by"},"value":{"kind":"EnumValue","value":"CHAPTER_NUMBER"}},{"kind":"ObjectField","name":{"kind":"Name","value":"byType"},"value":{"kind":"EnumValue","value":"DESC"}}]}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"chapterNumber"}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"next"},"name":{"kind":"Name","value":"chapters"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"condition"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"mangaId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"mangaId"}}}]}},{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"chapterNumber"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"greaterThan"},"value":{"kind":"Variable","name":{"kind":"Name","value":"chapterNumber"}}}]}}]}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"1"}},{"kind":"Argument","name":{"kind":"Name","value":"order"},"value":{"kind":"ListValue","values":[{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"by"},"value":{"kind":"EnumValue","value":"CHAPTER_NUMBER"}},{"kind":"ObjectField","name":{"kind":"Name","value":"byType"},"value":{"kind":"EnumValue","value":"ASC"}}]}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"chapterNumber"}}]}}]}}]}}]} as unknown as DocumentNode<ReaderNeighborsQuery, ReaderNeighborsQueryVariables>;
export const RefreshTokenDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RefreshToken"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RefreshTokenInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"refreshToken"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"accessToken"}}]}}]}}]} as unknown as DocumentNode<RefreshTokenMutation, RefreshTokenMutationVariables>;
export const ServerSettingsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ServerSettings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"settings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"authMode"}},{"kind":"Field","name":{"kind":"Name","value":"databaseType"}},{"kind":"Field","name":{"kind":"Name","value":"updateMangas"}},{"kind":"Field","name":{"kind":"Name","value":"autoDownloadNewChapters"}},{"kind":"Field","name":{"kind":"Name","value":"autoDownloadNewChaptersLimit"}},{"kind":"Field","name":{"kind":"Name","value":"downloadAsCbz"}},{"kind":"Field","name":{"kind":"Name","value":"downloadsPath"}},{"kind":"Field","name":{"kind":"Name","value":"maxSourcesInParallel"}},{"kind":"Field","name":{"kind":"Name","value":"globalUpdateInterval"}},{"kind":"Field","name":{"kind":"Name","value":"excludeCompleted"}},{"kind":"Field","name":{"kind":"Name","value":"excludeNotStarted"}},{"kind":"Field","name":{"kind":"Name","value":"excludeUnreadChapters"}},{"kind":"Field","name":{"kind":"Name","value":"excludeEntryWithUnreadChapters"}},{"kind":"Field","name":{"kind":"Name","value":"debugLogsEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"backupPath"}},{"kind":"Field","name":{"kind":"Name","value":"backupInterval"}},{"kind":"Field","name":{"kind":"Name","value":"webUIChannel"}},{"kind":"Field","name":{"kind":"Name","value":"webUIFlavor"}},{"kind":"Field","name":{"kind":"Name","value":"webUIInterface"}}]}}]}}]} as unknown as DocumentNode<ServerSettingsQuery, ServerSettingsQueryVariables>;
export const SourceCatalogDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SourceCatalog"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sources"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"order"},"value":{"kind":"ListValue","values":[{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"by"},"value":{"kind":"EnumValue","value":"NAME"}},{"kind":"ObjectField","name":{"kind":"Name","value":"byType"},"value":{"kind":"EnumValue","value":"ASC"}}]}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}},{"kind":"Field","name":{"kind":"Name","value":"lang"}},{"kind":"Field","name":{"kind":"Name","value":"isNsfw"}},{"kind":"Field","name":{"kind":"Name","value":"contentWarning"}},{"kind":"Field","name":{"kind":"Name","value":"supportsLatest"}},{"kind":"Field","name":{"kind":"Name","value":"iconUrl"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalCount"}}]}}]}}]} as unknown as DocumentNode<SourceCatalogQuery, SourceCatalogQueryVariables>;
export const StartDownloaderDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"StartDownloader"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"startDownloader"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"ObjectValue","fields":[]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"downloadStatus"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"state"}}]}}]}}]}}]} as unknown as DocumentNode<StartDownloaderMutation, StartDownloaderMutationVariables>;
export const StopDownloaderDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"StopDownloader"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"stopDownloader"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"ObjectValue","fields":[]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"downloadStatus"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"state"}}]}}]}}]}}]} as unknown as DocumentNode<StopDownloaderMutation, StopDownloaderMutationVariables>;
export const UpdateCategoryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateCategory"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateCategoryInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateCategory"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"default"}},{"kind":"Field","name":{"kind":"Name","value":"isDefaultCategory"}},{"kind":"Field","name":{"kind":"Name","value":"order"}},{"kind":"Field","name":{"kind":"Name","value":"mangas"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}}]}}]}}]}}]}}]} as unknown as DocumentNode<UpdateCategoryMutation, UpdateCategoryMutationVariables>;
export const UpdateCategoryOrderDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateCategoryOrder"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateCategoryOrderInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateCategoryOrder"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"categories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"order"}}]}}]}}]}}]} as unknown as DocumentNode<UpdateCategoryOrderMutation, UpdateCategoryOrderMutationVariables>;
export const UpdateChapterProgressDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateChapterProgress"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateChapterInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateChapter"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"chapter"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isRead"}},{"kind":"Field","name":{"kind":"Name","value":"isBookmarked"}},{"kind":"Field","name":{"kind":"Name","value":"lastPageRead"}}]}}]}}]}}]} as unknown as DocumentNode<UpdateChapterProgressMutation, UpdateChapterProgressMutationVariables>;
export const UpdateChaptersStateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateChaptersState"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateChaptersInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateChapters"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"chapters"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isRead"}},{"kind":"Field","name":{"kind":"Name","value":"isBookmarked"}},{"kind":"Field","name":{"kind":"Name","value":"isDownloaded"}}]}}]}}]}}]} as unknown as DocumentNode<UpdateChaptersStateMutation, UpdateChaptersStateMutationVariables>;
export const UpdateMangaLibraryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateMangaLibrary"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateMangaInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateManga"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"manga"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"inLibrary"}}]}}]}}]}}]} as unknown as DocumentNode<UpdateMangaLibraryMutation, UpdateMangaLibraryMutationVariables>;
export const UpdateMangasCategoriesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateMangasCategories"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateMangasCategoriesInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateMangasCategories"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"mangas"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]} as unknown as DocumentNode<UpdateMangasCategoriesMutation, UpdateMangasCategoriesMutationVariables>;
export const UpdateMangasLibraryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateMangasLibrary"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateMangasInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateMangas"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"mangas"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"inLibrary"}}]}}]}}]}}]} as unknown as DocumentNode<UpdateMangasLibraryMutation, UpdateMangasLibraryMutationVariables>;
export const UpdateServerSettingsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateServerSettings"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"settings"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"PartialSettingsTypeInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setSettings"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"settings"},"value":{"kind":"Variable","name":{"kind":"Name","value":"settings"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"settings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateMangas"}},{"kind":"Field","name":{"kind":"Name","value":"autoDownloadNewChapters"}},{"kind":"Field","name":{"kind":"Name","value":"autoDownloadNewChaptersLimit"}},{"kind":"Field","name":{"kind":"Name","value":"downloadAsCbz"}},{"kind":"Field","name":{"kind":"Name","value":"maxSourcesInParallel"}},{"kind":"Field","name":{"kind":"Name","value":"globalUpdateInterval"}},{"kind":"Field","name":{"kind":"Name","value":"excludeCompleted"}},{"kind":"Field","name":{"kind":"Name","value":"excludeNotStarted"}},{"kind":"Field","name":{"kind":"Name","value":"excludeUnreadChapters"}},{"kind":"Field","name":{"kind":"Name","value":"excludeEntryWithUnreadChapters"}},{"kind":"Field","name":{"kind":"Name","value":"debugLogsEnabled"}}]}}]}}]}}]} as unknown as DocumentNode<UpdateServerSettingsMutation, UpdateServerSettingsMutationVariables>;