import { Box, Typography } from '@mui/material';
import { useSectionNavigation } from '../../hooks/useSectionNavigation';

export function PageContent() {
  const { section, sectionPages } = useSectionNavigation();

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
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          {section || 'Выберите раздел'}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {sectionPages.length > 0 
            ? `В этом разделе ${sectionPages.length} страниц`
            : 'Выберите страницу из бокового меню'
          }
        </Typography>
      </Box>
      
      <Box
        sx={{
          flex: 1,
          p: 3,
          overflow: 'auto',
        }}
      >
        <Typography variant="body1">
          Содержимое страницы будет отображаться здесь после выбора конкретной страницы из навигационного дерева.
        </Typography>
      </Box>
    </Box>
  );
}
