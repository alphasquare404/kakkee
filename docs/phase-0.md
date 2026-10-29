# Rencana implementasi Phase 0

Status: **Step 9 selesai (Connection UI)** — bootstrap React/TypeScript/Vite, quality gates, snapshot schema stable v2.4.2366, codegen, resolver, auth session, GraphQL HTTP/WebSocket transport, resource service, ConnectionCoordinator, dan UI koneksi/login minimal sudah tersedia. Rencana PWA shell pada bagian 9 belum dikerjakan; langkah berikutnya belum dimulai. Dokumen ini tetap menjadi rencana; ringkasan hasil Step 1–9 ada di [README.md](../README.md). Aturan bersama: [AGENTS.md](../AGENTS.md). Pembagian modul: [architecture.md](architecture.md). Bukti backend dan ketidakpastiannya: [suwayomi-backend-notes.md](suwayomi-backend-notes.md).

## Objectives dan non-goals

Bangun fondasi React/TypeScript/Vite yang dapat terhubung ke stable v2.4.2366 dengan NONE/UI_LOGIN, menampilkan Connected dan informasi aboutServer yang tersedia, serta menyediakan PWA shell. Fondasi mendukung deployment same-origin/standalone dan subpath secara terpisah.

Tidak mencakup library UI, daftar/detail manga, chapter list, reader, sources, extensions, download UI, tracking, offline manga/chapter, atau pemilihan UI component library. Tidak fork WebUI dan tidak modifikasi Server.

## Langkah dan kriteria penerimaan

### 1. Periksa ulang workspace dan kunci kontrak stable

Periksa file dan pekerjaan AI lain sebelum menulis. Catat runtime/package manager yang tersedia, akses server baseline, dan bukti versi/tag. Ambil schema melalui introspection atau artefak resmi yang dapat dibuktikan berasal dari baseline; jika introspection membutuhkan autentikasi, gunakan sesi pengujian yang diizinkan tanpa menyimpan secret. Jangan menggantinya dengan schema master atau server versi berbeda.

Expected files: `graphql/schema/stable-v2.4.2366.graphql`, `graphql/schema/stable-v2.4.2366.metadata.json`, pembaruan backend notes. Metadata mencatat versi/tag/commit jika tersedia, sumber, tanggal, checksum, alat/perintah reproduksi tanpa secret, dan versi generator.

Acceptance: schema berhasil diparse; versi asal terverifikasi; kontrak aboutServer, mode auth, login/refresh/logout, dan subscription yang diperlukan diketahui atau blocker ditulis. Snapshot tidak berisi data pengguna. Bila schema baseline tidak tersedia, hentikan pembuatan operasi yang bergantung padanya; jangan mengarang fixture schema sebagai pengganti.

### 2. Bootstrap dan quality gates

Setelah ditugaskan untuk implementasi, pilih versi kompatibel React, TypeScript, Vite dan satu package manager. Catat alasan dependency, runtime minimum, dan perintah kerja. Pasang hanya paket yang dipakai pada tahap berjalan. Pakai TypeScript strict dan lint yang relevan.

Expected files: `package.json`, satu lockfile, `tsconfig*.json`, `vite.config.ts`, konfigurasi lint/test, `index.html`, `src/main.tsx`, `src/app/App.tsx`, `README.md`, `.gitignore`, `.env.example` tanpa secret.

Acceptance: shell minimal berjalan; scripts `lint`, `typecheck`, `test`, `build` tersedia dan lulus. README menjelaskan instalasi/pengujian. Tidak ada fitur di luar scope. Inisialisasi Git bukan syarat otomatis langkah ini; ikuti instruksi pengguna dan kondisi repository saat itu.

### 3. Resolver dan konfigurasi deployment

Implementasikan pemisahan frontend base dan server base. Tentukan konfigurasi build untuk frontend base serta konfigurasi runtime URL server. Normalisasi URL, satukan pembuatan endpoint/resource, dan sediakan deteksi same-origin dari konfigurasi prefix yang jelas.

Expected files: `src/core/config/deployment.ts`, `src/core/server/serverUrl.ts`, `src/core/server/serverUrl.test.ts`, dokumentasi contoh konfigurasi.

Acceptance: test root, `/suwayomi`, trailing slash, resource slash awal, HTTP/HTTPS→WS/WSS, port, invalid URL, query/hash/credential rejection, serta frontend `/app/` dengan server `/suwayomi` lulus. Resource absolut di luar server ditolak sebelum menerima header auth. UI tidak membentuk URL server sendiri.

### 4. Schema dan GraphQL Codegen

Konfigurasikan generator terhadap snapshot lokal, bukan introspection live yang berubah tiap build. Tambahkan operasi aboutServer memakai field yang terbukti. Tentukan output generated, kebijakan commit output, dan pemeriksaan agar output tidak tertinggal. Tambahkan operasi auth hanya setelah kontraknya diketahui.

