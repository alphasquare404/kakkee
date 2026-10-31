# Accessibility audit

Tanggal: 1 November 2026  
Status: **Goal 11 complete**  
Pendekatan: semantic inspection, keyboard behavior, focus management, accessible-name probe, touch target measurement, reduced motion.

## Hasil probe

Probe browser pada 10 route utama (`library`, source, manga, reader, downloads, updates, extensions, settings, categories, search) dengan build produksi:

```text
unnamed interactive controls: 0
unlabeled visible inputs/selects: 0
duplicate ids: 0
```

Yang diperiksa: button, link, input, select yang terlihat; nama dari text, `aria-label`, `title`, atau label; id unik.

## Temuan dan perbaikan

### 1. Fokus awal Library Filter berhenti di pilihan source

**Sebelum:** membuka menu Filter memfokuskan `All sources` karena browser menyelesaikan focus adjustment setelah effect.

**Sesudah:** focus dipindahkan pada `requestAnimationFrame` ke item pertama (`Publication status → Ongoing`). Arrow key berjalan berurutan.

Test Library diperbarui: fokus awal Ongoing, ArrowDown ke Completed, Escape mengembalikan fokus ke trigger.

### 2. Touch target chapter actions di phone

**Sebelum:** tombol chapter 40×40px, di bawah target 44px.

**Sesudah:** pada ≤720px, chapter icon/toggle/select-check minimal 44×44px, menu item action minimal 44px. Row tetap tidak overflow.

### 3. Focus visible

Ditambahkan untuk:

- `ActionMenu` summary;
- category overflow trigger;
- filter option;
- filter checkbox;
- language/source select/search;
- drawer footer actions.

Semua memakai `outline: 2px solid var(--accent)` + offset.

### 4. Dialog dan drawer

`FilterDrawer`:

- `role=dialog`, `aria-modal=true`, `aria-labelledby`, deskripsi;
- focus masuk ke elemen pertama;
- Tab/Shift+Tab ditahan di dalam drawer;
- Escape menutup dan mengembalikan fokus ke trigger;
- close button dan Done juga mengembalikan fokus;
- body scroll dikunci.

### 5. Menu dan disclosure

- `LibraryMenu` memakai role menu/group/menuitemradio/menuitemcheckbox, aria-checked, roving focus, Escape, Tab close.
- `ActionMenu` memakai native `<details>/<summary>` dengan aria-label; Escape/outside click; panel item adalah button/link native.
- Category overflow dan chapter row memakai `ActionMenu`.

### 6. Semantik state

- Chapter/Updates `Read` memakai `aria-pressed`, bukan dua tombol state+action.
- Category tabs `aria-pressed`.
- Manga tabs `aria-current`.
- Selection checkbox/tombol memiliki `aria-pressed`.
- Source library button memiliki `aria-pressed` dan title removal.
- `aria-busy` pada library results, bulk bar.

### 7. Reduced motion

Global `prefers-reduced-motion` sudah mematikan animasi/transition, termasuk drawer/menu/search. Tidak ada stagger dekoratif.

### 8. Skip link dan landmark

- Skip link ke `#main-content` sudah ada.
- Main content memiliki `tabindex=-1` dan focus setelah navigasi.
- Navigasi desktop/tablet/mobile memakai `<nav aria-label>`.
- Page heading hierarchy menggunakan h1/h2; beberapa empty state menggunakan h2 agar tidak menduplikasi h1.

## Yang belum dapat dibuktikan

- Screen reader nyata (NVDA/VoiceOver) belum dijalankan; probe hanya memeriksa accessible name.
- Rasio kontras warna belum diukur dengan tool khusus; perlu axe/Lighthouse atau pengukuran token.
- `forced-colors` belum punya override khusus.
- Keyboard trap pada browser nyata (Safari/Firefox) belum diuji; jsdom sudah.
- iOS safe area dan touch behavior perlu perangkat.
- PWA standalone focus behavior belum diuji.

## Sisa concerns

1. Kontras token muted/faint perlu diukur pada background gelap.
2. Menu chapter row memakai karakter `⋯`; accessible name sudah eksplisit, tetapi glyph perlu dipastikan terbaca.
3. Touch target beberapa link text di feed masih lebih kecil dari 44px.
4. Fokus pada `ActionMenu` tidak otomatis masuk ke panel saat dibuka; Tab diperlukan. Ini acceptable untuk disclosure, tetapi dapat dipertimbangkan.
5. Heading hierarchy pada beberapa empty state masih h1/h2 campuran.

## Validasi

- Browser probe 10 route: tidak ada unnamed control, input tanpa label, atau duplicate id.
- Chapter actions di 390×844: CSS menetapkan 44×44; row tetap tidak overflow (diukur sebelum/ sesudah build pada audit terpisah).
- Library focus tests, ActionMenu tests, FilterDrawer tests lulus.
- Typecheck/lint/build.
