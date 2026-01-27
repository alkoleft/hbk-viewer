import React, { useState } from 'react';
import { 
  TextField, 
  InputAdornment, 
  IconButton, 
  Box,
  Autocomplete,
  Paper,
  Typography,
  CircularProgress,

} from '@mui/material';
import { Search, Clear } from '@mui/icons-material';
import { useSearchContent, useResolvePageLocation } from '@shared/api';
import { useNavigate } from 'react-router-dom';

interface GlobalSearchProps {
  locale: string;
}

export function GlobalSearch({ locale }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const navigate = useNavigate();

  // Сохраняем последний поисковый запрос
  React.useEffect(() => {
    if (query.trim()) {
      localStorage.setItem('lastSearchQuery', query);
    }
  }, [query]);

  // Восстанавливаем последний запрос при загрузке
  React.useEffect(() => {
    const lastQuery = localStorage.getItem('lastSearchQuery');
    if (lastQuery) {
      setQuery(lastQuery);
    }
  }, []);

  const { data: searchResults, isLoading } = useSearchContent(
    query,
    locale,
    10,
    query.trim().length > 2
  );

  // Открываем dropdown когда приходят новые результаты
  React.useEffect(() => {
    if (searchResults && searchResults.results.length > 0 && query.trim().length > 2) {
      setOpen(true);
    }
  }, [searchResults, query]);

  const { data: resolveResult } = useResolvePageLocation(
    selectedLocation,
    locale,
    !!selectedLocation
  );

  // Обработка результата resolve
  React.useEffect(() => {
    if (resolveResult) {
      navigate(`/${locale}/${encodeURIComponent(resolveResult.sectionTitle)}?page=${encodeURIComponent(resolveResult.pageLocation)}`);
      setSelectedLocation('');
      // НЕ закрываем окно и НЕ перерисовываем результаты
    }
  }, [resolveResult, locale, navigate]);

  const handleResultSelect = (location: string) => {
    setSelectedLocation(location);
  };

  const handleSearch = () => {
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}&locale=${locale}`);
      // Не закрываем окно, чтобы можно было вернуться к поиску
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
        options={[
          ...(searchResults?.results || []), 
          ...(searchResults?.totalHits && searchResults.totalHits > (searchResults?.results?.length || 0) ? [{ 
            title: `Показать все ${searchResults.totalHits} результатов`, 
            location: '__show_all__',
            bookName: '',
            highlights: [],
            score: 0
          }] : [])
        ]}
        filterOptions={(x) => x}
        getOptionLabel={(option) => typeof option === 'string' ? option : option.title || ''}
        renderOption={(props, option) => (
          <li {...props}>
            <Box sx={{ width: '100%' }}>
              <Typography variant="body2">{option.title}</Typography>
              {option.bookName && (
                <Typography variant="caption" color="text.secondary">
                  {option.bookName}
                </Typography>
              )}
            </Box>
          </li>
        )}
        PaperComponent={(props) => (
          <Paper 
            {...props} 
            sx={{ 
              mt: 1, 
              maxHeight: '90vh',
              width: 'auto',
              minWidth: '600px',
              maxWidth: '95vw',
              '& .MuiAutocomplete-listbox': {
                maxHeight: 'calc(90vh - 100px)'
              }
            }} 
          >
            {searchResults && searchResults.results.length > 0 && (
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
            )}
            {props.children}
          </Paper>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder="Поиск по документации..."
            size="small"
            variant="outlined"
            onFocus={() => setOpen(true)}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: 'inherit',
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.7)',
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
                <InputAdornment position="start">
                  <Search sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                </InputAdornment>
              ),
              endAdornment: (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 1 }}>
                  {isLoading && (
                    <CircularProgress size={16} sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                  )}
                  {query && (
                    <IconButton
                      size="small"
                      onClick={() => setQuery('')}
                      sx={{ 
                        color: 'rgba(255, 255, 255, 0.7)'
                      }}
                    >
                      <Clear fontSize="small" />
                    </IconButton>
                  )}
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
        )}
      />
    </Box>
  );
}
