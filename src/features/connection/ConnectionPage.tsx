import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from 'react';
import type { ConnectionError } from '../../core/server/connectionError';
import type { ConnectionState } from '../../core/server/connectionCoordinator';
import { useConnection } from '../../app/useConnection';

const ERROR_TEXT: Partial<Record<ConnectionError['code'], string>> = {
  'invalid-server-url': 'Alamat server tidak valid. Periksa format URL, termasuk skema http:// atau https://.',
  unreachable: 'Server tidak dapat dijangkau. Periksa alamat server, jaringan, dan konfigurasi CORS.',
  'incompatible-server': 'Versi server lebih lama dari baseline v2.4.2366 yang didukung.',
  'authentication-required': 'Server meminta autentikasi, tetapi sesi belum valid.',
  'invalid-credentials': 'Username atau password tidak cocok.',
  'unsupported-auth': 'Mode autentikasi server belum didukung oleh frontend Phase 0.',
  'server-error': 'Server mengembalikan error yang tidak dapat diproses.',
  'invalid-state': 'Tindakan ini tidak dapat dilakukan pada status koneksi saat ini.',
  disposed: 'Koneksi sudah dihentikan.',
};

function errorText(error?: ConnectionError): string {
  if (!error) {
    return 'Terjadi kesalahan koneksi.';
  }

  return ERROR_TEXT[error.code] ?? 'Terjadi kesalahan koneksi.';
}

function serverAddress(state: ConnectionState, fallback: string): string {
  if (state.status === 'disconnected') {
    return fallback;
  }

  if (state.status === 'connected') {
    return state.context.config.serverBaseUrl;
  }

  return 'serverBaseUrl' in state ? (state.serverBaseUrl ?? fallback) : fallback;
}

function platformLabel(state: Extract<ConnectionState, { status: 'connected' }>): string {
  const platform = state.context.serverInfo.platformInfo;
  const os = [platform.os.name, platform.os.version].filter(Boolean).join(' ');

  return os || platform.arch;
}

