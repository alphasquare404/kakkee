import { useEffect, useMemo, useSyncExternalStore } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useConnection } from '../../app/useConnection';
import type { ConnectedContext } from '../../core/server/connectionCoordinator';
import { createExtensionController } from '../../core/extensions/extensionController';
import { createExtensionRepository, type Extension } from '../../core/extensions/extensionRepository';
import { useImageResource } from '../../shared/useImageResource';
import { PageHeader } from '../../shared/PageHeader';

export function ExtensionDetailPage() {
  const { state } = useConnection();

  if (state.status !== 'connected') {
    return null;
  }

  return <ExtensionDetailContent context={state.context} />;
}

function ExtensionDetailContent({ context }: { readonly context: ConnectedContext }) {
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
        <PageHeader title="Extension" subtitle={pkgName} />
        <div className="library-state">
          <h1>Extension not found</h1>
          <Link className="button button-secondary" to="/extensions">
            Back to extensions
          </Link>
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
  const icon = useImageResource(context.resources, extension.iconUrl);
  const action = !extension.isInstalled
    ? 'install'
    : extension.hasUpdate
      ? 'update'
      : 'uninstall';

  return (
    <div className="app-shell page-shell extensions-shell">
      <PageHeader title={extension.name} subtitle={extension.pkgName}>
        <Link className="button button-secondary" to="/extensions">
          Back to extensions
        </Link>
      </PageHeader>

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
            <dt>Version</dt>
            <dd>{extension.versionName}</dd>
          </div>
          <div>
            <dt>Language</dt>
            <dd>{extension.lang.toUpperCase()}</dd>
          </div>
          <div>
            <dt>Store</dt>
            <dd>{extension.extensionStore?.name ?? 'Unknown'}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>
              {extension.isInstalled ? 'Installed' : 'Available'}
              {extension.hasUpdate ? ' · Update available' : ''}
              {extension.isObsolete ? ' · Obsolete' : ''}
            </dd>
          </div>
          <div>
            <dt>Content warning</dt>
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
                ? 'Install'
                : action === 'update'
                  ? 'Update'
                  : 'Uninstall'}
          </button>
        </div>
      </article>
    </div>
  );
}
