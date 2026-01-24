import { http, HttpResponse } from 'msw';
import type { PageDto, AppInfo } from '@shared/types';

const API_BASE = '/api';

export const mockAppInfo: AppInfo = {
  version: {
    application: '0.2.0',
    platform: '8.3.25.1257',
  },
  availableLocales: ['ru', 'en'],
};

export const mockPages: PageDto[] = [
  {
    title: 'Test Section',
    pagePath: 'test/section',
    path: [0, 1],
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
        path: [0, 1],
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
