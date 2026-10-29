# Aturan bersama semua AI

Dokumen ini berlaku untuk DeepSeek, ChatGPT Work, Codex, Claude, dan semua kontributor AI. Folder proyek adalah sumber keputusan bersama; jangan mengandalkan ingatan percakapan yang tidak tersimpan. Instruksi pengguna yang eksplisit tetap diutamakan; bila mengubah keputusan, perbarui dokumen terkait dan jelaskan alasannya.

## Tujuan dan batas pekerjaan

Frontend React baru untuk Suwayomi Server, mendukung browser desktop/mobile dan PWA iOS/Android. Ini implementasi baru, bukan fork Suwayomi-WebUI. WebUI resmi hanya referensi. Target minimum yang disepakati adalah stable **v2.4.2366**, bukan klaim tentang rilis stable terbaru.

**Phase 0 selesai dan tervalidasi.** Phase 1 Step 1 (audit kontrak Library), Step 2 (Library data layer), Step 3 (pagination/filter/state model), dan Step 3.5 (category support) selesai; belum ada Library UI. Mulai implementasi fitur berikutnya hanya setelah pengguna menugaskannya. Bukti akhir Phase 0 ada di [docs/phase-0-validation.md](docs/phase-0-validation.md); kontrak Library di [docs/phase-1-library-contract.md](docs/phase-1-library-contract.md); data layer di [docs/phase-1-library-data.md](docs/phase-1-library-data.md); state model di [docs/phase-1-library-state.md](docs/phase-1-library-state.md); category di [docs/phase-1-library-categories.md](docs/phase-1-library-categories.md); arsitektur di [docs/architecture.md](docs/architecture.md).

Phase 0 hanya fondasi, koneksi, autentikasi NONE/UI_LOGIN, informasi aboutServer, dan PWA shell minimal. Library, daftar/detail manga, chapter, reader, sources, extensions, download UI, tracking, serta offline reading di luar scope.

## Baseline dan sumber API

- GraphQL schema hasil server stable v2.4.2366 adalah sumber kebenaran kontrak API. Simpan snapshot dengan versi, asal, tanggal, checksum, dan cara reproduksinya sebelum menulis operasi.
- HTTP utama: POST `/api/graphql`. Rencana subscription: WebSocket pada path yang sama, protokol `graphql-transport-ws`; verifikasi pada baseline sebelum implementasi.
- Validasi setiap operasi terhadap snapshot melalui GraphQL Code Generator. Generated types tidak diedit manual. aboutServer dan operasi autentikasi harus dibuktikan dari schema; jangan menebak selection set.
- Legacy REST hanya untuk resource yang memang disajikan server melalui REST, seperti thumbnail/page; bukan pengganti GraphQL untuk data aplikasi.
- API master/preview bukan target awal. Penggunaan di masa depan wajib memiliki bukti dukungan versi/kapabilitas, compatibility gate eksplisit, fallback aman, dan test baseline.
- Pisahkan bukti langsung dari asumsi/hasil audit terdahulu. Referensi master tidak membuktikan dukungan stable. Jika kontrak belum tersedia, tandai blocker dan hentikan bagian yang bergantung padanya.

## Autentikasi dan resource

- Dukungan penuh awal: NONE dan UI_LOGIN. BASIC_AUTH/SIMPLE_LOGIN hanya perlu jalur perluasan yang jelas, serta pesan unsupported yang jujur; jangan fallback diam-diam ke NONE.
- Berdasarkan audit terdahulu, UI_LOGIN memakai JWT: HTTP `Authorization: Bearer <accessToken>`; WebSocket melalui `connectionParams.Authorization`. Verifikasi login, refresh, logout, deteksi mode, dan masa berlaku token sebelum implementasi.
- Auth service menjadi satu pemilik sesi/token. HTTP, WebSocket, dan resource service membaca sesi yang sama. Jangan log token/password atau commit secret dan konfigurasi pribadi.
- Pilihan penyimpanan token harus dicatat beserta tradeoff; jangan mengasumsikan localStorage atau refresh-cookie tersedia. Gunakan memori sebagai titik awal konservatif; kebutuhan persistensi harus diputuskan berdasarkan kontrak server.
- Saat logout/ganti server: batalkan request lama, tutup subscription, bersihkan cache Apollo dan resource, cabut object URL, dan cegah respons sesi lama masuk ke sesi baru.
- Resource service menyelesaikan URL dan header autentikasi. Jika perlu, fetch resource memakai Bearer, ubah menjadi Blob/object URL; pusatkan abort, deduplikasi, lifecycle, dan penanganan error. Jangan membuat fitur manga untuk mendemonstrasikannya.
- Jangan kirim kredensial ke origin/path di luar server terkonfigurasi; validasi resource absolut dan redirect. Token tidak boleh ditempel ke query URL.

## Deployment, URL, dan subpath

