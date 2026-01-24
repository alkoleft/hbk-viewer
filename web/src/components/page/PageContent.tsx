import { Box, Typography, IconButton, Tooltip } from '@mui/material';
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

  if (error) {
    return (
      <Box p={3}>
        <Typography color="error">
          Ошибка загрузки содержимого: {error.message}
        </Typography>
      </Box>
    );
  }

  if (!selectedPagePath && !isLoading) {
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
        flex: 1,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        maxWidth: isFullWidth ? 'none' : '1200px',
        width: '100%',
        margin: isFullWidth ? 0 : '0 auto',
        transition: 'max-width 0.3s ease, margin 0.3s ease',
        bgcolor: 'background.paper',
        position: 'relative',
        pt: 0,
        px: { xs: 1, md: 2 },
        pb: { xs: 1, md: 2 }
      }}
    >
      <Tooltip title={isFullWidth ? "Обычная ширина" : "На всю ширину"}>
        <IconButton 
          onClick={toggleFullWidth} 
          size="small"
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            zIndex: 10,
            bgcolor: 'background.paper',
            boxShadow: 1,
            display: { xs: 'none', md: 'flex' },
            '&:hover': {
              bgcolor: 'action.hover'
            }
          }}
        >
          {isFullWidth ? <AspectRatio /> : <Fullscreen />}
        </IconButton>
      </Tooltip>

      <Box 
        sx={{ 
          flex: 1,
          overflow: 'auto',
          p: { xs: 1.5, md: 3 },
          opacity: isLoading ? 0.5 : 1,
          transition: 'opacity 0.2s ease',
          '& img': {
            maxWidth: '100%',
            height: 'auto'
          },
          '& table': {
            maxWidth: '100%',
            width: 'auto !important',
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
