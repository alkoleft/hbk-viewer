import { memo } from 'react';
import { AppBar, Toolbar, Typography, Box, Chip, IconButton, Tooltip } from '@mui/material';
import { GitHub } from '@mui/icons-material';
import { useVersion } from '../../api/queries';
import packageJson from '../../../package.json';

const GITHUB_URL = 'https://github.com/alkoleft/hbk-viewer';
const WEB_VERSION = packageJson.version;

export const AppHeader = memo(function AppHeader() {
  const { data: versionInfo, isLoading } = useVersion();

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
            display: { xs: 'none', sm: 'flex' },
            alignItems: 'center',
            gap: 1,
          }}
        >
          {!isLoading && versionInfo && versionInfo.platformVersion && (
            <Chip
              label={`1С: ${versionInfo.platformVersion}`}
              size="small"
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                fontWeight: 500,
                height: 24,
                fontSize: '0.75rem',
              }}
            />
          )}
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Просмотр документации 1С:Предприятие
          </Typography>
          <Tooltip title="GitHub репозиторий">
            <IconButton
              color="inherit"
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              size="small"
              sx={{
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              <GitHub fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
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
              color: 'rgba(255, 255, 255, 0.5)',
              fontSize: '0.65rem',
              opacity: 0.6,
            }}
          >
           Backend: v{versionInfo.applicationVersion}
          </Typography>
        )}
        <Typography
          variant="caption"
          sx={{
            color: 'rgba(255, 255, 255, 0.5)',
            fontSize: '0.65rem',
            opacity: 0.6,
          }}
        >
          Frontend: v{WEB_VERSION}
        </Typography>
      </Box>
    </AppBar>
  );
});
