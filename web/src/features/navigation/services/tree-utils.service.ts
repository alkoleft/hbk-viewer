import type { PageDto } from '@shared/types';

/**
 * Creates a unique node ID for tree navigation
 * 
 * @param page - Page data object
 * @param level - Nesting level in the tree
 * @returns Unique node identifier
 */
export const createNodeId = (page: PageDto, level: number): string => {
  return `${page.pagePath}-${level}`;
};

/**
 * Recursively finds a page by its path in the tree
 * 
 * @param pages - Array of pages to search
 * @param pagePath - Path of the page to find
 * @returns Found page or null
 */
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

/**
 * Checks if a page has children (loaded or unloaded)
 * 
 * @param page - Page to check
 * @returns True if page has children
 */
export const hasPageChildren = (page: PageDto): boolean => {
  return page.hasChildren || (page.children != null && page.children.length > 0);
};

/**
 * Determines if page children should be loaded from API
 * 
 * @param page - Page to check
 * @param isSearchResult - Whether this is a search result
 * @returns True if children should be loaded
 */
export const shouldLoadPageChildren = (page: PageDto, isSearchResult: boolean): boolean => {
  if (isSearchResult) return false;
  if (!page.hasChildren) return false;
  // If children array exists (even empty), they are already loaded
  if (Array.isArray(page.children)) return false;
  // Children not loaded yet (undefined or null)
  return true;
};

/**
 * Gets page title with fallback
 * 
 * @param page - Page object
 * @returns Page title or default text
 */
export const getPageTitle = (page: PageDto): string => {
  return page.title || 'Без названия';
};
