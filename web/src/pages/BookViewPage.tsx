import { Box } from '@mui/material';
import { Sidebar } from '../components/Sidebar';
import { PageContent } from '../components/page/PageContent';
import { BookSelectorPopup } from '../components/book/BookSelectorPopup';
import { AppHeader } from '../components/layout/AppHeader';
import { useAppStore } from '../store/useAppStore';
import { useFileView } from '../hooks/useFileView';

export function BookViewPage() {
  const isBookSelectorOpen = useAppStore((state) => state.isBookSelectorOpen);
  const setIsBookSelectorOpen = useAppStore((state) => state.setIsBookSelectorOpen);

  const {
    selectedFile,
    selectedPage,
    allBooks,
    selectedBookInfo,
    currentLocale,
    structure,
    loadingStructure,
    errorStructure,
    refetchStructure,
    handleFileSelect,
    handlePageSelect,
  } = useFileView();

  if (!selectedFile) {
    return null;
  }

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
          display: 'flex',
          flex: 1,
          mt: '64px',
          overflow: 'hidden',
          minHeight: 0,
          flexDirection: { xs: 'column', md: 'row' },
        }}
      >
        <Sidebar
          selectedFile={selectedFile}
          selectedBookInfo={selectedBookInfo}
          onFileSelectClick={() => setIsBookSelectorOpen(true)}
          pages={structure?.pages || []}
          onPageSelect={handlePageSelect}
          selectedPage={selectedPage}
          loading={loadingStructure}
          error={errorStructure}
          onRetry={() => refetchStructure()}
        />
        <PageContent
          filename={selectedFile}
          pageName={selectedPage}
          structure={structure}
          onPageSelect={handlePageSelect}
          books={allBooks}
          currentLocale={currentLocale}
        />
      </Box>
      <BookSelectorPopup
        isOpen={isBookSelectorOpen}
        onClose={() => setIsBookSelectorOpen(false)}
        onBookSelect={handleFileSelect}
        selectedBook={selectedFile}
      />
    </Box>
  );
}
