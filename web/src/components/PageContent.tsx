import { useEffect, useState, useRef } from 'react';
import { Box, Typography, CircularProgress, Button, Alert } from '@mui/material';
import type { FileStructure, BookInfo, FileContent } from '../types/api';
import { useFileContent } from '../api/queries';
import { UI } from '../constants/config';
import { PageHeader } from './page/PageHeader';
import { PageViewer } from './page/PageViewer';

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
  const [displayContent, setDisplayContent] = useState<FileContent | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const previousPageNameRef = useRef<string | undefined>(undefined);
  const transitionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Используем React Query для загрузки контента
  const {
    data: content,
    isLoading: loading,
    error: contentError,
    refetch: loadContent,
  } = useFileContent(filename, pageName);

  const error = contentError 
    ? (contentError instanceof Error ? contentError.message : 'Ошибка загрузки контента')
    : null;

  const showLoadingIndicator = loading;

  // Обработка переходов между страницами
  useEffect(() => {
    if (content) {
      if (previousPageNameRef.current !== pageName) {
        const wasFirstLoad = previousPageNameRef.current === undefined;
        previousPageNameRef.current = pageName;
        
        if (wasFirstLoad) {
          setDisplayContent(content);
          setIsTransitioning(false);
        } else {
          setIsTransitioning(true);
          transitionTimeoutRef.current = setTimeout(() => {
            setDisplayContent(content);
            setIsTransitioning(false);
            transitionTimeoutRef.current = null;
          }, UI.TRANSITION_DURATION_MS);
        }
      } else if (content !== displayContent) {
        setDisplayContent(content);
      }
    } else {
      setDisplayContent(null);
      setIsTransitioning(false);
      previousPageNameRef.current = undefined;
    }

    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
        transitionTimeoutRef.current = null;
      }
    };
  }, [content, pageName, displayContent]);

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
            structure={structure}
            pageName={pageName}
            filename={filename}
            onPageSelect={onPageSelect}
            displayContent={displayContent ? {
              pageName: displayContent.pageName,
              filename: displayContent.filename,
            } : null}
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
            {showLoadingIndicator && (isTransitioning || !displayContent) && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '200px',
                  position: displayContent ? 'absolute' : 'relative',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  bgcolor: displayContent ? 'rgba(255, 255, 255, 0.9)' : 'background.default',
                  zIndex: displayContent ? 1 : 'auto',
                  transition: 'opacity 0.2s ease-in-out',
                }}
              >
                <CircularProgress />
              </Box>
            )}

            {error && (
              <Box 
                sx={{ 
                  p: 3,
                  opacity: isTransitioning ? 0.5 : 1,
                  transition: 'opacity 0.2s ease-in-out',
                }}
              >
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
                isTransitioning={isTransitioning}
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
