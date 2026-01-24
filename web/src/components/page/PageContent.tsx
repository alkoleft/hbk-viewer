import { Box, Typography, CircularProgress, IconButton, Tooltip } from '@mui/material';
import { AspectRatio, Fullscreen } from '@mui/icons-material';
import { useSectionNavigation } from '@features/navigation/hooks';
import { useContentNavigation } from '@features/content/hooks';
import { useState } from 'react';

export function PageContent() {
  const { section, locale, sectionPages } = useSectionNavigation();
  const { selectedPagePath, pageContent, isLoading, error, handleLinkClick } = useContentNavigation(
    locale,
    section,
    sectionPages
  );
  const [isFullWidth, setIsFullWidth] = useState(false);

  const toggleFullWidth = () => {
    setIsFullWidth(!isFullWidth);
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Typography color="error">
          Ошибка загрузки содержимого: {error.message}
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
        onClick={handleLinkClick}
        dangerouslySetInnerHTML={{ __html: pageContent || '' }}
      />
    </Box>
  );
}
