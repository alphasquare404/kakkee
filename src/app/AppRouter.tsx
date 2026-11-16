import { lazy, Suspense, useEffect, useRef, type ComponentType } from 'react';
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigationType,
} from 'react-router-dom';
import { AppLayout } from './AppLayout';
import { useConnection } from './useConnection';
import { ConnectionPage } from '../features/connection/ConnectionPage';
import { LibraryPage } from '../features/library/LibraryPage';

const CHUNK_RELOAD_KEY = 'kakkee.chunk-reload.v1';

/**
 * A deployment replaces hashed route chunks. A PWA tab that still runs the
 * previous shell can then fail to import a lazy page. Reload once so the
 * fresh index and its matching chunks take over instead of rendering blank.
 */
function lazyRoute(importer: () => Promise<{ default: ComponentType }>) {
  return lazy(async () => {
    try {
      const module = await importer();
      window.sessionStorage.removeItem(CHUNK_RELOAD_KEY);
      return module;
    } catch (error) {
      if (!window.sessionStorage.getItem(CHUNK_RELOAD_KEY)) {
        window.sessionStorage.setItem(CHUNK_RELOAD_KEY, '1');
        window.location.reload();
        return new Promise<{ default: ComponentType }>(() => {});
      }

      throw error;
    }
  });
}

const UpdatesPage = lazyRoute(() =>
  import('../features/updates/UpdatesPage').then((module) => ({
    default: module.UpdatesPage,
  })),
);
const BrowsePage = lazyRoute(() =>
  import('../features/browse/BrowsePage').then((module) => ({
    default: module.BrowsePage,
  })),
);
const SourceMangaPage = lazyRoute(() =>
  import('../features/browse/SourceMangaPage').then((module) => ({
    default: module.SourceMangaPage,
  })),
);
const ExtensionsPage = lazyRoute(() =>
  import('../features/extensions/ExtensionsPage').then((module) => ({
    default: module.ExtensionsPage,
  })),
);
const GlobalSearchPage = lazyRoute(() =>
  import('../features/search/GlobalSearchPage').then((module) => ({
    default: module.GlobalSearchPage,
  })),
);
const ExtensionDetailPage = lazyRoute(() =>
  import('../features/extensions/ExtensionDetailPage').then((module) => ({
    default: module.ExtensionDetailPage,
  })),
);
const CategoriesPage = lazyRoute(() =>
  import('../features/categories/CategoriesPage').then((module) => ({
    default: module.CategoriesPage,
  })),
);
const DownloadsPage = lazyRoute(() =>
  import('../features/downloads/DownloadsPage').then((module) => ({
    default: module.DownloadsPage,
  })),
);
const DeviceLibraryPage = lazyRoute(() =>
  import('../features/downloads/DeviceLibraryPage').then((module) => ({
    default: module.DeviceLibraryPage,
  })),
);
const SettingsPage = lazyRoute(() =>
  import('../features/settings/SettingsPage').then((module) => ({
    default: module.SettingsPage,
  })),
);
const ReaderSettingsPage = lazyRoute(() =>
  import('../features/settings/ReaderSettingsPage').then((module) => ({
    default: module.ReaderSettingsPage,
  })),
);
const AppearanceSettingsPage = lazyRoute(() =>
  import('../features/settings/AppearanceSettingsPage').then((module) => ({
    default: module.AppearanceSettingsPage,
  })),
);
const LibrarySettingsPage = lazyRoute(() =>
  import('../features/settings/LibrarySettingsPage').then((module) => ({
    default: module.LibrarySettingsPage,
  })),
);
const ServerSettingsPage = lazyRoute(() =>
  import('../features/settings/ServerSettingsPage').then((module) => ({
    default: module.ServerSettingsPage,
  })),
);
const BackupSettingsPage = lazyRoute(() =>
  import('../features/settings/BackupSettingsPage').then((module) => ({
    default: module.BackupSettingsPage,
  })),
);
const TrackingSettingsPage = lazyRoute(() =>
  import('../features/settings/TrackingSettingsPage').then((module) => ({
    default: module.TrackingSettingsPage,
  })),
);
const SyncSettingsPage = lazyRoute(() =>
  import('../features/settings/SyncSettingsPage').then((module) => ({
    default: module.SyncSettingsPage,
  })),
);
const HistorySettingsPage = lazyRoute(() =>
  import('../features/settings/HistorySettingsPage').then((module) => ({
    default: module.HistorySettingsPage,
  })),
);
const DeviceSettingsPage = lazyRoute(() =>
  import('../features/settings/DeviceSettingsPage').then((module) => ({
    default: module.DeviceSettingsPage,
  })),
);
const AboutPage = lazyRoute(() =>
  import('../features/settings/AboutPage').then((module) => ({
    default: module.AboutPage,
  })),
);

