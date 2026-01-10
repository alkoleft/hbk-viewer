import { useRef, useEffect, useCallback } from 'react';

/**
 * Хук для управления AbortController для отмены запросов
 * Автоматически отменяет запросы при размонтировании компонента или при вызове reset
 */
export function useAbortController() {
  const abortControllerRef = useRef<AbortController | null>(null);

  const getSignal = useCallback((): AbortSignal => {
    // Если контроллер уже существует и не был отменен, создаем новый
    if (abortControllerRef.current && !abortControllerRef.current.signal.aborted) {
      // Отменяем предыдущий запрос при создании нового
      abortControllerRef.current.abort();
    }
    
    // Создаем новый контроллер
    abortControllerRef.current = new AbortController();
    return abortControllerRef.current.signal;
  }, []);

  const abort = useCallback(() => {
    if (abortControllerRef.current && !abortControllerRef.current.signal.aborted) {
      abortControllerRef.current.abort();
    }
  }, []);

  const reset = useCallback(() => {
    abort();
    abortControllerRef.current = null;
  }, [abort]);

  // Отменяем запросы при размонтировании компонента
  useEffect(() => {
    return () => {
      if (abortControllerRef.current && !abortControllerRef.current.signal.aborted) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return { getSignal, abort, reset };
}
