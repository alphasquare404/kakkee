# Phase 1 — Library GraphQL Contract Audit

Tanggal: **29 Oktober 2026**

Baseline: **Suwayomi Server stable v2.4.2366**

Schema: `graphql/schema/stable-v2.4.2366.graphql`
SHA-256: `c7b154383d684e69bc1947aad10fdfbc4f717008f61c755536a3857eecdff749`

Status audit: **COMPLETE**. Dokumen ini audit kontrak dan operation kandidat; implementation data layer ada di [phase-1-library-data.md](phase-1-library-data.md).

## 1. Entry point Library

```graphql
mangas(
  condition: MangaConditionInput
  filter: MangaFilterInput
  order: [MangaOrderInput!]
  before: Cursor
  after: Cursor
  first: Int
  last: Int
  offset: Int
): MangaNodeList!
```

- `mangas` berada di `Query`.
- Return type `MangaNodeList!` — non-null.
- Semua argument nullable di schema; operation kandidat membuat `first` non-null.
- Library scope menggunakan exact condition:

```graphql
condition: { inLibrary: true }
```

`inLibrary` juga tersedia di `MangaFilterInput` sebagai `BooleanFilterInput`, tetapi operation kandidat memakai `condition` untuk invariant Library dan menyisakan `filter` untuk refinement opsional.

## 2. Tipe output/pagination

```graphql
type MangaNodeList implements NodeList {
  edges: [MangaEdge!]!
  nodes: [MangaType!]!
  pageInfo: PageInfo!
  totalCount: Int!
}

type MangaEdge implements Edge {
  cursor: Cursor!
  node: MangaType!
}

type PageInfo {
  endCursor: Cursor
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: Cursor
}
```

- `totalCount` berada di `MangaNodeList`, **bukan** di `PageInfo`.
- `totalCount` non-null; jumlah seluruh node yang cocok dengan condition/filter.
- `nodes` non-null list; item `MangaType!`.
- `edges` tersedia tetapi tidak dipakai kandidat; `edges.cursor` non-null.
- `Cursor` adalah scalar opaque. Jangan parse, membentuk, atau menganggapnya integer.
- `startCursor`/`endCursor` nullable; `hasNextPage`/`hasPreviousPage` non-null.
- `first`, `last`, `offset`: `Int` nullable; tidak ada maximum yang dinyatakan schema.
- `before`, `after`: `Cursor` nullable.

## 3. Model pagination minimum

Pilihan Phase 1: **forward cursor pagination**.

```text
first: Int!
after: Cursor
```

Alasan:

- `first + after` valid terhadap schema.
- Tidak mencampur `first`, `last`, dan `offset`.
- `endCursor` + `hasNextPage` cukup untuk “Muat lagi”.
- Cursor opaque dikembalikan server tanpa client-side decoding.
- `totalCount` memberi jumlah total untuk metadata UI; jangan menjadikannya dasar pagination.

Batas `first` belum ditentukan schema. Data layer Step 2 menetapkan cap aplikasi 50 dan default 40; lihat [phase-1-library-data.md](phase-1-library-data.md).

## 4. Sorting

```graphql
input MangaOrderInput {
  by: MangaOrderBy!
  byType: SortOrder
}

enum MangaOrderBy {
  ID
  TITLE
  IN_LIBRARY_AT
  LAST_FETCHED_AT
}

enum SortOrder {
  ASC
  DESC
  ASC_NULLS_FIRST
  DESC_NULLS_FIRST
  ASC_NULLS_LAST
  DESC_NULLS_LAST
}
```

Supported sorting:

- `ID`
- `TITLE`
- `IN_LIBRARY_AT`
- `LAST_FETCHED_AT`

Tidak ada sort enum untuk unread count, download count, bookmark count, chapter count, last read, atau latest chapter. Jangan membuat enum tersebut.

`byType` nullable di schema; data layer selalu mengirim `ASC`/`DESC` eksplisit agar urutan tidak bergantung default server.

## 5. Filtering/search

### Condition input

```graphql
input MangaConditionInput {
  artist: String
  author: String
  categoryIds: [Int!]
  chaptersLastFetchedAt: LongString
  description: String
  genre: [String!]
  id: Int
  inLibrary: Boolean
  inLibraryAt: LongString
  initialized: Boolean
  lastFetchedAt: LongString
  realUrl: String
  sourceId: LongString
  status: MangaStatus
  thumbnailUrl: String
  title: String
  url: String
}
```

Condition bersifat exact/legacy. `title` di condition bukan search operator.

### Filter input

