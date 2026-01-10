import { useEffect, useState, useRef, useCallback } from 'react';
import { Box, Paper, Typography, CircularProgress, Button, Alert, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import type { FileContent, FileStructure, BookInfo } from '../types/api';
import { apiClient } from '../api/client';
import { Breadcrumbs } from './Breadcrumbs';
import { LOADING_INDICATOR_DELAY_MS, TRANSITION_DURATION_MS } from '../constants/config';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { isAbortError } from '../utils/errorUtils';
import { convertV8HelpLinkToUrl } from '../utils/v8helpUtils';

interface PageContentProps {
  filename: string | undefined;
  pageName?: string; // htmlPath страницы
  structure?: FileStructure | null;
  onPageSelect: (htmlPath: string) => void;
  books?: BookInfo[]; // Список всех доступных книг
  currentLocale?: string; // Локаль текущей книги
}

export function PageContent({ 
  filename, 
  pageName, 
  structure, 
  onPageSelect,
  books = [],
  currentLocale = 'ru',
}: PageContentProps) {
  const navigate = useNavigate();
  const [content, setContent] = useState<FileContent | null>(null);
  const [displayContent, setDisplayContent] = useState<FileContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [showLoadingIndicator, setShowLoadingIndicator] = useState(false);
  const { error, handleError, clearError } = useErrorHandler();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const loadingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previousPageNameRef = useRef<string | undefined>(undefined);
  const transitionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const contentContainerRef = useRef<HTMLElement | null>(null);
  const cleanupClickHandlerRef = useRef<(() => void) | null>(null);

  const loadContent = useCallback(async () => {
    if (!filename || !pageName) return;

    // Отменяем предыдущий запрос, если он существует
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Очищаем предыдущие таймеры при новой загрузке
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = null;
    }

    // Создаем новый AbortController
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    // Определяем, это первая загрузка или переход между страницами
    const isFirstLoad = !displayContent;

    try {
      setLoading(true);
      clearError();
      const fileContent = await apiClient.getFileContent(filename, pageName, abortController.signal);
      
      // Проверяем, не был ли запрос отменен
      if (!abortController.signal.aborted) {
        setContent(fileContent);
        
        // При первой загрузке устанавливаем displayContent сразу, без задержки
        if (isFirstLoad) {
          setDisplayContent(fileContent);
          setIsTransitioning(false);
        } else {
          // При переходе между страницами используем плавную смену с задержкой
          transitionTimeoutRef.current = setTimeout(() => {
            if (!abortController.signal.aborted) {
              setDisplayContent(fileContent);
              setIsTransitioning(false);
              transitionTimeoutRef.current = null;
            }
          }, TRANSITION_DURATION_MS);
        }
      }
    } catch (err) {
      // Игнорируем ошибки отмены запросов
      if (!isAbortError(err) && !abortController.signal.aborted) {
        handleError(err);
        setContent(null);
        setDisplayContent(null);
        setIsTransitioning(false);
      }
    } finally {
      if (!abortController.signal.aborted) {
        setLoading(false);
      }
    }
  }, [filename, pageName, handleError, clearError, displayContent]);

  useEffect(() => {
    if (filename && pageName) {
      // Если это новая страница, начинаем загрузку
      if (previousPageNameRef.current !== pageName) {
        const wasFirstLoad = previousPageNameRef.current === undefined;
        previousPageNameRef.current = pageName;
        
        // Устанавливаем isTransitioning только если это не первая загрузка
        // При первой загрузке не нужно показывать анимацию перехода
        if (!wasFirstLoad) {
          setIsTransitioning(true);
        }
        
        clearError();
        // Отменяем предыдущий запрос при смене страницы
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        loadContent();
      }
    } else {
      // Очищаем все таймеры при размонтировании или отсутствии параметров
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
        transitionTimeoutRef.current = null;
      }
      // Отменяем запрос
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      setContent(null);
      setDisplayContent(null);
      clearError();
      setIsTransitioning(false);
      previousPageNameRef.current = undefined;
    }
  }, [filename, pageName, loadContent, clearError]);

  useEffect(() => {
    // Показываем индикатор загрузки только после небольшой задержки
    if (loading) {
      loadingTimeoutRef.current = setTimeout(() => {
        setShowLoadingIndicator(true);
      }, LOADING_INDICATOR_DELAY_MS);
    } else {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
      setShowLoadingIndicator(false);
    }

    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
    };
  }, [loading]);

  // Инициализация displayContent при первой загрузке (fallback)
  // Основная логика уже обрабатывается в loadContent, но это на случай, 
  // если что-то пойдет не так
  useEffect(() => {
    if (content && !displayContent) {
      // Устанавливаем displayContent при первой загрузке без задержки
      setDisplayContent(content);
      setIsTransitioning(false);
    }
  }, [content, displayContent]);

  // Очистка таймеров и отмена запросов при размонтировании
  useEffect(() => {
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
      // Отменяем запрос при размонтировании компонента
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Обработчик кликов по ссылкам v8help://
  useEffect(() => {
    if (!displayContent) {
      // Очищаем предыдущий обработчик если контента нет
      if (cleanupClickHandlerRef.current) {
        cleanupClickHandlerRef.current();
        cleanupClickHandlerRef.current = null;
      }
      return;
    }
    
    // Очищаем предыдущий обработчик если он был
    if (cleanupClickHandlerRef.current) {
      cleanupClickHandlerRef.current();
      cleanupClickHandlerRef.current = null;
    }
    
    const handleClick = (event: MouseEvent) => {
      const container = contentContainerRef.current;
      if (!container) {
        return;
      }
      
      // Проверяем, что клик произошел внутри контейнера контента
      const target = event.target as HTMLElement;
      if (!container.contains(target)) {
        return;
      }
      
      const link = target.closest('a');
      if (!link) {
        return;
      }
      
      const href = link.getAttribute('href');
      if (!href) {
        return;
      }
      
      console.log('Клик по ссылке:', href);
      
      // Проверяем, является ли ссылка v8help://
      if (href.startsWith('v8help://')) {
        event.preventDefault();
        event.stopPropagation();
        
        console.log('Обработка v8help:// ссылки:', href, 'books:', books.length, 'locale:', currentLocale);
        
        // Преобразуем ссылку в URL приложения
        const url = convertV8HelpLinkToUrl(href, books, currentLocale);
        if (url) {
          console.log('Переход по URL:', url);
          navigate(url);
        } else {
          console.warn('Не удалось найти книгу для ссылки:', href);
        }
      }
    };
    
    // Используем requestAnimationFrame чтобы убедиться, что ref установлен после рендера
    const rafId = requestAnimationFrame(() => {
      const container = contentContainerRef.current;
      if (!container) {
        console.warn('contentContainerRef не установлен после рендера');
        return;
      }
      
      console.log('Установка обработчика кликов, контейнер:', container);
      // Используем capture phase для перехвата события раньше
      container.addEventListener('click', handleClick, true);
      
      // Сохраняем функцию очистки
      cleanupClickHandlerRef.current = () => {
        container.removeEventListener('click', handleClick, true);
        console.log('Обработчик кликов удален');
      };
    });
    
    return () => {
      cancelAnimationFrame(rafId);
      // Очищаем обработчик при размонтировании или изменении зависимостей
      if (cleanupClickHandlerRef.current) {
        cleanupClickHandlerRef.current();
        cleanupClickHandlerRef.current = null;
      }
    };
  }, [displayContent, books, currentLocale, navigate]);

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
          <Box
            sx={{
              flexShrink: 0,
              p: 3,
              borderBottom: 1,
              borderColor: 'divider',
              bgcolor: 'background.paper',
            }}
          >
            {structure && pageName && (
              <Breadcrumbs
                pages={structure.pages}
                currentPageName={pageName}
                onPageSelect={onPageSelect}
                filename={filename}
              />
            )}
            {displayContent && (
              <>
                <Typography variant="h4" component="h1" sx={{ mb: 1 }}>
                  {displayContent.pageName}
                </Typography>
                <Chip
                  label={displayContent.filename}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              </>
            )}
          </Box>

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
                <Button variant="contained" onClick={loadContent}>
                  Повторить
                </Button>
              </Box>
            )}

            {displayContent && (
              <Paper
                elevation={0}
                sx={{
                  m: 3,
                  p: 3,
                  maxWidth: 1200,
                  mx: 'auto',
                  bgcolor: 'background.paper',
                  opacity: isTransitioning ? 0.5 : 1,
                  transition: 'opacity 0.2s ease-in-out',
                }}
              >
                <Box
                  ref={contentContainerRef}
                  sx={{
                    '& h1, & h2, & h3, & h4, & h5, & h6': {
                      mt: 3,
                      mb: 2,
                      color: 'text.primary',
                    },
                    '& h1': { fontSize: '1.8rem' },
                    '& h2': { fontSize: '1.5rem' },
                    '& h3': { fontSize: '1.3rem' },
                    '& p': {
                      mb: 2,
                      lineHeight: 1.6,
                    },
                    '& ul, & ol': {
                      ml: 4,
                      mb: 2,
                    },
                    '& li': {
                      mb: 1,
                    },
                    '& code': {
                      bgcolor: 'action.hover',
                      px: 0.5,
                      py: 0.25,
                      borderRadius: 0.5,
                      fontSize: '0.9em',
                      color: 'error.main',
                    },
                    '& pre': {
                      bgcolor: 'action.hover',
                      p: 2,
                      borderRadius: 1,
                      overflowX: 'auto',
                      mb: 2,
                      '& code': {
                        bgcolor: 'transparent',
                        color: 'text.primary',
                      },
                    },
                    '& table': {
                      width: '100%',
                      borderCollapse: 'collapse',
                      mb: 2,
                      '& th, & td': {
                        border: 1,
                        borderColor: 'divider',
                        p: 1,
                        textAlign: 'left',
                      },
                      '& th': {
                        bgcolor: 'action.hover',
                        fontWeight: 600,
                      },
                    },
                    '& a': {
                      color: 'primary.main',
                      textDecoration: 'none',
                      cursor: 'pointer',
                      '&:hover': {
                        textDecoration: 'underline',
                      },
                    },
                    '& img': {
                      maxWidth: '100%',
                      height: 'auto',
                      borderRadius: 1,
                      my: 2,
                    },
                  }}
                  dangerouslySetInnerHTML={{ __html: displayContent.content }}
                />
              </Paper>
            )}
          </Box>
        </>
      )}
    </Box>
  );
}
