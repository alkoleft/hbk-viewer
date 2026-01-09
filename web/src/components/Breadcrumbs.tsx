import { Breadcrumbs as MuiBreadcrumbs, Link, Typography } from '@mui/material';
import type { PageDto } from '../types/api';

interface BreadcrumbsProps {
  pages: PageDto[];
  currentPageName: string; // htmlPath текущей страницы
  onPageSelect: (htmlPath: string) => void;
}

export function Breadcrumbs({ pages, currentPageName, onPageSelect }: BreadcrumbsProps) {
  const findPath = (pagesList: PageDto[], targetHtmlPath: string, path: PageDto[] = []): PageDto[] | null => {
    for (const page of pagesList) {
      const currentPath = [...path, page];
      
      if (page.htmlPath === targetHtmlPath) {
        return currentPath;
      }
      
      if (page.children.length > 0) {
        const found = findPath(page.children, targetHtmlPath, currentPath);
        if (found) {
          return found;
        }
      }
    }
    return null;
  };

  const path = findPath(pages, currentPageName);

  if (!path || path.length === 0) {
    return null;
  }

  return (
    <MuiBreadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
      {path.map((page, index) => {
        const pageTitle = page.title.ru || page.title.en;
        const isLast = index === path.length - 1;
        
        if (isLast) {
          return (
            <Typography key={index} color="text.primary" variant="body2">
              {pageTitle}
            </Typography>
          );
        }
        
        return (
          <Link
            key={index}
            component="button"
            variant="body2"
            onClick={() => onPageSelect(page.htmlPath)}
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
}
