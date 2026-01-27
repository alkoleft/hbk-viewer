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
export interface SearchResult {
  title: string;
  location: string;
  bookName: string;
  score: number;
  highlights: string[];
  breadcrumbs?: string[];
}

export interface SearchResponse {
  query: string;
  results: SearchResult[];
  totalHits: number;
  searchTime: number;
}

export interface LocaleIndexingStatus {
  locale: string;
  state: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  progress: number;
  totalDocuments: number;
  indexedDocuments: number;
  startTime?: string;
  endTime?: string;
  errorMessage?: string;
}

export interface IndexingStatus {
  locales: LocaleIndexingStatus[];
  overallProgress: number;
  isIndexingInProgress: boolean;
}
