import { useState, useEffect } from 'react';
import { Box, Paper, Typography, CircularProgress } from '@mui/material';
import { useSectionNavigation } from '@features/navigation/hooks';
import { useSidebarResize } from '@shared/hooks';
import { useSearchParams } from 'react-router-dom';
import { SidebarSearch } from './SidebarSearch';
import { NavigationTree } from './NavigationTree';
import { urlManager } from '@shared/lib';

export function Sidebar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchParams] = useSearchParams();
  const { locale, sectionPages, isLoading, error } = useSectionNavigation();
  const selectedPagePath = searchParams.get('page') || '';
  const [optimisticSelection, setOptimisticSelection] = useState<string>('');
  
  const { sidebarWidth, isResizing, handleResizeStart } = useSidebarResize();

  useEffect(() => {
    if (selectedPagePath && optimisticSelection === selectedPagePath) {
      setOptimisticSelection('');
    }
  }, [selectedPagePath, optimisticSelection]);

  const handlePageSelect = (pagePath: string) => {
    setOptimisticSelection(pagePath);
    // Используем requestAnimationFrame для мгновенного обновления UI
    requestAnimationFrame(() => {
      urlManager.updatePageUrl(pagePath);
    });
  };

  const displayedSelection = optimisticSelection || selectedPagePath;

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
        <SidebarSearch
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          isSearching={false}
          searchError={null}
        />

        {isLoading && (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <CircularProgress size={24} />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Загрузка содержимого раздела...
            </Typography>
          </Box>
        )}

        {error && (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="error">
              Ошибка загрузки: {error.message}
            </Typography>
          </Box>
        )}

        {!isLoading && !error && (
          <NavigationTree
            pages={sectionPages}
            onPageSelect={handlePageSelect}
            selectedPage={displayedSelection}
            searchQuery={searchQuery}
            filename={`global-${locale}`}
            isSearchResult={false}
            locale={locale}
            isGlobalToc={true}
          />
        )}
      </Paper>
      
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
