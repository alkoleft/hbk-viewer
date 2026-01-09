import type { BookInfo, FileContent, FileStructure, PageDto } from '../types/api';

const API_BASE_URL = '/api/hbk';

/**
 * Клиент для работы с API HBK Reader
 */
export class HbkApiClient {
  /**
   * Получает список всех доступных HBK файлов
   */
  async getFiles(): Promise<BookInfo[]> {
    const response = await fetch(`${API_BASE_URL}/files`);
    if (!response.ok) {
      throw new Error(`Ошибка при получении списка файлов: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Получает содержимое страницы из HBK файла
   * @param filename - имя файла
   * @param htmlPath - путь к HTML странице (используется вместо title)
   */
  async getFileContent(filename: string, htmlPath?: string): Promise<FileContent> {
    const url = new URL(`${API_BASE_URL}/files/${filename}/content`, window.location.origin);
    if (htmlPath) {
      url.searchParams.set('htmlPath', htmlPath);
    }
    
    const response = await fetch(url.toString());
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
   */
  async getFileStructure(filename: string, includeChildren: boolean = false): Promise<FileStructure> {
    const url = new URL(`${API_BASE_URL}/files/${filename}/structure`, window.location.origin);
    if (includeChildren) {
      url.searchParams.set('includeChildren', 'true');
    }
    
    const response = await fetch(url.toString());
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
   */
  async getFileStructureChildren(filename: string, htmlPath: string): Promise<PageDto[]> {
    const url = new URL(`${API_BASE_URL}/files/${filename}/structure/children`, window.location.origin);
    url.searchParams.set('htmlPath', htmlPath);
    
    const response = await fetch(url.toString());
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
   */
  async searchFileStructure(filename: string, query: string): Promise<PageDto[]> {
    if (!query.trim()) {
      return [];
    }
    
    const url = new URL(`${API_BASE_URL}/files/${filename}/structure/search`, window.location.origin);
    url.searchParams.set('query', query);
    
    const response = await fetch(url.toString());
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
