import { useEffect } from 'react';
import { Box, Typography, CircularProgress, Button, Alert } from '@mui/material';
import type { FileStructure, BookInfo } from '../../types/api';
import { useFileContent } from '../../api/queries';
import { findPagePath } from '../../utils/findPagePath';
import { PageHeader } from './PageHeader';
import { PageViewer } from './PageViewer';

interface PageContentProps {
  filename: string | undefined;
  pageName?: string;
  structure?: FileStructure | null;
  onPageSelect: (htmlPath: string) => void;
  books?: BookInfo[];
  currentLocale?: string;
}

export function PageContent({ 
  filename, 
  pageName, 
  structure, 
  onPageSelect,
  books = [],
  currentLocale = 'ru',
}: PageContentProps) {
  // Используем React Query для загрузки контента
  // placeholderData сохраняет предыдущие данные при переходе между страницами
  const {
    data: content,
    isLoading: loading,
    error: contentError,
    refetch: loadContent,
    isFetching,
    isPlaceholderData,
  } = useFileContent(filename, pageName);

  const error = contentError 
    ? (contentError instanceof Error ? contentError.message : 'Ошибка загрузки контента')
    : null;

  // Используем данные напрямую из React Query
  // placeholderData автоматически сохраняет предыдущие данные при переключении
  const displayContent = content || null;

  // Показываем индикатор загрузки только при первой загрузке (когда нет данных)
  const showLoadingIndicator = loading && !displayContent;

  // Обновляем заголовок страницы в браузере
  useEffect(() => {
    const defaultTitle = '1C:Hand Book (HBK) Viewer';
    
    if (!structure || !pageName) {
      document.title = defaultTitle;
      return;
    }

    // Находим страницу в структуре по htmlPath
    const pagePath = findPagePath(structure.pages, pageName);
    if (pagePath && pagePath.length > 0) {
      const currentPage = pagePath[pagePath.length - 1];
      // Выбираем заголовок в зависимости от текущей локали
      const pageTitle = currentPage.title 
        ? (currentLocale === 'en' && currentPage.title.en 
            ? currentPage.title.en 
            : currentPage.title.ru) || currentPage.title.en || pageName
        : pageName;
      document.title = `${pageTitle} - ${defaultTitle}`;
    } else {
      // Если страница не найдена в структуре, используем pageName
      document.title = `${pageName} - ${defaultTitle}`;
    }
  }, [structure, pageName, currentLocale]);

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
      {!filename || !pageName ? (
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="body1" color="text.secondary">
            Выберите файл и страницу для просмотра
          </Typography>
        </Box>
      ) : (
        <>
          <PageHeader
            structure={structure ?? null}
            pageName={pageName}
            filename={filename}
            onPageSelect={onPageSelect}
          />

          <Box
            sx={{
              flex: 1,
              overflowY: 'auto',
              overflowX: 'hidden',
              minHeight: 0,
              position: 'relative',
            }}
          >
            {showLoadingIndicator && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '200px',
                  position: 'relative',
                  bgcolor: 'background.default',
                }}
              >
                <CircularProgress />
              </Box>
            )}

            {isFetching && displayContent && !loading && !isPlaceholderData && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '200px',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  bgcolor: 'rgba(255, 255, 255, 0.7)',
                  zIndex: 1,
                  pointerEvents: 'none',
                  opacity: 0.3,
                  transition: 'opacity 0.2s ease-in-out',
                }}
              >
                <CircularProgress size={40} />
              </Box>
            )}

            {error && (
              <Box sx={{ p: 3 }}>
                <Alert severity="error" sx={{ mb: 2 }}>
                  Ошибка: {error}
                </Alert>
                <Button variant="contained" onClick={() => loadContent()}>
                  Повторить
                </Button>
              </Box>
            )}

            {displayContent && (
              <PageViewer
                content={displayContent.content}
                isTransitioning={false}
                books={books}
                currentLocale={currentLocale}
              />
            )}
          </Box>
        </>
      )}
    </Box>
  );
}
