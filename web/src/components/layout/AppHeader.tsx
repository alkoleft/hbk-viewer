import { memo } from 'react';
import { AppBar, Toolbar, Typography, Box } from '@mui/material';

export const AppHeader = memo(function AppHeader() {
  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          1C:Hand Book (HBK) Viewer
        </Typography>
        <Box
          sx={{
            display: { xs: 'none', sm: 'block' },
          }}
        >
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Просмотр документации 1С:Предприятие
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
});
