import { useEffect, useMemo, useSyncExternalStore } from 'react';
import { useParams } from 'react-router-dom';
import { useConnection } from '../../app/useConnection';
import type { ConnectedContext } from '../../core/server/connectionCoordinator';
import { createExtensionController } from '../../core/extensions/extensionController';
import { createExtensionRepository, type Extension } from '../../core/extensions/extensionRepository';
import { useImageResource } from '../../shared/useImageResource';
import { BackButton } from '../../shared/BackButton';
import { PageHeader } from '../../shared/PageHeader';
import { useI18n } from '../../shared/useI18n';
import { registerMessages } from '../../shared/i18n';

registerMessages('id', {
  Extension: 'Ekstensi',
  'Extension not found': 'Ekstensi tidak ditemukan',
  'Back to extensions': 'Kembali ke ekstensi',
  Version: 'Versi',
  Language: 'Bahasa',
  Store: 'Toko',
  Unknown: 'Tidak diketahui',
  Status: 'Status',
  Installed: 'Terpasang',
  Available: 'Tersedia',
  'Update available': 'Update tersedia',
  Obsolete: 'Usang',
  'Content warning': 'Peringatan konten',
  Install: 'Pasang',
  Update: 'Update',
  Uninstall: 'Copot',
  'Working…': 'Memproses…',
});

export function ExtensionDetailPage() {
  const { state } = useConnection();

  if (state.status !== 'connected') {
    return null;
  }

  return <ExtensionDetailContent context={state.context} />;
}

function ExtensionDetailContent({ context }: { readonly context: ConnectedContext }) {
  const { t } = useI18n();
  const { pkgName = '' } = useParams();
  const controller = useMemo(
    () =>
      createExtensionController(
        createExtensionRepository({ getClient: () => context.graphQL }),
      ),
    [context.graphQL],
  );
  const extensions = useSyncExternalStore(
    controller.subscribe,
    controller.getState,
  );
  const extension = extensions.items.find((item) => item.pkgName === pkgName);

  useEffect(() => {
    void controller.load();
  }, [controller]);

  if (extensions.status === 'loading' && !extension) {
    return (
      <div className="app-shell page-shell extensions-shell">
        <p className="settings-save-state" role="status">
          Loading extension…
        </p>
      </div>
    );
  }

  if (!extension) {
    return (
      <div className="app-shell page-shell extensions-shell">
        <PageHeader
          title={t('Extension')}
          subtitle={pkgName}
          leading={<BackButton to="/extensions" label={t('Back to extensions')} />}
        />
        <div className="library-state">
          <h1>{t('Extension not found')}</h1>
        </div>
      </div>
    );
  }

  return (
    <ExtensionDetail
      extension={extension}
      context={context}
      busy={extensions.busyPkg === extension.pkgName}
      onAction={(action) => {
        void controller.update(
          extension.pkgName,
          action === 'update'
            ? { update: true }
            : action === 'uninstall'
              ? { uninstall: true }
              : { install: true },
        );
      }}
    />
  );
}

function ExtensionDetail({
  extension,
  context,
  busy,
  onAction,
}: {
  readonly extension: Extension;
  readonly context: ConnectedContext;
  readonly busy: boolean;
  readonly onAction: (action: 'install' | 'update' | 'uninstall') => void;
}) {
  const { t } = useI18n();
  const icon = useImageResource(context.resources, extension.iconUrl);
  const action = !extension.isInstalled
    ? 'install'
    : extension.hasUpdate
      ? 'update'
      : 'uninstall';

  return (
    <div className="app-shell page-shell extensions-shell">
      <PageHeader
        title={extension.name}
        subtitle={extension.pkgName}
        leading={<BackButton to="/extensions" label={t('Back to extensions')} />}
      />

      <article className="extension-detail-card">
        <span className="extension-detail-icon" aria-hidden="true">
          {icon.objectUrl ? (
            <img src={icon.objectUrl} alt="" />
          ) : (
            extension.name.charAt(0)
          )}
        </span>
        <dl className="settings-rows">
          <div>
            <dt>{t('Version')}</dt>
            <dd>{extension.versionName}</dd>
          </div>
          <div>
            <dt>{t('Language')}</dt>
            <dd>{extension.lang.toUpperCase()}</dd>
          </div>
          <div>
            <dt>{t('Store')}</dt>
            <dd>{extension.extensionStore?.name ?? t('Unknown')}</dd>
          </div>
          <div>
            <dt>{t('Status')}</dt>
            <dd>
              {extension.isInstalled ? t('Installed') : t('Available')}
              {extension.hasUpdate ? ' · Update available' : ''}
              {extension.isObsolete ? ' · Obsolete' : ''}
            </dd>
          </div>
          <div>
            <dt>{t('Content warning')}</dt>
            <dd>{extension.contentWarning}</dd>
          </div>
        </dl>
        <div className="actions">
          <button
            className="button"
            type="button"
            disabled={busy}
            onClick={() => onAction(action)}
          >
            {busy
              ? 'Working…'
              : action === 'install'
                ? t('Install')
                : action === 'update'
                  ? t('Update')
                  : t('Uninstall')}
          </button>
        </div>
      </article>
    </div>
  );
}
