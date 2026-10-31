import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { Link } from 'react-router-dom';
import { useConnection } from '../../app/useConnection';
import type { ConnectedContext } from '../../core/server/connectionCoordinator';
import {
  createExtensionController,
} from '../../core/extensions/extensionController';
import {
  createExtensionRepository,
  type Extension,
} from '../../core/extensions/extensionRepository';
import { useImageResource } from '../../shared/useImageResource';
import { PageHeader } from '../../shared/PageHeader';
import { useI18n } from '../../shared/useI18n';
import { registerMessages } from '../../shared/i18n';

registerMessages('id', {
  Extensions: 'Ekstensi',
  'Sources installed through your server':
    'Source yang terpasang melalui server Anda',
  '{count} extensions': '{count} ekstensi',
  'Checkingâ€¦': 'Memeriksaâ€¦',
  'Check for updates': 'Periksa update',
  'The last extension change was rejected by the server.':
    'Perubahan ekstensi terakhir ditolak server.',
  'Search extensions': 'Cari ekstensi',
  Language: 'Bahasa',
  'All languages': 'Semua bahasa',
  'Search by name or packageâ€¦': 'Cari berdasarkan nama atau paketâ€¦',
  'Updates only': 'Hanya update',
  'Couldnâ€™t load extensions': 'Tidak dapat memuat ekstensi',
  'The extension catalog could not be loaded.':
    'Katalog ekstensi tidak dapat dimuat.',
  Retry: 'Coba lagi',
  'No extensions': 'Belum ada ekstensi',
  'Add an extension store or install an extension on the server.':
    'Tambahkan toko ekstensi atau pasang ekstensi di server.',
  'Updates available': 'Update tersedia',
  Installed: 'Terpasang',
  Available: 'Tersedia',
  Stores: 'Toko',
  Working: 'Memproses',
  Remove: 'Hapus',
  'Add store': 'Tambah toko',
  'Install external JAR': 'Pasang JAR eksternal',
  'Install JAR': 'Pasang JAR',
  'Installingâ€¦': 'Memasangâ€¦',
  'Extension store index URL': 'URL indeks toko ekstensi',
  Obsolete: 'Usang',
  Update: 'Update',
  Install: 'Pasang',
  Uninstall: 'Copot',
});

export function ExtensionsPage() {
  const { state } = useConnection();

  if (state.status !== 'connected') {
    return null;
  }

  return <ExtensionsContent context={state.context} />;
}

