import { describe, it, expect } from 'vitest';
import { apiClient } from './client';
import { server } from '@shared/test/mocks/server';
import { http, HttpResponse } from 'msw';

describe('ApiClient', () => {
  describe('getAppInfo', () => {
    it('should fetch app info', async () => {
      const info = await apiClient.getAppInfo();
      expect(info).toEqual({
        version: '0.2.0',
        platformVersion: '8.3.25.1257',
      });
    });

    it('should throw error on failed request', async () => {
      server.use(
        http.get('/api/app/info', () => {
          return new HttpResponse(null, { status: 500 });
        })
      );

      await expect(apiClient.getAppInfo()).rejects.toThrow();
    });
  });

  describe('getGlobalToc', () => {
    it('should fetch global TOC with locale', async () => {
      const toc = await apiClient.getGlobalToc('ru');
      expect(toc).toHaveLength(1);
      expect(toc[0].title).toBe('Test Section');
    });

    it('should include depth parameter when provided', async () => {
      const toc = await apiClient.getGlobalToc('ru', 2);
      expect(toc).toBeDefined();
    });
  });

  describe('getGlobalTocSection', () => {
    it('should fetch section children', async () => {
      const children = await apiClient.getGlobalTocSection('ru', 'test/section');
      expect(children).toHaveLength(1);
      expect(children[0].title).toContain('Child of');
    });
  });

  describe('getPageContentByPath', () => {
    it('should fetch page content as HTML', async () => {
      const content = await apiClient.getPageContentByPath('test/page', 'ru');
      expect(content).toContain('<h1>Content for');
    });
  });
});
