/**
 * Утилиты для работы с URL и маршрутизацией
 */

/**
 * Кодирует имя файла для использования в URL
 * @param filename - имя файла
 * @returns закодированное имя файла
 */
export function encodeFileName(filename: string): string {
  return encodeURIComponent(filename);
}

/**
 * Декодирует имя файла из URL
 * @param filename - закодированное имя файла
 * @returns декодированное имя файла
 */
export function decodeFileName(filename: string): string {
  return decodeURIComponent(filename);
}

/**
 * Строит URL для страницы
 * @param file - имя файла
 * @param page - путь к странице (htmlPath), опционально
 * @returns URL строку
 */
export function buildPageUrl(file: string, page?: string): string {
  const filePart = encodeFileName(file);
  return page ? `/${filePart}/${encodeFileName(page)}` : `/${filePart}`;
}
