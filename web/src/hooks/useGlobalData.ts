import { useQuery } from '@tanstack/react-query';
import { useAppInfo, useGlobalToc } from '../api/queries';
import { apiClient } from '../api/client';

export function useAvailableLocales() {
  const { data: appInfo } = useAppInfo();
  return appInfo?.availableLocales || [];
}

export { useGlobalToc };

export function useGlobalTocSection(locale: string, sectionPath: string, depth?: number, enabled: boolean = true) {
  return useQuery({
    queryKey: ['global-toc-section', locale, sectionPath, depth],
    queryFn: ({ signal }) => apiClient.getGlobalTocSection(locale, sectionPath, depth, signal),
    enabled: !!locale && !!sectionPath && enabled,
    staleTime: 5 * 60 * 1000,
  });
}
