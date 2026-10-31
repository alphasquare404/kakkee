import type { ReactElement } from 'react';
import { Link, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useConnection } from './useConnection';
import { useNavigationBadges } from '../shared/useNavigationBadges';
import { useI18n } from '../shared/useI18n';
import type { MessageKey } from '../shared/i18n';

function BrandMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path
          d="M9 2.2 15.2 5.6v6.8L9 15.8 2.8 12.4V5.6L9 2.2Z"
          stroke="currentColor"
          strokeWidth="1.4"
        />
        <path
          d="m6.2 9.1 1.8 1.8 3.8-4.1"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

function LibraryIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M4 3.5h4.5v13H4v-13Zm7 0H15.5v13H11v-13Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path d="M5.8 6h1M12.8 6h.9" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

function UpdatesIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M4.5 13.5V8.7a5.5 5.5 0 0 1 11 0v4.8l1 1.2H3.5l1-1.2Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M8.2 17a2 2 0 0 0 3.6 0" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function BrowseIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.3" />
      <path d="m12.7 7.3-1.4 4-4 1.4 1.4-4 4-1.4Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}

function CategoriesIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M3.5 6.2A1.7 1.7 0 0 1 5.2 4.5h3l1.4 1.7h5.2a1.7 1.7 0 0 1 1.7 1.7v7.4a1.7 1.7 0 0 1-1.7 1.7H5.2a1.7 1.7 0 0 1-1.7-1.7V6.2Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}

function HistoryIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.3" />
      <path d="M10 6.2V10l2.6 1.7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function DownloadsIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="19" viewBox="0 0 20 20" width="19">
      <path d="M10 3v9m0 0 3.2-3.2M10 12 6.8 8.8M4 14.5v1.2A1.3 1.3 0 0 0 5.3 17h9.4a1.3 1.3 0 0 0 1.3-1.3v-1.2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
    </svg>
  );
}

function ExtensionsIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="19" viewBox="0 0 20 20" width="19">
      <path d="M7.5 4.2a2 2 0 0 1 3.8-.7c.2.4.1.9.4 1.2.3.3.7.1 1.1.1h1.5a1.6 1.6 0 0 1 1.6 1.6v2.1c0 .4-.2.8-.5 1-.4.3-.9.1-1.3.4a2 2 0 0 0 0 3.2c.4.3.9.1 1.3.4.3.2.5.6.5 1v1.6a1.6 1.6 0 0 1-1.6 1.6H5.6A1.6 1.6 0 0 1 4 16.2v-2.1c0-.4.2-.8.5-1 .4-.3.9-.1 1.3-.4a2 2 0 0 0 0-3.2c-.4-.3-.9-.1-1.3-.4a1.4 1.4 0 0 1-.5-1V6.4a1.6 1.6 0 0 1 1.6-1.6h1.5c.4 0 .8.2 1-.1.3-.3.2-.8.4-1.2Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.2" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="19" viewBox="0 0 20 20" width="19">
      <circle cx="8.8" cy="8.8" r="5.2" stroke="currentColor" strokeWidth="1.3" />
      <path d="m12.7 12.7 3.2 3.2" stroke="currentColor" strokeLinecap="round" strokeWidth="1.3" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="2.3" stroke="currentColor" strokeWidth="1.3" />
      <path d="M10 3.2v1.4M10 15.4v1.4M3.2 10h1.4M15.4 10h1.4M5.2 5.2l1 1M13.8 13.8l1 1M14.8 5.2l-1 1M6.2 13.8l-1 1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

const NAV_ITEMS: ReadonlyArray<{
  readonly to: string;
  readonly labelKey: MessageKey;
  readonly icon: () => ReactElement;
  readonly mobile: boolean;
  readonly match: (path: string) => boolean;
}> = [
  { to: '/library', labelKey: 'nav.library', icon: LibraryIcon, mobile: true, match: (path: string) => path === '/library' || path.startsWith('/manga/') },
  { to: '/updates', labelKey: 'nav.updates', icon: UpdatesIcon, mobile: true, match: (path: string) => path === '/updates' },
  { to: '/browse', labelKey: 'nav.browse', icon: BrowseIcon, mobile: true, match: (path: string) => path === '/browse' },
  { to: '/search', labelKey: 'nav.search', icon: SearchIcon, mobile: true, match: (path: string) => path === '/search' },
  { to: '/extensions', labelKey: 'nav.extensions', icon: ExtensionsIcon, mobile: false, match: (path: string) => path === '/extensions' },
  { to: '/categories', labelKey: 'nav.categories', icon: CategoriesIcon, mobile: true, match: (path: string) => path === '/categories' },
  { to: '/history', labelKey: 'nav.history', icon: HistoryIcon, mobile: true, match: (path: string) => path === '/history' },
  { to: '/downloads', labelKey: 'nav.downloads', icon: DownloadsIcon, mobile: true, match: (path: string) => path === '/downloads' },
  { to: '/settings', labelKey: 'nav.settings', icon: SettingsIcon, mobile: true, match: (path: string) => path.startsWith('/settings') },
];

export function AppLayout() {
  const { state } = useConnection();
  const location = useLocation();
  const { t } = useI18n();
  const readerActive = location.pathname.includes('/chapter/');
  const badges = useNavigationBadges(
    state.status === 'connected' ? state.context.graphQL : null,
    location.pathname,
  );

  if (state.status !== 'connected') {
    return <Navigate to="/" replace />;
  }

  if (readerActive) {
    return (
      <div className="app-frame app-frame-reader">
        <div className="app-frame-main">
          <Outlet />
        </div>
      </div>
    );
  }

  return (
    <div className="app-frame">
      <aside className="app-sidebar">
        <Link className="brand" to="/library" aria-label="Suwayomi Library">
          <BrandMark />
          <span>Suwayomi</span>
        </Link>

        <nav className="primary-nav" aria-label="Primary navigation">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = item.match(location.pathname);
            const badge =
              item.to === '/downloads'
                ? badges.downloads
                : item.to === '/extensions'
                  ? badges.extensionUpdates
                  : 0;

            return (
              <Link
                className={`nav-item${active ? ' is-active' : ''}`}
                key={item.to}
                to={item.to}
                aria-current={active ? 'page' : undefined}
              >
                <Icon />
                <span>{t(item.labelKey)}</span>
                {badge > 0 ? (
                  <span className="nav-badge" aria-label={`${badge} pending`}>
                    {badge > 99 ? '99+' : badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        <Link className="sidebar-account" to="/" aria-label="Server connection settings">
          <span className="account-avatar" aria-hidden="true">
            {state.context.serverInfo.name.charAt(0).toUpperCase()}
          </span>
          <div>
            <p>{state.context.serverInfo.name}</p>
            <span>{state.context.serverInfo.version}</span>
          </div>
        </Link>
      </aside>

      <div className="app-frame-main">
        <Outlet />
      </div>

      <nav className="mobile-nav" aria-label="Primary navigation">
        {NAV_ITEMS.filter((item) => item.mobile).map((item) => {
          const Icon = item.icon;
          const active = item.match(location.pathname);
          const badge = item.to === '/downloads' ? badges.downloads : 0;

          return (
            <Link
              className={`mobile-nav-item${active ? ' is-active' : ''}`}
              key={item.to}
              to={item.to}
              aria-current={active ? 'page' : undefined}
            >
              <Icon />
              <span>{t(item.labelKey)}</span>
              {badge > 0 ? (
                <span className="nav-badge" aria-label={`${badge} pending`}>
                  {badge > 99 ? '99+' : badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
