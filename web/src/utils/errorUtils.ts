/**
 * Утилиты для обработки ошибок
 */

/**
 * Проверяет, является ли ошибка ошибкой отмены запроса
 * @param error - ошибка для проверки
 * @returns true, если ошибка связана с отменой запроса
 */
export function isAbortError(error: unknown): boolean {
  if (error instanceof Error) {
    return error.name === 'AbortError' || error.message.includes('aborted');
  }
  if (error instanceof DOMException) {
    return error.name === 'AbortError';
  }
  return false;
}

/**
 * Проверяет, является ли ошибка сетевой ошибкой
 * @param error - ошибка для проверки
 * @returns true, если ошибка связана с сетью
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError) {
    return error.message.includes('fetch') || error.message.includes('network');
  }
  return false;
}

/**
 * Получает понятное сообщение об ошибке для пользователя
 * @param error - ошибка
 * @returns понятное сообщение об ошибке
 */
export function getErrorMessage(error: unknown): string {
  if (isAbortError(error)) {
    return 'Запрос был отменен';
  }
  
  if (isNetworkError(error)) {
    return 'Ошибка сети. Проверьте подключение к интернету.';
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'Неизвестная ошибка';
}
