/**
 * Типы данных для API
 */

export interface PageDto {
  title: string;
  pagePath: string;
  path: number[];
  children: PageDto[] | null; // null = не загружено, [] = загружено но пусто, [...] = загружено с данными
  hasChildren: boolean;
}

export interface AppInfo {
  version: {
    application: string;
    platform: string;
  };
  availableLocales: string[];
}

export interface PageContent {
  filename: string;
  pageName: string;
  content: string;
}
