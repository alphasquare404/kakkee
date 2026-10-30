# Suwayomi Frontend

Frontend React baru untuk Suwayomi Server. Proyek ini bukan fork Suwayomi-WebUI dan tidak mengubah Suwayomi Server.

Status saat ini: **Phase 1 core reading + reference-driven shell tersedia**. Functional baseline resmi dipin pada Suwayomi-WebUI **v20260929.01 (r3518)** dan server stable **v2.4.2366**. Top-level pages Library, Updates, Browse, Categories, History, Downloads, Settings, Manga Detail, dan Reader tersedia dengan data server nyata. Fitur state-changing/migration/tracking/extension/download-queue masih dicatat sebagai parity work, bukan diklaim selesai.

Laporan bukti akhir Phase 0: [docs/phase-0-validation.md](docs/phase-0-validation.md). Kontrak/data/state/category/UI Library: [docs/phase-1-library-contract.md](docs/phase-1-library-contract.md), [docs/phase-1-library-data.md](docs/phase-1-library-data.md), [docs/phase-1-library-state.md](docs/phase-1-library-state.md), [docs/phase-1-library-categories.md](docs/phase-1-library-categories.md), [docs/phase-1-library-ui.md](docs/phase-1-library-ui.md). Manga detail/reader: [docs/phase-1-manga-reader.md](docs/phase-1-manga-reader.md). Visual system: [docs/phase-1-visual-redesign.md](docs/phase-1-visual-redesign.md). Feature parity: [docs/suwayomi-webui-feature-parity.md](docs/suwayomi-webui-feature-parity.md).

## Kemampuan saat ini

- Membuka connection screen; memasukkan URL Suwayomi; connect.
- NONE langsung Connected setelah `aboutServer` + protected probe.
- UI_LOGIN menampilkan login, menolak kredensial salah, dan Connected setelah login/probe berhasil.
- BASIC_AUTH dan SIMPLE_LOGIN ditampilkan sebagai tidak didukung, bukan fallback ke NONE.
- Menampilkan nama/version/build/platform/architecture/server URL/auth mode/compatibility.
- Disconnect/ganti server dengan generation guard.
- Resource REST terautentikasi melalui service terpusat untuk thumbnail dan page reader.
- Library data layer terpusat dengan pagination/filter/sort stable.
- Library state controller untuk loading, pagination, reset criteria, dan stale request guard.
- Category navigation data/state: All synthetic, category selection, backend ordering, dan stale guard.
- Library screen: search, category tabs with counts, status filter, sort, random loaded-page shuffle, reset refinements, responsive grid, real thumbnails, unread/download badges, selection mode, shift-range and long-press selection, bulk category assignment/removal, bulk mark read/unread, bulk download/delete, empty/error/load-more states.
- Reference-driven cinematic shell with desktop sidebar and mobile tab bar.
- Updates: latest library chapters grouped by day, read state, and real covers.
- Browse: installed source catalog plus source manga browsing with Popular/Latest, search, pagination, and quick library add/remove.
- Categories: server categories with real manga counts, create, rename, reorder, and delete with confirmation.
- History: server-provided last-read chapters, newest per manga, Today/Yesterday grouping, and exact-page resume.
- Downloads: real queue/state/progress, pause/resume, cancel/delete, and downloaded-chapter list.
- Extensions: installed/available extension catalog, language filter, store list, install/uninstall/update, and update checking.
- Settings extras: hidden read history, device/PWA capability information, tracker status, server settings, backup, and sync controls.
- Sync settings: start sync, sync result, Yomi status, and data-selection toggles.
- Tracking settings: real tracker services, login links, token/expiry state, private/reading-date support, and logout.
- Backup: create backup with selectable data categories and automatic-backup summary.
- Settings: real server/application information, server update/download/system settings, dark/pure-black theme, and library grid density.
- Manga Detail: metadata, cover, chapter search/filter/scanlator, missing-chapter separators, chapter order, read/bookmark/download toggles, shift-range bulk read/bookmark/download/delete, in-library toggle, load more, and reader navigation.
- Reader: vertical, webtoon, single-page, double-page, and horizontal modes; authenticated lazy pages, progress write, saved-page resume, image filter presets, LTR/RTL direction, page scaling, keep-screen-on, fullscreen, share, tap zones, keyboard paging, auto-scroll, chapter navigation, and a chapter-list overlay.
- PWA installable dengan shell-only cache dan update prompt.

Baseline kontrak: **Suwayomi Server stable v2.4.2366**. Core reading journey tersedia, termasuk progress baca (`lastPageRead`/`isRead`) dan Continue reading dari Detail. Exact page resume, library continue-reading, source browsing, extension management, download queue, migration, tracking, sync, backup, dan full Settings parity masih parity work.

Route utama:

```text
/                                  connection / server management
/library                           library grid
/updates                           latest library chapters
/browse                            installed source catalog
/categories                        category overview
/history                           server-provided reading history
/downloads                         downloaded chapters
/settings                          server/application information
/manga/:mangaId                    manga detail + chapter list
/manga/:mangaId/chapter/:chapterId vertical reader
```

Semua route selain `/` memerlukan koneksi aktif; route terproteksi akan mengarah ke `/` jika terputus.

## Lingkup Step 1

- Bootstrap React + TypeScript + Vite.
- TypeScript strict.
- ESLint, Vitest, dan production build.
- Shell aplikasi minimal untuk membuktikan bootstrap berhasil.
- Satu lockfile npm.

Di luar scope Step 1: GraphQL, Apollo Client, `graphql-ws`, autentikasi, `aboutServer`, resolver server, resource/gambar, PWA, library, manga, chapter, reader, sources, extensions, downloads, dan tracking.

## Lingkup Step 3

- GraphQL Code Generator memakai snapshot lokal, tanpa server atau jaringan.
- Satu operasi `aboutServer` dengan selection set dari schema stable.
- Generated TypeScript document node di `src/core/graphql/generated/`.
- Script `codegen` dan `codegen:check` untuk CI.
- Tidak ada Apollo Client, HTTP client, WebSocket client, auth, atau UI koneksi.

## Lingkup Step 4

- Pemisahan `frontendBasePath` dan `serverBaseUrl`.
- Normalisasi server URL dan validasi input.
- Helper GraphQL HTTP, GraphQL WebSocket, dan resource server.
- Deteksi same-origin tanpa menyamakan origin dengan path.
- Resolver resource yang menolak cross-origin, protocol-relative, dan traversal.
- Tidak ada network request, Apollo, auth, router, atau resource fetch.

## Lingkup Step 5

- Operasi `Login` dan `RefreshToken` tervalidasi terhadap schema stable.
- Session model eksplisit untuk `NONE` dan `UI_LOGIN`.
- Access dan refresh token hanya di memori.
- JWT `exp` dibaca tanpa verifikasi signature, hanya untuk metadata.
- Generation guard untuk menolak respons async dari sesi lama.
- Auth service tidak bergantung pada React dan belum melakukan fetch.

