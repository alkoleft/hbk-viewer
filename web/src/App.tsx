import { Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { theme } from './theme';
import { AppViewPage } from './pages/AppViewPage';
import { TreeStateProvider } from './contexts/TreeStateContext';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <TreeStateProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/ru" replace />} />
            <Route path="/:locale/:section?" element={<AppViewPage />} />
          </Routes>
        </TreeStateProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
