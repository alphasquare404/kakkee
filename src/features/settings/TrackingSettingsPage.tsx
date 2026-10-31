import {
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type FormEvent,
} from 'react';
import { Link } from 'react-router-dom';
import { useConnection } from '../../app/useConnection';
import type { ConnectedContext } from '../../core/server/connectionCoordinator';
import { createTrackingController } from '../../core/tracking/trackingController';
import {
  createTrackingRepository,
  type Tracker,
} from '../../core/tracking/trackingRepository';
import { useImageResource } from '../../shared/useImageResource';
import { useTrackingPreferences } from '../../shared/useTrackingPreferences';
import { setAutoSyncTracking } from '../../core/preferences/trackingPreferences';
import { PageHeader } from '../../shared/PageHeader';

export function TrackingSettingsPage() {
  const { state } = useConnection();

  if (state.status !== 'connected') {
    return null;
  }

  return <TrackingContent context={state.context} />;
}

function TrackingContent({ context }: { readonly context: ConnectedContext }) {
  const controller = useMemo(() => {
    const repository = createTrackingRepository({
      getClient: () => context.graphQL,
    });

    return createTrackingController(repository);
  }, [context.graphQL]);
  const tracking = useSyncExternalStore(controller.subscribe, controller.getState);
  const preferences = useTrackingPreferences();

  useEffect(() => {
    void controller.load();
  }, [controller]);

  const loggedIn = tracking.items.filter((tracker) => tracker.isLoggedIn);

  return (
    <div className="app-shell page-shell settings-shell">
      <PageHeader
        title="Tracking"
        subtitle="Services linked to your reading progress"
        count={
          tracking.status === 'ready'
            ? `${loggedIn.length} of ${tracking.items.length} logged in`
            : undefined
        }
      >
        <Link className="button button-secondary" to="/settings">
          All settings
        </Link>
      </PageHeader>

      {tracking.error ? (
        <p className="settings-inline-error" role="alert">
          The last tracking change was rejected by the server.
        </p>
      ) : null}

      {tracking.status === 'loading' && tracking.items.length === 0 ? (
        <p className="settings-save-state" role="status">
          Loading tracking services…
        </p>
      ) : null}

      {tracking.status === 'error' ? (
        <div className="library-state" role="alert">
          <h1>Couldn&apos;t load tracking services</h1>
          <button className="button" type="button" onClick={() => void controller.load()}>
            Retry
          </button>
        </div>
      ) : null}

      {tracking.status === 'ready' && tracking.items.length === 0 ? (
        <div className="library-state">
          <h1>No tracking services</h1>
          <p>Install tracker support on your server to link a service.</p>
        </div>
      ) : null}

      {tracking.items.length > 0 ? (
        <div className="settings-group">
          <div className="settings-group-heading">
            <h2>Behaviour</h2>
          </div>
          <label className="settings-inline-toggle">
            <input
              type="checkbox"
              checked={preferences.autoSync}
              onChange={(event) => setAutoSyncTracking(event.target.checked)}
            />
            Sync tracker progress after finishing a chapter in the Reader
          </label>
        </div>
      ) : null}

      {tracking.items.length > 0 ? (
        <div className="tracker-list">
          {tracking.items.map((tracker) => (
            <TrackerCard
              key={tracker.id}
              tracker={tracker}
              resources={context.resources}
              busy={tracking.busyId === tracker.id}
              onLogin={(username, password) =>
                void controller.loginCredentials(
                  tracker.id,
                  username,
                  password,
                )
              }
              onLogout={() => void controller.logout(tracker.id)}
            />
          ))}
        </div>
      ) : null}

      <p className="settings-save-state">
        OAuth login opens the tracker authorization page. Per-manga binding is
        available on each Manga Detail page.
      </p>
    </div>
  );
}

function TrackerCard({
  tracker,
  resources,
  busy,
  onLogin,
  onLogout,
}: {
  readonly tracker: Tracker;
  readonly resources: ConnectedContext['resources'];
  readonly busy: boolean;
  readonly onLogin: (username: string, password: string) => void;
  readonly onLogout: () => void;
}) {
  const icon = useImageResource(resources, tracker.icon.startsWith('http') ? tracker.icon : null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [credentialsOpen, setCredentialsOpen] = useState(false);

  const submitCredentials = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!username.trim() || !password) {
      return;
    }

    onLogin(username.trim(), password);
    setPassword('');
  };

  return (
    <article className="tracker-card">
      <span className="tracker-icon" aria-hidden="true">
        {icon.objectUrl ? (
          <img src={icon.objectUrl} alt="" />
        ) : (
          tracker.name.charAt(0).toUpperCase()
        )}
      </span>
      <div className="tracker-copy">
        <h2>{tracker.name}</h2>
        <p>
          {tracker.isLoggedIn ? 'Connected' : 'Not connected'}
          {tracker.isTokenExpired ? ' · Token expired' : ''}
        </p>
        <div className="tracker-badges">
          {tracker.supportsPrivateTracking ? <span>Private entries</span> : null}
          {tracker.supportsReadingDates ? <span>Reading dates</span> : null}
          {tracker.supportsTrackDeletion ? <span>Delete entries</span> : null}
        </div>
      </div>
      {tracker.isLoggedIn ? (
        <button
          className="button button-secondary"
          type="button"
          disabled={busy}
          onClick={onLogout}
        >
          {busy ? 'Working…' : 'Logout'}
        </button>
      ) : tracker.authUrl ? (
        <a
          className="button"
          href={tracker.authUrl}
          target="_blank"
          rel="noreferrer"
        >
          Login
        </a>
      ) : (
        <span className="settings-save-state">Login unavailable</span>
      )}
      {!tracker.isLoggedIn ? (
        <details
          className="tracker-credentials"
          open={credentialsOpen}
          onToggle={(event) =>
            setCredentialsOpen(event.currentTarget.open)
          }
        >
          <summary>Use username/password</summary>
          <form onSubmit={submitCredentials}>
            <input
              aria-label={`${tracker.name} username`}
              placeholder="Username"
              value={username}
              autoComplete="username"
              onChange={(event) => setUsername(event.target.value)}
            />
            <input
              aria-label={`${tracker.name} password`}
              type="password"
              placeholder="Password"
              value={password}
              autoComplete="current-password"
              onChange={(event) => setPassword(event.target.value)}
            />
            <button
              className="button button-secondary"
              type="submit"
              disabled={busy || !username.trim() || !password}
            >
              {busy ? 'Connecting…' : 'Connect'}
            </button>
          </form>
        </details>
      ) : null}
    </article>
  );
}
