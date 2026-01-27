export const routes = {
  root: '/',
  search: '/search',
  app: (locale: string, section?: string) => {
    if (section) {
      return `/${locale}/${encodeURIComponent(section)}`;
    }
    return `/${locale}`;
  },
  appWithPage: (locale: string, section: string, pagePath: string) => {
    return `/${locale}/${encodeURIComponent(section)}?page=${encodeURIComponent(pagePath)}`;
  },
} as const;

export type RouteParams = {
  locale: string;
  section?: string;
};