```graphql
input MangaFilterInput {
  and: [MangaFilterInput!]
  artist: StringFilterInput
  author: StringFilterInput
  categoryId: IntFilterInput
  chaptersLastFetchedAt: LongFilterInput
  description: StringFilterInput
  genre: StringFilterInput
  id: IntFilterInput
  inLibrary: BooleanFilterInput
  inLibraryAt: LongFilterInput
  initialized: BooleanFilterInput
  lastFetchedAt: LongFilterInput
  not: MangaFilterInput
  or: [MangaFilterInput!]
  realUrl: StringFilterInput
  sourceId: LongFilterInput
  status: MangaStatusFilterInput
  thumbnailUrl: StringFilterInput
  title: StringFilterInput
  url: StringFilterInput
}
```

Supported server-side use cases:

| Use case | Contract |
|---|---|
| Library scope | `condition.inLibrary: true` |
| Title search | `filter.title` dengan `StringFilterInput` |
| Case-insensitive contains | `filter.title.includesInsensitive: "..."` — **ada di stable schema** |
| Status | `filter.status.equalTo` / `in` |
| Source | `filter.sourceId.equalTo`/`in` (`LongString`) atau `condition.sourceId` |
| One category | `filter.categoryId` (`IntFilterInput`) |
| Multiple categories | `condition.categoryIds: [Int!]` |
| Initialized | `filter.initialized` / `condition.initialized` |
| Last fetched | `filter.lastFetchedAt` / `condition.lastFetchedAt` |

Relevant `StringFilterInput` operators yang tersedia termasuk:

- `equalTo`, `notEqualTo`
- `in`, `notIn`
- `includes`, `notIncludes`
- `includesInsensitive`, `notIncludesInsensitive`
- `startsWith`, `endsWith`, `like`
- `isNull`

`MangaStatusFilterInput`, `BooleanFilterInput`, `IntFilterInput`, dan `LongFilterInput` juga menyediakan `equalTo`, `in`, `notIn`, `isNull`, dan operator perbandingan sesuai tipe.

### Search scope

Operation kandidat menyediakan `filter: MangaFilterInput`; caller dapat mengirim `title.includesInsensitive` dan filter lain yang stable. Category multi-select belum dimasukkan ke kandidat karena `condition.categoryIds` perlu digabung dengan `inLibrary`; ini dapat menjadi extension operation di Step 2 setelah diuji dengan data kategori nyata.

## 6. MangaType fields

```graphql
type MangaType {
  id: Int!
  title: String!
  thumbnailUrl: String
  thumbnailUrlLastFetched: LongString

  # optional/not selected for MVP
  artist: String
  author: String
  description: String
  genre: [String!]!
  inLibrary: Boolean!
  inLibraryAt: LongString!
  initialized: Boolean!
  status: MangaStatus!
  source: SourceType
  categories: CategoryNodeList!
  chapters: ChapterNodeList!
  unreadCount: Int!
  downloadCount: Int!
  bookmarkCount: Int!
  lastReadChapter: ChapterType
  latestFetchedChapter: ChapterType
  latestReadChapter: ChapterType
  latestUploadedChapter: ChapterType
  firstUnreadChapter: ChapterType
  highestNumberedChapter: ChapterType
  trackRecords: TrackRecordNodeList!
  # ...other fields
}
```

Minimum Library card selection:

- `id: Int!` — stable identity.
- `title: String!` — required card label.
- `thumbnailUrl: String` — nullable server path; must later be loaded through `ResourceService`, not directly as an authenticated `<img src>`.
- `thumbnailUrlLastFetched: LongString` — nullable cache metadata; included for diagnostics/refresh decisions, not required for rendering.

Not selected in MVP:

- `unreadCount`, `downloadCount`, `bookmarkCount` — available but can be costly and have no filter/order support.
- `status`, `inLibraryAt`, `source`, `categories`, `chapters`, chapter-derived fields, `trackRecords` — available but not needed for initial card.
- `description`, `genre`, artist/author — not needed for a minimal grid.

## 7. Unsupported/limited server-side features

Tidak ada dukungan filter/order stable untuk:

- `unreadCount`
- `downloadCount`
- `bookmarkCount`
- total chapter count
- `lastReadChapter`
- `latestFetchedChapter`
- `latestUploadedChapter`
- `latestReadChapter`
- tracker binding

Field-field tersebut mungkin tersedia pada `MangaType`, tetapi **bukan** member `MangaFilterInput` atau `MangaOrderInput`. Jangan membuat workaround client-side untuk pagination/filter server-side pada Step 2.

