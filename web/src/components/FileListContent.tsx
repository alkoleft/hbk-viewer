import { memo, useCallback } from 'react';
import {
  TextField,
  Box,
  CircularProgress,
  Alert,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Chip,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import type { BookInfo } from '../types/api';
import type { SortType } from '../types/common';
import { formatFileSize } from '../utils/fileUtils';

interface FileListContentProps {
  files: BookInfo[];
  loading: boolean;
  error: string | null;
  onReload: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortType: SortType;
  onSortChange: (sortType: SortType) => void;
  filteredAndSortedFiles: BookInfo[];
  selectedFile?: string;
  onFileSelect: (filename: string) => void;
  emptyMessage?: string;
  notFoundMessage?: string;
  showEmptyState?: boolean;
}

/**
 * Общий компонент для отображения списка файлов с поиском и сортировкой
 */
export const FileListContent = memo(function FileListContent({
  files,
  loading,
  error,
  onReload,
  searchQuery,
  onSearchChange,
  sortType,
  onSortChange,
  filteredAndSortedFiles,
  selectedFile,
  onFileSelect,
  emptyMessage = 'HBK файлы не найдены',
  notFoundMessage = 'Файлы не найдены',
  showEmptyState = true,
}: FileListContentProps) {
  const handleSortChange = useCallback((event: SelectChangeEvent<SortType>) => {
    onSortChange(event.target.value as SortType);
  }, [onSortChange]);

  const handleFileSelect = useCallback((filename: string) => {
    onFileSelect(filename);
  }, [onFileSelect]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  }, [onSearchChange]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ my: 2 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Ошибка: {error}
        </Alert>
        <Button variant="contained" onClick={onReload} fullWidth>
          Повторить
        </Button>
      </Box>
    );
  }

  if (showEmptyState && !loading && !error && files.length === 0) {
    return (
      <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 4 }}>
        {emptyMessage}
      </Typography>
    );
  }

  if (!loading && !error && files.length === 0) {
    return null;
  }

  return (
    <>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          fullWidth
          placeholder="Поиск файлов..."
          value={searchQuery}
          onChange={handleSearchChange}
          variant="outlined"
          aria-label="Поиск файлов"
        />
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Сортировка</InputLabel>
          <Select
            value={sortType}
            label="Сортировка"
            onChange={handleSortChange}
            aria-label="Сортировка файлов"
          >
            <MenuItem value="name-asc">По имени (А-Я)</MenuItem>
            <MenuItem value="name-desc">По имени (Я-А)</MenuItem>
            <MenuItem value="size-asc">По размеру (↑)</MenuItem>
            <MenuItem value="size-desc">По размеру (↓)</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <Box sx={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
        {filteredAndSortedFiles.length === 0 ? (
          <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
            {notFoundMessage}
          </Typography>
        ) : (
          <List role="listbox" aria-label="Список файлов">
            {filteredAndSortedFiles.map((file) => (
              <ListItem key={file.filename} disablePadding>
                <ListItemButton
                  selected={selectedFile === file.filename}
                  onClick={() => handleFileSelect(file.filename)}
                  aria-selected={selectedFile === file.filename}
                  role="option"
                  sx={{
                    borderRadius: 1,
                    mb: 1,
                    '&.Mui-selected': {
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      '&:hover': {
                        bgcolor: 'primary.dark',
                      },
                    },
                  }}
                >
                  <AutoStoriesIcon sx={{ mr: 2 }} aria-hidden="true" />
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {file.meta?.bookName
                            ? `${file.meta.bookName} (${file.locale})`
                            : `${file.filename} (${file.locale})`}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {file.filename}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                        {file.meta?.description && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: 'block', width: '100%', mb: 0.5 }}
                          >
                            {file.meta.description}
                          </Typography>
                        )}
                        <Chip
                          label={formatFileSize(file.size)}
                          size="small"
                          variant="outlined"
                          sx={{
                            height: 20,
                            fontSize: '0.7rem',
                          }}
                          aria-label={`Размер файла: ${formatFileSize(file.size)}`}
                        />
                        {file.meta?.tags &&
                          file.meta.tags.map((tag, index) => (
                            <Chip
                              key={index}
                              label={tag}
                              size="small"
                              variant="outlined"
                              sx={{
                                height: 20,
                                fontSize: '0.7rem',
                              }}
                              aria-label={`Тег: ${tag}`}
                            />
                          ))}
                      </Box>
                    }
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </>
  );
});
