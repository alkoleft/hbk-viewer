import { Box, Chip, Typography } from '@mui/material';
import { KeyboardArrowDown, AutoStories } from '@mui/icons-material';
import type { BookInfo } from '../../types/api';

interface SidebarHeaderProps {
  selectedFile?: string;
  selectedBookInfo?: BookInfo | null;
  onFileSelectClick: () => void;
}

export function SidebarHeader({
  selectedFile,
  selectedBookInfo,
  onFileSelectClick,
}: SidebarHeaderProps) {
  return (
    <Box
      sx={{
        p: 2,
        borderBottom: 1,
        borderColor: 'divider',
        flexShrink: 0,
        bgcolor: 'background.default',
      }}
    >
      {selectedFile ? (
        <Chip
          icon={<AutoStories />}
          label={selectedBookInfo 
            ? (selectedBookInfo.meta?.bookName 
              ? `${selectedBookInfo.meta.bookName} (${selectedBookInfo.locale})` 
              : `${selectedFile} (${selectedBookInfo.locale})`)
            : selectedFile}
          onClick={onFileSelectClick}
          deleteIcon={<KeyboardArrowDown />}
          onDelete={onFileSelectClick}
          sx={{
            width: '100%',
            justifyContent: 'flex-start',
            height: 'auto',
            py: 1,
            '& .MuiChip-label': {
              display: 'block',
              whiteSpace: 'normal',
              overflow: 'visible',
              textOverflow: 'clip',
            },
          }}
        />
      ) : (
        <Typography variant="body2" color="text.secondary">
          Выберите файл
        </Typography>
      )}
    </Box>
  );
}
