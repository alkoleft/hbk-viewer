/**
 * Утилиты для поиска страниц в дереве
 */

/**
 * Находит путь к странице в дереве страниц по pagePath
 * @param pages - массив страниц для поиска
 * @param targetPagePath - pagePath искомой страницы
 * @param currentPath - текущий путь (массив индексов)
 * @param visitedPaths - множество уже посещенных путей для предотвращения циклов
 * @returns путь к странице (массив индексов) или null, если страница не найдена
 */
export function findPagePath(
  pages: any[],
  targetPagePath: string,
  currentPath: number[] = [],
  visitedPaths: Set<string> = new Set()
): number[] | null {
  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const newPath = [...currentPath, i];
    const pathKey = page.pagePath 
      ? `${page.pagePath}-${currentPath.length}`
      : `page-${i}`;

    // Проверяем, не посещали ли мы уже эту страницу на этом уровне
    if (visitedPaths.has(pathKey)) {
      continue;
    }
    visitedPaths.add(pathKey);

    // Проверяем, является ли текущая страница искомой
    if (page.pagePath === targetPagePath) {
      return newPath;
    }

    // Рекурсивно ищем в дочерних элементах
    if (page.children && page.children.length > 0) {
      const newVisitedPaths = new Set(visitedPaths);
      const found = findPagePath(page.children, targetPagePath, newPath, newVisitedPaths);
      if (found) {
        return found;
      }
    }
  }

  return null;
}
