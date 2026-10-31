# Interaction semantics audit

Tanggal: 1 November 2026  
Status: **Goal 1 complete**  
Cakupan: seluruh route utama, toolbar, filter, menu overflow, chapter row, feed row, extension catalog, settings.

## Prinsip

Satu konsep sebaiknya punya satu representasi yang jelas:

- navigasi untuk berpindah tempat;
- filter untuk mempersempit isi;
- state untuk menunjukkan kondisi saat ini;
- action untuk mengubah kondisi;
- konfigurasi untuk preferensi yang berlaku lintas layar.

Campuran state dan action dalam satu label adalah sumber utama kebingungan. Contoh: tombol berlabel `Unread` dapat berarti “state saat ini” atau “aksi untuk menandai belum dibaca”.

## Temuan dan perbaikan

### 1. Predikat Library diperlakukan seperti navigasi permanen

**Sebelum**

`All titles / Unread / Started / Downloaded / Bookmarked / Tracked` adalah baris permanen di bawah tab kategori. Hanya satu yang bisa aktif. Padahal predikat ini saling tumpang tindih, misalnya manga bisa sekaligus unread dan downloaded.

**Masalah**

- terlihat seperti navigation, bukan filter;
- single-select padahal konsepnya bisa dikombinasikan;
- baris permanen menambah kontrol sebelum konten;
- filter hanya diterapkan ke halaman yang sudah dimuat, tetapi tidak dijelaskan.

**Sesudah**

- seluruh predikat masuk group **Loaded titles** di menu Filter;
- multi-select dengan logika AND;
- label “Loaded titles” jujur menyatakan bahwa filter bekerja pada item yang sudah dimuat;
- tombol Filter menampilkan jumlah refinement aktif;
- `Reset` membersihkan predikat bersama filter lain.

**Root cause:** predicate lokal diperlakukan sebagai tab navigasi karena lebih mudah dirender sebagai baris tombol, bukan karena semantics-nya navigasi.

### 2. Dua representasi publication status

**Sebelum**

Menu Filter memiliki `Status` single-select dan `Status OR` multi-select. Keduanya bisa aktif bersamaan dan mengirim filter yang saling bertentangan.

**Sesudah**

- satu group **Publication status** dengan multi-select;
- pilihan dikirim sebagai `status: { in: [...] }`;
- `status` tunggal lama tetap dibaca untuk kompatibilitas preferensi tersimpan, lalu dipetakan ke pilihan yang sama;
- jumlah filter aktif menghitung satu group ini, bukan dua.

**Root cause:** dua iterasi fitur ditumpuk tanpa menghapus representasi lama.

### 3. Read state dan aksi Unread bertabrakan

**Sebelum**

- Chapter row menampilkan tombol `Read`/`Unread` yang sebenarnya aksi untuk membalik state.
- Updates menampilkan badge `Read`/`Unread` sekaligus tombol aksi `Unread`/`Read` dengan makna berlawanan.

**Sesudah**

- chapter row memakai satu toggle state: label `Read`, `aria-pressed`, style aktif, title menjelaskan aksi;
- Updates menghapus badge state terpisah dan memakai toggle `Read` yang sama;
- filter Read/Unread tetap menjadi filter, bukan state.

**Root cause:** state ditampilkan sebagai label tombol, lalu aksi ditambahkan sebagai tombol kedua.

### 4. Extension yang punya update muncul dua kali

**Sebelum**

Extension dengan `hasUpdate` muncul di section **Updates available** dan **Installed**. Keduanya menawarkan aksi yang sama.

**Sesudah**

- `updates` = installed + hasUpdate;
- `installed` = installed + belum ada update;
- section menjadi disjoint;
- toggle `Updates only` dihapus karena section Updates sudah menjadi representasi yang sama.

**Root cause:** daftar `installed` difilter hanya berdasarkan status terpasang, bukan status update.

### 5. Aksi kondisional yang tidak relevan

**Sebelum**

`Retry failed` di Downloads selalu tampil meskipun tidak ada kegagalan.

**Sesudah**

Tombol hanya muncul saat `failedCount > 0`. Ini sudah diterapkan pada goal density sebelumnya dan dipertahankan sebagai bagian semantics.

### 6. Duplikasi yang sengaja dipertahankan

- **Back dan breadcrumb** di Manga Detail: breadcrumb mengembalikan konteks section, Back mempertahankan history stack. Keduanya bukan aksi identik; dipertahankan sampai Goal 6 mengevaluasi provenance.
- **Category tabs** tetap navigasi karena kategori adalah koleksi tersimpan, bukan predicate sementara.
- **Popular/Latest** tetap mutually exclusive karena keduanya mode katalog, bukan filter yang bisa digabung.
- **History Read/In progress** tetap label state karena tidak ada aksi di baris yang sama.

## Sisa concerns

1. **Source preferences auto-save vs Apply filters.** Preferences tersimpan saat berubah, sedangkan filter baru berlaku setelah Apply. Ini perlu diberi label/hint eksplisit pada Goal 8.
2. **Focus awal menu Filter** saat ada source terpilih masih jatuh ke pilihan `All sources`, bukan item pertama. Perilaku keyboard tetap dapat dijangkau, tetapi perlu dirapikan pada Goal 11.
3. **`Read` sebagai label filter dan toggle** memiliki scope berbeda (filter daftar vs state chapter). Sudah dibedakan oleh konteks dan `aria-pressed`; pantau pada Goal 17.
4. **Loaded-title predicates** tidak bisa menjadi server filter karena schema stable tidak menyediakan filter unread/download/bookmark/tracked. Label scope harus dipertahankan agar tidak menyesatkan.
5. **Label `Prev`** pada aksi “mark chapters before this as read” masih ambigu; masuk Goal 3 dan Goal 17.
6. **Source filter di menu Filter berisi 107 radio** pada server nyata. Ini bukan semantics yang salah, tetapi daftar tanpa pencarian/scroll terbatas tidak dapat dipakai; masuk Goal 2 dan Goal 18.

## Validasi

- `LibraryPage.test.tsx`: kombinasi predicate, publication status OR, focus/Escape.
- `MangaDetailPage.test.tsx`: toggle `Read` memiliki `aria-pressed=false` pada chapter unread.
- Browser 1280×900: Filter menu menampilkan group **Publication status**, **Loaded titles**, dan **Source**; active count tampil.
- Manga chapter row: satu toggle `Read` dengan `aria-pressed=false` pada chapter unread.
- `npm.cmd run typecheck`
- `npm.cmd run lint`
