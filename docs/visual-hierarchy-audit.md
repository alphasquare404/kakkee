# Visual hierarchy audit

Tanggal: 1 November 2026  
Status: **Goal 15 complete**  
Prinsip: high information utility, low cognitive clutter. Identitas visual tidak diubah.

## Yang sudah kuat

- **Library:** judul dan search memimpin; manga artwork menjadi fokus; kontrol filter/sort ringkas; category tabs adalah konteks, bukan CTA.
- **Source:** hasil katalog mendominasi; filter masuk drawer; tombol Add to library adalah satu-satunya aksi kartu.
- **Manga Detail:** cover dan judul menjadi fokus; satu primary CTA; `In library` secondary; `More` tertiary; tag disclosure; tab Overview/Chapters.
- **Reader:** konten mendominasi; header hanya navigasi; aksi sekunder di More.
- **Settings:** connection sebagai status, direktori sebagai navigasi; tidak ada 8 tombol setara.
- **Empty states:** satu pesan dan satu next action.

## Temuan dan perbaikan

### 1. Stats Downloads terlalu berat

Empat kartu statistik memakai padding dan angka besar, bersaing dengan queue/downloaded chapters.

**Sesudah:** padding 0.55/0.65rem dan angka 1.05rem. Informasi tetap terbaca, tetapi tidak mengalahkan konten.

### 2. Deskripsi Manga terlalu renggang

`white-space: pre-line` dengan line-height 1.55 membuat metadata dari source memakan ruang hero.

**Sesudah:** line-height 1.45; hero lebih ringkas tanpa memotong konten.

### 3. Chip dan badge

- Genre Manga sudah disclosure.
- Tag source card tetap karena membantu membedakan source.
- Badge unread/download di poster tetap kecil dan tidak menutupi artwork.
- Extra badge di category flags tidak ditambahkan.

### 4. Border dan nested card

- Library filter drawer menggunakan section border, bukan card bertumpuk.
- Source/Extensions cards tetap satu border.
- Manga hero tidak dibungkus card tambahan.
- Settings directory cards memakai border tipis dan label sekunder.

### 5. Kontrol sekunder

- Destructive action memakai danger, bukan aksen.
- Filter count memakai badge kecil.
- View toggle hanya satu control, bukan dua tombol Grid/List.

## Yang tidak diubah

- Dark ink surfaces, accent biru-violet, radius, dan tipografi tetap.
- Artwork tetap besar dan dominan.
- Tidak ada entrance animation dekoratif baru.
- Tidak mengubah page title scale global.
- Tidak menyembunyikan informasi operasional penting hanya untuk minimalism.

## Sisa concerns

1. Manga description dari source masih bisa membawa metadata berbaris; parser konten tidak dilakukan karena berisiko mengubah teks user.
2. Updates feed row memiliki tiga action kecil dan tinggi baris besar; utility tinggi, tetapi kandidat kompresi.
3. Library bulk bar memiliki 8 tombol pada selection; di phone perlu perhatian.
4. Extensions 500 cards tetap panjang; visual scan dibantu section, tetapi virtualisasi bukan goal visual.
5. Settings directory cards semua setara; grouping sudah membantu, tetapi prioritas subpage belum dibedakan.
6. Reader header sticky masih memakan ruang di phone; lihat Goal 12.

## Validasi

- Screenshot 1280×900, 820×1180, 390×844.
- Stats Downloads dan hero Manga diukur/dibandingkan sebelum-sesudah.
- Typecheck/lint/build.
