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
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import { useFileList } from '../hooks/useFileList';
import { useFileFilter } from '../hooks/useFileFilter';
import { formatFileSize } from '../utils/fileUtils';

interface FileListProps {
  onFileSelect: (filename: string) => void;
  selectedFile?: string;
}

export function FileList({ onFileSelect, selectedFile }: FileListProps) {
  const { files, loading, error, reload } = useFileList();
  const {
    searchQuery,
    setSearchQuery,
    filteredAndSortedFiles,
  } = useFileFilter(files, 'name-asc');

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
            <Button variant="contained" onClick={reload} fullWidth>
              Повторить
            </Button>
          </Box>
        )}
        {!loading && !error && filteredAndSortedFiles.length === 0 && (
          <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
            Файлы не найдены
          </Typography>
        )}
        {!loading && !error && filteredAndSortedFiles.length > 0 && (
          <List>
            {filteredAndSortedFiles.map((file) => (
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
                  <AutoStoriesIcon sx={{ mr: 2 }} />
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
