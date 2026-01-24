import { memo } from 'react';
import { AppBar, Toolbar, Typography, Box, Chip, IconButton, Tooltip } from '@mui/material';
import { GitHub, Menu } from '@mui/icons-material';
import { useLocation } from 'react-router-dom';
import { useAppInfo } from '@shared/api';
import { SectionTabs } from '../header/SectionTabs';
import { LanguageSelector } from '../header/LanguageSelector';
import { useStore } from '@core/store';
import packageJson from '../../../package.json';

const GITHUB_URL = 'https://github.com/alkoleft/hbk-viewer';
const WEB_VERSION = packageJson.version;

export const AppHeader = memo(function AppHeader() {
  const { data: appInfo, isLoading } = useAppInfo();
  const versionInfo = appInfo?.version;
  const location = useLocation();
  const isAppView = location.pathname !== '/';
  const toggleMobileDrawer = useStore((state) => state.toggleMobileDrawer);

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        bgcolor: 'background.paper',
        color: 'text.primary',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}
    >
      {/* Main Header */}
      <Toolbar 
        sx={{ 
          minHeight: 64,
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          position: 'relative',
        }}
      >
        {isAppView && (
          <IconButton
            color="inherit"
            edge="start"
            onClick={toggleMobileDrawer}
            sx={{ 
              mr: 2,
              display: { xs: 'flex', md: 'none' },
            }}
          >
            <Menu />
          </IconButton>
        )}
        
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            flexShrink: 0, 
            mr: 2,
            fontWeight: 600,
            fontSize: { xs: '1rem', sm: '1.25rem' },
          }}
        >
          <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
            1C:Help Book Viewer
          </Box>
          <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
            HBK Viewer
          </Box>
        </Typography>
        
        <Box sx={{ flex: 1 }} />
        
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          {!isLoading && versionInfo?.platform && (
            <Chip
              label={`1С: ${versionInfo.platform}`}
              size="small"
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.15)',
                color: 'inherit',
                fontWeight: 500,
                height: 28,
                fontSize: '0.75rem',
                display: { xs: 'none', md: 'flex' },
              }}
            />
          )}
          
          {isAppView && <LanguageSelector />}

          <Tooltip title="GitHub репозиторий">
            <IconButton
              color="inherit"
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              size="small"
              sx={{
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              <GitHub fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
        
        {/* Version Info at bottom of main header */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            right: 16,
            display: { xs: 'none', md: 'flex' },
            alignItems: 'center',
            gap: 1,
          }}
        >
          {!isLoading && versionInfo?.application && (
            <Typography
              variant="caption"
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '0.65rem',
              }}
            >
              Backend: v{versionInfo.application}
            </Typography>
          )}
          <Typography
            variant="caption"
            sx={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '0.65rem',
            }}
          >
            Frontend: v{WEB_VERSION}
          </Typography>
        </Box>
      </Toolbar>
      
      {/* Navigation Bar */}
      {isAppView && (
        <Box
          sx={{
            bgcolor: 'background.paper',
            borderBottom: 1,
            borderColor: 'divider',
            minHeight: { xs: 40, md: 48 },
            display: 'flex',
            alignItems: 'center',
            px: 2,
            position: 'relative',
          }}
        >
          <SectionTabs />
        </Box>
      )}
    </AppBar>
  );
});
