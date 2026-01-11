import { useState, useEffect, useMemo } from 'react';
import type { PageDto } from '../types/api';
import { findPagePath } from '../utils/findPagePath';

interface UseBreadcrumbsOptions {
  pages: PageDto[];
  currentPageName: string;
  filename?: string;
}

/**
 * Хук для получения пути breadcrumbs к текущей странице
 */
export function useBreadcrumbs({ pages, currentPageName }: UseBreadcrumbsOptions) {
  const [path, setPath] = useState<PageDto[] | null>(null);

  // Находим путь в доступных страницах
  const initialPath = useMemo(() => {
    if (!currentPageName || pages.length === 0) {
      return null;
    }
    return findPagePath(pages, currentPageName);
  }, [pages, currentPageName]);

  // Если путь найден сразу, используем его
  useEffect(() => {
    if (initialPath) {
      setPath(initialPath);
      return;
    }

    // Если путь не найден, пытаемся загрузить недостающие children
    // Это упрощенная версия - в реальности может потребоваться более сложная логика
    setPath(null);
  }, [initialPath]);

  return {
    path: path || initialPath,
    isLoading: false,
  };
}