const MangaDetailPage = lazyRoute(() =>
  import('../features/manga/MangaDetailPage').then((module) => ({
    default: module.MangaDetailPage,
  })),
);
const ReaderPage = lazyRoute(() =>
  import('../features/reader/ReaderPage').then((module) => ({
    default: module.ReaderPage,
  })),
);
const OfflineReaderPage = lazyRoute(() =>
  import('../features/offline/OfflineReaderPage').then((module) => ({
    default: module.OfflineReaderPage,
  })),
);

export interface AppRouterProps {
  readonly basename: string;
}

function ScrollToTop() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const lastScroll = useRef(0);

  useEffect(() => {
    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';

    return () => {
      window.history.scrollRestoration = previous;
    };
  }, []);

  useEffect(() => {
    const path = location.pathname;
    const storageKey = `kakkee:scroll:${path}`;
    let saved = 0;

    if (navigationType === 'POP') {
      try {
        saved = Number(window.sessionStorage.getItem(storageKey) ?? 0);
      } catch {
        saved = 0;
      }
    } else {
      window.scrollTo(0, 0);
    }

    lastScroll.current = saved > 0 ? saved : 0;

    const onScroll = () => {
      if (window.location.pathname === path) {
        lastScroll.current = window.scrollY;
      }
    };

    if (saved > 0) {
      for (const delay of [0, 120, 400, 900]) {
        window.setTimeout(() => window.scrollTo(0, saved), delay);
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    requestAnimationFrame(() => {
      document
        .getElementById('main-content')
        ?.focus({ preventScroll: true });
    });
    return () => {
      window.removeEventListener('scroll', onScroll);

      try {
        window.sessionStorage.setItem(storageKey, String(lastScroll.current));
      } catch {
        // Storage can be unavailable in private or embedded contexts.
      }
    };
  }, [location.pathname, navigationType]);

  return null;
}

function FallbackRoute() {
  const { state } = useConnection();

  return <Navigate to={state.status === 'connected' ? '/library' : '/'} replace />;
}

export function AppRouter({ basename }: AppRouterProps) {
  return (
    <BrowserRouter basename={basename}>
      <ScrollToTop />
      <Suspense
        fallback={
          <div className="app-shell route-loading" role="status">
            Loading…
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<ConnectionPage />} />
          <Route
            path="/offline/read/:chapterId"
            element={<OfflineReaderPage />}
          />
          <Route element={<AppLayout />}>
            <Route path="/library" element={<LibraryPage />} />
            <Route path="/updates" element={<UpdatesPage />} />
            <Route path="/browse" element={<BrowsePage />} />
            <Route path="/browse/:sourceId" element={<SourceMangaPage />} />
            <Route path="/extensions" element={<ExtensionsPage />} />
            <Route path="/extensions/:pkgName" element={<ExtensionDetailPage />} />
            <Route path="/search" element={<GlobalSearchPage />} />
            <Route path="/categories" element={<Navigate to="/settings/categories" replace />} />
            <Route path="/settings/categories" element={<CategoriesPage />} />
            <Route path="/history" element={<Navigate to="/updates" replace />} />
            <Route path="/downloads" element={<DownloadsPage />} />
            <Route path="/downloads/device" element={<DeviceLibraryPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/settings/reader" element={<ReaderSettingsPage />} />
            <Route path="/settings/appearance" element={<AppearanceSettingsPage />} />
            <Route path="/settings/library" element={<LibrarySettingsPage />} />
            <Route path="/settings/server" element={<ServerSettingsPage />} />
            <Route path="/settings/backup" element={<BackupSettingsPage />} />
            <Route path="/settings/tracking" element={<TrackingSettingsPage />} />
            <Route path="/settings/sync" element={<SyncSettingsPage />} />
            <Route path="/settings/history" element={<HistorySettingsPage />} />
            <Route path="/settings/device" element={<DeviceSettingsPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route
              path="/settings/*"
              element={<Navigate to="/settings" replace />}
            />
            <Route path="/manga/:mangaId" element={<MangaDetailPage />} />
            <Route
              path="/manga/:mangaId/chapter/:chapterId"
              element={<ReaderPage />}
            />
          </Route>
          <Route path="*" element={<FallbackRoute />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