export function ConnectionPage() {
  const { state, connect, login, disconnect } = useConnection();
  const [serverUrl, setServerUrl] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const serverInput = useRef<HTMLInputElement>(null);
  const usernameInput = useRef<HTMLInputElement>(null);
  const passwordInput = useRef<HTMLInputElement>(null);
  const connectedHeading = useRef<HTMLHeadingElement>(null);

  const loginErrorCode = state.status === 'login-required' ? state.error?.code : undefined;

  useEffect(() => {
    setLocalError(null);
  }, [state.status]);

  useEffect(() => {
    if (state.status === 'login-required') {
      usernameInput.current?.focus();

      if (loginErrorCode === 'invalid-credentials') {
        setPassword('');
        passwordInput.current?.focus();
      }
    }

    if (state.status === 'connected') {
      connectedHeading.current?.focus();
    }

    if (state.status === 'failed') {
      serverInput.current?.focus();
    }
  }, [state.status, loginErrorCode]);

  const handleConnect = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = serverUrl.trim();

    if (!value) {
      setLocalError('Alamat server wajib diisi.');
      serverInput.current?.focus();
      return;
    }

    setLocalError(null);
    void connect(value).catch(() => {
      setLocalError('Koneksi tidak dapat dimulai.');
    });
  };

  const handleLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const user = username.trim();

    if (!user || !password) {
      setLocalError('Username dan password wajib diisi.');
      (user ? passwordInput : usernameInput).current?.focus();
      return;
    }

    const submittedPassword = password;
    setLocalError(null);
    setPassword('');
    void login(user, submittedPassword).catch(() => {
      setLocalError('Login tidak dapat diproses.');
    });
  };

  const handleDisconnect = () => {
    setPassword('');
    setLocalError(null);
    void disconnect();
  };

  const serverForm = (
    <form className="connection-form" onSubmit={handleConnect} noValidate>
      <div className="field">
        <label htmlFor="server-url">Alamat server Suwayomi</label>
        <input
          ref={serverInput}
          id="server-url"
          name="serverUrl"
          type="url"
          inputMode="url"
          autoComplete="url"
          spellCheck={false}
          placeholder="https://manga.example.com"
          value={serverUrl}
          onChange={(event) => setServerUrl(event.target.value)}
          aria-invalid={localError ? true : undefined}
          aria-describedby={localError ? 'server-url-error' : 'server-url-hint'}
        />
        <p className="hint" id="server-url-hint">
          Masukkan alamat server tanpa path GraphQL. Contoh: https://manga.example.com
        </p>
      </div>

      {localError ? (
        <p className="alert alert-error" id="server-url-error" role="alert">
          {localError}
        </p>
      ) : null}

      <div className="actions">
        <button className="button" type="submit" disabled={state.status === 'connecting'}>
          {state.status === 'connecting' ? 'Menghubungkan…' : 'Connect'}
        </button>
      </div>
    </form>
  );

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="eyebrow">Phase 0 · Step 9</p>
        <h1>Suwayomi Frontend</h1>
        <p className="lede">
          Hubungkan frontend ini ke Suwayomi Server. Library dan reader belum termasuk
          dalam tahap ini.
        </p>
      </header>

      <main className="app-main">
        {state.status === 'disconnected' || state.status === 'failed' ? (
          <section className="panel" aria-labelledby="connection-heading">
            <p className="panel-kicker">Connection</p>
            <h2 id="connection-heading">
              {state.status === 'failed' ? 'Koneksi gagal' : 'Hubungkan server'}
            </h2>

            {state.status === 'failed' ? (
              <p className="alert alert-error" role="alert">
                {errorText(state.error)}
              </p>
            ) : (
              <p className="panel-copy">
                Masukkan alamat Suwayomi Server yang dapat diakses oleh browser ini.
              </p>
            )}

            {serverForm}
          </section>
        ) : null}

        {state.status === 'connecting' ? (
          <section className="panel" aria-labelledby="connecting-heading">
            <p className="panel-kicker">Connection</p>
            <h2 id="connecting-heading">Menghubungkan…</h2>
            <p className="status-line" role="status" aria-live="polite">
              Memeriksa {serverAddress(state, serverUrl)} dan informasi server.
            </p>
            <div className="actions">
              <button className="button button-secondary" type="button" onClick={handleDisconnect}>
                Batalkan
              </button>
            </div>
          </section>
        ) : null}

        {state.status === 'login-required' ? (
          <section className="panel" aria-labelledby="login-heading">
            <p className="panel-kicker">UI_LOGIN</p>
            <h2 id="login-heading">Login diperlukan</h2>
            <p className="panel-copy">
              Server <strong>{state.serverBaseUrl}</strong> meminta autentikasi.
            </p>

            {state.error ? (
              <p className="alert alert-error" role="alert">
                {errorText(state.error)}
              </p>
            ) : null}

            <form className="connection-form" onSubmit={handleLogin} noValidate>
              <div className="field">
                <label htmlFor="login-username">Username</label>
                <input
                  ref={usernameInput}
                  id="login-username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  spellCheck={false}
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  aria-invalid={state.error?.code === 'invalid-credentials' ? true : undefined}
                />
              </div>

              <div className="field">
                <label htmlFor="login-password">Password</label>
                <input
                  ref={passwordInput}
                  id="login-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  aria-invalid={state.error?.code === 'invalid-credentials' ? true : undefined}
                />
              </div>

              {localError ? (
                <p className="alert alert-error" role="alert">
                  {localError}
                </p>
              ) : null}

              <div className="actions">
                <button className="button" type="submit">
                  Login
                </button>
                <button className="button button-secondary" type="button" onClick={handleDisconnect}>
                  Ganti server
                </button>
              </div>
            </form>
          </section>
        ) : null}

        {state.status === 'authenticating' ? (
          <section className="panel" aria-labelledby="authenticating-heading">
            <p className="panel-kicker">UI_LOGIN</p>
            <h2 id="authenticating-heading">Memverifikasi login…</h2>
            <p className="status-line" role="status" aria-live="polite">
              Memeriksa sesi dan akses ke {state.serverBaseUrl}.
            </p>
          </section>
        ) : null}

        {state.status === 'connected' ? (
          <section className="panel" aria-labelledby="connected-heading">
            <div className="status-heading">
              <span className="status-dot" aria-hidden="true" />
              <div>
                <p className="panel-kicker">Connected</p>
                <h2 id="connected-heading" ref={connectedHeading} tabIndex={-1}>
                  {state.context.serverInfo.name}
                </h2>
              </div>
            </div>

            <p className="panel-copy">
              Koneksi ke Suwayomi Server sudah aktif. Belum ada library atau reader pada
              Phase 0.
            </p>

            {state.context.compatibility.status !== 'compatible' ? (
              <p className="alert alert-warning" role="status">
                {state.context.compatibility.warning ??
                  'Kompatibilitas server belum sepenuhnya terverifikasi.'}
              </p>
            ) : null}

            <dl className="info-grid">
              <div className="info-item">
                <dt>Server URL</dt>
                <dd className="breakable">{state.context.config.serverBaseUrl}</dd>
              </div>
              <div className="info-item">
                <dt>Server</dt>
                <dd>{state.context.serverInfo.name}</dd>
              </div>
              <div className="info-item">
                <dt>Version</dt>
                <dd>{state.context.serverInfo.version}</dd>
              </div>
              <div className="info-item">
                <dt>Build type</dt>
                <dd>{state.context.serverInfo.buildType}</dd>
              </div>
              <div className="info-item">
                <dt>Platform</dt>
                <dd>{platformLabel(state)}</dd>
              </div>
              <div className="info-item">
                <dt>Architecture</dt>
                <dd>{state.context.serverInfo.platformInfo.arch}</dd>
              </div>
              <div className="info-item">
                <dt>Auth mode</dt>
                <dd>{state.context.authMode}</dd>
              </div>
              <div className="info-item">
                <dt>Compatibility</dt>
                <dd>{state.context.compatibility.status}</dd>
              </div>
            </dl>

            <div className="actions">
              <button className="button button-secondary" type="button" onClick={handleDisconnect}>
                Disconnect
              </button>
            </div>
          </section>
        ) : null}

        {state.status === 'unsupported-auth' ? (
          <section className="panel" aria-labelledby="unsupported-heading">
            <p className="panel-kicker">Authentication</p>
            <h2 id="unsupported-heading">Mode autentikasi belum didukung</h2>
            <p className="alert alert-warning" role="alert">
              {state.authMode === 'BASIC_AUTH'
                ? 'Server menggunakan BASIC_AUTH. Frontend Phase 0 belum mendukung login Basic; tidak ada form Basic yang ditampilkan.'
                : 'Server memerlukan mode autentikasi yang belum dapat dibuktikan atau didukung oleh frontend Phase 0.'}
            </p>
            <p className="panel-copy">
              Hubungi administrator server atau gunakan konfigurasi autentikasi yang didukung
              (NONE atau UI_LOGIN).
            </p>
            <div className="actions">
              <button className="button" type="button" onClick={handleDisconnect}>
                Kembali ke form koneksi
              </button>
            </div>
          </section>
        ) : null}
      </main>

      <footer className="app-footer">
        <p>Phase 0 · connection foundation · belum ada library/reader</p>
      </footer>
    </div>
  );
}
