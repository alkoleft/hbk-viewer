export class UrlManager {
  buildPageUrl(locale: string, section: string, pagePath: string): string {
    const url = new URL(window.location.href);
    url.pathname = `/${locale}/${encodeURIComponent(section)}`;
    url.searchParams.set('page', pagePath);
    return url.toString();
  }
  
  updatePageUrl(pagePath: string): void {
    const url = new URL(window.location.href);
    url.searchParams.set('page', pagePath);
    window.history.pushState({}, '', url.toString());
    window.dispatchEvent(new PopStateEvent('popstate'));
  }
  
  getPageParam(): string | null {
    const params = new URLSearchParams(window.location.search);
    return params.get('page');
  }
}

export const urlManager = new UrlManager();
