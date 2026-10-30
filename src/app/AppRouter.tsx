import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AppLayout } from './AppLayout';
import { ConnectionPage } from '../features/connection/ConnectionPage';
import { LibraryPage } from '../features/library/LibraryPage';

const UpdatesPage = lazy(() =>
  import('../features/updates/UpdatesPage').then((module) => ({
    default: module.UpdatesPage,
  })),
);
const BrowsePage = lazy(() =>
  import('../features/browse/BrowsePage').then((module) => ({
    default: module.BrowsePage,
  })),
);
const SourceMangaPage = lazy(() =>
  import('../features/browse/SourceMangaPage').then((module) => ({
    default: module.SourceMangaPage,
  })),
);
const ExtensionsPage = lazy(() =>
  import('../features/extensions/ExtensionsPage').then((module) => ({
    default: module.ExtensionsPage,
  })),
);
const CategoriesPage = lazy(() =>
  import('../features/categories/CategoriesPage').then((module) => ({
    default: module.CategoriesPage,
  })),
);
const HistoryPage = lazy(() =>
  import('../features/history/HistoryPage').then((module) => ({
    default: module.HistoryPage,
  })),
);
const DownloadsPage = lazy(() =>
  import('../features/downloads/DownloadsPage').then((module) => ({
    default: module.DownloadsPage,
  })),
);
const SettingsPage = lazy(() =>
  import('../features/settings/SettingsPage').then((module) => ({
    default: module.SettingsPage,
  })),
);
const ReaderSettingsPage = lazy(() =>
  import('../features/settings/ReaderSettingsPage').then((module) => ({
    default: module.ReaderSettingsPage,
  })),
);
const AppearanceSettingsPage = lazy(() =>
  import('../features/settings/AppearanceSettingsPage').then((module) => ({
    default: module.AppearanceSettingsPage,
  })),
);
const LibrarySettingsPage = lazy(() =>
  import('../features/settings/LibrarySettingsPage').then((module) => ({
    default: module.LibrarySettingsPage,
  })),
);
const ServerSettingsPage = lazy(() =>
  import('../features/settings/ServerSettingsPage').then((module) => ({
    default: module.ServerSettingsPage,
  })),
);
const BackupSettingsPage = lazy(() =>
  import('../features/settings/BackupSettingsPage').then((module) => ({
    default: module.BackupSettingsPage,
  })),
);
const TrackingSettingsPage = lazy(() =>
  import('../features/settings/TrackingSettingsPage').then((module) => ({
    default: module.TrackingSettingsPage,
  })),
);

const MangaDetailPage = lazy(() =>
  import('../features/manga/MangaDetailPage').then((module) => ({
    default: module.MangaDetailPage,
  })),
);
const ReaderPage = lazy(() =>
  import('../features/reader/ReaderPage').then((module) => ({
    default: module.ReaderPage,
  })),
);

export interface AppRouterProps {
  readonly basename: string;
}

function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    if (window.scrollX !== 0 || window.scrollY !== 0) {
      window.scrollTo(0, 0);
    }
  }, [location.pathname]);

  return null;
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
          <Route element={<AppLayout />}>
            <Route path="/library" element={<LibraryPage />} />
            <Route path="/updates" element={<UpdatesPage />} />
            <Route path="/browse" element={<BrowsePage />} />
            <Route path="/browse/:sourceId" element={<SourceMangaPage />} />
            <Route path="/extensions" element={<ExtensionsPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/downloads" element={<DownloadsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/settings/reader" element={<ReaderSettingsPage />} />
            <Route path="/settings/appearance" element={<AppearanceSettingsPage />} />
            <Route path="/settings/library" element={<LibrarySettingsPage />} />
            <Route path="/settings/server" element={<ServerSettingsPage />} />
            <Route path="/settings/backup" element={<BackupSettingsPage />} />
            <Route path="/settings/tracking" element={<TrackingSettingsPage />} />
            <Route path="/manga/:mangaId" element={<MangaDetailPage />} />
            <Route
              path="/manga/:mangaId/chapter/:chapterId"
              element={<ReaderPage />}
            />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
