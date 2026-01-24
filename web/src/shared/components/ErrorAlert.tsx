import { Alert, AlertTitle, Box } from '@mui/material';

interface ErrorAlertProps {
  /** Error object or error message string */
  error: Error | string;
  /** Optional title for the alert (default: "Ошибка") */
  title?: string;
}

/**
 * Displays an error message in a Material-UI Alert component
 * 
 * @param props - Component props
 * @returns Alert component with error message
 * 
 * @example
 * ```tsx
 * <ErrorAlert error={new Error('Something went wrong')} />
 * <ErrorAlert error="Custom error message" title="Внимание" />
 * ```
 */
export function ErrorAlert({ error, title = 'Ошибка' }: ErrorAlertProps) {
  const message = typeof error === 'string' ? error : error.message;

  return (
    <Box sx={{ p: 2 }}>
      <Alert severity="error">
        <AlertTitle>{title}</AlertTitle>
        {message}
      </Alert>
    </Box>
  );
}
