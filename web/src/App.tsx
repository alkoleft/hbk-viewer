import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { Box } from '@mui/material';
import { FileSelector } from './components/FileSelector';
import { FileSelectorPopup } from './components/FileSelectorPopup';
import { Sidebar } from './components/Sidebar';
import { PageContent } from './components/PageContent';
import { AppHeader } from './components/AppHeader';
import type { FileStructure } from './types/api';
import { apiClient } from './api/client';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/:hbkFile/*" element={<FileViewPage />} />
    </Routes>
  );
}

function HomePage() {
  const navigate = useNavigate();
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const handleFileSelect = (filename: string) => {
    navigate(`/${encodeURIComponent(filename)}`);
    setIsPopupOpen(false);
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
        <FileSelector onFileSelect={handleFileSelect} selectedFile={undefined} />
      </Box>
      <FileSelectorPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        onFileSelect={handleFileSelect}
        selectedFile={undefined}
      />
    </Box>
  );
}

function FileViewPage() {
  const { hbkFile, '*': htmlpagePath } = useParams<{ hbkFile?: string; '*'?: string }>();
  const navigate = useNavigate();
  const [structure, setStructure] = useState<FileStructure | null>(null);
  const [loadingStructure, setLoadingStructure] = useState(false);
  const [errorStructure, setErrorStructure] = useState<string | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const selectedFile = hbkFile ? decodeURIComponent(hbkFile) : undefined;
  // htmlpagePath может содержать путь с несколькими сегментами
  // React Router v6 автоматически декодирует параметры, но decodeURIComponent не повредит
  const selectedPage = htmlpagePath && htmlpagePath.trim() !== '' 
    ? decodeURIComponent(htmlpagePath) 
    : undefined;

  useEffect(() => {
    if (selectedFile) {
      loadStructure();
    } else {
      setStructure(null);
    }
  }, [selectedFile]);

  useEffect(() => {
    if (selectedFile && structure && !selectedPage) {
      // Если файл выбран, но страница не указана, выбираем первую страницу
      if (structure.pages.length > 0) {
        const firstPage = structure.pages[0];
        const encodedPath = encodeURIComponent(firstPage.htmlPath);
        navigate(`/${encodeURIComponent(selectedFile)}/${encodedPath}`, { replace: true });
      }
    }
  }, [selectedFile, structure, selectedPage, navigate]);

  const loadStructure = async () => {
    if (!selectedFile) return;

    try {
      setLoadingStructure(true);
      setErrorStructure(null);
      // Загружаем только корневые элементы для оптимизации (includeChildren=false по умолчанию)
      const fileStructure = await apiClient.getFileStructure(selectedFile, false);
      setStructure(fileStructure);
    } catch (err) {
      setErrorStructure(err instanceof Error ? err.message : 'Неизвестная ошибка');
      setStructure(null);
    } finally {
      setLoadingStructure(false);
    }
  };

  const handleFileSelect = (filename: string) => {
    navigate(`/${encodeURIComponent(filename)}`);
    setIsPopupOpen(false);
  };

  const handlePageSelect = (htmlPath: string) => {
    if (selectedFile) {
      // Кодируем htmlPath для использования в URL
      // Если путь содержит /, он будет закодирован как %2F
      const encodedPath = encodeURIComponent(htmlPath);
      navigate(`/${encodeURIComponent(selectedFile)}/${encodedPath}`);
    }
  };

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
          onFileSelectClick={() => setIsPopupOpen(true)}
          pages={structure?.pages || []}
          onPageSelect={handlePageSelect}
          selectedPage={selectedPage}
          loading={loadingStructure}
          error={errorStructure}
          onRetry={loadStructure}
        />
        <PageContent
          filename={selectedFile}
          pageName={selectedPage}
          structure={structure}
          onPageSelect={handlePageSelect}
        />
      </Box>
      <FileSelectorPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        onFileSelect={handleFileSelect}
        selectedFile={selectedFile}
      />
    </Box>
  );
}

export default App;
