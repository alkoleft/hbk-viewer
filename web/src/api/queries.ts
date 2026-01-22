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
export function useGlobalTocSection(locale: string, sectionPath: string, depth?: number) {
  return useQuery({
    queryKey: ['global-toc-section', locale, sectionPath, depth],
    queryFn: ({ signal }) => apiClient.getGlobalTocSection(locale, sectionPath, depth, signal),
    enabled: !!locale && !!sectionPath,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Хук для получения содержимого страницы
 */
export function usePageContent(bookName: string, pagePath: string) {
  return useQuery({
    queryKey: ['page-content', bookName, pagePath],
    queryFn: ({ signal }) => apiClient.getPageContent(bookName, pagePath, signal),
    enabled: !!bookName && !!pagePath,
    staleTime: 10 * 60 * 1000,
  });
}