## Lingkup Step 6

- Apollo Client untuk HTTP query/mutation dengan generated TypedDocumentNode.
- `graphql-ws` untuk subscription pada path yang sama.
- Bearer hanya untuk UI_LOGIN; NONE tanpa Authorization.
- AuthTransport login/refresh memakai generated documents.
- Refresh single-flight, retry maksimal satu kali, tanpa loop.
- Normalisasi error GraphQL HTTP 200, forbidden, invalid credentials, network, dan malformed response.
- WebSocket memakai token mentah di `connectionParams.Authorization`.
- Lifecycle dispose, cache clear, dan restart WebSocket.
- Runtime test terhadap server stable v2.4.2366 untuk NONE dan UI_LOGIN.

## Lingkup Step 7

- Satu resource service untuk resource REST non-GraphQL.
- URL selalu melalui resolver Step 4; subpath dipertahankan.
- NONE tanpa Authorization; UI_LOGIN memakai Bearer dari `AuthService`.
- Fetch native dengan `credentials: 'omit'` dan `redirect: 'manual'`.
- Redirect dan final URL di luar server ditolak.
- AbortSignal, generation guard, disposal, dan object URL lifecycle.
- Image helper tanpa React hook atau komponen UI.
- Runtime test image nyata pada stable v2.4.2366.

## Lingkup Step 8

- `ConnectionCoordinator` sebagai owner satu koneksi server.
- State eksplisit: disconnected, connecting, login-required, authenticating, connected, unsupported-auth, failed.
- Deteksi NONE/UI_LOGIN melalui aboutServer + protected probe.
- BASIC_AUTH challenge dikenali sebagai unsupported; tidak ada form Basic.
- Login UI_LOGIN dengan AuthTransport; password tidak disimpan.
- Version compatibility `v2.4.<revision>` dan baseline minimum.
- Server switching, disposal, generation guard, subscription.
- Integration test NONE, UI_LOGIN, dan BASIC_AUTH pada stable.

## Lingkup Step 9

- React Router dengan basename dari `frontendBasePath`.
- `ConnectionProvider` dan `useConnection` sebagai satu-satunya boundary UI ke coordinator.
- Layar koneksi, login-required, authenticating, connected, unsupported-auth, dan failed.
- Server URL hanya di React state; belum ada persistensi.
- Form native dengan label, keyboard submit, `aria-live`, dan pesan error manusiawi.
- CSS responsif tanpa UI framework.
- Unit test RTL/jsdom dan browser smoke headless Chrome.

## Lingkup Step 10

- `vite-plugin-pwa` dengan manifest standalone dan icon netral sementara.
- Root `/` dan frontend subpath `/app/`.
- Precaching hanya app shell/static assets; tanpa runtime caching API.
- Update prompt memakai `virtual:pwa-register/react`.
- iOS viewport/safe-area, Apple touch icon, dan meta web app.
- Offline shell hanya UI; tidak ada data server atau offline reading.
- CacheStorage diperiksa setelah connect/login.

## GraphQL baseline

- Versi: **Suwayomi Server stable v2.4.2366**.
- Tag: `v2.4.2366`.
- Commit: `40bc5da57820324ed0ae724cbbc020cc4673b594`.
- Schema: `graphql/schema/stable-v2.4.2366.graphql`.
- Metadata: `graphql/schema/stable-v2.4.2366.metadata.json`.
- SHA-256 schema: `c7b154383d684e69bc1947aad10fdfbc4f717008f61c755536a3857eecdff749`.
- Metode: introspection `POST /api/graphql` dari jar resmi v2.4.2366, dicetak ke SDL dengan `graphql-js` 16.11.0.

Snapshot ini adalah kontrak API untuk codegen dan integrasi berikutnya. Codegen membaca file lokal ini; tidak ada akses jaringan atau schema live. Belum ada operasi auth atau runtime Apollo pada Step 3.

## Runtime dan package manager

- Node.js: `v26.4.0` saat bootstrap.
- npm: `11.17.0`.
- Engine yang dinyatakan proyek: `^22.12.0 || ^24.0.0 || >=26.0.0`.
- Package manager: **npm** dengan `package-lock.json`. Tidak ada lockfile lain.

Di Windows PowerShell lingkungan ini, `npm.ps1` diblokir Execution Policy. Gunakan `npm.cmd` bila mengalami hal yang sama:

```powershell
npm.cmd install
npm.cmd run dev
```

## Menjalankan proyek

```bash
npm install
npm run dev
```

Build produksi dan pratinjau:

```bash
npm run build
npm run preview
```

Deployment subpath:

```bash
VITE_FRONTEND_BASE_PATH=/app/ npm run build
```

PWA memerlukan HTTPS pada deployment nyata (localhost dikecualikan oleh browser) dan hosting SPA fallback untuk `/` atau `/app/`.

## Scripts

| Script | Fungsi |
| --- | --- |
| `npm run dev` | Vite development server |
| `npm run build` | Typecheck project references lalu build produksi ke `dist/` |
| `npm run codegen` | Generate tipe dan document node dari schema + operasi lokal |
| `npm run codegen:check` | Dry-run CI check; gagal jika generated output tidak sinkron |
| `npm run preview` | Menyajikan hasil build produksi |
| `npm run lint` | ESLint untuk source dan konfigurasi |
| `npm run typecheck` | `tsc -b` dengan TypeScript strict |
| `npm run test` | Vitest satu kali |
| `npm run test:watch` | Vitest watch mode |

## Struktur saat ini

