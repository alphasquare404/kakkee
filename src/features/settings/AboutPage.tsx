import { useEffect, useState } from 'react';
import { useConnection } from '../../app/useConnection';
import type { ConnectedContext } from '../../core/server/connectionCoordinator';
import {
  AboutPageDocument,
  ServerUpdateCheckDocument,
  UpdateWebUiDocument,
  WebUiUpdateStatusChangeDocument,
  type AboutPageQuery,
  type ServerUpdateCheckQuery,
  type WebUiUpdateStatusChangeSubscription,
} from '../../core/graphql/generated/graphql';
import { PageHeader } from '../../shared/PageHeader';
import { useI18n } from '../../shared/useI18n';
import { registerMessages } from '../../shared/i18n';
import { BackButton } from '../../shared/BackButton';

registerMessages('id', {
  About: 'Tentang',
  'Server and WebUI build information':
    'Informasi build server dan WebUI',
  'All settings': 'Semua pengaturan',
  'Suwayomi Server': 'Suwayomi Server',
  'Could not load About information.':
    'Tidak dapat memuat informasi Tentang.',
  Name: 'Nama',
  Version: 'Versi',
  'Build time': 'Waktu build',
  'WebUI channel': 'Kanal WebUI',
  'WebUI tag': 'Tag WebUI',
  'WebUI checked': 'WebUI diperiksa',
  Updates: 'Update',
  'WebUI update': 'Update WebUI',
  '{tag} available': '{tag} tersedia',
  'No newer WebUI build reported': 'Tidak ada build WebUI baru',
  'Update WebUI': 'Perbarui WebUI',
  'Check server updates': 'Periksa update server',
  State: 'Status',
  Progress: 'Progres',
  Target: 'Target',
  'WebUI update could not be started.':
    'Update WebUI tidak dapat dimulai.',
  'Server update check failed.':
    'Pemeriksaan update server gagal.',
  'No server updates reported.': 'Tidak ada update server.',
});

type WebUIUpdateStatus =
  WebUiUpdateStatusChangeSubscription['webUIUpdateStatusChange'];

export function AboutPage() {
  const { state } = useConnection();

  if (state.status !== 'connected') {
    return null;
  }

  return <AboutContent context={state.context} />;
}

function AboutContent({ context }: { readonly context: ConnectedContext }) {
  const { t } = useI18n();
  const [about, setAbout] = useState<AboutPageQuery | null>(null);
  const [aboutLoading, setAboutLoading] = useState(true);
  const [aboutError, setAboutError] = useState(false);
  const [updates, setUpdates] = useState<
    ServerUpdateCheckQuery['checkForServerUpdates'] | null
  >(null);
  const [checking, setChecking] = useState(false);
  const [checkError, setCheckError] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<WebUIUpdateStatus | null>(
    null,
  );
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState(false);

  useEffect(() => {
    let active = true;

    void context.graphQL
      .query({ query: AboutPageDocument, fetchPolicy: 'network-only' })
      .then((result) => {
        if (active && result.data) {
          setAbout(result.data);
        }
      })
      .catch(() => {
        if (active) {
          setAboutError(true);
        }
      })
      .finally(() => {
        if (active) {
          setAboutLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [context.graphQL]);

  useEffect(() => {
    if (typeof context.graphQL.subscribe !== 'function') {
      return;
    }

    const subscription = context.graphQL
      .subscribe({ query: WebUiUpdateStatusChangeDocument })
      .subscribe({
        next: (result) => {
          if (result.data?.webUIUpdateStatusChange) {
            setUpdateStatus(result.data.webUIUpdateStatusChange);
          }
        },
        error: () => undefined,
      });

    return () => subscription.unsubscribe();
  }, [context.graphQL]);

  const startUpdate = () => {
    setUpdating(true);
    setUpdateError(false);
    void context.graphQL
      .mutate({ mutation: UpdateWebUiDocument })
      .then((result) => {
        if (result.data?.updateWebUI?.updateStatus) {
          setUpdateStatus(result.data.updateWebUI.updateStatus);
        }
      })
      .catch(() => setUpdateError(true))
      .finally(() => setUpdating(false));
  };

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
      <PageHeader
        title={t('About')}
        subtitle={t('Server and WebUI build information')}
        leading={<BackButton to="/settings" label={t('Back')} />}
      />

      <div className="settings-content">
        <section className="settings-section" aria-labelledby="about-server">
          <div className="section-heading-row">
            <h2 id="about-server">Suwayomi Server</h2>
          </div>
          {aboutLoading && !about ? (
            <p className="settings-save-state">Loading build information…</p>
          ) : null}
          {aboutError ? (
            <p className="settings-inline-error" role="alert">
              {t('Could not load About information.')}
            </p>
          ) : null}
          {about ? (
            <dl className="settings-rows">
              <div>
                <dt>{t('Name')}</dt>
                <dd>{about.aboutServer.name}</dd>
              </div>
              <div>
                <dt>{t('Version')}</dt>
                <dd>
                  {about.aboutServer.version} · {about.aboutServer.buildType}
                </dd>
              </div>
              <div>
                <dt>{t('Build time')}</dt>
                <dd>{about.aboutServer.buildTime}</dd>
              </div>
              <div>
                <dt>{t('WebUI channel')}</dt>
                <dd>{about.aboutWebUI.channel}</dd>
              </div>
              <div>
                <dt>{t('WebUI tag')}</dt>
                <dd>{about.aboutWebUI.tag}</dd>
              </div>
              <div>
                <dt>{t('WebUI checked')}</dt>
                <dd>{about.aboutWebUI.updateTimestamp}</dd>
              </div>
            </dl>
          ) : null}
        </section>

        <section className="settings-section" aria-labelledby="about-updates">
          <div className="section-heading-row">
            <h2 id="about-updates">{t('Updates')}</h2>
          </div>
          <dl className="settings-rows">
            <div>
              <dt>{t('WebUI update')}</dt>
              <dd>
                {about?.checkForWebUIUpdate.updateAvailable
                  ? t('{tag} available', {
                      tag: about.checkForWebUIUpdate.tag,
                    })
                  : t('No newer WebUI build reported')}
              </dd>
            </div>
          </dl>
          <div className="settings-actions">
            {about?.checkForWebUIUpdate.updateAvailable ? (
              <button
                className="button"
                type="button"
                disabled={updating}
                onClick={startUpdate}
              >
                {updating ? 'Starting update…' : 'Update WebUI'}
              </button>
            ) : null}
            <button
              className="button button-secondary"
              type="button"
              disabled={checking}
              onClick={checkServer}
            >
              {checking ? 'Checking…' : 'Check server updates'}
            </button>
          </div>
          {updateStatus ? (
            <dl className="settings-rows" aria-label="WebUI update status">
              <div>
                <dt>{t('State')}</dt>
                <dd>{updateStatus.state}</dd>
              </div>
              <div>
                <dt>{t('Progress')}</dt>
                <dd>{updateStatus.progress}%</dd>
              </div>
              <div>
                <dt>{t('Target')}</dt>
                <dd>
                  {updateStatus.info.channel} · {updateStatus.info.tag}
                </dd>
              </div>
            </dl>
          ) : null}
          {updateError ? (
            <p className="settings-inline-error" role="alert">
              {t('WebUI update could not be started.')}
            </p>
          ) : null}
          {checkError ? (
            <p className="settings-inline-error" role="alert">
              {t('Server update check failed.')}
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
              <p className="settings-save-state">{t('No server updates reported.')}</p>
            )
          ) : null}
        </section>
      </div>
    </div>
  );
}
