import { useEffect } from 'react';
import type { BookStructure } from '../types/api';
import { findPagePath } from '../utils/findPagePath';
import { getPageTitle } from '../utils/pageUtils';

interface UsePageTitleOptions {
  structure: BookStructure | null;
  pageName?: string;
  currentLocale?: string;
  defaultTitle?: string;
}

/**
 * Хук для обновления заголовка страницы в браузере
 */
export function usePageTitle({
  structure,
  pageName,
  currentLocale = 'ru',
  defaultTitle = '1C:Help Book (HBK) Viewer',
}: UsePageTitleOptions) {
  useEffect(() => {
    if (!structure || !pageName) {
      document.title = defaultTitle;
      return;
    }

    const pagePath = findPagePath(structure.pages, pageName);
    if (pagePath && pagePath.length > 0) {
      const currentPage = pagePath[pagePath.length - 1];
      const pageTitle = getPageTitle(currentPage, currentLocale, pageName);
      document.title = `${pageTitle} - ${defaultTitle}`;
    } else {
      document.title = `${pageName} - ${defaultTitle}`;
    }
  }, [structure, pageName, currentLocale, defaultTitle]);
}
