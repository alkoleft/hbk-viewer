import type { PageDto } from '../types/api';

/**
 * Рекурсивно находит путь к странице в дереве страниц
 * @param pagesList - список страниц для поиска
 * @param targetHtmlPath - htmlPath искомой страницы
 * @param currentPath - текущий путь (для рекурсии)
 * @param visitedPaths - множество посещенных путей для предотвращения циклов
 * @returns путь к странице или null, если не найдена
 */
export function findPagePath(
  pagesList: PageDto[],
  targetHtmlPath: string,
  currentPath: PageDto[] = [],
  visitedPaths: Set<string> = new Set()
): PageDto[] | null {
  for (const page of pagesList) {
    // Используем path для уникальной идентификации страницы, если он доступен
    const pageKey = page.path && page.path.length > 0 
      ? page.path.join(',') 
      : `${page.htmlPath}-${currentPath.length}`;
    
    // Проверяем, не посещали ли мы уже эту страницу
    if (visitedPaths.has(pageKey)) {
      continue;
    }
    
    const newPath = [...currentPath, page];
    const newVisitedPaths = new Set(visitedPaths);
    newVisitedPaths.add(pageKey);
    
    // Если это искомая страница, возвращаем путь
    if (page.htmlPath === targetHtmlPath) {
      return newPath;
    }
    
    // Ищем в children, если они есть
    const children = page.children || [];
    if (children.length > 0 && currentPath.length < 50) {
      const found = findPagePath(children, targetHtmlPath, newPath, newVisitedPaths);
      if (found) {
        return found;
      }
    }
  }
  return null;
}
