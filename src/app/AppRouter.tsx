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
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/downloads" element={<DownloadsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
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
