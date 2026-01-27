import { useState, useEffect } from 'react';
import { 
  TextField, 
  InputAdornment, 
  IconButton, 
  Box,
  Autocomplete,
  Paper,
  Typography,
  CircularProgress,
  Chip,
  Skeleton,
  Fade
} from '@mui/material';
import { Search, Clear } from '@mui/icons-material';
import { useSearchContent, useResolvePageLocation } from '@shared/api';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface ModernSearchProps {
  locale: string;
}

const SkeletonResult = () => (
  <Box sx={{ p: 3 }}>
    <Skeleton variant="text" width="60%" height={24} />
    <Skeleton variant="text" width="40%" height={16} sx={{ mt: 1 }} />
    <Skeleton variant="text" width="80%" height={16} sx={{ mt: 1 }} />
  </Box>
);

export function ModernSearch({ locale }: ModernSearchProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const navigate = useNavigate();

  const { data: searchResults, isLoading } = useSearchContent(
    query,
    locale,
    10,
    query.trim().length > 2
  );

  // Открываем dropdown когда приходят новые результаты
  useEffect(() => {
    if (searchResults && searchResults.results.length > 0 && query.trim().length > 2) {
      setOpen(true);
    }
  }, [searchResults, query]);

  const { data: resolveResult } = useResolvePageLocation(
    selectedLocation,
    locale,
    !!selectedLocation
  );

  useEffect(() => {
    if (resolveResult) {
      navigate(`/${locale}/${encodeURIComponent(resolveResult.sectionTitle)}?page=${encodeURIComponent(resolveResult.pageLocation)}`);
      setSelectedLocation('');
      setOpen(false);
    }
  }, [resolveResult, locale, navigate]);

  const handleResultSelect = (location: string) => {
    setSelectedLocation(location);
  };

  const handleSearch = () => {
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}&locale=${locale}`);
    }
  };

  return (
    <Box sx={{ minWidth: { xs: 350, sm: 450 }, maxWidth: { xs: 500, sm: 700 } }}>
      <Autocomplete
        freeSolo
        open={open && query.trim().length > 2 && ((searchResults?.results?.length || 0) > 0 || isLoading)}
        onOpen={() => setOpen(true)}
        onClose={(_, reason) => {
          if (reason !== 'selectOption') {
            setOpen(false);
          }
        }}
        inputValue={query}
        onInputChange={(_, newValue) => setQuery(newValue)}
        onChange={(_, value) => {
          if (value && typeof value !== 'string') {
            if (value.location === '__show_all__') {
              handleSearch();
            } else {
              handleResultSelect(value.location);
            }
            setOpen(false);
          }
        }}
        options={[...(searchResults?.results || []), ...(searchResults?.totalHits && searchResults.totalHits > 10 ? [{ 
          title: `Показать все ${searchResults.totalHits} результатов`, 
          location: '__show_all__',
          bookName: '',
          highlights: [],
          score: 0
        }] : [])]}
        filterOptions={(x) => x}
        getOptionLabel={(option) => 
          typeof option === 'string' ? option : option.title
        }
        renderOption={(props, option, { index }) => {
          if (option.location === '__show_all__') {
            return (
              <motion.div
                key="show-all"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Box
                  component="li"
                  {...props}
                  onClick={handleSearch}
                  sx={{ 
                    cursor: 'pointer',
                    backgroundColor: 'action.selected',
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    '&:hover': { 
                      backgroundColor: 'action.focus',
                      transform: 'translateX(4px)',
                      transition: 'all 0.2s ease'
                    }
                  }}
                >
                  <Box sx={{ py: 1.5, px: 2, textAlign: 'center' }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 600,
                        color: 'primary.main'
                      }}
                    >
                      {option.title}
                    </Typography>
                  </Box>
                </Box>
              </motion.div>
            );
          }
          
          return (
            <motion.div
              key={`${option.location}-${index}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Box
                component="li"
                {...props}
                onClick={() => handleResultSelect(option.location)}
                sx={{ 
                  cursor: 'pointer',
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  '&:last-child': { borderBottom: 'none' },
                  '&:hover': { 
                    backgroundColor: 'action.hover',
                    transform: 'translateX(4px)',
                    transition: 'all 0.2s ease'
                  }
                }}
              >
                <Box sx={{ py: 2, px: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 1 }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography 
                        variant="subtitle1" 
                        component="div"
                        sx={{ 
                          fontWeight: 600,
                          color: 'primary.main',
                          mb: 0.5,
                          lineHeight: 1.3,
                          wordBreak: 'break-word'
                        }}
                      >
                        {option.title}
                      </Typography>
                      
                      {option.breadcrumbs && option.breadcrumbs.length > 1 && (
                        <Box sx={{ mb: 1 }}>
                          <Typography
                            variant="caption"
                            sx={{ 
                              fontSize: '0.75rem',
                              color: 'text.secondary',
                              fontStyle: 'italic',
                              display: 'block',
                              wordBreak: 'break-word',
                              lineHeight: 1.2
                            }}
                          >
                            {option.breadcrumbs.slice(0, -1).join(' › ')}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                    
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <Chip 
                        label={option.bookName} 
                        size="small" 
                        variant="outlined"
                        color="primary"
                        sx={{ 
                          fontSize: '0.7rem',
                          height: 24
                        }}
                      />
                    </motion.div>
                  </Box>
                  
                  {option.highlights.length > 0 && (
                    <Box sx={{ mt: 1 }}>
                      {option.highlights.slice(0, 2).map((highlight, idx) => (
                        <Typography
                          key={idx}
                          variant="body2"
                          color="text.secondary"
                          sx={{ 
                            fontSize: '0.85rem',
                            lineHeight: 1.4,
                            mb: idx < 1 ? 0.75 : 0,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            '& mark': { 
                              backgroundColor: 'warning.light',
                              color: 'warning.contrastText',
                              padding: '2px 4px',
                              borderRadius: '3px',
                              fontWeight: 500,
                              animation: 'pulse 2s infinite'
                            }
                          }}
                          dangerouslySetInnerHTML={{ __html: highlight }}
                        />
                      ))}
                    </Box>
                  )}
                </Box>
              </Box>
            </motion.div>
          );
        }}
        PaperComponent={(props) => (
          <Paper 
            {...props} 
            sx={{ 
              mt: 1, 
              maxHeight: '90vh',
              width: 'auto',
              minWidth: { xs: '100%', sm: '600px' },
              maxWidth: '95vw',
              borderRadius: 2,
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              backdropFilter: 'blur(8px)',
              overflowX: 'hidden',
              '& .MuiAutocomplete-listbox': {
                maxHeight: 'calc(90vh - 100px)',
                overflowX: 'hidden',
                '&::-webkit-scrollbar': {
                  width: 8,
                },
                '&::-webkit-scrollbar-track': {
                  background: 'rgba(0,0,0,0.1)',
                  borderRadius: 4,
                },
                '&::-webkit-scrollbar-thumb': {
                  background: 'rgba(0,0,0,0.3)',
                  borderRadius: 4,
                },
              }
            }} 
          >
              {searchResults && searchResults.results.length > 0 && (
                <Fade in={true}>
                  <Box sx={{ 
                    px: 2, 
                    py: 1, 
                    backgroundColor: 'action.hover',
                    borderBottom: '1px solid',
                    borderColor: 'divider'
                  }}>
                    <Typography variant="caption" color="text.secondary">
                      Найдено {searchResults.totalHits} результатов за {searchResults.searchTime}мс
                    </Typography>
                  </Box>
                </Fade>
              )}
              {isLoading ? (
                <Box>
                  {[...Array(3)].map((_, i) => (
                    <SkeletonResult key={i} />
                  ))}
                </Box>
              ) : (
                props.children
              )}
            </Paper>
        )}
        renderInput={(params) => (
          <motion.div
            whileFocus={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <TextField
              {...params}
              placeholder="Поиск по документации..."
              size="small"
              variant="outlined"
              onFocus={() => setOpen(true)}
              onBlur={() => setOpen(false)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'inherit',
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  paddingRight: '8px',
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    transition: 'border-color 0.3s ease',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.7)',
                    boxShadow: '0 0 0 2px rgba(255, 255, 255, 0.1)',
                  },
                },
                '& .MuiInputBase-input::placeholder': {
                  color: 'rgba(255, 255, 255, 0.7)',
                  opacity: 1,
                },
              }}
              InputProps={{
                ...params.InputProps,
                startAdornment: (
                  <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 0.5 }}>
                    <motion.div
                      animate={{ rotate: isLoading ? 360 : 0 }}
                      transition={{ duration: 1, repeat: isLoading ? Infinity : 0, ease: "linear" }}
                    >
                      <Search sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 20 }} />
                    </motion.div>
                  </InputAdornment>
                ),
                endAdornment: (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <AnimatePresence>
                      {isLoading && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0 }}
                        >
                          <CircularProgress size={16} sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                        </motion.div>
                      )}
                      {query && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0 }}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <IconButton
                            size="small"
                            onClick={() => setQuery('')}
                            sx={{ 
                              color: 'rgba(255, 255, 255, 0.7)',
                              '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.1)'
                              }
                            }}
                          >
                            <Clear fontSize="small" />
                          </IconButton>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Box>
                ),
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                } else if (e.key === 'Escape') {
                  setOpen(false);
                  setQuery('');
                }
              }}
            />
          </motion.div>
        )}
      />
    </Box>
  );
}
