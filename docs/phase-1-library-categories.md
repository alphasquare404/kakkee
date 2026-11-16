# Phase 1 — Library Category Support

Tanggal: **29 Oktober 2026**

Baseline: **Suwayomi Server stable v2.4.2366**
Status: **Step 3.5 implemented**; category UI belum dibuat.

## Stable category contract

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

category(id: Int!): CategoryType!
```

`CategoryNodeList`:

```graphql
type CategoryNodeList implements NodeList {
  edges: [CategoryEdge!]!
  nodes: [CategoryType!]!
  pageInfo: PageInfo!
  totalCount: Int!
}
```

`CategoryType` relevant fields:

```graphql
type CategoryType {
  id: Int!
  name: String!
  order: Int!
  default: Boolean!
  isDefaultCategory: Boolean!
  includeInUpdate: IncludeOrExclude!
  includeInDownload: IncludeOrExclude!
  mangas: MangaNodeList!
  # ...
}
```

Ordering:

```graphql
enum CategoryOrderBy {
  ID
  NAME
  ORDER
}

input CategoryOrderInput {
  by: CategoryOrderBy!
  byType: SortOrder
}
```

Category list operation memakai:

```graphql
categories(order: [{ by: ORDER, byType: ASC }]) {
  nodes {
    id
    name
    order
  }
}
```

Alasan selection set minimum:

- `id` untuk identity dan filter manga.
- `name` untuk label; tidak ada hardcode nama server.
- `order` untuk urutan user configuration.
- `default`/`isDefaultCategory` tersedia tetapi tidak dipakai untuk navigasi. Default category sekarang dibaca dari `CategoryCatalog`.
- Tidak mengambil `mangas`, `totalCount`, `pageInfo`, atau meta; tidak ada category count/N+1.

Category operation tidak memakai pagination. Kategori adalah navigation list kecil dan stable; pagination belum diperlukan. Ini dapat ditambahkan jika jumlah kategori nyata menunjukkan kebutuhan.

## Runtime findings

Stable v2.4.2366 pada test server kosong mengembalikan:

```json
{
  "categories": {
    "nodes": [
      {
        "id": 0,
        "name": "Default",
        "order": 0
      }
    ]
  }
}
```

- Backend memiliki **Default category dengan ID 0**, `default: true`, `isDefaultCategory: true`, `order: 0`.
- `category(id: 1)` tidak ada pada server kosong; jangan menganggap ID 1 adalah default.
- `Query.categories` tersedia dan mengembalikan category list.
- Library query dengan `filter.categoryId.equalTo: 0` dapat mengembalikan kosong walaupun Default berisi manga. Lihat koreksi runtime di bawah.

### Default vs uncategorized vs All

Runtime correction (2026-11-17): pada server dengan Default berisi 1 manga:

```text
categories[0].mangas.totalCount       = 1
category(id: 0).mangas.nodes          = [manga dengan categories: []]
manga.categories.nodes                = []
mangas(filter categoryId.equalTo: 0)  = 0
mangas(filter categoryId.isNull: true)= 1
```

Kesimpulan:

- **Default** adalah backend category nyata dengan ID 0, tetapi keanggotaannya direpresentasikan sebagai manga tanpa kategori eksplisit.
- `manga.categories` tidak mengembalikan Default.
- `filter.categoryId.equalTo: 0` **tidak** boleh dipakai untuk membaca isi Default.
- Frontend memetakan Default category ID 0 ke filter `categoryId.isNull: true`.
- **Uncategorized** adalah representasi data untuk anggota Default; jangan menampilkan dua konsep terpisah kepada user.
- **All** tidak ada di backend. Ini synthetic frontend option.

Synthetic filter semantics:

```text
All       → categoryId = null       → tidak mengirim category refinement
Default   → categoryId = 0          → filter.categoryId.isNull = true
Category  → categoryId = id (id>0)  → filter.categoryId.equalTo = id
```

Library invariant tetap:

```graphql
condition: { inLibrary: true }
```

Synthetic All tidak boleh dibuat sebagai category palsu di repository dan tidak boleh mengirim ID yang dikarang.

## Repository boundary

`LibraryRepository` sekarang memiliki:

```ts
getCategories(): Promise<readonly LibraryCategory[]>
```

`LibraryCategory` adalah generated:

```ts
LibraryCategoriesQuery['categories']['nodes'][number]
```

- Memakai `LibraryCategoriesDocument` generated.
- Memakai `getClient()` current per request.
- `fetchPolicy: 'network-only'`.
- Error diteruskan; tidak diubah menjadi empty category list.
- Response tanpa `data.categories` menghasilkan error.
- Order dari backend dipertahankan; repository tidak melakukan client-side sort.
- Tidak ada raw Apollo detail yang diekspos ke UI.

## Category controller

Category list memiliki controller terpisah:

```ts
const categories = createLibraryCategoryController({ repository });

