import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { apiClient } from './client';
import type { BookInfo, FileContent, FileStructure, PageDto } from '../types/api';

/**
 * Query keys для React Query
 */
export const queryKeys = {
  books: ['books'] as const,
  fileStructure: (filename: string, depth?: number) => ['fileStructure', filename, depth] as const,
  fileContent: (filename: string, htmlPath?: string) => ['fileContent', filename, htmlPath] as const,
  fileStructureChildren: (filename: string, htmlPath?: string, path?: number[]) => 
    ['fileStructureChildren', filename, htmlPath, path] as const,
  searchStructure: (filename: string, query: string) => 
    ['searchStructure', filename, query] as const,
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
export function useFileStructure(filename: string | undefined, depth: number = 1) {
  return useQuery({
    queryKey: queryKeys.fileStructure(filename || '', depth),
    queryFn: () => {
      if (!filename) {
        throw new Error('Filename is required');
      }
      return apiClient.getFileStructure(filename, depth);
    },
    enabled: !!filename,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Хук для получения содержимого страницы из HBK файла
 */
export function useFileContent(filename: string | undefined, htmlPath?: string) {
  return useQuery({
    queryKey: queryKeys.fileContent(filename || '', htmlPath),
    queryFn: () => {
      if (!filename) {
        throw new Error('Filename is required');
      }
      return apiClient.getFileContent(filename, htmlPath);
    },
    enabled: !!filename && !!htmlPath,
    staleTime: 10 * 60 * 1000, // 10 минут для контента
    placeholderData: keepPreviousData, // Сохраняем предыдущие данные при переходе между страницами
  });
}

/**
 * Хук для получения дочерних элементов страницы
 */
export function useFileStructureChildren(
  filename: string | undefined,
  htmlPath?: string,
  path?: number[],
  enabled: boolean = true
) {
  return useQuery({
    queryKey: queryKeys.fileStructureChildren(filename || '', htmlPath, path),
    queryFn: () => {
      if (!filename) {
        throw new Error('Filename is required');
      }
      return apiClient.getFileStructureChildren(filename, htmlPath, path);
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
      return apiClient.searchFileStructure(filename, query);
    },
    enabled: !!filename && query.trim().length > 0,
    staleTime: 2 * 60 * 1000, // 2 минуты для результатов поиска
  });
}
