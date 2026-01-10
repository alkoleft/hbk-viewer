import { useState, useCallback } from 'react';

/**
 * Хук для централизованной обработки ошибок
 */
export function useErrorHandler() {
  const [error, setError] = useState<string | null>(null);

  const handleError = useCallback((err: unknown) => {
    const message = err instanceof Error ? err.message : 'Неизвестная ошибка';
    setError(message);
    console.error('Ошибка:', err);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return { error, handleError, clearError };
}
