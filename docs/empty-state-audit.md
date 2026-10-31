# Empty state audit

Tanggal: 1 November 2026  
Status: **Goal 10 complete**  
Cakupan: Library, kategori kosong, pencarian tanpa hasil, source tanpa hasil, Updates, History, Downloads, failed downloads, Extensions, tracking, migration.

## Prinsip

Empty state harus:

- mengatakan apa yang kosong dan mengapa;
- menawarkan satu next action yang relevan;
- tidak menampilkan filter/sort/bulk yang tidak berguna;
- membedakan “belum ada data” dari “tidak ada hasil untuk filter ini”.

## Matriks

| Empty state | Copy | Kontrol yang tersisa | Next action |
| --- | --- | --- | --- |
| Library kosong | `Your library is empty` | Search/filter tetap, tapi tidak menyesatkan | `Browse sources` |
| Kategori kosong/no result | `No manga found` | Filter tetap | `Reset filters` |
| Search tanpa hasil | hasil kosong | Query tetap | sumber/browse |
| Source kosong | `No manga found` | Search/filter | `Clear search` jika ada query, `All sources` |
| Source filter tanpa hasil | `No manga match these filters` | Filter drawer | `Clear filters` |
| Updates kosong | `No updates yet` | filter feed | `Open library` |
| Updates filter kosong | `Nothing in this filter` | filter | `Show all updates` |
| History kosong | `No reading history yet` | — | `Browse sources` |
| Downloads queue kosong | `The download queue is empty` | stats | `Browse library` |
| Downloaded chapters kosong | `No downloaded chapters on this server` | — | `Browse library` |
| Device files kosong | `No chapters saved to this device` | — | informasional; simpan dari downloaded chapter |
| Failed downloads kosong | section tidak dirender | — | — |
| Extensions kosong | `No extensions` | Add store di bawah | `Add store` anchor |
| Tracking kosong | `No tracker is linked` / log in | form jika tracker tersedia | link ke tracking settings bila tidak ada tracker |
| Migration result kosong | route belum aktif | — | — |

## Perubahan

- Library empty sekarang memiliki `Browse sources`, dan no-result memiliki `Reset filters`.
- Source no-result memiliki `Clear search`/`All sources`; no-match-filter memiliki `Clear filters`.
- Updates empty memiliki `Open library`; filter kosong memiliki `Show all updates`.
- History empty memiliki `Browse sources`.
- Downloads queue/downloaded kosong memiliki `Browse library`.
- Extensions empty memiliki anchor ke Add store.
- Tracking tanpa tracker memiliki link ke Settings → Tracking.

## Yang tidak diubah

- Search idle tetap hanya menjelaskan fungsi; input adalah next action.
- Empty category tidak diberi tombol “Create category” karena management categories berada di halaman lain; `Reset filters` lebih relevan.
- Failed downloads tidak mendapat empty section sendiri; section queue menampilkan status.
- Extension empty tidak memaksa membuka store; user dapat menambahkan store atau JAR di bawah.

## Sisa concerns

1. Copy beberapa empty state masih berbahasa Inggris literal; Goal 17.
2. `Reset filters` pada Library menghapus category dan sort juga; label bisa lebih tepat `Clear all refinements` pada Goal 17.
3. Migration result belum ada route; belum dapat diuji.
4. Empty state full-page pada phone perlu dicek touch target; Goal 11.
5. Error vs empty state belum selalu dibedakan secara visual; Goal 11/15.

## Validasi

- Library, Manga, Parity tests (67 passed).
- Typecheck/lint.
- Browser 1280×900: Library no-result menampilkan `Reset filters`; Downloads queue kosong menampilkan `Browse library`; device-empty tetap informasional.
