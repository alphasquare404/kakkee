import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ConnectionPage } from '../features/connection/ConnectionPage';

export interface AppRouterProps {
  readonly basename: string;
}

export function AppRouter({ basename }: AppRouterProps) {
  return (
    <BrowserRouter basename={basename}>
      <Routes>
        <Route path="/" element={<ConnectionPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
