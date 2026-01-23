import { Box, Typography, CircularProgress, IconButton, Tooltip } from '@mui/material';
import { AspectRatio, Fullscreen } from '@mui/icons-material';
import { useSectionNavigation } from '../../hooks/useSectionNavigation';
import { usePageContentByPath, useResolveV8HelpLink } from '../../api/queries';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useTreeState } from '../../contexts/TreeStateContext';

export function PageContent() {
  const { section, locale, sectionPages } = useSectionNavigation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { expandPath } = useTreeState();
  const [selectedPagePath, setSelectedPagePath] = useState(searchParams.get('page') || '');
  const [isFullWidth, setIsFullWidth] = useState(false);
  const [v8helpLink, setV8helpLink] = useState<string>('');
  const [pendingV8helpResult, setPendingV8helpResult] = useState<any>(null);
  
  // Обновляем selectedPagePath при изменении URL
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const pagePath = params.get('page') || '';
      setSelectedPagePath(pagePath);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Обновляем selectedPagePath при изменении searchParams
  useEffect(() => {
    const pagePath = searchParams.get('page') || '';
    setSelectedPagePath(pagePath);
  }, [searchParams]);

  // Загружаем содержимое страницы
  const { data: pageContent, isLoading: isLoadingContent, error: contentError } = usePageContentByPath(
    selectedPagePath,
    locale || 'ru',
    !!selectedPagePath
  );

  // Резолвинг v8help ссылки
  const { data: v8helpResult } = useResolveV8HelpLink(v8helpLink, locale, !!v8helpLink);
  
  // Обработка результата резолвинга v8help
  useEffect(() => {
    if (v8helpResult) {
      console.log('📨 V8Help result received:', v8helpResult);
      
      // Навигация к разделу и странице
      navigate(`/${locale}/${encodeURIComponent(v8helpResult.sectionTitle)}?page=${encodeURIComponent(v8helpResult.pageLocation)}`);
      
      // Сохраняем результат для отложенного раскрытия
      setPendingV8helpResult(v8helpResult);
      
      setV8helpLink(''); // Сбрасываем ссылку
    }
  }, [v8helpResult, locale, navigate]);

  // Отдельный эффект для раскрытия дерева после загрузки данных раздела
  useEffect(() => {
    console.log('🔄 Checking delayed expansion:', { 
      hasPendingResult: !!pendingV8helpResult, 
      section,
      sectionPagesCount: sectionPages.length
    });
    
    if (pendingV8helpResult && section && sectionPages.length > 0) {
      console.log('🚀 Starting delayed tree expansion:', {
        section,
        pagePath: pendingV8helpResult.pagePath,
        sectionPagesCount: sectionPages.length
      });
      expandPath(sectionPages, pendingV8helpResult.pagePath, locale || 'ru');
      setPendingV8helpResult(null); // Очищаем после использования
    } else {
      console.log('⏳ Section not ready yet, waiting...');
    }
  }, [pendingV8helpResult, section, sectionPages.length, expandPath, locale]);

  // Обработка кликов по внутренним ссылкам
  const handleContentClick = (event: React.MouseEvent) => {
    const target = event.target as HTMLElement;
    const link = target.closest('a');
    
    if (link && link.href) {
      const url = new URL(link.href);
      
      // Обработка v8help ссылок
      if (url.protocol === 'v8help:') {
        event.preventDefault();
        // Используем оригинальный href атрибут, чтобы избежать двойного кодирования
        const originalHref = link.getAttribute('href') || url.href;
        console.log('🔗 V8Help link clicked:', originalHref);
        setV8helpLink(originalHref);
        return;
      }
      
      // Обработка внутренних ссылок
      if (url.pathname.endsWith('.html')) {
        event.preventDefault();
        const pagePath = url.pathname.substring(1); // Убираем ведущий слэш
        const newUrl = `/${locale}/${encodeURIComponent(section || '')}?page=${encodeURIComponent(pagePath)}`;
        navigate(newUrl);
      }
    }
  };

  const toggleFullWidth = () => {
    setIsFullWidth(!isFullWidth);
  };

  if (isLoadingContent) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (contentError) {
    return (
      <Box p={3}>
        <Typography color="error">
          Ошибка загрузки содержимого: {contentError.message}
        </Typography>
      </Box>
    );
  }

  if (!selectedPagePath) {
    return (
      <Box p={3}>
        <Typography variant="h6" color="text.secondary">
          Выберите страницу для просмотра
        </Typography>
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        maxWidth: isFullWidth ? 'none' : '1200px',
        margin: isFullWidth ? 0 : '0 auto',
        transition: 'max-width 0.3s ease, margin 0.3s ease'
      }}
    >
      {/* Панель управления */}
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          p: 1,
          borderBottom: 1,
          borderColor: 'divider'
        }}
      >
        <Tooltip title={isFullWidth ? "Обычная ширина" : "На всю ширину"}>
          <IconButton onClick={toggleFullWidth} size="small">
            {isFullWidth ? <AspectRatio /> : <Fullscreen />}
          </IconButton>
        </Tooltip>
      </Box>

      {/* Содержимое страницы */}
      <Box 
        sx={{ 
          flex: 1,
          overflow: 'auto',
          p: 3,
          '& img': {
            maxWidth: '100%',
            height: 'auto'
          },
          '& table': {
            width: '100%',
            borderCollapse: 'collapse',
            '& th, & td': {
              border: 1,
              borderColor: 'divider',
              p: 1,
              textAlign: 'left'
            },
            '& th': {
              backgroundColor: 'grey.100'
            }
          }
        }}
        onClick={handleContentClick}
        dangerouslySetInnerHTML={{ __html: pageContent || '' }}
      />
    </Box>
  );
}
