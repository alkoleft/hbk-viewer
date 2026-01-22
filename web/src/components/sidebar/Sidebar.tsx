import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
} from '@mui/material';
import { useSectionNavigation } from '../../hooks/useSectionNavigation';
import { useSidebarResize } from '../../hooks/ui/useSidebarResize';
import { SidebarSearch } from './SidebarSearch';
import { NavigationTree } from './NavigationTree';

export function Sidebar() {
  const [searchQuery, setSearchQuery] = useState('');
  const { locale, section, sectionPages, currentSection, isLoading, error } = useSectionNavigation();
  
  // Используем хук для изменения размера
  const { sidebarWidth, isResizing, handleResizeStart } = useSidebarResize();

  // Отладочная информация
  useEffect(() => {
    console.log('Section changed:', { 
      section, 
      sectionPagesCount: sectionPages.length, 
      currentSection: currentSection?.title,
      isLoading,
      error
    });
  }, [section, sectionPages, currentSection, isLoading, error]);

  const handlePageSelect = (pagePath: string) => {
    // Обновляем URL с параметром page для загрузки содержимого
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('page', pagePath);
    window.history.pushState({}, '', currentUrl.toString());
    
    // Принудительно обновляем компонент через событие
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

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
            key={section} // Принудительный перерендер при смене раздела
            pages={sectionPages}
            onPageSelect={handlePageSelect}
            selectedPage=""
            searchQuery={searchQuery}
            filename={`global-${locale}`}
            isSearchResult={false}
            locale={locale}
            isGlobalToc={true}
          />
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
