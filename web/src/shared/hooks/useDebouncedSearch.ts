import { useState, useEffect } from 'react';
import { useSearchToc } from '@shared/api';

export function useDebouncedSearchToc(
  query: string,
  locale: string = 'ru',
  sectionPath?: string,
  delay: number = 300
) {
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, delay);

    return () => clearTimeout(timer);
  }, [query, delay]);

  return useSearchToc(debouncedQuery, locale, sectionPath, debouncedQuery.trim().length > 0);
}
