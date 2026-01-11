import { useState } from 'react';
import {
  Box,
  ListItemButton,
  ListItemText,
  Collapse,
  IconButton,
  CircularProgress,
  Typography,
  List,
} from '@mui/material';
import {
  ExpandMore,
  ChevronRight,
  Folder,
  FolderOpen,
  ArticleOutlined,
} from '@mui/icons-material';
import type { PageDto } from '../../types/api';
import { useBookStructureChildren } from '../../api/queries';

interface TreeNodeProps {
  page: PageDto;
  onPageSelect: (htmlPath: string) => void;
  selectedPage?: string;
  level: number;
  searchQuery?: string;
  filename?: string;
  isSearchResult?: boolean;
}

export function TreeNode({
  page,
  onPageSelect,
  selectedPage,
  level,
  searchQuery,
  filename,
  isSearchResult,
}: TreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(isSearchResult ?? false);
  
  // Определяем наличие дочерних элементов
  const hasChildren = page.hasChildren === true || (page.hasChildren === undefined && page.children.length > 0);
  const hasChildrenFromInitialLoad = page.children && page.children.length > 0;
  const hasNoHtmlPath = !page.htmlPath || page.htmlPath.trim() === '';
  const shouldLoadChildren = hasChildren && !isSearchResult && !hasChildrenFromInitialLoad && !hasNoHtmlPath;
  
  // Используем React Query для загрузки дочерних элементов
  const {
    data: loadedChildren = [],
    isLoading: isLoadingChildren,
  } = useBookStructureChildren(
    filename,
    page.htmlPath,
    page.path,
    isExpanded && shouldLoadChildren
  );
  
  // Используем загруженные children или children из page
  const children = isExpanded && loadedChildren.length > 0 
    ? loadedChildren 
    : (page.children || []);
  
  const pageTitle = page.title.ru || page.title.en;
  const isSelected = selectedPage === page.htmlPath;

  const handleClick = () => {
    if (page.htmlPath) {
      onPageSelect(page.htmlPath);
    }
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
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
          display: 'flex',
          alignItems: 'center',
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
        <Box
          sx={{
            width: 32,
            minWidth: 32,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mr: 0.5,
          }}
        >
          {hasChildren ? (
            <IconButton
              size="small"
              onClick={handleToggle}
              disabled={isLoadingChildren}
              aria-label={isExpanded ? 'Свернуть раздел' : 'Развернуть раздел'}
              aria-expanded={isExpanded}
              sx={{
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
          ) : null}
        </Box>
        {hasChildren ? (
          <Box
            sx={{
              width: 20,
              minWidth: 20,
              flexShrink: 0,
              mr: 0.75,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'text.secondary',
            }}
          >
            {isExpanded ? (
              <FolderOpen fontSize="small" />
            ) : (
              <Folder fontSize="small" />
            )}
          </Box>
        ) : (
          <Box
            sx={{
              width: 20,
              minWidth: 20,
              flexShrink: 0,
              mr: 0.75,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'text.secondary',
            }}
          >
            <ArticleOutlined fontSize="small" />
          </Box>
        )}
        <ListItemText
          primary={pageTitle}
          primaryTypographyProps={{
            variant: 'body2',
            noWrap: true,
            sx: {
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            },
          }}
          sx={{
            minWidth: 0,
            flex: 1,
            overflow: 'hidden',
            '& .MuiListItemText-primary': {
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            },
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
              children.map((child, index) => {
                const uniqueKey = child.path && child.path.length > 0 
                  ? `path-${child.path.join(',')}` 
                  : (child.htmlPath || `child-${index}`);
                
                return (
                  <TreeNode
                    key={uniqueKey}
                    page={child}
                    onPageSelect={onPageSelect}
                    selectedPage={selectedPage}
                    level={level + 1}
                    searchQuery={searchQuery}
                    filename={filename}
                    isSearchResult={isSearchResult}
                  />
                );
              })
            )}
          </List>
        </Collapse>
      )}
    </>
  );
}