- Dukung same-origin/Custom WebUI dan standalone frontend dengan server berbeda origin.
- Bedakan `frontendBasePath` (router, asset, manifest, service worker) dan `serverBaseUrl` (GraphQL, WebSocket, resource). Keduanya bisa berbeda subpath.
- Semua URL server melalui resolver bersama. Base `https://example.com/suwayomi` + `/api/v1/...` harus menjadi `https://example.com/suwayomi/api/v1/...`; jangan memakai URL berawalan slash yang membuang prefix base.
- Normalisasi trailing slash, tolak scheme selain HTTP(S), query/hash/kredensial pada base URL, dan input invalid dengan pesan jelas. Konversi HTTP→WS dan HTTPS→WSS sambil mempertahankan host serta prefix.
- Deteksi same-origin harus mempertimbangkan deployment prefix; standalone harus bisa menerima URL eksplisit. Jangan menyamakan lokasi route saat ini dengan server base.
- CORS, reverse proxy, TLS, history fallback, dan upgrade WebSocket adalah prasyarat deployment yang harus didokumentasikan; jangan menonaktifkan keamanan browser atau mengubah server untuk menutup masalah konfigurasi.

## Batas arsitektur dan dependency

- React + TypeScript strict + Vite adalah fondasi yang disepakati. Apollo Client, graphql-ws, GraphQL Code Generator, React Router, dan vite-plugin-pwa adalah kandidat yang dievaluasi saat implementasi.
- UI → application services → infrastructure. UI tidak mengetahui endpoint, token storage, detail transport, atau Blob lifecycle. Modul generik tidak bergantung pada fitur/UI.
- Apollo memiliki state data server; state lokal React untuk kebutuhan lokal. Zustand hanya jika ada kebutuhan lintas komponen yang konkret. Jangan menggandakan cache data server.
- Belum memilih UI component library. Jangan menambahkan framework alternatif, abstraction spekulatif, atau fitur baru tanpa alasan tugas.
- Setiap dependency harus mempunyai kebutuhan konkret, evaluasi kompatibilitas/lisensi, versi yang ditetapkan, serta lockfile tunggal. Catat runtime dan package manager saat dipilih; jangan membuat lockfile campuran.

## PWA, kualitas, dan pengujian

- PWA awal: manifest, ikon, standalone display, viewport, safe area iOS, shell, dan deployment scope benar. Perilaku instalasi mengikuti batas platform dan diuji pada perangkat nyata bila tersedia.
- Cache service worker hanya asset shell statis yang disetujui. Jangan cache GraphQL, autentikasi, token, image/page pribadi, atau respons API. Logout tidak boleh meninggalkan data pribadi dalam cache.
- Validasi sesuai perubahan. Dokumentasi: tautan lokal, konsistensi scope, dan kejujuran status bukti. Implementasi: lint, typecheck, codegen validation, unit/integration test terkait, dan production build.
- Test resolver root/subpath, slash variants, WS, base frontend terpisah, dan input invalid. Test NONE/UI_LOGIN, expiry/refresh sesuai kontrak, logout/ganti server, subscription reconnect, resource cleanup, dan tidak bocornya kredensial.
- Integration test nyata wajib membuktikan baseline stable; mock bukan bukti kompatibilitas. Uji dua mode deployment, deep-link reload, PWA scope/cache, mobile viewport, keyboard, label form, dan status/error yang mudah dipahami.
- Hindari `any`, pengabaian type/lint tanpa alasan, secret dalam fixture, generated code manual, serta klaim test lulus yang tidak dijalankan. Catat hambatan lingkungan dan pengujian yang belum dilakukan.

## Disiplin perubahan dan perilaku AI

- Inspect before editing. Baca aturan, dokumen, file terkait, dan status Git bila tersedia. Periksa ulang file sebelum menulis karena AI lain mungkin bekerja bersamaan.
- Keep changes scoped to the current task. Pertahankan perubahan pengguna/AI lain; jangan overwrite, reset, force push, atau hapus pekerjaan tanpa otorisasi.
- Run validation appropriate to every change. Laporkan apa yang berubah, alasan penting dalam bahasa Indonesia sederhana, hasil validasi, dan ketidakpastian.
- Dokumentasikan perubahan kontrak/arsitektur bersamaan dengan implementasi. Jangan menganggap rencana sebagai pekerjaan selesai. Jika implementasi berbeda dari rencana, jelaskan dan selaraskan dokumen.
- Ajukan pertanyaan hanya bila keputusan penting tidak bisa diselesaikan dari bukti yang ada; lanjutkan pekerjaan independen yang sudah diizinkan.

## Larangan eksplisit

- NEVER invent GraphQL fields, queries, mutations, subscriptions, input types, or enums.
- NEVER modify Suwayomi-Server.
- NEVER fork Suwayomi-WebUI for this project.
- NEVER use master/preview-only APIs without an explicit compatibility gate.
- NEVER build server URLs ad-hoc inside UI components.
- NEVER duplicate authentication/resource loading logic across UI components.
- NEVER implement offline reading during Phase 0.
- NEVER silently replace the agreed architecture.
- NEVER add dependencies without a concrete reason.
