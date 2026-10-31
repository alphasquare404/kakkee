# Performance and resource audit

Tanggal: 1 November 2026  
Status: **Goal 13 complete**  
Metode: production build, browser resource entries, route chunks, lifecycle review.

## Baseline build

```text
main: dist/assets/index-*.js  644.66 kB (gzip 171.12 kB)
css:  94.85 kB (gzip 16.39 kB)
precache: 48 entries, ~989 kB
route chunks: ~0.4–41 kB each
```

Main bundle mengandung React, router, Apollo/GraphQL, dan shell. Warning 500 kB muncul, tetapi route sudah di-lazy-load. Memecah vendor tanpa mengurangi total initial dependency belum tentu memperbaiki waktu muat, jadi tidak dilakukan secara buta.

## Temuan utama: 500 extension icons dimuat sekaligus

`ExtensionsPage` merender 500 kartu, dan setiap `ExtensionCard` memanggil `useImageResource` saat mount. Artinya semua icon diminta meskipun tidak terlihat.

### Perbaikan

`ExtensionCard` sekarang:

- memiliki `IntersectionObserver` dengan `rootMargin: 400px`;
- baru memuat `iconUrl` ketika kartu mendekati viewport;
- memakai huruf inisial sebagai placeholder sampai icon tersedia.

### Pengukuran browser 1280×900

| Kondisi | Extension cards | Icon `<img>` | Fetch entries |
| --- | --- | --- | --- |
| Setelah load awal | 500 | 11 | 16 |
| Setelah scroll ke tengah | 500 | 34 | 39 |
| Sebelum perbaikan (teoretis dari kode) | 500 | 500 | ~500+ |

Perbaikan mengurangi pekerjaan awal secara drastis tanpa mengubah tampilan kartu atau menghilangkan icon.

## Resource lifecycle

- `useImageResource` membuat object URL per consumer dan merevoke saat path berubah/unmount/retry.
- `ResourceService` menyimpan controller dan handle, membatalkan request saat dispose.
- Reader page image memakai IntersectionObserver dan eager untuk halaman dekat current.
- Library cards memakai `loading=lazy`/`decoding=async`.
- `AmbientArt` dan thumbnail dapat meminta file yang sama; dedupe belum dilakukan.

## Sisa concerns

1. Main bundle 644 kB; route lazy sudah ada. Perlu analisis bundle visual (rollup-plugin-visualizer) sebelum memecah lebih jauh.
2. Duplicate thumbnail request antara ambient art dan kartu pertama; belum diukur/atau di-dedupe.
3. Extension list merender 500 DOM cards; lazy icons membantu network, tetapi DOM besar masih ada. Virtualisasi bisa dipertimbangkan untuk Goal 18.
4. Reader long chapter membuat satu `<figure>` per halaman; lazy image membantu, tetapi page list besar tetap di DOM.
5. Belum ada pengukuran long task/INP dengan data ekstrem; Goal 18.
6. Transfer size tidak tersedia pada resource timing headless (0); jumlah request yang diukur, bukan byte.
7. Service worker precache ~989 kB; seluruh route shell masuk cache instalasi. Ini tradeoff offline.

## Validasi

- `build` production.
- Browser 1280×900: initial extension icons 11/500, after scroll 34/500.
- Library: 38 cards dengan 38 image.
- `typecheck`, `lint`.
