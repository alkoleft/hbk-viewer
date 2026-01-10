import { memo, useCallback, useState, useEffect, useRef } from 'react';
import { Breadcrumbs as MuiBreadcrumbs, Link, Typography, CircularProgress } from '@mui/material';
import type { PageDto } from '../types/api';
import { apiClient } from '../api/client';
import { isAbortError } from '../utils/errorUtils';

interface BreadcrumbsProps {
  pages: PageDto[];
  currentPageName: string; // htmlPath текущей страницы
  onPageSelect: (htmlPath: string) => void;
  filename?: string; // Имя файла для загрузки недостающих данных
}

/**
 * Компонент для отображения breadcrumbs (хлебных крошек) навигации.
 * Загружает недостающие данные при необходимости для построения пути.
 */
export const Breadcrumbs = memo(function Breadcrumbs({ pages, currentPageName, onPageSelect, filename }: BreadcrumbsProps) {
  const expandedPagesRef = useRef<Map<string, PageDto[]>>(new Map());
  const [path, setPath] = useState<PageDto[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const previousPageNameRef = useRef<string | undefined>(undefined);
  const previousPathRef = useRef<PageDto[] | null>(null);

  // Рекурсивная функция для поиска пути с загрузкой children при необходимости
  const findPathRecursive = useCallback(async (
    pagesList: PageDto[],
    targetHtmlPath: string,
    currentPath: PageDto[] = [],
    visitedPaths: Set<string> = new Set() // Множество уже посещенных путей (path) для предотвращения циклов
  ): Promise<PageDto[] | null> => {
    for (const page of pagesList) {
      // Используем path для уникальной идентификации страницы, если он доступен
      // Это предотвращает циклы при одинаковых htmlPath на разных уровнях
      const pageKey = page.path && page.path.length > 0 
        ? page.path.join(',') 
        : `${page.htmlPath}-${currentPath.length}`; // Fallback на htmlPath с глубиной
      
      // Проверяем, не посещали ли мы уже эту страницу (предотвращение циклов)
      if (visitedPaths.has(pageKey)) {
        continue; // Пропускаем уже посещенную страницу
      }
      
      const newPath = [...currentPath, page];
      const newVisitedPaths = new Set(visitedPaths);
      newVisitedPaths.add(pageKey);
      
      // Если это искомая страница, возвращаем путь
      if (page.htmlPath === targetHtmlPath) {
        return newPath;
      }
      
      // Получаем children
      let children = page.children;
      
      // Если children пустые, но есть hasChildren, пытаемся загрузить
      if (children.length === 0 && page.hasChildren === true && filename && page.htmlPath) {
        // Используем уникальный ключ для кэша: path если доступен, иначе htmlPath
        const cacheKey = page.path && page.path.length > 0 
          ? `path:${page.path.join(',')}` 
          : page.htmlPath;
        
        // Проверяем, не загружены ли уже
        if (expandedPagesRef.current.has(cacheKey)) {
          children = expandedPagesRef.current.get(cacheKey) || [];
        } else {
          // Загружаем children используя path для уникальной идентификации
          try {
            const loadedChildren = await apiClient.getFileStructureChildren(
              filename,
              page.htmlPath,
              page.path,
              abortControllerRef.current?.signal
            );
            children = loadedChildren;
            expandedPagesRef.current.set(cacheKey, loadedChildren);
          } catch (err) {
            if (!isAbortError(err)) {
              console.error('Ошибка при загрузке дочерних элементов для breadcrumbs:', err);
            }
            // Продолжаем поиск без этого поддерева
            continue;
          }
        }
      }
      
      // Ищем в children только если они есть и мы не превысили разумный предел глубины
      if (children.length > 0 && currentPath.length < 50) { // Защита от слишком глубокой рекурсии
        const found = await findPathRecursive(children, targetHtmlPath, newPath, newVisitedPaths);
        if (found) {
          return found;
        }
      }
    }
    return null;
  }, [filename]);

  useEffect(() => {
    if (!currentPageName || pages.length === 0) {
      // Очищаем путь только если действительно нет данных
      if (currentPageName !== previousPageNameRef.current) {
        setPath(null);
        previousPathRef.current = null;
        previousPageNameRef.current = currentPageName;
      }
      setIsLoading(false);
      return;
    }

    // Если страница не изменилась, не делаем ничего
    if (previousPageNameRef.current === currentPageName) {
      return;
    }

    // Отменяем предыдущий запрос
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    // Сохраняем текущий путь для плавного перехода
    setPath((prevPath) => {
      previousPathRef.current = prevPath;
      previousPageNameRef.current = currentPageName;
      
      // Если уже есть путь, не показываем индикатор загрузки (показываем предыдущий путь)
      // Индикатор загрузки показываем только если пути еще нет
      if (!prevPath) {
        setIsLoading(true);
      }
      
      return prevPath; // Временно оставляем предыдущий путь для плавного перехода
    });

    findPathRecursive(pages, currentPageName)
      .then((foundPath) => {
        if (!abortController.signal.aborted) {
          setPath(foundPath);
          previousPathRef.current = foundPath;
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (!isAbortError(err) && !abortController.signal.aborted) {
          console.error('Ошибка при поиске пути для breadcrumbs:', err);
          setPath(null);
          previousPathRef.current = null;
          setIsLoading(false);
        }
      });

    // Отменяем запрос при размонтировании или изменении параметров
    return () => {
      abortController.abort();
    };
  }, [pages, currentPageName, findPathRecursive]);

  // Очищаем кэш только при изменении файла или структуры
  useEffect(() => {
    if (pages.length === 0) {
      expandedPagesRef.current.clear();
    }
  }, [pages]);

  const handlePageClick = useCallback((htmlPath: string) => {
    onPageSelect(htmlPath);
  }, [onPageSelect]);

  // Если путь не найден, не показываем breadcrumbs
  if (!path || path.length === 0) {
    return null;
  }

  return (
    <MuiBreadcrumbs 
      aria-label="breadcrumb" 
      sx={{ 
        mb: 2,
        opacity: isLoading ? 0.6 : 1,
        transition: 'opacity 0.2s ease-in-out',
      }}
    >
      {path.map((page, index) => {
        const pageTitle = page.title.ru || page.title.en;
        const isLast = index === path.length - 1;
        
        // Используем path для уникальной идентификации, если доступен
        // Это решает проблему с дублирующимися htmlPath на разных уровнях
        // В breadcrumbs индекс уже уникален, но добавляем path для большей надежности
        const uniqueKey = page.path && page.path.length > 0 
          ? `path-${page.path.join(',')}` 
          : `${page.htmlPath || 'page'}-${index}`;
        
        if (isLast) {
          return (
            <Typography 
              key={uniqueKey} 
              color="text.primary" 
              variant="body2"
            >
              {pageTitle}
            </Typography>
          );
        }
        
        return (
          <Link
            key={uniqueKey}
            component="button"
            variant="body2"
            onClick={() => handlePageClick(page.htmlPath)}
            sx={{
              cursor: 'pointer',
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline',
              },
            }}
          >
            {pageTitle}
          </Link>
        );
      })}
      {isLoading && (
        <CircularProgress size={12} sx={{ ml: 1 }} />
      )}
    </MuiBreadcrumbs>
  );
}, (prevProps, nextProps) => {
  // Кастомная функция сравнения для оптимизации
  return (
    prevProps.currentPageName === nextProps.currentPageName &&
    prevProps.pages === nextProps.pages &&
    prevProps.filename === nextProps.filename &&
    prevProps.onPageSelect === nextProps.onPageSelect
  );
});
