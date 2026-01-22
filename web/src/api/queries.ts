import { useQuery } from '@tanstack/react-query';
import { apiClient } from './client';

/**
 * Хук для получения информации о приложении
 */
export function useAppInfo() {
  return useQuery({
    queryKey: ['app-info'],
    queryFn: ({ signal }) => apiClient.getAppInfo(signal),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Хук для получения глобального оглавления
 */
export function useGlobalToc(locale: string, depth?: number) {
  return useQuery({
    queryKey: ['global-toc', locale, depth],
    queryFn: ({ signal }) => apiClient.getGlobalToc(locale, depth, signal),
    enabled: !!locale,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Хук для получения дочерних элементов раздела
 */
export function useGlobalTocSection(locale: string, sectionPath: string, depth?: number, enabled: boolean = true) {
  return useQuery({
    queryKey: ['global-toc-section', locale, sectionPath, depth],
    queryFn: ({ signal }) => apiClient.getGlobalTocSection(locale, sectionPath, depth, signal),
    enabled: !!locale && !!sectionPath && enabled,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Хук для получения содержимого страницы по пути
 */
export function usePageContentByPath(pagePath: string, locale: string = 'ru') {
  return useQuery({
    queryKey: ['page-content-by-path', pagePath, locale],
    queryFn: ({ signal }) => apiClient.getPageContentByPath(pagePath, locale, signal),
    enabled: !!pagePath && !pagePath.includes('__empty_pl'), // Не загружаем пустые страницы
    staleTime: 10 * 60 * 1000,
  });
}
