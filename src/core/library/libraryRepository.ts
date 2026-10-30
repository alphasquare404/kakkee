import type { ApolloClient } from '@apollo/client';
import {
  LibraryCategoriesDocument,
  LibraryMangasDocument,
  UpdateMangasCategoriesDocument,
  UpdateMangasLibraryDocument,
  type LibraryCategoriesQuery,
  type LibraryMangasQuery,
  type LibraryMangasQueryVariables,
  type MangaFilterInput,
  type MangaOrderBy,
  type MangaStatus,
} from '../graphql/generated/graphql';

export const DEFAULT_LIBRARY_PAGE_SIZE = 40;
export const MAX_LIBRARY_PAGE_SIZE = 50;

export type LibraryManga = LibraryMangasQuery['mangas']['nodes'][number];
export type LibraryCategory = LibraryCategoriesQuery['categories']['nodes'][number];

export interface LibraryPageInfo {
  readonly endCursor: string | null;
  readonly hasNextPage: boolean;
}

export interface LibraryPage {
  readonly items: readonly LibraryManga[];
  readonly totalCount: number;
  readonly pageInfo: LibraryPageInfo;
}

export type LibrarySortField = 'title' | 'dateAdded' | 'lastFetched' | 'id';
export type LibrarySortDirection = 'asc' | 'desc';

export interface LibrarySort {
  readonly field: LibrarySortField;
  readonly direction: LibrarySortDirection;
}

export interface LibraryFilter {
  /** Server-side title contains; trimmed before use. */
  readonly search?: string;
  readonly status?: MangaStatus;
  readonly sourceId?: string;
  /** Single category; multi-category remains a later extension. */
  readonly categoryId?: number;
}

export interface LibraryPageInput {
  readonly first?: number;
  /** Opaque cursor from `pageInfo.endCursor`; never decoded. */
  readonly after?: string | null;
  readonly filter?: LibraryFilter;
  readonly sort?: LibrarySort;
}

export class LibraryInputError extends Error {
  public readonly code: 'INVALID_PAGE_SIZE' | 'INVALID_CATEGORY_ID';

  constructor(code: 'INVALID_PAGE_SIZE' | 'INVALID_CATEGORY_ID') {
    super(
      code === 'INVALID_PAGE_SIZE'
        ? `Library page size harus antara 1 dan ${MAX_LIBRARY_PAGE_SIZE}.`
        : 'Category ID harus berupa integer yang valid.',
    );
    this.name = 'LibraryInputError';
    this.code = code;
  }
}

export interface LibraryRepository {
  getPage(input?: LibraryPageInput): Promise<LibraryPage>;
  getCategories(): Promise<readonly LibraryCategory[]>;
  setLibrary(ids: readonly number[], inLibrary: boolean): Promise<void>;
  addToCategory(ids: readonly number[], categoryId: number): Promise<void>;
}

export interface LibraryRepositoryOptions {
  /**
   * Must return the current connected Apollo client. Callers should read it
   * from the current ConnectionCoordinator context, never cache it globally.
   */
  readonly getClient: () => ApolloClient;
}

const SORT_FIELD_MAP: Record<LibrarySortField, MangaOrderBy> = {
  title: 'TITLE',
  dateAdded: 'IN_LIBRARY_AT',
  lastFetched: 'LAST_FETCHED_AT',
  id: 'ID',
};

export const DEFAULT_LIBRARY_SORT: LibrarySort = {
  field: 'dateAdded',
  direction: 'desc',
};

function pageSize(value: number | undefined): number {
  const first = value ?? DEFAULT_LIBRARY_PAGE_SIZE;

  if (!Number.isSafeInteger(first) || first < 1 || first > MAX_LIBRARY_PAGE_SIZE) {
    throw new LibraryInputError('INVALID_PAGE_SIZE');
  }

  return first;
}

function cursor(value: string | null | undefined): string | undefined {
  if (typeof value !== 'string' || value.trim() === '') {
    return undefined;
  }

  return value;
}

function filterInput(filter: LibraryFilter | undefined): MangaFilterInput | undefined {
  if (!filter) {
    return undefined;
  }

  const result: MangaFilterInput = {};

  const search = filter.search?.trim();

  if (search) {
    result.title = { includesInsensitive: search };
  }

  if (filter.status) {
    result.status = { equalTo: filter.status };
  }

  const sourceId = filter.sourceId?.trim();

  if (sourceId) {
    result.sourceId = { equalTo: sourceId };
  }

  if (filter.categoryId !== undefined) {
    if (!Number.isSafeInteger(filter.categoryId)) {
      throw new LibraryInputError('INVALID_CATEGORY_ID');
    }

    result.categoryId = { equalTo: filter.categoryId };
  }

  return Object.keys(result).length > 0 ? result : undefined;
}

function orderInput(sort: LibrarySort | undefined): MangaOrderBy[] {
  const selected = sort ?? DEFAULT_LIBRARY_SORT;
  const by = SORT_FIELD_MAP[selected.field];

  if (!by) {
    throw new Error('Library sort field tidak didukung.');
  }

  return [by];
}

function buildVariables(input: LibraryPageInput): LibraryMangasQueryVariables {
  const variables: LibraryMangasQueryVariables = {
    first: pageSize(input.first),
    order: orderInput(input.sort).map((by) => ({
      by,
      byType: (input.sort ?? DEFAULT_LIBRARY_SORT).direction === 'desc' ? 'DESC' : 'ASC',
    })),
  };
  const after = cursor(input.after);

  if (after) {
    variables.after = after;
  }

  const filter = filterInput(input.filter);

  if (filter) {
    variables.filter = filter;
  }

  return variables;
}

export function createLibraryRepository(
  options: LibraryRepositoryOptions,
): LibraryRepository {
  return {
    async getPage(input = {}) {
      const variables = buildVariables(input);
      const result = await options.getClient().query({
        query: LibraryMangasDocument,
        variables,
        fetchPolicy: 'network-only',
      });

      if (!result.data?.mangas) {
        throw new Error('Respons Library tidak memiliki data mangas.');
      }

      const mangas = result.data.mangas;

      return {
        items: mangas.nodes,
        totalCount: mangas.totalCount,
        pageInfo: {
          endCursor: mangas.pageInfo.endCursor,
          hasNextPage: mangas.pageInfo.hasNextPage,
        },
      };
    },
    async getCategories() {
      const result = await options.getClient().query({
        query: LibraryCategoriesDocument,
        fetchPolicy: 'network-only',
      });

      if (!result.data?.categories) {
        throw new Error('Respons Library tidak memiliki data categories.');
      }

      return result.data.categories.nodes;
    },
    async setLibrary(ids, inLibrary) {
      const result = await options.getClient().mutate({
        mutation: UpdateMangasLibraryDocument,
        variables: {
          input: {
            ids: [...ids],
            patch: { inLibrary },
          },
        },
      });

      if (!result.data?.updateMangas) {
        throw new Error('Status library manga tidak dapat disimpan.');
      }
    },
    async addToCategory(ids, categoryId) {
      const result = await options.getClient().mutate({
        mutation: UpdateMangasCategoriesDocument,
        variables: {
          input: {
            ids: [...ids],
            patch: { addToCategories: [categoryId] },
          },
        },
      });

      if (!result.data?.updateMangasCategories) {
        throw new Error('Kategori manga tidak dapat disimpan.');
      }
    },
  };
}
