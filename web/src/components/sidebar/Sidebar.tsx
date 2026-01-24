import { useState, useEffect } from 'react';
import { Box, Paper, Typography, CircularProgress, Drawer } from '@mui/material';
import { useSectionNavigation } from '@features/navigation/hooks';
import { useSidebarResize, useIsMobile, useSwipeGesture } from '@shared/hooks';
import { useSearchParams } from 'react-router-dom';
import { SidebarSearch } from './SidebarSearch';
import { NavigationTree } from './NavigationTree';
import { urlManager } from '@shared/lib';
import { useStore } from '@core/store';

export function Sidebar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchParams] = useSearchParams();
  const { locale, sectionPages, isLoading, error } = useSectionNavigation();
  const selectedPagePath = searchParams.get('page') || '';
  const [optimisticSelection, setOptimisticSelection] = useState<string>('');
  
  const { sidebarWidth, isResizing, handleResizeStart } = useSidebarResize();
  const isMobile = useIsMobile();
  const isMobileDrawerOpen = useStore((state) => state.isMobileDrawerOpen);
  const toggleMobileDrawer = useStore((state) => state.toggleMobileDrawer);

  const swipeHandlers = useSwipeGesture({
    onSwipeRight: () => {
      if (isMobile && !isMobileDrawerOpen) {
        toggleMobileDrawer();
      }
    },
  });

  const drawerSwipeHandlers = useSwipeGesture({
    onSwipeLeft: () => {
      if (isMobile && isMobileDrawerOpen) {
        toggleMobileDrawer();
      }
    },
  });

  useEffect(() => {
    if (selectedPagePath && optimisticSelection === selectedPagePath) {
      setOptimisticSelection('');
    }
  }, [selectedPagePath, optimisticSelection]);

  const handlePageSelect = (pagePath: string) => {
    setOptimisticSelection(pagePath);
    requestAnimationFrame(() => {
      urlManager.updatePageUrl(pagePath);
    });
    if (isMobile) {
      toggleMobileDrawer();
    }
  };

  const displayedSelection = optimisticSelection || selectedPagePath;

  const sidebarContent = (
    <Paper
      ref={isMobile ? drawerSwipeHandlers : null}
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        borderRadius: 0,
        borderRight: { xs: 0, md: 0 },
        borderBottom: { xs: 0, md: 0 },
        borderColor: 'divider',
        touchAction: 'pan-y',
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
  );

  if (isMobile) {
    return (
      <>
        <Box 
          ref={swipeHandlers}
          sx={{ 
            position: 'fixed', 
            left: 0, 
            top: 0, 
            width: 30, 
            height: '100%', 
            zIndex: 1,
            touchAction: 'pan-y',
          }} 
        />
        <Drawer
          anchor="left"
          open={isMobileDrawerOpen}
          onClose={toggleMobileDrawer}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            '& .MuiDrawer-paper': {
              width: { xs: '100%', sm: '85%' },
              maxWidth: { xs: '100%', sm: 'calc(100% - 56px)' },
              '@media (max-width: 360px)': {
                width: '100%',
              },
            },
          }}
        >
          {sidebarContent}
        </Drawer>
      </>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        width: sidebarWidth,
        height: '100%',
        flexShrink: 0,
        position: 'relative',
      }}
    >
      {sidebarContent}
      
      <Box
        onMouseDown={handleResizeStart}
        sx={{
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