```text
.
├─ docs/
│  ├─ architecture.md
│  ├─ phase-0.md
│  ├─ phase-0-validation.md
│  ├─ phase-1-library-contract.md
│  ├─ phase-1-library-data.md
│  ├─ phase-1-library-state.md
│  ├─ phase-1-library-categories.md
│  ├─ phase-1-library-ui.md
│  ├─ phase-1-manga-reader.md
│  ├─ phase-1-visual-redesign.md
│  ├─ suwayomi-webui-feature-parity.md
│  └─ suwayomi-backend-notes.md
├─ graphql/
│  ├─ schema/
│  │  ├─ stable-v2.4.2366.graphql
│  │  └─ stable-v2.4.2366.metadata.json
│  └─ operations/
│     ├─ aboutServer.graphql
│     ├─ authProbe.graphql
│     ├─ downloadStatusChanged.graphql
│     ├─ fetchChapterPages.graphql
│     ├─ chapterFeed.graphql
│     ├─ sourceCatalog.graphql
│     ├─ categoryCatalog.graphql
│     ├─ chapterFeed.graphql
│     ├─ downloadQueue.graphql
│     ├─ enqueueDownload.graphql
│     ├─ startDownloader.graphql
│     ├─ stopDownloader.graphql
│     ├─ dequeueDownload.graphql
│     ├─ deleteDownloadedChapter.graphql
│     ├─ updateChapterProgress.graphql
│     ├─ updateMangaLibrary.graphql
│     ├─ libraryCategories.graphql
│     ├─ libraryMangas.graphql
│     ├─ login.graphql
│     ├─ mangaDetail.graphql
│     ├─ readerChapter.graphql
│     ├─ readerNeighbors.graphql
│     └─ refreshToken.graphql
├─ src/
│  ├─ app/
│  │  ├─ App.tsx
│  │  ├─ App.test.tsx
│  │  ├─ AppRouter.tsx
│  │  ├─ ConnectionProvider.tsx
│  │  ├─ ConnectionProvider.test.tsx
│  │  ├─ useConnection.ts
│  │  ├─ deploymentSettings.ts
│  │  ├─ PwaUpdatePrompt.tsx
│  │  ├─ PwaUpdatePrompt.test.tsx
│  │  ├─ pwaConfig.ts
│  │  ├─ pwaConfig.test.ts
│  │  ├─ pwaUpdate.ts
│  │  └─ app.css
│  ├─ core/
│  │  ├─ auth/
│  │  │  ├─ authError.ts
│  │  │  ├─ authService.ts
│  │  │  ├─ authService.test.ts
│  │  │  ├─ session.ts
│  │  │  ├─ token.ts
│  │  │  └─ token.test.ts
│  │  ├─ config/
│  │  │  ├─ deployment.ts
│  │  │  └─ deployment.test.ts
│  │  ├─ graphql/
│  │  │  ├─ authTransport.ts
│  │  │  ├─ authTransport.test.ts
│  │  │  ├─ createClient.ts
│  │  │  ├─ createClient.test.ts
│  │  │  ├─ createWsClient.ts
│  │  │  ├─ createWsClient.test.ts
│  │  │  ├─ errors.ts
│  │  │  ├─ errors.test.ts
│  │  │  ├─ runtime.integration.test.ts
│  │  │  ├─ aboutServer.generated.test.ts
│  │  │  └─ generated/
│  │  │     ├─ fragment-masking.ts
│  │  │     ├─ gql.ts
│  │  │     ├─ graphql.ts
│  │  │     └─ index.ts
│  │  ├─ library/
│  │  │  ├─ libraryCategoryController.ts
│  │  │  ├─ libraryCategoryController.test.ts
│  │  │  ├─ libraryController.ts
│  │  │  ├─ libraryController.test.ts
│  │  │  ├─ libraryRepository.ts
│  │  │  └─ libraryRepository.test.ts
│  │  ├─ manga/
│  │  │  ├─ mangaDetailController.ts
│  │  │  ├─ mangaDetailController.test.ts
│  │  │  ├─ mangaRepository.ts
│  │  │  └─ mangaRepository.test.ts
│  │  ├─ reader/
│  │  │  ├─ readerController.ts
│  │  │  ├─ readerController.test.ts
│  │  │  ├─ readerRepository.ts
│  │  │  └─ readerRepository.test.ts
│  │  ├─ resources/
│  │  │  ├─ resourceError.ts
│  │  │  ├─ resourceService.ts
│  │  │  ├─ resourceService.test.ts
│  │  │  └─ resourceService.integration.test.ts
│  │  └─ server/
│  │     ├─ connectionCoordinator.ts
│  │     ├─ connectionCoordinator.test.ts
│  │     ├─ connectionCoordinator.integration.test.ts
│  │     ├─ connectionError.ts
│  │     ├─ versionCompatibility.ts
│  │     ├─ versionCompatibility.test.ts
│  │     ├─ serverUrl.ts
│  │     └─ serverUrl.test.ts
│  ├─ features/connection/
│  │  ├─ ConnectionPage.tsx
│  │  └─ ConnectionPage.test.tsx
│  ├─ features/library/
│  │  ├─ LibraryPage.tsx
│  │  ├─ LibraryPage.test.tsx
│  │  ├─ LibraryMenu.tsx
│  │  ├─ MangaCard.tsx
│  │  └─ icons.tsx
│  ├─ features/manga/
│  │  ├─ MangaDetailPage.tsx
│  │  └─ MangaDetailPage.test.tsx
│  ├─ features/reader/
│  │  ├─ ReaderPage.tsx
│  │  └─ ReaderPage.test.tsx
│  ├─ shared/
│  │  ├─ useImageResource.ts
│  │  └─ useImageResource.test.tsx
│  ├─ test/fakeConnectionCoordinator.ts
│  ├─ main.tsx
│  └─ vite-env.d.ts
├─ public/
│  └─ icons/
│     ├─ apple-touch-icon.png
│     ├─ favicon-32.png
│     ├─ icon-192.png
│     ├─ icon-512.png
│     └─ icon-512-maskable.png
├─ .env.example
├─ codegen.ts
├─ index.html
├─ eslint.config.js
├─ tsconfig.json
├─ tsconfig.app.json
├─ tsconfig.node.json
├─ vite.config.ts
├─ vitest.config.ts
├─ package.json
└─ package-lock.json
```

Folder `src/core` berisi resolver deployment/server, auth session, transport GraphQL, resource service, dan ConnectionCoordinator. `src/features/connection` berisi layar koneksi; `src/app` berisi provider/router. Belum ada library/manga/reader UI atau resource component.

## Keputusan dependency

| Dependency | Versi | Alasan |
| --- | --- | --- |
| `react`, `react-dom` | `19.3.1` | Fondasi UI yang disepakati; versi React 19 stabil saat bootstrap. |
| `vite` | `8.3.5` | Build tool yang disepakati; mendukung Node 26. |
| `@vitejs/plugin-react` | `6.1.2` | Plugin React resmi untuk Vite 8; tidak memerlukan plugin SWC tambahan. |
| `typescript` | `6.0.3` | TypeScript strict; masih didukung `typescript-eslint` 8.x. |
| `@graphql-codegen/cli` | `7.4.6` | Menjalankan codegen dan `--check` dari CLI. |
| `@graphql-codegen/client-preset` | `6.2.3` | Menghasilkan tipe, typed document node, dan helper client modern. |
| `graphql` | `17.0.2` | Parser/schema engine; sekarang runtime dependency untuk generated document dan Apollo. |
| `@apollo/client` | `4.3.5` | HTTP link, normalized cache, error link, dan subscription link. |
| `graphql-ws` | `6.4.1` | Klien `graphql-transport-ws` untuk subscription. |
| `rxjs` | `7.8.2` | Peer dependency Apollo untuk observable/error link. |
| `react-router-dom` | `7.18.5` | Router minimal dengan basename deployment; satu route koneksi dan fallback. |
| `@testing-library/react` | `16.3.3` | Render dan query komponen React dalam test DOM. |
| `@testing-library/dom` | `10.4.1` | Peer dependency Testing Library. |
| `@testing-library/user-event` | `14.6.8` | Interaksi form yang menyerupai browser. |
| `jsdom` | `30.1.3` | Environment DOM untuk test UI; test non-UI tetap memakai Node. |
| `vite-plugin-pwa` | `2.0.0` | Manifest, generateSW precache shell, dan virtual update prompt. |
| `graphql-sock` | `1.0.1` | Peer dependency wajib `client-preset`. |
| `@graphql-typed-document-node/core` | `3.2.0` | Tipe `TypedDocumentNode` yang diimpor generated code. |
| `eslint` + `@eslint/js` | `10.13.0` / `10.0.1` | Lint dasar untuk TypeScript/React. |
| `typescript-eslint` | `8.72.1` | Parser dan aturan TypeScript untuk ESLint. |
| `eslint-plugin-react-hooks` | `7.1.1` | Aturan hooks React. |
| `eslint-plugin-react-refresh` | `0.5.7` | Menjaga batas export komponen untuk HMR. |
| `globals` | `17.13.0` | Global browser/Node untuk konfigurasi ESLint. |
| `vitest` | `5.0.5` | Test runner ringan yang memakai pipeline Vite. |
| `@types/react`, `@types/react-dom` | `19.3.0` | Tipe React. |

