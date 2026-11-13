import { useEffect, useRef, useState, useSyncExternalStore, type ReactElement } from 'react';
import { Link, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppPath } from './useAppPath';
import { useConnection } from './useConnection';
import { getAutoConnect, getLastServerUrl } from '../core/preferences/connectionPreferences';
import { getNavigationOrigin } from './navigationOrigin';
import { useNavigationBadges } from '../shared/useNavigationBadges';
import { useI18n } from '../shared/useI18n';
import type { MessageKey } from '../shared/i18n';
import {
  getDeviceDownloadState,
  subscribeDeviceDownloads,
} from '../core/offline/deviceDownloadQueue';

function BrandMark() {
  const base = import.meta.env.BASE_URL;

  return (
    <span className="brand-logo">
      <img
        className="brand-wordmark brand-wordmark-dark"
        src={`${base}icons/kakkee-wordmark-white.png`}
        alt=""
        width={1185}
        height={360}
      />
      <img
        className="brand-wordmark brand-wordmark-light"
        src={`${base}icons/kakkee-wordmark-black.png`}
        alt=""
        width={1184}
        height={360}
      />
      <img
        className="brand-mark"
        src={`${base}icons/icon-192.png`}
        alt=""
        width={30}
        height={30}
      />
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

function ReadingIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M10 5.1C8.5 4.1 6.5 3.6 4 3.6v10.8c2.5 0 4.5.5 6 1.5 1.5-1 3.5-1.5 6-1.5V3.6c-2.5 0-4.5.5-6 1.5Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path d="M10 5.1v10.8" stroke="currentColor" strokeWidth="1.3" />
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



function SettingsIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="2.3" stroke="currentColor" strokeWidth="1.3" />
      <path d="M10 3.2v1.4M10 15.4v1.4M3.2 10h1.4M15.4 10h1.4M5.2 5.2l1 1M13.8 13.8l1 1M14.8 5.2l-1 1M6.2 13.8l-1 1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function MoreIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="4.5" cy="10" r="1.2" fill="currentColor" />
      <circle cx="10" cy="10" r="1.2" fill="currentColor" />
      <circle cx="15.5" cy="10" r="1.2" fill="currentColor" />
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
  { to: '/updates', labelKey: 'nav.updates', icon: ReadingIcon, mobile: true, match: (path: string) => path === '/updates' },
  {
    to: '/browse',
    labelKey: 'nav.browse',
    icon: BrowseIcon,
    mobile: true,
    match: (path: string) =>
      path === '/browse' ||
      path.startsWith('/browse/') ||
      path === '/search' ||
      path === '/extensions' ||
      path.startsWith('/extensions/'),
  },
  { to: '/history', labelKey: 'nav.history', icon: HistoryIcon, mobile: true, match: (path: string) => path === '/history' },
  { to: '/downloads', labelKey: 'nav.downloads', icon: DownloadsIcon, mobile: true, match: (path: string) => path === '/downloads' || path.startsWith('/downloads/') },
  { to: '/settings', labelKey: 'nav.settings', icon: SettingsIcon, mobile: true, match: (path: string) => path.startsWith('/settings') || path === '/about' },
];

const MOBILE_PRIMARY_ROUTES = new Set([
  '/library',
  '/updates',
  '/browse',
]);

export function AppLayout() {
  const { state } = useConnection();
  const location = useLocation();
  const { pathname: appPathname, from } = useAppPath();
  const { t } = useI18n();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreTrigger = useRef<HTMLButtonElement>(null);
  const moreMenu = useRef<HTMLDivElement>(null);
  const mobilePrimaryItems = NAV_ITEMS.filter(
    (item) => item.mobile && MOBILE_PRIMARY_ROUTES.has(item.to),
  );
  const mobileMoreItems = NAV_ITEMS.filter(
    (item) => item.mobile && !MOBILE_PRIMARY_ROUTES.has(item.to),
  );

  useEffect(() => {
    setMoreOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') {
      return;
    }

    const query = window.matchMedia('(max-width: 760px)');
    const onChange = () => {
      if (!query.matches) {
        setMoreOpen(false);
      }
    };

    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (!moreOpen) {
      return;
    }

    const menu = moreMenu.current;
    const trigger = moreTrigger.current;
    const firstLink = menu?.querySelector<HTMLAnchorElement>('a');
    firstLink?.focus({ preventScroll: true });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMoreOpen(false);
        trigger?.focus({ preventScroll: true });
      }
    };

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;

      if (
        target &&
        !menu?.contains(target) &&
        !trigger?.contains(target)
      ) {
        setMoreOpen(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('pointerdown', onPointerDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('pointerdown', onPointerDown);
    };
  }, [moreOpen]);
  const readerActive = appPathname.includes('/chapter/');
  const origin = getNavigationOrigin(location.state);
  const mangaPath = appPathname.startsWith('/manga/');
  const originSectionPath: Partial<Record<string, string>> = {
    library: '/library',
    browse: '/browse',
    search: '/browse',
    updates: '/updates',
    history: '/history',
    downloads: '/downloads',
    categories: '/settings/categories',
    settings: '/settings',
    extensions: '/browse',
  };
  const isItemActive = (item: (typeof NAV_ITEMS)[number]) =>
    mangaPath
      ? Boolean(origin) && originSectionPath[origin?.section ?? ''] === item.to
      : item.match(appPathname);
  const moreActive = mobileMoreItems.some((item) => isItemActive(item));
  const deviceDownloads = useSyncExternalStore(
    subscribeDeviceDownloads,
    getDeviceDownloadState,
  );
  const deviceQueueBadge = deviceDownloads.jobs.filter(
    (job) => job.status === 'queued' || job.status === 'downloading',
  ).length;
  const serverBadges = useNavigationBadges(
    state.status === 'connected' ? state.context.graphQL : null,
    appPathname,
  );
  const badges = {
    ...serverBadges,
    downloads: serverBadges.downloads + deviceQueueBadge,
  };

  const autoStarting =
    (state.status === 'disconnected' || state.status === 'connecting') &&
    getAutoConnect() &&
    Boolean(getLastServerUrl());
  const offlineDeviceLibrary = appPathname === '/downloads/device';
  const offlineMangaDetail = /^\/manga\/\d+$/.test(appPathname);

  if (
    state.status !== 'connected' &&
    !offlineDeviceLibrary &&
    !offlineMangaDetail &&
    !(autoStarting && appPathname === '/library')
  ) {
    return (
      <Navigate
        to="/"
        replace
        state={{
          from,
        }}
      />
    );
  }

  if (readerActive) {
    return (
      <>
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <div className="app-frame app-frame-reader">
          <div className="app-frame-main" id="main-content" tabIndex={-1} aria-label="Main content">
            <Outlet />
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="app-frame">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <aside className="app-sidebar">
        <Link className="brand" to="/library" aria-label="Kakkee Library">
          <BrandMark />
        </Link>

        <nav className="primary-nav" aria-label="Primary navigation">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isItemActive(item);
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
                aria-label={t(item.labelKey)}
                title={t(item.labelKey)}
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

        {state.status === 'connected' ? (
          <Link className="sidebar-account" to="/" aria-label="Server connection settings">
            <div>
              <p>{state.context.serverInfo.name}</p>
              <span>{state.context.serverInfo.version}</span>
            </div>
          </Link>
        ) : null}
      </aside>

      <div className="app-frame-main" id="main-content" tabIndex={-1} aria-label="Main content">
        <Outlet />
      </div>

      <nav className="mobile-nav" aria-label="Primary navigation">
        {mobilePrimaryItems.map((item) => {
          const Icon = item.icon;
          const active = isItemActive(item);

          return (
            <Link
              className={`mobile-nav-item${active ? ' is-active' : ''}`}
              key={item.to}
              to={item.to}
              aria-current={active ? 'page' : undefined}
              aria-label={t(item.labelKey)}
            >
              <Icon />
              <span>{t(item.labelKey)}</span>
            </Link>
          );
        })}
        <button
          ref={moreTrigger}
          className={`mobile-nav-item mobile-more-trigger${
            moreActive || moreOpen ? ' is-active' : ''
          }`}
          type="button"
          aria-expanded={moreOpen}
          aria-controls="mobile-more-menu"
          onClick={() => setMoreOpen((value) => !value)}
        >
          <MoreIcon />
          <span>{t('nav.more')}</span>
          {badges.downloads > 0 ? (
            <span className="nav-badge" aria-label={`${badges.downloads} pending`}>
              {badges.downloads > 99 ? '99+' : badges.downloads}
            </span>
          ) : null}
        </button>
      </nav>

      {moreOpen ? (
        <div
          ref={moreMenu}
          className="mobile-more-menu"
          id="mobile-more-menu"
          role="dialog"
          aria-label="More navigation"
        >
          {mobileMoreItems.map((item) => {
            const Icon = item.icon;
            const active = isItemActive(item);
            const badge = item.to === '/downloads' ? badges.downloads : 0;

            return (
              <Link
                className={`mobile-more-link${active ? ' is-active' : ''}`}
                key={item.to}
                to={item.to}
                aria-current={active ? 'page' : undefined}
                aria-label={t(item.labelKey)}
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
        </div>
      ) : null}
    </div>
  );
}