Expected files: `codegen.ts`, `graphql/operations/aboutServer.graphql`, operasi auth yang terverifikasi bila memang GraphQL, `src/core/graphql/generated/`, scripts `codegen` dan `codegen:check`.

Acceptance: generator berhasil dari snapshot tanpa jaringan; unknown field menyebabkan validasi gagal; regenerasi deterministik; typecheck memakai tipe hasil generator; pemeriksaan sinkronisasi tidak mengubah file diam-diam. Tidak ada nama field tambahan yang ditebak dari versi preview.

### 5. Auth service dan lifecycle sesi

Implementasikan NONE/UI_LOGIN sesuai bukti baseline, termasuk cara memperoleh token, deteksi kebutuhan login, expiry/refresh/logout yang benar-benar didukung. Jika tidak ada refresh pada kontrak, gunakan login ulang yang jelas. Catat keputusan penyimpanan token; mulai dengan sesi memori kecuali kebutuhan yang dibuktikan memerlukan keputusan lain. Sediakan titik perluasan untuk mode lain tanpa mengimplementasikannya penuh.

Expected files: `src/core/auth/session.ts`, `src/core/auth/authService.ts`, adapter NONE/UI_LOGIN, tests; `src/core/server/connectionCoordinator.ts` untuk reset lintas layanan.

Acceptance: login benar/salah, NONE tanpa Bearer, expiry, refresh sesuai kontrak atau login ulang, logout, dan ganti server diuji. Request terlambat tidak menghidupkan sesi lama. Mode unsupported tidak dilaporkan Connected. Token/password tidak masuk log, URL, fixture, atau cache persisten. Jangan menyebut dukungan UI_LOGIN selesai jika hanya header injection yang bekerja.

### 6. Apollo HTTP dan GraphQL WebSocket

Evaluasi/pakai Apollo Client dan graphql-ws untuk pembagian query/mutation HTTP dan subscription WS. Semua endpoint melalui resolver dan semua token dari auth service. `connectionParams.Authorization` memakai token aktif saat koneksi dibuat. Terapkan reconnect terbatas, disposal, serta penggantian token tanpa koneksi lama tertinggal.

Expected files: `src/core/graphql/createClient.ts`, `src/core/graphql/createWsClient.ts`, tests transport dan lifecycle.

Acceptance: HTTP POST ke path benar; WS memakai `graphql-transport-ws` pada path benar. Uji token saat reconnect, penghentian saat logout/ganti server, pembersihan Apollo cache, dan error yang tidak menyebabkan retry tanpa batas. Verifikasi handshake dan subscription baseline nyata yang terverifikasi jika tersedia; jangan mengarang subscription hanya untuk test. Jika tidak bisa menguji subscription nyata, laporkan gap dan jangan klaim dukungannya tervalidasi penuh.

### 7. Abstraction resource terautentikasi

Buat layanan resource terpusat tanpa membuat layar manga. Dukung resource NONE dan UI_LOGIN sesuai kebutuhan header baseline. Batasi origin/path dan redirect agar token tidak bocor; sediakan abort, deduplikasi minimum yang diperlukan, dan pencabutan object URL.

Expected files: `src/core/resources/resourceService.ts`, tests; hook adapter React hanya bila benar-benar dipakai.

Acceptance: unit/integration test membuktikan prefix subpath, header, kegagalan auth, abort, object URL create/revoke, cleanup logout/ganti server, dan penolakan resource luar server. Uji resource nyata jika akses tersedia; fixture aman tidak boleh menyamarkan kekurangan bukti integrasi.

### 8. Router dan layar koneksi minimal

Pasang React Router dengan basename frontend. Buat form URL/deteksi konfigurasi, Connect, login bila perlu, status koneksi, dan informasi aboutServer. Tampilkan error yang berguna tanpa mengungkap token atau mengklaim penyebab CORS secara pasti dari network error umum.

Expected files: `src/app/router.tsx`, `src/app/providers.tsx`, `src/features/connection/ConnectionPage.tsx`, komponen form/status seperlunya, tests alur.

Acceptance: NONE dan UI_LOGIN berhasil end-to-end; URL invalid, server tidak terjangkau, kredensial salah, mode unsupported, reconnect dan ganti server punya perilaku jelas. Connected hanya setelah aboutServer berhasil. Deep-link reload bekerja pada root/subpath dengan fallback hosting yang didokumentasikan. Form memiliki label, keyboard navigation, dan status aksesibel. Tidak ada halaman manga/library.

### 9. PWA shell

Evaluasi/pakai vite-plugin-pwa. Konfigurasikan manifest, ikon, display standalone, start_url/scope frontend, viewport, safe area, serta lifecycle pembaruan shell yang tidak mencampur asset versi berbeda.