Dependency yang belum dipasang dengan sengaja: Zustand, UI library, form framework, validation framework, CSS framework, `@vite-pwa/assets-generator`, Playwright, dan library PWA lain.

## GraphQL Codegen

Konfigurasi ada di `codegen.ts`:

- Schema: `graphql/schema/stable-v2.4.2366.graphql` (lokal).
- Documents: `graphql/operations/**/*.graphql`.
- Output: `src/core/graphql/generated/`.
- Preset: `client`.

Scalar mapping:

| Scalar | TypeScript |
| --- | --- |
| `LongString` | `string` |
| `Cursor` | `string` |
| `Duration` | `string` |
| `Upload` | `File` |

`Upload` dipetakan ke `File` karena input browser yang natural adalah `File` dari `<input type="file">`; Apollo Upload Client juga menerima `File`/`Blob`. Mapping ini belum dipakai oleh operasi Step 3.

Operasi yang dibuat: `AboutServer`, `AuthProbe`, `DownloadStatusChanged`, `FetchChapterPages`, `LibraryCategories`, `LibraryMangas`, `Login`, `MangaDetail`, `ReaderChapter`, `ReaderNeighbors`, dan `RefreshToken`; field `revision` yang deprecated tidak dipakai. Operasi auth memakai generated `LoginMutation` dan `RefreshTokenMutation`; Library/detail/reader memakai generated documents masing-masing.

`codegen:check` memakai mode `--check` bawaan GraphQL Code Generator. Mode ini melakukan generate secara dry-run dan keluar dengan status non-zero jika ada file stale, tanpa menulis ulang output. Ini sudah diverifikasi dengan injeksi drift sementara.

## Deployment dan URL

Dua alamat dipisahkan secara eksplisit:

| Konsep | Canonical | Dipakai untuk |
| --- | --- | --- |
| `frontendBasePath` | `/` atau `/app/` (leading dan trailing slash) | router, asset, manifest, service worker, start URL |
| `serverBaseUrl` | `https://example.com` atau `https://example.com/suwayomi` (tanpa trailing slash) | GraphQL HTTP, GraphQL WebSocket, resource |

`serverBaseUrl` adalah **input runtime**, bukan nilai build-time yang dipaksakan. Tidak ada alamat server pribadi yang di-commit. `frontendBasePath` adalah konfigurasi deployment frontend dan tidak diturunkan dari route halaman atau dari path server. Untuk build subpath, set `VITE_FRONTEND_BASE_PATH` (contoh `/app/`); lihat `.env.example`. Nilai invalid jatuh ke `/`.

Contoh:

| Frontend | Server | GraphQL HTTP | GraphQL WS |
| --- | --- | --- | --- |
| `https://example.com/` | `https://example.com` | `https://example.com/api/graphql` | `wss://example.com/api/graphql` |
| `https://example.com/app/` | `https://example.com` | `https://example.com/api/graphql` | `wss://example.com/api/graphql` |
| `https://example.com/` | `https://example.com/suwayomi` | `https://example.com/suwayomi/api/graphql` | `wss://example.com/suwayomi/api/graphql` |
| `https://reader.example.com/app/` | `https://manga.example.com/suwayomi` | `https://manga.example.com/suwayomi/api/graphql` | `wss://manga.example.com/suwayomi/api/graphql` |

Aturan keamanan resource:

- Relative path seperti `/api/v1/test` dan `api/v1/test` selalu digabung dengan prefix server.
- Absolute URL hanya diterima jika origin dan prefix sesuai `serverBaseUrl`; cross-origin ditolak.
- Protocol-relative `//host/...`, traversal `../`, encoded traversal, backslash, dan URL dengan credentials ditolak.
- Absolute URL di luar prefix server, termasuk `https://example.com/suwayomi2/...`, ditolak.
- Resolver ini belum mengirim request atau token; aturan tersebut mencegah token dikirim ke origin arbitrer pada step berikutnya.

Same-origin berarti **origin** sama, bukan path sama. Frontend `https://example.com/app/` dan server `https://example.com/suwayomi` adalah same-origin meskipun path-nya berbeda.

Semua konsumen nanti harus memakai `createDeploymentConfig`; tidak boleh membentuk URL server sendiri di komponen atau service.

## Auth dan session

`AuthService` adalah satu-satunya pemilik state sesi. Model sesi membedakan:

- `disconnected` — belum ada konteks server.
- `none` — server mode NONE; tidak memiliki token. Status ini belum berarti `connected` sampai connection layer membuktikannya nanti.
- `unauthenticated` — UI_LOGIN memerlukan login, kredensial salah, sesi expired, atau refresh gagal.
- `authenticated` — UI_LOGIN dengan access token, refresh token, dan metadata `exp`.
- `refreshing` — refresh sedang berjalan; access token lama tetap tersedia sampai hasil refresh diterima.
- `failed` — kegagalan non-kredensial yang tidak secara otomatis berarti sesi valid.

Kebijakan Step 5:

- Access dan refresh token hanya disimpan di memori. Tidak ada `localStorage`, `sessionStorage`, cookie, atau persistence lain.
- Logout lokal hanya membersihkan session; tidak mengklaim server mencabut token. Stable tidak memiliki mutation logout auth.
- Refresh hanya mengganti access token. Refresh token lama dipertahankan dan tidak dirotasi.
- JWT payload boleh dibaca untuk `exp`, tetapi tidak diverifikasi signature-nya. Token malformed dianggap invalid.
- `isSessionAccessTokenExpired` dan `isSessionAccessTokenNearExpiry` tersedia; tidak ada refresh otomatis pada Step 5.
- Setiap perubahan sesi atau mulai login/refresh menaikkan generation. Hasil async dengan generation lama ditolak, termasuk setelah logout atau ganti server.
- `AuthError` tidak memuat token atau stack trace mentah server.