categories.getState();
categories.subscribe(listener);
await categories.load();
```

State:

```ts
{
  categories: readonly LibraryCategory[];
  isLoading: boolean;
  error: unknown | null;
}
```

Alasan dipisah dari `LibraryController`:

- category list berubah jauh lebih jarang daripada manga page;
- loading/error kategori berbeda dari loading/error manga;
- future UI dapat menampilkan category navigation sambil page manga masih loading;
- menghindari mega-controller dan mempertahankan single responsibility.

Synthetic All tidak ditambahkan oleh category controller. Future UI membangun opsi All (misalnya tab pertama) dan memanggil `LibraryController.setCategory(null)`.

Category controller mempertahankan categories lama jika reload gagal; error tetap diekspos.

## LibraryController category selection

State baru:

```ts
categoryId: number | null; // null = synthetic All
filter: Omit<LibraryFilter, 'categoryId'>;
```

API baru:

```ts
await controller.setCategory(3);    // category 3
await controller.setCategory(0);    // backend Default, bukan All
await controller.setCategory(null); // synthetic All
```

- `setCategory(3)` mengirim `filter.categoryId.equalTo: 3`.
- `setCategory(0)` mengirim `filter.categoryId.equalTo: 0`.
- `setCategory(null)` tidak mengirim category filter.
- `filter` controller tidak lagi menerima `categoryId`; category adalah navigation state first-class, bukan field filter bebas.
- `setCategory` mempertahankan search, status, sourceId, dan sort.
- Category change menaikkan generation, mereset items/pageInfo, dan meminta first page baru.
- Stale response category lama diabaikan.
- `loadMore()` memakai category yang sedang dipilih.

## Reset/stale semantics

Sama dengan Step 3:

1. generation naik;
2. pagination lama invalid;
3. items lama langsung kosong;
4. first page baru dengan category baru;
5. respons lama tidak boleh mengubah state baru.

## Tests

- generated category document: operation, exact fields, order, no preview/nested mangas;
- repository: success, empty, backend order, error propagation, current client per request;
- category controller: idle/loading/success/empty/error, stale response, subscribe/unsubscribe;
- Library controller: default All, category 3, Default ID 0, return to All, preserve search/status/source/sort, reset pagination, stale category response, load-more category filter.

## Validation

```text
npm run codegen        PASS
npm run codegen:check  PASS
npm run lint           PASS
npm run typecheck      PASS
npm run test           PASS — 198 total, 191 pass, 7 skipped
npm run build          PASS
```

7 runtime integration test di-skip karena env server stable tidak diset. Runtime category proof dijalankan terpisah terhadap stable v2.4.2366.

## Limitations

- Tidak ada category tabs/chips UI; Step 4.
- Tidak ada category manga count; membutuhkan data/query tambahan dan berpotensi N+1.
- Tidak ada category CRUD/reorder.
- Category list belum dipaginasi; runtime hanya satu kategori.
- Hubungan Default vs uncategorized untuk library non-empty belum dibuktikan.
- Belum ada runtime proof dengan category selain Default atau library non-empty.
- Tidak ada thumbnail Blob, Manga Detail, Chapters, Reader, Downloads, Offline.
