# Reader chapter transition audit

Tanggal: 13 November 2026  
Status: **audit only; belum ada perubahan perilaku Reader**  
Baseline pembanding: Suwayomi-WebUI `v20260929.01` (commit `41443eab`)

## Scope dan metode

- Review kode `ReaderPage`, `readerController`, dan `readerRepository`.
- Uji browser pada mode vertical, single, double, horizontal, LTR/RTL,
  `autoAdvance` off/on, serta perpindahan chapter lewat header, keyboard, dan
  appended next chapter.
- Perbandingan langsung dengan source upstream pada tag v20260929.01.

## Ringkasan temuan

| Prioritas | Temuan | Dampak |
| --- | --- | --- |
| P0 | Chapter appended tidak menjadi chapter aktif | Judul, URL, page indicator, dan progress tetap chapter lama |
| P0 | Keyboard horizontal berpindah chapter, bukan halaman | ArrowRight melompat ke chapter berikutnya |
| P0 | Tap/swipe tidak mengikuti RTL | Arah navigasi halaman terbalik untuk pembaca RTL |
| P0 | Progress chapter bisa hilang saat pindah chapter | Debounce 900ms dibatalkan tanpa flush |
| P1 | Page indicator double-page hanya nomor page primer | Menampilkan `1/17` padahal dua halaman terlihat |
| P1 | Previous chapter memakai resume lastPageRead | Tidak mengikuti perilaku upstream previous=END, next=START |
| P1 | Neighbor memakai chapterNumber, bukan visible/sourceOrder list | Duplikat/filter dapat membuka chapter yang salah |
| P1 | Tidak ada transition page/peringatan gap scanlator | Perpindahan terasa “diam-diam” dan tidak konsisten |
| P2 | Wide spread tidak dideteksi di double mode | Satu gambar spread diperlakukan sebagai dua halaman biasa |
| P2 | Footer memakai `pageCount`, header memakai `pages.length` | Angka dapat berbeda saat metadata/page tidak sinkron |

## Bukti perilaku saat ini

### 1. Appended chapter tetap memakai state chapter lama

Skenario: vertical, chapter 1196 (17 halaman), scroll sampai bawah, lalu
scroll ke appended chapter 1197.

Hasil aktual:

```text
heading appended : Chapter 1197
header title     : Chapter 1196
page indicator   : 17 / 17
URL              : /manga/1114/chapter/3774  (chapter 1196)
```

Penyebab di kode:

- Appended chapter dibuat sebagai state `appended` terpisah
  (`ReaderPage.tsx:198-215`, `ReaderPage.tsx:291-309`).
- Halaman appended memakai nomor sintetis `extra.id * 1000 + index + 1`
  (`ReaderPage.tsx:1124`).
- `handlePageVisible` hanya melakukan `setCurrentPage`; `safeCurrentPage`
  di-clamp ke jumlah page chapter aktif (`ReaderPage.tsx:579`, `ReaderPage.tsx:247-250`).
- URL, `activeChapter`, judul, chapter list current item, dan progress tidak
  berubah. Progress tetap ditulis untuk chapter lama.

Bukti visual: `visual-audit/reader-audit-appended-state-390.png`.

Upstream tidak memakai “page appended” di luar chapter state. Saat mendekati
batas chapter, `ReaderControls.openChapter()` memanggil
`ReaderService.navigateToChapter()` dan memperbarui visible-chapter state serta
current chapter; infinite-scroll juga memperbarui chapter lewat
`useReaderInfiniteScrollUpdateChapter`. Lihat:

- <https://github.com/Suwayomi/Suwayomi-WebUI/blob/v20260929.01/src/features/reader/services/ReaderControls.ts>
- <https://github.com/Suwayomi/Suwayomi-WebUI/blob/v20260929.01/src/features/reader/infinite-scroll/useReaderInfiniteScrollUpdateChapter.ts>
- <https://github.com/Suwayomi/Suwayomi-WebUI/blob/v20260929.01/src/features/reader/hooks/useReaderSetChaptersState.ts>

### 2. Horizontal mode: ArrowRight pindah chapter

Skenario: horizontal, chapter 1196, halaman 9/17, tekan ArrowRight.

Hasil aktual:

```text
sebelum : /chapter/3774  Chapter 1196  9 / 17
sesudah : /chapter/3775  Chapter 1197  3 / 17
```

Penyebab:

