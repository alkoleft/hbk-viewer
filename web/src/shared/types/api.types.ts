export interface PageDto {
  title: string;
  pagePath: string;
  path: number[];
  children: PageDto[] | null;
  hasChildren: boolean;
}

export interface AppInfo {
  version: {
    application: string;
    platform: string;
  };
  availableLocales: string[];
}

export interface V8HelpResolveResult {
  sectionTitle: string;
  pageLocation: string;
  sectionPath: string;
  pagePath: string[];
}
