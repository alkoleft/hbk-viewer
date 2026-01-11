import { Box, TextField, Typography, CircularProgress } from '@mui/material';

interface SidebarSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isSearching: boolean;
  searchError: string | null;
}

export function SidebarSearch({
  searchQuery,
  onSearchChange,
  isSearching,
  searchError,
}: SidebarSearchProps) {
  return (
    <Box
      sx={{
        p: 2,
        borderBottom: 1,
        borderColor: 'divider',
        flexShrink: 0,
      }}
    >
      <Typography variant="h6" sx={{ mb: 1.5, fontSize: '1.1rem' }}>
        Оглавление
      </Typography>
      <TextField
        fullWidth
        size="small"
        placeholder="Поиск в оглавлении..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        variant="outlined"
        aria-label="Поиск в оглавлении"
        InputProps={{
          endAdornment: isSearching ? (
            <CircularProgress size={16} sx={{ mr: 1 }} aria-label="Поиск выполняется" />
          ) : null,
        }}
      />
      {searchError && (
        <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
          {searchError}
        </Typography>
      )}
    </Box>
  );
}
