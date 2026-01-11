import { Box } from '@mui/material';
import { Sidebar } from '../components/Sidebar';
import { PageContent } from '../components/page/PageContent';
import { FileSelectorPopup } from '../components/FileSelectorPopup';
import { AppHeader } from '../components/AppHeader';
import { useAppStore } from '../store/useAppStore';
import { useFileView } from '../hooks/useFileView';

export function FileViewPage() {
  const isFileSelectorOpen = useAppStore((state) => state.isFileSelectorOpen);
  const setIsFileSelectorOpen = useAppStore((state) => state.setIsFileSelectorOpen);

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
          onFileSelectClick={() => setIsFileSelectorOpen(true)}
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
      <FileSelectorPopup
        isOpen={isFileSelectorOpen}
        onClose={() => setIsFileSelectorOpen(false)}
        onFileSelect={handleFileSelect}
        selectedFile={selectedFile}
      />
    </Box>
  );
}
