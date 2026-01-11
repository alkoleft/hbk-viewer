import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { useBooks } from '../../api/queries';
import { useFileFilter } from '../../hooks/useFileFilter';
import { BookListContent } from './BookListContent';

interface BookSelectorPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onBookSelect: (filename: string) => void;
  selectedBook?: string;
}

export function BookSelectorPopup({
  isOpen,
  onClose,
  onBookSelect,
  selectedBook,
}: BookSelectorPopupProps) {
  const { data: files = [], isLoading: loading, error, refetch: reload } = useBooks();
  const {
    searchQuery,
    setSearchQuery,
    sortType,
    setSortType,
    filteredAndSortedFiles,
  } = useFileFilter(files);

  const handleBookSelect = (filename: string) => {
    onBookSelect(filename);
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
      aria-labelledby="book-selector-dialog-title"
    >
      <DialogTitle id="book-selector-dialog-title">
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">Выберите HBK книгу</Typography>
          <IconButton onClick={onClose} size="small" aria-label="Закрыть диалог">
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
          onFileSelect={handleBookSelect}
          showEmptyState={false}
        />
      </DialogContent>
    </Dialog>
  );
}
