import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UrlManager } from './url-manager';

describe('UrlManager', () => {
  let urlManager: UrlManager;

  beforeEach(() => {
    urlManager = new UrlManager();
    delete (window as any).location;
    window.location = { href: 'http://localhost:3000/' } as any;
    window.history.pushState = vi.fn();
    window.dispatchEvent = vi.fn();
  });

  describe('buildPageUrl', () => {
    it('should build URL with locale, section and page', () => {
      const url = urlManager.buildPageUrl('ru', 'Test Section', 'test/page');
      expect(url).toContain('/ru/Test%20Section');
      expect(url).toContain('page=test%2Fpage');
    });

    it('should encode special characters in section', () => {
      const url = urlManager.buildPageUrl('en', 'Test & Section', 'page');
      expect(url).toContain('Test%20%26%20Section');
    });
  });

  describe('updatePageUrl', () => {
    it('should update page parameter and push state', () => {
      urlManager.updatePageUrl('new/page');
      expect(window.history.pushState).toHaveBeenCalled();
      expect(window.dispatchEvent).toHaveBeenCalledWith(expect.any(PopStateEvent));
    });
  });

  describe('getPageParam', () => {
    it('should return page parameter from URL', () => {
      window.location = { search: '?page=test/page' } as any;
      expect(urlManager.getPageParam()).toBe('test/page');
    });

    it('should return null if no page parameter', () => {
      window.location = { search: '' } as any;
      expect(urlManager.getPageParam()).toBeNull();
    });
  });
});
