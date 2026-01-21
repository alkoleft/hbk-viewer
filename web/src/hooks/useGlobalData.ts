import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';

export function useAvailableLocales() {
  return useQuery({
    queryKey: ['app-info'],
    queryFn: ({ signal }) => apiClient.getAppInfo(signal),
    select: (data) => data.availableLocales,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useGlobalToc(locale: string, depth?: number) {
  return useQuery({
    queryKey: ['global-toc', locale, depth],
    queryFn: ({ signal }) => apiClient.getGlobalToc(locale, depth, signal),
    enabled: !!locale,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useGlobalTocSection(locale: string, sectionPath: string, depth?: number) {
  return useQuery({
    queryKey: ['global-toc-section', locale, sectionPath, depth],
    queryFn: ({ signal }) => apiClient.getGlobalTocSection(locale, sectionPath, depth, signal),
    enabled: !!locale && !!sectionPath,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
