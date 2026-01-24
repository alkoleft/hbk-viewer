import { describe, it, expect } from 'vitest';
import {
  createNodeId,
  findPageByPath,
  hasPageChildren,
  shouldLoadPageChildren,
  getPageTitle,
} from './tree-utils.service';
import type { PageDto } from '@shared/types';

describe('tree-utils.service', () => {
  const mockPage: PageDto = {
    title: 'Test Page',
    pagePath: 'test/page',
    path: ['test', 'page'],
    hasChildren: false,
  };

  describe('createNodeId', () => {
    it('should create unique node ID', () => {
      expect(createNodeId(mockPage, 0)).toBe('test/page-0');
      expect(createNodeId(mockPage, 1)).toBe('test/page-1');
    });
  });

  describe('findPageByPath', () => {
    it('should find page at root level', () => {
      const pages = [mockPage];
      expect(findPageByPath(pages, 'test/page')).toBe(mockPage);
    });

    it('should find nested page', () => {
      const child: PageDto = { ...mockPage, pagePath: 'test/child' };
      const parent: PageDto = { ...mockPage, children: [child] };
      expect(findPageByPath([parent], 'test/child')).toBe(child);
    });

    it('should return null if not found', () => {
      expect(findPageByPath([mockPage], 'nonexistent')).toBeNull();
    });
  });

  describe('hasPageChildren', () => {
    it('should return true if hasChildren flag is set', () => {
      expect(hasPageChildren({ ...mockPage, hasChildren: true })).toBe(true);
    });

    it('should return true if children array exists', () => {
      expect(hasPageChildren({ ...mockPage, children: [mockPage] })).toBe(true);
    });

    it('should return false if no children', () => {
      expect(hasPageChildren(mockPage)).toBe(false);
    });
  });

  describe('shouldLoadPageChildren', () => {
    it('should return false for search results', () => {
      expect(shouldLoadPageChildren({ ...mockPage, hasChildren: true }, true)).toBe(false);
    });

    it('should return true if has children but not loaded', () => {
      expect(shouldLoadPageChildren({ ...mockPage, hasChildren: true }, false)).toBe(true);
    });

    it('should return false if children already loaded', () => {
      expect(shouldLoadPageChildren({ ...mockPage, hasChildren: true, children: [] }, false)).toBe(false);
    });
  });

  describe('getPageTitle', () => {
    it('should return page title', () => {
      expect(getPageTitle(mockPage)).toBe('Test Page');
    });

    it('should return default title if missing', () => {
      expect(getPageTitle({ ...mockPage, title: '' })).toBe('Без названия');
    });
  });
});
