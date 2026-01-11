import { Box, Alert, Button } from '@mui/material';

interface ErrorDisplayProps {
  error: string;
  onRetry?: () => void;
  sx?: object;
}

export function ErrorDisplay({ error, onRetry, sx }: ErrorDisplayProps) {
  return (
    <Box sx={{ p: 3, ...sx }}>
      <Alert severity="error" sx={{ mb: 2 }}>
        Ошибка: {error}
      </Alert>
      {onRetry && (
        <Button variant="contained" onClick={onRetry}>
          Повторить
        </Button>
      )}
    </Box>
  );
}
