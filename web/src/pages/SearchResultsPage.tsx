import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Paper, 
  Chip,
  Alert,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  Skeleton
} from '@mui/material';
import { ArrowBack, FilterList, Search } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchContent, useResolvePageLocation } from '@shared/api';

const SkeletonSearchResult = () => (
  <Paper elevation={1} sx={{ p: 4, mb: 3 }}>
    <Skeleton variant="text" width="70%" height={32} />
    <Skeleton variant="text" width="40%" height={20} sx={{ mt: 1 }} />
    <Skeleton variant="text" width="90%" height={16} sx={{ mt: 2 }} />
    <Skeleton variant="text" width="80%" height={16} sx={{ mt: 1 }} />
  </Paper>
);

export function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  const locale = searchParams.get('locale') || 'ru';
  const [selectedLocation, setSelectedLocation] = React.useState<string>('');
  const [sortBy, setSortBy] = React.useState<'relevance' | 'title'>('relevance');
  const [filterBook, setFilterBook] = React.useState<string>('');

  const { data: searchResponse, isLoading, error } = useSearchContent(
    query,
    locale,
    50,
    query.trim().length > 0
  );

  const { data: resolveResult } = useResolvePageLocation(
    selectedLocation,
    locale,
    !!selectedLocation
  );

  React.useEffect(() => {
    if (resolveResult) {
      navigate(`/${locale}/${encodeURIComponent(resolveResult.sectionTitle)}?page=${encodeURIComponent(resolveResult.pageLocation)}`);
    }
  }, [resolveResult, locale, navigate]);

  const handleResultClick = (location: string) => {
    setSelectedLocation(location);
  };

  // Filter and sort results
  const processedResults = React.useMemo(() => {
    if (!searchResponse?.results) return [];
    
    let filtered = searchResponse.results;
    
    if (filterBook) {
      filtered = filtered.filter(result => 
        result.bookName.toLowerCase().includes(filterBook.toLowerCase())
      );
    }
    
    return filtered.sort((a, b) => {
      if (sortBy === 'relevance') {
        return b.score - a.score;
      } else {
        return a.title.localeCompare(b.title);
      }
    });
  }, [searchResponse?.results, filterBook, sortBy]);

  const uniqueBooks = React.useMemo(() => {
    if (!searchResponse?.results) return [];
    return [...new Set(searchResponse.results.map(r => r.bookName))];
  }, [searchResponse?.results]);

  if (!query.trim()) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Поиск по документации
        </Typography>
        <Typography color="text.secondary">
          Введите поисковый запрос для поиска по документации.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <IconButton 
              onClick={() => navigate(-1)}
              sx={{ 
                backgroundColor: 'action.hover',
                '&:hover': { backgroundColor: 'action.selected' }
              }}
            >
              <ArrowBack />
            </IconButton>
          </motion.div>
          <Typography variant="h5">
            Результаты поиска
          </Typography>
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Запрос: <strong>"{query}"</strong>
          {searchResponse && (
            <> • Найдено: {searchResponse.totalHits} результатов за {searchResponse.searchTime}мс</>
          )}
        </Typography>

        {/* Filters and Sorting */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Paper sx={{ p: 2, mb: 3, backgroundColor: 'grey.50' }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <FilterList sx={{ color: 'text.secondary' }} />
              
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Сортировка</InputLabel>
                <Select
                  value={sortBy}
                  label="Сортировка"
                  onChange={(e) => setSortBy(e.target.value as any)}
                >
                  <MenuItem value="relevance">По релевантности</MenuItem>
                  <MenuItem value="title">По названию</MenuItem>
                </Select>
              </FormControl>

              <TextField
                size="small"
                placeholder="Фильтр по книге"
                value={filterBook}
                onChange={(e) => setFilterBook(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                sx={{ minWidth: 200 }}
              />

              {uniqueBooks.length > 0 && (
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {uniqueBooks.slice(0, 3).map((book) => (
                    <motion.div
                      key={book}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Chip
                        label={book}
                        size="small"
                        variant={filterBook === book ? "filled" : "outlined"}
                        onClick={() => setFilterBook(filterBook === book ? '' : book)}
                        sx={{ cursor: 'pointer' }}
                      />
                    </motion.div>
                  ))}
                </Box>
              )}
            </Box>
          </Paper>
        </motion.div>

        {isLoading && (
          <Box>
            {[...Array(3)].map((_, i) => (
              <SkeletonSearchResult key={i} />
            ))}
          </Box>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Alert severity="error" sx={{ mb: 3 }}>
              Ошибка поиска: {error.message}
            </Alert>
          </motion.div>
        )}

        {searchResponse && processedResults.length === 0 && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                Ничего не найдено
              </Typography>
              <Typography color="text.secondary">
                Попробуйте изменить поисковый запрос или фильтры.
              </Typography>
            </Paper>
          </motion.div>
        )}

        <AnimatePresence>
          {processedResults.map((result, index) => (
            <motion.div
              key={`${result.location}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -2 }}
            >
              <Paper 
                elevation={1}
                sx={{ 
                  p: 4,
                  mb: 3,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  border: '1px solid',
                  borderColor: 'divider',
                  '&:hover': { 
                    elevation: 4,
                    borderColor: 'primary.main',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
                  }
                }}
                onClick={() => handleResultClick(result.location)}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3, mb: 2 }}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography 
                      variant="h6" 
                      component="h3"
                      sx={{ 
                        color: 'primary.main',
                        fontWeight: 600,
                        mb: 1,
                        lineHeight: 1.3,
                        '&:hover': { textDecoration: 'underline' }
                      }}
                    >
                      {result.title}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5, flexWrap: 'wrap' }}>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                      >
                        <Chip 
                          label={result.bookName} 
                          size="medium" 
                          color="primary"
                          variant="outlined"
                          sx={{ fontSize: '0.8rem' }}
                        />
                      </motion.div>
                      <Typography variant="body2" color="text.secondary">
                        Релевантность: {Math.round(result.score * 100)}%
                      </Typography>
                    </Box>
                    
                    {result.breadcrumbs && result.breadcrumbs.length > 1 && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ 
                          mb: 2,
                          fontSize: '0.9rem',
                          fontStyle: 'italic',
                          opacity: 0.8
                        }}
                      >
                        {result.breadcrumbs.slice(0, -1).join(' › ')}
                      </Typography>
                    )}
                  </Box>
                </Box>
                
                <Box>
                  {result.highlights.map((highlight, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 + idx * 0.05 }}
                    >
                      <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{ 
                          mb: idx < result.highlights.length - 1 ? 2 : 0,
                          lineHeight: 1.6,
                          fontSize: '0.95rem',
                          '& mark': { 
                            backgroundColor: 'warning.light',
                            color: 'warning.contrastText',
                            padding: '3px 6px',
                            borderRadius: '4px',
                            fontWeight: 600,
                            animation: 'pulse 2s infinite'
                          }
                        }}
                        dangerouslySetInnerHTML={{ __html: highlight }}
                      />
                    </motion.div>
                  ))}
                </Box>
              </Paper>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </Box>
  );
}

export default SearchResultsPage;