Fetch login/refresh diimplementasikan pada Step 6 melalui `AuthTransport` dan `createAuthTransport`. Step 5 tetap memiliki kontrak `AuthTransport` berbasis generated types; transport HTTP-nya tidak berada di layer UI.

`NONE` bukan fallback ketika mode auth tidak diketahui. Mode harus ditentukan oleh connection layer; `UI_LOGIN` yang belum terautentikasi tetap `unauthenticated`.

## GraphQL transport

Runtime transport ada di `src/core/graphql/`:

- `createClient.ts` — Apollo Client, HTTP link, auth link, error link, subscription split, refresh coordination, disposal.
- `createWsClient.ts` — `graphql-ws` client dengan token dibaca saat koneksi.
- `authTransport.ts` — implementasi `AuthTransport` untuk `LoginDocument`/`RefreshTokenDocument`.
- `errors.ts` — normalisasi error GraphQL/HTTP/network.

Aturan HTTP:

- URL dari `graphqlHttpUrl` Step 4; POST dilakukan oleh `HttpLink`.
- `Authorization: Bearer <accessToken>` hanya ditambahkan jika `AuthService` memiliki access token (UI_LOGIN).
- NONE tidak menghasilkan header Authorization.
- Login dan refresh tidak memakai bearer; refresh token dikirim sebagai variable mutation.
- `credentials: 'omit'`; token tidak pernah masuk URL.

Single-flight refresh:

- Hanya satu refresh per sesi/generation.
- Request lain menunggu promise refresh yang sama.
- Retry maksimal satu kali; context `authRefreshRetried` mencegah loop.
- Forbidden dan NONE tidak memicu refresh.
- Refresh failure mengubah `AuthService`; hasil stale setelah logout/reset ditolak.
- Setelah refresh sukses, access token diganti dan WebSocket di-restart.
- Tidak ada proactive refresh berdasarkan `exp` pada Step 6; refresh dipicu unauthorized.

WebSocket:

- URL dari `graphqlWsUrl`, protokol `graphql-transport-ws`.
- Lazy connection; retry maksimal 5 kali, exponential backoff 1s→15s.
- NONE: `connectionParams` kosong.
- UI_LOGIN: `connectionParams.Authorization` berisi token mentah tanpa `Bearer `.
- Token dibaca saat koneksi, bukan di-capture saat client dibuat.
- `restartWebSocket()` men-dispose client lama, membuat client baru, dan mengganti Apollo link. Subscription yang sedang aktif perlu di-resubscribe oleh consumer/coordinator.
- `dispose()` menutup WebSocket, menghentikan Apollo, dan membersihkan cache.

Runtime integration test memakai env `VITE_RUNTIME_NONE_URL`, `VITE_RUNTIME_UI_URL`, dan `VITE_RUNTIME_UI_PASSWORD`; tanpa env, test tersebut di-skip. Credential test tidak disimpan di Git.

## Resource service

Resource service terpusat ada di `src/core/resources/`:

- `resourceService.ts` — fetch resource, auth header, Blob/object URL, abort, stale guard, disposal.
- `resourceError.ts` — `ResourceError` dengan kategori terstruktur.

API:

```ts
const service = createResourceService({ config, authService });

const image = await service.loadImageResource('/api/v1/manga/1114/thumbnail', { signal });
// image.blob, image.objectUrl, image.contentType
image.dispose();

service.dispose();
```

React consumers memakai `src/shared/useImageResource.ts`; hook ini memuat resource, membuat/mencabut object URL, membatalkan request saat path berubah/unmount, dan menyediakan retry. Dipakai untuk thumbnail Library, cover detail, dan page reader. Tidak ada `<img src={thumbnailUrl}>`, fetch manual, atau Authorization di UI.

Aturan URL dan auth:

- Path selalu melalui `config.resolveResource()` dari resolver Step 4. UI tidak membentuk URL server.
- Subpath server dipertahankan; resource absolut hanya diterima bila origin dan prefix cocok.
- Cross-origin, protocol-relative, traversal, dan path di luar prefix ditolak sebelum fetch.
- NONE: tanpa Authorization.
- UI_LOGIN authenticated/refreshing: `Authorization: Bearer <accessToken>`.
- UI_LOGIN unauthenticated/failed/disconnected: `ResourceError('unauthorized')` tanpa fetch diam-diam.
- Token tidak pernah masuk URL.

Redirect dan security:

- Fetch memakai `redirect: 'manual'` dan `credentials: 'omit'`.
- Response 3xx, opaque redirect, atau `response.redirected` ditolak sebagai `unsafe-resource`.
- Final `response.url` divalidasi terhadap origin dan prefix server.
- Karena redirect tidak diikuti, token tidak dikirim ke origin redirect. Ini adalah proteksi yang dapat dijamin oleh implementasi; browser tetap dapat menolak request karena CORS.
- ResourceService tidak mengklaim melindungi dari service worker atau ekstensi browser yang memodifikasi request.

Response dan error:

- Non-2xx ditolak.
- 401 → `unauthorized`, 403 → `forbidden`, 404 → `not-found`, status lain → `http`.
- Network failure → `network`; abort → `aborted`; bukan error user-facing biasa.
- `loadImageResource` menolak `text/*` yang jelas bukan image; content-type kosong dan `application/octet-stream` tetap diterima agar tidak terlalu strict. `loadResource` tidak membatasi MIME image.

Lifecycle:

- Setiap hasil memiliki `objectUrl` dan `dispose()`; `dispose()` memanggil `URL.revokeObjectURL` secara idempotent.
- `ResourceService.dispose()` membatalkan request aktif dan mencabut semua object URL yang masih dilacak.
- `AbortSignal` caller didukung; abort sebelum fetch tidak melakukan request.
- Generation `AuthService` diambil saat request dimulai. Bila logout/reset/ganti mode terjadi sebelum blob selesai, hasil menjadi `stale-session` dan object URL tidak dibuat.
- Tidak ada cache persisten, cache resource, atau deduplikasi request pada Step 7.

Runtime test memakai endpoint nyata `/api/v1/track/1/thumbnail` pada stable v2.4.2366: NONE 200 `image/png`; UI_LOGIN tanpa token 401 dan dengan Bearer 200. Runtime fitur juga memuat `/api/v1/manga/1114/thumbnail` dan `/api/v1/manga/1114/chapter/1185/page/0` (NONE 200, image/webp dan image/jpeg).

## Connection coordinator

`src/core/server/connectionCoordinator.ts` adalah application-level owner satu koneksi:

```ts
const coordinator = createConnectionCoordinator({
  frontendUrl: window.location.href,
  frontendBasePath: '/',
});

await coordinator.connect(serverUrl);
await coordinator.login(username, password); // hanya saat login-required
await coordinator.disconnect();
await coordinator.dispose();
```

State:

- `disconnected`
- `connecting`
- `login-required`
- `authenticating`
- `connected`
- `unsupported-auth`
- `failed`

