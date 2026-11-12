import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
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
import { BackButton } from '../../shared/BackButton';
import { FilterDrawer } from '../../shared/FilterDrawer';
import { PageHeader } from '../../shared/PageHeader';
import { IconClose, IconFilter, IconSearch, IconSync } from '../library/icons';
import { useI18n } from '../../shared/useI18n';
import { registerMessages } from '../../shared/i18n';

registerMessages('id', {
  Extensions: 'Ekstensi',
  'Installed sources': 'Sumber terpasang',
  '{count} extensions': '{count} ekstensi',
  '1 extension': '1 ekstensi',
  'Checking…': 'Memeriksa…',
  'Check for updates': 'Periksa update',
  'The last extension change was rejected by the server.':
    'Perubahan ekstensi terakhir ditolak server.',
  'Search extensions': 'Cari ekstensi',
  'Search extensions...': 'Cari ekstensi...',
  'Filter extensions': 'Filter ekstensi',
  'Choose a language for the extension list.':
    'Pilih bahasa untuk daftar ekstensi.',
  'Back to Browse': 'Kembali ke Browse',
  Language: 'Bahasa',
  'All languages': 'Semua bahasa',
  'Search by name or package…': 'Cari berdasarkan nama atau paket…',
  'Updates only': 'Hanya update',
  'Couldn’t load extensions': 'Tidak dapat memuat ekstensi',
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
  'Installing…': 'Memasang…',
  'Extension store index URL': 'URL indeks toko ekstensi',
  Obsolete: 'Usang',
  Update: 'Update',
  Install: 'Pasang',
  Uninstall: 'Copot',
  'Filter extensions, {count} active': 'Filter ekstensi, {count} aktif',
  Filter: 'Filter',
  Reset: 'Reset',
  Cancel: 'Batal',
  Apply: 'Terapkan',
  'Filter extensions by language': 'Filter ekstensi berdasarkan bahasa',
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
  const [languageDraft, setLanguageDraft] = useState('all');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const filterButton = useRef<HTMLButtonElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [storeUrl, setStoreUrl] = useState('');
  const [jarFile, setJarFile] = useState<File | null>(null);

  useEffect(() => {
    void controller.load();
  }, [controller]);

  const languages = [
    'all',
    ...[...new Set(extensions.items.map((item) => item.lang))]
      .filter((lang) => lang !== 'all')
      .sort(),
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
        subtitle={t('Installed sources')}
        leading={<BackButton to="/browse" label={t('Back to Browse')} />}
        toolbar={
          <form
            id="extension-search-form"
            className={`library-search header-search-form${searchOpen ? ' is-open' : ''}`}
            role="search"
            onSubmit={(event) => event.preventDefault()}
          >
            <IconSearch className="library-search-icon" />
            <span className="sr-only">{t('Search extensions')}</span>
            <input
              ref={searchInput}
              type="search"
              aria-label={t('Search extensions')}
              placeholder={t('Search extensions...')}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            {query ? (
              <button
                type="button"
                className="library-search-clear"
                aria-label={t('Clear search')}
                onClick={() => setQuery('')}
              >
                <IconClose />
              </button>
            ) : null}
          </form>
        }
      >
        <button
          className={`library-action library-search-toggle${searchOpen ? ' is-active' : ''}`}
          type="button"
          aria-label={searchOpen ? t('Close search') : t('Search extensions')}
          aria-expanded={searchOpen}
          aria-controls="extension-search-form"
          onClick={() => {
            if (searchOpen) {
              setSearchOpen(false);
            } else {
              setSearchOpen(true);
              window.setTimeout(() => searchInput.current?.focus(), 0);
            }
          }}
        >
          <IconSearch />
        </button>
        <button
          ref={filterButton}
          className={`library-action${language !== 'all' ? ' is-active' : ''}`}
          type="button"
          aria-label={
            language !== 'all'
              ? t('Filter extensions, {count} active', { count: 1 })
              : t('Filter extensions')
          }
          aria-haspopup="dialog"
          aria-expanded={filtersOpen}
          title={t('Filter extensions')}
          onClick={() => {
            setLanguageDraft(language);
            setFiltersOpen(true);
          }}
        >
          <IconFilter />
          <span className="library-action-label">{t('Filter')}</span>
          {language !== 'all' ? (
            <span className="library-action-count" aria-hidden="true">
              1
            </span>
          ) : null}
        </button>
        <button
          className="app-header-icon-button"
          type="button"
          disabled={extensions.refreshing}
          aria-label={
            extensions.refreshing ? t('Checking…') : t('Check for updates')
          }
          aria-busy={extensions.refreshing}
          title={
            extensions.refreshing ? t('Checking…') : t('Check for updates')
          }
          onClick={() => void controller.refresh()}
        >
          <IconSync className={extensions.refreshing ? 'is-spinning' : undefined} />
        </button>
      </PageHeader>

      {extensions.actionError ? (
        <p className="settings-inline-error" role="alert">
          {t('The last extension change was rejected by the server.')}
        </p>
      ) : null}


      <FilterDrawer
        open={filtersOpen}
        title={t('Filter extensions')}
        description={t('Choose a language for the extension list.')}
        triggerRef={filterButton}
        onClose={() => {
          setFiltersOpen(false);
          filterButton.current?.focus({ preventScroll: true });
        }}
      >
        <div
          className="extension-language-options"
          role="radiogroup"
          aria-label={t('Filter extensions by language')}
        >
          {languages.map((lang) => (
            <label
              key={lang}
              className={`extension-language-option${
                languageDraft === lang ? ' is-selected' : ''
              }`}
            >
              <input
                type="radio"
                name="extension-language"
                value={lang}
                checked={languageDraft === lang}
                onChange={() => setLanguageDraft(lang)}
              />
              <span>
                {lang === 'all' ? t('All languages') : lang.toUpperCase()}
              </span>
            </label>
          ))}
        </div>

        <footer className="search-filter-footer">
          <button
            className="button button-secondary"
            type="button"
            onClick={() => setLanguageDraft('all')}
          >
            {t('Reset')}
          </button>
          <div>
            <button
              className="button button-secondary"
              type="button"
              onClick={() => {
                setFiltersOpen(false);
                filterButton.current?.focus({ preventScroll: true });
              }}
            >
              {t('Cancel')}
            </button>
            <button
              className="button"
              type="button"
              onClick={() => {
                setLanguage(languageDraft);
                setFiltersOpen(false);
                filterButton.current?.focus({ preventScroll: true });
              }}
            >
              {t('Apply')}
            </button>
          </div>
        </footer>
      </FilterDrawer>

      {extensions.status === 'loading' && extensions.items.length === 0 ? (
        <div className="extension-list" aria-hidden="true">
          {Array.from({ length: 6 }, (_, index) => (
            <div className="extension-card extension-skeleton" key={index} />
          ))}
        </div>
      ) : null}

      {extensions.status === 'error' ? (
        <div className="library-state" role="alert">
          <h1>{t('Couldn’t load extensions')}</h1>
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
                  {extensions.storeBusy === store.indexUrl ? 'Working…' : 'Remove'}
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
            {extensions.storeBusy === 'external' ? 'Installing…' : 'Install JAR'}
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
  const card = useRef<HTMLElement>(null);
  const [iconVisible, setIconVisible] = useState(false);
  const icon = useImageResource(resources, iconVisible ? extension.iconUrl : null);
  const action = !extension.isInstalled ? 'install' : extension.hasUpdate ? 'update' : 'uninstall';

  useEffect(() => {
    const element = card.current;

    if (!element) {
      return;
    }

    if (typeof IntersectionObserver === 'undefined') {
      setIconVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIconVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '400px 0px' },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <article className="extension-card" ref={card}>
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
          {extension.versionName} · {extension.lang.toUpperCase()}
          {extension.extensionStore ? ` · ${extension.extensionStore.name}` : ''}
        </p>
        {extension.isObsolete ? (
          <div className="extension-badges">
            <span>{t('Obsolete')}</span>
          </div>
        ) : null}
      </div>
      <button
        className={`button${action === 'uninstall' ? ' button-secondary is-danger' : ''}`}
        type="button"
        disabled={busy}
        onClick={() => onAction(extension, action)}
      >
        {busy
          ? 'Working…'
          : action === 'install'
            ? 'Install'
            : action === 'update'
              ? 'Update'
              : 'Uninstall'}
      </button>
    </article>
  );
}


