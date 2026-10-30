# Phase 1 — Library React UI

Tanggal: **29 Oktober 2026**
Status: **Step 4 implemented** (desain dirombak pada Step 4 polish, lalu dirapikan pada Taste pass); Step 5 authenticated thumbnails belum dimulai.

## Arah desain

Library adalah layar konten, bukan formulir admin. Hierarki: **judul ringkas → navigasi kategori → grid manga**. Semua kontrol pencarian, filter, dan sort diletakkan di satu baris header yang sama dengan judul, sehingga grid muncul sedini mungkin.

Prinsip yang dipakai:

- Satu baris header: `Library` + jumlah manga di kiri, kontrol di kanan.
- Kategori memakai teks dengan indikator garis bawah, bukan pill/chip.
- Filter dan Sort adalah disclosure compact; tidak ada kontrol yang selalu terbuka.
- Warna aksen hanya untuk status aktif dan fokus; aktif kategori memakai warna teks + garis, bukan fill.
- Semua spacing, durasi, radius, dan skala tipe memakai token di `:root` (`--sp-*`, `--text-*`, `--weight-*`, `--dur-*`, `--radius-*`), tidak ada nilai hard-code tersebar.
- Skala bentuk: kontrol 8 px (`--radius-sm`), permukaan cover 10 px (`--radius-cover`), overlay menu 12 px (`--radius-md`).

## Layout/design

```text
Library   40 manga                    [ ⌕ Cari… ]  [Filter] [Sort]
──────────────────────────────────────────────────────────────────
All   Default   The GOAT   Bloodlust   Love Hazard   NFSW
[card] [card] [card] [card] [card] [card] [card] [card] [card]
```

- Tinggi chrome desktop: padding atas 16 px + header ±40 px + tab kategori 40 px + jarak 16 px.
- Tinggi chrome mobile: padding atas 12 px + header 44 px (target sentuh) + tab 44 px.
- Tidak ada header “Suwayomi” kedua dan tidak ada link `Connection` di Library.
- Lebar shell Library tetap `min(100%, 120rem)` sehingga desktop lebar memakai ruang penuh.

### Mobile 390 px

```text
Library   40 manga                        ⌕   Filter   Sort
──────────────────────────────────────────────────────────
All   Default   The GOAT  …
```

Tombol `⌕` membuka baris pencarian penuh selebar kontainer di bawah header. Baris ditutup lewat tombol yang sama atau `Escape`; query yang sudah di-submit tetap tersimpan dan tombol menampilkan indikator aktif saat field ditutup. `Clear search` mengosongkan query dan mengembalikan library ke tampilan tanpa search.

## Component structure

```text
src/app/AppRouter.tsx
  ├─ /             ConnectionPage
  └─ /library      LibraryPage
                    └─ ConnectedLibrary
                        ├─ LibraryController
                        ├─ LibraryCategoryController
                        ├─ LibraryMenu          (disclosure Filter/Sort)
                        └─ MangaCard + MangaCardSkeleton
```

File:

- `src/features/library/LibraryPage.tsx` — page, wiring controller, header, kategori, results
- `src/features/library/LibraryMenu.tsx` — panel disclosure dengan navigasi keyboard
- `src/features/library/MangaCard.tsx` — card dan skeleton
- `src/features/library/icons.tsx` — satu keluarga ikon 16 px, stroke 1.5
- `src/features/library/LibraryPage.test.tsx` — 21 behavior test
- styling di `src/app/app.css` (bagian `Library`)
- route dan link di `src/app/AppRouter.tsx` / `src/features/connection/ConnectionPage.tsx`

## Controller wiring

Tidak berubah dari Step 4 sebelumnya. `LibraryPage` hanya merender screen bila connection `connected`; jika tidak, redirect ke `/`.

`ConnectedLibrary` membuat repository dari current connected context:

```ts
createLibraryRepository({ getClient: () => context.graphQL })
```

Lalu membuat `createLibraryController({ repository })` dan `createLibraryCategoryController({ repository })`, dan berlangganan lewat `useSyncExternalStore(controller.subscribe, controller.getState)`.

