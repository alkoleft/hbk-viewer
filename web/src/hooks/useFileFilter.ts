import { useState, useMemo, useEffect } from 'react';
import type { BookInfo } from '../types/api';
import type { SortType } from '../types/common';
import { UI } from '../constants/config';

/**
 * Хук для фильтрации и сортировки файлов
 * Использует debounce для поискового запроса для оптимизации производительности
 */
export function useFileFilter(files: BookInfo[], initialSort: SortType = 'name-asc') {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [sortType, setSortType] = useState<SortType>(initialSort);

  // Debounce для поискового запроса
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, UI.SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const filteredAndSortedFiles = useMemo(() => {
    const query = debouncedSearchQuery.toLowerCase();
    let result = files.filter((file) => {
      // Если запрос пустой, показываем все файлы
      if (!query.trim()) {
        return true;
      }
      const matchesFilename = file.filename.toLowerCase().includes(query);
      const matchesBookName = file.meta?.bookName?.toLowerCase().includes(query) || false;
      const matchesDescription = file.meta?.description?.toLowerCase().includes(query) || false;
      const matchesTags = file.meta?.tags?.some((tag) => tag.toLowerCase().includes(query)) || false;
      return matchesFilename || matchesBookName || matchesDescription || matchesTags;
    });

    result = [...result].sort((a, b) => {
      switch (sortType) {
        case 'name-asc':
          return a.filename.localeCompare(b.filename, 'ru');
        case 'name-desc':
          return b.filename.localeCompare(a.filename, 'ru');
        case 'size-asc':
          return a.size - b.size;
        case 'size-desc':
          return b.size - a.size;
        default:
          return 0;
      }
    });

    return result;
  }, [files, debouncedSearchQuery, sortType]);

  return {
    searchQuery,
    setSearchQuery,
    sortType,
    setSortType,
    filteredAndSortedFiles,
  };
}
