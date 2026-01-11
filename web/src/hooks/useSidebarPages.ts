import { useMemo } from 'react';
import type { PageDto } from '../types/api';

interface UseSidebarPagesOptions {
  pages: PageDto[];
  searchResults: PageDto[];
  searchQuery: string;
}

/**
 * Хук для определения, какие страницы показывать в сайдбаре
 * @returns массив страниц для отображения
 */
export function useSidebarPages({
  pages,
  searchResults,
  searchQuery,
}: UseSidebarPagesOptions): PageDto[] {
  return useMemo(() => {
    if (searchQuery.trim()) {
      return searchResults;
    }
    return pages;
  }, [searchQuery, searchResults, pages]);
}
