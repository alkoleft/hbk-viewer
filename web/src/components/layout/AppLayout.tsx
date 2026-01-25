import React from 'react';
import { Box } from '@mui/material';
import { IndexingStatusIndicator } from '../search/IndexingStatusIndicator';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <Box sx={{ position: 'relative' }}>
      {/* Indexing Status - Fixed at top */}
      <Box sx={{ 
        position: 'fixed', 
        top: 112, // Below AppHeader 
        left: 0, 
        right: 0, 
        zIndex: 1200, 
        px: 2 
      }}>
        <IndexingStatusIndicator />
      </Box>
      
      {/* Main Content */}
      <Box sx={{ pt: 2 }}>
        {children}
      </Box>
    </Box>
  );
}
