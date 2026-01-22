import { Box, Typography, CircularProgress, IconButton, Tooltip } from '@mui/material';
import { AspectRatio, Fullscreen } from '@mui/icons-material';
import { useSectionNavigation } from '../../hooks/useSectionNavigation';
import { usePageContentByPath } from '../../api/queries';
import { useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';

export function PageContent() {
  const { section, locale } = useSectionNavigation();
  const [searchParams] = useSearchParams();
  const [selectedPagePath, setSelectedPagePath] = useState(searchParams.get('page') || '');
  const [isFullWidth, setIsFullWidth] = useState(false);
  
  // Обновляем selectedPagePath при изменении URL
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      setSelectedPagePath(params.get('page') || '');
    };
    
    window.addEventListener('popstate', handlePopState);
    setSelectedPagePath(searchParams.get('page') || '');
    
    return () => window.removeEventListener('popstate', handlePopState);
  }, [searchParams]);
  
  const { data: htmlContent, isLoading, error } = usePageContentByPath(selectedPagePath, locale);

  // Обработка кликов по внутренним ссылкам
  const handleContentClick = (event: React.MouseEvent) => {
    const target = event.target as HTMLElement;
    const link = target.closest('a');
    
    if (link && link.href) {
      const href = link.getAttribute('href');
      
      // Проверяем, что это относительная ссылка (не начинается с http/https)
      if (href && !href.startsWith('http') && !href.startsWith('//')) {
        event.preventDefault();
        
        // Резолвим относительный путь относительно текущей страницы
        let resolvedPath = href;
        if (selectedPagePath && !href.startsWith('/')) {
          // Получаем директорию текущей страницы
          const currentDir = selectedPagePath.substring(0, selectedPagePath.lastIndexOf('/'));
          if (currentDir) {
            resolvedPath = `${currentDir}/${href}`;
          }
        }
        
        // Обновляем URL с новой страницей
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.set('page', resolvedPath);
        window.history.pushState({}, '', currentUrl.toString());
        
        // Обновляем состояние
        setSelectedPagePath(resolvedPath);
      }
    }
  };

  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        bgcolor: 'background.default',
      }}
    >
      <Box
        sx={{
          p: 3,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 0 }}>
          {section || 'Выберите раздел'}
        </Typography>
        
        {htmlContent && (
          <Tooltip title={isFullWidth ? 'Ограничить ширину' : 'На всю ширину'}>
            <IconButton onClick={() => setIsFullWidth(!isFullWidth)}>
              {isFullWidth ? <AspectRatio /> : <Fullscreen />}
            </IconButton>
          </Tooltip>
        )}
      </Box>
      
      <Box
        sx={{
          flex: 1,
          p: 3,
          overflow: 'auto',
        }}
      >
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        )}
        
        {error && (
          <Typography color="error">
            Ошибка загрузки содержимого: {error.message}
          </Typography>
        )}
        
        {htmlContent && (
          <Box
            sx={{
              maxWidth: isFullWidth ? 'none' : '800px',
              mx: 'auto',
              bgcolor: 'white',
              p: 3,
              borderRadius: 1,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              minHeight: '100%',
            }}
            onClick={handleContentClick}
          >
            <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
          </Box>
        )}
        
        {selectedPagePath && selectedPagePath.includes('__empty_pl') && (
          <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', p: 4 }}>
            Эта страница не содержит информации.
          </Typography>
        )}
        
        {!selectedPagePath && !isLoading && (
          <Typography variant="body1">
            Выберите страницу из навигационного дерева для просмотра содержимого.
          </Typography>
        )}
      </Box>
    </Box>
  );
}
