import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  TextField,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  Collapse,
  Chip,
  IconButton,
  CircularProgress,
} from '@mui/material';
import {
  ExpandMore,
  ChevronRight,
  Folder,
  FolderOpen,
  KeyboardArrowDown,
} from '@mui/icons-material';
import type { PageDto, BookInfo } from '../types/api';
import { apiClient } from '../api/client';
import { SEARCH_DEBOUNCE_MS } from '../constants/config';
import { isAbortError, getErrorMessage } from '../utils/errorUtils';

interface SidebarProps {
  selectedFile?: string;
  selectedBookInfo?: BookInfo | null;
  onFileSelectClick: () => void;
  pages: PageDto[];
  onPageSelect: (htmlPath: string) => void;
  selectedPage?: string; // htmlPath выбранной страницы
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
  const [searchResults, setSearchResults] = useState<PageDto[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const searchAbortControllerRef = useRef<AbortController | null>(null);

  // Debounce для поисковых запросов
  useEffect(() => {
    if (!selectedFile) {
      setSearchResults([]);
      return;
    }

    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      setSearchError(null);
      // Отменяем текущий поиск, если есть
      if (searchAbortControllerRef.current) {
        searchAbortControllerRef.current.abort();
        searchAbortControllerRef.current = null;
      }
      return;
    }

    // Отменяем предыдущий поисковый запрос
    if (searchAbortControllerRef.current) {
      searchAbortControllerRef.current.abort();
    }

    setIsSearching(true);
    setSearchError(null);

    const timeoutId = setTimeout(async () => {
      // Создаем новый AbortController для этого запроса
      const abortController = new AbortController();
      searchAbortControllerRef.current = abortController;

      try {
        const results = await apiClient.searchFileStructure(selectedFile, searchQuery, abortController.signal);
        
        // Проверяем, не был ли запрос отменен
        if (!abortController.signal.aborted) {
          setSearchResults(results);
          setSearchError(null);
        }
      } catch (err) {
        // Игнорируем ошибки отмены запросов
        if (!isAbortError(err) && !abortController.signal.aborted) {
          console.error('Ошибка при поиске:', err);
          setSearchError(getErrorMessage(err));
          setSearchResults([]);
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsSearching(false);
        }
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      clearTimeout(timeoutId);
      // Отменяем запрос при размонтировании или изменении зависимостей
      if (searchAbortControllerRef.current) {
        searchAbortControllerRef.current.abort();
        searchAbortControllerRef.current = null;
      }
    };
  }, [searchQuery, selectedFile]);

  // Определяем, какие страницы показывать: результаты поиска или обычный список
  const displayPages = useMemo(() => {
    if (searchQuery.trim()) {
      return searchResults;
    }
    return pages;
  }, [searchQuery, searchResults, pages]);

  return (
    <Paper
      sx={{
        width: { xs: '100%', md: 320 },
        flexShrink: 0,
        height: { xs: '50vh', md: '100%' },
        maxHeight: { xs: '50vh', md: 'none' },
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        borderRadius: 0,
        borderRight: { xs: 0, md: 1 },
        borderBottom: { xs: 1, md: 0 },
        borderColor: 'divider',
      }}
      elevation={0}
    >
      <Box
        sx={{
          p: 2,
          borderBottom: 1,
          borderColor: 'divider',
          flexShrink: 0,
          bgcolor: 'background.default',
        }}
      >
        {selectedFile ? (
          <Chip
            icon={<Folder />}
            label={selectedBookInfo 
              ? (selectedBookInfo.meta?.bookName 
                ? `${selectedBookInfo.meta.bookName} (${selectedBookInfo.locale})` 
                : `${selectedFile} (${selectedBookInfo.locale})`)
              : selectedFile}
            onClick={onFileSelectClick}
            deleteIcon={<KeyboardArrowDown />}
            onDelete={onFileSelectClick}
            sx={{
              width: '100%',
              justifyContent: 'flex-start',
              height: 'auto',
              py: 1,
              '& .MuiChip-label': {
                display: 'block',
                whiteSpace: 'normal',
                overflow: 'visible',
                textOverflow: 'clip',
              },
            }}
          />
        ) : (
          <Typography variant="body2" color="text.secondary">
            Выберите файл
          </Typography>
        )}
      </Box>

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
          <Box
            sx={{
              p: 2,
              borderBottom: 1,
              borderColor: 'divider',
              flexShrink: 0,
            }}
          >
            <Typography variant="h6" sx={{ mb: 1.5, fontSize: '1.1rem' }}>
              Оглавление
            </Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="Поиск в оглавлении..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              variant="outlined"
              aria-label="Поиск в оглавлении"
              InputProps={{
                endAdornment: isSearching ? (
                  <CircularProgress size={16} sx={{ mr: 1 }} aria-label="Поиск выполняется" />
                ) : null,
              }}
            />
            {searchError && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                {searchError}
              </Typography>
            )}
          </Box>

          <Box
            sx={{
              flex: 1,
              overflowY: 'auto',
              overflowX: 'hidden',
              minHeight: 0,
            }}
          >
            {displayPages.length === 0 && searchQuery && !isSearching ? (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Ничего не найдено
                </Typography>
              </Box>
            ) : displayPages.length === 0 && !searchQuery ? (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Оглавление пусто
                </Typography>
              </Box>
            ) : (
              <List dense component="nav" sx={{ py: 0 }} role="tree" aria-label="Оглавление">
                {displayPages.map((page, index) => (
                  <TreeNode
                    key={page.htmlPath || `page-${index}`}
                    page={page}
                    onPageSelect={onPageSelect}
                    selectedPage={selectedPage}
                    level={0}
                    searchQuery={searchQuery}
                    filename={selectedFile}
                    isSearchResult={searchQuery.trim().length > 0}
                  />
                ))}
              </List>
            )}
          </Box>
        </>
      )}
    </Paper>
  );
}

