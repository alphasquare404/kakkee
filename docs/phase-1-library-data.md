# Phase 1 — Library Data Layer

Tanggal: **29 Oktober 2026**

Baseline: **Suwayomi Server stable v2.4.2366**

Operation: `LibraryMangasDocument`
Status: **Step 2 implemented**; Library UI belum dibuat.

## Boundary

```text
React UI (belum ada)
       ↓
ConnectionProvider / ConnectionCoordinator
       ↓  current ApolloClient
LibraryRepository
       ↓
LibraryMangasDocument
       ↓
Suwayomi stable server
```

`LibraryRepository`:

- tidak membuat Apollo Client;
- tidak membuat AuthService/ResourceService/WebSocket;
- tidak memegang token;
- tidak melakukan fetch/resource request;
- tidak menyusun URL server;
- menerima `getClient()` dan memanggilnya untuk **setiap** request.

`getClient` harus membaca client dari current connected coordinator context. Repository tidak menyimpan client secara global; test memastikan client pertama tidak dipakai setelah client diganti.

## API

```ts
const repository = createLibraryRepository({
  getClient: () => currentConnectedContext.graphQL,
});

const page = await repository.getPage({
  first: 40,
  after: endCursor,
  filter: { search: 'alpha' },
  sort: { field: 'title', direction: 'asc' },
});

const categories = await repository.getCategories();
```

`getCategories()` memakai generated `LibraryCategoriesDocument`, urutan backend (`ORDER ASC`), dan `network-only`; detail category ada di [phase-1-library-categories.md](phase-1-library-categories.md).

Output:

```ts
{
  items: LibraryManga[],
  totalCount: number,
  pageInfo: {
    endCursor: string | null,
    hasNextPage: boolean,
  },
}
```

`LibraryManga` adalah generated `LibraryMangasQuery['mangas']['nodes'][number]`. Tidak ada duplicate Manga DTO.

## Page size

- Default: **40**
- Minimum: **1**
- Maximum aplikasi: **50**
- Invalid value melempar `LibraryInputError` dengan code `INVALID_PAGE_SIZE`.

Nilai 40 dipilih sebagai jumlah konservatif untuk grid Library desktop (sekitar 5 kolom × 8 baris). Schema tidak menyatakan maximum server; cap 50 adalah batas aplikasi, bukan klaim server.

## Pagination

Forward cursor only:

```text
first + after
```

Tidak memakai `last`, `before`, atau `offset`.

Aturan:

- `after` adalah opaque string dari `pageInfo.endCursor`; tidak di-decode/di-parse.
- `after` kosong/whitespace dihilangkan dari variables.
- `endCursor: null` dipertahankan pada output.
- `hasNextPage: false` dipertahankan.
- Empty page dan `totalCount: 0` adalah hasil valid, bukan error.
- Request berikutnya harus memakai `endCursor` dari halaman sebelumnya.

## Filters

Input repository dibatasi, bukan raw `MangaFilterInput`:

```ts
{
  search?: string;
  status?: MangaStatus;
  sourceId?: string;
  categoryId?: number;
}
```

Mapping:

| Input | GraphQL |
|---|---|
| `search` | `filter.title.includesInsensitive` |
| `status` | `filter.status.equalTo` |
| `sourceId` | `filter.sourceId.equalTo` |
| `categoryId` | `filter.categoryId.equalTo` |

Search normalization:

- trim leading/trailing whitespace;
- empty/whitespace-only tidak mengirim title filter;
- tidak ada fuzzy/client-side search.

Category multi-select belum diekspos. Stable schema menyediakan `condition.categoryIds`, tetapi penggabungan dengan invariant `inLibrary` perlu diuji dengan data nyata pada langkah berikutnya.

## Sorting

```ts
type LibrarySortField = 'title' | 'dateAdded' | 'lastFetched' | 'id';
type LibrarySortDirection = 'asc' | 'desc';
```

Default: `{ field: 'dateAdded', direction: 'desc' }`.

Mapping:

