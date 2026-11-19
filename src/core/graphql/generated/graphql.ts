/* eslint-disable */
/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type AddExtensionStoreInput = {
  clientMutationId?: string | null | undefined;
  indexUrl: string;
};

export type AuthMode =
  | 'BASIC_AUTH'
  | 'NONE'
  | 'SIMPLE_LOGIN'
  | 'UI_LOGIN';

export type BackupRestoreState =
  | 'FAILURE'
  | 'IDLE'
  | 'RESTORING_CATEGORIES'
  | 'RESTORING_MANGA'
  | 'RESTORING_META'
  | 'RESTORING_SETTINGS'
  | 'SUCCESS';

export type BindTrackInput = {
  clientMutationId?: string | null | undefined;
  mangaId: number;
  /** This will only work if the tracker of the track record supports private tracking */
  private?: boolean | null | undefined;
  remoteId: string;
  trackerId: number;
};

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

export type ClearCachedImagesInput = {
  cachedPages?: boolean | null | undefined;
  cachedThumbnails?: boolean | null | undefined;
  clientMutationId?: string | null | undefined;
  downloadedThumbnails?: boolean | null | undefined;
};

export type ContentWarning =
  | 'MIXED'
  | 'NSFW'
  | 'SAFE';

export type CreateBackupInput = {
  clientMutationId?: string | null | undefined;
  flags?: PartialBackupFlagsInput | null | undefined;
};

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

