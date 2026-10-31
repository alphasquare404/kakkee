# State and feedback audit

Tanggal: 1 November 2026  
Status: **Goal 8 complete**  
Cakupan: loading, refreshing, saving, applying, pending, success, failure, retry, selected, disabled.

## Prinsip

Setiap aksi yang mengubah server harus menjawab tiga pertanyaan:

1. Apakah aksi sedang berjalan?
2. Apakah aksi berhasil?
3. Jika gagal, apa yang bisa dilakukan?

Feedback harus proporsional: subtle untuk aksi cepat, progress untuk operasi panjang, dan tidak memblokir seluruh layar bila hanya satu item yang sibuk.

## Temuan dan perbaikan

### 1. Source card library action tanpa pending state

**Sebelum:** klik `Add to library` langsung mengubah state setelah request; tombol tidak disabled, double-click bisa mengirim dua mutation. `busy` memakai `loadingMore` sehingga tidak merepresentasikan aksi item.

**Sesudah:**

- controller menyimpan `pendingLibraryId`;
- hanya item itu yang disabled;
- label berubah menjadi `Adding…` / `Removing…`;
- double-click kedua diabaikan selama pending;
- test memastikan mutation hanya dipanggil sekali.

### 2. Saving source preferences tidak terlihat di drawer

**Sebelum:** status `Saving…` berada di heading section yang disembunyikan CSS drawer.

**Sesudah:** status dirender sebagai baris `role=status` di body drawer, sehingga terlihat saat preferensi disimpan.

### 3. Bulk Library tanpa status

**Sebelum:** semua bulk button disabled saat `bulkBusy`, tetapi tidak ada teks yang menjelaskan kenapa.

**Sesudah:** selection toolbar memiliki `aria-busy` dan status `Working…`; tombol tetap disabled untuk mencegah double action.

### 4. Manga library toggle tanpa label pending

**Sebelum:** tombol disabled, label tetap `In library`/`Add to library`.

**Sesudah:** label menjadi `Saving…` selama request, lalu state final.

### 5. Feedback yang sudah baik

| Surface | Feedback |
| --- | --- |
| Library sync | `Updating n/m`, `Sync queued` |
| Library bulk | `Working…` + disabled |
| Library duplicates | `Scanning…` |
| Source filters | `Applying…` |
| Source preferences | `Saving…` + error alert |
| Extensions | `Checking…`, `Working…` per package |
| Downloads | `Resume/Pause`, `Saving…` device, global acting |
| Tracking | `Syncing…`, `Searching…`, busy record |
| Reader download | `Working…`, bookmark/download state |
| Search live sources | progress `done/total` |
| Connection | connection status + error |

## Matriks state

| Surface | Loading | Pending | Success | Failure |
| --- | --- | --- | --- | --- |
| Library list | skeleton | — | data | state + Retry |
| Library bulk | — | Working… + disabled | selection cleared/update | inline alert |
| Source list | skeleton | — | data | state + Retry |
| Source card add | — | Adding/Removing + disabled | state button flips | inline alert |
| Source filters | Applying… | — | drawer closes | action error |
| Source preferences | Loading… | Saving… | value persists | alert |
| Manga library | — | Saving… | button state | alert |
| Chapter read/download/bookmark | — | disabled item | icon/state | inline alert |
| Reader | page skeleton | Working… | state | download error |
| Downloads | skeleton | global acting | queue/state | error alert/Retry |
| Extensions | skeleton/Checking… | Working… | section change | action error |
| Categories | skeleton | disabled | count/state | alert |
| Settings | form-level | save text | persisted | error |
| Tracking | Loading… | Searching/Syncing | record | alert |

## Sisa concerns

1. Mutation sukses jarang memberikan toast; sebagian besar mengandalkan perubahan state. Ini konsisten dengan Kakkee yang tenang, tetapi aksi yang tidak mengubah tampilan (misalnya sync) perlu dipantau.
2. `Downloads` memakai satu `isActing` global; satu delete memblokir semua row. Untuk queue besar, ini bisa terasa berat. Goal 13/18.
3. Download chapter `queued` hanya ditandai ikon; tidak ada link langsung ke Downloads. Goal 12.
4. Retry setelah mutation gagal tidak selalu disediakan; Goal 9.
5. Optimistic update belum dipakai; keputusan conscious agar state server tetap benar.

## Validasi

- `sourceController.test.ts`: pending id, double-click guard, final state.
- Typecheck/lint.
- Browser 1280×900 dengan latency 1500ms: tombol source menampilkan `Adding…` dan disabled sebelum state final.
