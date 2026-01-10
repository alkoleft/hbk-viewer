import type { BookInfo, FileContent, FileStructure, PageDto } from '../types/api';
import { API_BASE_URL } from '../constants/config';

/**
 * Клиент для работы с API HBK Reader
 */
export class HbkApiClient {
  /**
   * Получает список всех доступных HBK файлов
   * @param signal - опциональный AbortSignal для отмены запроса
   */
  async getFiles(signal?: AbortSignal): Promise<BookInfo[]> {
    const response = await fetch(`${API_BASE_URL}/files`, { signal });
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
  async getFileContent(filename: string, htmlPath?: string, signal?: AbortSignal): Promise<FileContent> {
    const url = new URL(`${API_BASE_URL}/files/${filename}/content`, window.location.origin);
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
   * @param includeChildren - если true, возвращает полную иерархию (по умолчанию false для оптимизации)
   * @param signal - опциональный AbortSignal для отмены запроса
   */
  async getFileStructure(filename: string, includeChildren: boolean = false, signal?: AbortSignal): Promise<FileStructure> {
    const url = new URL(`${API_BASE_URL}/files/${filename}/structure`, window.location.origin);
    if (includeChildren) {
      url.searchParams.set('includeChildren', 'true');
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
   * Получает дочерние элементы страницы по htmlPath
   * @param filename - имя файла
   * @param htmlPath - путь к HTML файлу родительской страницы
   * @param signal - опциональный AbortSignal для отмены запроса
   */
  async getFileStructureChildren(filename: string, htmlPath: string, signal?: AbortSignal): Promise<PageDto[]> {
    const url = new URL(`${API_BASE_URL}/files/${filename}/structure/children`, window.location.origin);
    url.searchParams.set('htmlPath', htmlPath);
    
    const response = await fetch(url.toString(), { signal });
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Страница "${htmlPath}" не найдена в файле "${filename}"`);
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
  async searchFileStructure(filename: string, query: string, signal?: AbortSignal): Promise<PageDto[]> {
    if (!query.trim()) {
      return [];
    }
    
    const url = new URL(`${API_BASE_URL}/files/${filename}/structure/search`, window.location.origin);
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
}

export const apiClient = new HbkApiClient();