State `connected` memiliki context read-only:

```ts
{
  config,          // DeploymentConfig canonical
  serverInfo,      // aboutServer result
  authMode,        // 'NONE' atau 'UI_LOGIN'
  compatibility,   // compatible / preview / unknown
  graphQL,         // ApolloClient
  resources        // ResourceService
}
```

AuthService dan token tidak diekspos ke UI. UI hanya berinteraksi dengan coordinator dan context aplikasi.

Alur connect:

1. Normalisasi URL melalui resolver Step 4.
2. Naikkan generation baru dan dispose koneksi lama.
3. Buat AuthService sementara dengan NONE untuk probe anonim.
4. Buat GraphQL transport dan ResourceService.
5. Jalankan `AboutServerDocument`.
6. Periksa compatibility.
7. Jalankan `AuthProbeDocument`.

Deteksi:

- Probe sukses tanpa token → NONE → connected.
- Probe unauthorized → `login-required`, `authMode: 'UNKNOWN'`; UI_LOGIN belum diklaim pasti.
- Login UI_LOGIN sukses lalu probe sukses → connected UI_LOGIN.
- HTTP 401 dengan `WWW-Authenticate: Basic` → `unsupported-auth`, mode BASIC_AUTH.
- SIMPLE_LOGIN tidak dapat dibedakan dengan aman dari login-required generik; tidak ada klaim dukungan.
- Generic network error tidak dipakai untuk menebak mode auth.

Login:

- Hanya valid pada `login-required`.
- Memakai `AuthTransport.login`; password tidak disimpan dalam state.
- Kredensial salah → tetap `login-required` dengan error `invalid-credentials`; server info/config dipertahankan.
- Setelah login sukses, protected probe diulang. Connected hanya setelah probe berhasil.
- Login untuk server lama tidak boleh mengubah server baru; generation guard menolak hasil stale.

Compatibility:

- Format versi Suwayomi `v2.4.<revision>` diparse tanpa semver library.
- Di bawah `v2.4.2366` → `failed` dengan `incompatible-server`.
- Baseline atau Stable yang lebih baru → `compatible`.
- Build non-Stable yang lebih baru → `preview` dengan warning; hanya operasi baseline yang berhasil yang dipakai.
- Versi tidak dapat diparse → `unknown` dengan warning, tanpa crash; tidak ada klaim capability tambahan.

Lifecycle:

- `disconnect()`/`connect()` server baru men-dispose GraphQL transport, WebSocket, Apollo cache, ResourceService, dan AuthService.
- `dispose()` menghentikan coordinator dan menghapus listener.
- Request/response dari generation lama diabaikan.
- Coordinator tidak memakai global singleton.

Error model `ConnectionError`:

- `invalid-server-url`
- `unreachable`
- `incompatible-server`
- `authentication-required`
- `invalid-credentials`
- `unsupported-auth`
- `server-error`
- `stale`/`cancelled` untuk guard internal
- `invalid-state`
- `disposed`

Error tidak memuat password, token, Java stack trace, atau raw exception.

Runtime integration test memakai env `VITE_RUNTIME_NONE_URL`, `VITE_RUNTIME_UI_URL`, `VITE_RUNTIME_BASIC_URL`, dan `VITE_RUNTIME_UI_PASSWORD`; test di-skip tanpa env.

## Connection UI

React boundary:

- `ConnectionProvider` membuat satu `ConnectionCoordinator` untuk deployment dan subscribe ke state.
- `useConnection()` mengekspos `state`, `connect`, `login`, dan `disconnect`.
- UI tidak menerima AuthService, Apollo Client, WebSocket client, ResourceService, atau token.
- Coordinator tidak dibuat ulang pada rerender; disposal dilakukan setelah provider benar-benar unmount. Cleanup ditunda satu tick untuk aman terhadap mount/cleanup/mount StrictMode.
- Tidak ada singleton global.

Routing:

- `react-router-dom` `BrowserRouter` dengan `basename` dari `frontendBasePath`.
- `VITE_FRONTEND_BASE_PATH` menentukan deployment base; default `/` untuk build root. Nilai tidak valid jatuh ke `/` dan tidak ditebak dari route.
- Hanya route `/` (connection screen) dan fallback ke `/`. Tidak ada route manga/library fiktif.
- Deep link dan subpath diuji di jsdom.

State UI:

| State | Tampilan |
|---|---|
| `disconnected` | Form server URL + Connect. |
| `connecting` | Status koneksi, tombol batal, tanpa form submit ganda. |
| `login-required` | Server yang dituju, username, password, Login, Ganti server; error invalid credentials. |
| `authenticating` | Status verifikasi; form login tidak tersedia. |
| `connected` | Connected, server URL, name, version, build type, OS, architecture, auth mode, compatibility/warning, Disconnect. |
| `unsupported-auth` | Pesan jujur; BASIC_AUTH dijelaskan tanpa form Basic. |
| `failed` | Pesan manusiawi berdasarkan `ConnectionError`; detail mentah tidak ditampilkan. |

Perilaku form:

- Server URL, username, dan password adalah React state; tidak ada localStorage/sessionStorage.
- Password dikosongkan segera setelah submit dan setelah kegagalan; username dipertahankan.
- Network error tidak pernah dipetakan menjadi "password salah".
- Compatibility unknown/preview tampil sebagai warning, bukan failed.
- Setelah Connected, fokus dipindahkan ke heading server; error memakai `role="alert"`; status memakai `aria-live`.
- CSS responsif tanpa design system; target tombol minimal ~2.85rem.

Test UI:

- RTL + `user-event` + jsdom untuk state/form/error.
- Test provider memastikan factory dipanggil sekali, subscription dibersihkan, dan coordinator di-dispose saat unmount.
- Browser smoke headless Chrome untuk NONE, UI_LOGIN, BASIC_AUTH, mobile viewport, dan cross-origin CORS.

## PWA shell

Konfigurasi ada di `vite.config.ts`, `src/app/pwaConfig.ts`, dan `src/app/pwaUpdate.ts`.

Manifest:

- `name`: `Suwayomi Frontend (Unofficial)`
- `short_name`: `Suwayomi UI`
- `start_url` dan `scope`: mengikuti `frontendBasePath`
- `id`: `frontendBasePath`
- `display`: `standalone`
- `theme_color`: `#0b1020`
- `background_color`: `#080b12`
- `lang`: `id`
- icon 192/512 any dan 512 maskable

Nama/icon bersifat sementara dan menyatakan frontend tidak resmi. Icon netral dibuat khusus untuk proyek; tidak memakai artwork Suwayomi.

Base/subpath:

- `VITE_FRONTEND_BASE_PATH=/` menghasilkan `base=/`, `start_url=/`, `scope=/`, icon `/icons/...`.
- `VITE_FRONTEND_BASE_PATH=/app/` menghasilkan `base=/app/`, `start_url=/app/`, `scope=/app/`, icon `/app/icons/...`, SW `/app/sw.js`.
- Router dan manifest memakai base yang sama; serverBaseUrl tidak dipakai sebagai frontend base.

