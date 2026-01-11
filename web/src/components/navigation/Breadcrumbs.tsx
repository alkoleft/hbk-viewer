import { memo, useCallback, useMemo } from 'react';
import { Breadcrumbs as MuiBreadcrumbs, Link, Typography } from '@mui/material';
import type { PageDto } from '../../types/api';
import { findPagePath } from '../../utils/findPagePath';

interface BreadcrumbsProps {
  pages: PageDto[];
  currentPageName: string;
  onPageSelect: (htmlPath: string) => void;
  filename?: string;
}

/**
 * Компонент для отображения breadcrumbs (хлебных крошек) навигации.
 */
export const Breadcrumbs = memo(function Breadcrumbs({
  pages,
  currentPageName,
  onPageSelect,
  filename,
}: BreadcrumbsProps) {
  // Находим путь к текущей странице
  const path = useMemo(() => {
    if (!currentPageName || pages.length === 0) {
      return null;
    }
    return findPagePath(pages, currentPageName);
  }, [pages, currentPageName]);

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
      }}
    >
      {path.map((page, index) => {
        const pageTitle = page.title.ru || page.title.en;
        const isLast = index === path.length - 1;
        
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
    </MuiBreadcrumbs>
  );
});
