import { useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { useFileList } from '../hooks/useFileList';
import { useFileFilter } from '../hooks/useFileFilter';
import { FileListContent } from './FileListContent';
import type { SortType } from '../types/common';

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
  const { files, loading, error, reload } = useFileList();
  const {
    searchQuery,
    setSearchQuery,
    sortType,
    setSortType,
    filteredAndSortedFiles,
  } = useFileFilter(files);

  useEffect(() => {
    if (isOpen && files.length === 0) {
      reload();
    }
  }, [isOpen, files.length, reload]);

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
      aria-labelledby="file-selector-dialog-title"
    >
      <DialogTitle id="file-selector-dialog-title">
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">Выберите HBK файл</Typography>
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
          onFileSelect={handleFileSelect}
          showEmptyState={false}
        />
      </DialogContent>
    </Dialog>
  );
}