Initial `load()` dijalankan sekali per controller (ref guard) sehingga StrictMode tidak menggandakan request. Repository/controller dibuat ulang bila `context.graphQL` berubah.

UI tidak membuat Apollo Client, AuthService, ResourceService, token, URL server, atau fetch manual. `LibraryController`, `LibraryCategoryController`, dan `LibraryRepository` tidak diubah pada perombakan ini.

## Search behavior

- Form `role="search"` dengan input `Search library`; **tidak ada tombol submit terpisah**.
- `Enter` men-submit form dan memanggil `controller.setSearch(search.trim())`.
- Tidak ada request per keystroke dan tidak ada fuzzy filtering di client; hasil berasal dari server.
- Tombol `Clear search` muncul saat input berisi teks dan mengembalikan library ke tampilan tanpa filter search.
- Desktop: field selalu terlihat, lebar `clamp(14rem, 26vw, 20rem)` (maks 320 px).
- Mobile: field disembunyikan dan dibuka lewat tombol ikon `Search` (`aria-expanded`, `aria-controls`); fokus otomatis ke input saat dibuka, dan kembali ke tombol saat ditutup.
- Menutup field tidak menghapus query; tombol menampilkan indikator aktif dan accessible name `Search, active` sampai query di-clear.

## Filter dan sort

Keduanya disclosure button (`aria-expanded`, `aria-controls`) dengan panel `role="menu"`.

- Panel hanya ada saat dibuka; tidak ada kontrol form permanen di halaman.
- Panel dirender sebagai `role="menu"` dengan item `role="menuitemradio"` + `aria-checked`, satu tab stop.
- Navigasi keyboard: `ArrowUp`/`ArrowDown`/`Home`/`End` memindah fokus, `Escape` menutup dan mengembalikan fokus ke trigger, klik di luar menutup panel.
- Memilih item langsung menerapkan nilai dan menutup panel.
- Tombol mendapat indikator titik aksen dan teks tersembunyi `, active` saat refinement aktif; accessible name menjadi `Filter, active` / `Sort, active`.

### Filter

Satu grup `Status`:

- All statuses
- Ongoing
- Completed
- Licensed
- Publishing finished
- Cancelled
- On hiatus
- Unknown

`All statuses` mengirim filter status kosong (tidak ada `status` di GraphQL).

### Sort

Dua grup dalam satu panel:

- Sort by: Title, Date added, Last fetched, ID
- Direction: Ascending, Descending

Default tetap `dateAdded` + `desc`.

### Source filter decision

Source filter **tidak dibuat**. Foundation belum punya source list/name boundary (tidak ada generated source operation di UI); menampilkan dropdown ID mentah akan menyesatkan. Ditunda sampai source metadata boundary tersedia.

## Category navigation

- Synthetic `All` selalu pertama dan memanggil `setCategory(null)` (tidak mengirim `categoryId`).
- Backend `Default` ID 0 tetap kategori nyata: `setCategory(0)` mengirim `categoryId: 0`.
- Nama kategori berasal dari GraphQL; hanya label `All` milik frontend.
- Tampilan: teks nav dengan indikator garis 2 px di bawah item aktif, bukan pill. Item aktif memakai warna teks penuh + weight 650; item lain muted.
- Active state memakai `aria-pressed="true"` (bukan hanya warna).
- Baris kategori horizontal scroll dengan scrollbar disembunyikan; `overscroll-behavior-x: contain`.
- Loading kategori tampil sebagai catatan kecil terpisah; manga tetap tampil.
- Error kategori menampilkan catatan subtle dan `All` tetap tersedia.
- Jika controller mempertahankan kategori lama setelah reload error, UI tetap menampilkan data lama + peringatan.

## Manga grid dan card