| Domain | Stable enum |
|---|---|
| `title` | `TITLE` |
| `dateAdded` | `IN_LIBRARY_AT` |
| `lastFetched` | `LAST_FETCHED_AT` |
| `id` | `ID` |

Direction selalu eksplisit `ASC`/`DESC`.

Tidak diekspos: unread, download count, chapter count, last read, latest chapter, tracker, random.

## Library invariant

Operation selalu memakai:

```graphql
condition: { inLibrary: true }
```

Input repository tidak memiliki `condition` atau raw `MangaFilterInput`, sehingga caller tidak dapat mengubah invariant menjadi `false`. Test juga memastikan properti `condition` tambahan pada runtime input tidak masuk ke variables.

## Response mapping

Repository mengembalikan halaman apa adanya dari generated result:

- `items` = `mangas.nodes`
- `totalCount` = `mangas.totalCount`
- `pageInfo.endCursor` = `mangas.pageInfo.endCursor`
- `pageInfo.hasNextPage` = `mangas.pageInfo.hasNextPage`

Jika response sukses tidak memiliki `data.mangas`, repository melempar error; tidak mengubahnya menjadi Library kosong.

Error GraphQL/Apollo diteruskan tanpa di-swallow. Repository tidak melakukan refresh/reconnect/auth interpretation sendiri.

## Apollo policy

Query Library memakai:

```ts
fetchPolicy: 'network-only'
```

Alasan:

- MVP membaca data Library dari server secara prediktabel.
- Tidak mengandalkan cache global untuk pagination/filter/sort.
- Server switch tetap membersihkan cache melalui connection lifecycle Phase 0.
- Tidak ada persistence/offline cache.

## Thumbnail

Repository hanya membawa:

- `thumbnailUrl`
- `thumbnailUrlLastFetched`

Repository tidak melakukan fetch Blob/resource. Thumbnail tetap harus melalui `ResourceService` pada UI integration.

## Connection/session safety

`getClient` dipanggil per request. Test mengganti client antara dua request dan memastikan:

- request pertama memakai client pertama;
- request kedua memakai client kedua;
- client lama tidak disimpan sebagai module singleton.

Repository tidak membuat token/session sendiri. Server switch/disconnect tetap menjadi lifecycle `ConnectionCoordinator`.

## Tests

`src/core/library/libraryRepository.test.ts`:

- default page size 40;
- custom page size dan max 50;
- invalid page size;
- `after` diteruskan;
- empty/whitespace cursor dihilangkan;
- title trim dan empty search;
- status/source/category mapping;
- sort mapping semua field/direction;
- normal page, empty page, null `endCursor`, `hasNextPage: false`, `totalCount: 0`;
- error GraphQL diteruskan;
- malformed response tidak menjadi empty page;
- client diganti per request;
- invariant Library tidak dapat di-override;
- error tidak memuat credential/server URL.

Full suite: 166 test total (159 pass + 7 integration runtime yang di-skip tanpa env). Build root dan PWA lulus; generated operation tidak berubah.

## Runtime validation status

Probe langsung ke stable v2.4.2366 (NONE, library test kosong) berhasil:

```json
{
  "nodes": [],
  "pageInfo": { "endCursor": null, "hasNextPage": false },
  "totalCount": 0
}
```

Ini membuktikan entry point/selection set/pagination envelope berjalan pada server stable, termasuk empty page dan `totalCount: 0`.

Belum dilakukan runtime proof dengan library **non-empty**. Stable test server tidak memiliki data manga/library yang cukup untuk membuktikan:

- pagination halaman kedua dengan cursor nyata;
- title filter dengan hasil non-empty;
- sorting dengan beberapa manga;
- kombinasi `condition` + `filter` + `order`.

Ini dicatat sebagai pending runtime validation untuk Step 3/awal integrasi, bukan hasil yang dikarang. Codegen dan unit mapping sudah tervalidasi terhadap snapshot stable.

## Non-goals

Tidak ada Library React screen, MangaCard, thumbnail Blob rendering, Manga Detail, Chapters, Reader, Downloads, offline, Zustand, UI library, Apollo client baru, auth baru, atau service worker cache baru.
