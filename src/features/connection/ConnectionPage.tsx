import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from 'react';
import { Link } from 'react-router-dom';
import type { ConnectionError } from '../../core/server/connectionError';
import type { ConnectionState } from '../../core/server/connectionCoordinator';
import { useConnection } from '../../app/useConnection';
import {
  getAutoConnect,
  getLastServerUrl,
  saveLastServerUrl,
  setAutoConnect,
} from '../../core/preferences/connectionPreferences';
import {
  clearRememberedSession,
  getRememberedSession,
  saveRememberedSession,
} from '../../core/preferences/sessionPreferences';
import {
  createOfflineStorage,
  isOfflineStorageSupported,
} from '../../core/offline/offlineStorage';
import { useI18n } from '../../shared/useI18n';
import { registerMessages } from '../../shared/i18n';

registerMessages('id', {
  'Offline downloads': 'Unduhan offline',
  'Suwayomi server address': 'Alamat server Suwayomi',
  'Enter the server address without the GraphQL path. Example: https://manga.example.com':
    'Masukkan alamat server tanpa path GraphQL. Contoh: https://manga.example.com',
  'Reconnect automatically on this device':
    'Hubungkan ulang otomatis di perangkat ini',
  'Connecting…': 'Menghubungkan…',
  Connect: 'Hubungkan',
  'Use last server': 'Gunakan server terakhir',
  'Suwayomi · Library & Reader': 'Suwayomi · Perpustakaan & Reader',
  'Connect to your server and continue reading from your Library.':
    'Hubungkan ke server Anda dan lanjutkan membaca dari Perpustakaan.',
  Connection: 'Koneksi',
  'Connection failed': 'Koneksi gagal',
  'Connect server': 'Hubungkan server',
  'Enter the Suwayomi Server address reachable by this browser.':
    'Masukkan alamat Suwayomi Server yang dapat diakses browser ini.',
  'Checking {server} and server information.':
    'Memeriksa {server} dan informasi server.',
  Cancel: 'Batal',
  'Login required': 'Login diperlukan',
  'Server {server} requires authentication.':
    'Server {server} meminta autentikasi.',
  'Remember login on this device': 'Ingat login di perangkat ini',
  Login: 'Masuk',
  'Change server': 'Ganti server',
  'Verifying login…': 'Memverifikasi login…',
  'Basic authentication': 'Autentikasi Basic',
  'Server session login': 'Login sesi server',
  'Enter the HTTP Basic credentials configured on the server.':
    'Masukkan kredensial HTTP Basic yang dikonfigurasi di server.',
  'Signs in to the server session so API and WebSocket requests share the same login.':
    'Masuk ke sesi server agar permintaan API dan WebSocket memakai login yang sama.',
  'Checking session and access to {server}.':
    'Memeriksa sesi dan akses ke {server}.',
  Connected: 'Terhubung',
  'The connection to Suwayomi Server is active. Library and Reader are available.':
    'Koneksi ke Suwayomi Server aktif. Perpustakaan dan Reader tersedia.',
  'Server compatibility is not fully verified.':
    'Kompatibilitas server belum sepenuhnya terverifikasi.',
  'Server URL': 'URL server',
  'Build type': 'Tipe build',
  Platform: 'Platform',
  Architecture: 'Arsitektur',
  'Auth mode': 'Mode auth',
  Compatibility: 'Kompatibilitas',
  'Open library': 'Buka perpustakaan',
  Disconnect: 'Putuskan',
  'Unsupported authentication mode': 'Mode autentikasi belum didukung',
  'Server uses BASIC_AUTH. This frontend does not support Basic login; no Basic form is shown.':
    'Server menggunakan BASIC_AUTH. Frontend ini belum mendukung login Basic; tidak ada form Basic yang ditampilkan.',
  'Server requires an authentication mode that this frontend cannot prove or support.':
    'Server memerlukan mode autentikasi yang belum dapat dibuktikan atau didukung frontend ini.',
  'Contact the server administrator or use a supported authentication configuration (NONE or UI_LOGIN).':
    'Hubungi administrator server atau gunakan konfigurasi autentikasi yang didukung (NONE atau UI_LOGIN).',
  'Back to connection form': 'Kembali ke form koneksi',
  'Library · Reader · Suwayomi Server':
    'Perpustakaan · Reader · Suwayomi Server',
  'A connection error occurred.': 'Terjadi kesalahan koneksi.',
  'Invalid server address. Check the URL format, including http:// or https://.':
    'Alamat server tidak valid. Periksa format URL, termasuk http:// atau https://.',
  'Server unreachable. Check the server address, network, and CORS configuration.':
    'Server tidak dapat dijangkau. Periksa alamat server, jaringan, dan konfigurasi CORS.',
  'Server version is older than the supported v2.4.2366 baseline.':
    'Versi server lebih lama dari baseline v2.4.2366 yang didukung.',
  'Server requires authentication, but the session is not valid.':
    'Server meminta autentikasi, tetapi sesi belum valid.',
  'Invalid username or password.': 'Username atau password tidak cocok.',
  'The server authentication mode is not supported by this frontend.':
    'Mode autentikasi server belum didukung frontend ini.',
  'The server returned an error that could not be processed.':
    'Server mengembalikan error yang tidak dapat diproses.',
  'This action cannot be performed in the current connection state.':
    'Tindakan ini tidak dapat dilakukan pada status koneksi saat ini.',
  'Connection stopped.': 'Koneksi sudah dihentikan.',
  'Server address is required.': 'Alamat server wajib diisi.',
  'Connection could not be started.': 'Koneksi tidak dapat dimulai.',
  'Username and password are required.': 'Username dan password wajib diisi.',
  'Login could not be processed.': 'Login tidak dapat diproses.',
});

