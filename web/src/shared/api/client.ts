import type { PageDto, AppInfo, V8HelpResolveResult, SearchResponse, IndexingStatus } from '@shared/types';
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
    const url = new URL(`${API_BASE_URL}/v8help/resolve`, window.location.origin);
    url.searchParams.set('link', link);
    
    const response = await fetch(url.toString(), { 
      signal, 
      headers: { 'Accept-Language': locale } 
    });
    if (!response.ok) throw new Error(`Failed to resolve v8help link: ${response.statusText}`);
    return response.json();
  }

  async resolvePageLocation(
    pageLocation: string, 
    locale: string, 
    signal?: AbortSignal
  ): Promise<V8HelpResolveResult> {
    const url = new URL(`${API_BASE_URL}/toc/resolve`, window.location.origin);
    url.searchParams.set('pageLocation', pageLocation);
    
    const response = await fetch(url.toString(), { 
      signal, 
      headers: { 'Accept-Language': locale } 
    });
    if (!response.ok) throw new Error(`Failed to resolve page location: ${response.statusText}`);
    return response.json();
  }

  async getV8HelpContent(
    pagePath: string, 
    locale: string, 
    signal?: AbortSignal
  ): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/v8help/content/${pagePath}`, { 
      signal, 
      headers: { 'Accept-Language': locale } 
    });
    if (!response.ok) throw new Error(`Failed to fetch v8help content: ${response.statusText}`);
    return response.text();
  }

  async searchToc(
    query: string,
    locale: string,
    sectionPath?: string,
    signal?: AbortSignal
  ): Promise<PageDto[]> {
    const url = new URL(`${API_BASE_URL}/toc/search`, window.location.origin);
    url.searchParams.set("query", query);
    if (sectionPath) url.searchParams.set("sectionPath", sectionPath);
    
    const response = await fetch(url.toString(), { 
      signal, 
      headers: { "Accept-Language": locale } 
    });
    if (!response.ok) throw new Error(`Failed to search TOC: ${response.statusText}`);
    return response.json();
  }

  async searchContent(
    query: string,
    locale: string,
    limit?: number,
    signal?: AbortSignal
  ): Promise<SearchResponse> {
    const url = new URL(`${API_BASE_URL}/search`, window.location.origin);
    url.searchParams.set("query", query);
    if (limit) url.searchParams.set("limit", limit.toString());
    
    const response = await fetch(url.toString(), { 
      signal, 
      headers: { "Accept-Language": locale } 
    });
    if (!response.ok) throw new Error(`Failed to search content: ${response.statusText}`);
    return response.json();
  }

  async getIndexingStatus(signal?: AbortSignal): Promise<IndexingStatus> {
    const url = new URL(`${API_BASE_URL}/indexing/status`, window.location.origin);
    
    const response = await fetch(url.toString(), { signal });
    if (!response.ok) throw new Error(`Failed to get indexing status: ${response.statusText}`);
    return response.json();
  }
}

export const apiClient = new ApiClient();
