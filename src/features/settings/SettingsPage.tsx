import { Link, useNavigate } from 'react-router-dom';
import { useConnection } from '../../app/useConnection';
import type { ConnectedContext } from '../../core/server/connectionCoordinator';
import { PageHeader } from '../../shared/PageHeader';

export function SettingsPage() {
  const { state } = useConnection();

  if (state.status !== 'connected') {
    return null;
  }

  return <SettingsContent context={state.context} />;
}

function SettingsContent({ context }: { readonly context: ConnectedContext }) {
  const { disconnect } = useConnection();
  const navigate = useNavigate();

  return (
    <div className="app-shell page-shell settings-shell">
      <PageHeader
        title="Settings"
        subtitle="Application and server information"
      />

      <div className="settings-layout">
        <nav className="settings-nav" aria-label="Settings sections">
          <a className="is-active" href="#connection">Connection</a>
          <a href="#appearance">Appearance</a>
          <a href="#reading">Reading</a>
          <a href="#about">About</a>
        </nav>

        <div className="settings-content">
          <section className="settings-section" id="connection" aria-labelledby="settings-connection">
            <div className="section-heading-row">
              <h2 id="settings-connection">Connection</h2>
              <span className="settings-badge">Connected</span>
            </div>
            <dl className="settings-rows">
              <div>
                <dt>Server</dt>
                <dd>{context.serverInfo.name}</dd>
              </div>
              <div>
                <dt>Version</dt>
                <dd>{context.serverInfo.version} · {context.serverInfo.buildType}</dd>
              </div>
              <div>
                <dt>Endpoint</dt>
                <dd className="settings-endpoint">{context.config.serverBaseUrl}</dd>
              </div>
              <div>
                <dt>Authentication</dt>
                <dd>{context.authMode === 'NONE' ? 'No authentication' : 'UI login'}</dd>
              </div>
              <div>
                <dt>Compatibility</dt>
                <dd>
                  {context.compatibility.status === 'compatible'
                    ? `Stable baseline ${context.compatibility.baseline}`
                    : context.compatibility.warning ?? context.compatibility.status}
                </dd>
              </div>
            </dl>
            <div className="settings-actions">
              <Link className="button button-secondary" to="/settings/server">
                Server settings
              </Link>
              <button
                className="button button-secondary"
                type="button"
                onClick={() => {
                  void disconnect().then(() => navigate('/', { replace: true }));
                }}
              >
                Disconnect server
              </button>
            </div>
          </section>

          <section className="settings-section" id="appearance" aria-labelledby="settings-appearance">
            <div className="section-heading-row">
              <h2 id="settings-appearance">Appearance</h2>
            </div>
            <dl className="settings-rows">
              <div>
                <dt>Theme</dt>
                <dd>Cinematic dark</dd>
              </div>
              <div>
                <dt>Accent</dt>
                <dd>
                  <span className="settings-swatch" aria-hidden="true" />
                  Blue-violet
                </dd>
              </div>
              <div>
                <dt>Layout</dt>
                <dd>Responsive with desktop navigation and mobile tab bar</dd>
              </div>
            </dl>
            <div className="settings-actions">
              <Link className="button button-secondary" to="/settings/appearance">
                Appearance settings
              </Link>
            </div>
          </section>

          <section className="settings-section" id="library" aria-labelledby="settings-library">
            <div className="section-heading-row">
              <h2 id="settings-library">Library</h2>
            </div>
            <dl className="settings-rows">
              <div>
                <dt>Grid density</dt>
                <dd>Compact or comfortable poster grid</dd>
              </div>
              <div>
                <dt>Selection</dt>
                <dd>Bulk category assignment and library removal</dd>
              </div>
            </dl>
            <div className="settings-actions">
              <Link className="button button-secondary" to="/settings/library">
                Library settings
              </Link>
            </div>
          </section>

          <section className="settings-section" id="reading" aria-labelledby="settings-reading">
            <div className="section-heading-row">
              <h2 id="settings-reading">Reading</h2>
            </div>
            <dl className="settings-rows">
              <div>
                <dt>Reader mode</dt>
                <dd>Vertical continuous</dd>
              </div>
              <div>
                <dt>Page loading</dt>
                <dd>Lazy, authenticated through ResourceService</dd>
              </div>
              <div>
                <dt>Progress sync</dt>
                <dd>Last page and read state are written when you read</dd>
              </div>
            </dl>
            <div className="settings-actions">
              <Link className="button button-secondary" to="/settings/reader">
                Reader settings
              </Link>
            </div>
          </section>

          <section className="settings-section" id="about" aria-labelledby="settings-about">
            <div className="section-heading-row">
              <h2 id="settings-about">About</h2>
            </div>
            <dl className="settings-rows">
              <div>
                <dt>Application</dt>
                <dd>Suwayomi React Frontend</dd>
              </div>
              <div>
                <dt>API baseline</dt>
                <dd>Suwayomi Server stable v2.4.2366</dd>
              </div>
              <div>
                <dt>Server platform</dt>
                <dd>
                  {context.serverInfo.platformInfo.os.name} ·{' '}
                  {context.serverInfo.platformInfo.jvm.javaVersion}
                </dd>
              </div>
            </dl>
          </section>
        </div>
      </div>
    </div>
  );
}
