import { useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { Link } from 'react-router-dom';
import { useConnection } from '../../app/useConnection';
import type { ConnectedContext } from '../../core/server/connectionCoordinator';
import {
  AboutPageDocument,
  ServerUpdateCheckDocument,
  type ServerUpdateCheckQuery,
} from '../../core/graphql/generated/graphql';
import { PageHeader } from '../../shared/PageHeader';

export function AboutPage() {
  const { state } = useConnection();

  if (state.status !== 'connected') {
    return null;
  }

  return <AboutContent context={state.context} />;
}

function AboutContent({ context }: { readonly context: ConnectedContext }) {
  const about = useQuery(AboutPageDocument, { fetchPolicy: 'cache-and-network' });
  const [updates, setUpdates] = useState<
    ServerUpdateCheckQuery['checkForServerUpdates'] | null
  >(null);
  const [checking, setChecking] = useState(false);
  const [checkError, setCheckError] = useState(false);

  const checkServer = () => {
    setChecking(true);
    setCheckError(false);
    void context.graphQL
      .query({ query: ServerUpdateCheckDocument, fetchPolicy: 'network-only' })
      .then((result) => setUpdates(result.data?.checkForServerUpdates ?? []))
      .catch(() => setCheckError(true))
      .finally(() => setChecking(false));
  };

  return (
    <div className="app-shell page-shell settings-shell">
      <PageHeader title="About" subtitle="Server and WebUI build information">
        <Link className="button button-secondary" to="/settings">
          All settings
        </Link>
      </PageHeader>

      <div className="settings-content">
        <section className="settings-section" aria-labelledby="about-server">
          <div className="section-heading-row">
            <h2 id="about-server">Suwayomi Server</h2>
          </div>
          {about.loading && !about.data ? (
            <p className="settings-save-state">Loading build information…</p>
          ) : null}
          {about.error ? (
            <p className="settings-inline-error" role="alert">
              Could not load About information.
            </p>
          ) : null}
          {about.data ? (
            <dl className="settings-rows">
              <div>
                <dt>Name</dt>
                <dd>{about.data.aboutServer.name}</dd>
              </div>
              <div>
                <dt>Version</dt>
                <dd>
                  {about.data.aboutServer.version} · {about.data.aboutServer.buildType}
                </dd>
              </div>
              <div>
                <dt>Build time</dt>
                <dd>{about.data.aboutServer.buildTime}</dd>
              </div>
              <div>
                <dt>WebUI channel</dt>
                <dd>{about.data.aboutWebUI.channel}</dd>
              </div>
              <div>
                <dt>WebUI tag</dt>
                <dd>{about.data.aboutWebUI.tag}</dd>
              </div>
              <div>
                <dt>WebUI checked</dt>
                <dd>{about.data.aboutWebUI.updateTimestamp}</dd>
              </div>
            </dl>
          ) : null}
        </section>

        <section className="settings-section" aria-labelledby="about-updates">
          <div className="section-heading-row">
            <h2 id="about-updates">Updates</h2>
          </div>
          <dl className="settings-rows">
            <div>
              <dt>WebUI update</dt>
              <dd>
                {about.data?.checkForWebUIUpdate.updateAvailable
                  ? `${about.data.checkForWebUIUpdate.tag} available`
                  : 'No newer WebUI build reported'}
              </dd>
            </div>
          </dl>
          <div className="settings-actions">
            <button
              className="button"
              type="button"
              disabled={checking}
              onClick={checkServer}
            >
              {checking ? 'Checking…' : 'Check server updates'}
            </button>
          </div>
          {checkError ? (
            <p className="settings-inline-error" role="alert">
              Server update check failed.
            </p>
          ) : null}
          {updates ? (
            updates.length > 0 ? (
              <dl className="settings-rows" aria-label="Server updates">
                {updates.map((update) => (
                  <div key={`${update.channel}-${update.tag}`}>
                    <dt>{update.channel}</dt>
                    <dd>
                      <a
                        className="settings-endpoint"
                        href={update.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {update.tag}
                      </a>
                    </dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="settings-save-state">No server updates reported.</p>
            )
          ) : null}
        </section>
      </div>
    </div>
  );
}
