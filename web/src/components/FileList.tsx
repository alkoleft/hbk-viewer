import { useEffect, useState, useMemo } from 'react';
import {
  Paper,
  Typography,
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
} from '@mui/material';
import { InsertDriveFile } from '@mui/icons-material';
import type { BookInfo } from '../types/api';
import { apiClient } from '../api/client';

interface FileListProps {
  onFileSelect: (filename: string) => void;
  selectedFile?: string;
}

export function FileList({ onFileSelect, selectedFile }: FileListProps) {
  const [files, setFiles] = useState<BookInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadFiles();
  }, []);

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

  const filteredFiles = useMemo(() => {
    if (!searchQuery.trim()) {
      return files;
    }
    const query = searchQuery.toLowerCase();
    return files.filter((file) => {
      const matchesFilename = file.filename.toLowerCase().includes(query);
      const matchesBookName = file.meta?.bookName?.toLowerCase().includes(query) || false;
      const matchesDescription = file.meta?.description?.toLowerCase().includes(query) || false;
      const matchesTags = file.meta?.tags?.some((tag) => tag.toLowerCase().includes(query)) || false;
      return matchesFilename || matchesBookName || matchesDescription || matchesTags;
    });
  }, [files, searchQuery]);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} Б`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} КБ`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} МБ`;
  };

  return (
    <Paper
      elevation={0}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        borderBottom: 2,
        borderColor: 'divider',
        bgcolor: 'background.default',
      }}
    >
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Typography variant="h6" sx={{ mb: 1.5 }}>
          Доступные файлы
        </Typography>
        <TextField
          fullWidth
          size="small"
          placeholder="Поиск файлов..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          variant="outlined"
        />
      </Box>
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          p: 2,
          minHeight: 0,
        }}
      >
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}
        {error && (
          <Box>
            <Alert severity="error" sx={{ mb: 2 }}>
              Ошибка: {error}
            </Alert>
            <Button variant="contained" onClick={loadFiles} fullWidth>
              Повторить
            </Button>
          </Box>
        )}
        {!loading && !error && filteredFiles.length === 0 && (
          <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
            Файлы не найдены
          </Typography>
        )}
        {!loading && !error && filteredFiles.length > 0 && (
          <List>
            {filteredFiles.map((file) => (
              <ListItem key={file.filename} disablePadding>
                <ListItemButton
                  selected={selectedFile === file.filename}
                  onClick={() => onFileSelect(file.filename)}
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
    </Paper>
  );
}
