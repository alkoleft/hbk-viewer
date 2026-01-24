import type { PageDto, AppInfo, V8HelpResolveResult } from '@shared/types';
import { API_BASE_URL } from './query-keys';

class ApiClient {
  async getAppInfo(signal?: AbortSignal): Promise<AppInfo> {
    const response = await fetch(`${API_BASE_URL}/app/info`, { signal });
    if (!response.ok) throw new Error(`Failed to fetch app info: ${response.statusText}`);
    return response.json();
  }

  async getGlobalToc(locale: string, depth?: number, signal?: AbortSignal): Promise<PageDto[]> {
    const url = new URL(`${API_BASE_URL}/toc/`, window.location.origin);
    if (depth !== undefined) url.searchParams.set('depth', depth.toString());
    
    const response = await fetch(url.toString(), { 
      signal, 
      headers: { 'Accept-Language': locale } 
    });
    if (!response.ok) throw new Error(`Failed to fetch global TOC: ${response.statusText}`);
    return response.json();
  }

  async getGlobalTocSection(
    locale: string, 
    sectionPath: string, 
    depth?: number, 
    signal?: AbortSignal
  ): Promise<PageDto[]> {
    const url = new URL(`${API_BASE_URL}/toc/${sectionPath}`, window.location.origin);
    if (depth !== undefined) url.searchParams.set('depth', depth.toString());
    
    const response = await fetch(url.toString(), { 
      signal, 
      headers: { 'Accept-Language': locale } 
    });
    if (!response.ok) throw new Error(`Failed to fetch TOC section: ${response.statusText}`);
    return response.json();
  }

  async getPageContentByPath(
    pagePath: string, 
    locale: string, 
    signal?: AbortSignal
  ): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/content/${pagePath}`, { 
      signal, 
      headers: { 'Accept-Language': locale } 
    });
    if (!response.ok) throw new Error(`Failed to fetch page content: ${response.statusText}`);
    return response.text();
  }

  async resolveV8HelpLink(
    link: string, 
    locale: string, 
    signal?: AbortSignal
  ): Promise<V8HelpResolveResult> {
    const url = new URL(`${API_BASE_URL}/toc/resolve/v8help`, window.location.origin);
    url.searchParams.set('link', link);
    
    const response = await fetch(url.toString(), { 
      signal, 
      headers: { 'Accept-Language': locale } 
    });
    if (!response.ok) throw new Error(`Failed to resolve v8help link: ${response.statusText}`);
    return response.json();
  }
}

export const apiClient = new ApiClient();