const ERROR_TEXT: Partial<Record<ConnectionError['code'], string>> = {
  'invalid-server-url':
    'Invalid server address. Check the URL format, including http:// or https://.',
  unreachable:
    'Server unreachable. Check the server address, network, and CORS configuration.',
  'incompatible-server':
    'Server version is older than the supported v2.4.2366 baseline.',
  'authentication-required':
    'Server requires authentication, but the session is not valid.',
  'invalid-credentials': 'Invalid username or password.',
  'unsupported-auth':
    'The server authentication mode is not supported by this frontend.',
  'server-error': 'The server returned an error that could not be processed.',
  'invalid-state':
    'This action cannot be performed in the current connection state.',
  disposed: 'Connection stopped.',
};

function errorText(
  error: ConnectionError | undefined,
  t: (key: string) => string,
): string {
  if (!error) {
    return t('A connection error occurred.');
  }

  return t(ERROR_TEXT[error.code] ?? 'A connection error occurred.');
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
  const { t } = useI18n();
  const {
    state,
    connect,
    login,
    loginBasic,
    loginSimple,
    restoreSession,
    disconnect,
  } = useConnection();
  const [serverUrl, setServerUrl] = useState(() => getLastServerUrl());
  const [autoConnect, setAutoConnectState] = useState(() => getAutoConnect());
  const [rememberLogin, setRememberLogin] = useState(
    () => getRememberedSession() !== null,
  );
  const attemptedRestore = useRef(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [offlineCount, setOfflineCount] = useState(0);
  const serverInput = useRef<HTMLInputElement>(null);
  const usernameInput = useRef<HTMLInputElement>(null);
  const passwordInput = useRef<HTMLInputElement>(null);
  const connectedHeading = useRef<HTMLHeadingElement>(null);

  const loginErrorCode = state.status === 'login-required' ? state.error?.code : undefined;
  const lastServer = getLastServerUrl();

  useEffect(() => {
    setLocalError(null);
  }, [state.status]);

  useEffect(() => {
    if (!isOfflineStorageSupported()) {
      return;
    }

    void createOfflineStorage()
      .list()
      .then((records) => setOfflineCount(records.length))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (state.status === 'connected') {
      saveLastServerUrl(state.context.config.serverBaseUrl);

      const refreshToken = state.context.authService?.getRefreshToken();

      if (rememberLogin && refreshToken) {
        saveRememberedSession(state.context.config.serverBaseUrl, refreshToken);
      } else if (!rememberLogin) {
        clearRememberedSession();
      }
    } else if (state.status === 'login-required') {
      saveLastServerUrl(state.serverBaseUrl);
    }
  }, [rememberLogin, state]);

  useEffect(() => {
    if (state.status !== 'login-required' || attemptedRestore.current) {
      return;
    }

    if (state.authMode !== 'UNKNOWN' && state.authMode !== 'UI_LOGIN') {
      return;
    }

    attemptedRestore.current = true;
    const remembered = getRememberedSession();

    if (remembered && remembered.serverUrl === state.serverBaseUrl) {
      void restoreSession(remembered.refreshToken).catch(() => undefined);
    }
  }, [restoreSession, state]);

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
      setLocalError(t('Server address is required.'));
      serverInput.current?.focus();
      return;
    }

    setLocalError(null);
    void connect(value).catch(() => {
      setLocalError(t('Connection could not be started.'));
    });
  };

  const handleLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const user = username.trim();

    if (!user || !password) {
      setLocalError(t('Username and password are required.'));
      (user ? passwordInput : usernameInput).current?.focus();
      return;
    }

    const submittedPassword = password;
    setLocalError(null);
    setPassword('');
    const authMode =
      state.status === 'login-required' ? state.authMode : 'UI_LOGIN';
    const action =
      authMode === 'BASIC_AUTH'
        ? loginBasic
        : authMode === 'SIMPLE_LOGIN'
          ? loginSimple
          : login;

    void action(user, submittedPassword).catch(() => {
      setLocalError(t('Login could not be processed.'));
    });
  };

  const handleDisconnect = () => {
    setPassword('');
    setLocalError(null);
    attemptedRestore.current = false;
    clearRememberedSession();
    void disconnect();
  };

  const serverForm = (
    <form className="connection-form" onSubmit={handleConnect} noValidate>
      <div className="field">
        <label htmlFor="server-url">{t('Suwayomi server address')}</label>
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
          {t(
            'Enter the server address without the GraphQL path. Example: https://manga.example.com',
          )}
        </p>
        <label className="settings-inline-toggle">
          <input
            type="checkbox"
            checked={autoConnect}
            onChange={(event) => {
              setAutoConnectState(event.target.checked);
              setAutoConnect(event.target.checked);
            }}
          />
          {t('Reconnect automatically on this device')}
        </label>
      </div>

      {localError ? (
        <p className="alert alert-error" id="server-url-error" role="alert">
          {localError}
        </p>
      ) : null}

      <div className="actions">
        <button className="button" type="submit" disabled={state.status === 'connecting'}>
          {state.status === 'connecting' ? t('Connecting…') : t('Connect')}
        </button>
        {lastServer && lastServer !== serverUrl.trim() ? (
          <button
            className="button button-secondary"
            type="button"
            onClick={() => {
              setServerUrl(lastServer);
              void connect(lastServer).catch(() => {
                setLocalError(t('Connection could not be started.'));
              });
            }}
          >
            {t('Use last server')}
          </button>
        ) : null}
      </div>
    </form>
  );

  return (
    <div className="app-shell connection-shell">
      <header className="app-header">
        <p className="eyebrow">{t('Suwayomi · Library & Reader')}</p>
        <h1>Suwayomi</h1>
        <p className="lede">
          {t(
            'Connect to your server and continue reading from your Library.',
          )}
        </p>
        {offlineCount > 0 ? (
          <Link className="button button-secondary" to="/offline">
            {t('Offline downloads')} ({offlineCount})
          </Link>
        ) : null}
      </header>

      <main className="app-main">
        {state.status === 'disconnected' || state.status === 'failed' ? (
          <section className="panel" aria-labelledby="connection-heading">
            <p className="panel-kicker">{t('Connection')}</p>
            <h2 id="connection-heading">
              {state.status === 'failed'
                ? t('Connection failed')
                : t('Connect server')}
            </h2>

            {state.status === 'failed' ? (
              <p className="alert alert-error" role="alert">
                {errorText(state.error, t)}
              </p>
            ) : (
              <p className="panel-copy">
                {t(
                  'Enter the Suwayomi Server address reachable by this browser.',
                )}
              </p>
            )}

            {serverForm}
          </section>
        ) : null}

        {state.status === 'connecting' ? (
          <section className="panel" aria-labelledby="connecting-heading">
            <p className="panel-kicker">Connection</p>
            <h2 id="connecting-heading">{t('Connecting…')}</h2>
            <p className="status-line" role="status" aria-live="polite">
              {t('Checking {server} and server information.', {
                server: serverAddress(state, serverUrl),
              })}
            </p>
            <div className="actions">
              <button className="button button-secondary" type="button" onClick={handleDisconnect}>
                {t('Cancel')}
              </button>
            </div>
          </section>
        ) : null}

        {state.status === 'login-required' ? (
          <section className="panel" aria-labelledby="login-heading">
            <p className="panel-kicker">{state.authMode}</p>
            <h2 id="login-heading">
              {state.authMode === 'BASIC_AUTH'
                ? t('Basic authentication')
                : state.authMode === 'SIMPLE_LOGIN'
                  ? t('Server session login')
                  : t('Login required')}
            </h2>
            <p className="panel-copy">
              {state.authMode === 'BASIC_AUTH'
                ? t(
                    'Enter the HTTP Basic credentials configured on the server.',
                  )
                : state.authMode === 'SIMPLE_LOGIN'
                  ? t(
                      'Signs in to the server session so API and WebSocket requests share the same login.',
                    )
                  : t('Server {server} requires authentication.', {
                      server: state.serverBaseUrl,
                    })}
            </p>

            {state.error ? (
              <p className="alert alert-error" role="alert">
                {errorText(state.error, t)}
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

              {state.authMode === 'UNKNOWN' || state.authMode === 'UI_LOGIN' ? (
                <label className="settings-inline-toggle">
                  <input
                    type="checkbox"
                    checked={rememberLogin}
                    onChange={(event) => setRememberLogin(event.target.checked)}
                  />
                  {t('Remember login on this device')}
                </label>
              ) : null}

              {localError ? (
                <p className="alert alert-error" role="alert">
                  {localError}
                </p>
              ) : null}

              <div className="actions">
                <button className="button" type="submit">
                  {t('Login')}
                </button>
                <button className="button button-secondary" type="button" onClick={handleDisconnect}>
                  {t('Change server')}
                </button>
              </div>
            </form>
          </section>
        ) : null}

        {state.status === 'authenticating' ? (
          <section className="panel" aria-labelledby="authenticating-heading">
            <p className="panel-kicker">UI_LOGIN</p>
            <h2 id="authenticating-heading">{t('Verifying login…')}</h2>
            <p className="status-line" role="status" aria-live="polite">
              {t('Checking session and access to {server}.', {
                server: state.serverBaseUrl,
              })}
            </p>
          </section>
        ) : null}

        {state.status === 'connected' ? (
          <section className="panel" aria-labelledby="connected-heading">
            <div className="status-heading">
              <span className="status-dot" aria-hidden="true" />
              <div>
                <p className="panel-kicker">{t('Connected')}</p>
                <h2 id="connected-heading" ref={connectedHeading} tabIndex={-1}>
                  {state.context.serverInfo.name}
                </h2>
              </div>
            </div>

            <p className="panel-copy">
              {t(
                'The connection to Suwayomi Server is active. Library and Reader are available.',
              )}
            </p>

            {state.context.compatibility.status !== 'compatible' ? (
              <p className="alert alert-warning" role="status">
                {state.context.compatibility.warning ??
                  t('Server compatibility is not fully verified.')}
              </p>
            ) : null}

            <dl className="info-grid">
              <div className="info-item">
                <dt>{t('Server URL')}</dt>
                <dd className="breakable">{state.context.config.serverBaseUrl}</dd>
              </div>
              <div className="info-item">
                <dt>{t('Server')}</dt>
                <dd>{state.context.serverInfo.name}</dd>
              </div>
              <div className="info-item">
                <dt>{t('Version')}</dt>
                <dd>{state.context.serverInfo.version}</dd>
              </div>
              <div className="info-item">
                <dt>{t('Build type')}</dt>
                <dd>{state.context.serverInfo.buildType}</dd>
              </div>
              <div className="info-item">
                <dt>{t('Platform')}</dt>
                <dd>{platformLabel(state)}</dd>
              </div>
              <div className="info-item">
                <dt>{t('Architecture')}</dt>
                <dd>{state.context.serverInfo.platformInfo.arch}</dd>
              </div>
              <div className="info-item">
                <dt>{t('Auth mode')}</dt>
                <dd>{state.context.authMode}</dd>
              </div>
              <div className="info-item">
                <dt>{t('Compatibility')}</dt>
                <dd>{state.context.compatibility.status}</dd>
              </div>
            </dl>

            <div className="actions">
              <Link className="button" to="/library">
                {t('Open library')}
              </Link>
              <button className="button button-secondary" type="button" onClick={handleDisconnect}>
                {t('Disconnect')}
              </button>
            </div>
          </section>
        ) : null}

        {state.status === 'unsupported-auth' ? (
          <section className="panel" aria-labelledby="unsupported-heading">
            <p className="panel-kicker">Authentication</p>
            <h2 id="unsupported-heading">{t('Unsupported authentication mode')}</h2>
            <p className="alert alert-warning" role="alert">
              {t(
                'Server requires an authentication mode that this frontend cannot prove or support.',
              )}
            </p>
            <p className="panel-copy">
              {t(
                'Contact the server administrator or use a supported authentication configuration (NONE or UI_LOGIN).',
              )}
            </p>
            <div className="actions">
              <button className="button" type="button" onClick={handleDisconnect}>
                {t('Back to connection form')}
              </button>
            </div>
          </section>
        ) : null}
      </main>

      <footer className="app-footer">
        <p>{t('Library · Reader · Suwayomi Server')}</p>
      </footer>
    </div>
  );
}
