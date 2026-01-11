import { Paper, Typography, Box } from '@mui/material';
import { useBooks } from '../../api/queries';
import { useFileFilter } from '../../hooks/useFileFilter';
import { BookListContent } from './BookListContent';
import type { SortType } from '../../types/common';

interface BookSelectorProps {
  onBookSelect: (filename: string) => void;
  selectedBook?: string;
}

export function BookSelector({ onBookSelect, selectedBook }: BookSelectorProps) {
  const { data: files = [], isLoading: loading, error, refetch: reload } = useBooks();
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
        Выберите HBK книгу
      </Typography>
      <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
        Выберите книгу документации для просмотра
      </Typography>

      <Box sx={{ maxHeight: 500, overflowY: 'auto' }}>
        <BookListContent
          files={files}
          loading={loading}
          error={error ? (error instanceof Error ? error.message : 'Ошибка загрузки книг') : null}
          onReload={reload}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortType={sortType}
          onSortChange={setSortType}
          filteredAndSortedFiles={filteredAndSortedFiles}
          selectedFile={selectedBook}
          onFileSelect={onBookSelect}
          emptyMessage="HBK книги не найдены"
        />
      </Box>
    </Paper>
  );
}
