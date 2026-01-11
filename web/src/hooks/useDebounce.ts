import { useState, useEffect } from 'react';
import { UI } from '../constants/config';

/**
 * Хук для debounce значения
 * @param value - значение для debounce
 * @param delay - задержка в миллисекундах (по умолчанию из конфига)
 * @returns debounced значение
 */
export function useDebounce<T>(value: T, delay: number = UI.SEARCH_DEBOUNCE_MS): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
