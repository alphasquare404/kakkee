# Motion and microinteraction audit

Tanggal: 1 November 2026  
Status: **Goal 16 complete**  
Prinsip: motion harus menjelaskan perubahan state, bukan dekorasi.

## Token

```css
--dur-fast: 150ms;
--dur-base: 220ms;
```

Keduanya berada di rentang 150–250ms. Easing memakai `--ease-out`; tidak ada spring berlebihan atau entrance stagger.

## Inventaris motion

| Elemen | Motion | Tujuan |
| --- | --- | --- |
| Menu Library/Sort | fade + translateY(-4px), 150ms | menjelaskan panel muncul |
| Action menu | fade + translateY(-4px), 150ms (baru) | konsisten dengan menu lain |
| Filter drawer | slide dari kanan, 220ms | arah drawer |
| Library search mobile | fade/slide pendek | field muncul |
| Page enter | opacity/translate halus | transisi route |
| Selection bar | fade/translateY, 220ms (baru) | contextual toolbar muncul |
| Skeleton | shimmer 1.4s | loading, bukan dekorasi |
| Hover/pressed | color/background/border 150ms | konfirmasi pointer |
| Filter option/checkbox | background/border 150ms (baru) | pilihan terasa responsif |
| Download/extension card | border/background 150ms (baru) | hover/focus |

Tidak ada:

- stagger per kartu;
- bounce;
- animasi loop dekoratif;
- parallax;
- animasi yang menunda aksi.

## Reduced motion

Global:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

Ditambah override eksplisit untuk `.library-menu`, search, `.filter-drawer`, `.action-menu-panel`, dan `.library-selection-bar`.

## Temuan

- Menu baru sebelumnya muncul tanpa animasi, sementara menu lama beranimasi; sudah diselaraskan.
- Selection bar sebelumnya muncul mendadak; sekarang memiliki entrance pendek.
- Filter option dan kartu tidak memiliki transition state; sudah ditambahkan.
- Reader chrome tidak dianimasikan; tidak perlu karena sticky dan konten dominan.
- `page-enter` tetap halus dan tidak mengubah hierarchy.

## Sisa concerns

1. Reader auto-hide chrome belum diterapkan; motion bukan alasan utama.
2. Page-enter dapat terasa berulang pada navigasi cepat; perlu pengukuran preferensi user.
3. Skeleton shimmer 1.4s dapat terlalu aktif pada reduced-motion; global override mematikan durasi tetapi shimmer tetap satu frame.
4. Belum ada test visual untuk motion; diverifikasi lewat CSS dan browser.

## Validasi

- `typecheck`, `lint`, `build`.
- Reduced-motion rules diperiksa; tidak ada animasi baru yang lolos dari override.