Service worker/cache:

- Strategi `generateSW` dengan precache hanya `index.html`, JS/CSS shell, icon, dan manifest.
- `runtimeCaching: []`; tidak ada route runtime API/image.
- `navigateFallback` `/index.html` atau `/app/index.html`.
- `navigateFallbackDenylist` menolak `/api` (dan `/app/api` jika server berada di bawah base frontend) sebagai fallback navigasi.
- `skipWaiting: false`, `clientsClaim: false`.
- Tidak ada precache GraphQL, tracker/manga/chapter resource, auth response, token, Apollo cache, atau data server.

Update lifecycle:

- `registerType: 'prompt'`.
- `useRegisterSW` mendeteksi `needRefresh`/`offlineReady`.
- `PwaUpdatePrompt` menawarkan “Update dan reload” atau “Tutup”.
- SW generated menangani pesan `SKIP_WAITING`; reload memakai shell baru.
- Tidak ada background sync, push notification, atau service worker custom framework.

iOS/Android:

- `viewport-fit=cover`, Apple mobile web app capable/title/status bar, Apple touch icon.
- CSS memakai `env(safe-area-inset-top/bottom/left/right)` pada shell dan prompt.
- Manifest/display standalone/icon memenuhi installability Chrome pada build yang diuji.
- Belum diuji pada perangkat iOS/Android nyata.

Offline:

- App shell dapat dibuka dari precache.
- Data server tetap network-only; bila offline, connection UI menunjukkan “Server tidak dapat dijangkau”.
- Tidak ada data lama yang ditampilkan sebagai live dan tidak ada offline manga/chapter.

## Validasi

Validasi akhir Phase 0 dan matriks lengkap ada di [phase-0-validation.md](docs/phase-0-validation.md).

Dijalankan pada 29 Oktober 2026:

```text
npm run codegen        lulus
npm run codegen:check  lulus
npm run lint           lulus
npm run typecheck      lulus
npm run test           lulus (243 test; 7 runtime integration memerlukan env)
npm run build          lulus
```

Validasi visual/parity terbaru (30 Oktober 2026):

```text
npm run codegen:check  lulus
npm run lint           lulus
npm run typecheck      lulus
npm run test           lulus (337 test; 7 runtime integration memerlukan env)
npm run build          lulus
```

Validasi schema Step 2:

- Schema dapat diparse dengan `graphql-js` 16.11.0.
- SHA-256 schema cocok dengan metadata.
- Query `aboutServer`, `AuthMode`, `login`, `refreshToken`, `Subscription`, dan custom scalar diperiksa terhadap snapshot.
- Tipe preview/master yang tidak ada di stable dipastikan tidak ikut masuk.
- WebSocket `graphql-transport-ws` diuji pada server v2.4.2366; `connection_ack` dan pesan `next` diterima.

Validasi codegen Step 3:

- Operasi valid menghasilkan `AboutServerDocument`.
- Test unit memastikan document node yang dihasilkan adalah query `AboutServer`.
- Field fiktif sementara menyebabkan codegen gagal dengan `Cannot query field ...`; fixture dihapus setelah test.
- Drift sementara pada generated output terdeteksi oleh `codegen:check` dengan status non-zero; output dipulihkan dengan `npm run codegen`.
- Folder generated di-ignore dari ESLint, tetapi tetap diperiksa TypeScript strict.

Validasi resolver Step 4:

- Normalisasi server root, subpath, trailing slash, port, localhost, IPv4, dan IPv6.
- Penolakan input invalid, credentials, query, hash, scheme non-HTTP, traversal, dan encoded traversal.
- GraphQL HTTP/WS dan WSS untuk root/subpath/port.
- Resource relative dan absolute same-server; penolakan cross-origin, protocol-relative, di luar prefix, dan traversal.
- Same-origin dibedakan dari same-path.
- Kombinasi frontend `/`, `/app/`, server root, server `/suwayomi`, dan origin berbeda.

Validasi auth Step 5:

- NONE session tanpa token, clear/reset.
- UI_LOGIN authenticated dengan access/refresh/expiry.
- Refresh hanya mengganti access token dan mempertahankan refresh token.
- JWT `exp` valid, expired, future, tanpa `exp`, dan malformed.
- Respons lama ditolak setelah logout, reset ke NONE, atau login baru.
- Invalid credentials, refresh failure, network failure, dan session expired dipetakan ke state berbeda.
- Error string tidak memuat token.

Validasi transport Step 6:

- HTTP POST memakai URL resolver; NONE tanpa Authorization; UI_LOGIN memakai Bearer.
- Login/refresh tidak memakai bearer dan memakai generated documents.
- GraphQL HTTP 200 unauthorized dinormalisasi.
- Concurrent unauthorized menghasilkan satu refresh; retry maksimal satu kali.
- Forbidden dan NONE tidak memicu refresh; refresh gagal tidak loop.
- Stale refresh setelah reset tidak menghidupkan sesi.
- WebSocket memakai URL resolver, protokol benar, token mentah untuk UI_LOGIN, tanpa token untuk NONE.
- Runtime stable v2.4.2366: NONE `aboutServer` + subscription; UI_LOGIN login, protected query, refresh, dan subscription berhasil.

Validasi resource Step 7:

- Subpath server dipertahankan; cross-origin, protocol-relative, traversal, outside-prefix, dan final URL luar server ditolak.
- NONE tidak mengirim Authorization; UI_LOGIN mengirim Bearer dan membaca token terbaru.
- UI_LOGIN unauthenticated/disconnected tidak melakukan fetch diam-diam.
- Redirect 3xx/opaque ditolak; final URL divalidasi.
- 401/403/404/500, network, dan abort dinormalisasi terpisah.
- AbortSignal membatalkan fetch; object URL selalu tersedia dengan `dispose()` dan direvoke.
- Logout, reset, dan switch ke NONE membuat respons lama menjadi `stale-session` tanpa object URL.
- Service disposal membatalkan request aktif dan mencabut semua handle.
- Runtime stable v2.4.2366: tracker thumbnail NONE 200 `image/png`; UI_LOGIN tanpa token 401, invalid Bearer 401, valid Bearer 200.

Validasi coordinator Step 8:

- NONE: aboutServer sukses, protected probe sukses, AuthService NONE, state connected, tanpa Authorization.
- UI_LOGIN: aboutServer sukses, probe unauthorized, login-required, kredensial salah tetap login-required, login benar, probe ulang, connected UI_LOGIN.
- Invalid URL, unreachable network, malformed aboutServer, dan versi di bawah baseline menghasilkan state failed yang sesuai.
- BASIC_AUTH 401 + `WWW-Authenticate: Basic` menghasilkan unsupported-auth tanpa form Basic.
- Connect A lalu B: hasil A yang terlambat diabaikan.
- Disconnect saat connect: hasil lama diabaikan.
- Login server A yang terlambat tidak mengubah server B.
- Disconnect men-dispose GraphQL, WebSocket, ResourceService, dan AuthService.
- Subscribe/unsubscribe mempublikasikan transisi berurutan; listener error tidak memutus coordinator.
- State/error tidak memuat token atau password.

