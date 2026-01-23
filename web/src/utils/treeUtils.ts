import type { PageDto } from '../types/api';

/**
 * Создает уникальный ID для узла дерева
 */
export function createNodeId(page: PageDto, level: number): string {
  return `${page.pagePath}-${level}`;
}

/**
 * Находит страницу в дереве по pagePath
 */
export function findPageByPath(pages: PageDto[], targetPath: string): PageDto | null {
  console.log(`🔎 findPageByPath: searching for "${targetPath}" in ${pages.length} pages`);
  for (const page of pages) {
    console.log(`  - Checking: "${page.title}" (${page.pagePath})`);
    if (page.pagePath === targetPath) {
      console.log(`  ✅ Found match: "${page.title}"`);
      return page;
    }
    if (page.children && page.children.length > 0) {
      const found = findPageByPath(page.children, targetPath);
      if (found) return found;
    }
  }
  console.log(`  ❌ Not found: "${targetPath}"`);
  return null;
}