- `isPaged` hanya `single`/`double`
  (`ReaderPage.tsx:246`).
- Keyboard hanya menangani page movement jika `isPaged`
  (`ReaderPage.tsx:612-631`).
- Horizontal lalu jatuh ke jalur `previousChapter`/`nextChapter`.

Upstream memakai pager per mode; horizontal pager tetap menggerakkan page index,
bukan chapter, dan hover/klik/scroll mengikuti `readingDirection`.

### 3. RTL tap dan swipe masih LTR

`selectPageFromTap` selalu:

```text
kiri  -> previous page
kanan -> next page
```

`endSwipe` selalu:

```text
swipe kiri  -> next page
swipe kanan -> previous page
```

Kode: `ReaderPage.tsx:674-735`. Tidak ada percabangan
`readerSettings.direction`.

Untuk RTL, arah ini harus dibalik. Upstream memakai
`READING_DIRECTION_TO_THEME_DIRECTION` dan `getOptionForDirection` untuk scroll,
tap zone, dan page indexing. Lihat:

- <https://github.com/Suwayomi/Suwayomi-WebUI/blob/v20260929.01/src/features/reader/services/ReaderControls.ts>
- <https://github.com/Suwayomi/Suwayomi-WebUI/blob/v20260929.01/src/features/reader/viewer/hooks/useReaderHandlePageSelection.ts>

### 4. Double-page indicator tidak menunjukkan spread

Skenario: double LTR, chapter unread, halaman awal.

Hasil aktual:

```text
header indicator : 1 / 17
page nav         : Page 1 of 17
figures          : page-1, page-2
```

Setelah Next:

```text
header indicator : 3 / 17
page nav         : Page 3 of 17
figures          : page-3, page-4
```

Double RTL juga menampilkan `1 / 17` dengan `page-2, page-1`.

Kode page indicator hanya memakai `safeCurrentPage / reader.pages.length`
(`ReaderPage.tsx:767`, `ReaderPage.tsx:963`). `safeCurrentPage` adalah page
primer, bukan hasil spread.

Upstream menyimpan page sebagai spread `{ primary, secondary, name }`; page
indicator memakai `getPage(...).name`, sehingga double page dapat menjadi
`1-2/17`, dan nama urutannya dibalik untuk RTL. Lihat:

- <https://github.com/Suwayomi/Suwayomi-WebUI/blob/v20260929.01/src/features/reader/overlay/progress-bar/ReaderProgressBar.utils.tsx>
- <https://github.com/Suwayomi/Suwayomi-WebUI/blob/v20260929.01/src/features/reader/overlay/components/ReaderPageNumber.tsx>
- <https://github.com/Suwayomi/Suwayomi-WebUI/blob/v20260929.01/src/features/reader/viewer/pager/ReaderPager.utils.tsx>

Double mode juga tidak menormalkan halaman resume ke batas spread. Jika
`lastPageRead` menghasilkan requested page genap, spread dapat dimulai dari
page 8+9 dan indikator tetap `8/17`; halaman ganjil/genap tidak selalu menjadi
awal spread.

### 5. Previous chapter resume berbeda dari upstream

Skenario: dari chapter 1197, klik previous chapter.

Hasil aktual:

```text
chapter 1196
indicator 9 / 17
```

Chapter 1196 memiliki `lastPageRead = 8`, jadi reader melanjutkan ke halaman 9,
bukan ke akhir chapter.

Upstream membedakan arah pada direct chapter jump:

```text
previous chapter -> ReaderResumeMode.END
next chapter     -> ReaderResumeMode.START
```

sementara infinite/visible transition dapat mempertahankan posisi. Lihat
`getReaderOpenChapterResumeMode` di:

- <https://github.com/Suwayomi/Suwayomi-WebUI/blob/v20260929.01/src/features/reader/Reader.utils.ts>

Perlu diputuskan apakah produk ini ingin mengikuti END/START upstream atau
mempertahankan resume `lastPageRead`; saat ini perilakunya tidak konsisten
dengan upstream dan tidak membedakan arah.

### 6. Neighbor memakai chapterNumber; dedup tidak selalu aman

`ReaderRepository.getNeighbors()` memakai `chapterNumber`
(`src/core/reader/readerRepository.ts`), sedangkan upstream memakai visible
chapter list dan `sourceOrder`.

