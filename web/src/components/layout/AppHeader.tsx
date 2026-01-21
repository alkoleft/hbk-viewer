import { memo } from 'react';
import { AppBar, Toolbar, Typography, Box, Chip, IconButton, Tooltip } from '@mui/material';
import { GitHub } from '@mui/icons-material';
import { useLocation } from 'react-router-dom';
import { useVersion } from '../../api/queries';
import { SectionTabs } from '../header/SectionTabs';
import { LanguageSelector } from '../header/LanguageSelector';
import packageJson from '../../../package.json';

const GITHUB_URL = 'https://github.com/alkoleft/hbk-viewer';
const WEB_VERSION = packageJson.version;

export const AppHeader = memo(function AppHeader() {
  const { data: versionInfo, isLoading } = useVersion();
  const location = useLocation();
  const isAppView = location.pathname !== '/';

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
        }}
      >
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            flexShrink: 0, 
            mr: 2,
            fontWeight: 600,
          }}
        >
          1C:Help Book Viewer
        </Typography>
        
        <Box sx={{ flex: 1 }} />
        
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          {isAppView && <LanguageSelector />}
          
          {!isLoading && versionInfo && versionInfo.platformVersion && (
            <Chip
              label={`1С: ${versionInfo.platformVersion}`}
              size="small"
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.15)',
                color: 'inherit',
                fontWeight: 500,
                height: 28,
                fontSize: '0.75rem',
                display: { xs: 'none', sm: 'flex' },
              }}
            />
          )}
          
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
      </Toolbar>
      
      {/* Navigation Bar */}
      {isAppView && (
        <Box
          sx={{
            bgcolor: 'background.paper',
            borderBottom: 1,
            borderColor: 'divider',
            minHeight: 48,
            display: 'flex',
            alignItems: 'center',
            px: 2,
          }}
        >
          <SectionTabs />
        </Box>
      )}
      
      {/* Version Info for Home Page */}
      {!isAppView && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 4,
            right: 16,
            display: { xs: 'none', sm: 'flex' },
            alignItems: 'center',
            gap: 0.5,
          }}
        >
          {!isLoading && versionInfo && versionInfo.applicationVersion && (
            <Typography
              variant="caption"
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '0.65rem',
              }}
            >
             Backend: v{versionInfo.applicationVersion}
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
      )}
    </AppBar>
  );
});
