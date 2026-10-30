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
    "query CategoryCatalog {\n  categories(order: [{by: ORDER, byType: ASC}]) {\n    nodes {\n      id\n      name\n      default\n      isDefaultCategory\n      order\n      mangas {\n        totalCount\n      }\n    }\n  }\n}": typeof types.CategoryCatalogDocument,
    "query ChapterFeed($first: Int!, $filter: ChapterFilterInput, $order: [ChapterOrderInput!]!) {\n  chapters(first: $first, filter: $filter, order: $order) {\n    nodes {\n      id\n      name\n      chapterNumber\n      pageCount\n      isRead\n      isDownloaded\n      lastPageRead\n      lastReadAt\n      uploadDate\n      manga {\n        id\n        title\n        thumbnailUrl\n      }\n    }\n    totalCount\n  }\n}": typeof types.ChapterFeedDocument,
    "mutation DeleteDownloadedChapter($input: DeleteDownloadedChapterInput!) {\n  deleteDownloadedChapter(input: $input) {\n    chapters {\n      id\n      isDownloaded\n    }\n  }\n}": typeof types.DeleteDownloadedChapterDocument,
    "mutation DeleteDownloadedChapters($input: DeleteDownloadedChaptersInput!) {\n  deleteDownloadedChapters(input: $input) {\n    chapters {\n      id\n      isDownloaded\n    }\n  }\n}": typeof types.DeleteDownloadedChaptersDocument,
    "mutation DequeueDownload($input: DequeueChapterDownloadInput!) {\n  dequeueChapterDownload(input: $input) {\n    downloadStatus {\n      state\n    }\n  }\n}": typeof types.DequeueDownloadDocument,
    "query DownloadQueue {\n  downloadStatus {\n    state\n    queue {\n      position\n      progress\n      state\n      tries\n      chapter {\n        id\n        name\n        pageCount\n      }\n      manga {\n        id\n        title\n        thumbnailUrl\n      }\n    }\n  }\n}": typeof types.DownloadQueueDocument,
    "subscription DownloadStatusChanged {\n  downloadStatusChanged(input: {}) {\n    state\n    initial {\n      chapter {\n        id\n      }\n      manga {\n        id\n      }\n      state\n      progress\n    }\n    updates {\n      type\n    }\n  }\n}": typeof types.DownloadStatusChangedDocument,
    "mutation EnqueueChapterDownloads($input: EnqueueChapterDownloadsInput!) {\n  enqueueChapterDownloads(input: $input) {\n    downloadStatus {\n      state\n    }\n  }\n}": typeof types.EnqueueChapterDownloadsDocument,
    "mutation EnqueueDownload($input: EnqueueChapterDownloadInput!) {\n  enqueueChapterDownload(input: $input) {\n    downloadStatus {\n      state\n    }\n  }\n}": typeof types.EnqueueDownloadDocument,
    "mutation FetchChapterPages($input: FetchChapterPagesInput!) {\n  fetchChapterPages(input: $input) {\n    chapter {\n      id\n      pageCount\n    }\n    pages\n  }\n}": typeof types.FetchChapterPagesDocument,
    "query LibraryCategories {\n  categories(order: [{by: ORDER, byType: ASC}]) {\n    nodes {\n      id\n      name\n      order\n    }\n  }\n}": typeof types.LibraryCategoriesDocument,
    "query LibraryMangas($first: Int!, $after: Cursor, $filter: MangaFilterInput, $order: [MangaOrderInput!]) {\n  mangas(\n    condition: {inLibrary: true}\n    first: $first\n    after: $after\n    filter: $filter\n    order: $order\n  ) {\n    nodes {\n      id\n      title\n      thumbnailUrl\n      thumbnailUrlLastFetched\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n    totalCount\n  }\n}": typeof types.LibraryMangasDocument,
    "mutation Login($input: LoginInput!) {\n  login(input: $input) {\n    accessToken\n    refreshToken\n  }\n}": typeof types.LoginDocument,
    "query MangaDetail($mangaId: Int!, $first: Int!, $after: Cursor, $order: [ChapterOrderInput!]) {\n  manga(id: $mangaId) {\n    id\n    title\n    author\n    artist\n    description\n    status\n    thumbnailUrl\n    thumbnailUrlLastFetched\n    genre\n    inLibrary\n    source {\n      id\n      name\n    }\n  }\n  chapters(\n    condition: {mangaId: $mangaId}\n    first: $first\n    after: $after\n    order: $order\n  ) {\n    nodes {\n      id\n      name\n      chapterNumber\n      pageCount\n      isRead\n      isBookmarked\n      isDownloaded\n      lastPageRead\n      scanlator\n      uploadDate\n      sourceOrder\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n    totalCount\n  }\n}": typeof types.MangaDetailDocument,
    "query ReaderChapter($chapterId: Int!) {\n  chapter(id: $chapterId) {\n    id\n    name\n    pageCount\n    chapterNumber\n    sourceOrder\n    isRead\n    lastPageRead\n    manga {\n      id\n      title\n      thumbnailUrl\n    }\n  }\n}": typeof types.ReaderChapterDocument,
    "query ReaderNeighbors($mangaId: Int!, $chapterNumber: Float!) {\n  previous: chapters(\n    condition: {mangaId: $mangaId}\n    filter: {chapterNumber: {lessThan: $chapterNumber}}\n    first: 1\n    order: [{by: CHAPTER_NUMBER, byType: DESC}]\n  ) {\n    nodes {\n      id\n      name\n      chapterNumber\n    }\n  }\n  next: chapters(\n    condition: {mangaId: $mangaId}\n    filter: {chapterNumber: {greaterThan: $chapterNumber}}\n    first: 1\n    order: [{by: CHAPTER_NUMBER, byType: ASC}]\n  ) {\n    nodes {\n      id\n      name\n      chapterNumber\n    }\n  }\n}": typeof types.ReaderNeighborsDocument,
    "mutation RefreshToken($input: RefreshTokenInput!) {\n  refreshToken(input: $input) {\n    accessToken\n  }\n}": typeof types.RefreshTokenDocument,
    "query SourceCatalog($first: Int!) {\n  sources(first: $first, order: [{by: NAME, byType: ASC}]) {\n    nodes {\n      id\n      name\n      displayName\n      lang\n      isNsfw\n      contentWarning\n      supportsLatest\n      iconUrl\n    }\n    totalCount\n  }\n}": typeof types.SourceCatalogDocument,
    "mutation StartDownloader {\n  startDownloader(input: {}) {\n    downloadStatus {\n      state\n    }\n  }\n}": typeof types.StartDownloaderDocument,
    "mutation StopDownloader {\n  stopDownloader(input: {}) {\n    downloadStatus {\n      state\n    }\n  }\n}": typeof types.StopDownloaderDocument,
    "mutation UpdateChapterProgress($input: UpdateChapterInput!) {\n  updateChapter(input: $input) {\n    chapter {\n      id\n      isRead\n      isBookmarked\n      lastPageRead\n    }\n  }\n}": typeof types.UpdateChapterProgressDocument,
    "mutation UpdateChaptersState($input: UpdateChaptersInput!) {\n  updateChapters(input: $input) {\n    chapters {\n      id\n      isRead\n      isBookmarked\n      isDownloaded\n    }\n  }\n}": typeof types.UpdateChaptersStateDocument,
    "mutation UpdateMangaLibrary($input: UpdateMangaInput!) {\n  updateManga(input: $input) {\n    manga {\n      id\n      inLibrary\n    }\n  }\n}": typeof types.UpdateMangaLibraryDocument,
    "mutation UpdateMangasCategories($input: UpdateMangasCategoriesInput!) {\n  updateMangasCategories(input: $input) {\n    mangas {\n      id\n    }\n  }\n}": typeof types.UpdateMangasCategoriesDocument,
    "mutation UpdateMangasLibrary($input: UpdateMangasInput!) {\n  updateMangas(input: $input) {\n    mangas {\n      id\n      inLibrary\n    }\n  }\n}": typeof types.UpdateMangasLibraryDocument,
};
const documents: Documents = {
    "query AboutServer {\n  aboutServer {\n    name\n    version\n    buildType\n    buildTime\n    platformInfo {\n      arch\n      headless\n      os {\n        name\n        version\n        build\n      }\n      jvm {\n        javaVersion\n        vmName\n        vmVersion\n        vmVendor\n      }\n    }\n  }\n}": types.AboutServerDocument,
    "query AuthProbe {\n  settings {\n    authMode\n  }\n}": types.AuthProbeDocument,
    "query CategoryCatalog {\n  categories(order: [{by: ORDER, byType: ASC}]) {\n    nodes {\n      id\n      name\n      default\n      isDefaultCategory\n      order\n      mangas {\n        totalCount\n      }\n    }\n  }\n}": types.CategoryCatalogDocument,
    "query ChapterFeed($first: Int!, $filter: ChapterFilterInput, $order: [ChapterOrderInput!]!) {\n  chapters(first: $first, filter: $filter, order: $order) {\n    nodes {\n      id\n      name\n      chapterNumber\n      pageCount\n      isRead\n      isDownloaded\n      lastPageRead\n      lastReadAt\n      uploadDate\n      manga {\n        id\n        title\n        thumbnailUrl\n      }\n    }\n    totalCount\n  }\n}": types.ChapterFeedDocument,
    "mutation DeleteDownloadedChapter($input: DeleteDownloadedChapterInput!) {\n  deleteDownloadedChapter(input: $input) {\n    chapters {\n      id\n      isDownloaded\n    }\n  }\n}": types.DeleteDownloadedChapterDocument,
    "mutation DeleteDownloadedChapters($input: DeleteDownloadedChaptersInput!) {\n  deleteDownloadedChapters(input: $input) {\n    chapters {\n      id\n      isDownloaded\n    }\n  }\n}": types.DeleteDownloadedChaptersDocument,
    "mutation DequeueDownload($input: DequeueChapterDownloadInput!) {\n  dequeueChapterDownload(input: $input) {\n    downloadStatus {\n      state\n    }\n  }\n}": types.DequeueDownloadDocument,
    "query DownloadQueue {\n  downloadStatus {\n    state\n    queue {\n      position\n      progress\n      state\n      tries\n      chapter {\n        id\n        name\n        pageCount\n      }\n      manga {\n        id\n        title\n        thumbnailUrl\n      }\n    }\n  }\n}": types.DownloadQueueDocument,
    "subscription DownloadStatusChanged {\n  downloadStatusChanged(input: {}) {\n    state\n    initial {\n      chapter {\n        id\n      }\n      manga {\n        id\n      }\n      state\n      progress\n    }\n    updates {\n      type\n    }\n  }\n}": types.DownloadStatusChangedDocument,
    "mutation EnqueueChapterDownloads($input: EnqueueChapterDownloadsInput!) {\n  enqueueChapterDownloads(input: $input) {\n    downloadStatus {\n      state\n    }\n  }\n}": types.EnqueueChapterDownloadsDocument,
    "mutation EnqueueDownload($input: EnqueueChapterDownloadInput!) {\n  enqueueChapterDownload(input: $input) {\n    downloadStatus {\n      state\n    }\n  }\n}": types.EnqueueDownloadDocument,
    "mutation FetchChapterPages($input: FetchChapterPagesInput!) {\n  fetchChapterPages(input: $input) {\n    chapter {\n      id\n      pageCount\n    }\n    pages\n  }\n}": types.FetchChapterPagesDocument,
    "query LibraryCategories {\n  categories(order: [{by: ORDER, byType: ASC}]) {\n    nodes {\n      id\n      name\n      order\n    }\n  }\n}": types.LibraryCategoriesDocument,
    "query LibraryMangas($first: Int!, $after: Cursor, $filter: MangaFilterInput, $order: [MangaOrderInput!]) {\n  mangas(\n    condition: {inLibrary: true}\n    first: $first\n    after: $after\n    filter: $filter\n    order: $order\n  ) {\n    nodes {\n      id\n      title\n      thumbnailUrl\n      thumbnailUrlLastFetched\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n    totalCount\n  }\n}": types.LibraryMangasDocument,
    "mutation Login($input: LoginInput!) {\n  login(input: $input) {\n    accessToken\n    refreshToken\n  }\n}": types.LoginDocument,
    "query MangaDetail($mangaId: Int!, $first: Int!, $after: Cursor, $order: [ChapterOrderInput!]) {\n  manga(id: $mangaId) {\n    id\n    title\n    author\n    artist\n    description\n    status\n    thumbnailUrl\n    thumbnailUrlLastFetched\n    genre\n    inLibrary\n    source {\n      id\n      name\n    }\n  }\n  chapters(\n    condition: {mangaId: $mangaId}\n    first: $first\n    after: $after\n    order: $order\n  ) {\n    nodes {\n      id\n      name\n      chapterNumber\n      pageCount\n      isRead\n      isBookmarked\n      isDownloaded\n      lastPageRead\n      scanlator\n      uploadDate\n      sourceOrder\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n    totalCount\n  }\n}": types.MangaDetailDocument,
    "query ReaderChapter($chapterId: Int!) {\n  chapter(id: $chapterId) {\n    id\n    name\n    pageCount\n    chapterNumber\n    sourceOrder\n    isRead\n    lastPageRead\n    manga {\n      id\n      title\n      thumbnailUrl\n    }\n  }\n}": types.ReaderChapterDocument,
    "query ReaderNeighbors($mangaId: Int!, $chapterNumber: Float!) {\n  previous: chapters(\n    condition: {mangaId: $mangaId}\n    filter: {chapterNumber: {lessThan: $chapterNumber}}\n    first: 1\n    order: [{by: CHAPTER_NUMBER, byType: DESC}]\n  ) {\n    nodes {\n      id\n      name\n      chapterNumber\n    }\n  }\n  next: chapters(\n    condition: {mangaId: $mangaId}\n    filter: {chapterNumber: {greaterThan: $chapterNumber}}\n    first: 1\n    order: [{by: CHAPTER_NUMBER, byType: ASC}]\n  ) {\n    nodes {\n      id\n      name\n      chapterNumber\n    }\n  }\n}": types.ReaderNeighborsDocument,
    "mutation RefreshToken($input: RefreshTokenInput!) {\n  refreshToken(input: $input) {\n    accessToken\n  }\n}": types.RefreshTokenDocument,
    "query SourceCatalog($first: Int!) {\n  sources(first: $first, order: [{by: NAME, byType: ASC}]) {\n    nodes {\n      id\n      name\n      displayName\n      lang\n      isNsfw\n      contentWarning\n      supportsLatest\n      iconUrl\n    }\n    totalCount\n  }\n}": types.SourceCatalogDocument,
    "mutation StartDownloader {\n  startDownloader(input: {}) {\n    downloadStatus {\n      state\n    }\n  }\n}": types.StartDownloaderDocument,
    "mutation StopDownloader {\n  stopDownloader(input: {}) {\n    downloadStatus {\n      state\n    }\n  }\n}": types.StopDownloaderDocument,
    "mutation UpdateChapterProgress($input: UpdateChapterInput!) {\n  updateChapter(input: $input) {\n    chapter {\n      id\n      isRead\n      isBookmarked\n      lastPageRead\n    }\n  }\n}": types.UpdateChapterProgressDocument,
    "mutation UpdateChaptersState($input: UpdateChaptersInput!) {\n  updateChapters(input: $input) {\n    chapters {\n      id\n      isRead\n      isBookmarked\n      isDownloaded\n    }\n  }\n}": types.UpdateChaptersStateDocument,
    "mutation UpdateMangaLibrary($input: UpdateMangaInput!) {\n  updateManga(input: $input) {\n    manga {\n      id\n      inLibrary\n    }\n  }\n}": types.UpdateMangaLibraryDocument,
    "mutation UpdateMangasCategories($input: UpdateMangasCategoriesInput!) {\n  updateMangasCategories(input: $input) {\n    mangas {\n      id\n    }\n  }\n}": types.UpdateMangasCategoriesDocument,
    "mutation UpdateMangasLibrary($input: UpdateMangasInput!) {\n  updateMangas(input: $input) {\n    mangas {\n      id\n      inLibrary\n    }\n  }\n}": types.UpdateMangasLibraryDocument,
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
export function graphql(source: "query CategoryCatalog {\n  categories(order: [{by: ORDER, byType: ASC}]) {\n    nodes {\n      id\n      name\n      default\n      isDefaultCategory\n      order\n      mangas {\n        totalCount\n      }\n    }\n  }\n}"): (typeof documents)["query CategoryCatalog {\n  categories(order: [{by: ORDER, byType: ASC}]) {\n    nodes {\n      id\n      name\n      default\n      isDefaultCategory\n      order\n      mangas {\n        totalCount\n      }\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query ChapterFeed($first: Int!, $filter: ChapterFilterInput, $order: [ChapterOrderInput!]!) {\n  chapters(first: $first, filter: $filter, order: $order) {\n    nodes {\n      id\n      name\n      chapterNumber\n      pageCount\n      isRead\n      isDownloaded\n      lastPageRead\n      lastReadAt\n      uploadDate\n      manga {\n        id\n        title\n        thumbnailUrl\n      }\n    }\n    totalCount\n  }\n}"): (typeof documents)["query ChapterFeed($first: Int!, $filter: ChapterFilterInput, $order: [ChapterOrderInput!]!) {\n  chapters(first: $first, filter: $filter, order: $order) {\n    nodes {\n      id\n      name\n      chapterNumber\n      pageCount\n      isRead\n      isDownloaded\n      lastPageRead\n      lastReadAt\n      uploadDate\n      manga {\n        id\n        title\n        thumbnailUrl\n      }\n    }\n    totalCount\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation DeleteDownloadedChapter($input: DeleteDownloadedChapterInput!) {\n  deleteDownloadedChapter(input: $input) {\n    chapters {\n      id\n      isDownloaded\n    }\n  }\n}"): (typeof documents)["mutation DeleteDownloadedChapter($input: DeleteDownloadedChapterInput!) {\n  deleteDownloadedChapter(input: $input) {\n    chapters {\n      id\n      isDownloaded\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation DeleteDownloadedChapters($input: DeleteDownloadedChaptersInput!) {\n  deleteDownloadedChapters(input: $input) {\n    chapters {\n      id\n      isDownloaded\n    }\n  }\n}"): (typeof documents)["mutation DeleteDownloadedChapters($input: DeleteDownloadedChaptersInput!) {\n  deleteDownloadedChapters(input: $input) {\n    chapters {\n      id\n      isDownloaded\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation DequeueDownload($input: DequeueChapterDownloadInput!) {\n  dequeueChapterDownload(input: $input) {\n    downloadStatus {\n      state\n    }\n  }\n}"): (typeof documents)["mutation DequeueDownload($input: DequeueChapterDownloadInput!) {\n  dequeueChapterDownload(input: $input) {\n    downloadStatus {\n      state\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query DownloadQueue {\n  downloadStatus {\n    state\n    queue {\n      position\n      progress\n      state\n      tries\n      chapter {\n        id\n        name\n        pageCount\n      }\n      manga {\n        id\n        title\n        thumbnailUrl\n      }\n    }\n  }\n}"): (typeof documents)["query DownloadQueue {\n  downloadStatus {\n    state\n    queue {\n      position\n      progress\n      state\n      tries\n      chapter {\n        id\n        name\n        pageCount\n      }\n      manga {\n        id\n        title\n        thumbnailUrl\n      }\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "subscription DownloadStatusChanged {\n  downloadStatusChanged(input: {}) {\n    state\n    initial {\n      chapter {\n        id\n      }\n      manga {\n        id\n      }\n      state\n      progress\n    }\n    updates {\n      type\n    }\n  }\n}"): (typeof documents)["subscription DownloadStatusChanged {\n  downloadStatusChanged(input: {}) {\n    state\n    initial {\n      chapter {\n        id\n      }\n      manga {\n        id\n      }\n      state\n      progress\n    }\n    updates {\n      type\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation EnqueueChapterDownloads($input: EnqueueChapterDownloadsInput!) {\n  enqueueChapterDownloads(input: $input) {\n    downloadStatus {\n      state\n    }\n  }\n}"): (typeof documents)["mutation EnqueueChapterDownloads($input: EnqueueChapterDownloadsInput!) {\n  enqueueChapterDownloads(input: $input) {\n    downloadStatus {\n      state\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation EnqueueDownload($input: EnqueueChapterDownloadInput!) {\n  enqueueChapterDownload(input: $input) {\n    downloadStatus {\n      state\n    }\n  }\n}"): (typeof documents)["mutation EnqueueDownload($input: EnqueueChapterDownloadInput!) {\n  enqueueChapterDownload(input: $input) {\n    downloadStatus {\n      state\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation FetchChapterPages($input: FetchChapterPagesInput!) {\n  fetchChapterPages(input: $input) {\n    chapter {\n      id\n      pageCount\n    }\n    pages\n  }\n}"): (typeof documents)["mutation FetchChapterPages($input: FetchChapterPagesInput!) {\n  fetchChapterPages(input: $input) {\n    chapter {\n      id\n      pageCount\n    }\n    pages\n  }\n}"];
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
export function graphql(source: "query MangaDetail($mangaId: Int!, $first: Int!, $after: Cursor, $order: [ChapterOrderInput!]) {\n  manga(id: $mangaId) {\n    id\n    title\n    author\n    artist\n    description\n    status\n    thumbnailUrl\n    thumbnailUrlLastFetched\n    genre\n    inLibrary\n    source {\n      id\n      name\n    }\n  }\n  chapters(\n    condition: {mangaId: $mangaId}\n    first: $first\n    after: $after\n    order: $order\n  ) {\n    nodes {\n      id\n      name\n      chapterNumber\n      pageCount\n      isRead\n      isBookmarked\n      isDownloaded\n      lastPageRead\n      scanlator\n      uploadDate\n      sourceOrder\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n    totalCount\n  }\n}"): (typeof documents)["query MangaDetail($mangaId: Int!, $first: Int!, $after: Cursor, $order: [ChapterOrderInput!]) {\n  manga(id: $mangaId) {\n    id\n    title\n    author\n    artist\n    description\n    status\n    thumbnailUrl\n    thumbnailUrlLastFetched\n    genre\n    inLibrary\n    source {\n      id\n      name\n    }\n  }\n  chapters(\n    condition: {mangaId: $mangaId}\n    first: $first\n    after: $after\n    order: $order\n  ) {\n    nodes {\n      id\n      name\n      chapterNumber\n      pageCount\n      isRead\n      isBookmarked\n      isDownloaded\n      lastPageRead\n      scanlator\n      uploadDate\n      sourceOrder\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n    totalCount\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query ReaderChapter($chapterId: Int!) {\n  chapter(id: $chapterId) {\n    id\n    name\n    pageCount\n    chapterNumber\n    sourceOrder\n    isRead\n    lastPageRead\n    manga {\n      id\n      title\n      thumbnailUrl\n    }\n  }\n}"): (typeof documents)["query ReaderChapter($chapterId: Int!) {\n  chapter(id: $chapterId) {\n    id\n    name\n    pageCount\n    chapterNumber\n    sourceOrder\n    isRead\n    lastPageRead\n    manga {\n      id\n      title\n      thumbnailUrl\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query ReaderNeighbors($mangaId: Int!, $chapterNumber: Float!) {\n  previous: chapters(\n    condition: {mangaId: $mangaId}\n    filter: {chapterNumber: {lessThan: $chapterNumber}}\n    first: 1\n    order: [{by: CHAPTER_NUMBER, byType: DESC}]\n  ) {\n    nodes {\n      id\n      name\n      chapterNumber\n    }\n  }\n  next: chapters(\n    condition: {mangaId: $mangaId}\n    filter: {chapterNumber: {greaterThan: $chapterNumber}}\n    first: 1\n    order: [{by: CHAPTER_NUMBER, byType: ASC}]\n  ) {\n    nodes {\n      id\n      name\n      chapterNumber\n    }\n  }\n}"): (typeof documents)["query ReaderNeighbors($mangaId: Int!, $chapterNumber: Float!) {\n  previous: chapters(\n    condition: {mangaId: $mangaId}\n    filter: {chapterNumber: {lessThan: $chapterNumber}}\n    first: 1\n    order: [{by: CHAPTER_NUMBER, byType: DESC}]\n  ) {\n    nodes {\n      id\n      name\n      chapterNumber\n    }\n  }\n  next: chapters(\n    condition: {mangaId: $mangaId}\n    filter: {chapterNumber: {greaterThan: $chapterNumber}}\n    first: 1\n    order: [{by: CHAPTER_NUMBER, byType: ASC}]\n  ) {\n    nodes {\n      id\n      name\n      chapterNumber\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation RefreshToken($input: RefreshTokenInput!) {\n  refreshToken(input: $input) {\n    accessToken\n  }\n}"): (typeof documents)["mutation RefreshToken($input: RefreshTokenInput!) {\n  refreshToken(input: $input) {\n    accessToken\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query SourceCatalog($first: Int!) {\n  sources(first: $first, order: [{by: NAME, byType: ASC}]) {\n    nodes {\n      id\n      name\n      displayName\n      lang\n      isNsfw\n      contentWarning\n      supportsLatest\n      iconUrl\n    }\n    totalCount\n  }\n}"): (typeof documents)["query SourceCatalog($first: Int!) {\n  sources(first: $first, order: [{by: NAME, byType: ASC}]) {\n    nodes {\n      id\n      name\n      displayName\n      lang\n      isNsfw\n      contentWarning\n      supportsLatest\n      iconUrl\n    }\n    totalCount\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation StartDownloader {\n  startDownloader(input: {}) {\n    downloadStatus {\n      state\n    }\n  }\n}"): (typeof documents)["mutation StartDownloader {\n  startDownloader(input: {}) {\n    downloadStatus {\n      state\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation StopDownloader {\n  stopDownloader(input: {}) {\n    downloadStatus {\n      state\n    }\n  }\n}"): (typeof documents)["mutation StopDownloader {\n  stopDownloader(input: {}) {\n    downloadStatus {\n      state\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation UpdateChapterProgress($input: UpdateChapterInput!) {\n  updateChapter(input: $input) {\n    chapter {\n      id\n      isRead\n      isBookmarked\n      lastPageRead\n    }\n  }\n}"): (typeof documents)["mutation UpdateChapterProgress($input: UpdateChapterInput!) {\n  updateChapter(input: $input) {\n    chapter {\n      id\n      isRead\n      isBookmarked\n      lastPageRead\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation UpdateChaptersState($input: UpdateChaptersInput!) {\n  updateChapters(input: $input) {\n    chapters {\n      id\n      isRead\n      isBookmarked\n      isDownloaded\n    }\n  }\n}"): (typeof documents)["mutation UpdateChaptersState($input: UpdateChaptersInput!) {\n  updateChapters(input: $input) {\n    chapters {\n      id\n      isRead\n      isBookmarked\n      isDownloaded\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation UpdateMangaLibrary($input: UpdateMangaInput!) {\n  updateManga(input: $input) {\n    manga {\n      id\n      inLibrary\n    }\n  }\n}"): (typeof documents)["mutation UpdateMangaLibrary($input: UpdateMangaInput!) {\n  updateManga(input: $input) {\n    manga {\n      id\n      inLibrary\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation UpdateMangasCategories($input: UpdateMangasCategoriesInput!) {\n  updateMangasCategories(input: $input) {\n    mangas {\n      id\n    }\n  }\n}"): (typeof documents)["mutation UpdateMangasCategories($input: UpdateMangasCategoriesInput!) {\n  updateMangasCategories(input: $input) {\n    mangas {\n      id\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation UpdateMangasLibrary($input: UpdateMangasInput!) {\n  updateMangas(input: $input) {\n    mangas {\n      id\n      inLibrary\n    }\n  }\n}"): (typeof documents)["mutation UpdateMangasLibrary($input: UpdateMangasInput!) {\n  updateMangas(input: $input) {\n    mangas {\n      id\n      inLibrary\n    }\n  }\n}"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;