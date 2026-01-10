/**
 * Утилиты для работы со ссылками v8help://
 */

import type { BookInfo } from '../types/api';
import { buildPageUrl } from './urlUtils';

/**
 * Парсит v8help:// ссылку
 * @param link - ссылка вида v8help://bookName/htmlPath
 * @returns объект с bookName и htmlPath или null, если ссылка невалидна
 */
export function parseV8HelpLink(link: string): { bookName: string; htmlPath: string } | null {
  const v8helpRegex = /^v8help:\/\/([^/]+)\/(.+)$/;
  const match = link.match(v8helpRegex);
  
  if (!match) {
    return null;
  }
  
  return {
    bookName: match[1],
    htmlPath: match[2],
  };
}

/**
 * Извлекает bookName из имени файла
 * Формат файла: [bookName]_[locale].hbk
 * @param filename - имя файла
 * @returns bookName или null, если не удалось извлечь
 */
export function extractBookNameFromFilename(filename: string): string | null {
  // Убираем расширение .hbk
  const nameWithoutExt = filename.replace(/\.hbk$/, '');
  
  // Разделяем по последнему подчеркиванию (bookName_locale)
  const lastUnderscoreIndex = nameWithoutExt.lastIndexOf('_');
  if (lastUnderscoreIndex === -1) {
    return null;
  }
  
  return nameWithoutExt.substring(0, lastUnderscoreIndex);
}

/**
 * Получает bookName из BookInfo, используя meta.bookName если доступно, иначе извлекает из filename
 * @param book - информация о книге
 * @returns bookName или null
 */
function getBookName(book: BookInfo): string | null {
  // Сначала пытаемся использовать meta.bookName, если он есть
  if (book.meta?.bookName) {
    return book.meta.bookName;
  }
  
  // Иначе извлекаем из имени файла
  return extractBookNameFromFilename(book.filename);
}

/**
 * Находит файл с указанным bookName и локалью
 * @param books - список доступных книг
 * @param targetBookName - имя книги для поиска
 * @param currentLocale - локаль текущей книги
 * @returns BookInfo найденной книги или null
 */
export function findBookByNameAndLocale(
  books: BookInfo[],
  targetBookName: string,
  currentLocale: string
): BookInfo | null {
  // Сначала пытаемся найти книгу с точно такой же локалью
  const exactMatch = books.find((book) => {
    const bookName = getBookName(book);
    return bookName === targetBookName && book.locale === currentLocale;
  });
  
  if (exactMatch) {
    return exactMatch;
  }
  
  // Если не нашли, ищем любую книгу с таким bookName
  const anyMatch = books.find((book) => {
    const bookName = getBookName(book);
    return bookName === targetBookName;
  });
  
  return anyMatch || null;
}

/**
 * Преобразует v8help:// ссылку в URL приложения
 * @param v8helpLink - ссылка вида v8help://bookName/htmlPath
 * @param books - список доступных книг
 * @param currentLocale - локаль текущей книги
 * @returns URL строку или null, если не удалось преобразовать
 */
export function convertV8HelpLinkToUrl(
  v8helpLink: string,
  books: BookInfo[],
  currentLocale: string
): string | null {
  const parsed = parseV8HelpLink(v8helpLink);
  if (!parsed) {
    return null;
  }
  
  const targetBook = findBookByNameAndLocale(books, parsed.bookName, currentLocale);
  if (!targetBook) {
    return null;
  }
  
  // htmlPath должен начинаться с /
  const htmlPath = parsed.htmlPath.startsWith('/') 
    ? parsed.htmlPath 
    : `/${parsed.htmlPath}`;
  
  // Используем buildPageUrl для консистентного построения URL
  return buildPageUrl(targetBook.filename, htmlPath);
}