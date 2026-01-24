export const API_BASE_URL = '/api';

export const queryKeys = {
  appInfo: ['app-info'] as const,
  
  toc: {
    all: ['toc'] as const,
    global: (locale: string, depth?: number) => 
      [...queryKeys.toc.all, 'global', locale, depth] as const,
    section: (locale: string, sectionPath: string, depth?: number) => 
      [...queryKeys.toc.all, 'section', locale, sectionPath, depth] as const,
  },
  
  content: {
    all: ['content'] as const,
    byPath: (pagePath: string, locale: string) => 
      [...queryKeys.content.all, 'by-path', pagePath, locale] as const,
  },
  
  v8help: {
    all: ['v8help'] as const,
    resolve: (link: string, locale: string) => 
      [...queryKeys.v8help.all, 'resolve', link, locale] as const,
  },
} as const;
