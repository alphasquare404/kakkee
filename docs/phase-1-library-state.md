# Phase 1 — Library Pagination / Filter / State Model

Tanggal: **29 Oktober 2026**

Baseline: **Suwayomi Server stable v2.4.2366**
Status: **Step 3 implemented**; Library React UI belum dibuat.

Dokumen ini menjelaskan controller state Library di `src/core/library/libraryController.ts`. Controller tidak bergantung pada React dan tidak membuat transport/auth/resource baru.

## Boundary

```text
Future Library UI
       ↓
LibraryController
       ↓
LibraryRepository
       ↓
Current ApolloClient dari ConnectionCoordinator
```

Controller menerima repository melalui dependency injection. Tidak ada singleton global dan tidak ada client yang disimpan melewati server switch. Future UI dapat memakai `useSyncExternalStore` atau hook tipis di atas `subscribe/getState`.

## State shape

```ts
interface LibraryState {
  items: readonly LibraryManga[];
  totalCount: number;
  pageInfo: {
    endCursor: string | null;
    hasNextPage: boolean;
  };
  filter: LibraryFilter;
  sort: LibrarySort;
  isInitialLoading: boolean;
  isLoadingMore: boolean;
  initialError: unknown | null;
  loadMoreError: unknown | null;
}
```

State menyimpan **visible page collection** untuk pagination UI. Ini bukan cache database kedua dan tidak menggantikan Apollo normalized cache.

## API

```ts
const controller = createLibraryController({
  repository,
  pageSize: 40, // optional; default repository 40
  initialFilter: {},
  initialSort: { field: 'dateAdded', direction: 'desc' },
});

controller.getState();
const unsubscribe = controller.subscribe(listener);

await controller.load();       // initial load / full reload
await controller.loadMore();
await controller.setSearch('alpha');
await controller.setFilter({ status: 'ONGOING' });
await controller.setSort({ field: 'title', direction: 'asc' });
```

- `load()` mengambil first page dengan criteria saat ini. Jika data lama ada, data langsung dikosongkan dan diganti.
- Tidak ada API `refresh()` terpisah; `load()` adalah explicit reload/first-page load.
- Semua method mengembalikan Promise dan menyimpan error ke state, bukan melempar error ke UI.
- `setSearch()` mempertahankan filter lain.
- `setFilter()` mengganti filter domain; caller harus menggabungkan field sendiri jika perlu.
- `setSort()` mengganti sort.

## Loading semantics

| Situasi | State |
|---|---|
| Belum load | `isInitialLoading: false`, empty |
| First load | `isInitialLoading: true`, items kosong |
| First load sukses | items, total, pageInfo; `isInitialLoading: false` |
| First load error | items kosong, `initialError`, `isInitialLoading: false` |
| Load more | items lama tetap, `isLoadingMore: true` |
| Load more sukses | append/dedupe, pageInfo baru |
| Load more error | items lama tetap, `loadMoreError`, `isLoadingMore: false` |

Load-more tidak pernah menjadi full-screen initial loading.

## Pagination semantics

- Forward cursor only; memakai `endCursor` dari response sebelumnya.
- `hasNextPage: false` → `loadMore()` no-op; tidak request tambahan.
- `hasNextPage: true` + `endCursor: null` → `LibraryPaginationError` dengan code `INCONSISTENT_PAGINATION`; tidak request dan tidak loop.
- `loadMore()` saat `isLoadingMore: true` diabaikan; tidak ada request duplikat.
- `loadMore()` saat `isInitialLoading: true` diabaikan.
- `endCursor` tidak didecode/dibentuk ulang.
- Empty page dengan `hasNextPage: false` valid.
- `totalCount` diperbarui dari page terbaru.

## Append/dedupe

Saat page berikutnya sukses:

- existing items dipertahankan urutannya;
- item baru ditambahkan di belakang;
- item dengan `manga.id` yang sudah ada dilewati;
- duplicate di dalam incoming page juga dilewati;
- tidak ada reorder.

Dedupe by `id` dipilih karena deterministic dan kecil. Cursor pagination normal tidak boleh menghasilkan duplicate; dedupe adalah proteksi response/cache.

## Criteria changes dan reset

`search`, `filter`, atau `sort` yang berubah:

1. menaikkan generation;
2. mengosongkan `items`, `totalCount`, dan pageInfo lama;
3. set `isInitialLoading: true`;
4. mengambil first page untuk criteria baru;
5. hasil lama tidak pernah diappend ke dataset baru.

Pilihan ini sengaja **langsung mengosongkan data lama** agar UI tidak menampilkan hasil filter lama seolah-olah cocok dengan filter baru. Konsekuensinya ada loading state singkat; ini sederhana dan konsisten.

## Stale request protection

Setiap first-page load memiliki request generation. Setiap load-more menangkap generation saat dimulai.

Respons diabaikan jika generation sudah berubah karena:

- search/filter/sort baru;
- `load()` baru.

Tidak ada AbortController di controller karena repository/Apollo contract tidak menjamin cancel semantics. Request lama mungkin tetap berjalan, tetapi **tidak boleh mengubah state baru**. Ini bukan auth/session generation; auth/session tetap milik Phase 0.

Test mencakup:

- initial response lama setelah search baru;
- load-more lama setelah criteria berubah;
- stale response tidak mengubah items/filter.

## Search/filter normalization

`LibraryFilter` adalah domain filter yang sama dengan repository:

- `search`: disimpan sebagai input; repository melakukan trim dan menghilangkan empty title filter;
- `status`: diteruskan ke repository;
- `sourceId`: diteruskan;
- `categoryId`: single category.

Controller tidak mengulang mapping ke `MangaFilterInput`, karena itu milik repository.

## Sorting

Hanya sort repository yang didukung:

- `title`
- `dateAdded`
- `lastFetched`
- `id`

Direction `asc`/`desc`. Default state sama dengan repository: `dateAdded desc`.

Tidak ada unread/download/bookmark/chapter/tracker/random sorting.

## Error model

- `initialError`: first-page failure; items kosong.
- `loadMoreError`: page berikutnya gagal; items lama dipertahankan.
- Error mentah Apollo/GraphQL diteruskan sebagai `unknown`; UI nanti memetakan error.
- Controller tidak melakukan refresh token, reconnect, atau auth interpretation.
- `LibraryPaginationError` hanya untuk inconsistency pagination.
- Error tidak diubah menjadi Library kosong palsu.

## React integration (future)

Step 3 tidak membuat hook atau visual UI. Future hook cukup:

```ts
useSyncExternalStore(controller.subscribe, controller.getState)
```

UI harus membuat controller dari repository yang memakai current connected Apollo client; jangan membuat ApolloClient baru.

## Validation

```text
npm run codegen:check  PASS
npm run lint           PASS
npm run typecheck      PASS
npm run test           PASS — 182 total, 175 pass, 7 skipped
npm run build          PASS
```

7 runtime integration di-skip karena env server stable tidak diset. Generated GraphQL tidak berubah.

## Limitations

- Belum ada UI, grid, MangaCard, toolbar, CSS.
- Belum ada thumbnail Blob; controller hanya membawa `thumbnailUrl`.
- Belum ada multi-category filter.
- Belum ada multi-column sorting.
- Belum ada explicit debounce search; UI/Step 4 dapat menambah debounce di event layer.
- Request lama tidak dibatalkan; hanya hasilnya diabaikan.
- Belum ada runtime proof dengan library non-empty; repository runtime proof hanya empty library.
- Apollo normalized cache tetap sumber data server; controller bukan cache pengganti.
