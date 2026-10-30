import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ConnectionPage } from '../features/connection/ConnectionPage';
import { LibraryPage } from '../features/library/LibraryPage';

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

export function AppRouter({ basename }: AppRouterProps) {
  return (
    <BrowserRouter basename={basename}>
      <Suspense
        fallback={
          <div className="app-shell route-loading" role="status">
            Loading…
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<ConnectionPage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/manga/:mangaId" element={<MangaDetailPage />} />
          <Route
            path="/manga/:mangaId/chapter/:chapterId"
            element={<ReaderPage />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