interface TreeNodeProps {
  page: PageDto;
  onPageSelect: (htmlPath: string) => void;
  selectedPage?: string; // htmlPath выбранной страницы
  level: number;
  searchQuery?: string;
  filename?: string;
  isSearchResult?: boolean; // Флаг, что это результат поиска (не нужно загружать дочерние)
}

function TreeNode({ page, onPageSelect, selectedPage, level, searchQuery, filename, isSearchResult }: TreeNodeProps) {
  // По умолчанию все узлы свернуты, кроме результатов поиска (которые показываем развернутыми)
  const [isExpanded, setIsExpanded] = useState(isSearchResult ?? false);
  // Если это результат поиска, используем children из page, иначе начинаем с пустого списка
  // (так как при оптимизированной загрузке children не приходят с сервера)
  const [loadedChildren, setLoadedChildren] = useState<PageDto[]>(isSearchResult ? page.children : []);
  const [isLoadingChildren, setIsLoadingChildren] = useState(false);
  // Если это результат поиска или уже есть children в page, считаем их загруженными
  // Для обычной загрузки childrenLoaded = false, так как children загружаются лениво
  const [childrenLoaded, setChildrenLoaded] = useState(isSearchResult ? true : page.children.length > 0);
  const childrenAbortControllerRef = useRef<AbortController | null>(null);
  
  // Определяем наличие дочерних элементов
  // Для оптимизированной загрузки page.children всегда пустой, поэтому полагаемся на флаг hasChildren
  // Если hasChildren не установлен, проверяем page.children (для обратной совместимости и результатов поиска)
  // Важно: hasChildren должен быть true для всех групп, содержащих дочерние элементы (и группы, и страницы)
  const hasChildren = page.hasChildren === true || (page.hasChildren === undefined && page.children.length > 0);
  const pageTitle = page.title.ru || page.title.en;
  const isSelected = selectedPage === page.htmlPath;

  // Загружаем дочерние элементы при раскрытии узла (только если не результат поиска)
  const loadChildren = useCallback(async () => {
    if (!filename || !hasChildren || childrenLoaded || isLoadingChildren || isSearchResult) {
      return;
    }

    if (!page.htmlPath) {
      console.warn('Не указан htmlPath для загрузки дочерних элементов');
      setChildrenLoaded(true);
      return;
    }

    // Отменяем предыдущий запрос, если он существует
    if (childrenAbortControllerRef.current) {
      childrenAbortControllerRef.current.abort();
    }

    // Создаем новый AbortController
    const abortController = new AbortController();
    childrenAbortControllerRef.current = abortController;

    setIsLoadingChildren(true);
    try {
      const children = await apiClient.getFileStructureChildren(filename, page.htmlPath, abortController.signal);
      
      // Проверяем, не был ли запрос отменен
      if (!abortController.signal.aborted) {
        setLoadedChildren(children);
        setChildrenLoaded(true);
        // Если загружен пустой список, но hasChildren был true, это может быть ошибка
        if (children.length === 0 && hasChildren) {
          console.warn(`Загружен пустой список дочерних элементов для ${page.htmlPath}, хотя hasChildren=true`);
        }
      }
    } catch (error) {
      // Игнорируем ошибки отмены запросов
      if (!isAbortError(error) && !abortController.signal.aborted) {
        console.error('Ошибка при загрузке дочерних элементов:', error);
        // В случае ошибки оставляем пустой список, но помечаем как загруженное,
        // чтобы не пытаться загружать снова
        setLoadedChildren([]);
        setChildrenLoaded(true);
      }
    } finally {
      if (!abortController.signal.aborted) {
        setIsLoadingChildren(false);
      }
    }
  }, [filename, page.htmlPath, hasChildren, childrenLoaded, isLoadingChildren, isSearchResult]);

  // Отменяем запрос при размонтировании компонента
  useEffect(() => {
    return () => {
      if (childrenAbortControllerRef.current) {
        childrenAbortControllerRef.current.abort();
      }
    };
  }, []);

  // Для результатов поиска children уже загружены с сервера, дополнительная загрузка не нужна
  // Для обычных узлов children загружаются только при раскрытии через handleToggle

  const handleClick = () => {
    onPageSelect(page.htmlPath);
  };

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    
    // Загружаем дочерние элементы при первом раскрытии
    if (newExpanded && !childrenLoaded && hasChildren) {
      await loadChildren();
    }
  };

  return (
    <>
      <ListItemButton
        selected={isSelected}
        onClick={handleClick}
        aria-selected={isSelected}
        aria-expanded={hasChildren ? isExpanded : undefined}
        aria-level={level + 1}
        role="treeitem"
        sx={{
          pl: 2 + level * 2,
          py: 0.5,
          borderLeft: level > 0 ? 1 : 0,
          borderColor: 'divider',
          position: 'relative',
          '&.Mui-selected': {
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            '&:hover': {
              bgcolor: 'primary.dark',
            },
          },
          '&:hover': {
            borderLeftColor: 'primary.light',
          },
        }}
      >
        {hasChildren && (
          <IconButton
            size="small"
            onClick={handleToggle}
            disabled={isLoadingChildren}
            aria-label={isExpanded ? 'Свернуть раздел' : 'Развернуть раздел'}
            aria-expanded={isExpanded}
            sx={{
              mr: 0.5,
              p: 0.5,
              color: 'inherit',
            }}
          >
            {isLoadingChildren ? (
              <CircularProgress size={16} aria-label="Загрузка дочерних элементов" />
            ) : isExpanded ? (
              <ExpandMore fontSize="small" />
            ) : (
              <ChevronRight fontSize="small" />
            )}
          </IconButton>
        )}
        {!hasChildren && <Box sx={{ width: 24 }} />}
        {hasChildren && (
          <Box
            sx={{
              mr: 0.75,
              display: 'flex',
              alignItems: 'center',
              color: 'text.secondary',
            }}
          >
            {isExpanded ? (
              <FolderOpen fontSize="small" />
            ) : (
              <Folder fontSize="small" />
            )}
          </Box>
        )}
        <ListItemText
          primary={pageTitle}
          primaryTypographyProps={{
            variant: 'body2',
            noWrap: true,
          }}
        />
      </ListItemButton>
      {hasChildren && (
        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
          <List component="div" disablePadding dense>
            {isLoadingChildren ? (
              <Box sx={{ pl: 4, py: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={16} />
                <Typography variant="caption" color="text.secondary">
                  Загрузка...
                </Typography>
              </Box>
            ) : (
              loadedChildren.map((child, index) => (
                <TreeNode
                  key={child.htmlPath || index}
                  page={child}
                  onPageSelect={onPageSelect}
                  selectedPage={selectedPage}
                  level={level + 1}
                  searchQuery={searchQuery}
                  filename={filename}
                  isSearchResult={isSearchResult}
                />
              ))
            )}
          </List>
        </Collapse>
      )}
    </>
  );
}
