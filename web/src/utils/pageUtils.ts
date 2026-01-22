/**
 * Утилиты для работы со страницами
 */

import type { PageDto } from '../types/api';

/**
 * Извлекает заголовок страницы
 */
export function getPageTitle(page: PageDto): string {
  return page.title;
}

/**
 * Определяет, имеет ли страница дочерние элементы
 */
export function hasPageChildren(page: PageDto): boolean {
  return page.hasChildren || (page.children && page.children.length > 0);
}

/**
 * Определяет, нужно ли загружать дочерние элементы
 */
export function shouldLoadPageChildren(page: PageDto, isSearchResult: boolean): boolean {
  const hasChildren = hasPageChildren(page);
  const hasChildrenFromInitialLoad = page.children && page.children.length > 0;
  const hasNoPagePath = !page.pagePath || page.pagePath.trim() === '';
  
  return hasChildren && !isSearchResult && !hasChildrenFromInitialLoad && !hasNoPagePath;
}
