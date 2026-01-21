import type { BookInfo, BookPageContent, BookStructure, PageDto, VersionInfo } from '../types/api';
import { API } from '../constants/config';

/**
 * Клиент для работы с API HBK Reader
 */
export class HbkApiClient {
  /**
   * Получает информацию о приложении (версии + локали)
   * @param signal - опциональный AbortSignal для отмены запроса
   */
  async getAppInfo(signal?: AbortSignal): Promise<{ version: any; availableLocales: string[] }> {
    const response = await fetch(`${API.BASE_URL.replace('/hbk', '')}/app/info`, { signal });
    if (!response.ok) {
      throw new Error(`Ошибка при получении информации о приложении: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Получает глобальное оглавление для указанной локали
   * @param locale - локаль (ru, en, root и т.д.)
   * @param depth - глубина вложенности (должна быть >= 0)
   * @param signal - опциональный AbortSignal для отмены запроса
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
      if (response.status === 404) {
        throw new Error(`Локаль "${locale}" не найдена`);
      }
      throw new Error(`Ошибка при получении глобального оглавления: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Получает дочерние элементы раздела глобального оглавления
   * @param locale - локаль
   * @param sectionPath - путь к разделу
   * @param depth - глубина вложенности (должна быть >= 0)
   * @param signal - опциональный AbortSignal для отмены запроса
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
      if (response.status === 404) {
        throw new Error(`Раздел не найден`);
      }
      throw new Error(`Ошибка при получении содержимого раздела: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Получает список всех доступных HBK файлов
   * @param signal - опциональный AbortSignal для отмены запроса
   */
  async getFiles(signal?: AbortSignal): Promise<BookInfo[]> {
    const response = await fetch(`${API.BASE_URL}/files`, { signal });
    if (!response.ok) {
      throw new Error(`Ошибка при получении списка файлов: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Получает содержимое страницы из HBK файла
   * @param filename - имя файла
   * @param htmlPath - путь к HTML странице (используется вместо title)
   * @param signal - опциональный AbortSignal для отмены запроса
   */
  async getBookPageContent(filename: string, htmlPath?: string, signal?: AbortSignal): Promise<BookPageContent> {
    const url = new URL(`${API.BASE_URL}/files/${filename}/content`, window.location.origin);
    if (htmlPath) {
      url.searchParams.set('htmlPath', htmlPath);
    }
    
    const response = await fetch(url.toString(), { signal });
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Страница "${htmlPath}" не найдена в файле "${filename}"`);
      }
      throw new Error(`Ошибка при получении содержимого: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Получает структуру (оглавление) HBK файла
   * @param filename - имя файла
   * @param depth - глубина загрузки подчиненных элементов (0 = только корневой уровень, 1 = корневой + первый уровень подчиненных, и т.д.)
   * @param signal - опциональный AbortSignal для отмены запроса
   */
  async getBookStructure(
    filename: string,
    depth?: number,
    signal?: AbortSignal
  ): Promise<BookStructure> {
    const url = new URL(`${API.BASE_URL}/files/${filename}/structure`, window.location.origin);
    if (depth !== undefined && depth !== null) {
      url.searchParams.set('depth', depth.toString());
    }
    
    const response = await fetch(url.toString(), { signal });
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Файл "${filename}" не найден`);
      }
      throw new Error(`Ошибка при получении структуры: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Получает дочерние элементы страницы по htmlPath или по пути от корня (path)
   * @param filename - имя файла
   * @param htmlPath - путь к HTML файлу родительской страницы (используется если path не указан)
   * @param path - путь от корня до родительской страницы (массив индексов, например [0, 2, 1])
   * @param signal - опциональный AbortSignal для отмены запроса
   */
  async getBookStructureChildren(
    filename: string,
    htmlPath?: string,
    path?: number[],
    signal?: AbortSignal
  ): Promise<PageDto[]> {
    const url = new URL(`${API.BASE_URL}/files/${filename}/structure/children`, window.location.origin);
    
    // Если указан path, используем его для уникальной идентификации (даже если несколько элементов имеют одинаковый htmlPath)
    if (path && path.length > 0) {
      url.searchParams.set('path', path.join(','));
    } else if (htmlPath) {
      // Для обратной совместимости используем htmlPath
      url.searchParams.set('htmlPath', htmlPath);
    } else {
      throw new Error('Необходимо указать либо htmlPath, либо path');
    }
    
    const response = await fetch(url.toString(), { signal });
    if (!response.ok) {
      if (response.status === 404) {
        const identifier = path ? `path [${path.join(',')}]` : `htmlPath "${htmlPath}"`;
        throw new Error(`Страница с ${identifier} не найдена в файле "${filename}"`);
      }
      throw new Error(`Ошибка при получении дочерних элементов: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Выполняет поиск страниц в оглавлении файла
   * @param filename - имя файла
   * @param query - поисковый запрос
   * @param signal - опциональный AbortSignal для отмены запроса
   */
  async searchBookStructure(filename: string, query: string, signal?: AbortSignal): Promise<PageDto[]> {
    if (!query.trim()) {
      return [];
    }
    
    const url = new URL(`${API.BASE_URL}/files/${filename}/structure/search`, window.location.origin);
    url.searchParams.set('query', query);
    
    const response = await fetch(url.toString(), { signal });
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Файл "${filename}" не найден`);
      }
      throw new Error(`Ошибка при поиске: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Получает информацию о версиях приложения и платформы 1С
   * @param platformPath - опциональный путь к директории установки платформы 1С
   * @param signal - опциональный AbortSignal для отмены запроса
   */
  async getVersion(platformPath?: string, signal?: AbortSignal): Promise<VersionInfo> {
    const url = new URL(`${API.BASE_URL}/version`, window.location.origin);
    if (platformPath) {
      url.searchParams.set('platformPath', platformPath);
    }
    
    const response = await fetch(url.toString(), { signal });
    if (!response.ok) {
      throw new Error(`Ошибка при получении версий: ${response.statusText}`);
    }
    return response.json();
  }
}

export const apiClient = new HbkApiClient();
