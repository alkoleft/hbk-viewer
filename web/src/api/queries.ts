import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { apiClient } from './client';

/**
 * Query keys для React Query
 */
export const queryKeys = {
  books: ['books'] as const,
  BookStructure: (filename: string, depth?: number) => ['BookStructure', filename, depth] as const,
  BookPageContent: (filename: string, htmlPath?: string) => ['BookPageContent', filename, htmlPath] as const,
  BookStructureChildren: (filename: string, htmlPath?: string, path?: number[]) => 
    ['BookStructureChildren', filename, htmlPath, path] as const,
  searchStructure: (filename: string, query: string) => 
    ['searchStructure', filename, query] as const,
  version: (platformPath?: string) => ['version', platformPath] as const,
};

/**
 * Хук для получения списка всех доступных HBK файлов
 */
export function useBooks() {
  return useQuery({
    queryKey: queryKeys.books,
    queryFn: () => apiClient.getFiles(),
    staleTime: 5 * 60 * 1000, // 5 минут
  });
}

/**
 * Хук для получения структуры (оглавления) HBK файла
 */
export function useBookStructure(filename: string | undefined, depth: number = 1) {
  return useQuery({
    queryKey: queryKeys.BookStructure(filename || '', depth),
    queryFn: () => {
      if (!filename) {
        throw new Error('Filename is required');
      }
      return apiClient.getBookStructure(filename, depth);
    },
    enabled: !!filename,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Хук для получения содержимого страницы из HBK файла
 */
export function useBookPageContent(filename: string | undefined, htmlPath?: string) {
  return useQuery({
    queryKey: queryKeys.BookPageContent(filename || '', htmlPath),
    queryFn: () => {
      if (!filename) {
        throw new Error('Filename is required');
      }
      return apiClient.getBookPageContent(filename, htmlPath);
    },
    enabled: !!filename && !!htmlPath,
    staleTime: 10 * 60 * 1000, // 10 минут для контента
    placeholderData: keepPreviousData, // Сохраняем предыдущие данные при переходе между страницами
  });
}

/**
 * Хук для получения дочерних элементов страницы
 */
export function useBookStructureChildren(
  filename: string | undefined,
  htmlPath?: string,
  path?: number[],
  enabled: boolean = true
) {
  return useQuery({
    queryKey: queryKeys.BookStructureChildren(filename || '', htmlPath, path),
    queryFn: () => {
      if (!filename) {
        throw new Error('Filename is required');
      }
      return apiClient.getBookStructureChildren(filename, htmlPath, path);
    },
    enabled: !!filename && enabled && (!!htmlPath || (path && path.length > 0)),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Хук для поиска страниц в оглавлении файла
 */
export function useSearchStructure(filename: string | undefined, query: string) {
  return useQuery({
    queryKey: queryKeys.searchStructure(filename || '', query),
    queryFn: () => {
      if (!filename) {
        throw new Error('Filename is required');
      }
      return apiClient.searchBookStructure(filename, query);
    },
    enabled: !!filename && query.trim().length > 0,
    staleTime: 2 * 60 * 1000, // 2 минуты для результатов поиска
  });
}

/**
 * Хук для получения версий приложения и платформы 1С
 */
export function useVersion(platformPath?: string) {
  return useQuery({
    queryKey: queryKeys.version(platformPath),
    queryFn: () => apiClient.getVersion(platformPath),
    staleTime: 60 * 60 * 1000, // 1 час - версии редко меняются
  });
}
