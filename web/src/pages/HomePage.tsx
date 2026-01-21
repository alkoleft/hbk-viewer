import { useEffect } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { AppHeader } from '../components/layout/AppHeader';
import { useAvailableLocales } from '../hooks/useGlobalData';

export function HomePage() {
  const navigate = useNavigate();
  const { data: availableLocales, isLoading, error } = useAvailableLocales();

  useEffect(() => {
    if (availableLocales && availableLocales.length > 0) {
      // Redirect to the first available locale
      const defaultLocale = availableLocales.includes('ru') ? 'ru' : availableLocales[0];
      navigate(`/${defaultLocale}`, { replace: true });
    }
  }, [availableLocales, navigate]);

  if (error) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          overflow: 'hidden',
        }}
      >
        <AppHeader />
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'background.default',
            p: { xs: 2, md: 0 },
            mt: '64px',
          }}
        >
          <Typography color="error">
            Ошибка загрузки: {error.message}
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      <AppHeader />
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
          p: { xs: 2, md: 0 },
          mt: '64px',
        }}
      >
        {isLoading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <CircularProgress />
            <Typography>Загрузка...</Typography>
          </Box>
        ) : (
          <Typography>Перенаправление...</Typography>
        )}
      </Box>
    </Box>
  );
}
