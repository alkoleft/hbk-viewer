import { Paper, Typography, Box } from '@mui/material';
import { useFileList } from '../hooks/useFileList';
import { useFileFilter } from '../hooks/useFileFilter';
import { FileListContent } from './FileListContent';
import type { SortType } from '../types/common';

interface FileSelectorProps {
  onFileSelect: (filename: string) => void;
  selectedFile?: string;
}

export function FileSelector({ onFileSelect, selectedFile }: FileSelectorProps) {
  const { files, loading, error, reload } = useFileList();
  const {
    searchQuery,
    setSearchQuery,
    sortType,
    setSortType,
    filteredAndSortedFiles,
  } = useFileFilter(files);

  return (
    <Paper
      elevation={3}
      sx={{
        maxWidth: 800,
        width: '100%',
        p: 4,
      }}
    >
      <Typography variant="h4" component="h2" gutterBottom align="center">
        Выберите HBK файл
      </Typography>
      <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
        Выберите файл документации для просмотра
      </Typography>

      <Box sx={{ maxHeight: 500, overflowY: 'auto' }}>
        <FileListContent
          files={files}
          loading={loading}
          error={error}
          onReload={reload}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortType={sortType}
          onSortChange={setSortType}
          filteredAndSortedFiles={filteredAndSortedFiles}
          selectedFile={selectedFile}
          onFileSelect={onFileSelect}
          emptyMessage="HBK файлы не найдены"
        />
      </Box>
    </Paper>
  );
}