- Grid `repeat(auto-fill, minmax(clamp(8.25rem, 11vw, 9.75rem), 1fr))`; ±10 kolom pada 1920, 7 kolom pada 1280, 2 kolom pada 390.
- Card hanya berisi placeholder cover (rasio 2:3) dan judul; belum ada navigasi ke Manga Detail.
- Placeholder cover: bidang netral `--surface-sunken`, inisial judul, dan label kecil `No cover`. Tidak ada gradient atau efek dekoratif.
- Judul: 0.8125 rem, weight 600, clamp dua baris, `title` attribute untuk teks penuh, `overflow-wrap: anywhere`.
- Hover (hanya pada perangkat `hover: hover`): cover terangkat 2 px dengan border dan shadow lebih tegas.
- Tanpa animasi masuk: kartu tampil langsung (stagger dan fade dihapus pada Taste pass).
- Skeleton 12 kartu statis tanpa pulse; status loading ditandai count “Loading…” dan `aria-busy`.

## Loading/empty/error

Perilaku tidak berubah, hanya presentasi:

- Initial loading: skeleton grid stabil, count “Loading…”, `aria-busy="true"`.
- Empty Library tanpa narrowing: “Your library is empty”.
- Search/status/kategori menghasilkan nol: “No manga found”.
- Initial error: “Couldn't load library” + `Retry`; error mentah/stack tidak dirender.
- Kategori loading/error terpisah dan tidak memblokir manga.
- Load more: tombol hanya muncul jika `hasNextPage`; disabled dan berlabel “Loading…” saat memuat; error load-more mempertahankan card dan menampilkan alert di dekat tombol; tidak ada infinite scroll.

## Responsive/accessibility

- Breakpoint utama 720 px; di atas itu search selalu terlihat, di bawahnya menjadi expandable.
- Target sentuh mobile: tombol aksi dan item menu ≥ 2.75 rem (44 px).
- Tidak ada horizontal page overflow: `min-width: 0` pada shell, header grid, dan baris kategori; kategori scroll di dalam kontainernya sendiri.
- Panel menu dibatasi `min(17rem, calc(100vw - 1.75rem))` agar tidak pernah melewati viewport.
- Semua kontrol punya accessible name; ikon `aria-hidden`; status aktif diumumkan lewat teks tersembunyi dan `aria-expanded`.
- `:focus-visible` global tetap dipakai (outline 3 px).
- `prefers-reduced-motion` mematikan dua transisi yang tersisa: panel menu dan baris pencarian mobile.
- Dark mode memakai token terpisah dan diaudit untuk kontras teks muted di atas `--bg`.

## Placeholder thumbnail

Step 4 tetap tidak memakai `thumbnailUrl` sebagai `<img src>`, tidak fetch Blob, tidak membuat object URL, dan tidak menambahkan Authorization. Container `.manga-card-cover` siap menerima hasil ResourceService pada Step 5 tanpa redesign grid/card.

## Taste pass

Merapikan visual tanpa mengubah struktur interaksi, semantik, atau perilaku:

- **Tipografi:** skala tipe terpusat (`--text-xs` 11 px, `--text-sm` 13 px, `--text-md` 14 px, `--text-title` clamp 21-26 px) dan bobot terpusat (`--weight-medium` 550, `--weight-semibold` 620, `--weight-title` 650). Judul Library turun dari ±30 px ke 21-26 px dengan tracking lebih longgar; count, kontrol, tab, dan judul kartu memakai 13 px dengan bobot lebih ringan, sehingga hierarki dibawa oleh bobot dan warna, bukan ukuran.
- **Spacing:** jarak grid dirapatkan (baris 14-20 px, kolom 10-14 px); tab kategori tetap 40 px desktop / 44 px mobile; jarak header ke grid 16 px desktop dan 12 px mobile.
- **Warna:** neutral dibuat benar-benar netral (light `#f7f7f8`, dark `#0b0c0e`) dan permukaan dark tidak lagi kebiruan (`#16181d` / `#1e2026`), muted dark `#9ea6b4`. Aksen tetap satu: biru, hanya untuk fokus dan indikator aktif.
- **Batas dan radius:** skala bentuk didokumentasikan (kontrol 8, cover 10, overlay 12); bayangan menu memakai `--shadow-pop` yang lebih rapat, menggantikan bayangan panel besar.
- **Kategori:** indikator garis 2 px dipertahankan; tab 13 px bobot 550 dengan aktif 620; fokus keyboard memakai outline 2 px di dalam tab agar tidak terpotong container scroll.
- **Kontrol:** Filter/Sort lebih ringan (padding 8 px, gap 6 px, ikon pada 90% opasitas); fokus keyboard kontrol memakai outline 2 px dengan offset 2 px.
- **Kartu:** radius cover tetap 10 px; hover hanya menguatkan border (tanpa lift dan tanpa shadow) karena kartu belum bisa diklik; judul 13 px, bobot 550, line-height 1.4, clamp dua baris.
- **Motion:** animasi masuk kartu (fade + rise 6 px, stagger 30 ms) dan pulse skeleton dihapus. Tersisa dua transisi yang berguna: panel menu 140 ms dan baris pencarian mobile 220 ms, keduanya dimatikan pada `prefers-reduced-motion`.
- **Copy:** “The request to your server failed. Try again.” dan “Manga you add in Suwayomi will appear here.”

