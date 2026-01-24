import { Box, List, Typography } from '@mui/material';
import { useMemo } from 'react';
import type { PageDto } from '@shared/types';
import { TreeNode } from './TreeNode';

interface NavigationTreeProps {
  pages: PageDto[];
  onPageSelect: (pagePath: string) => void;
  selectedPage?: string;
  searchQuery?: string;
  filename?: string;
  isSearchResult?: boolean;
  locale?: string;
  isGlobalToc?: boolean;
}

export function NavigationTree({
  pages,
  onPageSelect,
  selectedPage,
  searchQuery,
  filename,
  isSearchResult,
  locale,
  isGlobalToc,
}: NavigationTreeProps) {
  const filteredPages = useMemo(() => {
    if (!searchQuery) return pages;
    return pages.filter(page => 
      page.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [pages, searchQuery]);

  if (filteredPages.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          {searchQuery ? 'Ничего не найдено' : 'Оглавление пусто'}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        minHeight: 0,
      }}
    >
      <List dense component="nav" sx={{ py: 0 }} role="tree" aria-label="Оглавление">
        {filteredPages.map((page, index) => {
          const uniqueKey = page.path && page.path.length > 0 
            ? `path-${page.path.join(',')}` 
            : (page.pagePath || `page-${index}`);
          
          return (
            <TreeNode
              key={uniqueKey}
              page={page}
              onPageSelect={onPageSelect}
              selectedPage={selectedPage}
              level={0}
              searchQuery={searchQuery}
              filename={filename}
              isSearchResult={isSearchResult}
              locale={locale}
              isGlobalToc={isGlobalToc}
            />
          );
        })}
      </List>
    </Box>
  );
}
