import type { PageDto } from '@shared/types';

export const createNodeId = (page: PageDto, level: number): string => {
  return `${page.pagePath}-${level}`;
};

export const findPageByPath = (pages: PageDto[], pagePath: string): PageDto | null => {
  for (const page of pages) {
    if (page.pagePath === pagePath) return page;
    if (page.children) {
      const found = findPageByPath(page.children, pagePath);
      if (found) return found;
    }
  }
  return null;
};

export const hasPageChildren = (page: PageDto): boolean => {
  return page.hasChildren || (page.children != null && page.children.length > 0);
};

export const shouldLoadPageChildren = (page: PageDto, isSearchResult: boolean): boolean => {
  if (isSearchResult) return false;
  if (!page.hasChildren) return false;
  return page.children === null || page.children === undefined || page.children.length === 0;
};

export const getPageTitle = (page: PageDto): string => {
  return page.title || 'Без названия';
};
