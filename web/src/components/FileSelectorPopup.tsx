import { useEffect, useState, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
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
import { Close, InsertDriveFile } from '@mui/icons-material';
import type { BookInfo } from '../types/api';
import { apiClient } from '../api/client';

type SortType = 'name-asc' | 'name-desc' | 'size-asc' | 'size-desc';

interface FileSelectorPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onFileSelect: (filename: string) => void;
  selectedFile?: string;
}

export function FileSelectorPopup({
  isOpen,
  onClose,
  onFileSelect,
  selectedFile,
}: FileSelectorPopupProps) {
  const [files, setFiles] = useState<BookInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortType, setSortType] = useState<SortType>('name-asc');

  useEffect(() => {
    if (isOpen) {
      loadFiles();
    }
  }, [isOpen]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      const fileList = await apiClient.getFiles();
      setFiles(fileList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedFiles = useMemo(() => {
    const query = searchQuery.toLowerCase();
    let result = files.filter((file) => {
      const matchesFilename = file.filename.toLowerCase().includes(query);
      const matchesBookName = file.meta?.bookName?.toLowerCase().includes(query) || false;
      const matchesDescription = file.meta?.description?.toLowerCase().includes(query) || false;
      const matchesTags = file.meta?.tags?.some((tag) => tag.toLowerCase().includes(query)) || false;
      return matchesFilename || matchesBookName || matchesDescription || matchesTags;
    });

    // Сортировка
    result = [...result].sort((a, b) => {
      switch (sortType) {
        case 'name-asc':
          return a.filename.localeCompare(b.filename, 'ru');
        case 'name-desc':
          return b.filename.localeCompare(a.filename, 'ru');
        case 'size-asc':
          return a.size - b.size;
        case 'size-desc':
          return b.size - a.size;
        default:
          return 0;
      }
    });

    return result;
  }, [files, searchQuery, sortType]);

  const handleSortChange = (event: SelectChangeEvent<SortType>) => {
    setSortType(event.target.value as SortType);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} Б`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} КБ`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} МБ`;
  };

  const handleFileSelect = (filename: string) => {
    onFileSelect(filename);
    onClose();
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">Выберите HBK файл</Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent
        dividers
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
        }}
      >
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Box sx={{ my: 2 }}>
            <Alert severity="error" sx={{ mb: 2 }}>
              Ошибка: {error}
            </Alert>
            <Button variant="contained" onClick={loadFiles} fullWidth>
              Повторить
            </Button>
          </Box>
        )}

        {!loading && !error && (
          <>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                fullWidth
                placeholder="Поиск файлов..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                variant="outlined"
              />
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Сортировка</InputLabel>
                <Select
                  value={sortType}
                  label="Сортировка"
                  onChange={handleSortChange}
                >
                  <MenuItem value="name-asc">По имени (А-Я)</MenuItem>
                  <MenuItem value="name-desc">По имени (Я-А)</MenuItem>
                  <MenuItem value="size-asc">По размеру (↑)</MenuItem>
                  <MenuItem value="size-desc">По размеру (↓)</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box
              sx={{
                flex: 1,
                overflowY: 'auto',
                minHeight: 0,
              }}
            >
              {filteredAndSortedFiles.length === 0 ? (
                <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
                  Файлы не найдены
                </Typography>
              ) : (
                <List>
                  {filteredAndSortedFiles.map((file) => (
                    <ListItem key={file.filename} disablePadding>
                      <ListItemButton
                        selected={selectedFile === file.filename}
                        onClick={() => handleFileSelect(file.filename)}
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
                        <InsertDriveFile sx={{ mr: 2 }} />
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                {file.meta?.bookName || file.filename}
                              </Typography>
                              <Chip
                                label={file.locale}
                                size="small"
                                variant="outlined"
                                color="primary"
                                sx={{
                                  height: 20,
                                  fontSize: '0.7rem',
                                }}
                              />
                              <Typography variant="caption" color="text.secondary">
                                {file.filename}
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                              {file.meta?.description && (
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', width: '100%', mb: 0.5 }}>
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
                              />
                              {file.meta?.tags && file.meta.tags.map((tag, index) => (
                                <Chip
                                  key={index}
                                  label={tag}
                                  size="small"
                                  variant="outlined"
                                  sx={{
                                    height: 20,
                                    fontSize: '0.7rem',
                                  }}
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
        )}
      </DialogContent>
    </Dialog>
  );
}