function ExtensionsContent({ context }: { readonly context: ConnectedContext }) {
  const { t } = useI18n();
  const controller = useMemo(() => {
    const repository = createExtensionRepository({
      getClient: () => context.graphQL,
      getGraphqlUrl: () => context.config.graphqlHttpUrl,
      getAccessToken: () => context.authService?.getAccessToken() ?? null,
    });

    return createExtensionController(repository);
  }, [context.authService, context.config.graphqlHttpUrl, context.graphQL]);
  const extensions = useSyncExternalStore(
    controller.subscribe,
    controller.getState,
  );
  const [language, setLanguage] = useState('all');
  const [query, setQuery] = useState('');
  const [storeUrl, setStoreUrl] = useState('');
  const [jarFile, setJarFile] = useState<File | null>(null);

  useEffect(() => {
    void controller.load();
  }, [controller]);

  const languages = [
    'all',
    ...[...new Set(extensions.items.map((item) => item.lang))].sort(),
  ];
  const items = (
    language === 'all'
      ? extensions.items
      : extensions.items.filter((item) => item.lang === language)
  ).filter((item) => {
    const value = query.trim().toLowerCase();

    if (
      value &&
      !`${item.name} ${item.pkgName}`.toLowerCase().includes(value)
    ) {
      return false;
    }

    return true;
  });
  const installed = items.filter((item) => item.isInstalled && !item.hasUpdate);
  const available = items.filter((item) => !item.isInstalled);
  const updates = items.filter((item) => item.isInstalled && item.hasUpdate);

  return (
    <div className="app-shell page-shell extensions-shell">
      <PageHeader
        title={t('Extensions')}
        subtitle={t('Sources installed through your server')}
        count={
          extensions.status === 'ready'
            ? t('{count} extensions', {
                count: extensions.items.length,
              })
            : undefined
        }
      >
        <button
          className="button button-secondary"
          type="button"
          disabled={extensions.refreshing}
          onClick={() => void controller.refresh()}
        >
          {extensions.refreshing ? 'Checkingâ€¦' : 'Check for updates'}
        </button>
      </PageHeader>

      {extensions.actionError ? (
        <p className="settings-inline-error" role="alert">
          {t('The last extension change was rejected by the server.')}
        </p>
      ) : null}

      <div className="browse-filters" role="group" aria-label="Filter extensions by language">
        <label className="browse-language-select">
          <span>{t('Language')}</span>
          <select
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
            aria-label="Filter extensions by language"
          >
            {languages.map((lang) => (
              <option key={lang} value={lang}>
                {lang === 'all' ? t('All languages') : lang.toUpperCase()}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="extension-filter-row">
        <input
          type="search"
          aria-label="Search extensions"
          placeholder="Search by name or packageâ€¦"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      {extensions.status === 'loading' && extensions.items.length === 0 ? (
        <div className="extension-list" aria-hidden="true">
          {Array.from({ length: 6 }, (_, index) => (
            <div className="extension-card extension-skeleton" key={index} />
          ))}
        </div>
      ) : null}

      {extensions.status === 'error' ? (
        <div className="library-state" role="alert">
          <h1>{t('Couldnâ€™t load extensions')}</h1>
          <p>{t('The extension catalog could not be loaded.')}</p>
          <button className="button" type="button" onClick={() => void controller.load()}>
            {t('Retry')}
          </button>
        </div>
      ) : null}

      {extensions.status === 'ready' && items.length === 0 ? (
        <div className="library-state">
          <h1>{t('No extensions')}</h1>
          <p>{t('Add an extension store or install an extension on the server.')}</p>
          <div className="actions">
            <a className="button button-secondary" href="#extension-add-store">
              {t('Add store')}
            </a>
          </div>
        </div>
      ) : null}

      {updates.length > 0 ? (
        <ExtensionSection
          title={t('Updates available')}
          extensions={updates}
          resources={context.resources}
          busyPkg={extensions.busyPkg}
          onAction={(extension, action) => {
            void controller.update(
              extension.pkgName,
              action === 'update' ? { update: true } : { uninstall: true },
            );
          }}
        />
      ) : null}

      {installed.length > 0 ? (
        <ExtensionSection
          title={t('Installed')}
          extensions={installed}
          resources={context.resources}
          busyPkg={extensions.busyPkg}
          onAction={(extension, action) => {
            void controller.update(
              extension.pkgName,
              action === 'update' ? { update: true } : { uninstall: true },
            );
          }}
        />
      ) : null}

      {available.length > 0 ? (
        <ExtensionSection
          title={t('Available')}
          extensions={available}
          resources={context.resources}
          busyPkg={extensions.busyPkg}
          onAction={(extension) => {
            void controller.update(extension.pkgName, { install: true });
          }}
        />
      ) : null}

      {extensions.stores.length > 0 ? (
        <section className="extension-section" aria-labelledby="extension-stores">
          <div className="section-heading-row">
            <h2 id="extension-stores">{t('Stores')}</h2>
          </div>
          <ul className="extension-stores">
            {extensions.stores.map((store) => (
              <li key={store.indexUrl}>
                <strong>{store.name}</strong>
                <span>{store.badgeLabel}</span>
                <button
                  className="library-action is-danger"
                  type="button"
                  disabled={extensions.storeBusy === store.indexUrl}
                  onClick={() => void controller.removeStore(store.indexUrl)}
                >
                  {extensions.storeBusy === store.indexUrl ? 'Workingâ€¦' : 'Remove'}
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="extension-section" aria-labelledby="extension-add-store">
        <div className="section-heading-row">
          <h2 id="extension-add-store">{t('Add store')}</h2>
        </div>
        <form
          className="source-search"
          onSubmit={(event) => {
            event.preventDefault();
            const url = storeUrl.trim();

            if (url) {
              void controller.addStore(url).then(() => setStoreUrl(''));
            }
          }}
        >
          <input
            type="url"
            aria-label="Extension store index URL"
            placeholder="https://example.test/index.min.json"
            value={storeUrl}
            onChange={(event) => setStoreUrl(event.target.value)}
          />
          <button
            className="button"
            type="submit"
            disabled={extensions.storeBusy !== null || !storeUrl.trim()}
          >
            {t('Add store')}
          </button>
        </form>
      </section>

      <section className="extension-section" aria-labelledby="extension-jar">
        <div className="section-heading-row">
          <h2 id="extension-jar">{t('Install external JAR')}</h2>
        </div>
        <input
          type="file"
          accept=".jar,application/java-archive"
          aria-label="Extension JAR file"
          onChange={(event) => setJarFile(event.target.files?.[0] ?? null)}
        />
        <div className="settings-actions">
          <button
            className="button"
            type="button"
            disabled={!jarFile || extensions.storeBusy !== null}
            onClick={() => {
              if (jarFile) {
                void controller.installExternal(jarFile);
              }
            }}
          >
            {extensions.storeBusy === 'external' ? 'Installingâ€¦' : 'Install JAR'}
          </button>
        </div>
      </section>
    </div>
  );
}

function ExtensionSection({
  title,
  extensions,
  resources,
  busyPkg,
  onAction,
}: {
  readonly title: string;
  readonly extensions: readonly Extension[];
  readonly resources: ConnectedContext['resources'];
  readonly busyPkg: string | null;
  readonly onAction: (extension: Extension, action: 'install' | 'update' | 'uninstall') => void;
}) {
  const headingId = `extensions-${title.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <section className="extension-section" aria-labelledby={headingId}>
      <div className="section-heading-row">
        <h2 id={headingId}>{title}</h2>
        <span>{extensions.length}</span>
      </div>
      <div className="extension-list">
        {extensions.map((extension) => (
          <ExtensionCard
            key={extension.pkgName}
            extension={extension}
            resources={resources}
            busy={busyPkg === extension.pkgName}
            onAction={onAction}
          />
        ))}
      </div>
    </section>
  );
}

function ExtensionCard({
  extension,
  resources,
  busy,
  onAction,
}: {
  readonly extension: Extension;
  readonly resources: ConnectedContext['resources'];
  readonly busy: boolean;
  readonly onAction: (extension: Extension, action: 'install' | 'update' | 'uninstall') => void;
}) {
  const { t } = useI18n();
  const icon = useImageResource(resources, extension.iconUrl);
  const action = !extension.isInstalled ? 'install' : extension.hasUpdate ? 'update' : 'uninstall';

  return (
    <article className="extension-card">
      <span className="extension-icon" aria-hidden="true">
        {icon.objectUrl ? <img src={icon.objectUrl} alt="" /> : extension.name.charAt(0)}
      </span>
      <div className="extension-copy">
        <h3>
          <Link to={`/extensions/${encodeURIComponent(extension.pkgName)}`}>
            {extension.name}
          </Link>
        </h3>
        <p>
          {extension.versionName} Â· {extension.lang.toUpperCase()}
          {extension.extensionStore ? ` Â· ${extension.extensionStore.name}` : ''}
        </p>
        <div className="extension-badges">
          {extension.isObsolete ? <span>{t('Obsolete')}</span> : null}
          {extension.hasUpdate ? <span>{t('Update')}</span> : null}
        </div>
      </div>
      <button
        className={`button${action === 'uninstall' ? ' button-secondary is-danger' : ''}`}
        type="button"
        disabled={busy}
        onClick={() => onAction(extension, action)}
      >
        {busy
          ? 'Workingâ€¦'
          : action === 'install'
            ? 'Install'
            : action === 'update'
              ? 'Update'
              : 'Uninstall'}
      </button>
    </article>
  );
}