Validasi UI Step 9:

- Form disconnected menampilkan label server dan memanggil `connect` dengan URL yang diketik.
- State connecting tidak menampilkan form submit ganda.
- Login-required menampilkan username/password; submit memanggil `login`.
- Kredensial salah tetap di login-required, username dipertahankan, password dikosongkan, dan pesan error tampil.
- Authenticating menyembunyikan form login.
- Connected menampilkan URL, name, version, build type, OS, architecture, auth mode, compatibility, dan Disconnect.
- Compatibility unknown/preview tampil sebagai warning.
- BASIC_AUTH menampilkan pesan unsupported tanpa form Basic.
- Failed memetakan error ke teks manusiawi dan tidak menampilkan detail mentah.
- Provider tidak membuat coordinator ulang saat rerender; subscription dibersihkan dan coordinator di-dispose saat unmount.
- App root, basename `/app/`, dan deep-link fallback diuji.

Validasi PWA Step 10:

- Root build: manifest `start_url=/`, `scope=/`, icon `/icons/...`, `sw.js` scope `/`.
- `/app/` build: manifest `start_url=/app/`, `scope=/app/`, icon `/app/icons/...`, `sw.js` scope `/app/`.
- Chrome `Page.getAppManifest` tanpa error; `Page.getInstallabilityErrors` kosong.
- Service worker aktif pada scope yang benar.
- CacheStorage hanya berisi precache shell: `index.html`, JS/CSS, icon, `manifest.webmanifest`; tidak ada `/api`, GraphQL, tracker/image, auth, atau token.
- Root cache diperiksa setelah connect/login UI_LOGIN; subpath cache diperiksa setelah connect NONE.
- Offline shell: reload saat offline tetap membuka form; connect offline menghasilkan “Server tidak dapat dijangkau”, bukan data stale.
- Update prompt diuji dengan mengubah `dist/sw.js` sementara: prompt “Versi baru aplikasi tersedia” muncul; Update dan reload memuat shell baru dan tetap controlled.
- Mobile viewport `/app/` 390×844 berhasil.
- iOS/Android nyata, Safari/Firefox, dan install dari store/TWA belum diuji.

Validasi browser Step 9 (headless Chrome, production `dist`, 29 Oktober 2026):

- NONE: form URL → Connect → Connected, version `v2.4.2366`, auth mode NONE.
- UI_LOGIN: login-required muncul; password salah menampilkan error; password benar → Connected UI_LOGIN.
- BASIC_AUTH: unsupported-auth muncul, tanpa form Basic.
- Mobile viewport 390×844: layout satu kolom, tidak ada overflow horizontal.
- Cross-origin UI `http://127.0.0.1:8080` → server `http://127.0.0.1:4567`: Connected berhasil.
- CORS preflight server: `OPTIONS 200`; `Access-Control-Allow-Origin` mencerminkan origin UI; `Access-Control-Allow-Methods: POST`; `Access-Control-Allow-Headers: content-type`; `Access-Control-Allow-Credentials: true`; `Vary: Origin`.
- Tidak ada perubahan pada Suwayomi Server saat smoke test.

Smoke test build produksi:

- `GET /` menghasilkan HTTP 200.
- `<title>Suwayomi Frontend</title>` dan `<div id="root"></div>` ditemukan.
- Asset JS dan CSS hasil build dapat diambil dengan HTTP 200.

## Batasan dan unknown

- Snapshot schema stable v2.4.2366, generated documents, resolver, auth session, GraphQL HTTP/WS transport, resource service, ConnectionCoordinator, connection UI, PWA shell, Library, Updates, Browse, Categories, History, Downloads, Settings, Manga Detail, dan vertical Reader tersedia. Progress baca ditulis melalui `UpdateChapter`; exact page resume, download/offline, source/extension browsing, tracking, migration, dan full Settings parity belum.
- Runtime browser menggunakan server pengguna `https://suwayomi.alphasquare.my.id` (NONE) untuk validasi read-only, kecuali satu progress update `UpdateChapter` pada chapter 2820 yang diverifikasi round-trip; tidak ada mutasi library.
- Repository Git sudah diinisialisasi; commit Phase 0, library contract/data/state/category/UI, manga/reader, visual shell, dan parity baseline dibuat terpisah.
- Belum ada exact page resume, library continue-reading, download/offline reading, source/extension/download UI, category management, tracking, migration, sync, backup, push notification, atau background sync.
- Pengujian browser memakai headless Chrome di Windows desktop dan viewport mobile; belum ada perangkat iOS/Android nyata atau browser Safari/Firefox.
- `serverBaseUrl`, transport, resource, coordinator, connection UI, dan PWA sudah diuji terhadap runtime lokal; deployment reverse proxy/TLS/subpath produksi belum diuji.
- Token dan server URL belum dipersistenkan; reload menghilangkan session dan input server.
- Restart WebSocket membuat koneksi/link baru; subscription aktif perlu di-resubscribe oleh consumer/coordinator.
- Resource redirect ditolak, bukan diikuti; server yang mengandalkan redirect resource perlu keputusan tambahan.
- Object URL harus di-dispose oleh pemilik handle; service hanya menjamin cleanup saat `dispose()` dipanggil.
- Tidak ada cache persisten data server, deduplikasi request resource, atau offline cache.
- SIMPLE_LOGIN tidak dapat dibedakan secara aman dari login-required generik dan tidak didukung.
- BASIC_AUTH hanya dideteksi sebagai unsupported; tidak ada dukungan login Basic.
- Versi server yang tidak dapat diparse dianggap compatibility unknown dan tetap boleh connected hanya untuk operasi baseline yang berhasil.
- `VITE_FRONTEND_BASE_PATH` harus diset untuk deployment subpath; nilai invalid jatuh ke `/` tanpa menebak route.
- Icon PWA masih placeholder netral; bukan branding final.
- `skipWaiting`/`clientsClaim` false: halaman pertama belum dikontrol SW sampai reload; update memakai prompt.
- Update prompt diuji dengan mutasi sementara `dist/sw.js`; update deployment nyata/HTTP cache/CDN belum diuji.
- Installability diperiksa di Chrome headless (`installabilityErrors` kosong); install Android/iOS nyata belum diuji.
- iOS safe-area CSS dan meta disiapkan, tetapi notch/home indicator belum diuji di perangkat.
- Cache inspection memakai Chrome headless pada root dan `/app/`; browser lain belum diuji.
- `package-lock.json` adalah satu-satunya lockfile; jangan menambahkan lockfile lain tanpa keputusan eksplisit.
