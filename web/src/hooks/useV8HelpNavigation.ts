import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import type { BookInfo } from '../types/api';
import { convertV8HelpLinkToUrl } from '../utils/v8helpUtils';

interface UseV8HelpNavigationOptions {
  content: string;
  books: BookInfo[];
  currentLocale: string;
  containerRef: React.RefObject<HTMLElement>;
}

/**
 * Хук для обработки навигации по v8help:// ссылкам
 */
export function useV8HelpNavigation({
  content,
  books,
  currentLocale,
  containerRef,
}: UseV8HelpNavigationOptions) {
  const navigate = useNavigate();
  const cleanupClickHandlerRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!content || !containerRef.current) {
      if (cleanupClickHandlerRef.current) {
        cleanupClickHandlerRef.current();
        cleanupClickHandlerRef.current = null;
      }
      return;
    }

    if (cleanupClickHandlerRef.current) {
      cleanupClickHandlerRef.current();
      cleanupClickHandlerRef.current = null;
    }

    const handleClick = (event: MouseEvent) => {
      const container = containerRef.current;
      if (!container) {
        return;
      }

      const target = event.target as HTMLElement;
      if (!container.contains(target)) {
        return;
      }

      const link = target.closest('a');
      if (!link) {
        return;
      }

      const href = link.getAttribute('href');
      if (!href) {
        return;
      }

      if (href.startsWith('v8help://')) {
        event.preventDefault();
        event.stopPropagation();

        const url = convertV8HelpLinkToUrl(href, books, currentLocale);
        if (url) {
          navigate(url);
        } else {
          console.warn('Не удалось найти книгу для ссылки:', href);
        }
      }
    };

    const rafId = requestAnimationFrame(() => {
      const container = containerRef.current;
      if (!container) {
        return;
      }

      container.addEventListener('click', handleClick, true);

      cleanupClickHandlerRef.current = () => {
        container.removeEventListener('click', handleClick, true);
      };
    });

    return () => {
      cancelAnimationFrame(rafId);
      if (cleanupClickHandlerRef.current) {
        cleanupClickHandlerRef.current();
        cleanupClickHandlerRef.current = null;
      }
    };
  }, [content, books, currentLocale, navigate, containerRef]);
}
