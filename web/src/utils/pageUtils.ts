/**
 * Утилиты для работы со страницами
 */

import type { PageDto } from '../types/api';

/**
 * Извлекает заголовок страницы с учетом локали
 * @param page - объект страницы
 * @param locale - локаль ('ru' или 'en')
 * @param fallback - значение по умолчанию, если заголовок не найден
 * @returns заголовок страницы
 */
export function getPageTitle(
  page: PageDto,
  locale: string = 'ru',
  fallback: string = ''
): string {
  if (!page.title) {
    return fallback;
  }

  if (typeof page.title === 'string') {
    return page.title;
  }

  if (typeof page.title === 'object') {
    if (locale === 'en' && page.title.en) {
      return page.title.en;
    }
    return page.title.ru || page.title.en || fallback;
  }

  return fallback;
}

/**
 * Определяет, имеет ли страница дочерние элементы
 * @param page - объект страницы
 * @returns true, если страница имеет дочерние элементы
 */
export function hasPageChildren(page: PageDto): boolean {
  return page.hasChildren === true || 
         (page.hasChildren === undefined && (page.children?.length ?? 0) > 0);
}

/**
 * Определяет, нужно ли загружать дочерние элементы
 * @param page - объект страницы
 * @param isSearchResult - является ли это результатом поиска
 * @returns true, если нужно загружать дочерние элементы
 */
export function shouldLoadPageChildren(page: PageDto, isSearchResult: boolean): boolean {
  const hasChildren = hasPageChildren(page);
  const hasChildrenFromInitialLoad = (page.children?.length ?? 0) > 0;
  const hasNoHtmlPath = !page.htmlPath || page.htmlPath.trim() === '';
  
  return hasChildren && !isSearchResult && !hasChildrenFromInitialLoad && !hasNoHtmlPath;
}
