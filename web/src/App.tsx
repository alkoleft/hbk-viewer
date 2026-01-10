import { useState, useEffect, useRef, useCallback } from 'react';
import { Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { Box } from '@mui/material';
import { FileSelector } from './components/FileSelector';
import { FileSelectorPopup } from './components/FileSelectorPopup';
import { Sidebar } from './components/Sidebar';
import { PageContent } from './components/PageContent';
import { AppHeader } from './components/AppHeader';
import type { FileStructure, BookInfo } from './types/api';
import { apiClient } from './api/client';
import { decodeFileName, buildPageUrl } from './utils/urlUtils';
import { isAbortError, getErrorMessage } from './utils/errorUtils';

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
    navigate(buildPageUrl(filename));
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
  const [selectedBookInfo, setSelectedBookInfo] = useState<BookInfo | null>(null);
  const [errorBookInfo, setErrorBookInfo] = useState<string | null>(null);
  
  const structureAbortControllerRef = useRef<AbortController | null>(null);
  const bookInfoAbortControllerRef = useRef<AbortController | null>(null);

  const selectedFile = hbkFile ? decodeFileName(hbkFile) : undefined;
  // htmlpagePath может содержать путь с несколькими сегментами
  // React Router v6 автоматически декодирует параметры, но decodeFileName не повредит
  const selectedPage = htmlpagePath && htmlpagePath.trim() !== '' 
    ? decodeFileName(htmlpagePath) 
    : undefined;

  const loadBookInfo = useCallback(async () => {
    if (!selectedFile) return;

    // Отменяем предыдущий запрос, если он существует
    if (bookInfoAbortControllerRef.current) {
      bookInfoAbortControllerRef.current.abort();
    }

    // Создаем новый AbortController
    const abortController = new AbortController();
    bookInfoAbortControllerRef.current = abortController;

    try {
      setErrorBookInfo(null);
      const fileList = await apiClient.getFiles(abortController.signal);
      
      // Проверяем, не был ли запрос отменен
      if (!abortController.signal.aborted) {
        const bookInfo = fileList.find((file) => file.filename === selectedFile);
        setSelectedBookInfo(bookInfo || null);
      }
    } catch (err) {
      // Игнорируем ошибки отмены запросов
      if (!isAbortError(err) && !abortController.signal.aborted) {
        const errorMessage = getErrorMessage(err);
        console.error('Ошибка при загрузке информации о книге:', err);
        setErrorBookInfo(errorMessage);
        setSelectedBookInfo(null);
      }
    }
  }, [selectedFile]);

  const loadStructure = useCallback(async () => {
    if (!selectedFile) return;

    // Отменяем предыдущий запрос, если он существует
    if (structureAbortControllerRef.current) {
      structureAbortControllerRef.current.abort();
    }

    // Создаем новый AbortController
    const abortController = new AbortController();
    structureAbortControllerRef.current = abortController;

    try {
      setLoadingStructure(true);
      setErrorStructure(null);
      // Загружаем только корневые элементы для оптимизации (includeChildren=false по умолчанию)
      const fileStructure = await apiClient.getFileStructure(selectedFile, false, abortController.signal);
      
      // Проверяем, не был ли запрос отменен
      if (!abortController.signal.aborted) {
        setStructure(fileStructure);
      }
    } catch (err) {
      // Игнорируем ошибки отмены запросов
      if (!isAbortError(err) && !abortController.signal.aborted) {
        setErrorStructure(getErrorMessage(err));
        setStructure(null);
      }
    } finally {
      if (!abortController.signal.aborted) {
        setLoadingStructure(false);
      }
    }
  }, [selectedFile]);

  useEffect(() => {
    if (selectedFile) {
      loadBookInfo();
      loadStructure();
    } else {
      // Отменяем запросы при смене файла
      if (structureAbortControllerRef.current) {
        structureAbortControllerRef.current.abort();
      }
      if (bookInfoAbortControllerRef.current) {
        bookInfoAbortControllerRef.current.abort();
      }
      setStructure(null);
      setSelectedBookInfo(null);
      setErrorStructure(null);
      setErrorBookInfo(null);
    }
    
    // Отменяем запросы при размонтировании компонента
    return () => {
      if (structureAbortControllerRef.current) {
        structureAbortControllerRef.current.abort();
      }
      if (bookInfoAbortControllerRef.current) {
        bookInfoAbortControllerRef.current.abort();
      }
    };
  }, [selectedFile, loadBookInfo, loadStructure]);

  useEffect(() => {
    if (selectedFile && structure && !selectedPage) {
      // Если файл выбран, но страница не указана, выбираем первую страницу
      if (structure.pages.length > 0) {
        const firstPage = structure.pages[0];
        navigate(buildPageUrl(selectedFile, firstPage.htmlPath), { replace: true });
      }
    }
  }, [selectedFile, structure, selectedPage, navigate]);

  const handleFileSelect = useCallback((filename: string) => {
    navigate(buildPageUrl(filename));
    setIsPopupOpen(false);
  }, [navigate]);

  const handlePageSelect = useCallback((htmlPath: string) => {
    if (selectedFile) {
      navigate(buildPageUrl(selectedFile, htmlPath));
    }
  }, [selectedFile, navigate]);

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
