import React from 'react';
import { 
  Box, 
  LinearProgress, 
  Typography, 
  Chip, 
  Collapse,
  Alert,
  IconButton
} from '@mui/material';
import { ExpandMore, CheckCircle, Error, Sync } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useIndexingStatus } from '../../shared/api';

export function IndexingStatusIndicator() {
  const [expanded, setExpanded] = React.useState(false);
  const { data: indexingStatus } = useIndexingStatus();

  if (!indexingStatus?.isIndexingInProgress && indexingStatus?.overallProgress === 100) {
    return null; // Hide when indexing is complete
  }

  const getStateIcon = (state: string): React.ReactElement | undefined => {
    switch (state) {
      case 'COMPLETED':
        return <CheckCircle sx={{ color: 'success.main', fontSize: 16 }} />;
      case 'FAILED':
        return <Error sx={{ color: 'error.main', fontSize: 16 }} />;
      case 'IN_PROGRESS':
        return (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Sync sx={{ color: 'info.main', fontSize: 16 }} />
          </motion.div>
        );
      default:
        return undefined;
    }
  };

  const getStateColor = (state: string): 'success' | 'error' | 'info' | 'default' => {
    switch (state) {
      case 'COMPLETED': return 'success';
      case 'FAILED': return 'error';
      case 'IN_PROGRESS': return 'info';
      default: return 'default';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <Alert 
          severity={indexingStatus?.isIndexingInProgress ? "info" : "success"}
          sx={{ 
            mb: 2,
            borderRadius: 2,
            '& .MuiAlert-message': { width: '100%' }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                {indexingStatus?.isIndexingInProgress 
                  ? 'Индексация документации...' 
                  : 'Индексация завершена'
                }
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={indexingStatus?.overallProgress || 0}
                  sx={{ 
                    flex: 1, 
                    height: 8, 
                    borderRadius: 4,
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 4,
                    }
                  }}
                />
                <Typography variant="caption" sx={{ minWidth: 40, textAlign: 'right' }}>
                  {indexingStatus?.overallProgress || 0}%
                </Typography>
              </Box>

              <Collapse in={expanded}>
                <Box sx={{ mt: 2 }}>
                  {indexingStatus?.locales.map((locale) => (
                    <motion.div
                      key={locale.locale}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 2, 
                        mb: 1,
                        p: 1,
                        borderRadius: 1,
                        backgroundColor: 'rgba(0,0,0,0.05)'
                      }}>
                        <Chip 
                          label={locale.locale.toUpperCase()} 
                          size="small" 
                          color={getStateColor(locale.state)}
                          icon={getStateIcon(locale.state)}
                          sx={{ minWidth: 80 }}
                        />
                        
                        <Box sx={{ flex: 1 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={locale.progress}
                            sx={{ 
                              height: 6, 
                              borderRadius: 3,
                              backgroundColor: 'rgba(0,0,0,0.1)'
                            }}
                          />
                        </Box>
                        
                        <Typography variant="caption" sx={{ minWidth: 60, textAlign: 'right' }}>
                          {locale.indexedDocuments}/{locale.totalDocuments}
                        </Typography>
                      </Box>
                      
                      {locale.errorMessage && (
                        <Typography variant="caption" color="error" sx={{ ml: 2, display: 'block' }}>
                          {locale.errorMessage}
                        </Typography>
                      )}
                    </motion.div>
                  ))}
                </Box>
              </Collapse>
            </Box>

            <IconButton 
              size="small" 
              onClick={() => setExpanded(!expanded)}
              sx={{ ml: 1 }}
            >
              <motion.div
                animate={{ rotate: expanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ExpandMore />
              </motion.div>
            </IconButton>
          </Box>
        </Alert>
      </motion.div>
    </AnimatePresence>
  );
}
