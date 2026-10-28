const foundations = [
  ['Runtime', 'React 19 + TypeScript strict'],
  ['Build', 'Vite 8 dengan asset relatif'],
  ['Quality gates', 'ESLint, Vitest, production build'],
  ['Struktur', 'Shell minimal di src/app'],
] as const;

const notIncluded = [
  'GraphQL, Apollo Client, dan graphql-ws',
  'Autentikasi dan koneksi ke Suwayomi Server',
  'aboutServer dan resource/image loader',
  'PWA, library, manga, chapter, reader, sources, extensions, downloads, tracking',
] as const;

export function App() {
  return (
    <div className="app-shell">
      <header className="app-hero">
        <p className="eyebrow">Phase 0 · Step 1</p>
        <h1>Suwayomi Frontend</h1>
        <p className="lede">
          Fondasi React, TypeScript, dan Vite sudah berjalan. Shell ini sengaja belum
          tersambung ke server; langkah berikutnya akan menambahkan kontrak dan transport
          secara terpisah.
        </p>
      </header>

      <main className="app-main">
        <section className="panel status-panel" aria-labelledby="bootstrap-status">
          <div className="status-heading">
            <span className="status-dot" aria-hidden="true" />
            <div>
              <p className="panel-kicker">Status bootstrap</p>
              <h2 id="bootstrap-status">Siap untuk langkah berikutnya</h2>
            </div>
          </div>

          <p className="panel-copy">
            Build produksi, lint, typecheck, dan test sudah tersedia sebagai quality gate
            dasar. Tidak ada klaim koneksi server pada tahap ini.
          </p>

          <dl className="facts">
            {foundations.map(([label, value]) => (
              <div className="fact" key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="panel" aria-labelledby="scope-heading">
          <p className="panel-kicker">Batas scope</p>
          <h2 id="scope-heading">Belum termasuk</h2>
          <ul className="scope-list">
            {notIncluded.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </main>

      <footer className="app-footer">
        <p>Phase 0 · fondasi aplikasi · belum terhubung ke server</p>
      </footer>
    </div>
  );
}
