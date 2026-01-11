import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { BookSelector } from '../components/book/BookSelector';
import { BookSelectorPopup } from '../components/book/BookSelectorPopup';
import { AppHeader } from '../components/layout/AppHeader';
import { useAppStore } from '../store/useAppStore';
import { buildPageUrl } from '../utils/urlUtils';

export function HomePage() {
  const navigate = useNavigate();
  const isBookSelectorOpen = useAppStore((state) => state.isBookSelectorOpen);
  const setIsBookSelectorOpen = useAppStore((state) => state.setIsBookSelectorOpen);

  const handleBookSelect = (filename: string) => {
    navigate(buildPageUrl(filename));
    setIsBookSelectorOpen(false);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      <AppHeader />
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
          p: { xs: 2, md: 0 },
          mt: '64px',
        }}
      >
        <BookSelector onBookSelect={handleBookSelect} selectedBook={undefined} />
      </Box>
      <BookSelectorPopup
        isOpen={isBookSelectorOpen}
        onClose={() => setIsBookSelectorOpen(false)}
        onBookSelect={handleBookSelect}
        selectedBook={undefined}
      />
    </Box>
  );
}