`uniqueChapters` di ReaderPage memakai `Map` yang mengambil kemunculan pertama
per chapterNumber (`ReaderPage.tsx:373-380`). Jika chapter aktif adalah
duplikat yang bukan kemunculan pertama, `currentChapterIndex` menjadi -1 dan
reader kembali ke neighbor server, sehingga `skipDuplicates` tidak berlaku.
Filter chapter juga tidak dipertimbangkan saat menentukan previous/next.

Dampak:

- scanlator/duplikat chapter dapat membuka chapter yang tidak ada di daftar
  tampilan;
- tombol next/previous bisa melompati atau mengulang nomor;
- chapter list overlay dan neighbor dapat memakai urutan berbeda.

Upstream menyaring visible chapters lebih dulu, lalu memakai
`Chapters.getNextChapter` berdasarkan sourceOrder
(`useReaderSetChaptersState.ts`).

### 7. Progress berpotensi hilang saat pindah chapter

Progress disimpan dengan debounce 900ms (`ReaderPage.tsx:526-557`).
Cleanup hanya ada pada unmount komponen Reader (`ReaderPage.tsx:559-573`).
Perpindahan chapter tidak meng-unmount `ConnectedReader`; effect sebelumnya
hanya membersihkan timer.

Jika user pindah chapter dalam kurang dari 900ms setelah halaman terakhir,
timer lama dibatalkan dan tidak ada flush progress chapter lama. Upstream
memisahkan update progress dari lifecycle halaman dan mengubah state chapter
secara eksplisit saat transisi.

### 8. Gap/scanlator warning dan transition page belum ada

Upstream memeriksa missing chapter dan perubahan scanlator sebelum berpindah
chapter, serta memiliki transition page. Implementasi ini langsung `navigate`
atau append tanpa peringatan. Ini bukan sekadar visual: pembaca bisa berpindah
antar scanlator tanpa sadar.

## Perbandingan ringkas dengan upstream

| Aspek | Implementasi sekarang | Upstream v20260929.01 |
| --- | --- | --- |
| Identitas chapter di route | ID chapter (`/chapter/3775`) | `chapterSourceOrder` |
| Sumber urutan | `chapterNumber` + neighbor server | visible chapter list + `sourceOrder` |
| Direct previous/next | Resume `lastPageRead + 1` | Previous END, next START |
| Transisi continuous | Append DOM di luar state chapter | Update visible chapters/current chapter lewat `ReaderControls` |
| Page model | Flat page array | Spread `{primary, secondary, name}` |
| Indicator double | Nomor page primer | Nama spread (`1-2`, RTL reversed) |
| RTL tap/swipe | Selalu LTR | Direction-aware |
| Horizontal keyboard | Arrow jatuh ke chapter | Pager horizontal menangani page |
| Gap/scanlator | Tidak ada peringatan | Dicek sebelum transisi |
| Progress transition | Debounce, tidak flush saat chapter switch | State chapter diperbarui eksplisit |

## Rekomendasi urutan perbaikan

1. **P0 — jadikan chapter sebagai source of truth.** Saat masuk appended
   chapter, promosikan chapter itu ke `activeChapter`, ubah URL/title/chapter
   list/progress, atau hapus append dan gunakan transisi chapter eksplisit.
2. **P0 — perbaiki page intent per mode.** Horizontal harus menggerakkan page;
   RTL membalik tap/swipe; double memakai spread/range.
3. **P0 — flush progress sebelum chapter berubah** dan saat route chapter
   berubah, bukan hanya saat unmount.
4. **P1 — samakan neighbor dengan visible list**: filter, dedup relatif chapter
   aktif, sourceOrder, lalu previous/next.
5. **P1 — terapkan resume mode** previous=END dan next=START untuk direct
   chapter jump; pertahankan resume hanya untuk kembali ke chapter yang sama.
6. **P1 — tambahkan gap/scanlator warning** dan transition page.
7. **P2 — deteksi wide spread** untuk double mode.

## Kesimpulan

Masalah utamanya bukan sekadar angka halaman, tetapi **ada dua model state yang
berjalan bersamaan**: chapter aktif dan halaman appended. Selama appended pages
tidak dipromosikan menjadi chapter aktif, judul, URL, indikator, chapter list,
dan progress akan terus berbeda. Upstream menghindari masalah ini dengan
menjadikan visible chapter list dan chapter state sebagai sumber kebenaran,
kemudian menurunkan page/spread serta indicator dari state tersebut.
