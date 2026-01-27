import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoadingFallback } from '@shared/components/LoadingFallback';
import { AppLayout } from './components/layout/AppLayout';

const AppViewPage = lazy(() => import('./pages/AppViewPage'));
const SearchResultsPage = lazy(() => import('./pages/SearchResultsPage'));

function App() {
  return (
    <AppLayout>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<Navigate to="/ru" replace />} />
          <Route path="/search" element={<SearchResultsPage />} />
          <Route path="/:locale/:section?" element={<AppViewPage />} />
        </Routes>
      </Suspense>
    </AppLayout>
  );
}

export default App;
