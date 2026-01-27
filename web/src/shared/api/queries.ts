import { useQuery } from '@tanstack/react-query';
import { apiClient } from './client';
import { queryKeys, searchQueryKeys } from './query-keys';

export function useAppInfo() {
  return useQuery({
    queryKey: queryKeys.appInfo,
    queryFn: ({ signal }) => apiClient.getAppInfo(signal),
    staleTime: 5 * 60 * 1000,
  });
}

export function useGlobalToc(locale: string, depth?: number) {
  return useQuery({
    queryKey: queryKeys.toc.global(locale, depth),
    queryFn: ({ signal }) => apiClient.getGlobalToc(locale, depth, signal),
    enabled: !!locale,
    staleTime: 5 * 60 * 1000,
  });
}

export function useGlobalTocSection(
  locale: string, 
  sectionPath: string, 
  depth?: number, 
  enabled: boolean = true
) {
  return useQuery({
    queryKey: queryKeys.toc.section(locale, sectionPath, depth),
    queryFn: ({ signal }) => apiClient.getGlobalTocSection(locale, sectionPath, depth, signal),
    enabled: !!locale && !!sectionPath && enabled,
    staleTime: 5 * 60 * 1000,
  });
}

export function usePageContentByPath(pagePath: string, locale: string = 'ru', enabled: boolean = true) {
  return useQuery({
    queryKey: queryKeys.content.byPath(pagePath, locale),
    queryFn: ({ signal }) => apiClient.getPageContentByPath(pagePath, locale, signal),
    enabled: !!pagePath && !pagePath.includes('__empty_pl') && enabled,
    staleTime: 10 * 60 * 1000,
  });
}

export function useResolveV8HelpLink(link: string, locale: string = 'ru', enabled: boolean = true) {
  return useQuery({
    queryKey: queryKeys.v8help.resolve(link, locale),
    queryFn: ({ signal }) => apiClient.resolveV8HelpLink(link, locale, signal),
    enabled: !!link && enabled,
    staleTime: 10 * 60 * 1000,
  });
}

export function useResolvePageLocation(pageLocation: string, locale: string = 'ru', enabled: boolean = true) {
  return useQuery({
    queryKey: queryKeys.toc.resolve(pageLocation, locale),
    queryFn: ({ signal }) => apiClient.resolvePageLocation(pageLocation, locale, signal),
    enabled: !!pageLocation && enabled,
    staleTime: 10 * 60 * 1000,
  });
}
export function useSearchToc(query: string, locale: string = 'ru', sectionPath?: string, enabled: boolean = true) {
  return useQuery({
    queryKey: searchQueryKeys.toc(query, locale, sectionPath),
    queryFn: ({ signal }) => apiClient.searchToc(query, locale, sectionPath, signal),
    enabled: !!query.trim() && enabled,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSearchContent(query: string, locale: string = 'ru', limit?: number, enabled: boolean = true) {
  return useQuery({
    queryKey: searchQueryKeys.content(query, locale, limit),
    queryFn: ({ signal }) => apiClient.searchContent(query, locale, limit, signal),
    enabled: !!query.trim() && enabled,
    staleTime: 5 * 60 * 1000,
  });
}

export function useIndexingStatus(refetchInterval?: number) {
  return useQuery({
    queryKey: ['indexing', 'status'],
    queryFn: ({ signal }) => apiClient.getIndexingStatus(signal),
    refetchInterval: refetchInterval || 2000, // Poll every 2 seconds by default
    staleTime: 1000,
  });
}
