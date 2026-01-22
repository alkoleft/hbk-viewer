import type { PageDto, AppInfo, PageContent } from '../types/api';
import { API } from '../constants/config';

/**
 * Упрощенный клиент для работы с новым API
 */
export class HbkApiClient {
  /**
   * Получает информацию о приложении
   */
  async getAppInfo(signal?: AbortSignal): Promise<AppInfo> {
    const response = await fetch(`${API.BASE_URL.replace('/hbk', '')}/app/info`, { signal });
    if (!response.ok) {
      throw new Error(`Ошибка при получении информации о приложении: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Получает глобальное оглавление
   */
  async getGlobalToc(locale: string, depth?: number, signal?: AbortSignal): Promise<PageDto[]> {
    const url = new URL(`${API.BASE_URL.replace('/hbk', '')}/toc/`, window.location.origin);
    if (depth !== undefined) {
      url.searchParams.set('depth', depth.toString());
    }
    
    const headers: HeadersInit = {};
    if (locale !== 'root') {
      headers['Accept-Language'] = locale;
    }
    
    const response = await fetch(url.toString(), { signal, headers });
    if (!response.ok) {
      throw new Error(`Ошибка при получении глобального оглавления: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Получает дочерние элементы раздела
   */
  async getGlobalTocSection(locale: string, sectionPath: string, depth?: number, signal?: AbortSignal): Promise<PageDto[]> {
    const url = new URL(`${API.BASE_URL.replace('/hbk', '')}/toc/${sectionPath}`, window.location.origin);
    if (depth !== undefined) {
      url.searchParams.set('depth', depth.toString());
    }
    
    const headers: HeadersInit = {};
    if (locale !== 'root') {
      headers['Accept-Language'] = locale;
    }
    
    const response = await fetch(url.toString(), { signal, headers });
    if (!response.ok) {
      throw new Error(`Ошибка при получении содержимого раздела: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Получает содержимое страницы
   */
  async getPageContent(bookName: string, pagePath: string, signal?: AbortSignal): Promise<PageContent> {
    const response = await fetch(`${API.BASE_URL}/books/${bookName}/${pagePath}`, { signal });
    if (!response.ok) {
      throw new Error(`Ошибка при получении содержимого страницы: ${response.statusText}`);
    }
    return response.json();
  }
}

export const apiClient = new HbkApiClient();
