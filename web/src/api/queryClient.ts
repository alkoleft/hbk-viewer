import { QueryClient } from '@tanstack/react-query';

/**
 * Конфигурация QueryClient для React Query
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 минут - данные считаются свежими
      gcTime: 10 * 60 * 1000, // 10 минут - время хранения в кэше (было cacheTime)
      retry: 1, // Повторить запрос 1 раз при ошибке
      refetchOnWindowFocus: false, // Не обновлять при фокусе окна
      refetchOnReconnect: true, // Обновить при восстановлении соединения
    },
  },
});
