import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
} from '@mui/material';
import type { PageDto, BookInfo } from '../../types/api';
import { useSearchStructure } from '../../api/queries';
import { extractErrorMessage } from '../../utils/errorUtils';
import { useDebounce } from '../../hooks/useDebounce';
import { useSidebarPages } from '../../hooks/useSidebarPages';
import { useSidebarResize } from '../../hooks/ui/useSidebarResize';
import { SidebarHeader } from './SidebarHeader';
import { SidebarSearch } from './SidebarSearch';
import { NavigationTree } from './NavigationTree';

interface SidebarProps {
  selectedFile?: string;
  selectedBookInfo?: BookInfo | null;
  onFileSelectClick: () => void;
  pages: PageDto[];
  onPageSelect: (htmlPath: string) => void;
  selectedPage?: string;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export function Sidebar({
  selectedFile,
  selectedBookInfo,
  onFileSelectClick,
  pages,
  onPageSelect,
  selectedPage,
  loading,
  error,
  onRetry,
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery);

  // Используем React Query для поиска
  const {
    data: searchResults = [],
    isLoading: isSearching,
    error: searchError,
  } = useSearchStructure(selectedFile, debouncedSearchQuery);

  // Определяем, какие страницы показывать: результаты поиска или обычный список
  const displayPages = useSidebarPages({
    pages,
    searchResults,
    searchQuery: debouncedSearchQuery,
  });

  // Используем хук для изменения размера
  const { sidebarWidth, isResizing, handleResizeStart } = useSidebarResize();

  const searchErrorText = searchError 
    ? extractErrorMessage(searchError, 'Ошибка поиска')
    : null;

  return (
    <Box
      sx={{
        display: 'flex',
        width: { xs: '100%', md: sidebarWidth },
        height: { xs: '50vh', md: '100%' },
        maxHeight: { xs: '50vh', md: 'none' },
        flexShrink: 0,
        position: 'relative',
      }}
    >
      <Paper
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          borderRadius: 0,
          borderRight: { xs: 0, md: 0 },
          borderBottom: { xs: 1, md: 0 },
          borderColor: 'divider',
        }}
        elevation={0}
      >
        <SidebarHeader
          selectedFile={selectedFile}
          selectedBookInfo={selectedBookInfo}
          onFileSelectClick={onFileSelectClick}
        />

        {loading && (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Загрузка структуры...
            </Typography>
          </Box>
        )}

        {error && (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="error" sx={{ mb: 1 }}>
              Ошибка: {error}
            </Typography>
            {onRetry && (
              <IconButton size="small" onClick={onRetry}>
                Повторить
              </IconButton>
            )}
          </Box>
        )}

        {!loading && !error && (
          <>
            <SidebarSearch
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              isSearching={isSearching}
              searchError={searchErrorText}
            />

            <NavigationTree
              pages={displayPages}
              onPageSelect={onPageSelect}
              selectedPage={selectedPage}
              searchQuery={debouncedSearchQuery}
              filename={selectedFile}
              isSearchResult={!!debouncedSearchQuery.trim()}
            />
          </>
        )}
      </Paper>
      {/* Resize handle */}
      <Box
        onMouseDown={handleResizeStart}
        sx={{
          display: { xs: 'none', md: 'block' },
          width: 4,
          height: '100%',
          cursor: 'col-resize',
          bgcolor: isResizing ? 'primary.main' : 'transparent',
          opacity: isResizing ? 0.7 : 0,
          position: 'absolute',
          right: -2,
          top: 0,
          zIndex: 10,
          '&:hover': {
            bgcolor: 'primary.main',
            opacity: 0.5,
          },
        }}
        role="separator"
        aria-label="Изменение ширины оглавления"
        aria-orientation="vertical"
      />
    </Box>
  );
}
