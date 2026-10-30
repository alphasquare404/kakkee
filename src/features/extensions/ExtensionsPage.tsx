import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
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

export function ExtensionsPage() {
  const { state } = useConnection();

  if (state.status !== 'connected') {
    return null;
  }

  return <ExtensionsContent context={state.context} />;
}

function ExtensionsContent({ context }: { readonly context: ConnectedContext }) {
  const controller = useMemo(() => {
    const repository = createExtensionRepository({
      getClient: () => context.graphQL,
    });

    return createExtensionController(repository);
  }, [context.graphQL]);
  const extensions = useSyncExternalStore(
    controller.subscribe,
    controller.getState,
  );
  const [language, setLanguage] = useState('all');
  const [storeUrl, setStoreUrl] = useState('');

  useEffect(() => {
    void controller.load();
  }, [controller]);

  const languages = [
    'all',
    ...[...new Set(extensions.items.map((item) => item.lang))].sort(),
  ];
  const items =
    language === 'all'
      ? extensions.items
      : extensions.items.filter((item) => item.lang === language);
  const installed = items.filter((item) => item.isInstalled);
  const available = items.filter((item) => !item.isInstalled);
  const updates = installed.filter((item) => item.hasUpdate);

  return (
    <div className="app-shell page-shell extensions-shell">
      <PageHeader
        title="Extensions"
        subtitle="Sources installed through your server"
        count={
          extensions.status === 'ready'
            ? `${extensions.items.length.toLocaleString('en-US')} extensions`
            : undefined
        }
      >
        <button
          className="button button-secondary"
          type="button"
          disabled={extensions.refreshing}
          onClick={() => void controller.refresh()}
        >
          {extensions.refreshing ? 'Checking…' : 'Check for updates'}
        </button>
      </PageHeader>

      {extensions.actionError ? (
        <p className="settings-inline-error" role="alert">
          The last extension change was rejected by the server.
        </p>
      ) : null}

      <div className="browse-filters" role="group" aria-label="Filter extensions by language">
        {languages.map((lang) => (
          <button
            className={language === lang ? 'is-active' : undefined}
            key={lang}
            type="button"
            aria-pressed={language === lang}
            onClick={() => setLanguage(lang)}
          >
            {lang === 'all' ? 'All' : lang.toUpperCase()}
          </button>
        ))}
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
          <h1>Couldn&apos;t load extensions</h1>
          <p>The extension catalog could not be loaded.</p>
          <button className="button" type="button" onClick={() => void controller.load()}>
            Retry
          </button>
        </div>
      ) : null}

      {extensions.status === 'ready' && items.length === 0 ? (
        <div className="library-state">
          <h1>No extensions</h1>
          <p>Add an extension store or install an extension on the server.</p>
        </div>
      ) : null}

      {updates.length > 0 ? (
        <ExtensionSection
          title="Updates available"
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
          title="Installed"
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
          title="Available"
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
            <h2 id="extension-stores">Stores</h2>
          </div>
          <ul className="extension-stores">
            {extensions.stores.map((store) => (
              <li key={store.indexUrl}>
                <strong>{store.name}</strong>
                <span>{store.badgeLabel}</span>
                <button
                  className="library-action"
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
          <h2 id="extension-add-store">Add store</h2>
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
            Add store
          </button>
        </form>
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
  const icon = useImageResource(resources, extension.iconUrl);
  const action = !extension.isInstalled ? 'install' : extension.hasUpdate ? 'update' : 'uninstall';

  return (
    <article className="extension-card">
      <span className="extension-icon" aria-hidden="true">
        {icon.objectUrl ? <img src={icon.objectUrl} alt="" /> : extension.name.charAt(0)}
      </span>
      <div className="extension-copy">
        <h3>{extension.name}</h3>
        <p>
          {extension.versionName} · {extension.lang.toUpperCase()}
          {extension.extensionStore ? ` · ${extension.extensionStore.name}` : ''}
        </p>
        <div className="extension-badges">
          {extension.isObsolete ? <span>Obsolete</span> : null}
          {extension.hasUpdate ? <span>Update</span> : null}
        </div>
      </div>
      <button
        className={`button${action === 'uninstall' ? ' button-secondary' : ''}`}
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
