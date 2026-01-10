import { useState, useEffect, useCallback, useRef } from 'react';
import type { BookInfo } from '../types/api';
import { apiClient } from '../api/client';
import { isAbortError, getErrorMessage } from '../utils/errorUtils';

/**
 * Хук для работы со списком файлов
 */
export function useFileList() {
  const [files, setFiles] = useState<BookInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const loadFiles = useCallback(async () => {
    // Отменяем предыдущий запрос, если он существует
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Создаем новый AbortController
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      setLoading(true);
      setError(null);
      const fileList = await apiClient.getFiles(abortController.signal);
      
      // Проверяем, не был ли запрос отменен
      if (!abortController.signal.aborted) {
        setFiles(fileList);
      }
    } catch (err) {
      // Игнорируем ошибки отмены запросов
      if (!isAbortError(err) && !abortController.signal.aborted) {
        setError(getErrorMessage(err));
      }
    } finally {
      if (!abortController.signal.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadFiles();

    // Отменяем запрос при размонтировании компонента
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [loadFiles]);

  return { files, loading, error, reload: loadFiles };
}
