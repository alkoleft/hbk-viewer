import { Box, CircularProgress } from '@mui/material';

/**
 * Loading fallback component displayed during lazy loading of routes
 * 
 * @example
 * ```tsx
 * <Suspense fallback={<LoadingFallback />}>
 *   <LazyComponent />
 * </Suspense>
 * ```
 */
export function LoadingFallback() {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        width: '100%',
      }}
    >
      <CircularProgress />
    </Box>
  );
}