`thumbnailUrl` adalah path resource, bukan URL absolut. Jangan concatenate server origin di UI; gunakan `ResourceService` saat menampilkan gambar.

## 8. Categories

Stable contract:

```graphql
categories(
  condition: CategoryConditionInput
  filter: CategoryFilterInput
  order: [CategoryOrderInput!]
  before: Cursor
  after: Cursor
  first: Int
  last: Int
  offset: Int
): CategoryNodeList!

type CategoryNodeList implements NodeList {
  edges: [CategoryEdge!]!
  nodes: [CategoryType!]!
  pageInfo: PageInfo!
  totalCount: Int!
}

type CategoryType {
  id: Int!
  name: String!
  default: Boolean!
  isDefaultCategory: Boolean!
  order: Int!
  mangas: MangaNodeList!
  # ...
}
```

- Categories belum diperlukan untuk Library MVP awal.
- Jika ditambahkan nanti, `condition.categoryIds` dapat memfilter multi-category.
- `filter.categoryId` hanya satu kategori.
- Jangan membuat UI Categories pada audit ini.

## 9. Candidate operation

File yang divalidasi:

`graphql/operations/libraryMangas.graphql`

```graphql
query LibraryMangas(
  $first: Int!
  $after: Cursor
  $filter: MangaFilterInput
  $order: [MangaOrderInput!]
) {
  mangas(
    condition: { inLibrary: true }
    first: $first
    after: $after
    filter: $filter
    order: $order
  ) {
    nodes {
      id
      title
      thumbnailUrl
      thumbnailUrlLastFetched
    }
    pageInfo {
      endCursor
      hasNextPage
    }
    totalCount
  }
}
```

Codegen menghasilkan:

- `LibraryMangasDocument`
- `LibraryMangasQuery`
- `LibraryMangasQueryVariables`

Generated variable shape:

```ts
{
  first: number;
  after?: string | null;
  filter?: MangaFilterInput | null;
  order?: Array<MangaOrderInput> | MangaOrderInput | null;
}
```

Generated node shape:

```ts
{
  id: number;
  title: string;
  thumbnailUrl: string | null;
  thumbnailUrlLastFetched: string | null;
}
```

`codegen` dan `codegen:check` lulus. Operation hanya memakai stable schema.

Validasi tambahan: `src/core/graphql/libraryMangas.generated.test.ts` memverifikasi document operation, condition library, `after`, `pageInfo`, dan `totalCount`. Full suite saat audit: 144 test total (137 pass + 7 runtime integration yang di-skip tanpa env).

## 10. Implications untuk Step 2/3

### Step 2 — data layer

- Gunakan `LibraryMangasDocument`; jangan menulis query string manual.
- Default `first` dengan cap aplikasi; `after` dari `endCursor`.
- Jangan decode cursor.
- Jangan gunakan `offset`/`last` bersamaan dengan forward pagination.
- `condition.inLibrary: true` adalah invariant Library.
- `filter` hanya untuk refinement; jangan mengirim `filter.inLibrary` yang bertentangan.
- Sorting harus dibatasi ke empat enum yang ada.
- `totalCount` boleh untuk metadata; bukan pengganti cursor.
- Thumbnail harus melalui `ResourceService`; jangan menganggap `thumbnailUrl` langsung dapat dipakai sebagai image tanpa auth.
- Perlu runtime test dengan library non-empty untuk membuktikan kombinasi `condition` + `filter` + `order` dan nilai cursor. Schema validation saja tidak membuktikan data semantics.

### Step 3 — UI

- Read-only Library grid/list; belum detail, chapter, reader, atau download.
- Gunakan `ConnectionProvider`/coordinator context; jangan membuat Apollo Client/AuthService sendiri.
- Tampilkan empty/loading/error state yang jujur.
- Jangan menampilkan unread/download/bookmark counts sebagai filter/sort sebelum ada server-side proof.
- Thumbnail melalui ResourceService/Blob lifecycle.
- Tidak ada offline library cache.

## 11. Files changed

- `graphql/operations/libraryMangas.graphql` — operation kandidat.
- `src/core/graphql/generated/gql.ts` — generated.
- `src/core/graphql/generated/graphql.ts` — generated.
- `src/core/graphql/libraryMangas.generated.test.ts` — generated-document validation.
- `docs/phase-1-library-contract.md` — audit ini.
- `README.md` — operation list/tree.

Pada audit Step 1 tidak ada data layer/repository/UI. Step 2 kemudian menambahkan data layer di [phase-1-library-data.md](phase-1-library-data.md); Library UI, Manga Detail, Chapter, Reader, Downloads, dan Offline tetap belum dibuat.
