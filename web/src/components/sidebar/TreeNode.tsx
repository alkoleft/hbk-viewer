import { useEffect, useRef, memo, useCallback } from 'react';
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
import type { PageDto } from '@shared/types';
import { useGlobalTocSection } from '@shared/api';
import { useTreeNavigation } from '@features/navigation/hooks';
import { 
  hasPageChildren, 
  shouldLoadPageChildren, 
  getPageTitle,
  createNodeId 
} from '@features/navigation/services/tree-utils.service';

interface TreeNodeProps {
  page: PageDto;
  onPageSelect: (pagePath: string) => void;
  selectedPage?: string;
  level: number;
  searchQuery?: string;
  filename?: string;
  isSearchResult?: boolean;
  locale?: string;
  isGlobalToc?: boolean;
}

function TreeNodeComponent({
  page,
  onPageSelect,
  selectedPage,
  level,
  searchQuery,
  filename,
  isSearchResult,
  locale,
  isGlobalToc,
}: TreeNodeProps) {
  const { isNodeExpanded, toggleNode } = useTreeNavigation();
  const nodeId = createNodeId(page, level);
  const isExpanded = isNodeExpanded(nodeId) || (isSearchResult ?? false);
  const nodeRef = useRef<HTMLDivElement>(null);
  
  const hasChildren = hasPageChildren(page);
  const shouldLoad = shouldLoadPageChildren(page, isSearchResult ?? false);
  
  const {
    data: loadedChildren = [],
    isLoading: isLoadingChildren,
  } = useGlobalTocSection(
    locale || 'ru',
    page.pagePath,
    undefined,
    isExpanded && shouldLoad
  );
  
  const children = isExpanded && loadedChildren.length > 0 
    ? loadedChildren 
    : page.children || [];
  
  const pageTitle = getPageTitle(page);
  const isSelected = selectedPage === page.pagePath;

  useEffect(() => {
    if (isSelected && nodeRef.current) {
      const element = nodeRef.current;
      const rect = element.getBoundingClientRect();
      const isVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;
      
      if (!isVisible) {
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center'
        });
      }
    }
  }, [isSelected]);

  const handleClick = useCallback(() => {
    if (page.pagePath) {
      onPageSelect(page.pagePath);
    }
  }, [page.pagePath, onPageSelect]);

  const handleToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    toggleNode(nodeId);
  }, [nodeId, toggleNode]);

  return (
    <>
      <ListItemButton
        ref={nodeRef}
        selected={isSelected}
        onClick={handleClick}
        disableRipple
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
          transition: 'background-color 0.15s ease, color 0.15s ease',
          '&:active': {
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
          },
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
                  : (child.pagePath || `child-${index}`);
                
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
                    locale={locale}
                    isGlobalToc={isGlobalToc}
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

export const TreeNode = memo(TreeNodeComponent, (prev, next) => {
  return (
    prev.page.pagePath === next.page.pagePath &&
    prev.selectedPage === next.selectedPage &&
    prev.level === next.level &&
    prev.searchQuery === next.searchQuery &&
    prev.isSearchResult === next.isSearchResult
  );
});
