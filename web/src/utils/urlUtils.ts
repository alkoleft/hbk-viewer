/**
 * Утилиты для работы с URL
 */

/**
 * Строит URL для страницы
 */
export function buildPageUrl(bookName: string, pagePath: string): string {
  return `/view/${bookName}/${pagePath}`;
}