Expected files: konfigurasi PWA di Vite, ikon di `public/`, manifest yang dihasilkan atau sumbernya, style shell minimal, tests konfigurasi/cache.

Acceptance: production build menyediakan manifest/ikon; instalasi diuji di Android dan Add to Home Screen iOS jika perangkat tersedia. Asset/router/scope benar pada `/` dan `/app/`. Inspeksi service worker memastikan GraphQL/auth/resource pribadi tidak dicache. Tidak ada offline reading; keadaan jaringan putus ditampilkan dengan jujur. Perangkat yang tidak tersedia dicatat sebagai belum diuji.

### 10. Validasi akhir dan serah terima

Expected files: README penggunaan dan deployment, `docs/phase-0-validation.md` berisi versi lingkungan/server, matriks hasil, tanggal, batas pengujian, dan langkah reproduksi tanpa secret. Selaraskan dokumen arsitektur dengan keputusan implementasi.

Acceptance: lint, typecheck, codegen/check, tests, production build lulus. Manual smoke test dilakukan pada build produksi, bukan hanya dev server. Semua gap ditulis eksplisit. Phase 0 tidak diam-diam berlanjut ke Phase 1.

## Strategi validasi

| Lapisan | Bukti yang dibutuhkan |
| --- | --- |
| Dokumentasi saat ini | Tautan lokal valid, aturan konsisten, status rencana/bukti jelas |
| Unit | URL, config, auth transitions, resource lifecycle dan isolasi sesi |
| Integrasi terkontrol | Header HTTP/WS/resource, error, retry, cache reset, respons terlambat |
| Stable nyata | aboutServer, NONE, UI_LOGIN, kontrak auth, WS dan resource yang tersedia |
| Deployment | Same-origin dan standalone; masing-masing root serta subpath; frontend/server prefix berbeda |
| Browser/perangkat | Desktop/mobile, iOS/Android PWA, safe area, keyboard, deep-link reload |

Setiap perubahan menjalankan pemeriksaan yang relevan; gate lengkap dijalankan pada akhir implementasi. Mock membantu menguji failure cases tetapi tidak membuktikan kompatibilitas stable. Jangan melabeli pengujian yang belum dijalankan sebagai lulus.

## Known unknowns

- Snapshot stable v2.4.2366 sudah tersedia di `graphql/schema/`; gap bukti yang tersisa dirangkum di [suwayomi-backend-notes.md](suwayomi-backend-notes.md).
- Deteksi NONE/UI_LOGIN melalui protected probe sudah diuji; BASIC_AUTH dikenali dari challenge. SIMPLE_LOGIN belum dapat dibedakan dan tidak didukung.
- UI NONE/UI_LOGIN/BASIC_AUTH, mobile viewport, subpath, deep-link fallback, dan CORS localhost sudah diuji dengan headless Chrome; perangkat iOS/Android, Safari/Firefox, dan deployment produksi belum.
- Expiry token aktual, logout end-to-end, dan refresh setelah expiry belum diuji; refresh berdasarkan unauthorized sudah diuji.
- Subscription `downloadStatusChanged` dan transport `graphql-transport-ws` sudah diuji pada baseline; restart/resubscribe subscription aktif setelah token diganti belum.
- Path thumbnail/page manga dan chapter belum diuji; tracker thumbnail `/api/v1/track/{trackerId}/thumbnail` sudah diuji pada stable (NONE 200, UI_LOGIN tanpa token 401, Bearer 200).
- Perilaku redirect resource, CORS, dan content-type sumber gambar lain belum diuji di browser.
- Konfigurasi reverse proxy, CORS, TLS, server prefix serta frontend prefix deployment pengguna belum diketahui. CORS localhost dan subpath router diuji, tetapi deployment nyata belum.
- Strategi persistensi sesi dan mekanisme update PWA belum diputuskan; versi codegen dan kebijakan generated files sudah dicatat di README.
- Credential test lokal tersedia hanya di luar repository dan tidak boleh di-commit; perangkat iOS/Android nyata belum diuji.

## Stop conditions sebelum Phase 1

Phase 0 siap ditinjau hanya jika kriteria relevan terpenuhi dengan bukti baseline stable, dua mode deployment/subpath, dan tidak ada kegagalan kritis sesi/resource. Jika akses/perangkat menghalangi validasi wajib, nyatakan belum tervalidasi dan minta keputusan pengguna atas gap tersebut; jangan menyatakan selesai penuh.

Hentikan bagian terkait bila schema/kontrak belum terbukti, membutuhkan API preview tanpa gate, atau memerlukan perubahan Suwayomi-Server. Perbaiki fondasi yang masih gagal dalam scope Phase 0. Setelah fondasi tervalidasi, laporkan hasil dan tunggu penugasan Phase 1; jangan mulai fitur manga sendiri.
