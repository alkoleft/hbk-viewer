import { http, HttpResponse } from 'msw';
import type { PageDto, AppInfo } from '@shared/types';

const API_BASE = '/api';

export const mockAppInfo: AppInfo = {
  version: '0.2.0',
  platformVersion: '8.3.25.1257',
};

export const mockPages: PageDto[] = [
  {
    title: 'Test Section',
    pagePath: 'test/section',
    path: ['test', 'section'],
    hasChildren: true,
    children: [],
  },
];

export const handlers = [
  http.get(`${API_BASE}/app/info`, () => {
    return HttpResponse.json(mockAppInfo);
  }),

  http.get(`${API_BASE}/toc/`, () => {
    return HttpResponse.json(mockPages);
  }),

  http.get(`${API_BASE}/toc/*`, ({ request }) => {
    const url = new URL(request.url);
    const sectionPath = url.pathname.replace(`${API_BASE}/toc/`, '');
    return HttpResponse.json([
      {
        title: `Child of ${sectionPath}`,
        pagePath: `${sectionPath}/child`,
        path: [sectionPath, 'child'],
        hasChildren: false,
      },
    ]);
  }),

  http.get(`${API_BASE}/content/*`, ({ request }) => {
    const url = new URL(request.url);
    const pagePath = url.pathname.replace(`${API_BASE}/content/`, '');
    return HttpResponse.text(`<h1>Content for ${pagePath}</h1>`);
  }),
];
