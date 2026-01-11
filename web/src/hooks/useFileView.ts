import { useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useBooks, useBookStructure } from '../api/queries';
import { decodeFileName, buildPageUrl } from '../utils/urlUtils';
import { extractErrorMessage } from '../utils/errorUtils';

/**
 * Хук для логики страницы просмотра файла
 */
export function useFileView() {
  const { hbkFile, '*': htmlpagePath } = useParams<{ hbkFile?: string; '*'?: string }>();
  const navigate = useNavigate();

  const selectedFile = hbkFile ? decodeFileName(hbkFile) : undefined;
  const selectedPage = htmlpagePath && htmlpagePath.trim() !== '' 
    ? decodeFileName(htmlpagePath) 
    : undefined;

  // Загружаем список всех книг
  const { data: allBooks = [] } = useBooks();
  
  // Находим информацию о выбранной книге
  const selectedBookInfo = allBooks.find((file) => file.filename === selectedFile) || null;
  
  // Определяем локаль текущей книги
  const currentLocale = selectedBookInfo?.locale || 'ru';

  // Загружаем структуру файла
  const {
    data: structure,
    isLoading: loadingStructure,
    error: structureError,
    refetch: refetchStructure,
  } = useBookStructure(selectedFile, 1);
  
  const errorStructure = structureError 
    ? extractErrorMessage(structureError, 'Ошибка загрузки структуры')
    : null;

  // Автоматический выбор первой страницы
  useEffect(() => {
    if (selectedFile && structure && !selectedPage) {
      const findFirstPageWithHtmlPath = (pages: typeof structure.pages): string | null => {
        for (const page of pages) {
          if (page.htmlPath && page.htmlPath.trim() !== '') {
            return page.htmlPath;
          }
          if (page.children && page.children.length > 0) {
            const found = findFirstPageWithHtmlPath(page.children);
            if (found) {
              return found;
            }
          }
        }
        return null;
      };

      const firstValidHtmlPath = findFirstPageWithHtmlPath(structure.pages);
      if (firstValidHtmlPath) {
        navigate(buildPageUrl(selectedFile, firstValidHtmlPath), { replace: true });
      }
    }
  }, [selectedFile, structure, selectedPage, navigate]);

  const handleFileSelect = useCallback((filename: string) => {
    navigate(buildPageUrl(filename));
  }, [navigate]);

  const handlePageSelect = useCallback((htmlPath: string) => {
    if (selectedFile) {
      navigate(buildPageUrl(selectedFile, htmlPath));
    }
  }, [selectedFile, navigate]);

  return {
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
  };
}