export type DeleteMangaMetaInput = {
  clientMutationId?: string | null | undefined;
  key: string;
  mangaId: number;
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

export type FetchMangaAndChaptersInput = {
  clientMutationId?: string | null | undefined;
  fetchChapters: boolean;
  fetchManga: boolean;
  id: number;
};

export type FetchSourceMangaInput = {
  clientMutationId?: string | null | undefined;
  filters?: Array<FilterChangeInput> | null | undefined;
  page: number;
  query?: string | null | undefined;
  source: string;
  type: FetchSourceMangaType;
};

export type FetchSourceMangaType =
  | 'LATEST'
  | 'POPULAR'
  | 'SEARCH';

export type FilterChangeInput = {
  checkBoxState?: boolean | null | undefined;
  groupChange?: FilterChangeInput | null | undefined;
  position: number;
  selectState?: number | null | undefined;
  sortState?: SortSelectionInput | null | undefined;
  textState?: string | null | undefined;
  triState?: TriState | null | undefined;
};

export type GlobalMetaTypeInput = {
  key: string;
  value: string;
};

export type IncludeOrExclude =
  | 'EXCLUDE'
  | 'INCLUDE'
  | 'UNSET';

export type InstallExternalExtensionInput = {
  clientMutationId?: string | null | undefined;
  extensionFile: File;
};

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

export type LoginTrackerCredentialsInput = {
  clientMutationId?: string | null | undefined;
  password: string;
  trackerId: number;
  username: string;
};

export type LogoutTrackerInput = {
  clientMutationId?: string | null | undefined;
  trackerId: number;
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

export type MangaMetaTypeInput = {
  key: string;
  mangaId: number;
  value: string;
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

export type PartialBackupFlagsInput = {
  includeCategories?: boolean | null | undefined;
  includeChapters?: boolean | null | undefined;
  includeClientData?: boolean | null | undefined;
  includeHistory?: boolean | null | undefined;
  includeManga?: boolean | null | undefined;
  includeServerSettings?: boolean | null | undefined;
  includeTracking?: boolean | null | undefined;
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

export type RemoveExtensionStoreInput = {
  clientMutationId?: string | null | undefined;
  indexUrl: string;
};

export type RestoreBackupInput = {
  backup: File;
  clientMutationId?: string | null | undefined;
  flags?: PartialBackupFlagsInput | null | undefined;
};

export type SearchTrackerInput = {
  query: string;
  trackerId: number;
};

export type SetGlobalMetaInput = {
  clientMutationId?: string | null | undefined;
  meta: GlobalMetaTypeInput;
};

export type SetMangaMetaInput = {
  clientMutationId?: string | null | undefined;
  meta: MangaMetaTypeInput;
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

export type SortSelectionInput = {
  ascending: boolean;
  index: number;
};

export type SourcePreferenceChangeInput = {
  checkBoxState?: boolean | null | undefined;
  editTextState?: string | null | undefined;
  listState?: string | null | undefined;
  multiSelectState?: Array<string> | null | undefined;
  position: number;
  switchState?: boolean | null | undefined;
};

export type StartSyncResult =
  | 'SUCCESS'
  | 'SYNC_DISABLED'
  | 'SYNC_IN_PROGRESS';

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

export type SyncState =
  | 'CREATING_BACKUP'
  | 'DOWNLOADING'
  | 'ERROR'
  | 'MERGING'
  | 'RESTORING'
  | 'STARTED'
  | 'SUCCESS'
  | 'UPLOADING';

export type TrackProgressInput = {
  clientMutationId?: string | null | undefined;
  mangaId: number;
};

export type TriState =
  | 'EXCLUDE'
  | 'IGNORE'
  | 'INCLUDE';

export type UnbindTrackInput = {
  clientMutationId?: string | null | undefined;
  /** This will only work if the tracker of the track record supports deleting tracks */
  deleteRemoteTrack?: boolean | null | undefined;
  recordId: number;
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

export type UpdateExtensionPatchInput = {
  install?: boolean | null | undefined;
  uninstall?: boolean | null | undefined;
  update?: boolean | null | undefined;
};

export type UpdateExtensionsInput = {
  clientMutationId?: string | null | undefined;
  ids: Array<string>;
  patch: UpdateExtensionPatchInput;
};

export type UpdateLibraryInput = {
  categories?: Array<number> | null | undefined;
  clientMutationId?: string | null | undefined;
};

export type UpdateMangaCategoriesInput = {
  clientMutationId?: string | null | undefined;
  id: number;
  patch: UpdateMangaCategoriesPatchInput;
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

export type UpdateSourcePreferenceInput = {
  change: SourcePreferenceChangeInput;
  clientMutationId?: string | null | undefined;
  source: string;
};

export type UpdateState =
  | 'DOWNLOADING'
  | 'ERROR'
  | 'FINISHED'
  | 'IDLE';

export type UpdateTrackInput = {
  clientMutationId?: string | null | undefined;
  /** This will only work if the tracker of the track record supports reading dates */
  finishDate?: string | null | undefined;
  lastChapterRead?: number | null | undefined;
  /** This will only work if the tracker of the track record supports private tracking */
  private?: boolean | null | undefined;
  recordId: number;
  scoreString?: string | null | undefined;
  /** This will only work if the tracker of the track record supports reading dates */
  startDate?: string | null | undefined;
  status?: number | null | undefined;
};

export type ValidateBackupInput = {
  backup: File;
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

export type AboutPageQueryVariables = Exact<{ [key: string]: never; }>;


export type AboutPageQuery = { __typename: 'Query', aboutServer: { __typename: 'AboutServerPayload', name: string, version: string, buildType: string, buildTime: string }, aboutWebUI: { __typename: 'AboutWebUI', channel: WebUiChannel, tag: string, updateTimestamp: string }, checkForWebUIUpdate: { __typename: 'WebUIUpdateCheck', channel: WebUiChannel, tag: string, updateAvailable: boolean } };

export type ServerUpdateCheckQueryVariables = Exact<{ [key: string]: never; }>;


export type ServerUpdateCheckQuery = { __typename: 'Query', checkForServerUpdates: Array<{ __typename: 'CheckForServerUpdatesPayload', channel: string, tag: string, url: string }> };

export type AboutServerQueryVariables = Exact<{ [key: string]: never; }>;


export type AboutServerQuery = { __typename: 'Query', aboutServer: { __typename: 'AboutServerPayload', name: string, version: string, buildType: string, buildTime: string, platformInfo: { __typename: 'PlatformInfo', arch: string, headless: boolean, os: { __typename: 'OSInfo', name: string, version: string, build: string | null }, jvm: { __typename: 'JvmInfo', javaVersion: string, vmName: string, vmVersion: string, vmVendor: string } } } };

export type AddExtensionStoreMutationVariables = Exact<{
  input: AddExtensionStoreInput;
}>;


export type AddExtensionStoreMutation = { __typename: 'Mutation', addExtensionStore: { __typename: 'AddExtensionStorePayload', extensionStore: { __typename: 'ExtensionStoreType', name: string, badgeLabel: string, indexUrl: string } } | null };

export type AuthProbeQueryVariables = Exact<{ [key: string]: never; }>;


export type AuthProbeQuery = { __typename: 'Query', settings: { __typename: 'SettingsType', authMode: AuthMode } };

export type BackupSettingsQueryVariables = Exact<{ [key: string]: never; }>;


export type BackupSettingsQuery = { __typename: 'Query', settings: { __typename: 'SettingsType', autoBackupIncludeCategories: boolean, autoBackupIncludeChapters: boolean, autoBackupIncludeClientData: boolean, autoBackupIncludeHistory: boolean, autoBackupIncludeManga: boolean, autoBackupIncludeServerSettings: boolean, autoBackupIncludeTracking: boolean, backupPath: string, backupInterval: number, backupTime: string, backupTTL: number } };

export type BindTrackMutationVariables = Exact<{
  input: BindTrackInput;
}>;


export type BindTrackMutation = { __typename: 'Mutation', bindTrack: { __typename: 'BindTrackPayload', trackRecord: { __typename: 'TrackRecordType', id: number, trackerId: number, title: string, status: number, score: number, displayScore: string, private: boolean, remoteUrl: string, startDate: string, finishDate: string, tracker: { __typename: 'TrackerType', id: number, name: string, scores: Array<string>, supportsReadingDates: boolean, statuses: Array<{ __typename: 'TrackStatusType', name: string, value: number }> } } } };

export type CategoryCatalogQueryVariables = Exact<{ [key: string]: never; }>;


export type CategoryCatalogQuery = { __typename: 'Query', categories: { __typename: 'CategoryNodeList', nodes: Array<{ __typename: 'CategoryType', id: number, name: string, default: boolean, isDefaultCategory: boolean, order: number, includeInUpdate: IncludeOrExclude, includeInDownload: IncludeOrExclude, mangas: { __typename: 'MangaNodeList', totalCount: number } }> } };

export type ChapterFeedQueryVariables = Exact<{
  first: number;
  after?: string | null | undefined;
  filter?: ChapterFilterInput | null | undefined;
  order: Array<ChapterOrderInput> | ChapterOrderInput;
}>;


export type ChapterFeedQuery = { __typename: 'Query', chapters: { __typename: 'ChapterNodeList', totalCount: number, nodes: Array<{ __typename: 'ChapterType', id: number, name: string, chapterNumber: number, pageCount: number, isRead: boolean, isDownloaded: boolean, lastPageRead: number, lastReadAt: string, uploadDate: string, scanlator: string | null, manga: { __typename: 'MangaType', id: number, title: string, thumbnailUrl: string | null, source: { __typename: 'SourceType', id: string, contentWarning: ContentWarning } | null, categories: { __typename: 'CategoryNodeList', nodes: Array<{ __typename: 'CategoryType', id: number }> } } }>, pageInfo: { __typename: 'PageInfo', endCursor: string | null, hasNextPage: boolean } } };

export type ClearCachedImagesMutationVariables = Exact<{
  input: ClearCachedImagesInput;
}>;


export type ClearCachedImagesMutation = { __typename: 'Mutation', clearCachedImages: { __typename: 'ClearCachedImagesPayload' } };

export type CreateBackupMutationVariables = Exact<{
  input?: CreateBackupInput | null | undefined;
}>;


export type CreateBackupMutation = { __typename: 'Mutation', createBackup: { __typename: 'CreateBackupPayload', url: string } };

export type CreateCategoryMutationVariables = Exact<{
  input: CreateCategoryInput;
}>;


export type CreateCategoryMutation = { __typename: 'Mutation', createCategory: { __typename: 'CreateCategoryPayload', category: { __typename: 'CategoryType', id: number, name: string, default: boolean, isDefaultCategory: boolean, order: number, includeInUpdate: IncludeOrExclude, includeInDownload: IncludeOrExclude, mangas: { __typename: 'MangaNodeList', totalCount: number } } } | null };

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

export type DeleteMangaNoteMutationVariables = Exact<{
  input: DeleteMangaMetaInput;
}>;


export type DeleteMangaNoteMutation = { __typename: 'Mutation', deleteMangaMeta: { __typename: 'DeleteMangaMetaPayload', meta: { __typename: 'MangaMetaType', key: string, value: string } | null } | null };

export type DequeueDownloadMutationVariables = Exact<{
  input: DequeueChapterDownloadInput;
}>;


export type DequeueDownloadMutation = { __typename: 'Mutation', dequeueChapterDownload: { __typename: 'DequeueChapterDownloadPayload', downloadStatus: { __typename: 'DownloadStatus', state: DownloaderState } } | null };

export type DownloadQueueQueryVariables = Exact<{ [key: string]: never; }>;


export type DownloadQueueQuery = { __typename: 'Query', downloadStatus: { __typename: 'DownloadStatus', state: DownloaderState, queue: Array<{ __typename: 'DownloadType', position: number, progress: number, state: DownloadState, tries: number, chapter: { __typename: 'ChapterType', id: number, name: string, pageCount: number }, manga: { __typename: 'MangaType', id: number, title: string, thumbnailUrl: string | null, source: { __typename: 'SourceType', id: string, contentWarning: ContentWarning } | null } }> } };

export type DownloadStatusChangedSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type DownloadStatusChangedSubscription = { __typename: 'Subscription', downloadStatusChanged: { __typename: 'DownloadUpdates', state: DownloaderState, omittedUpdates: boolean } };

export type EnqueueChapterDownloadsMutationVariables = Exact<{
  input: EnqueueChapterDownloadsInput;
}>;


export type EnqueueChapterDownloadsMutation = { __typename: 'Mutation', enqueueChapterDownloads: { __typename: 'EnqueueChapterDownloadsPayload', downloadStatus: { __typename: 'DownloadStatus', state: DownloaderState } } | null };

export type EnqueueDownloadMutationVariables = Exact<{
  input: EnqueueChapterDownloadInput;
}>;


export type EnqueueDownloadMutation = { __typename: 'Mutation', enqueueChapterDownload: { __typename: 'EnqueueChapterDownloadPayload', downloadStatus: { __typename: 'DownloadStatus', state: DownloaderState } } | null };

export type ExtensionsCatalogQueryVariables = Exact<{
  first: number;
  after?: string | null | undefined;
}>;


export type ExtensionsCatalogQuery = { __typename: 'Query', extensions: { __typename: 'ExtensionNodeList', totalCount: number, nodes: Array<{ __typename: 'ExtensionType', pkgName: string, name: string, versionName: string, lang: string, isInstalled: boolean, hasUpdate: boolean, isObsolete: boolean, iconUrl: string, contentWarning: ContentWarning, extensionStore: { __typename: 'ExtensionStoreType', name: string } | null }>, pageInfo: { __typename: 'PageInfo', endCursor: string | null, hasNextPage: boolean } } };

export type FetchChapterPagesMutationVariables = Exact<{
  input: FetchChapterPagesInput;
}>;


export type FetchChapterPagesMutation = { __typename: 'Mutation', fetchChapterPages: { __typename: 'FetchChapterPagesPayload', pages: Array<string>, chapter: { __typename: 'ChapterType', id: number, pageCount: number } } | null };

export type FetchExtensionsMutationVariables = Exact<{ [key: string]: never; }>;


export type FetchExtensionsMutation = { __typename: 'Mutation', fetchExtensions: { __typename: 'FetchExtensionsPayload', extensions: Array<{ __typename: 'ExtensionType', pkgName: string, name: string, versionName: string, lang: string, isInstalled: boolean, hasUpdate: boolean, isObsolete: boolean, iconUrl: string, contentWarning: ContentWarning, extensionStore: { __typename: 'ExtensionStoreType', name: string } | null }>, extensionStores: Array<{ __typename: 'ExtensionStoreType', name: string, badgeLabel: string, indexUrl: string }> } | null };

export type FetchSourceMangaMutationVariables = Exact<{
  input: FetchSourceMangaInput;
}>;


export type FetchSourceMangaMutation = { __typename: 'Mutation', fetchSourceManga: { __typename: 'FetchSourceMangaPayload', hasNextPage: boolean, mangas: Array<{ __typename: 'MangaType', id: number, title: string, thumbnailUrl: string | null, inLibrary: boolean, sourceId: string }> } | null };

export type GlobalNsfwDefaultQueryVariables = Exact<{ [key: string]: never; }>;


export type GlobalNsfwDefaultQuery = { __typename: 'Query', metas: { __typename: 'GlobalMetaNodeList', nodes: Array<{ __typename: 'GlobalMetaType', key: string, value: string }> } };

export type SetGlobalNsfwDefaultMutationVariables = Exact<{
  input: SetGlobalMetaInput;
}>;


export type SetGlobalNsfwDefaultMutation = { __typename: 'Mutation', setGlobalMeta: { __typename: 'SetGlobalMetaPayload', meta: { __typename: 'GlobalMetaType', key: string, value: string } } | null };

export type GlobalSearchQueryVariables = Exact<{
  search: string;
}>;


export type GlobalSearchQuery = { __typename: 'Query', mangas: { __typename: 'MangaNodeList', totalCount: number, nodes: Array<{ __typename: 'MangaType', id: number, title: string, thumbnailUrl: string | null, inLibrary: boolean, unreadCount: number, source: { __typename: 'SourceType', id: string, displayName: string } | null }> } };

export type InstallExternalExtensionMutationVariables = Exact<{
  input: InstallExternalExtensionInput;
}>;


export type InstallExternalExtensionMutation = { __typename: 'Mutation', installExternalExtension: { __typename: 'InstallExternalExtensionPayload', extension: { __typename: 'ExtensionType', pkgName: string, name: string, isInstalled: boolean, hasUpdate: boolean } } | null };

export type LabeledMangaCategoriesQueryVariables = Exact<{
  ids: Array<number> | number;
}>;


export type LabeledMangaCategoriesQuery = { __typename: 'Query', mangas: { __typename: 'MangaNodeList', nodes: Array<{ __typename: 'MangaType', id: number, categories: { __typename: 'CategoryNodeList', nodes: Array<{ __typename: 'CategoryType', id: number }> } }> } };

export type LibraryCategoriesQueryVariables = Exact<{ [key: string]: never; }>;


export type LibraryCategoriesQuery = { __typename: 'Query', categories: { __typename: 'CategoryNodeList', nodes: Array<{ __typename: 'CategoryType', id: number, name: string, order: number, mangas: { __typename: 'MangaNodeList', totalCount: number } }> } };

export type LibraryCategoryMembershipQueryVariables = Exact<{
  first: number;
  after?: string | null | undefined;
}>;


export type LibraryCategoryMembershipQuery = { __typename: 'Query', mangas: { __typename: 'MangaNodeList', nodes: Array<{ __typename: 'MangaType', categories: { __typename: 'CategoryNodeList', nodes: Array<{ __typename: 'CategoryType', id: number }> } }>, pageInfo: { __typename: 'PageInfo', endCursor: string | null, hasNextPage: boolean } } };

export type LibraryDuplicateScanQueryVariables = Exact<{
  first: number;
  after?: string | null | undefined;
}>;


export type LibraryDuplicateScanQuery = { __typename: 'Query', mangas: { __typename: 'MangaNodeList', nodes: Array<{ __typename: 'MangaType', id: number, title: string, sourceId: string }>, pageInfo: { __typename: 'PageInfo', endCursor: string | null, hasNextPage: boolean } } };

export type LibraryMangasQueryVariables = Exact<{
  first: number;
  after?: string | null | undefined;
  filter?: MangaFilterInput | null | undefined;
  order?: Array<MangaOrderInput> | MangaOrderInput | null | undefined;
}>;


export type LibraryMangasQuery = { __typename: 'Query', mangas: { __typename: 'MangaNodeList', totalCount: number, nodes: Array<{ __typename: 'MangaType', id: number, title: string, thumbnailUrl: string | null, thumbnailUrlLastFetched: string | null, unreadCount: number, downloadCount: number, bookmarkCount: number, source: { __typename: 'SourceType', id: string, name: string, contentWarning: ContentWarning } | null, categories: { __typename: 'CategoryNodeList', nodes: Array<{ __typename: 'CategoryType', id: number }> }, trackRecords: { __typename: 'TrackRecordNodeList', totalCount: number }, lastReadChapter: { __typename: 'ChapterType', id: number, name: string, chapterNumber: number, lastPageRead: number, pageCount: number } | null }>, pageInfo: { __typename: 'PageInfo', endCursor: string | null, hasNextPage: boolean } } };

export type LibraryUpdateStatusChangedSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type LibraryUpdateStatusChangedSubscription = { __typename: 'Subscription', libraryUpdateStatusChanged: { __typename: 'UpdaterUpdates', omittedUpdates: boolean, jobsInfo: { __typename: 'UpdaterJobsInfoType', isRunning: boolean, totalJobs: number, finishedJobs: number, skippedCategoriesCount: number, skippedMangasCount: number } } };

export type LoginMutationVariables = Exact<{
  input: LoginInput;
}>;


export type LoginMutation = { __typename: 'Mutation', login: { __typename: 'LoginPayload', accessToken: string, refreshToken: string } };

export type LoginTrackerCredentialsMutationVariables = Exact<{
  input: LoginTrackerCredentialsInput;
}>;


export type LoginTrackerCredentialsMutation = { __typename: 'Mutation', loginTrackerCredentials: { __typename: 'LoginTrackerCredentialsPayload', isLoggedIn: boolean } };

export type LogoutTrackerMutationVariables = Exact<{
  input: LogoutTrackerInput;
}>;


export type LogoutTrackerMutation = { __typename: 'Mutation', logoutTracker: { __typename: 'LogoutTrackerPayload', tracker: { __typename: 'TrackerType', id: number, isLoggedIn: boolean } } };

export type MangaCategoryPickerQueryVariables = Exact<{
  mangaId: number;
}>;


export type MangaCategoryPickerQuery = { __typename: 'Query', manga: { __typename: 'MangaType', id: number, categories: { __typename: 'CategoryNodeList', nodes: Array<{ __typename: 'CategoryType', id: number, name: string, default: boolean, isDefaultCategory: boolean }> } }, categories: { __typename: 'CategoryNodeList', nodes: Array<{ __typename: 'CategoryType', id: number, name: string, default: boolean, isDefaultCategory: boolean }> } };

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


export type MangaDetailQuery = { __typename: 'Query', manga: { __typename: 'MangaType', id: number, title: string, author: string | null, artist: string | null, description: string | null, status: MangaStatus, thumbnailUrl: string | null, thumbnailUrlLastFetched: string | null, genre: Array<string>, inLibrary: boolean, source: { __typename: 'SourceType', id: string, name: string, contentWarning: ContentWarning } | null }, chapters: { __typename: 'ChapterNodeList', totalCount: number, nodes: Array<{ __typename: 'ChapterType', id: number, name: string, chapterNumber: number, pageCount: number, isRead: boolean, isBookmarked: boolean, isDownloaded: boolean, lastPageRead: number, scanlator: string | null, uploadDate: string, sourceOrder: number }>, pageInfo: { __typename: 'PageInfo', endCursor: string | null, hasNextPage: boolean } } };

export type MangaNotesQueryVariables = Exact<{
  mangaId: number;
}>;


export type MangaNotesQuery = { __typename: 'Query', manga: { __typename: 'MangaType', id: number, meta: Array<{ __typename: 'MangaMetaType', key: string, value: string }> } };

export type MangaTrackingQueryVariables = Exact<{
  mangaId: number;
}>;


export type MangaTrackingQuery = { __typename: 'Query', manga: { __typename: 'MangaType', id: number, trackRecords: { __typename: 'TrackRecordNodeList', nodes: Array<{ __typename: 'TrackRecordType', id: number, trackerId: number, title: string, status: number, score: number, displayScore: string, private: boolean, remoteUrl: string, startDate: string, finishDate: string, tracker: { __typename: 'TrackerType', id: number, name: string, scores: Array<string>, supportsReadingDates: boolean, statuses: Array<{ __typename: 'TrackStatusType', name: string, value: number }> } }> } } };

export type NavigationBadgesQueryVariables = Exact<{ [key: string]: never; }>;


export type NavigationBadgesQuery = { __typename: 'Query', downloadStatus: { __typename: 'DownloadStatus', queue: Array<{ __typename: 'DownloadType', position: number }> }, extensions: { __typename: 'ExtensionNodeList', totalCount: number } };

export type ReaderChapterQueryVariables = Exact<{
  chapterId: number;
}>;


export type ReaderChapterQuery = { __typename: 'Query', chapter: { __typename: 'ChapterType', id: number, name: string, pageCount: number, chapterNumber: number, sourceOrder: number, isRead: boolean, isDownloaded: boolean, isBookmarked: boolean, lastPageRead: number, manga: { __typename: 'MangaType', id: number, title: string, thumbnailUrl: string | null, inLibrary: boolean, source: { __typename: 'SourceType', id: string, contentWarning: ContentWarning } | null } } };

export type ReaderChapterListQueryVariables = Exact<{
  mangaId: number;
}>;


export type ReaderChapterListQuery = { __typename: 'Query', chapters: { __typename: 'ChapterNodeList', nodes: Array<{ __typename: 'ChapterType', id: number, name: string, chapterNumber: number, isRead: boolean }> } };

export type ReaderNeighborsQueryVariables = Exact<{
  mangaId: number;
  chapterNumber: number;
}>;


export type ReaderNeighborsQuery = { __typename: 'Query', previous: { __typename: 'ChapterNodeList', nodes: Array<{ __typename: 'ChapterType', id: number, name: string, chapterNumber: number }> }, next: { __typename: 'ChapterNodeList', nodes: Array<{ __typename: 'ChapterType', id: number, name: string, chapterNumber: number }> } };

export type ReadingFeedQueryVariables = Exact<{
  first: number;
  after?: string | null | undefined;
}>;


export type ReadingFeedQuery = { __typename: 'Query', mangas: { __typename: 'MangaNodeList', totalCount: number, nodes: Array<{ __typename: 'MangaType', id: number, title: string, thumbnailUrl: string | null, source: { __typename: 'SourceType', id: string, contentWarning: ContentWarning } | null, categories: { __typename: 'CategoryNodeList', nodes: Array<{ __typename: 'CategoryType', id: number }> }, latestUploadedChapter: { __typename: 'ChapterType', id: number, name: string, chapterNumber: number, pageCount: number, isRead: boolean, isDownloaded: boolean, lastPageRead: number, lastReadAt: string, uploadDate: string, scanlator: string | null, sourceOrder: number } | null }>, pageInfo: { __typename: 'PageInfo', endCursor: string | null, hasNextPage: boolean } } };

export type RecentlyReadQueryVariables = Exact<{
  first: number;
  after?: string | null | undefined;
}>;


export type RecentlyReadQuery = { __typename: 'Query', chapters: { __typename: 'ChapterNodeList', nodes: Array<{ __typename: 'ChapterType', id: number, name: string, chapterNumber: number, isRead: boolean, lastReadAt: string, lastPageRead: number, pageCount: number, manga: { __typename: 'MangaType', id: number, title: string, thumbnailUrl: string | null, source: { __typename: 'SourceType', id: string, contentWarning: ContentWarning } | null, categories: { __typename: 'CategoryNodeList', nodes: Array<{ __typename: 'CategoryType', id: number }> }, firstUnreadChapter: { __typename: 'ChapterType', id: number, name: string, chapterNumber: number, lastPageRead: number, pageCount: number } | null } }>, pageInfo: { __typename: 'PageInfo', endCursor: string | null, hasNextPage: boolean } } };

export type RefreshMangaMutationVariables = Exact<{
  input: FetchMangaAndChaptersInput;
}>;


export type RefreshMangaMutation = { __typename: 'Mutation', fetchMangaAndChapters: { __typename: 'FetchMangaAndChaptersPayload', manga: { __typename: 'MangaType', id: number, title: string, thumbnailUrl: string | null }, chapters: Array<{ __typename: 'ChapterType', id: number }> } | null };

export type RefreshTokenMutationVariables = Exact<{
  input: RefreshTokenInput;
}>;


export type RefreshTokenMutation = { __typename: 'Mutation', refreshToken: { __typename: 'RefreshTokenPayload', accessToken: string } };

export type RemoveExtensionStoreMutationVariables = Exact<{
  input: RemoveExtensionStoreInput;
}>;


export type RemoveExtensionStoreMutation = { __typename: 'Mutation', removeExtensionStore: { __typename: 'RemoveExtensionStorePayload', extensionStore: { __typename: 'ExtensionStoreType', indexUrl: string } | null } | null };

export type RestoreBackupMutationVariables = Exact<{
  input: RestoreBackupInput;
}>;


export type RestoreBackupMutation = { __typename: 'Mutation', restoreBackup: { __typename: 'RestoreBackupPayload', id: string, status: { __typename: 'BackupRestoreStatus', state: BackupRestoreState } | null } };

export type SearchTrackerQueryVariables = Exact<{
  input: SearchTrackerInput;
}>;


export type SearchTrackerQuery = { __typename: 'Query', searchTracker: { __typename: 'SearchTrackerPayload', trackSearches: Array<{ __typename: 'TrackSearchType', id: number, remoteId: string, trackerId: number, title: string, coverUrl: string, summary: string, totalChapters: number, publishingStatus: string, publishingType: string, score: number, displayScore: string, status: number }> } };

export type ServerSettingsQueryVariables = Exact<{ [key: string]: never; }>;


export type ServerSettingsQuery = { __typename: 'Query', settings: { __typename: 'SettingsType', authMode: AuthMode, authUsername: string, authPassword: string, databaseType: DatabaseType, databaseUrl: string, databaseUsername: string, databasePassword: string, updateMangas: boolean, autoDownloadNewChapters: boolean, autoDownloadNewChaptersLimit: number, downloadAsCbz: boolean, downloadsPath: string, maxSourcesInParallel: number, globalUpdateInterval: number, excludeCompleted: boolean, excludeNotStarted: boolean, excludeUnreadChapters: boolean, excludeEntryWithUnreadChapters: boolean, debugLogsEnabled: boolean, backupPath: string, backupInterval: number, webUIChannel: WebUiChannel, webUIFlavor: WebUiFlavor, webUIInterface: WebUiInterface, opdsCbzMimetype: CbzMediaType, opdsChapterSortOrder: SortOrder, opdsEnablePageReadProgress: boolean, opdsItemsPerPage: number, opdsMarkAsReadOnDownload: boolean, opdsShowOnlyDownloadedChapters: boolean, opdsShowOnlyUnreadChapters: boolean, opdsSkipChapterMetadataFeed: boolean, opdsUseBinaryFileSizes: boolean, koreaderSyncChecksumMethod: KoreaderSyncChecksumMethod, koreaderSyncPercentageTolerance: number, koreaderSyncStrategyBackward: KoreaderSyncConflictStrategy, koreaderSyncStrategyForward: KoreaderSyncConflictStrategy, downloadConversions: Array<{ __typename: 'SettingsDownloadConversionType', mimeType: string, target: string, compressionLevel: number | null }>, serveConversions: Array<{ __typename: 'SettingsDownloadConversionType', mimeType: string, target: string, compressionLevel: number | null }> } };

export type SetMangaCategoriesMutationVariables = Exact<{
  input: UpdateMangaCategoriesInput;
}>;


export type SetMangaCategoriesMutation = { __typename: 'Mutation', updateMangaCategories: { __typename: 'UpdateMangaCategoriesPayload', manga: { __typename: 'MangaType', id: number, categories: { __typename: 'CategoryNodeList', nodes: Array<{ __typename: 'CategoryType', id: number, name: string }> } } } | null };

export type SetMangaNoteMutationVariables = Exact<{
  input: SetMangaMetaInput;
}>;


export type SetMangaNoteMutation = { __typename: 'Mutation', setMangaMeta: { __typename: 'SetMangaMetaPayload', meta: { __typename: 'MangaMetaType', key: string, value: string } } | null };

export type SourceCatalogQueryVariables = Exact<{
  first: number;
}>;


export type SourceCatalogQuery = { __typename: 'Query', sources: { __typename: 'SourceNodeList', totalCount: number, nodes: Array<{ __typename: 'SourceType', id: string, name: string, displayName: string, lang: string, isNsfw: boolean, contentWarning: ContentWarning, supportsLatest: boolean, iconUrl: string }> } };

export type SourceInfoQueryVariables = Exact<{
  id: string;
}>;


export type SourceInfoQuery = { __typename: 'Query', source: { __typename: 'SourceType', id: string, displayName: string, name: string, lang: string, contentWarning: ContentWarning, filters: Array<
      | { __typename: 'CheckBoxFilter', name: string, checkDefault: boolean }
      | { __typename: 'GroupFilter', name: string, filters: Array<
          | { __typename: 'CheckBoxFilter', name: string, checkDefault: boolean }
          | { __typename: 'GroupFilter' }
          | { __typename: 'HeaderFilter', name: string }
          | { __typename: 'SelectFilter', name: string, values: Array<string>, selectDefault: number }
          | { __typename: 'SeparatorFilter', name: string }
          | { __typename: 'SortFilter', name: string, values: Array<string>, sortDefault: { __typename: 'SortSelection', index: number, ascending: boolean } | null }
          | { __typename: 'TextFilter', name: string, textDefault: string }
          | { __typename: 'TriStateFilter', name: string, triDefault: TriState }
        > }
      | { __typename: 'HeaderFilter', name: string }
      | { __typename: 'SelectFilter', name: string, values: Array<string>, selectDefault: number }
      | { __typename: 'SeparatorFilter', name: string }
      | { __typename: 'SortFilter', name: string, values: Array<string>, sortDefault: { __typename: 'SortSelection', index: number, ascending: boolean } | null }
      | { __typename: 'TextFilter', name: string, textDefault: string }
      | { __typename: 'TriStateFilter', name: string, triDefault: TriState }
    > } };

export type SourcePreferencesQueryVariables = Exact<{
  sourceId: string;
}>;


export type SourcePreferencesQuery = { __typename: 'Query', source: { __typename: 'SourceType', id: string, displayName: string, preferences: Array<
      | { __typename: 'CheckBoxPreference', key: string | null, title: string | null, summary: string | null, enabled: boolean, visible: boolean, checkValue: boolean | null }
      | { __typename: 'EditTextPreference', key: string | null, title: string | null, summary: string | null, enabled: boolean, visible: boolean, textValue: string | null }
      | { __typename: 'ListPreference', key: string | null, title: string | null, summary: string | null, entries: Array<string>, entryValues: Array<string>, enabled: boolean, visible: boolean, listValue: string | null }
      | { __typename: 'MultiSelectListPreference', key: string | null, title: string | null, summary: string | null, entries: Array<string>, entryValues: Array<string>, enabled: boolean, visible: boolean, multiValue: Array<string> | null }
      | { __typename: 'SwitchPreference', key: string | null, title: string | null, summary: string | null, enabled: boolean, visible: boolean, switchValue: boolean | null }
    > } };

export type StartDownloaderMutationVariables = Exact<{ [key: string]: never; }>;


export type StartDownloaderMutation = { __typename: 'Mutation', startDownloader: { __typename: 'StartDownloaderPayload', downloadStatus: { __typename: 'DownloadStatus', state: DownloaderState } } | null };

export type StartLibraryUpdateMutationVariables = Exact<{
  input: UpdateLibraryInput;
}>;


export type StartLibraryUpdateMutation = { __typename: 'Mutation', updateLibrary: { __typename: 'UpdateLibraryPayload', updateStatus: { __typename: 'LibraryUpdateStatus', jobsInfo: { __typename: 'UpdaterJobsInfoType', isRunning: boolean, totalJobs: number, finishedJobs: number, skippedCategoriesCount: number, skippedMangasCount: number } } } | null };

export type StartSyncMutationVariables = Exact<{ [key: string]: never; }>;


export type StartSyncMutation = { __typename: 'Mutation', startSync: { __typename: 'StartSyncPayload', result: StartSyncResult } };

export type StopDownloaderMutationVariables = Exact<{ [key: string]: never; }>;


export type StopDownloaderMutation = { __typename: 'Mutation', stopDownloader: { __typename: 'StopDownloaderPayload', downloadStatus: { __typename: 'DownloadStatus', state: DownloaderState } } | null };

export type SyncSettingsQueryVariables = Exact<{ [key: string]: never; }>;


export type SyncSettingsQuery = { __typename: 'Query', settings: { __typename: 'SettingsType', syncInterval: string, syncDataCategories: boolean, syncDataChapters: boolean, syncDataHistory: boolean, syncDataManga: boolean, syncDataTracking: boolean, syncYomiEnabled: boolean, syncYomiHost: string, syncYomiApiKey: string } };

export type SyncStatusChangedSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type SyncStatusChangedSubscription = { __typename: 'Subscription', syncStatusChanged: { __typename: 'SyncStatus', state: SyncState, startDate: string, endDate: string | null, errorMessage: string | null, backupRestoreId: string | null } };

export type TrackProgressMutationVariables = Exact<{
  input: TrackProgressInput;
}>;


export type TrackProgressMutation = { __typename: 'Mutation', trackProgress: { __typename: 'TrackProgressPayload', trackRecords: Array<{ __typename: 'TrackRecordType', id: number, trackerId: number, title: string, status: number, score: number, displayScore: string, private: boolean, remoteUrl: string, startDate: string, finishDate: string, tracker: { __typename: 'TrackerType', id: number, name: string, scores: Array<string>, supportsReadingDates: boolean, statuses: Array<{ __typename: 'TrackStatusType', name: string, value: number }> } }> } | null };

export type TrackingServicesQueryVariables = Exact<{ [key: string]: never; }>;


export type TrackingServicesQuery = { __typename: 'Query', trackers: { __typename: 'TrackerNodeList', nodes: Array<{ __typename: 'TrackerType', id: number, name: string, icon: string, isLoggedIn: boolean, isTokenExpired: boolean, authUrl: string | null, supportsPrivateTracking: boolean, supportsReadingDates: boolean, supportsTrackDeletion: boolean, scores: Array<string>, statuses: Array<{ __typename: 'TrackStatusType', name: string, value: number }> }> } };

export type UnbindTrackMutationVariables = Exact<{
  input: UnbindTrackInput;
}>;


export type UnbindTrackMutation = { __typename: 'Mutation', unbindTrack: { __typename: 'UnbindTrackPayload', trackRecord: { __typename: 'TrackRecordType', id: number } | null } };

export type UpdateBackupSettingsMutationVariables = Exact<{
  settings: PartialSettingsTypeInput;
}>;


export type UpdateBackupSettingsMutation = { __typename: 'Mutation', setSettings: { __typename: 'SetSettingsPayload', settings: { __typename: 'SettingsType', autoBackupIncludeCategories: boolean, autoBackupIncludeChapters: boolean, autoBackupIncludeClientData: boolean, autoBackupIncludeHistory: boolean, autoBackupIncludeManga: boolean, autoBackupIncludeServerSettings: boolean, autoBackupIncludeTracking: boolean, backupPath: string, backupInterval: number, backupTime: string, backupTTL: number } } };

export type UpdateCategoryMutationVariables = Exact<{
  input: UpdateCategoryInput;
}>;


export type UpdateCategoryMutation = { __typename: 'Mutation', updateCategory: { __typename: 'UpdateCategoryPayload', category: { __typename: 'CategoryType', id: number, name: string, default: boolean, isDefaultCategory: boolean, order: number, includeInUpdate: IncludeOrExclude, includeInDownload: IncludeOrExclude, mangas: { __typename: 'MangaNodeList', totalCount: number } } } | null };

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

export type UpdateExtensionsMutationVariables = Exact<{
  input: UpdateExtensionsInput;
}>;


export type UpdateExtensionsMutation = { __typename: 'Mutation', updateExtensions: { __typename: 'UpdateExtensionsPayload', extensions: Array<{ __typename: 'ExtensionType', pkgName: string, isInstalled: boolean, hasUpdate: boolean }> } | null };

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


export type UpdateServerSettingsMutation = { __typename: 'Mutation', setSettings: { __typename: 'SetSettingsPayload', settings: { __typename: 'SettingsType', updateMangas: boolean, autoDownloadNewChapters: boolean, autoDownloadNewChaptersLimit: number, downloadAsCbz: boolean, maxSourcesInParallel: number, globalUpdateInterval: number, excludeCompleted: boolean, excludeNotStarted: boolean, excludeUnreadChapters: boolean, excludeEntryWithUnreadChapters: boolean, debugLogsEnabled: boolean, opdsCbzMimetype: CbzMediaType, opdsChapterSortOrder: SortOrder, opdsEnablePageReadProgress: boolean, opdsItemsPerPage: number, opdsMarkAsReadOnDownload: boolean, opdsShowOnlyDownloadedChapters: boolean, opdsShowOnlyUnreadChapters: boolean, opdsSkipChapterMetadataFeed: boolean, opdsUseBinaryFileSizes: boolean, koreaderSyncChecksumMethod: KoreaderSyncChecksumMethod, koreaderSyncPercentageTolerance: number, koreaderSyncStrategyBackward: KoreaderSyncConflictStrategy, koreaderSyncStrategyForward: KoreaderSyncConflictStrategy, downloadConversions: Array<{ __typename: 'SettingsDownloadConversionType', mimeType: string, target: string, compressionLevel: number | null }>, serveConversions: Array<{ __typename: 'SettingsDownloadConversionType', mimeType: string, target: string, compressionLevel: number | null }> } } };

export type UpdateSourcePreferenceMutationVariables = Exact<{
  input: UpdateSourcePreferenceInput;
}>;


export type UpdateSourcePreferenceMutation = { __typename: 'Mutation', updateSourcePreference: { __typename: 'UpdateSourcePreferencePayload', preferences: Array<
      | { __typename: 'CheckBoxPreference', key: string | null, checkValue: boolean | null }
      | { __typename: 'EditTextPreference', key: string | null, textValue: string | null }
      | { __typename: 'ListPreference', key: string | null, listValue: string | null }
      | { __typename: 'MultiSelectListPreference', key: string | null, multiValue: Array<string> | null }
      | { __typename: 'SwitchPreference', key: string | null, switchValue: boolean | null }
    > } | null };

export type UpdateSyncSettingsMutationVariables = Exact<{
  settings: PartialSettingsTypeInput;
}>;


export type UpdateSyncSettingsMutation = { __typename: 'Mutation', setSettings: { __typename: 'SetSettingsPayload', settings: { __typename: 'SettingsType', syncDataCategories: boolean, syncDataChapters: boolean, syncDataHistory: boolean, syncDataManga: boolean, syncDataTracking: boolean, syncYomiEnabled: boolean } } };

export type UpdateTrackMutationVariables = Exact<{
  input: UpdateTrackInput;
}>;


export type UpdateTrackMutation = { __typename: 'Mutation', updateTrack: { __typename: 'UpdateTrackPayload', trackRecord: { __typename: 'TrackRecordType', id: number, status: number, score: number, displayScore: string, trackerId: number, startDate: string, finishDate: string, private: boolean } | null } };

export type ValidateBackupQueryVariables = Exact<{
  input: ValidateBackupInput;
}>;


export type ValidateBackupQuery = { __typename: 'Query', validateBackup: { __typename: 'ValidateBackupResult', missingSources: Array<{ __typename: 'ValidateBackupSource', id: string, name: string }>, missingTrackers: Array<{ __typename: 'ValidateBackupTracker', name: string }> } };

export type UpdateWebUiMutationVariables = Exact<{ [key: string]: never; }>;


export type UpdateWebUiMutation = { __typename: 'Mutation', updateWebUI: { __typename: 'WebUIUpdatePayload', updateStatus: { __typename: 'WebUIUpdateStatus', progress: number, state: UpdateState, info: { __typename: 'WebUIUpdateInfo', channel: WebUiChannel, tag: string } } } | null };

export type WebUiUpdateStatusChangeSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type WebUiUpdateStatusChangeSubscription = { __typename: 'Subscription', webUIUpdateStatusChange: { __typename: 'WebUIUpdateStatus', progress: number, state: UpdateState, info: { __typename: 'WebUIUpdateInfo', channel: WebUiChannel, tag: string } } };


export const AboutPageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AboutPage"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"aboutServer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"buildType"}},{"kind":"Field","name":{"kind":"Name","value":"buildTime"}}]}},{"kind":"Field","name":{"kind":"Name","value":"aboutWebUI"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"channel"}},{"kind":"Field","name":{"kind":"Name","value":"tag"}},{"kind":"Field","name":{"kind":"Name","value":"updateTimestamp"}}]}},{"kind":"Field","name":{"kind":"Name","value":"checkForWebUIUpdate"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"channel"}},{"kind":"Field","name":{"kind":"Name","value":"tag"}},{"kind":"Field","name":{"kind":"Name","value":"updateAvailable"}}]}}]}}]} as unknown as DocumentNode<AboutPageQuery, AboutPageQueryVariables>;
export const ServerUpdateCheckDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ServerUpdateCheck"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"checkForServerUpdates"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"channel"}},{"kind":"Field","name":{"kind":"Name","value":"tag"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]} as unknown as DocumentNode<ServerUpdateCheckQuery, ServerUpdateCheckQueryVariables>;
export const AboutServerDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AboutServer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"aboutServer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"buildType"}},{"kind":"Field","name":{"kind":"Name","value":"buildTime"}},{"kind":"Field","name":{"kind":"Name","value":"platformInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"arch"}},{"kind":"Field","name":{"kind":"Name","value":"headless"}},{"kind":"Field","name":{"kind":"Name","value":"os"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"build"}}]}},{"kind":"Field","name":{"kind":"Name","value":"jvm"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"javaVersion"}},{"kind":"Field","name":{"kind":"Name","value":"vmName"}},{"kind":"Field","name":{"kind":"Name","value":"vmVersion"}},{"kind":"Field","name":{"kind":"Name","value":"vmVendor"}}]}}]}}]}}]}}]} as unknown as DocumentNode<AboutServerQuery, AboutServerQueryVariables>;
export const AddExtensionStoreDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddExtensionStore"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AddExtensionStoreInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addExtensionStore"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"extensionStore"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"badgeLabel"}},{"kind":"Field","name":{"kind":"Name","value":"indexUrl"}}]}}]}}]}}]} as unknown as DocumentNode<AddExtensionStoreMutation, AddExtensionStoreMutationVariables>;
export const AuthProbeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AuthProbe"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"settings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"authMode"}}]}}]}}]} as unknown as DocumentNode<AuthProbeQuery, AuthProbeQueryVariables>;
export const BackupSettingsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"BackupSettings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"settings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"autoBackupIncludeCategories"}},{"kind":"Field","name":{"kind":"Name","value":"autoBackupIncludeChapters"}},{"kind":"Field","name":{"kind":"Name","value":"autoBackupIncludeClientData"}},{"kind":"Field","name":{"kind":"Name","value":"autoBackupIncludeHistory"}},{"kind":"Field","name":{"kind":"Name","value":"autoBackupIncludeManga"}},{"kind":"Field","name":{"kind":"Name","value":"autoBackupIncludeServerSettings"}},{"kind":"Field","name":{"kind":"Name","value":"autoBackupIncludeTracking"}},{"kind":"Field","name":{"kind":"Name","value":"backupPath"}},{"kind":"Field","name":{"kind":"Name","value":"backupInterval"}},{"kind":"Field","name":{"kind":"Name","value":"backupTime"}},{"kind":"Field","name":{"kind":"Name","value":"backupTTL"}}]}}]}}]} as unknown as DocumentNode<BackupSettingsQuery, BackupSettingsQueryVariables>;
export const BindTrackDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"BindTrack"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"BindTrackInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"bindTrack"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"trackRecord"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"trackerId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"score"}},{"kind":"Field","name":{"kind":"Name","value":"displayScore"}},{"kind":"Field","name":{"kind":"Name","value":"private"}},{"kind":"Field","name":{"kind":"Name","value":"remoteUrl"}},{"kind":"Field","name":{"kind":"Name","value":"startDate"}},{"kind":"Field","name":{"kind":"Name","value":"finishDate"}},{"kind":"Field","name":{"kind":"Name","value":"tracker"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"scores"}},{"kind":"Field","name":{"kind":"Name","value":"supportsReadingDates"}},{"kind":"Field","name":{"kind":"Name","value":"statuses"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<BindTrackMutation, BindTrackMutationVariables>;
export const CategoryCatalogDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CategoryCatalog"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"categories"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"order"},"value":{"kind":"ListValue","values":[{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"by"},"value":{"kind":"EnumValue","value":"ORDER"}},{"kind":"ObjectField","name":{"kind":"Name","value":"byType"},"value":{"kind":"EnumValue","value":"ASC"}}]}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"default"}},{"kind":"Field","name":{"kind":"Name","value":"isDefaultCategory"}},{"kind":"Field","name":{"kind":"Name","value":"order"}},{"kind":"Field","name":{"kind":"Name","value":"includeInUpdate"}},{"kind":"Field","name":{"kind":"Name","value":"includeInDownload"}},{"kind":"Field","name":{"kind":"Name","value":"mangas"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}}]}}]}}]}}]}}]} as unknown as DocumentNode<CategoryCatalogQuery, CategoryCatalogQueryVariables>;
export const ChapterFeedDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ChapterFeed"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Cursor"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ChapterFilterInput"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"order"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ChapterOrderInput"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"chapters"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}},{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}},{"kind":"Argument","name":{"kind":"Name","value":"order"},"value":{"kind":"Variable","name":{"kind":"Name","value":"order"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"chapterNumber"}},{"kind":"Field","name":{"kind":"Name","value":"pageCount"}},{"kind":"Field","name":{"kind":"Name","value":"isRead"}},{"kind":"Field","name":{"kind":"Name","value":"isDownloaded"}},{"kind":"Field","name":{"kind":"Name","value":"lastPageRead"}},{"kind":"Field","name":{"kind":"Name","value":"lastReadAt"}},{"kind":"Field","name":{"kind":"Name","value":"uploadDate"}},{"kind":"Field","name":{"kind":"Name","value":"scanlator"}},{"kind":"Field","name":{"kind":"Name","value":"manga"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}},{"kind":"Field","name":{"kind":"Name","value":"source"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"contentWarning"}}]}},{"kind":"Field","name":{"kind":"Name","value":"categories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"endCursor"}},{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}}]}}]}}]}}]} as unknown as DocumentNode<ChapterFeedQuery, ChapterFeedQueryVariables>;
export const ClearCachedImagesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ClearCachedImages"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ClearCachedImagesInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"clearCachedImages"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}}]}}]}}]} as unknown as DocumentNode<ClearCachedImagesMutation, ClearCachedImagesMutationVariables>;
export const CreateBackupDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateBackup"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateBackupInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createBackup"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]} as unknown as DocumentNode<CreateBackupMutation, CreateBackupMutationVariables>;
export const CreateCategoryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateCategory"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateCategoryInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createCategory"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"default"}},{"kind":"Field","name":{"kind":"Name","value":"isDefaultCategory"}},{"kind":"Field","name":{"kind":"Name","value":"order"}},{"kind":"Field","name":{"kind":"Name","value":"includeInUpdate"}},{"kind":"Field","name":{"kind":"Name","value":"includeInDownload"}},{"kind":"Field","name":{"kind":"Name","value":"mangas"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}}]}}]}}]}}]}}]} as unknown as DocumentNode<CreateCategoryMutation, CreateCategoryMutationVariables>;
export const DeleteCategoryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteCategory"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DeleteCategoryInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteCategory"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]} as unknown as DocumentNode<DeleteCategoryMutation, DeleteCategoryMutationVariables>;
export const DeleteDownloadedChapterDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteDownloadedChapter"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DeleteDownloadedChapterInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteDownloadedChapter"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"chapters"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isDownloaded"}}]}}]}}]}}]} as unknown as DocumentNode<DeleteDownloadedChapterMutation, DeleteDownloadedChapterMutationVariables>;
export const DeleteDownloadedChaptersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteDownloadedChapters"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DeleteDownloadedChaptersInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteDownloadedChapters"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"chapters"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isDownloaded"}}]}}]}}]}}]} as unknown as DocumentNode<DeleteDownloadedChaptersMutation, DeleteDownloadedChaptersMutationVariables>;
export const DeleteMangaNoteDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteMangaNote"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DeleteMangaMetaInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteMangaMeta"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"meta"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]}}]}}]} as unknown as DocumentNode<DeleteMangaNoteMutation, DeleteMangaNoteMutationVariables>;
export const DequeueDownloadDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DequeueDownload"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DequeueChapterDownloadInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"dequeueChapterDownload"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"downloadStatus"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"state"}}]}}]}}]}}]} as unknown as DocumentNode<DequeueDownloadMutation, DequeueDownloadMutationVariables>;
export const DownloadQueueDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"DownloadQueue"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"downloadStatus"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"queue"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"position"}},{"kind":"Field","name":{"kind":"Name","value":"progress"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"tries"}},{"kind":"Field","name":{"kind":"Name","value":"chapter"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"pageCount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"manga"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}},{"kind":"Field","name":{"kind":"Name","value":"source"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"contentWarning"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<DownloadQueueQuery, DownloadQueueQueryVariables>;
export const DownloadStatusChangedDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"subscription","name":{"kind":"Name","value":"DownloadStatusChanged"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"downloadStatusChanged"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"maxUpdates"},"value":{"kind":"IntValue","value":"1"}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"omittedUpdates"}}]}}]}}]} as unknown as DocumentNode<DownloadStatusChangedSubscription, DownloadStatusChangedSubscriptionVariables>;
export const EnqueueChapterDownloadsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"EnqueueChapterDownloads"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"EnqueueChapterDownloadsInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"enqueueChapterDownloads"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"downloadStatus"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"state"}}]}}]}}]}}]} as unknown as DocumentNode<EnqueueChapterDownloadsMutation, EnqueueChapterDownloadsMutationVariables>;
export const EnqueueDownloadDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"EnqueueDownload"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"EnqueueChapterDownloadInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"enqueueChapterDownload"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"downloadStatus"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"state"}}]}}]}}]}}]} as unknown as DocumentNode<EnqueueDownloadMutation, EnqueueDownloadMutationVariables>;
export const ExtensionsCatalogDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ExtensionsCatalog"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Cursor"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"extensions"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}},{"kind":"Argument","name":{"kind":"Name","value":"order"},"value":{"kind":"ListValue","values":[{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"by"},"value":{"kind":"EnumValue","value":"NAME"}},{"kind":"ObjectField","name":{"kind":"Name","value":"byType"},"value":{"kind":"EnumValue","value":"ASC"}}]}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"pkgName"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"versionName"}},{"kind":"Field","name":{"kind":"Name","value":"lang"}},{"kind":"Field","name":{"kind":"Name","value":"isInstalled"}},{"kind":"Field","name":{"kind":"Name","value":"hasUpdate"}},{"kind":"Field","name":{"kind":"Name","value":"isObsolete"}},{"kind":"Field","name":{"kind":"Name","value":"iconUrl"}},{"kind":"Field","name":{"kind":"Name","value":"contentWarning"}},{"kind":"Field","name":{"kind":"Name","value":"extensionStore"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"endCursor"}},{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}}]}}]}}]}}]} as unknown as DocumentNode<ExtensionsCatalogQuery, ExtensionsCatalogQueryVariables>;
export const FetchChapterPagesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"FetchChapterPages"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"FetchChapterPagesInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fetchChapterPages"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"chapter"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"pageCount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"pages"}}]}}]}}]} as unknown as DocumentNode<FetchChapterPagesMutation, FetchChapterPagesMutationVariables>;
export const FetchExtensionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"FetchExtensions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fetchExtensions"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"ObjectValue","fields":[]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"extensions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"pkgName"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"versionName"}},{"kind":"Field","name":{"kind":"Name","value":"lang"}},{"kind":"Field","name":{"kind":"Name","value":"isInstalled"}},{"kind":"Field","name":{"kind":"Name","value":"hasUpdate"}},{"kind":"Field","name":{"kind":"Name","value":"isObsolete"}},{"kind":"Field","name":{"kind":"Name","value":"iconUrl"}},{"kind":"Field","name":{"kind":"Name","value":"contentWarning"}},{"kind":"Field","name":{"kind":"Name","value":"extensionStore"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"extensionStores"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"badgeLabel"}},{"kind":"Field","name":{"kind":"Name","value":"indexUrl"}}]}}]}}]}}]} as unknown as DocumentNode<FetchExtensionsMutation, FetchExtensionsMutationVariables>;
export const FetchSourceMangaDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"FetchSourceManga"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"FetchSourceMangaInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fetchSourceManga"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"mangas"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}},{"kind":"Field","name":{"kind":"Name","value":"inLibrary"}},{"kind":"Field","name":{"kind":"Name","value":"sourceId"}}]}}]}}]}}]} as unknown as DocumentNode<FetchSourceMangaMutation, FetchSourceMangaMutationVariables>;
export const GlobalNsfwDefaultDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GlobalNsfwDefault"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"metas"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"key"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"equalTo"},"value":{"kind":"StringValue","value":"kakkee.nsfw-default","block":false}}]}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]}}]}}]} as unknown as DocumentNode<GlobalNsfwDefaultQuery, GlobalNsfwDefaultQueryVariables>;
export const SetGlobalNsfwDefaultDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SetGlobalNsfwDefault"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SetGlobalMetaInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setGlobalMeta"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"meta"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]}}]}}]} as unknown as DocumentNode<SetGlobalNsfwDefaultMutation, SetGlobalNsfwDefaultMutationVariables>;
export const GlobalSearchDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GlobalSearch"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"search"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"mangas"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"title"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"includesInsensitive"},"value":{"kind":"Variable","name":{"kind":"Name","value":"search"}}}]}}]}},{"kind":"Argument","name":{"kind":"Name","value":"order"},"value":{"kind":"ListValue","values":[{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"by"},"value":{"kind":"EnumValue","value":"TITLE"}},{"kind":"ObjectField","name":{"kind":"Name","value":"byType"},"value":{"kind":"EnumValue","value":"ASC"}}]}]}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"60"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}},{"kind":"Field","name":{"kind":"Name","value":"inLibrary"}},{"kind":"Field","name":{"kind":"Name","value":"unreadCount"}},{"kind":"Field","name":{"kind":"Name","value":"source"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}}]}}]}}]}}]}}]} as unknown as DocumentNode<GlobalSearchQuery, GlobalSearchQueryVariables>;
export const InstallExternalExtensionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"InstallExternalExtension"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"InstallExternalExtensionInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"installExternalExtension"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"extension"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"pkgName"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"isInstalled"}},{"kind":"Field","name":{"kind":"Name","value":"hasUpdate"}}]}}]}}]}}]} as unknown as DocumentNode<InstallExternalExtensionMutation, InstallExternalExtensionMutationVariables>;
export const LabeledMangaCategoriesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"LabeledMangaCategories"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"ids"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"mangas"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"id"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"in"},"value":{"kind":"Variable","name":{"kind":"Name","value":"ids"}}}]}}]}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"200"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"categories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<LabeledMangaCategoriesQuery, LabeledMangaCategoriesQueryVariables>;
export const LibraryCategoriesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"LibraryCategories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"categories"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"order"},"value":{"kind":"ListValue","values":[{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"by"},"value":{"kind":"EnumValue","value":"ORDER"}},{"kind":"ObjectField","name":{"kind":"Name","value":"byType"},"value":{"kind":"EnumValue","value":"ASC"}}]}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"order"}},{"kind":"Field","name":{"kind":"Name","value":"mangas"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}}]}}]}}]}}]}}]} as unknown as DocumentNode<LibraryCategoriesQuery, LibraryCategoriesQueryVariables>;
export const LibraryCategoryMembershipDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"LibraryCategoryMembership"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Cursor"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"mangas"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"inLibrary"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"equalTo"},"value":{"kind":"BooleanValue","value":true}}]}}]}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"categories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"endCursor"}},{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}}]}}]}}]}}]} as unknown as DocumentNode<LibraryCategoryMembershipQuery, LibraryCategoryMembershipQueryVariables>;
export const LibraryDuplicateScanDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"LibraryDuplicateScan"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Cursor"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"mangas"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"condition"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"inLibrary"},"value":{"kind":"BooleanValue","value":true}}]}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}},{"kind":"Argument","name":{"kind":"Name","value":"order"},"value":{"kind":"ListValue","values":[{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"by"},"value":{"kind":"EnumValue","value":"TITLE"}},{"kind":"ObjectField","name":{"kind":"Name","value":"byType"},"value":{"kind":"EnumValue","value":"ASC"}}]}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"sourceId"}}]}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"endCursor"}},{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}}]}}]}}]}}]} as unknown as DocumentNode<LibraryDuplicateScanQuery, LibraryDuplicateScanQueryVariables>;
export const LibraryMangasDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"LibraryMangas"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Cursor"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"MangaFilterInput"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"order"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"MangaOrderInput"}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"mangas"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"condition"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"inLibrary"},"value":{"kind":"BooleanValue","value":true}}]}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}},{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}},{"kind":"Argument","name":{"kind":"Name","value":"order"},"value":{"kind":"Variable","name":{"kind":"Name","value":"order"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrlLastFetched"}},{"kind":"Field","name":{"kind":"Name","value":"source"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"contentWarning"}}]}},{"kind":"Field","name":{"kind":"Name","value":"categories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"unreadCount"}},{"kind":"Field","name":{"kind":"Name","value":"downloadCount"}},{"kind":"Field","name":{"kind":"Name","value":"bookmarkCount"}},{"kind":"Field","name":{"kind":"Name","value":"trackRecords"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"lastReadChapter"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"chapterNumber"}},{"kind":"Field","name":{"kind":"Name","value":"lastPageRead"}},{"kind":"Field","name":{"kind":"Name","value":"pageCount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"endCursor"}},{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalCount"}}]}}]}}]} as unknown as DocumentNode<LibraryMangasQuery, LibraryMangasQueryVariables>;
export const LibraryUpdateStatusChangedDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"subscription","name":{"kind":"Name","value":"LibraryUpdateStatusChanged"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"libraryUpdateStatusChanged"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"maxUpdates"},"value":{"kind":"IntValue","value":"1"}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"jobsInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isRunning"}},{"kind":"Field","name":{"kind":"Name","value":"totalJobs"}},{"kind":"Field","name":{"kind":"Name","value":"finishedJobs"}},{"kind":"Field","name":{"kind":"Name","value":"skippedCategoriesCount"}},{"kind":"Field","name":{"kind":"Name","value":"skippedMangasCount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"omittedUpdates"}}]}}]}}]} as unknown as DocumentNode<LibraryUpdateStatusChangedSubscription, LibraryUpdateStatusChangedSubscriptionVariables>;
export const LoginDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Login"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"LoginInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"accessToken"}},{"kind":"Field","name":{"kind":"Name","value":"refreshToken"}}]}}]}}]} as unknown as DocumentNode<LoginMutation, LoginMutationVariables>;
export const LoginTrackerCredentialsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"LoginTrackerCredentials"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"LoginTrackerCredentialsInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"loginTrackerCredentials"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isLoggedIn"}}]}}]}}]} as unknown as DocumentNode<LoginTrackerCredentialsMutation, LoginTrackerCredentialsMutationVariables>;
export const LogoutTrackerDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"LogoutTracker"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"LogoutTrackerInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"logoutTracker"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tracker"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isLoggedIn"}}]}}]}}]}}]} as unknown as DocumentNode<LogoutTrackerMutation, LogoutTrackerMutationVariables>;
export const MangaCategoryPickerDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MangaCategoryPicker"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"mangaId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"manga"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"mangaId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"categories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"default"}},{"kind":"Field","name":{"kind":"Name","value":"isDefaultCategory"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"categories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"default"}},{"kind":"Field","name":{"kind":"Name","value":"isDefaultCategory"}}]}}]}}]}}]} as unknown as DocumentNode<MangaCategoryPickerQuery, MangaCategoryPickerQueryVariables>;
export const MangaChapterIdsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MangaChapterIds"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"mangaId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"chapters"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"mangaId"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"equalTo"},"value":{"kind":"Variable","name":{"kind":"Name","value":"mangaId"}}}]}}]}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"5000"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]} as unknown as DocumentNode<MangaChapterIdsQuery, MangaChapterIdsQueryVariables>;
export const MangaDetailDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MangaDetail"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"mangaId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Cursor"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"order"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ChapterOrderInput"}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"manga"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"mangaId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"author"}},{"kind":"Field","name":{"kind":"Name","value":"artist"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrlLastFetched"}},{"kind":"Field","name":{"kind":"Name","value":"genre"}},{"kind":"Field","name":{"kind":"Name","value":"inLibrary"}},{"kind":"Field","name":{"kind":"Name","value":"source"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"contentWarning"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"chapters"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"condition"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"mangaId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"mangaId"}}}]}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}},{"kind":"Argument","name":{"kind":"Name","value":"order"},"value":{"kind":"Variable","name":{"kind":"Name","value":"order"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"chapterNumber"}},{"kind":"Field","name":{"kind":"Name","value":"pageCount"}},{"kind":"Field","name":{"kind":"Name","value":"isRead"}},{"kind":"Field","name":{"kind":"Name","value":"isBookmarked"}},{"kind":"Field","name":{"kind":"Name","value":"isDownloaded"}},{"kind":"Field","name":{"kind":"Name","value":"lastPageRead"}},{"kind":"Field","name":{"kind":"Name","value":"scanlator"}},{"kind":"Field","name":{"kind":"Name","value":"uploadDate"}},{"kind":"Field","name":{"kind":"Name","value":"sourceOrder"}}]}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"endCursor"}},{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalCount"}}]}}]}}]} as unknown as DocumentNode<MangaDetailQuery, MangaDetailQueryVariables>;
export const MangaNotesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MangaNotes"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"mangaId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"manga"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"mangaId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"meta"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]}}]}}]} as unknown as DocumentNode<MangaNotesQuery, MangaNotesQueryVariables>;
export const MangaTrackingDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MangaTracking"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"mangaId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"manga"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"mangaId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"trackRecords"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"trackerId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"score"}},{"kind":"Field","name":{"kind":"Name","value":"displayScore"}},{"kind":"Field","name":{"kind":"Name","value":"private"}},{"kind":"Field","name":{"kind":"Name","value":"remoteUrl"}},{"kind":"Field","name":{"kind":"Name","value":"startDate"}},{"kind":"Field","name":{"kind":"Name","value":"finishDate"}},{"kind":"Field","name":{"kind":"Name","value":"tracker"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"scores"}},{"kind":"Field","name":{"kind":"Name","value":"supportsReadingDates"}},{"kind":"Field","name":{"kind":"Name","value":"statuses"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<MangaTrackingQuery, MangaTrackingQueryVariables>;
export const NavigationBadgesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"NavigationBadges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"downloadStatus"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"queue"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"position"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"extensions"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"hasUpdate"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"equalTo"},"value":{"kind":"BooleanValue","value":true}}]}}]}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"1"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}}]}}]}}]} as unknown as DocumentNode<NavigationBadgesQuery, NavigationBadgesQueryVariables>;
export const ReaderChapterDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ReaderChapter"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"chapterId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"chapter"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"chapterId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"pageCount"}},{"kind":"Field","name":{"kind":"Name","value":"chapterNumber"}},{"kind":"Field","name":{"kind":"Name","value":"sourceOrder"}},{"kind":"Field","name":{"kind":"Name","value":"isRead"}},{"kind":"Field","name":{"kind":"Name","value":"isDownloaded"}},{"kind":"Field","name":{"kind":"Name","value":"isBookmarked"}},{"kind":"Field","name":{"kind":"Name","value":"lastPageRead"}},{"kind":"Field","name":{"kind":"Name","value":"manga"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}},{"kind":"Field","name":{"kind":"Name","value":"inLibrary"}},{"kind":"Field","name":{"kind":"Name","value":"source"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"contentWarning"}}]}}]}}]}}]}}]} as unknown as DocumentNode<ReaderChapterQuery, ReaderChapterQueryVariables>;
export const ReaderChapterListDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ReaderChapterList"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"mangaId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"chapters"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"mangaId"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"equalTo"},"value":{"kind":"Variable","name":{"kind":"Name","value":"mangaId"}}}]}}]}},{"kind":"Argument","name":{"kind":"Name","value":"order"},"value":{"kind":"ListValue","values":[{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"by"},"value":{"kind":"EnumValue","value":"SOURCE_ORDER"}},{"kind":"ObjectField","name":{"kind":"Name","value":"byType"},"value":{"kind":"EnumValue","value":"DESC"}}]}]}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"1000"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"chapterNumber"}},{"kind":"Field","name":{"kind":"Name","value":"isRead"}}]}}]}}]}}]} as unknown as DocumentNode<ReaderChapterListQuery, ReaderChapterListQueryVariables>;
export const ReaderNeighborsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ReaderNeighbors"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"mangaId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"chapterNumber"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Float"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"previous"},"name":{"kind":"Name","value":"chapters"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"condition"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"mangaId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"mangaId"}}}]}},{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"chapterNumber"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"lessThan"},"value":{"kind":"Variable","name":{"kind":"Name","value":"chapterNumber"}}}]}}]}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"1"}},{"kind":"Argument","name":{"kind":"Name","value":"order"},"value":{"kind":"ListValue","values":[{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"by"},"value":{"kind":"EnumValue","value":"CHAPTER_NUMBER"}},{"kind":"ObjectField","name":{"kind":"Name","value":"byType"},"value":{"kind":"EnumValue","value":"DESC"}}]}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"chapterNumber"}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"next"},"name":{"kind":"Name","value":"chapters"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"condition"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"mangaId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"mangaId"}}}]}},{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"chapterNumber"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"greaterThan"},"value":{"kind":"Variable","name":{"kind":"Name","value":"chapterNumber"}}}]}}]}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"1"}},{"kind":"Argument","name":{"kind":"Name","value":"order"},"value":{"kind":"ListValue","values":[{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"by"},"value":{"kind":"EnumValue","value":"CHAPTER_NUMBER"}},{"kind":"ObjectField","name":{"kind":"Name","value":"byType"},"value":{"kind":"EnumValue","value":"ASC"}}]}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"chapterNumber"}}]}}]}}]}}]} as unknown as DocumentNode<ReaderNeighborsQuery, ReaderNeighborsQueryVariables>;
export const ReadingFeedDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ReadingFeed"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Cursor"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"mangas"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"condition"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"inLibrary"},"value":{"kind":"BooleanValue","value":true}}]}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}},{"kind":"Field","name":{"kind":"Name","value":"source"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"contentWarning"}}]}},{"kind":"Field","name":{"kind":"Name","value":"categories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"latestUploadedChapter"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"chapterNumber"}},{"kind":"Field","name":{"kind":"Name","value":"pageCount"}},{"kind":"Field","name":{"kind":"Name","value":"isRead"}},{"kind":"Field","name":{"kind":"Name","value":"isDownloaded"}},{"kind":"Field","name":{"kind":"Name","value":"lastPageRead"}},{"kind":"Field","name":{"kind":"Name","value":"lastReadAt"}},{"kind":"Field","name":{"kind":"Name","value":"uploadDate"}},{"kind":"Field","name":{"kind":"Name","value":"scanlator"}},{"kind":"Field","name":{"kind":"Name","value":"sourceOrder"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"endCursor"}},{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalCount"}}]}}]}}]} as unknown as DocumentNode<ReadingFeedQuery, ReadingFeedQueryVariables>;
export const RecentlyReadDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"RecentlyRead"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Cursor"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"chapters"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"inLibrary"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"equalTo"},"value":{"kind":"BooleanValue","value":true}}]}},{"kind":"ObjectField","name":{"kind":"Name","value":"lastReadAt"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"greaterThan"},"value":{"kind":"StringValue","value":"0","block":false}}]}}]}},{"kind":"Argument","name":{"kind":"Name","value":"order"},"value":{"kind":"ListValue","values":[{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"by"},"value":{"kind":"EnumValue","value":"LAST_READ_AT"}},{"kind":"ObjectField","name":{"kind":"Name","value":"byType"},"value":{"kind":"EnumValue","value":"DESC"}}]}]}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"chapterNumber"}},{"kind":"Field","name":{"kind":"Name","value":"isRead"}},{"kind":"Field","name":{"kind":"Name","value":"lastReadAt"}},{"kind":"Field","name":{"kind":"Name","value":"lastPageRead"}},{"kind":"Field","name":{"kind":"Name","value":"pageCount"}},{"kind":"Field","name":{"kind":"Name","value":"manga"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}},{"kind":"Field","name":{"kind":"Name","value":"source"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"contentWarning"}}]}},{"kind":"Field","name":{"kind":"Name","value":"categories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"firstUnreadChapter"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"chapterNumber"}},{"kind":"Field","name":{"kind":"Name","value":"lastPageRead"}},{"kind":"Field","name":{"kind":"Name","value":"pageCount"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"endCursor"}},{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}}]}}]}}]}}]} as unknown as DocumentNode<RecentlyReadQuery, RecentlyReadQueryVariables>;
export const RefreshMangaDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RefreshManga"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"FetchMangaAndChaptersInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fetchMangaAndChapters"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"manga"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}}]}},{"kind":"Field","name":{"kind":"Name","value":"chapters"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]} as unknown as DocumentNode<RefreshMangaMutation, RefreshMangaMutationVariables>;
export const RefreshTokenDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RefreshToken"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RefreshTokenInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"refreshToken"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"accessToken"}}]}}]}}]} as unknown as DocumentNode<RefreshTokenMutation, RefreshTokenMutationVariables>;
export const RemoveExtensionStoreDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RemoveExtensionStore"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RemoveExtensionStoreInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"removeExtensionStore"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"extensionStore"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"indexUrl"}}]}}]}}]}}]} as unknown as DocumentNode<RemoveExtensionStoreMutation, RemoveExtensionStoreMutationVariables>;
export const RestoreBackupDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RestoreBackup"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RestoreBackupInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"restoreBackup"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"state"}}]}}]}}]}}]} as unknown as DocumentNode<RestoreBackupMutation, RestoreBackupMutationVariables>;
export const SearchTrackerDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SearchTracker"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SearchTrackerInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"searchTracker"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"trackSearches"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"remoteId"}},{"kind":"Field","name":{"kind":"Name","value":"trackerId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"coverUrl"}},{"kind":"Field","name":{"kind":"Name","value":"summary"}},{"kind":"Field","name":{"kind":"Name","value":"totalChapters"}},{"kind":"Field","name":{"kind":"Name","value":"publishingStatus"}},{"kind":"Field","name":{"kind":"Name","value":"publishingType"}},{"kind":"Field","name":{"kind":"Name","value":"score"}},{"kind":"Field","name":{"kind":"Name","value":"displayScore"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]}}]} as unknown as DocumentNode<SearchTrackerQuery, SearchTrackerQueryVariables>;
export const ServerSettingsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ServerSettings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"settings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"authMode"}},{"kind":"Field","name":{"kind":"Name","value":"authUsername"}},{"kind":"Field","name":{"kind":"Name","value":"authPassword"}},{"kind":"Field","name":{"kind":"Name","value":"databaseType"}},{"kind":"Field","name":{"kind":"Name","value":"databaseUrl"}},{"kind":"Field","name":{"kind":"Name","value":"databaseUsername"}},{"kind":"Field","name":{"kind":"Name","value":"databasePassword"}},{"kind":"Field","name":{"kind":"Name","value":"updateMangas"}},{"kind":"Field","name":{"kind":"Name","value":"autoDownloadNewChapters"}},{"kind":"Field","name":{"kind":"Name","value":"autoDownloadNewChaptersLimit"}},{"kind":"Field","name":{"kind":"Name","value":"downloadAsCbz"}},{"kind":"Field","name":{"kind":"Name","value":"downloadsPath"}},{"kind":"Field","name":{"kind":"Name","value":"maxSourcesInParallel"}},{"kind":"Field","name":{"kind":"Name","value":"globalUpdateInterval"}},{"kind":"Field","name":{"kind":"Name","value":"excludeCompleted"}},{"kind":"Field","name":{"kind":"Name","value":"excludeNotStarted"}},{"kind":"Field","name":{"kind":"Name","value":"excludeUnreadChapters"}},{"kind":"Field","name":{"kind":"Name","value":"excludeEntryWithUnreadChapters"}},{"kind":"Field","name":{"kind":"Name","value":"debugLogsEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"backupPath"}},{"kind":"Field","name":{"kind":"Name","value":"backupInterval"}},{"kind":"Field","name":{"kind":"Name","value":"webUIChannel"}},{"kind":"Field","name":{"kind":"Name","value":"webUIFlavor"}},{"kind":"Field","name":{"kind":"Name","value":"webUIInterface"}},{"kind":"Field","name":{"kind":"Name","value":"opdsCbzMimetype"}},{"kind":"Field","name":{"kind":"Name","value":"opdsChapterSortOrder"}},{"kind":"Field","name":{"kind":"Name","value":"opdsEnablePageReadProgress"}},{"kind":"Field","name":{"kind":"Name","value":"opdsItemsPerPage"}},{"kind":"Field","name":{"kind":"Name","value":"opdsMarkAsReadOnDownload"}},{"kind":"Field","name":{"kind":"Name","value":"opdsShowOnlyDownloadedChapters"}},{"kind":"Field","name":{"kind":"Name","value":"opdsShowOnlyUnreadChapters"}},{"kind":"Field","name":{"kind":"Name","value":"opdsSkipChapterMetadataFeed"}},{"kind":"Field","name":{"kind":"Name","value":"opdsUseBinaryFileSizes"}},{"kind":"Field","name":{"kind":"Name","value":"koreaderSyncChecksumMethod"}},{"kind":"Field","name":{"kind":"Name","value":"koreaderSyncPercentageTolerance"}},{"kind":"Field","name":{"kind":"Name","value":"koreaderSyncStrategyBackward"}},{"kind":"Field","name":{"kind":"Name","value":"koreaderSyncStrategyForward"}},{"kind":"Field","name":{"kind":"Name","value":"downloadConversions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"mimeType"}},{"kind":"Field","name":{"kind":"Name","value":"target"}},{"kind":"Field","name":{"kind":"Name","value":"compressionLevel"}}]}},{"kind":"Field","name":{"kind":"Name","value":"serveConversions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"mimeType"}},{"kind":"Field","name":{"kind":"Name","value":"target"}},{"kind":"Field","name":{"kind":"Name","value":"compressionLevel"}}]}}]}}]}}]} as unknown as DocumentNode<ServerSettingsQuery, ServerSettingsQueryVariables>;
export const SetMangaCategoriesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SetMangaCategories"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateMangaCategoriesInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateMangaCategories"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"manga"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"categories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<SetMangaCategoriesMutation, SetMangaCategoriesMutationVariables>;
export const SetMangaNoteDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SetMangaNote"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SetMangaMetaInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setMangaMeta"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"meta"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]}}]}}]} as unknown as DocumentNode<SetMangaNoteMutation, SetMangaNoteMutationVariables>;
export const SourceCatalogDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SourceCatalog"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sources"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"order"},"value":{"kind":"ListValue","values":[{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"by"},"value":{"kind":"EnumValue","value":"NAME"}},{"kind":"ObjectField","name":{"kind":"Name","value":"byType"},"value":{"kind":"EnumValue","value":"ASC"}}]}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}},{"kind":"Field","name":{"kind":"Name","value":"lang"}},{"kind":"Field","name":{"kind":"Name","value":"isNsfw"}},{"kind":"Field","name":{"kind":"Name","value":"contentWarning"}},{"kind":"Field","name":{"kind":"Name","value":"supportsLatest"}},{"kind":"Field","name":{"kind":"Name","value":"iconUrl"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalCount"}}]}}]}}]} as unknown as DocumentNode<SourceCatalogQuery, SourceCatalogQueryVariables>;
export const SourceInfoDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SourceInfo"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"LongString"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"source"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"lang"}},{"kind":"Field","name":{"kind":"Name","value":"contentWarning"}},{"kind":"Field","name":{"kind":"Name","value":"filters"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TextFilter"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","alias":{"kind":"Name","value":"textDefault"},"name":{"kind":"Name","value":"default"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SelectFilter"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","alias":{"kind":"Name","value":"selectDefault"},"name":{"kind":"Name","value":"default"}},{"kind":"Field","name":{"kind":"Name","value":"values"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CheckBoxFilter"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","alias":{"kind":"Name","value":"checkDefault"},"name":{"kind":"Name","value":"default"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TriStateFilter"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","alias":{"kind":"Name","value":"triDefault"},"name":{"kind":"Name","value":"default"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SortFilter"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","alias":{"kind":"Name","value":"sortDefault"},"name":{"kind":"Name","value":"default"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"index"}},{"kind":"Field","name":{"kind":"Name","value":"ascending"}}]}},{"kind":"Field","name":{"kind":"Name","value":"values"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"HeaderFilter"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SeparatorFilter"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"GroupFilter"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"filters"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TextFilter"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","alias":{"kind":"Name","value":"textDefault"},"name":{"kind":"Name","value":"default"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SelectFilter"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","alias":{"kind":"Name","value":"selectDefault"},"name":{"kind":"Name","value":"default"}},{"kind":"Field","name":{"kind":"Name","value":"values"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CheckBoxFilter"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","alias":{"kind":"Name","value":"checkDefault"},"name":{"kind":"Name","value":"default"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TriStateFilter"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","alias":{"kind":"Name","value":"triDefault"},"name":{"kind":"Name","value":"default"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SortFilter"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","alias":{"kind":"Name","value":"sortDefault"},"name":{"kind":"Name","value":"default"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"index"}},{"kind":"Field","name":{"kind":"Name","value":"ascending"}}]}},{"kind":"Field","name":{"kind":"Name","value":"values"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"HeaderFilter"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SeparatorFilter"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<SourceInfoQuery, SourceInfoQueryVariables>;
export const SourcePreferencesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SourcePreferences"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sourceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"LongString"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"source"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sourceId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}},{"kind":"Field","name":{"kind":"Name","value":"preferences"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CheckBoxPreference"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"summary"}},{"kind":"Field","alias":{"kind":"Name","value":"checkValue"},"name":{"kind":"Name","value":"currentValue"}},{"kind":"Field","name":{"kind":"Name","value":"enabled"}},{"kind":"Field","name":{"kind":"Name","value":"visible"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SwitchPreference"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"summary"}},{"kind":"Field","alias":{"kind":"Name","value":"switchValue"},"name":{"kind":"Name","value":"currentValue"}},{"kind":"Field","name":{"kind":"Name","value":"enabled"}},{"kind":"Field","name":{"kind":"Name","value":"visible"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"EditTextPreference"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"summary"}},{"kind":"Field","alias":{"kind":"Name","value":"textValue"},"name":{"kind":"Name","value":"currentValue"}},{"kind":"Field","name":{"kind":"Name","value":"enabled"}},{"kind":"Field","name":{"kind":"Name","value":"visible"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ListPreference"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"summary"}},{"kind":"Field","alias":{"kind":"Name","value":"listValue"},"name":{"kind":"Name","value":"currentValue"}},{"kind":"Field","name":{"kind":"Name","value":"entries"}},{"kind":"Field","name":{"kind":"Name","value":"entryValues"}},{"kind":"Field","name":{"kind":"Name","value":"enabled"}},{"kind":"Field","name":{"kind":"Name","value":"visible"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MultiSelectListPreference"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"summary"}},{"kind":"Field","alias":{"kind":"Name","value":"multiValue"},"name":{"kind":"Name","value":"currentValue"}},{"kind":"Field","name":{"kind":"Name","value":"entries"}},{"kind":"Field","name":{"kind":"Name","value":"entryValues"}},{"kind":"Field","name":{"kind":"Name","value":"enabled"}},{"kind":"Field","name":{"kind":"Name","value":"visible"}}]}}]}}]}}]}}]} as unknown as DocumentNode<SourcePreferencesQuery, SourcePreferencesQueryVariables>;
export const StartDownloaderDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"StartDownloader"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"startDownloader"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"ObjectValue","fields":[]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"downloadStatus"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"state"}}]}}]}}]}}]} as unknown as DocumentNode<StartDownloaderMutation, StartDownloaderMutationVariables>;
export const StartLibraryUpdateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"StartLibraryUpdate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateLibraryInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateLibrary"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateStatus"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"jobsInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isRunning"}},{"kind":"Field","name":{"kind":"Name","value":"totalJobs"}},{"kind":"Field","name":{"kind":"Name","value":"finishedJobs"}},{"kind":"Field","name":{"kind":"Name","value":"skippedCategoriesCount"}},{"kind":"Field","name":{"kind":"Name","value":"skippedMangasCount"}}]}}]}}]}}]}}]} as unknown as DocumentNode<StartLibraryUpdateMutation, StartLibraryUpdateMutationVariables>;
export const StartSyncDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"StartSync"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"startSync"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"ObjectValue","fields":[]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"result"}}]}}]}}]} as unknown as DocumentNode<StartSyncMutation, StartSyncMutationVariables>;
export const StopDownloaderDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"StopDownloader"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"stopDownloader"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"ObjectValue","fields":[]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"downloadStatus"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"state"}}]}}]}}]}}]} as unknown as DocumentNode<StopDownloaderMutation, StopDownloaderMutationVariables>;
export const SyncSettingsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SyncSettings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"settings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"syncInterval"}},{"kind":"Field","name":{"kind":"Name","value":"syncDataCategories"}},{"kind":"Field","name":{"kind":"Name","value":"syncDataChapters"}},{"kind":"Field","name":{"kind":"Name","value":"syncDataHistory"}},{"kind":"Field","name":{"kind":"Name","value":"syncDataManga"}},{"kind":"Field","name":{"kind":"Name","value":"syncDataTracking"}},{"kind":"Field","name":{"kind":"Name","value":"syncYomiEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"syncYomiHost"}},{"kind":"Field","name":{"kind":"Name","value":"syncYomiApiKey"}}]}}]}}]} as unknown as DocumentNode<SyncSettingsQuery, SyncSettingsQueryVariables>;
export const SyncStatusChangedDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"subscription","name":{"kind":"Name","value":"SyncStatusChanged"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"syncStatusChanged"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"startDate"}},{"kind":"Field","name":{"kind":"Name","value":"endDate"}},{"kind":"Field","name":{"kind":"Name","value":"errorMessage"}},{"kind":"Field","name":{"kind":"Name","value":"backupRestoreId"}}]}}]}}]} as unknown as DocumentNode<SyncStatusChangedSubscription, SyncStatusChangedSubscriptionVariables>;
export const TrackProgressDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"TrackProgress"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"TrackProgressInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"trackProgress"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"trackRecords"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"trackerId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"score"}},{"kind":"Field","name":{"kind":"Name","value":"displayScore"}},{"kind":"Field","name":{"kind":"Name","value":"private"}},{"kind":"Field","name":{"kind":"Name","value":"remoteUrl"}},{"kind":"Field","name":{"kind":"Name","value":"startDate"}},{"kind":"Field","name":{"kind":"Name","value":"finishDate"}},{"kind":"Field","name":{"kind":"Name","value":"tracker"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"scores"}},{"kind":"Field","name":{"kind":"Name","value":"supportsReadingDates"}},{"kind":"Field","name":{"kind":"Name","value":"statuses"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<TrackProgressMutation, TrackProgressMutationVariables>;
export const TrackingServicesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"TrackingServices"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"trackers"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"50"}},{"kind":"Argument","name":{"kind":"Name","value":"order"},"value":{"kind":"ListValue","values":[{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"by"},"value":{"kind":"EnumValue","value":"NAME"}},{"kind":"ObjectField","name":{"kind":"Name","value":"byType"},"value":{"kind":"EnumValue","value":"ASC"}}]}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"icon"}},{"kind":"Field","name":{"kind":"Name","value":"isLoggedIn"}},{"kind":"Field","name":{"kind":"Name","value":"isTokenExpired"}},{"kind":"Field","name":{"kind":"Name","value":"authUrl"}},{"kind":"Field","name":{"kind":"Name","value":"supportsPrivateTracking"}},{"kind":"Field","name":{"kind":"Name","value":"supportsReadingDates"}},{"kind":"Field","name":{"kind":"Name","value":"supportsTrackDeletion"}},{"kind":"Field","name":{"kind":"Name","value":"scores"}},{"kind":"Field","name":{"kind":"Name","value":"statuses"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]}}]}}]}}]} as unknown as DocumentNode<TrackingServicesQuery, TrackingServicesQueryVariables>;
export const UnbindTrackDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UnbindTrack"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UnbindTrackInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"unbindTrack"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"trackRecord"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]} as unknown as DocumentNode<UnbindTrackMutation, UnbindTrackMutationVariables>;
export const UpdateBackupSettingsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateBackupSettings"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"settings"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"PartialSettingsTypeInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setSettings"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"settings"},"value":{"kind":"Variable","name":{"kind":"Name","value":"settings"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"settings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"autoBackupIncludeCategories"}},{"kind":"Field","name":{"kind":"Name","value":"autoBackupIncludeChapters"}},{"kind":"Field","name":{"kind":"Name","value":"autoBackupIncludeClientData"}},{"kind":"Field","name":{"kind":"Name","value":"autoBackupIncludeHistory"}},{"kind":"Field","name":{"kind":"Name","value":"autoBackupIncludeManga"}},{"kind":"Field","name":{"kind":"Name","value":"autoBackupIncludeServerSettings"}},{"kind":"Field","name":{"kind":"Name","value":"autoBackupIncludeTracking"}},{"kind":"Field","name":{"kind":"Name","value":"backupPath"}},{"kind":"Field","name":{"kind":"Name","value":"backupInterval"}},{"kind":"Field","name":{"kind":"Name","value":"backupTime"}},{"kind":"Field","name":{"kind":"Name","value":"backupTTL"}}]}}]}}]}}]} as unknown as DocumentNode<UpdateBackupSettingsMutation, UpdateBackupSettingsMutationVariables>;
export const UpdateCategoryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateCategory"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateCategoryInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateCategory"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"default"}},{"kind":"Field","name":{"kind":"Name","value":"isDefaultCategory"}},{"kind":"Field","name":{"kind":"Name","value":"order"}},{"kind":"Field","name":{"kind":"Name","value":"includeInUpdate"}},{"kind":"Field","name":{"kind":"Name","value":"includeInDownload"}},{"kind":"Field","name":{"kind":"Name","value":"mangas"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}}]}}]}}]}}]}}]} as unknown as DocumentNode<UpdateCategoryMutation, UpdateCategoryMutationVariables>;
export const UpdateCategoryOrderDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateCategoryOrder"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateCategoryOrderInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateCategoryOrder"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"categories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"order"}}]}}]}}]}}]} as unknown as DocumentNode<UpdateCategoryOrderMutation, UpdateCategoryOrderMutationVariables>;
export const UpdateChapterProgressDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateChapterProgress"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateChapterInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateChapter"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"chapter"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isRead"}},{"kind":"Field","name":{"kind":"Name","value":"isBookmarked"}},{"kind":"Field","name":{"kind":"Name","value":"lastPageRead"}}]}}]}}]}}]} as unknown as DocumentNode<UpdateChapterProgressMutation, UpdateChapterProgressMutationVariables>;
export const UpdateChaptersStateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateChaptersState"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateChaptersInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateChapters"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"chapters"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isRead"}},{"kind":"Field","name":{"kind":"Name","value":"isBookmarked"}},{"kind":"Field","name":{"kind":"Name","value":"isDownloaded"}}]}}]}}]}}]} as unknown as DocumentNode<UpdateChaptersStateMutation, UpdateChaptersStateMutationVariables>;
export const UpdateExtensionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateExtensions"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateExtensionsInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateExtensions"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"extensions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"pkgName"}},{"kind":"Field","name":{"kind":"Name","value":"isInstalled"}},{"kind":"Field","name":{"kind":"Name","value":"hasUpdate"}}]}}]}}]}}]} as unknown as DocumentNode<UpdateExtensionsMutation, UpdateExtensionsMutationVariables>;
export const UpdateMangaLibraryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateMangaLibrary"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateMangaInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateManga"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"manga"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"inLibrary"}}]}}]}}]}}]} as unknown as DocumentNode<UpdateMangaLibraryMutation, UpdateMangaLibraryMutationVariables>;
export const UpdateMangasCategoriesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateMangasCategories"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateMangasCategoriesInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateMangasCategories"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"mangas"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]} as unknown as DocumentNode<UpdateMangasCategoriesMutation, UpdateMangasCategoriesMutationVariables>;
export const UpdateMangasLibraryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateMangasLibrary"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateMangasInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateMangas"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"mangas"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"inLibrary"}}]}}]}}]}}]} as unknown as DocumentNode<UpdateMangasLibraryMutation, UpdateMangasLibraryMutationVariables>;
export const UpdateServerSettingsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateServerSettings"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"settings"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"PartialSettingsTypeInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setSettings"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"settings"},"value":{"kind":"Variable","name":{"kind":"Name","value":"settings"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"settings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateMangas"}},{"kind":"Field","name":{"kind":"Name","value":"autoDownloadNewChapters"}},{"kind":"Field","name":{"kind":"Name","value":"autoDownloadNewChaptersLimit"}},{"kind":"Field","name":{"kind":"Name","value":"downloadAsCbz"}},{"kind":"Field","name":{"kind":"Name","value":"maxSourcesInParallel"}},{"kind":"Field","name":{"kind":"Name","value":"globalUpdateInterval"}},{"kind":"Field","name":{"kind":"Name","value":"excludeCompleted"}},{"kind":"Field","name":{"kind":"Name","value":"excludeNotStarted"}},{"kind":"Field","name":{"kind":"Name","value":"excludeUnreadChapters"}},{"kind":"Field","name":{"kind":"Name","value":"excludeEntryWithUnreadChapters"}},{"kind":"Field","name":{"kind":"Name","value":"debugLogsEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"opdsCbzMimetype"}},{"kind":"Field","name":{"kind":"Name","value":"opdsChapterSortOrder"}},{"kind":"Field","name":{"kind":"Name","value":"opdsEnablePageReadProgress"}},{"kind":"Field","name":{"kind":"Name","value":"opdsItemsPerPage"}},{"kind":"Field","name":{"kind":"Name","value":"opdsMarkAsReadOnDownload"}},{"kind":"Field","name":{"kind":"Name","value":"opdsShowOnlyDownloadedChapters"}},{"kind":"Field","name":{"kind":"Name","value":"opdsShowOnlyUnreadChapters"}},{"kind":"Field","name":{"kind":"Name","value":"opdsSkipChapterMetadataFeed"}},{"kind":"Field","name":{"kind":"Name","value":"opdsUseBinaryFileSizes"}},{"kind":"Field","name":{"kind":"Name","value":"koreaderSyncChecksumMethod"}},{"kind":"Field","name":{"kind":"Name","value":"koreaderSyncPercentageTolerance"}},{"kind":"Field","name":{"kind":"Name","value":"koreaderSyncStrategyBackward"}},{"kind":"Field","name":{"kind":"Name","value":"koreaderSyncStrategyForward"}},{"kind":"Field","name":{"kind":"Name","value":"downloadConversions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"mimeType"}},{"kind":"Field","name":{"kind":"Name","value":"target"}},{"kind":"Field","name":{"kind":"Name","value":"compressionLevel"}}]}},{"kind":"Field","name":{"kind":"Name","value":"serveConversions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"mimeType"}},{"kind":"Field","name":{"kind":"Name","value":"target"}},{"kind":"Field","name":{"kind":"Name","value":"compressionLevel"}}]}}]}}]}}]}}]} as unknown as DocumentNode<UpdateServerSettingsMutation, UpdateServerSettingsMutationVariables>;
export const UpdateSourcePreferenceDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateSourcePreference"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateSourcePreferenceInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateSourcePreference"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"preferences"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CheckBoxPreference"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","alias":{"kind":"Name","value":"checkValue"},"name":{"kind":"Name","value":"currentValue"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SwitchPreference"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","alias":{"kind":"Name","value":"switchValue"},"name":{"kind":"Name","value":"currentValue"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"EditTextPreference"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","alias":{"kind":"Name","value":"textValue"},"name":{"kind":"Name","value":"currentValue"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ListPreference"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","alias":{"kind":"Name","value":"listValue"},"name":{"kind":"Name","value":"currentValue"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MultiSelectListPreference"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","alias":{"kind":"Name","value":"multiValue"},"name":{"kind":"Name","value":"currentValue"}}]}}]}}]}}]}}]} as unknown as DocumentNode<UpdateSourcePreferenceMutation, UpdateSourcePreferenceMutationVariables>;
export const UpdateSyncSettingsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateSyncSettings"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"settings"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"PartialSettingsTypeInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setSettings"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"settings"},"value":{"kind":"Variable","name":{"kind":"Name","value":"settings"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"settings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"syncDataCategories"}},{"kind":"Field","name":{"kind":"Name","value":"syncDataChapters"}},{"kind":"Field","name":{"kind":"Name","value":"syncDataHistory"}},{"kind":"Field","name":{"kind":"Name","value":"syncDataManga"}},{"kind":"Field","name":{"kind":"Name","value":"syncDataTracking"}},{"kind":"Field","name":{"kind":"Name","value":"syncYomiEnabled"}}]}}]}}]}}]} as unknown as DocumentNode<UpdateSyncSettingsMutation, UpdateSyncSettingsMutationVariables>;
export const UpdateTrackDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateTrack"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateTrackInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateTrack"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"trackRecord"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"score"}},{"kind":"Field","name":{"kind":"Name","value":"displayScore"}},{"kind":"Field","name":{"kind":"Name","value":"trackerId"}},{"kind":"Field","name":{"kind":"Name","value":"startDate"}},{"kind":"Field","name":{"kind":"Name","value":"finishDate"}},{"kind":"Field","name":{"kind":"Name","value":"private"}}]}}]}}]}}]} as unknown as DocumentNode<UpdateTrackMutation, UpdateTrackMutationVariables>;
export const ValidateBackupDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ValidateBackup"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ValidateBackupInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"validateBackup"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"missingSources"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"missingTrackers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<ValidateBackupQuery, ValidateBackupQueryVariables>;
export const UpdateWebUiDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateWebUI"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateWebUI"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"ObjectValue","fields":[]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateStatus"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"info"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"channel"}},{"kind":"Field","name":{"kind":"Name","value":"tag"}}]}},{"kind":"Field","name":{"kind":"Name","value":"progress"}},{"kind":"Field","name":{"kind":"Name","value":"state"}}]}}]}}]}}]} as unknown as DocumentNode<UpdateWebUiMutation, UpdateWebUiMutationVariables>;
export const WebUiUpdateStatusChangeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"subscription","name":{"kind":"Name","value":"WebUIUpdateStatusChange"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"webUIUpdateStatusChange"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"info"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"channel"}},{"kind":"Field","name":{"kind":"Name","value":"tag"}}]}},{"kind":"Field","name":{"kind":"Name","value":"progress"}},{"kind":"Field","name":{"kind":"Name","value":"state"}}]}}]}}]} as unknown as DocumentNode<WebUiUpdateStatusChangeSubscription, WebUiUpdateStatusChangeSubscriptionVariables>;