## Runtime proof

Pengukuran runtime final pada server `https://suwayomi.alphasquare.my.id` (auth `NONE`, versi `v2.4.2366`, 40 manga):

- 1280×900 desktop: shell 1265, header/content 1224, search 320, actions 135; 8 kolom; 40 cards.
- 1920×1080 desktop: shell 1920, header/content 1859, search 320.
- Filter menu: lebar 256, right edge 1245 pada viewport 1265.
- 390×844 mobile: `scrollWidth = 390`, tanpa overflow horizontal; search tertutup (display none), dibuka menjadi 362 px, Escape menutup dan mengembalikan fokus ke tombol Search.
- Filter `Ongoing` menghasilkan 3 manga.
- Sort `Title` + `Ascending` berhasil di request dan urutan berubah.
- Console error: 0.
- Failed network request: 0.

Load more tidak muncul karena server mengembalikan tepat 40 manga dengan page size 40; perilaku load-more diverifikasi unit test.

## Tests

`src/features/library/LibraryPage.test.tsx` — **21 behavior test**:

- initial skeleton + `aria-busy`;
- populated cards/count;
- refine control tetap collapsed (tidak ada `menuitemradio`/`combobox` permanen);
- empty library;
- no-result search;
- initial error + retry tanpa raw error;
- All + Default ID 0 distinction;
- category failure dengan All tetap tersedia;
- category loading independen;
- search trim + request server (Enter);
- clear search kembali ke library tidak terfilter;
- toggle pencarian mobile (`aria-expanded`, fokus, Escape);
- tutup search yang sudah di-submit tetap menyimpan query dan menampilkan active state;
- status filter via menu (8 opsi, `Filter, active`, `status.equalTo`);
- Escape menutup menu filter + fokus kembali ke trigger;
- ArrowDown memindah fokus dan Tab keluar ke kontrol berikutnya;
- sort field + direction via menu (`order: TITLE/ASC`);
- load more append/end;
- loading-more disabled;
- load-more error mempertahankan card;
- tidak ada load-more di akhir data.

Controller/category/repository test tetap seperti Step 2/3/3.5.

## Validation

```text
npm run codegen:check  PASS
npm run lint           PASS
npm run typecheck      PASS
npm run test           PASS — 212 passed, 7 skipped (219 total; 26 file)
npm run build          PASS — CSS 15.84 kB (gzip 4.08 kB), JS 493.17 kB (gzip 150.80 kB)
```

Tidak ada generated GraphQL yang berubah pada Step 4.

## Limitations untuk Step 5/6

- Thumbnail masih placeholder; ResourceService/real image belum diintegrasikan.
- Card belum clickable; Manga Detail route belum ada.
- Source filter ditunda karena source metadata boundary belum ada.
- Category manga count tidak ada.
- Pemeriksaan visual 1280/390 dan runtime load-more dengan data >40 belum diulang setelah perombakan maupun Taste pass.
- Belum ada browser test untuk UI_LOGIN (server runtime NONE).
- Belum ada empty-library nyata; empty/no-result diuji dengan fixture.
